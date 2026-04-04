import { prisma } from "../../lib/prisma";
import { Priority, ProductStatus } from "../../generated/prisma/enums";

export const restockService = {
  getAll: async () => {
    const queue = await prisma.restockQueue.findMany({
      orderBy: [
        { priority: "asc" }, // HIGH first
        { currentStock: "asc" }, // Lowest stock first
      ],
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    // Add priority label for frontend
    return queue.map(item => ({
      ...item,
      priorityLabel: item.priority === Priority.HIGH ? "High" : item.priority === Priority.MEDIUM ? "Medium" : "Low",
    }));
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
    await prisma.activity.create({
      data: {
        action: "STOCK_UPDATED",
        description: `Stock updated for "${product.name}" (+${quantity}), now ${newStock} units`,
        entityType: "PRODUCT",
        entityId: productId,
        userId,
      },
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
};