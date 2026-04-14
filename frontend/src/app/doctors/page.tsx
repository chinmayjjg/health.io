"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import { Search, MapPin, Calendar, DollarSign, User, Award } from "lucide-react";

type Doctor = {
  _id: string;
  userId: { name: string };
  specialization: string;
  price: number;
  location: string;
  experience: number;
};

type DoctorsResponse = {
  success: boolean;
  doctors: Doctor[];
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const data = await apiGet<DoctorsResponse>("/api/doctors", { q: query, limit: "20" });
        setDoctors(data.doctors);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [query]);

  return (
    <main className="min-h-screen pt-14 px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white">Find Doctors</h1>
      <p className="text-gray-500 mt-1">Browse and connect with verified healthcare professionals</p>

      <div className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by specialty or location..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-gray-500">Loading doctors...</div>
      ) : error ? (
        <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">No doctors found</div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                <User className="h-7 w-7 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Dr. {doctor.userId?.name || "Unknown"}</h3>
                <p className="text-sm text-emerald-400">{doctor.specialization}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{doctor.location}</span>
                  <span className="flex items-center gap-1"><Award className="h-3 w-3" />{doctor.experience}y</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Rs.{doctor.price}</span>
                </div>
              </div>
              <Link href={`/booking?doctor=${doctor._id}`} className="self-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
                Book
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
