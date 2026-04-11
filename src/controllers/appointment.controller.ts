import { Request, Response } from "express";
import { Types } from "mongoose";
import { Appointment } from "../models/appointment.model";
import { Doctor } from "../models/doctor.model";

export const bookAppointment = async (
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

  const { doctorId, date, time } = req.body as {
    doctorId?: string;
    date?: string;
    time?: string;
  };

  if (!doctorId || !date || !time) {
    res.status(400).json({
      success: false,
      message: "doctorId, date and time are required",
    });
    return;
  }

  if (!Types.ObjectId.isValid(doctorId)) {
    res.status(400).json({
      success: false,
      message: "Invalid doctorId",
    });
    return;
  }

  const normalizedDate = date.trim();
  const normalizedTime = time.trim();

  const doctor = await Doctor.findById(doctorId).select("availability");

  if (!doctor) {
    res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
    return;
  }

  const slotExists = doctor.availability.some(
    (slot) => slot.date === normalizedDate && slot.time === normalizedTime,
  );

  if (!slotExists) {
    res.status(400).json({
      success: false,
      message: "Requested slot is not available",
    });
    return;
  }

  const existingBooking = await Appointment.findOne({
    doctorId,
    date: normalizedDate,
    time: normalizedTime,
    status: "booked",
  });

  if (existingBooking) {
    res.status(409).json({
      success: false,
      message: "This slot is already booked",
    });
    return;
  }

  const appointment = await Appointment.create({
    doctorId,
    patientId: req.user.userId,
    date: normalizedDate,
    time: normalizedTime,
    status: "booked",
  });

  res.status(201).json({
    success: true,
    appointment,
  });
};

export const getMyAppointments = async (
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

  let query: Record<string, unknown>;

  if (req.user.role === "patient") {
    query = { patientId: req.user.userId };
  } else {
    const doctorProfile = await Doctor.findOne({ userId: req.user.userId }).select("_id");

    if (!doctorProfile) {
      res.status(404).json({
        success: false,
        message: "Doctor profile not found for this user",
      });
      return;
    }

    query = { doctorId: doctorProfile._id };
  }

  const appointments = await Appointment.find(query)
    .sort({ date: 1, time: 1 })
    .populate({ path: "patientId", select: "name email role" })
    .populate({ path: "doctorId", select: "specialization location price experience userId" });

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
};
