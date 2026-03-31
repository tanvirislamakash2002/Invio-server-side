import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { uploadService } from "./upload.service";

// Configure multer
const storage = multer.memoryStorage();
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Public upload for registration (no auth)
const uploadPublicAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = (req as any).file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // Upload to ImgBB without saving to database
        const imageUrl = await uploadService.uploadToImgbb(file.buffer, file.originalname);

        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                url: imageUrl
            }
        });
    } catch (error) {
        console.error("Public upload error:", error);
        next(error);
    }
};

// Authenticated upload for logged-in users
const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const file = (req as any).file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const result = await uploadService.uploadAvatar(
            user.id,
            file.buffer,
            file.originalname
        );

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error("Upload controller error:", error);
        next(error);
    }
};

// Export multer middleware
export const uploadMiddleware = upload.single("file");
export const publicUploadMiddleware = upload.single("file");

export const uploadController = {
    uploadAvatar,
    uploadPublicAvatar
};