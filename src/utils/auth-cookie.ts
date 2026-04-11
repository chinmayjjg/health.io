import type { Response } from "express";
import { env } from "../config/env";
import { durationToMs } from "./duration";

export const REFRESH_TOKEN_COOKIE_NAME = "health_io_refresh_token";

const refreshTokenCookieMaxAge = durationToMs(env.JWT_REFRESH_EXPIRES_IN);

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: refreshTokenCookieMaxAge,
    path: "/api/auth",
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/api/auth",
  });
};
