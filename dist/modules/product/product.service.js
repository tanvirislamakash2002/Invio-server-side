"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const prisma_1 = require("../../lib/prisma");
exports.productService = {
    getAll: async () => {
        return await prisma_1.prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: { category: true },
        });
    },
    getById: async (id) => {
        return await prisma_1.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
    },
    create: async (data) => {
        return await prisma_1.prisma.product.create({
            data: data,
        });
    },
    update: async (id, data) => {
        return await prisma_1.prisma.product.update({
            where: { id },
            data: data,
        });
    },
    delete: async (id) => {
        return await prisma_1.prisma.product.delete({
            where: { id },
        });
    },
};
//# sourceMappingURL=product.service.js.map