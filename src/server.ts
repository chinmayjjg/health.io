import { logger } from "./config/logger";
import { startServer } from "./bootstrap/start-server";

void startServer().catch((error: unknown) => {
  logger.fatal({ err: error }, "Failed to start server");
  process.exit(1);
});
