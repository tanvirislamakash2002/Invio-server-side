import { prisma } from "../../lib/prisma";

export const categoryService = {
  getAll: async () => {
    return await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  getById: async (id: string) => {
    return await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  },

  create: async (name: string, description?: string) => {
    return await prisma.category.create({
      data: {
        name,
        ...(description ? { description } : {}), 
      },
    });
  },

  update: async (id: string, name: string, description?: string) => {
    return await prisma.category.update({
      where: { id },
      data: {
        name,
        ...(description !== undefined ? { description } : {}), 
      },
    });
  },

  delete: async (id: string) => {
    return await prisma.category.delete({
      where: { id },
    });
  },
};