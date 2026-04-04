import { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";
import { activityController } from "./activity.controller";

const router = Router();

router.get("/", auth(Role.ADMIN, Role.MANAGER, Role.STAFF), activityController.getRecent);
router.get("/all", auth(Role.ADMIN, Role.MANAGER), activityController.getAll);

export const activityRouter = router;