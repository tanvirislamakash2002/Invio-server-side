import { OrderStatus, Priority, ProductStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { activityService } from "../activity/activity.service";
import { customerService } from "../customer/customer.service";
import { restockService } from "../restock/restock.service";

// Input types
interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  customer: { name: string; email?: string; phone?: string };
  items: OrderItemInput[];
  userId: string;
}

interface GetOrdersParams {
  search: string | undefined;
  status: string | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc" | undefined;
}

interface UpdateOrderInput {
  status?: string;
  items?: OrderItemInput[];
  customer?: { name?: string; email?: string; phone?: string };
}

export const orderService = {
  getAllOrders: async ({
    search,
    status,
    startDate,
    endDate,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  }: GetOrdersParams) => {
    const andConditions: any[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { customer: { email: { contains: search, mode: "insensitive" } } },
          { customer: { phone: { contains: search, mode: "insensitive" } } },
          { orderNumber: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (status) {
      andConditions.push({ status });
    }

    if (startDate || endDate) {
      andConditions.push({
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      });
    }

    const orders = await prisma.order.findMany({
      where: { AND: andConditions },
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder ?? "asc" },
      include: {
        items: { include: { product: { include: { category: true } } } },
        customer: true,
        user: true,
      },
    });

    const total = await prisma.order.count({ where: { AND: andConditions } });

    return {
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  },

  createOrder: async ({ customer, items, userId }: CreateOrderInput) => {
    try {
      // Check for duplicate products
      const productIds = items.map(i => i.productId);
      const hasDuplicates = productIds.length !== new Set(productIds).size;
      if (hasDuplicates) {
        return { error: "This product is already added to the order." };
      }

      // Find or create customer
      const customerRecord = await customerService.findOrCreateCustomer(customer);

      // Validate products and prepare order items
      const orderItems = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          return { error: `Product not found` };
        }

        if (product.status !== ProductStatus.ACTIVE) {
          return { error: `"${product.name}" is currently unavailable.` };
        }

        if (item.quantity > product.stockQuantity) {
          return { error: `Only ${product.stockQuantity} items available for "${product.name}"` };
        }

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity,
        });
      }

      // Calculate total price
      const totalPrice = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customerRecord.id,
          totalPrice,
          userId,
          status: OrderStatus.PENDING,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } }, customer: true },
      });

      // Deduct stock and update restock queue
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        await restockService.updateRestockQueue(item.productId);
      }

      // Log activity
      await activityService.create({
        action: "ORDER_CREATED",
        description: `Order #${order.orderNumber} created`,
        entityType: "ORDER",
        entityId: order.id,
        userId: userId,
        orderId: order.id,
      });

      return { order };
    } catch (error: any) {
      return { error: error.message || "Something went wrong" };
    }
  },

  updateOrderStatus: async (orderId: string, status: string, userId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return { error: "Order not found" };

    if (order.status === OrderStatus.CANCELLED) {
      return { error: "Cannot update status of cancelled order" };
    }

    if (order.status === OrderStatus.DELIVERED && status !== OrderStatus.CANCELLED) {
      return { error: "Delivered orders cannot be modified" };
    }

    const validStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    if (!validStatuses.includes(status as OrderStatus)) {
      return { error: "Invalid status" };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });

    // FIXED: Should be ORDER_STATUS_UPDATED, not ORDER_CREATED
    await activityService.create({
      action: "ORDER_STATUS_UPDATED",
      description: `Order #${order.orderNumber} status changed to ${status}`,
      entityType: "ORDER",
      entityId: order.id,
      userId: userId,
      orderId: order.id,
    });

    return { order: updatedOrder };
  } catch (error: any) {
    return { error: error.message };
  }
},

cancelOrder: async (orderId: string, userId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { error: "Order not found" };

    if (order.status === OrderStatus.CANCELLED) {
      return { error: "Order is already cancelled" };
    }

    if (order.status === OrderStatus.DELIVERED) {
      return { error: "Delivered orders cannot be cancelled" };
    }

    // Restore stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });
      await restockService.updateRestockQueue(item.productId);
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    // FIXED: Should be ORDER_CANCELLED, not ORDER_CREATED
    await activityService.create({
      action: "ORDER_CANCELLED",
      description: `Order #${order.orderNumber} cancelled`,
      entityType: "ORDER",
      entityId: order.id,
      userId: userId,
      orderId: order.id,
    });

    return { order: cancelledOrder };
  } catch (error: any) {
    return { error: error.message };
  }
},

updateOrder: async (orderId: string, { status, items, customer }: UpdateOrderInput) => {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!existingOrder) return { error: "Order not found" };

    if (existingOrder.status === OrderStatus.DELIVERED) {
      return { error: "Delivered orders cannot be updated" };
    }

    if (existingOrder.status === OrderStatus.CANCELLED) {
      return { error: "Cancelled orders cannot be updated" };
    }

    // Update customer info
    if (customer) {
      await prisma.customer.update({
        where: { id: existingOrder.customerId },
        data: customer
      });
    }

    let totalPrice = existingOrder.totalPrice;

    // Update items if provided
    if (items) {
      // Check for duplicate products
      const productIds = items.map(i => i.productId);
      const hasDuplicates = productIds.length !== new Set(productIds).size;
      if (hasDuplicates) {
        return { error: "Duplicate products are not allowed in the same order" };
      }

      // Restore previous stock
      for (const item of existingOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } }
        });
        await restockService.updateRestockQueue(item.productId);
      }

      // Validate new items and calculate totalPrice
      const newOrderItems = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) return { error: `Product not found` };
        if (product.status !== ProductStatus.ACTIVE) return { error: `${product.name} is not available` };
        if (item.quantity > product.stockQuantity) return { error: `Only ${product.stockQuantity} items available for ${product.name}` };

        newOrderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity,
        });
      }

      totalPrice = newOrderItems.reduce((sum, i) => sum + i.totalPrice, 0);

      // Delete old items and add new items
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.orderItem.createMany({ data: newOrderItems.map(i => ({ ...i, orderId })) });

      // Deduct stock for new items
      for (const item of newOrderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } }
        });
        await restockService.updateRestockQueue(item.productId);
      }
    }

    // Update order status and totalPrice
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        totalPrice,
        ...(status !== undefined ? { status: status as OrderStatus } : {}),
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    // FIXED: Only log if status changed, and use correct action
    if (status) {
      await activityService.create({
        action: "ORDER_UPDATED",
        description: `Order #${existingOrder.orderNumber} updated - status: ${status}`,
        entityType: "ORDER",
        entityId: orderId,
        userId: existingOrder.userId,
        orderId: orderId,
      });
    }

    return { order: updatedOrder };
  } catch (error: any) {
    return { error: error.message || "Something went wrong" };
  }
}
};