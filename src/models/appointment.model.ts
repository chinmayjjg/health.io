import { Document, Model, Schema, Types, model } from "mongoose";

export type AppointmentStatus = "booked" | "cancelled" | "completed";

export interface IAppointment extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  date: string;
  time: string;
  status: AppointmentStatus;
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
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
      required: true,
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
