"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const globalErrorHandler_js_1 = __importDefault(require("./middlewares/globalErrorHandler.js"));
const notFound_js_1 = require("./middlewares/notFound.js");
const upload_route_js_1 = require("./modules/upload/upload.route.js");
const category_route_js_1 = require("./modules/category/category.route.js");
const product_route_js_1 = require("./modules/product/product.route.js");
const order_route_js_1 = require("./modules/order/order.route.js");
const customer_route_js_1 = require("./modules/customer/customer.route.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
// Setup auth asynchronously
async function setupAuth() {
    const auth = await Promise.resolve().then(() => __importStar(require("./lib/auth.js"))).then(m => m.auth);
    const { toNodeHandler } = await Promise.resolve().then(() => __importStar(require("better-auth/node")));
    app.all("/api/auth/*splat", toNodeHandler(auth));
}
// Call the setup function
setupAuth().catch(console.error);
// Your routes
app.use('/api/v1/upload', upload_route_js_1.uploadRouter);
app.use("/api/v1/categories", category_route_js_1.categoryRouter);
app.use("/api/v1/products", product_route_js_1.productRouter);
app.use("/api/v1/order", order_route_js_1.orderRouter);
app.use("/api/v1/customer", customer_route_js_1.customerRouter);
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
app.use(notFound_js_1.notFound);
app.use(globalErrorHandler_js_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map