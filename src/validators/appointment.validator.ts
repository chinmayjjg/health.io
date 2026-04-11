import { z } from "zod";

export const appointmentIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const bookAppointmentSchema = z.object({
  doctorId: z.string().trim().min(1),
  date: z.string().trim().min(1).max(40),
  time: z.string().trim().min(1).max(40),
  consultationType: z.enum(["video", "offline"]),
});

export const rescheduleAppointmentSchema = z.object({
  date: z.string().trim().min(1).max(40),
  time: z.string().trim().min(1).max(40),
});
