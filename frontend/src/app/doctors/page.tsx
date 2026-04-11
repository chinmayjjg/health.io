"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type DoctorUser = {
  _id: string;
  name: string;
  email: string;
  role: "doctor" | "patient";
};

type Doctor = {
  _id: string;
  userId: DoctorUser;
  specialization: string;
  price: number;
  location: string;
  experience: number;
};

type DoctorsResponse = {
  success: boolean;
  count: number;
  doctors: Doctor[];
};

export default function DoctorsPage() {
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const fetchDoctors = async (filters?: {
    specialization?: string;
    location?: string;
  }) => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGet<DoctorsResponse>("/api/doctors", {
        specialization: filters?.specialization || "",
        location: filters?.location || "",
      });
      setDoctors(data.doctors);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Failed to load doctors";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDoctors();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchDoctors({ specialization, location });
  };

  const clearFilters = async () => {
    setSpecialization("");
    setLocation("");
    await fetchDoctors({ specialization: "", location: "" });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Find Doctors</h1>
        <p className="mt-2 text-gray-600">
          Browse all doctors or filter by specialization and location.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
        <input
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          placeholder="Specialization (e.g. cardiologist)"
          className="rounded-md border px-3 py-2 outline-none focus:border-black md:col-span-2"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g. Mumbai)"
          className="rounded-md border px-3 py-2 outline-none focus:border-black"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={() => void clearFilters()}
            disabled={loading}
            className="rounded-md border px-4 py-2 disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </form>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {doctors.map((doctor) => (
          <article key={doctor._id} className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Dr. {doctor.userId?.name || "Unknown"}</h2>
            <p className="mt-1 text-sm text-gray-600">{doctor.specialization}</p>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="font-medium">Location:</span> {doctor.location}
              </p>
              <p>
                <span className="font-medium">Experience:</span> {doctor.experience} years
              </p>
              <p>
                <span className="font-medium">Consultation Fee:</span> Rs. {doctor.price}
              </p>
            </div>
          </article>
        ))}
      </section>

      {!loading && doctors.length === 0 && !error ? (
        <p className="text-sm text-gray-600">No doctors found for the selected filters.</p>
      ) : null}
    </main>
  );
}
