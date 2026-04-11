import type { Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { appointmentService } from "../services/appointment.service";
import { createSuccessResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import {
  appointmentIdParamSchema,
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
} from "../validators/appointment.validator";

const getParamId = (value: string | string[] | undefined): string | null => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
};

export const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const input = bookAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.bookAppointment({
    ...input,
    patientId: req.user.userId,
    date: input.date.trim(),
    time: input.time.trim(),
  });

  res.status(201).json(
    createSuccessResponse(
      {
        appointment,
        slotHoldExpiresAt: appointment.lockExpiresAt,
      },
      "Appointment created. Complete payment before the slot hold expires.",
    ),
  );
});

export const getMyAppointments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const appointments = await appointmentService.listUserAppointments(req.user);

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  });
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const parsed = appointmentIdParamSchema.parse({
    id: getParamId(req.params.id),
  });
  const appointment = await appointmentService.cancelAppointment({
    appointmentId: parsed.id,
    userId: req.user.userId,
  });

  res.status(200).json(createSuccessResponse({ appointment }, "Appointment cancelled"));
});

export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const params = appointmentIdParamSchema.parse({
    id: getParamId(req.params.id),
  });
  const body = rescheduleAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.rescheduleAppointment({
    appointmentId: params.id,
    userId: req.user.userId,
    date: body.date.trim(),
    time: body.time.trim(),
  });

  res.status(200).json(createSuccessResponse({ appointment }, "Appointment rescheduled"));
});
