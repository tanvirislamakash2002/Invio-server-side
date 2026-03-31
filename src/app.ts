import { toNodeHandler } from "better-auth/node";
import express, { Application } from "express"
import { auth } from "./lib/auth";
import cors from "cors"
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

import { uploadRouter } from "./modules/upload/upload.route";
import { categoryRouter } from "./modules/category/category.route";

const app: Application = express()


app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
}))
app.use(express.json())

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use('/api/v1/upload', uploadRouter);

app.use("/api/v1/categories", categoryRouter);

app.get("/", (req, res) => {
    res.send("Hello, World!")
})
app.use(notFound)
app.use(errorHandler)

export default app;