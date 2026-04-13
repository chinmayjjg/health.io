"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiAuthPost, apiGet } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { motion } from "framer-motion";
import { Calendar, User, Video, MapPin, DollarSign, ArrowRight, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type DoctorUser = {
  _id: string;
  name: string;
};

type Doctor = {
  _id: string;
  userId: DoctorUser;
  specialization: string;
  location: string;
  price: number;
  experience: number;
};

type Slot = {
  date: string;
  time: string;
};

type DoctorsResponse = {
  success: boolean;
  doctors: Doctor[];
};

type SlotsResponse = {
  success: boolean;
  slots: Slot[];
};

type BookAppointmentResponse = {
  success: boolean;
  message: string;
  data: {
    slotHoldExpiresAt?: string;
  };
};

export default function BookingPage() {
  const authorized = useRequireAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [consultationType, setConsultationType] = useState<"video" | "offline">("offline");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor._id === selectedDoctorId),
    [doctors, selectedDoctorId],
  );

  useEffect(() => {
    if (!authorized) return;

    const loadDoctors = async () => {
      setLoadingDoctors(true);
      setError("");

      try {
        const data = await apiGet<DoctorsResponse>("/api/doctors");
        setDoctors(data.doctors);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load doctors";
        setError(message);
      } finally {
        setLoadingDoctors(false);
      }
    };

    void loadDoctors();
  }, [authorized]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctorId) {
        setSlots([]);
        setSelectedSlot("");
        return;
      }

      setLoadingSlots(true);
      setError("");
      setSuccess("");
      setSelectedSlot("");

      try {
        const data = await apiGet<SlotsResponse>(`/api/doctors/${selectedDoctorId}/slots`);
        setSlots(data.slots);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load slots";
        setError(message);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    void loadSlots();
  }, [selectedDoctorId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedDoctorId || !selectedSlot) {
      setError("Please select a doctor and slot.");
      return;
    }

    const [date, time] = selectedSlot.split("|");

    setSubmitting(true);

    try {
      const response = await apiAuthPost<BookAppointmentResponse>("/api/appointments/book", {
        doctorId: selectedDoctorId,
        date,
        time,
        consultationType,
      });

      const holdMessage = response.data?.slotHoldExpiresAt
        ? ` Slot held until ${new Date(response.data.slotHoldExpiresAt).toLocaleString()}.`
        : "";
      setSuccess((response.message || "Booking request created successfully.") + holdMessage);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Booking failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!authorized) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white">Book Appointment</h1>
        <p className="mt-2 text-gray-400">Select doctor, pick a slot, and book your appointment</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="doctor">
              Select Doctor
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              {doctors.map((doctor) => (
                <button
                  key={doctor._id}
                  type="button"
                  onClick={() => setSelectedDoctorId(doctor._id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    selectedDoctorId === doctor._id
                      ? "border-emerald-500 bg-emerald-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                    <User className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      Dr. {doctor.userId?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-emerald-400">{doctor.specialization}</p>
                    <p className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {doctor.location} • {doctor.experience} years
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedDoctor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
            >
              <div>
                <p className="text-sm text-gray-400">Consultation Fee</p>
                <p className="text-2xl font-bold text-white">Rs. {selectedDoctor.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  {consultationType === "video" ? "Video Consultation" : "Offline Visit"}
                </span>
              </div>
            </motion.div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="slot">
              Select Date & Time
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {loadingSlots ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : slots.length === 0 ? (
                <p className="col-span-full py-8 text-center text-gray-400">
                  {selectedDoctorId ? "No slots available" : "Select a doctor first"}
                </p>
              ) : (
                slots.map((slot) => {
                  const key = `${slot.date}|${slot.time}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSlot(key)}
                      className={`flex flex-col items-center rounded-xl border p-3 text-center transition-all ${
                        selectedSlot === key
                          ?="border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm font-medium">{slot.date}</span>
                      <span className="text-xs">{slot.time}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="consultationType">
              Consultation Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultationType("offline")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                  consultationType === "offline"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                <User className="h-5 w-5" />
                Offline Visit
              </button>
              <button
                type="button"
                onClick={() => setConsultationType("video")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                  consultationType === "video"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                <Video className="h-5 w-5" />
                Video Call
              </button>
            </div>
          </div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          ) : null}

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
            >
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <p className="text-sm text-emerald-400">{success}</p>
            </motion.div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || loadingDoctors || !selectedDoctorId || !selectedSlot}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}