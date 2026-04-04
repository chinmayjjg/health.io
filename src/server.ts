import express from "express";
import mongoose from "mongoose";
import { env } from "./config/env";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware";
import rootRoutes from "./routes";

const app = express();

app.use(express.json());
app.use("/", rootRoutes);

const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown connection error";
    console.error("MongoDB connection failed:", message);
    process.exit(1);
  }
};

app.use(notFoundHandler);
app.use(globalErrorHandler);

const startServer = async (): Promise<void> => {
  await connectMongoDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

void startServer();
