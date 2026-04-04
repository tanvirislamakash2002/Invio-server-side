import { Request, Response, NextFunction } from "express";
import { orderService } from "./order.service";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

// Type for our user in this controller
type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  emailVerified?: boolean;
};

// GET /orders → list orders
const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, status, startDate, endDate } = req.query;

    const { page, limit, skip, sortBy, sortOrder: rawSortOrder } =
      paginationSortingHelper(req.query);

    const sortOrder: "asc" | "desc" = rawSortOrder === "desc" ? "desc" : "asc";

    const result = await orderService.getAllOrders({
      search: typeof search === "string" ? search : undefined,
      status: typeof status === "string" ? status : undefined,
      startDate: typeof startDate === "string" ? new Date(startDate) : undefined,
      endDate: typeof endDate === "string" ? new Date(endDate) : undefined,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

// POST /orders → create a new order
const createOrder = async (
  req: Request, // plain Request
  res: Response,
  next: NextFunction
) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !customer.name) {
      return res.status(400).json({ error: "Customer name is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Add at least one product to the order" });
    }

    // Cast user locally
    const user = req.user as AuthUser | undefined;
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized", user });
    }

    const result = await orderService.createOrder({
      customer,
      items,
      userId: user.id,
    });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ data: result.order });
  } catch (error: any) {
    next(error);
  }
};
const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const { status, items, customer } = req.body;

    const user = req.user as AuthUser | undefined;
    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });

    const result = await orderService.updateOrder(orderId as string, { status, items, customer });

    if (result.error) return res.status(400).json({ error: result.error });

    res.status(200).json({ data: result.order });
  } catch (error: any) {
    next(error);
  }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const user = req.user as AuthUser | undefined;
    
    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });
    if (!status) return res.status(400).json({ error: "Status is required" });

    const result = await orderService.updateOrderStatus(orderId as string, status, user.id);
    if (result.error) return res.status(400).json({ error: result.error });
    
    res.status(200).json({ success: true, data: result.order });
  } catch (error: any) {
    next(error);
  }
};

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const user = req.user as AuthUser | undefined;
    
    if (!user?.id) return res.status(401).json({ error: "Unauthorized" });

    const result = await orderService.cancelOrder(orderId as string, user.id);
    if (result.error) return res.status(400).json({ error: result.error });
    
    res.status(200).json({ success: true, message: "Order cancelled", data: result.order });
  } catch (error: any) {
    next(error);
  }
};

export const orderController = {
  getOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder
};
