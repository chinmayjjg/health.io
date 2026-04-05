import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, UserRole } from "../models/user.model";

type AuthPayload = {
  userId: string;
  role: UserRole;
};

const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
  };

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      message: "name, email and password are required",
    });
    return;
  }

  if (role && !["patient", "doctor"].includes(role)) {
    res.status(400).json({
      success: false,
      message: "role must be either patient or doctor",
    });
    return;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409).json({
      success: false,
      message: "Email is already registered",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "patient",
  });

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

  res.status(201).json({
    success: true,
    token,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "email and password are required",
    });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    return;
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
  });

  res.status(200).json({
    success: true,
    token,
  });
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const user = await User.findById(req.user.userId).select("-password");

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    user,
  });
};

export const doctorOnlyPing = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Doctor access granted",
  });
};
