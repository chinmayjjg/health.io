import { Doctor, type IDoctor } from "../models/doctor.model";
import type { ClientSession, SortOrder } from "mongoose";
import { escapeRegex } from "../utils/escape-regex";

export type DoctorSearchParams = {
  q?: string;
  specialization?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minExperience?: number;
  page: number;
  limit: number;
  sortBy: "experience" | "price" | "createdAt";
  sortOrder: "asc" | "desc";
};

const buildRegexFilter = (value: string) => ({
  $regex: escapeRegex(value.trim().toLowerCase()),
  $options: "i",
});

export const doctorRepository = {
  findByUserId(userId: string): Promise<IDoctor | null> {
    return Doctor.findOne({ userId });
  },

  create(payload: {
    userId: string;
    specialization: string;
    price: number;
    location: string;
    experience: number;
  }): Promise<IDoctor> {
    return Doctor.create({
      ...payload,
      specializationNormalized: payload.specialization.trim().toLowerCase(),
      locationNormalized: payload.location.trim().toLowerCase(),
    });
  },

  findById(id: string) {
    return Doctor.findById(id).populate("userId", "name email role");
  },

  findByIdWithSession(id: string, session: ClientSession) {
    return Doctor.findById(id).session(session);
  },

  findSlotsById(id: string) {
    return Doctor.findById(id).select("availability");
  },

  async search(params: DoctorSearchParams) {
    const filter: Record<string, unknown> = {};

    if (params.q) {
      const qFilter = buildRegexFilter(params.q);
      filter.$or = [
        { specializationNormalized: qFilter },
        { locationNormalized: qFilter },
      ];
    }

    if (params.specialization) {
      filter.specializationNormalized = buildRegexFilter(params.specialization);
    }

    if (params.location) {
      filter.locationNormalized = buildRegexFilter(params.location);
    }

    if (
      params.minPrice !== undefined ||
      params.maxPrice !== undefined
    ) {
      filter.price = {
        ...(params.minPrice !== undefined ? { $gte: params.minPrice } : {}),
        ...(params.maxPrice !== undefined ? { $lte: params.maxPrice } : {}),
      };
    }

    if (params.minExperience !== undefined) {
      filter.experience = { $gte: params.minExperience };
    }

    const sortDirection = params.sortOrder === "asc" ? 1 : -1;
    const sort: Record<string, SortOrder> = {
      [params.sortBy]: sortDirection,
      _id: 1,
    };
    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      Doctor.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(params.limit)
        .populate("userId", "name email role"),
      Doctor.countDocuments(filter),
    ]);

    return {
      items,
      total,
    };
  },
};
