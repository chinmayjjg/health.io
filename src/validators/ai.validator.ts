import { z } from "zod";

export const suggestDoctorSchema = z.object({
  symptoms: z.string().trim().min(1).max(1000),
});
