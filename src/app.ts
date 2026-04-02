import express, { Application } from "express";
import cors from "cors";
import errorHandler from "./middlewares/globalErrorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { uploadRouter } from "./modules/upload/upload.route.js";
import { categoryRouter } from "./modules/category/category.route.js";
import { productRouter } from "./modules/product/product.route.js";
import { orderRouter } from "./modules/order/order.route.js";
import { customerRouter } from "./modules/customer/customer.route.js";

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());

// Setup auth asynchronously
async function setupAuth() {
    const auth = await import("./lib/auth.js").then(m => m.auth);
    const { toNodeHandler } = await import("better-auth/node");
    app.all("/api/auth/*splat", toNodeHandler(auth));
}

// Call the setup function
setupAuth().catch(console.error);

// Your routes
app.use('/api/v1/upload', uploadRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/customer", customerRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.use(notFound);
app.use(errorHandler);

export default app;