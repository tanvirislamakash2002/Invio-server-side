"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const upload_controller_1 = require("./upload.controller");
const enums_1 = require("../../generated/prisma/enums");
const router = express_1.default.Router();
// Public route for registration (no auth required)
router.post("/avatar/public", upload_controller_1.publicUploadMiddleware, upload_controller_1.uploadController.uploadPublicAvatar);
// Protected routes for logged-in users
router.post("/avatar", (0, auth_1.default)(enums_1.Role.ADMIN, enums_1.Role.MANAGER, enums_1.Role.STAFF), upload_controller_1.uploadMiddleware, upload_controller_1.uploadController.uploadAvatar);
exports.uploadRouter = router;
//# sourceMappingURL=upload.route.js.map