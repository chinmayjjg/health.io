import rateLimit from "express-rate-limit";
import { createErrorResponse } from "../utils/api-response";

const createLimiter = (message: string, max: number) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: createErrorResponse(message, "RATE_LIMITED"),
  });

export const bookingRateLimiter = createLimiter(
  "Too many booking requests. Please try again later.",
  20,
);

export const paymentRateLimiter = createLimiter(
  "Too many payment requests. Please try again later.",
  20,
);

export const aiRateLimiter = createLimiter(
  "Too many AI requests. Please try again later.",
  15,
);
