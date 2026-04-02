"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const category_controller_1 = require("./category.controller");
const enums_1 = require("../../generated/prisma/enums");
const router = express_1.default.Router();
// Public routes
router.get("/", category_controller_1.categoryController.getAll);
router.get("/:id", category_controller_1.categoryController.getById);
// Protected routes for Admin/Manager
router.post("/", (0, auth_1.default)(enums_1.Role.ADMIN, enums_1.Role.MANAGER), category_controller_1.categoryController.create);
router.patch("/:id", (0, auth_1.default)(enums_1.Role.ADMIN, enums_1.Role.MANAGER), category_controller_1.categoryController.update);
router.delete("/:id", (0, auth_1.default)(enums_1.Role.ADMIN, enums_1.Role.MANAGER), category_controller_1.categoryController.delete);
exports.categoryRouter = router;
//# sourceMappingURL=category.route.js.map