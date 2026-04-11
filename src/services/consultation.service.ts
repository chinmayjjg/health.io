import { AppError } from "../errors/app-error";
import { ConsultationSession } from "../models/consultation-session.model";
import type { IConsultationSession } from "../models/consultation-session.model";
import { appointmentRepository } from "../repositories/appointment.repository";

const CONSULTATION_WINDOW_MINUTES = 120;
const CONSULTATION_EXPIRY_MS = CONSULTATION_WINDOW_MINUTES * 60 * 1000;

export const consultationService = {
  async getOrCreateSession(input: { appointmentId: string; userId: string; userRole: string }) {
    const appointment = await appointmentRepository.findById(input.appointmentId);

    if (!appointment) {
      throw new AppError("Appointment not found", 404, { code: "APPOINTMENT_NOT_FOUND" });
    }

    if (appointment.status !== "booked" || appointment.paymentStatus !== "paid") {
      throw new AppError("Appointment is not confirmed", 400, {
        code: "APPOINTMENT_NOT_CONFIRMED",
      });
    }

    if (appointment.consultationType !== "video") {
      throw new AppError("This appointment is not a video consultation", 400, {
        code: "NOT_VIDEO_CONSULTATION",
      });
    }

    const isPatient = appointment.patientId.toString() === input.userId;
    const isDoctor = appointment.doctorId.toString() === input.userId;

    if (!isPatient && !isDoctor) {
      throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    if (input.userRole === "patient" && !isPatient) {
      throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    if (input.userRole === "doctor" && !isDoctor) {
      throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    let session = await ConsultationSession.findOne({
      appointmentId: appointment._id,
    });

    if (!session) {
      if (!appointment.meetingLink) {
        throw new AppError("Meeting link not generated for this appointment", 500, {
          code: "MEETING_LINK_NOT_FOUND",
        });
      }

      session = new ConsultationSession({
        appointmentId: appointment._id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        meetingLink: appointment.meetingLink,
        status: "initiated",
        expiresAt: new Date(Date.now() + CONSULTATION_EXPIRY_MS),
      });

      await session.save();
    }

    if (session.status === "expired") {
      throw new AppError("Consultation session has expired", 410, {
        code: "SESSION_EXPIRED",
      });
    }

    if (session.status === "completed") {
      throw new AppError("Consultation session has already ended", 400, {
        code: "SESSION_COMPLETED",
      });
    }

    return session;
  },

  async startConsultation(input: { appointmentId: string; userId: string }) {
    const session = await ConsultationSession.findOne({
      appointmentId: input.appointmentId,
    });

    if (!session) {
      throw new AppError("Consultation session not found", 404, {
        code: "SESSION_NOT_FOUND",
      });
    }

    const isParticipant =
      session.patientId.toString() === input.userId ||
      session.doctorId.toString() === input.userId;

    if (!isParticipant) {
      throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    if (session.status === "expired") {
      throw new AppError("Consultation session has expired", 410, {
        code: "SESSION_EXPIRED",
      });
    }

    if (session.status === "completed") {
      throw new AppError("Consultation session has already ended", 400, {
        code: "SESSION_COMPLETED",
      });
    }

    if (session.status === "initiated") {
      session.status = "active";
      session.joinedAt = new Date();
      session.startedAt = new Date();
      await session.save();
    }

    return session;
  },

  async endConsultation(input: { appointmentId: string; userId: string }) {
    const session = await ConsultationSession.findOne({
      appointmentId: input.appointmentId,
    });

    if (!session) {
      throw new AppError("Consultation session not found", 404, {
        code: "SESSION_NOT_FOUND",
      });
    }

    const isDoctor = session.doctorId.toString() === input.userId;

    if (!isDoctor) {
      throw new AppError("Only doctor can end consultation", 403, {
        code: "FORBIDDEN",
      });
    }

    if (session.status === "completed" || session.status === "expired") {
      throw new AppError("Consultation session has already ended", 400, {
        code: "SESSION_ALREADY_ENDED",
      });
    }

    session.status = "completed";
    session.endedAt = new Date();
    await session.save();

    const appointment = await appointmentRepository.findById(input.appointmentId);
    if (appointment) {
      appointment.status = "completed";
      await appointment.save();
    }

    return session;
  },

  async getSessionStatus(appointmentId: string): Promise<IConsultationSession | null> {
    const session = await ConsultationSession.findOne({
      appointmentId,
    });

    if (!session) {
      return null;
    }

    if (session.status !== "expired" && session.expiresAt.getTime() < Date.now()) {
      session.status = "expired";
      session.endedAt = new Date();
      await session.save();
    }

    return session;
  },
};
