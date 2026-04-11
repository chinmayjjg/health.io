import type { Request, Response } from "express";
import { AppError } from "../errors/app-error";
import type { UserRole } from "../models/user.model";
import { authService } from "../services/auth.service";
import { createSuccessResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { loginSchema, signupSchema } from "../validators/auth.validator";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const input = signupSchema.parse(req.body);
  const result = await authService.signup(input);

  res.status(201).json(createSuccessResponse(result, "Signup successful"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);

  res.status(200).json(createSuccessResponse(result, "Login successful"));
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
