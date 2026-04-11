import { Schema, model } from "mongoose";
import type { Document, Model, Types } from "mongoose";

export type AppointmentStatus =
  | "pending_payment"
  | "booked"
  | "cancelled"
  | "completed";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";
export type ConsultationType = "video" | "offline";

export interface IAppointment extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  date: string;
  time: string;
  consultationType: ConsultationType;
  meetingLink?: string;
  status: AppointmentStatus;
  amount: number;
  paymentStatus: PaymentStatus;
  lockExpiresAt?: Date;
  paymentOrderId?: string;
  paymentId?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    consultationType: {
      type: String,
      enum: ["video", "offline"],
      required: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending_payment", "booked", "cancelled", "completed"],
      default: "pending_payment",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "pending",
      required: true,
    },
    lockExpiresAt: {
      type: Date,
      default: undefined,
    },
    paymentOrderId: {
      type: String,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
      default: undefined,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({ doctorId: 1, date: 1, time: 1, status: 1 });
appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index(
  { doctorId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending_payment", "booked", "completed"] },
    },
  },
);
appointmentSchema.index({ paymentOrderId: 1 }, { unique: true, sparse: true });
appointmentSchema.index({ paymentId: 1 }, { unique: true, sparse: true });

export const Appointment: Model<IAppointment> = model<IAppointment>(
  "Appointment",
  appointmentSchema,
);
