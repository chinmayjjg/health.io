import { z } from "zod";

export const createDoctorProfileSchema = z.object({
  specialization: z.string().trim().min(2).max(120),
  price: z.coerce.number().min(0).max(100000),
  location: z.string().trim().min(2).max(120),
  experience: z.coerce.number().int().min(0).max(80),
});

export const addDoctorAvailabilitySchema = z.object({
  slots: z
    .array(
      z.object({
        date: z.string().trim().min(1).max(40),
        time: z.string().trim().min(1).max(40),
      }),
    )
    .min(1)
    .max(200),
});

export const doctorSearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  specialization: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.enum(["experience", "price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const doctorIdParamSchema = z.object({
  id: z.string().trim().min(1),
});
