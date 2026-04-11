import type { Request, Response } from "express";
import { AppError } from "../errors/app-error";
import type { UserRole } from "../models/user.model";
import { authService } from "../services/auth.service";
import { createSuccessResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import {
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
  setRefreshTokenCookie,
} from "../utils/auth-cookie";
import { loginSchema, signupSchema } from "../validators/auth.validator";

const getRequestContext = (req: Request) => ({
  userAgent: req.get("user-agent"),
  ipAddress: req.ip,
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const input = signupSchema.parse(req.body);
  const result = await authService.signup(input, getRequestContext(req));
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(201).json({
    success: true,
    message: "Signup successful",
    token: result.accessToken,
    accessToken: result.accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input, getRequestContext(req));
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: result.accessToken,
    accessToken: result.accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

  if (!refreshToken) {
    throw new AppError("Refresh token is missing", 401, { code: "REFRESH_TOKEN_MISSING" });
  }

  const result = await authService.refreshSession(refreshToken, getRequestContext(req));
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Session refreshed",
    token: result.accessToken,
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;
  await authService.logout(refreshToken);
  clearRefreshTokenCookie(res);

  res.status(200).json(createSuccessResponse({ loggedOut: true }, "Logout successful"));
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const user = await authService.getCurrentUser(req.user.userId);
  res.status(200).json(createSuccessResponse({ user }));
});

export const doctorOnlyPing = (_req: Request, res: Response): void => {
  res.status(200).json(createSuccessResponse({ role: "doctor" as UserRole }, "Doctor access granted"));
};
