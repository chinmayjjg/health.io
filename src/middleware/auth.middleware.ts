import type { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import type { UserRole } from "../models/user.model";

type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError("Authorization token is missing", 401, { code: "TOKEN_MISSING" }));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new AppError("Token has expired", 401, { code: "TOKEN_EXPIRED" }));
      return;
    }

    if (error instanceof JsonWebTokenError) {
      next(new AppError("Invalid token", 401, { code: "INVALID_TOKEN" }));
      return;
    }

    next(error);
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" }));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError("Forbidden: insufficient permissions", 403, {
          code: "INSUFFICIENT_PERMISSIONS",
        }),
      );
      return;
    }

    next();
  };
};
