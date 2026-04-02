"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const prisma_1 = require("../../lib/prisma");
exports.categoryService = {
    getAll: async () => {
        return await prisma_1.prisma.category.findMany({
            orderBy: { createdAt: "desc" },
        });
    },
    getById: async (id) => {
        return await prisma_1.prisma.category.findUnique({
            where: { id },
            include: { products: true },
        });
    },
    create: async (name, description) => {
        return await prisma_1.prisma.category.create({
            data: {
                name,
                ...(description ? { description } : {}),
            },
        });
    },
    update: async (id, name, description) => {
        return await prisma_1.prisma.category.update({
            where: { id },
            data: {
                name,
                ...(description !== undefined ? { description } : {}),
            },
        });
    },
    delete: async (id) => {
        return await prisma_1.prisma.category.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=category.service.js.map