import { Request, Response } from "express";
import { Types } from "mongoose";
import { Appointment } from "../models/appointment.model";
import { Doctor } from "../models/doctor.model";

const getParamId = (value: string | string[] | undefined): string | null => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
};

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

export const cancelAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const id = getParamId(req.params.id);

  if (!id || !Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: "Invalid appointment id" });
    return;
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    res.status(404).json({ success: false, message: "Appointment not found" });
    return;
  }

  if (appointment.patientId.toString() !== req.user.userId) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }

  if (appointment.status === "cancelled") {
    res.status(400).json({ success: false, message: "Appointment is already cancelled" });
    return;
  }

  if (appointment.status === "completed") {
    res.status(400).json({ success: false, message: "Completed appointments cannot be cancelled" });
    return;
  }

  appointment.status = "cancelled";
  await appointment.save();

  res.status(200).json({
    success: true,
    appointment,
  });
};

export const rescheduleAppointment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const id = getParamId(req.params.id);

  if (!id || !Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: "Invalid appointment id" });
    return;
  }

  const { date, time } = req.body as { date?: string; time?: string };

  if (!date || !time) {
    res.status(400).json({ success: false, message: "date and time are required" });
    return;
  }

  const normalizedDate = date.trim();
  const normalizedTime = time.trim();

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    res.status(404).json({ success: false, message: "Appointment not found" });
    return;
  }

  if (appointment.patientId.toString() !== req.user.userId) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }

  if (appointment.status !== "booked") {
    res.status(400).json({ success: false, message: "Only booked appointments can be rescheduled" });
    return;
  }

  const doctor = await Doctor.findById(appointment.doctorId).select("availability");

  if (!doctor) {
    res.status(404).json({ success: false, message: "Doctor not found" });
    return;
  }

  const slotExists = doctor.availability.some(
    (slot) => slot.date === normalizedDate && slot.time === normalizedTime,
  );

  if (!slotExists) {
    res.status(400).json({ success: false, message: "Requested slot is not available" });
    return;
  }

  const existingBooking = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctorId: appointment.doctorId,
    date: normalizedDate,
    time: normalizedTime,
    status: "booked",
  });

  if (existingBooking) {
    res.status(409).json({ success: false, message: "This slot is already booked" });
    return;
  }

  appointment.date = normalizedDate;
  appointment.time = normalizedTime;
  await appointment.save();

  res.status(200).json({
    success: true,
    appointment,
  });
};
