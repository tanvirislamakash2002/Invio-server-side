import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";
import { restockController } from "./restock.controller";

const router = Router();

router.get("/", auth(Role.ADMIN, Role.MANAGER), restockController.getAll);
router.patch("/:productId/restock", auth(Role.ADMIN, Role.MANAGER), restockController.restock);
router.delete("/:productId", auth(Role.ADMIN, Role.MANAGER), restockController.remove);

export const restockRouter = router;