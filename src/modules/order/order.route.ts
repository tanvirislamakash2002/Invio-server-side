import { Router } from "express";
import { orderController } from "./order.controller";
import auth from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";

const router = Router();

router.get("/", auth(Role.ADMIN, Role.MANAGER, Role.STAFF), orderController.getOrders);
router.post("/", auth(Role.ADMIN, Role.MANAGER, Role.STAFF), orderController.createOrder);
router.patch("/:id/status", auth(Role.ADMIN, Role.MANAGER), orderController.updateOrderStatus);
router.patch("/:id", auth(Role.ADMIN, Role.MANAGER), orderController.updateOrder);
router.delete("/:id/cancel", auth(Role.ADMIN, Role.MANAGER), orderController.cancelOrder);

export const orderRouter: Router = router;