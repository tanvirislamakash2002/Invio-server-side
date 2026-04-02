"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.publicUploadMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const upload_service_1 = require("./upload.service");
// Configure multer
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed"), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});
// Public upload for registration (no auth)
const uploadPublicAvatar = async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        // Upload to ImgBB without saving to database
        const imageUrl = await upload_service_1.uploadService.uploadToImgbb(file.buffer, file.originalname);
        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                url: imageUrl
            }
        });
    }
    catch (error) {
        console.error("Public upload error:", error);
        next(error);
    }
};
// Authenticated upload for logged-in users
const uploadAvatar = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }
        const result = await upload_service_1.uploadService.uploadAvatar(user.id, file.buffer, file.originalname);
        if (result.success) {
            return res.status(200).json(result);
        }
        else {
            return res.status(400).json(result);
        }
    }
    catch (error) {
        console.error("Upload controller error:", error);
        next(error);
    }
};
// Export multer middleware
exports.uploadMiddleware = upload.single("file");
exports.publicUploadMiddleware = upload.single("file");
exports.uploadController = {
    uploadAvatar,
    uploadPublicAvatar
};
//# sourceMappingURL=upload.controller.js.map