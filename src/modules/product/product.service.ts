import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ProductStatus, Priority } from "../../generated/prisma/enums";

export type CreateProductPayload = {
  name: string;
  description?: string | null;
  categoryId: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  status?: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

export const productService = {
  getAll: async () => {
    return await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  },

  getById: async (id: string) => {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  },

  create: async (data: CreateProductPayload) => {
    const status = data.stockQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
    
    // Filter out undefined values
    const createData: any = {
      name: data.name,
      categoryId: data.categoryId,
      price: data.price,
      stockQuantity: data.stockQuantity,
      minStockThreshold: data.minStockThreshold,
      status,
    };
    
    if (data.description !== undefined && data.description !== null) {
      createData.description = data.description;
    }
    
    const product = await prisma.product.create({
      data: createData,
      include: { category: true },
    });

    // Add to restock queue if low stock
    if (product.stockQuantity < product.minStockThreshold) {
      await prisma.restockQueue.upsert({
        where: { productId: product.id },
        update: {
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM,
        },
        create: {
          productId: product.id,
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM,
        },
      });
    }

    return product;
  },

  update: async (id: string, data: UpdateProductPayload) => {
    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) throw new Error("Product not found");

    const newStockQuantity = data.stockQuantity !== undefined ? data.stockQuantity : currentProduct.stockQuantity;
    const newStatus = newStockQuantity === 0 ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;

    // Build update data dynamically, only including defined fields
    const updateData: any = {
      status: newStatus,
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
    if (data.minStockThreshold !== undefined) updateData.minStockThreshold = data.minStockThreshold;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    // Update restock queue
    if (product.stockQuantity < product.minStockThreshold) {
      await prisma.restockQueue.upsert({
        where: { productId: product.id },
        update: {
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : 
                   product.stockQuantity < product.minStockThreshold / 2 ? Priority.HIGH : Priority.MEDIUM,
        },
        create: {
          productId: product.id,
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority: product.stockQuantity === 0 ? Priority.HIGH : Priority.MEDIUM,
        },
      });
    } else {
      await prisma.restockQueue.deleteMany({ where: { productId: product.id } });
    }

    return product;
  },

  delete: async (id: string) => {
    // Check if product has any orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id },
    });

    if (orderItems) {
      throw new Error("Cannot delete product with existing orders");
    }

    // Remove from restock queue
    await prisma.restockQueue.deleteMany({ where: { productId: id } });

    return await prisma.product.delete({ where: { id } });
  },

  checkActive: async (id: string) => {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { status: true, stockQuantity: true },
    });
    return product?.status === ProductStatus.ACTIVE && (product?.stockQuantity || 0) > 0;
  },
};