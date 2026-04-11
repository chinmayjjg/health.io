import { ZodError } from "zod";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";
import { AppError, isAppError } from "../errors/app-error";
import { createErrorResponse } from "../utils/api-response";

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  res.status(404).json(
    createErrorResponse(`Route ${req.method} ${req.originalUrl} not found`, "ROUTE_NOT_FOUND"),
  );
};

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let normalizedError: AppError;

  if (err instanceof ZodError) {
    normalizedError = new AppError("Request validation failed", 400, {
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    });
  } else if (isAppError(err)) {
    normalizedError = err;
  } else {
    normalizedError = new AppError("Internal server error", 500, {
      code: "INTERNAL_SERVER_ERROR",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
      isOperational: false,
    });
  }

  logger.error(
    {
      err,
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
      statusCode: normalizedError.statusCode,
    },
    normalizedError.message,
  );

  res.status(normalizedError.statusCode).json(
    createErrorResponse(
      normalizedError.message,
      normalizedError.code,
      normalizedError.details,
    ),
  );
};
