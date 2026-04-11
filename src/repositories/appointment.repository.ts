import type { ClientSession } from "mongoose";
import { Appointment, type IAppointment } from "../models/appointment.model";
import type { ConsultationType, PaymentStatus } from "../models/appointment.model";

type CreateAppointmentPayload = {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  consultationType: ConsultationType;
  status: IAppointment["status"];
  amount: number;
  paymentStatus: PaymentStatus;
  lockExpiresAt?: Date;
};

export const appointmentRepository = {
  create(payload: CreateAppointmentPayload, session: ClientSession): Promise<IAppointment> {
    return Appointment.create([payload], { session }).then((docs) => docs[0]);
  },

  findById(id: string) {
    return Appointment.findById(id);
  },

  findByIdWithSession(id: string, session: ClientSession) {
    return Appointment.findById(id).session(session);
  },

  findPatientAppointments(patientId: string) {
    return Appointment.find({ patientId })
      .sort({ date: 1, time: 1 })
      .populate({ path: "patientId", select: "name email role" })
      .populate({ path: "doctorId", select: "specialization location price experience userId" });
  },

  findDoctorAppointments(doctorId: string) {
    return Appointment.find({ doctorId })
      .sort({ date: 1, time: 1 })
      .populate({ path: "patientId", select: "name email role" })
      .populate({ path: "doctorId", select: "specialization location price experience userId" });
  },

  findActiveSlotConflict(input: {
    doctorId: string;
    date: string;
    time: string;
    excludeAppointmentId?: string;
    session: ClientSession;
  }) {
    return Appointment.findOne({
      ...(input.excludeAppointmentId ? { _id: { $ne: input.excludeAppointmentId } } : {}),
      doctorId: input.doctorId,
      date: input.date,
      time: input.time,
      status: { $in: ["pending_payment", "booked", "completed"] },
    }).session(input.session);
  },

  expireStalePendingAppointments(session?: ClientSession) {
    const query = Appointment.updateMany(
      {
        status: "pending_payment",
        lockExpiresAt: { $lt: new Date() },
      },
      {
        status: "cancelled",
        paymentStatus: "expired",
        cancelledAt: new Date(),
        cancellationReason: "slot_hold_expired",
      },
    );

    return session ? query.session(session) : query;
  },
};
