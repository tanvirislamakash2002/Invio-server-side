"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const product_controller_1 = require("./product.controller");
const enums_1 = require("../../generated/prisma/enums");
const router = express_1.default.Router();
// Public routes
router.get("/", product_controller_1.productController.getAll);
router.get("/:id", product_controller_1.productController.getById);
// Protected routes for Admin/Manager
router.post("/", (0, auth_1.default)(enums_1.Role.ADMIN, enums_1.Role.MANAGER), product_controller_1.productController.create);
router.patch("/:id/edit", (0, auth_1.default)(enums_1.Role.ADMIN, enums_1.Role.MANAGER), product_controller_1.productController.update);
router.delete("/:id", (0, auth_1.default)(enums_1.Role.ADMIN, enums_1.Role.MANAGER), product_controller_1.productController.delete);
exports.productRouter = router;
//# sourceMappingURL=product.route.js.map