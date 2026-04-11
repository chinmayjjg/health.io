import rateLimit from "express-rate-limit";
import { createErrorResponse } from "../utils/api-response";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: createErrorResponse("Too many authentication attempts. Please try again later.", "AUTH_RATE_LIMITED"),
});
