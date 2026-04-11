import crypto from "crypto";
import { Schema, model } from "mongoose";
import type { Document, Model, Types } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenHash?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: undefined,
    },
    replacedByTokenHash: {
      type: String,
      default: undefined,
    },
    userAgent: {
      type: String,
      trim: true,
      default: undefined,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken: Model<IRefreshToken> = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);

export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");
