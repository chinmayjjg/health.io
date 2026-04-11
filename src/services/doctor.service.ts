import { Types } from "mongoose";
import { AppError } from "../errors/app-error";
import { doctorRepository, type DoctorSearchParams } from "../repositories/doctor.repository";
import type { IAvailabilitySlot } from "../models/doctor.model";

export const doctorService = {
  async createProfile(userId: string, input: {
    specialization: string;
    price: number;
    location: string;
    experience: number;
  }) {
    const existingProfile = await doctorRepository.findByUserId(userId);

    if (existingProfile) {
      throw new AppError("Doctor profile already exists for this user", 409, {
        code: "DOCTOR_PROFILE_EXISTS",
      });
    }

    return doctorRepository.create({
      userId,
      specialization: input.specialization.trim(),
      price: input.price,
      location: input.location.trim(),
      experience: input.experience,
    });
  },

  async addAvailability(userId: string, slots: IAvailabilitySlot[]) {
    const doctor = await doctorRepository.findByUserId(userId);

    if (!doctor) {
      throw new AppError("Doctor profile not found for this user", 404, {
        code: "DOCTOR_PROFILE_NOT_FOUND",
      });
    }

    const existingKeys = new Set(
      doctor.availability.map((slot) => `${slot.date}|${slot.time}`),
    );

    for (const slot of slots) {
      const key = `${slot.date}|${slot.time}`;
      if (!existingKeys.has(key)) {
        doctor.availability.push({
          date: slot.date.trim(),
          time: slot.time.trim(),
        });
        existingKeys.add(key);
      }
    }

    await doctor.save();
    return doctor.availability;
  },

  async searchDoctors(params: DoctorSearchParams) {
    if (
      params.minPrice !== undefined &&
      params.maxPrice !== undefined &&
      params.minPrice > params.maxPrice
    ) {
      throw new AppError("minPrice cannot be greater than maxPrice", 400, {
        code: "INVALID_PRICE_RANGE",
      });
    }

    const result = await doctorRepository.search(params);
    const totalPages = Math.max(1, Math.ceil(result.total / params.limit));

    return {
      doctors: result.items,
      total: result.total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };
  },

  async getDoctorById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid doctor id", 400, { code: "INVALID_DOCTOR_ID" });
    }

    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError("Doctor not found", 404, { code: "DOCTOR_NOT_FOUND" });
    }

    return doctor;
  },

  async getDoctorSlots(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid doctor id", 400, { code: "INVALID_DOCTOR_ID" });
    }

    const doctor = await doctorRepository.findSlotsById(id);

    if (!doctor) {
      throw new AppError("Doctor not found", 404, { code: "DOCTOR_NOT_FOUND" });
    }

    return doctor.availability;
  },
};
