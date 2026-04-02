import express from "express";
import auth from "../../middlewares/auth";
import { categoryController } from "./category.controller";
import { Role } from "../../generated/prisma/enums";

const router = express.Router();

// Public routes
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// Protected routes for Admin/Manager
router.post("/", auth(Role.ADMIN, Role.MANAGER), categoryController.create);
router.patch("/:id", auth(Role.ADMIN, Role.MANAGER), categoryController.update);
router.delete("/:id", auth(Role.ADMIN, Role.MANAGER), categoryController.delete);

export const categoryRouter = router;