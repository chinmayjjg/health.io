import { z } from "zod";

export const getOrCreateSessionSchema = z.object({
  appointmentId: z.string().trim().min(1),
});

export const consultationParamSchema = z.object({
  appointmentId: z.string().trim().min(1),
});
