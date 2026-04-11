import type { Server } from "node:http";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { connectMongoDb } from "./connect-db";
import { app } from "../app";

export const startServer = async (): Promise<Server> => {
  await connectMongoDb();

  return app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, "HTTP server started");
  });
};
