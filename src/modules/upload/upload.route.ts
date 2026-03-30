import express, { Router } from "express";
import auth from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { uploadController, uploadMiddleware, documentUploadMiddleware } from "./upload.controller";

const router = express.Router();


// Protected routes
router.post(
    "/avatar",
    auth(Role.ADMIN, Role.SELLER, Role.CUSTOMER),
    uploadMiddleware,
    uploadController.uploadAvatar
);

router.post(
    "/store-logo",
    auth(Role.SELLER),
    uploadMiddleware,
    uploadController.uploadStoreLogo
);

router.post(
    "/product-image/:medicineId",
    auth(Role.SELLER),
    uploadMiddleware,
    uploadController.uploadProductImage
);

router.post(
    "/document",
    auth(Role.SELLER),
    documentUploadMiddleware,
    uploadController.uploadDocument
);

export const uploadRouter: Router = router;