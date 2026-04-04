import { Request, Response, NextFunction } from "express";
import { restockService } from "./restock.service";

export const restockController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await restockService.getAll(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  restock: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user?.id;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Valid quantity is required" });
      }

      const result = await restockService.restock(productId as string, quantity, userId!);
      res.status(201).json({ success: true, message: "Stock updated successfully", data: result });
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      await restockService.remove(productId as string);
      res.json({ success: true, message: "Product removed from restock queue" });
    } catch (error) {
      next(error);
    }
  },
};