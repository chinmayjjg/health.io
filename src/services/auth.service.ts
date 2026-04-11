import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import type { UserRole } from "../models/user.model";
import { userRepository } from "../repositories/user.repository";

type AuthPayload = {
  userId: string;
  role: UserRole;
};

const accessTokenExpiresIn = env.JWT_ACCESS_EXPIRES_IN as Parameters<typeof jwt.sign>[2]["expiresIn"];

export const generateAccessToken = (payload: AuthPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: accessTokenExpiresIn });

export const authService = {
  async signup(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ accessToken: string }> {
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

    return {
      accessToken: generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
      }),
    };
  },

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
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

    return {
      accessToken: generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
      }),
    };
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
