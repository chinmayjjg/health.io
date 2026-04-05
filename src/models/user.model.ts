import { Document, Model, Schema, model } from "mongoose";

export type UserRole = "patient" | "doctor";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      default: "patient",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User: Model<IUser> = model<IUser>("User", userSchema);
