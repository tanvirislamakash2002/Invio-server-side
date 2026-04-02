import express from "express";
import auth from "../../middlewares/auth";
import { productController } from "./product.controller";
import { Role } from "../../generated/prisma/enums";

const router = express.Router();

// Public routes
router.get("/", productController.getAll);
router.get("/:id", productController.getById);

// Protected routes for Admin/Manager
router.post("/", auth(Role.ADMIN, Role.MANAGER), productController.create);
router.patch("/:id/edit", auth(Role.ADMIN, Role.MANAGER), productController.update);
router.delete("/:id", auth(Role.ADMIN, Role.MANAGER), productController.delete);

export const productRouter = router;