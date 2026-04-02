"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const product_service_1 = require("./product.service");
exports.productController = {
    getAll: async (req, res, next) => {
        try {
            const data = await product_service_1.productService.getAll();
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await product_service_1.productService.getById(id);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, message: "Product not found" });
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const { name, description, categoryId, price, stockQuantity, minStockThreshold, status } = req.body;
            const data = await product_service_1.productService.create({
                name,
                description,
                categoryId,
                price,
                stockQuantity,
                minStockThreshold,
                status,
            });
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, description, categoryId, price, stockQuantity, minStockThreshold, status } = req.body;
            const data = await product_service_1.productService.update(id, {
                name,
                description,
                categoryId,
                price,
                stockQuantity,
                minStockThreshold,
                status,
            });
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await product_service_1.productService.delete(id);
            res.json({ success: true, message: "Product deleted" });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=product.controller.js.map