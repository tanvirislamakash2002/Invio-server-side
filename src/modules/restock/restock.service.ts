import { prisma } from "../../lib/prisma";
import { Priority, ProductStatus } from "../../generated/prisma/enums";
import { activityService } from "../activity/activity.service";

export const restockService = {
  getAll: async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;
  
  const [queue, total] = await Promise.all([
    prisma.restockQueue.findMany({
      skip,
      take: limit,
      orderBy: [
        { priority: "asc" },
        { currentStock: "asc" },
      ],
      include: {
        product: {
          include: { category: true },
        },
      },
    }),
    prisma.restockQueue.count(),
  ]);

  const data = queue.map(item => ({
    ...item,
    priorityLabel: item.priority === Priority.HIGH ? "High" : item.priority === Priority.MEDIUM ? "Medium" : "Low",
  }));

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
},

  restock: async (productId: string, quantity: number, userId: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const newStock = product.stockQuantity + quantity;
    const newStatus = newStock === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;

    // Update product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newStock,
        status: newStatus,
      },
    });

    // Remove from restock queue if stock is above threshold
    if (newStock >= product.minStockThreshold) {
      await prisma.restockQueue.deleteMany({
        where: { productId },
      });
    } else {
      // Update queue with new stock and priority
      await prisma.restockQueue.update({
        where: { productId },
        data: {
          currentStock: newStock,
          priority: newStock === 0 ? Priority.HIGH : 
                   newStock < product.minStockThreshold / 2 ? Priority.HIGH : Priority.MEDIUM,
        },
      });
    }

    // Log activity
    await activityService.create({
  action: "STOCK_UPDATED",
  description: `Stock updated for "${product.name}" (+${quantity}), now ${newStock} units`,
  entityType: "PRODUCT",
  entityId: productId,
  userId: userId,
});

    return updatedProduct;
  },

  remove: async (productId: string) => {
    const queueItem = await prisma.restockQueue.findUnique({
      where: { productId },
    });

    if (!queueItem) {
      throw new Error("Product not found in restock queue");
    }

    await prisma.restockQueue.delete({
      where: { productId },
    });
  },
  updateRestockQueue: async (productId: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return;

    if (product.stockQuantity < product.minStockThreshold) {
      await prisma.restockQueue.upsert({
        where: { productId },
        update: {
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : 
                   product.stockQuantity < product.minStockThreshold / 2 ? Priority.HIGH : Priority.MEDIUM,
        },
        create: {
          productId,
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM,
        },
      });
    } else {
      await prisma.restockQueue.deleteMany({ where: { productId } });
    }
  },
};