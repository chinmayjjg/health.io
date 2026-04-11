import { Document, Model, Schema, Types, model } from "mongoose";

export type AppointmentStatus =
  | "pending_payment"
  | "booked"
  | "cancelled"
  | "completed";

export type PaymentStatus = "pending" | "paid" | "failed";
export type ConsultationType = "video" | "offline";

export interface IAppointment extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  date: string;
  time: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentOrderId?: string;
  paymentId?: string;
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
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },
    paymentOrderId: {
      type: String,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Appointment: Model<IAppointment> = model<IAppointment>(
  "Appointment",
  appointmentSchema,
);
