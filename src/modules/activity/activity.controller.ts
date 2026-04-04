import { Request, Response, NextFunction } from "express";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { activityService } from "./activity.service";

export const activityController = {
  getRecent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const data = await activityService.getRecent(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query);
      const { entityType, action } = req.query;

      const result = await activityService.getAll({
        page,
        limit,
        skip,
        sortBy,
        sortOrder: sortOrder as "asc" | "desc",
        entityType: entityType as string,
        action: action as string,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },
};