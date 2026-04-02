import { Router } from "express";
import { orderController } from "./order.controller";

const router = Router();

// GET /orders → fetch orders with filters
router.get("/", orderController.getOrders);

// POST /orders → create new order
router.post("/", orderController.createOrder);

router.patch("/:id/status", orderController.updateOrder);

export const orderRouter: Router = router;