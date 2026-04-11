import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../config/logger";

export const connectMongoDb = async (): Promise<void> => {
  await mongoose.connect(env.MONGO_URI);
  logger.info("MongoDB connected successfully");
};
