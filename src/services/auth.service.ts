import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import type { UserRole } from "../models/user.model";
import { refreshTokenRepository } from "../repositories/refresh-token.repository";
import { userRepository } from "../repositories/user.repository";
import { durationToMs } from "../utils/duration";

type AuthPayload = {
  userId: string;
  role: UserRole;
};

const accessTokenExpiresIn = env.JWT_ACCESS_EXPIRES_IN as Parameters<typeof jwt.sign>[2]["expiresIn"];
const refreshTokenExpiresIn = env.JWT_REFRESH_EXPIRES_IN as Parameters<typeof jwt.sign>[2]["expiresIn"];
const refreshTokenLifetimeMs = durationToMs(env.JWT_REFRESH_EXPIRES_IN);

export const generateAccessToken = (payload: AuthPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: accessTokenExpiresIn });

const generateRefreshToken = (payload: AuthPayload): string =>
  jwt.sign(
    {
      ...payload,
      type: "refresh",
      jti: crypto.randomUUID(),
    },
    env.JWT_SECRET,
    { expiresIn: refreshTokenExpiresIn },
  );

const verifyRefreshToken = (
  token: string,
): AuthPayload & { type?: string; jti?: string; iat?: number; exp?: number } => {
  return jwt.verify(token, env.JWT_SECRET) as AuthPayload & {
    type?: string;
    jti?: string;
    iat?: number;
    exp?: number;
  };
};

const buildTokenBundle = async (
  user: { _id: { toString(): string }; role: UserRole },
  context?: { userAgent?: string; ipAddress?: string },
) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await refreshTokenRepository.create({
    userId: payload.userId,
    rawToken: refreshToken,
    expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
    userAgent: context?.userAgent,
    ipAddress: context?.ipAddress,
  });

  return { accessToken, refreshToken };
};

export const authService = {
  async signup(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }, context?: { userAgent?: string; ipAddress?: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("Email is already registered", 409, {
        code: "EMAIL_ALREADY_REGISTERED",
      });
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await userRepository.create({
      ...input,
      password: hashedPassword,
    });

    return buildTokenBundle(user, context);
  },

  async login(input: {
    email: string;
    password: string;
  }, context?: { userAgent?: string; ipAddress?: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    return buildTokenBundle(user, context);
  },

  async refreshSession(
    refreshToken: string,
    context?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let decodedToken: ReturnType<typeof verifyRefreshToken>;

    try {
      decodedToken = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid refresh token", 401, { code: "INVALID_REFRESH_TOKEN" });
    }

    if (decodedToken.type !== "refresh") {
      throw new AppError("Invalid refresh token", 401, { code: "INVALID_REFRESH_TOKEN" });
    }

    const storedToken = await refreshTokenRepository.findActiveByRawToken(refreshToken);

    if (!storedToken) {
      const replayedToken = await refreshTokenRepository.findByRawToken(refreshToken);

      if (replayedToken) {
        await refreshTokenRepository.revokeAllForUser(replayedToken.userId.toString());
      }

      throw new AppError("Refresh token is expired or revoked", 401, {
        code: "REFRESH_TOKEN_REVOKED",
      });
    }

    const user = await userRepository.findById(decodedToken.userId);

    if (!user) {
      await refreshTokenRepository.revokeByRawToken(refreshToken);
      throw new AppError("User not found", 404, { code: "USER_NOT_FOUND" });
    }

    const nextTokens = await buildTokenBundle(user, context);
    await refreshTokenRepository.revokeAndReplace(
      storedToken._id.toString(),
      refreshToken,
      nextTokens.refreshToken,
    );

    return nextTokens;
  },

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await refreshTokenRepository.revokeByRawToken(refreshToken);
  },

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, { code: "USER_NOT_FOUND" });
    }

    return user.toObject({
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    });
  },
};
