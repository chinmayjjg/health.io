import { Document, Model, Schema, Types, model } from "mongoose";

export interface IAvailabilitySlot {
  date: string;
  time: string;
}

export interface IDoctor extends Document {
  userId: Types.ObjectId;
  specialization: string;
  price: number;
  location: string;
  experience: number;
  availability: IAvailabilitySlot[];
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
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
  },
  {
    _id: false,
  },
);

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Doctor: Model<IDoctor> = model<IDoctor>("Doctor", doctorSchema);
