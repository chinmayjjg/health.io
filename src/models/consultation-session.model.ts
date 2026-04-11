import { Schema, model } from "mongoose";
import type { Document, Model, Types } from "mongoose";

export type SessionStatus = "initiated" | "active" | "completed" | "expired";

export interface IConsultationSession extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  status: SessionStatus;
  meetingLink: string;
  joinedAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSessionSchema = new Schema<IConsultationSession>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "active", "completed", "expired"],
      default: "initiated",
      required: true,
    },
    meetingLink: {
      type: String,
      required: true,
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: undefined,
    },
    startedAt: {
      type: Date,
      default: undefined,
    },
    endedAt: {
      type: Date,
      default: undefined,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  },
);

consultationSessionSchema.index({ appointmentId: 1 }, { unique: true });
consultationSessionSchema.index({ patientId: 1, createdAt: -1 });
consultationSessionSchema.index({ doctorId: 1, createdAt: -1 });
consultationSessionSchema.index({ status: 1, expiresAt: 1 });

export const ConsultationSession: Model<IConsultationSession> = model<IConsultationSession>(
  "ConsultationSession",
  consultationSessionSchema,
);
