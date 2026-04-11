import crypto from "crypto";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import Razorpay from "razorpay";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import { Appointment } from "../models/appointment.model";
import { appointmentService } from "../services/appointment.service";
import { createSuccessResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";

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

export const createPaymentOrder = asyncHandler(async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const { appointmentId, currency = "INR" } = req.body as {
    appointmentId?: string;
    currency?: string;
  };

  const normalizedAppointmentId = appointmentId?.trim();

  if (!normalizedAppointmentId || !Types.ObjectId.isValid(normalizedAppointmentId)) {
    throw new AppError("Valid appointmentId is required", 400, {
      code: "INVALID_APPOINTMENT_ID",
    });
  }

  const appointment = await appointmentService.expireAppointmentHoldIfNeeded(
    normalizedAppointmentId,
  );

  if (!appointment) {
    throw new AppError("Appointment not found", 404, { code: "APPOINTMENT_NOT_FOUND" });
  }

  if (appointment.patientId.toString() !== req.user.userId) {
    throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
  }

  if (appointment.status !== "pending_payment") {
    throw new AppError("Payment can only be created for pending appointments", 400, {
      code: "APPOINTMENT_NOT_PENDING_PAYMENT",
    });
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new AppError("Razorpay keys are not configured", 500, {
      code: "RAZORPAY_NOT_CONFIGURED",
    });
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

  res.status(201).json(
    createSuccessResponse(
      {
        appointmentId: appointment._id,
        amount: appointment.amount,
        order,
        slotHoldExpiresAt: appointment.lockExpiresAt,
      },
      "Payment order created",
    ),
  );
});

export const verifyPayment = asyncHandler(async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
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
    throw new AppError("Valid appointmentId is required", 400, {
      code: "INVALID_APPOINTMENT_ID",
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(
      "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      400,
      { code: "INVALID_PAYMENT_VERIFICATION_PAYLOAD" },
    );
  }

  const appointment = await appointmentService.expireAppointmentHoldIfNeeded(
    normalizedAppointmentId,
  );

  if (!appointment) {
    throw new AppError("Appointment not found", 404, { code: "APPOINTMENT_NOT_FOUND" });
  }

  if (appointment.patientId.toString() !== req.user.userId) {
    throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
  }

  if (appointment.status === "booked" && appointment.paymentStatus === "paid") {
    if (appointment.consultationType === "video" && !appointment.meetingLink) {
      appointment.meetingLink = generateJitsiMeetingLink(appointment._id.toString());
      await appointment.save();
    }

    res.status(200).json(
      createSuccessResponse(
        { verified: true, appointment },
        "Payment already verified and booking confirmed",
      ),
    );
    return;
  }

  if (appointment.status !== "pending_payment") {
    throw new AppError("Only pending appointments can be verified", 400, {
      code: "APPOINTMENT_NOT_PENDING_PAYMENT",
    });
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay secret is not configured", 500, {
      code: "RAZORPAY_NOT_CONFIGURED",
    });
  }

  if (appointment.paymentOrderId && appointment.paymentOrderId !== razorpay_order_id) {
    throw new AppError("Order id does not match this appointment", 400, {
      code: "PAYMENT_ORDER_MISMATCH",
    });
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
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = "payment_signature_invalid";
    await appointment.save();

    throw new AppError("Invalid payment signature", 400, {
      code: "INVALID_PAYMENT_SIGNATURE",
    });
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
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = "slot_conflict_after_payment";
    await appointment.save();

    throw new AppError("Slot is no longer available", 409, {
      code: "SLOT_ALREADY_RESERVED",
    });
  }

  appointment.status = "booked";
  appointment.paymentStatus = "paid";
  appointment.lockExpiresAt = undefined;
  appointment.paymentOrderId = razorpay_order_id;
  appointment.paymentId = razorpay_payment_id;

  if (appointment.consultationType === "video") {
    appointment.meetingLink = generateJitsiMeetingLink(appointment._id.toString());
  }

  await appointment.save();

  res.status(200).json(
    createSuccessResponse(
      { verified: true, appointment },
      "Payment verified and booking confirmed",
    ),
  );
});
