import express from "express";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware";
import { requestLogger, securityMiddleware } from "./middleware/request.middleware";
import rootRoutes from "./routes";

export const app = express();

app.set("trust proxy", 1);
app.use(requestLogger);
app.use(securityMiddleware);
app.use("/", rootRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);
