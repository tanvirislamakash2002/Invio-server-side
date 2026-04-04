import { Request, Response, NextFunction } from "express";
import { restockService } from "./restock.service";

export const restockController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await restockService.getAll();
      res.json({ success: true, data });
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
      res.json({ success: true, message: "Stock updated successfully", data: result });
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