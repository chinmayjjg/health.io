"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiAuthPost, apiGet } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

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
};

export default function BookingPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [consultationType, setConsultationType] = useState<"video" | "offline">(
    "offline",
  );
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
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      setError("");

      try {
        const data = await apiGet<DoctorsResponse>("/api/doctors");
        setDoctors(data.doctors);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Failed to load doctors";
        setError(message);
      } finally {
        setLoadingDoctors(false);
      }
    };

    void loadDoctors();
  }, []);

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
        const message =
          loadError instanceof Error ? loadError.message : "Failed to load slots";
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

    const token = getAuthToken();
    if (!token) {
      setError("Please login first. JWT token is missing in localStorage.");
      return;
    }

    if (!selectedDoctorId || !selectedSlot) {
      setError("Please select a doctor and slot.");
      return;
    }

    const [date, time] = selectedSlot.split("|");

    setSubmitting(true);

    try {
      const response = await apiAuthPost<BookAppointmentResponse>(
        "/api/appointments/book",
        {
          doctorId: selectedDoctorId,
          date,
          time,
          consultationType,
        },
        token,
      );

      setSuccess(response.message || "Booking request created successfully.");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Booking failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Book Appointment</h1>
        <p className="mt-2 text-gray-600">
          Select doctor, pick a slot, and submit your booking request.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-5">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="doctor">
            Doctor
          </label>
          <select
            id="doctor"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            disabled={loadingDoctors || doctors.length === 0}
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.userId?.name || "Unknown"} - {doctor.specialization} ({doctor.location})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="slot">
            Slot
          </label>
          <select
            id="slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            disabled={!selectedDoctorId || loadingSlots || slots.length === 0}
            required
          >
            <option value="">
              {loadingSlots ? "Loading slots..." : "Select a slot"}
            </option>
            {slots.map((slot) => {
              const key = `${slot.date}|${slot.time}`;
              return (
                <option key={key} value={key}>
                  {slot.date} at {slot.time}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="consultationType">
            Consultation Type
          </label>
          <select
            id="consultationType"
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value as "video" | "offline")}
            className="w-full rounded-md border px-3 py-2"
            required
          >
            <option value="offline">Offline</option>
            <option value="video">Video</option>
          </select>
        </div>

        {selectedDoctor ? (
          <p className="text-sm text-gray-600">
            Consultation fee: Rs. {selectedDoctor.price}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || loadingDoctors}
          className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Book Appointment"}
        </button>
      </form>
    </main>
  );
}
