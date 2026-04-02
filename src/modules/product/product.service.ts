
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export type CreateProductPayload = {
  name: string;
  description?: string;
  categoryId: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  status: string;
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
    return await prisma.product.create({
      data: data as Prisma.ProductUncheckedCreateInput,
    });
  },

  update: async (id: string, data: UpdateProductPayload) => {
    return await prisma.product.update({
      where: { id },
      data: data as Prisma.ProductUncheckedUpdateInput,
    });
  },

  delete: async (id: string) => {
    return await prisma.product.delete({
      where: { id },
    });
  },
};