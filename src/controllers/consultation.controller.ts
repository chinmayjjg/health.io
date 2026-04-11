import type { Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "../errors/app-error";
import { consultationService } from "../services/consultation.service";
import { createSuccessResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { consultationParamSchema, getOrCreateSessionSchema } from "../validators/consultation.validator";

const getParamId = (value: string | string[] | undefined): string | null => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
};

export const getMeetingLink = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const params = consultationParamSchema.parse({
    appointmentId: getParamId(req.params.appointmentId),
  });

  if (!Types.ObjectId.isValid(params.appointmentId)) {
    throw new AppError("Invalid appointmentId", 400, { code: "INVALID_APPOINTMENT_ID" });
  }

  const session = await consultationService.getOrCreateSession({
    appointmentId: params.appointmentId,
    userId: req.user.userId,
    userRole: req.user.role,
  });

  res.status(200).json(
    createSuccessResponse(
      {
        appointmentId: session.appointmentId,
        meetingLink: session.meetingLink,
        sessionId: session._id,
        status: session.status,
        expiresAt: session.expiresAt,
      },
      "Meeting link retrieved",
    ),
  );
});

export const startConsultation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const params = consultationParamSchema.parse({
    appointmentId: getParamId(req.params.appointmentId),
  });

  if (!Types.ObjectId.isValid(params.appointmentId)) {
    throw new AppError("Invalid appointmentId", 400, { code: "INVALID_APPOINTMENT_ID" });
  }

  const session = await consultationService.startConsultation({
    appointmentId: params.appointmentId,
    userId: req.user.userId,
  });

  res.status(200).json(
    createSuccessResponse(
      {
        appointmentId: session.appointmentId,
        status: session.status,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
      },
      "Consultation started",
    ),
  );
});

export const endConsultation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const params = consultationParamSchema.parse({
    appointmentId: getParamId(req.params.appointmentId),
  });

  if (!Types.ObjectId.isValid(params.appointmentId)) {
    throw new AppError("Invalid appointmentId", 400, { code: "INVALID_APPOINTMENT_ID" });
  }

  const session = await consultationService.endConsultation({
    appointmentId: params.appointmentId,
    userId: req.user.userId,
  });

  res.status(200).json(
    createSuccessResponse(
      {
        appointmentId: session.appointmentId,
        status: session.status,
        endedAt: session.endedAt,
      },
      "Consultation ended",
    ),
  );
});

export const getSessionStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const params = consultationParamSchema.parse({
    appointmentId: getParamId(req.params.appointmentId),
  });

  if (!Types.ObjectId.isValid(params.appointmentId)) {
    throw new AppError("Invalid appointmentId", 400, { code: "INVALID_APPOINTMENT_ID" });
  }

  const session = await consultationService.getSessionStatus(params.appointmentId);

  if (!session) {
    res.status(404).json({
      success: false,
      error: { code: "SESSION_NOT_FOUND", message: "No session found for this appointment" },
    });
    return;
  }

  res.status(200).json(
    createSuccessResponse(
      {
        appointmentId: session.appointmentId,
        status: session.status,
        joinedAt: session.joinedAt,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        expiresAt: session.expiresAt,
      },
      "Session status retrieved",
    ),
  );
});
