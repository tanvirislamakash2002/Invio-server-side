import { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service";

export const categoryController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await categoryService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = await categoryService.getById(id as string);
      if (!data) return res.status(404).json({ success: false, message: "Category not found" });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body;
      const data = await categoryService.create(name, description);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const data = await categoryService.update(id as string, name, description);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await categoryService.delete(id as string);
      res.json({ success: true, message: "Category deleted" });
    } catch (error) {
      next(error);
    }
  },
};