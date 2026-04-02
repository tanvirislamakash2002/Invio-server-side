"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const category_service_1 = require("./category.service");
exports.categoryController = {
    getAll: async (req, res, next) => {
        try {
            const data = await category_service_1.categoryService.getAll();
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await category_service_1.categoryService.getById(id);
            if (!data)
                return res.status(404).json({ success: false, message: "Category not found" });
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const { name, description } = req.body;
            const data = await category_service_1.categoryService.create(name, description);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const data = await category_service_1.categoryService.update(id, name, description);
            res.json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            await category_service_1.categoryService.delete(id);
            res.json({ success: true, message: "Category deleted" });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=category.controller.js.map