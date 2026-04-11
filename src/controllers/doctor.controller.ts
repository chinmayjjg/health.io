import { Request, Response } from "express";
import { Types } from "mongoose";
import { Doctor, IAvailabilitySlot } from "../models/doctor.model";

export const createDoctorProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { specialization, price, location, experience } = req.body as {
    specialization?: string;
    price?: number;
    location?: string;
    experience?: number;
  };

  if (!specialization || price === undefined || !location || experience === undefined) {
    res.status(400).json({
      success: false,
      message: "specialization, price, location and experience are required",
    });
    return;
  }

  if (Number(price) < 0 || Number(experience) < 0) {
    res.status(400).json({
      success: false,
      message: "price and experience must be non-negative",
    });
    return;
  }

  const existingProfile = await Doctor.findOne({ userId: req.user.userId });
  if (existingProfile) {
    res.status(409).json({
      success: false,
      message: "Doctor profile already exists for this user",
    });
    return;
  }

  const doctor = await Doctor.create({
    userId: req.user.userId,
    specialization,
    price: Number(price),
    location,
    experience: Number(experience),
  });

  res.status(201).json({
    success: true,
    doctor,
  });
};

export const addDoctorAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { slots } = req.body as {
    slots?: Array<Partial<IAvailabilitySlot>>;
  };

  if (!Array.isArray(slots) || slots.length === 0) {
    res.status(400).json({
      success: false,
      message: "slots array is required",
    });
    return;
  }

  const normalizedSlots: IAvailabilitySlot[] = [];

  for (const slot of slots) {
    const date = typeof slot.date === "string" ? slot.date.trim() : "";
    const time = typeof slot.time === "string" ? slot.time.trim() : "";

    if (!date || !time) {
      res.status(400).json({
        success: false,
        message: "Each slot must include non-empty date and time",
      });
      return;
    }

    normalizedSlots.push({ date, time });
  }

  const doctor = await Doctor.findOne({ userId: req.user.userId });

  if (!doctor) {
    res.status(404).json({
      success: false,
      message: "Doctor profile not found for this user",
    });
    return;
  }

  const existingKeys = new Set(
    doctor.availability.map((slot) => `${slot.date}|${slot.time}`),
  );

  for (const slot of normalizedSlots) {
    const key = `${slot.date}|${slot.time}`;
    if (!existingKeys.has(key)) {
      doctor.availability.push(slot);
      existingKeys.add(key);
    }
  }

  await doctor.save();

  res.status(200).json({
    success: true,
    slots: doctor.availability,
  });
};

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  const rawSpecialization = req.query.specialization;
  const rawLocation = req.query.location;

  const specialization = Array.isArray(rawSpecialization)
    ? rawSpecialization[0]
    : rawSpecialization;
  const location = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;

  const filters: Record<string, unknown> = {};

  if (typeof specialization === "string" && specialization.trim()) {
    filters.specialization = { $regex: specialization.trim(), $options: "i" };
  }

  if (typeof location === "string" && location.trim()) {
    filters.location = { $regex: location.trim(), $options: "i" };
  }

  const doctors = await Doctor.find(filters).populate("userId", "name email role");

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
};

export const getDoctorById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id || !Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid doctor id",
    });
    return;
  }

  const doctor = await Doctor.findById(id).populate("userId", "name email role");

  if (!doctor) {
    res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    doctor,
  });
};

export const getDoctorSlots = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id || !Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid doctor id",
    });
    return;
  }

  const doctor = await Doctor.findById(id).select("availability");

  if (!doctor) {
    res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    slots: doctor.availability,
  });
};
