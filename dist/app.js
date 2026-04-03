"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_1 = require("better-auth/node");
const globalErrorHandler_js_1 = __importDefault(require("./middlewares/globalErrorHandler.js"));
const notFound_js_1 = require("./middlewares/notFound.js");
const upload_route_js_1 = require("./modules/upload/upload.route.js");
const category_route_js_1 = require("./modules/category/category.route.js");
const product_route_js_1 = require("./modules/product/product.route.js");
const order_route_js_1 = require("./modules/order/order.route.js");
const customer_route_js_1 = require("./modules/customer/customer.route.js");
const auth_js_1 = require("./lib/auth.js");
const app = (0, express_1.default)();
const allowedOrigins = [
    process.env.APP_URL || "http://localhost:3000",
    process.env.PROD_APP_URL, // Production frontend URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin)
            return callback(null, true);
        // Check if origin is in allowedOrigins or matches Vercel preview pattern
        const isAllowed = allowedOrigins.includes(origin) ||
            /^https:\/\/skillbridge-client-app.*\.vercel\.app$/.test(origin) ||
            /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
}));
app.use(express_1.default.json());
// register user route 
app.all('/api/auth/*splat', (0, node_1.toNodeHandler)(auth_js_1.auth));
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