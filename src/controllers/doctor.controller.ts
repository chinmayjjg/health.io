import type { Request, Response } from "express";
import { AppError } from "../errors/app-error";
import type { IAvailabilitySlot } from "../models/doctor.model";
import { doctorService } from "../services/doctor.service";
import { createSuccessResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import {
  addDoctorAvailabilitySchema,
  createDoctorProfileSchema,
  doctorIdParamSchema,
  doctorSearchQuerySchema,
} from "../validators/doctor.validator";

export const createDoctorProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const input = createDoctorProfileSchema.parse(req.body);
  const doctor = await doctorService.createProfile(req.user.userId, input);

  res.status(201).json(createSuccessResponse({ doctor }, "Doctor profile created"));
});

export const addDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, { code: "UNAUTHORIZED" });
  }

  const { slots } = addDoctorAvailabilitySchema.parse(req.body);
  const normalizedSlots: IAvailabilitySlot[] = slots.map((slot) => ({
    date: slot.date.trim(),
    time: slot.time.trim(),
  }));
  const updatedSlots = await doctorService.addAvailability(req.user.userId, normalizedSlots);

  res.status(200).json(createSuccessResponse({ slots: updatedSlots }, "Availability updated"));
});

export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const query = doctorSearchQuerySchema.parse(req.query);
  const result = await doctorService.searchDoctors(query);

  res.status(200).json({
    success: true,
    count: result.doctors.length,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPreviousPage: result.hasPreviousPage,
    doctors: result.doctors,
  });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = doctorIdParamSchema.parse(req.params);
  const doctor = await doctorService.getDoctorById(id);

  res.status(200).json(createSuccessResponse({ doctor }));
});

export const getDoctorSlots = asyncHandler(async (req: Request, res: Response) => {
  const { id } = doctorIdParamSchema.parse(req.params);
  const slots = await doctorService.getDoctorSlots(id);

  res.status(200).json({
    success: true,
    slots,
  });
});
