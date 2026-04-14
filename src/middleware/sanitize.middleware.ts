import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sanitizeObject = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, fieldValue] of Object.entries(value)) {
    if (key.startsWith("$") || key.includes(".")) {
      throw new AppError("Invalid request payload", 400, {
        code: "INVALID_REQUEST_PAYLOAD",
      });
    }

    sanitized[key] = sanitizeObject(fieldValue);
  }

  return sanitized;
};

export const sanitizeRequest: RequestHandler = (req, _res, next) => {
  try {
    if (req.body) {
      Object.assign(req.body, sanitizeObject(req.body));
    }
    if (req.query) {
      Object.assign(req.query, sanitizeObject(req.query));
    }
    if (req.params) {
      Object.assign(req.params, sanitizeObject(req.params));
    }
    next();
  } catch (error) {
    next(error);
  }
};
