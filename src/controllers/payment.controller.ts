import crypto from "crypto";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import Razorpay from "razorpay";
import { env } from "../config/env";
import { Appointment } from "../models/appointment.model";

const getRazorpayClient = (): Razorpay | null => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
};

const generateJitsiMeetingLink = (appointmentId: string): string => {
  const roomName = `healthio-${appointmentId}`;
  return `https://meet.jit.si/${roomName}`;
};

export const createPaymentOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { appointmentId, currency = "INR" } = req.body as {
    appointmentId?: string;
    currency?: string;
  };

  const normalizedAppointmentId = appointmentId?.trim();

  if (!normalizedAppointmentId || !Types.ObjectId.isValid(normalizedAppointmentId)) {
    res.status(400).json({
      success: false,
      message: "Valid appointmentId is required",
    });
    return;
  }

  const appointment = await Appointment.findById(normalizedAppointmentId);

  if (!appointment) {
    res.status(404).json({ success: false, message: "Appointment not found" });
    return;
  }

  if (appointment.patientId.toString() !== req.user.userId) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }

  if (appointment.status !== "pending_payment") {
    res.status(400).json({
      success: false,
      message: "Payment can only be created for pending appointments",
    });
    return;
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    res.status(500).json({
      success: false,
      message: "Razorpay keys are not configured",
    });
    return;
  }

  const options = {
    amount: Math.round(Number(appointment.amount) * 100),
    currency,
    receipt: `appt_${appointment._id.toString()}_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  appointment.paymentOrderId = order.id;
  appointment.paymentStatus = "pending";
  await appointment.save();

  res.status(201).json({
    success: true,
    appointmentId: appointment._id,
    amount: appointment.amount,
    order,
  });
};

export const verifyPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const {
    appointmentId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body as {
    appointmentId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  const normalizedAppointmentId = appointmentId?.trim();

  if (!normalizedAppointmentId || !Types.ObjectId.isValid(normalizedAppointmentId)) {
    res.status(400).json({
      success: false,
      message: "Valid appointmentId is required",
    });
    return;
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({
      success: false,
      message:
        "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
    });
    return;
  }

  const appointment = await Appointment.findById(normalizedAppointmentId);

  if (!appointment) {
    res.status(404).json({ success: false, message: "Appointment not found" });
    return;
  }

  if (appointment.patientId.toString() !== req.user.userId) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }

  if (appointment.status === "booked" && appointment.paymentStatus === "paid") {
    if (appointment.consultationType === "video" && !appointment.meetingLink) {
      appointment.meetingLink = generateJitsiMeetingLink(appointment._id.toString());
      await appointment.save();
    }

    res.status(200).json({
      success: true,
      verified: true,
      message: "Payment already verified and booking confirmed",
      appointment,
    });
    return;
  }

  if (appointment.status !== "pending_payment") {
    res.status(400).json({
      success: false,
      verified: false,
      message: "Only pending appointments can be verified",
    });
    return;
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    res.status(500).json({
      success: false,
      message: "Razorpay secret is not configured",
    });
    return;
  }

  if (appointment.paymentOrderId && appointment.paymentOrderId !== razorpay_order_id) {
    res.status(400).json({
      success: false,
      verified: false,
      message: "Order id does not match this appointment",
    });
    return;
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    appointment.paymentStatus = "failed";
    appointment.status = "cancelled";
    await appointment.save();

    res.status(400).json({
      success: false,
      verified: false,
      message: "Invalid payment signature",
      appointment,
    });
    return;
  }

  const conflictingBookedAppointment = await Appointment.findOne({
    _id: { $ne: appointment._id },
    doctorId: appointment.doctorId,
    date: appointment.date,
    time: appointment.time,
    status: "booked",
  });

  if (conflictingBookedAppointment) {
    appointment.paymentStatus = "failed";
    appointment.status = "cancelled";
    await appointment.save();

    res.status(409).json({
      success: false,
      verified: false,
      message: "Slot is no longer available",
      appointment,
    });
    return;
  }

  appointment.status = "booked";
  appointment.paymentStatus = "paid";
  appointment.paymentOrderId = razorpay_order_id;
  appointment.paymentId = razorpay_payment_id;

  if (appointment.consultationType === "video") {
    appointment.meetingLink = generateJitsiMeetingLink(appointment._id.toString());
  }

  await appointment.save();

  res.status(200).json({
    success: true,
    verified: true,
    message: "Payment verified and booking confirmed",
    appointment,
  });
};
