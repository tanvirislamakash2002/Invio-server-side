import express, { Router } from "express";
import auth from "../../middlewares/auth";
import { uploadController, uploadMiddleware, publicUploadMiddleware } from "./upload.controller";
import { Role } from "../../../generated/prisma/enums";

const router = express.Router();


// Public route for registration (no auth required)
router.post(
    "/avatar/public",
    publicUploadMiddleware,
    uploadController.uploadPublicAvatar
);

// Protected routes for logged-in users
router.post(
    "/avatar",
    auth(Role.ADMIN, Role.MANAGER, Role.STAFF),
    uploadMiddleware,
    uploadController.uploadAvatar
);



export const uploadRouter: Router = router;