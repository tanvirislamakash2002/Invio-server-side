import { Request, Response, NextFunction } from "express";
import { productService } from "./product.service";

export const productController = {
    getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, search, categoryId, status } = req.query;
        
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;
        
        const result = await productService.getAll({
            page: pageNum,
            limit: limitNum,
            skip,
            search: search as string,
            categoryId: categoryId as string,
            status: status as string,
        });
        
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
},

    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = await productService.getById(id as string);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, message: "Product not found" });
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, description, categoryId, price, stockQuantity, minStockThreshold, status } =
                req.body;
            const data = await productService.create({
                name,
                description,
                categoryId,
                price,
                stockQuantity,
                minStockThreshold,
                status,
            });
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { name, description, categoryId, price, stockQuantity, minStockThreshold, status } =
                req.body;
            const data = await productService.update(id as string, {
                name,
                description,
                categoryId,
                price,
                stockQuantity,
                minStockThreshold,
                status,
            });
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await productService.delete(id as string);
            res.json({ success: true, message: "Product deleted" });
        } catch (error) {
            next(error);
        }
    },
};