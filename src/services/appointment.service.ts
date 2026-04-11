import mongoose from "mongoose";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";
import { appointmentRepository } from "../repositories/appointment.repository";
import { doctorRepository } from "../repositories/doctor.repository";
import type { ConsultationType } from "../models/appointment.model";

const APPOINTMENT_HOLD_MS = env.APPOINTMENT_HOLD_MINUTES * 60 * 1000;

const ensureValidObjectId = (id: string, code: string, message: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(message, 400, { code });
  }
};

export const appointmentService = {
  async bookAppointment(input: {
    doctorId: string;
    patientId: string;
    date: string;
    time: string;
    consultationType: ConsultationType;
  }) {
    ensureValidObjectId(input.doctorId, "INVALID_DOCTOR_ID", "Invalid doctorId");

    const session = await mongoose.startSession();

    try {
      let createdAppointment: Awaited<ReturnType<typeof appointmentRepository.create>>;

      await session.withTransaction(async () => {
        await appointmentRepository.expireStalePendingAppointments(session);

        const doctor = await doctorRepository.findByIdWithSession(input.doctorId, session);

        if (!doctor) {
          throw new AppError("Doctor not found", 404, { code: "DOCTOR_NOT_FOUND" });
        }

        const slotExists = doctor.availability.some(
          (slot) => slot.date === input.date && slot.time === input.time,
        );

        if (!slotExists) {
          throw new AppError("Requested slot is not available", 400, {
            code: "SLOT_NOT_AVAILABLE",
          });
        }

        const conflictingAppointment = await appointmentRepository.findActiveSlotConflict({
          doctorId: input.doctorId,
          date: input.date,
          time: input.time,
          session,
        });

        if (conflictingAppointment) {
          throw new AppError("This slot is already reserved", 409, {
            code: "SLOT_ALREADY_RESERVED",
          });
        }

        createdAppointment = await appointmentRepository.create(
          {
            doctorId: input.doctorId,
            patientId: input.patientId,
            date: input.date,
            time: input.time,
            consultationType: input.consultationType,
            status: "pending_payment",
            amount: doctor.price,
            paymentStatus: "pending",
            lockExpiresAt: new Date(Date.now() + APPOINTMENT_HOLD_MS),
          },
          session,
        );
      });

      return createdAppointment!;
    } catch (error) {
      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        throw new AppError("This slot is already reserved", 409, {
          code: "SLOT_ALREADY_RESERVED",
        });
      }

      throw error;
    } finally {
      await session.endSession();
    }
  },

  async listUserAppointments(user: { userId: string; role: string }) {
    await appointmentRepository.expireStalePendingAppointments();

    if (user.role === "patient") {
      return appointmentRepository.findPatientAppointments(user.userId);
    }

    const doctorProfile = await doctorRepository.findByUserId(user.userId);

    if (!doctorProfile) {
      throw new AppError("Doctor profile not found for this user", 404, {
        code: "DOCTOR_PROFILE_NOT_FOUND",
      });
    }

    return appointmentRepository.findDoctorAppointments(doctorProfile._id.toString());
  },

  async cancelAppointment(input: { appointmentId: string; userId: string }) {
    ensureValidObjectId(
      input.appointmentId,
      "INVALID_APPOINTMENT_ID",
      "Invalid appointment id",
    );

    const appointment = await appointmentRepository.findById(input.appointmentId);

    if (!appointment) {
      throw new AppError("Appointment not found", 404, { code: "APPOINTMENT_NOT_FOUND" });
    }

    if (appointment.patientId.toString() !== input.userId) {
      throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    if (appointment.status === "cancelled") {
      throw new AppError("Appointment is already cancelled", 400, {
        code: "APPOINTMENT_ALREADY_CANCELLED",
      });
    }

    if (appointment.status === "completed") {
      throw new AppError("Completed appointments cannot be cancelled", 400, {
        code: "APPOINTMENT_ALREADY_COMPLETED",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = "patient_cancelled";

    if (appointment.paymentStatus === "pending") {
      appointment.paymentStatus = "failed";
    }

    await appointment.save();
    return appointment;
  },

  async rescheduleAppointment(input: {
    appointmentId: string;
    userId: string;
    date: string;
    time: string;
  }) {
    ensureValidObjectId(
      input.appointmentId,
      "INVALID_APPOINTMENT_ID",
      "Invalid appointment id",
    );

    const session = await mongoose.startSession();

    try {
      let updatedAppointment: Awaited<ReturnType<typeof appointmentRepository.findById>>;

      await session.withTransaction(async () => {
        await appointmentRepository.expireStalePendingAppointments(session);

        const appointment = await appointmentRepository.findByIdWithSession(
          input.appointmentId,
          session,
        );

        if (!appointment) {
          throw new AppError("Appointment not found", 404, {
            code: "APPOINTMENT_NOT_FOUND",
          });
        }

        if (appointment.patientId.toString() !== input.userId) {
          throw new AppError("Forbidden", 403, { code: "FORBIDDEN" });
        }

        if (appointment.status !== "booked") {
          throw new AppError("Only booked appointments can be rescheduled", 400, {
            code: "APPOINTMENT_NOT_BOOKED",
          });
        }

        const doctor = await doctorRepository.findByIdWithSession(
          appointment.doctorId.toString(),
          session,
        );

        if (!doctor) {
          throw new AppError("Doctor not found", 404, { code: "DOCTOR_NOT_FOUND" });
        }

        const slotExists = doctor.availability.some(
          (slot) => slot.date === input.date && slot.time === input.time,
        );

        if (!slotExists) {
          throw new AppError("Requested slot is not available", 400, {
            code: "SLOT_NOT_AVAILABLE",
          });
        }

        const conflictingAppointment = await appointmentRepository.findActiveSlotConflict({
          doctorId: appointment.doctorId.toString(),
          date: input.date,
          time: input.time,
          excludeAppointmentId: appointment._id.toString(),
          session,
        });

        if (conflictingAppointment) {
          throw new AppError("This slot is already reserved", 409, {
            code: "SLOT_ALREADY_RESERVED",
          });
        }

        appointment.date = input.date;
        appointment.time = input.time;
        updatedAppointment = appointment;
        await appointment.save({ session });
      });

      return updatedAppointment!;
    } catch (error) {
      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        throw new AppError("This slot is already reserved", 409, {
          code: "SLOT_ALREADY_RESERVED",
        });
      }

      throw error;
    } finally {
      await session.endSession();
    }
  },

  async expireAppointmentHoldIfNeeded(appointmentId: string) {
    ensureValidObjectId(
      appointmentId,
      "INVALID_APPOINTMENT_ID",
      "Invalid appointment id",
    );

    const appointment = await appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return null;
    }

    if (
      appointment.status === "pending_payment" &&
      appointment.lockExpiresAt &&
      appointment.lockExpiresAt.getTime() < Date.now()
    ) {
      appointment.status = "cancelled";
      appointment.paymentStatus = "expired";
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = "slot_hold_expired";
      await appointment.save();
    }

    return appointment;
  },
};
