"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
// GET /orders → fetch orders with filters
router.get("/", order_controller_1.orderController.getOrders);
// POST /orders → create new order
router.post("/", order_controller_1.orderController.createOrder);
router.patch("/:id/status", order_controller_1.orderController.updateOrder);
exports.orderRouter = router;
//# sourceMappingURL=order.route.js.map