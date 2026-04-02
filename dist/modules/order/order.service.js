"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = void 0;
const prisma_1 = require("../../lib/prisma");
const customer_service_1 = require("../customer/customer.service");
exports.orderService = {
    // Get all orders with filtering
    getAllOrders: async ({ search, status, startDate, endDate, page, limit, skip, sortBy, sortOrder, }) => {
        const andConditions = [];
        if (search) {
            andConditions.push({
                OR: [
                    { customer: { name: { contains: search, mode: "insensitive" } } },
                    { customer: { email: { contains: search, mode: "insensitive" } } },
                    { customer: { phone: { contains: search, mode: "insensitive" } } },
                ],
            });
        }
        if (status) {
            andConditions.push({ status });
        }
        if (startDate || endDate) {
            andConditions.push({
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            });
        }
        const orders = await prisma_1.prisma.order.findMany({
            where: { AND: andConditions },
            take: limit,
            skip,
            orderBy: { [sortBy]: sortOrder ?? "asc" },
            include: {
                items: { include: { product: true } },
                customer: true,
                user: true,
            },
        });
        const total = await prisma_1.prisma.order.count({ where: { AND: andConditions } });
        return {
            data: orders,
            pagination: {
                total,
                page,
                limit,
                totalPage: Math.ceil(total / limit),
            },
        };
    },
    // Create a new order
    createOrder: async ({ customer, items, userId }) => {
        try {
            // Find or create customer
            const customerRecord = await customer_service_1.customerService.findOrCreateCustomer(customer);
            // Validate products and prepare order items
            const orderItems = await Promise.all(items.map(async (i) => {
                const product = await prisma_1.prisma.product.findUnique({ where: { id: i.productId } });
                if (!product || product.status !== "ACTIVE") {
                    throw new Error(`${product?.name || "Product"} is not available`);
                }
                if (i.quantity > product.stockQuantity) {
                    throw new Error(`Only ${product.stockQuantity} items available for ${product.name}`);
                }
                return {
                    productId: i.productId,
                    quantity: i.quantity,
                    unitPrice: product.price,
                    totalPrice: product.price * i.quantity,
                };
            }));
            // Calculate total price
            const totalPrice = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
            // Create order
            const order = await prisma_1.prisma.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}`,
                    customerId: customerRecord.id,
                    totalPrice,
                    userId,
                    items: { create: orderItems },
                },
            });
            // Deduct stock
            for (const item of orderItems) {
                await prisma_1.prisma.product.update({
                    where: { id: item.productId },
                    data: { stockQuantity: { decrement: item.quantity } },
                });
            }
            return { order };
        }
        catch (error) {
            return { error: error.message || "Something went wrong" };
        }
    },
    updateOrder: async (orderId, { status, items, customer }) => {
        try {
            const existingOrder = await prisma_1.prisma.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });
            if (!existingOrder)
                throw new Error("Order not found");
            // Update customer info
            if (customer) {
                await prisma_1.prisma.customer.update({ where: { id: existingOrder.customerId }, data: customer });
            }
            let totalPrice = existingOrder.totalPrice;
            // Update items if provided
            if (items) {
                // 1️⃣ Restore previous stock
                for (const item of existingOrder.items) {
                    await prisma_1.prisma.product.update({
                        where: { id: item.productId },
                        data: { stockQuantity: { increment: item.quantity } }
                    });
                }
                // 2️⃣ Validate new items and calculate totalPrice
                const newOrderItems = await Promise.all(items.map(async (i) => {
                    const product = await prisma_1.prisma.product.findUnique({ where: { id: i.productId } });
                    if (!product || product.status !== "ACTIVE")
                        throw new Error(`${product?.name || "Product"} not available`);
                    if (i.quantity > product.stockQuantity)
                        throw new Error(`Only ${product.stockQuantity} items available for ${product.name}`);
                    return { productId: i.productId, quantity: i.quantity, unitPrice: product.price, totalPrice: product.price * i.quantity };
                }));
                totalPrice = newOrderItems.reduce((sum, i) => sum + i.totalPrice, 0);
                // 3️⃣ Delete old items and add new items
                await prisma_1.prisma.orderItem.deleteMany({ where: { orderId } });
                await prisma_1.prisma.orderItem.createMany({ data: newOrderItems.map(i => ({ ...i, orderId })) });
                // 4️⃣ Deduct stock for new items
                for (const item of newOrderItems) {
                    await prisma_1.prisma.product.update({
                        where: { id: item.productId },
                        data: { stockQuantity: { decrement: item.quantity } }
                    });
                }
            }
            // Update order status and totalPrice
            const updatedOrder = await prisma_1.prisma.order.update({
                where: { id: orderId },
                data: {
                    totalPrice,
                    ...(status !== undefined ? { status: { set: status } } : {}),
                },
            });
            return { order: updatedOrder };
        }
        catch (error) {
            return { error: error.message || "Something went wrong" };
        }
    }
};
//# sourceMappingURL=order.service.js.map