"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Filter,
  X,
  User,
  Award,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

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
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  doctors: Doctor[];
};

export default function DoctorsPage() {
  const [query, setQuery] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDoctors = async (filters?: {
    q?: string;
    specialization?: string;
    location?: string;
    minExperience?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
  }) => {
    setLoading(true);
    setError("");

    try {
      const data = await apiGet<DoctorsResponse>("/api/doctors", {
        q: filters?.q || "",
        specialization: filters?.specialization || "",
        location: filters?.location || "",
        minExperience: filters?.minExperience || "",
        maxPrice: filters?.maxPrice || "",
        sortBy: filters?.sortBy || "createdAt",
        sortOrder: filters?.sortOrder || "desc",
        page: String(filters?.page || 1),
        limit: "8",
      });
      setDoctors(data.doctors);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
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
    setShowFilters(false);
    await fetchDoctors({
      q: query,
      specialization,
      location,
      minExperience,
      maxPrice,
      sortBy,
      sortOrder,
      page: 1,
    });
  };

  const clearFilters = async () => {
    setQuery("");
    setSpecialization("");
    setLocation("");
    setMinExperience("");
    setMaxPrice("");
    setSortBy("createdAt");
    setSortOrder("desc");
    await fetchDoctors({
      q: "",
      specialization: "",
      location: "",
      minExperience: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    });
  };

  const hasActiveFilters =
    query || specialization || location || minExperience || maxPrice;

  const goToPage = async (nextPage: number) => {
    await fetchDoctors({
      q: query,
      specialization,
      location,
      minExperience,
      maxPrice,
      sortBy,
      sortOrder,
      page: nextPage,
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white">Find Your Doctor</h1>
        <p className="mt-2 text-gray-400">
          Browse and connect with verified healthcare professionals
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 lg:flex-row lg:items-center"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by specialty, condition, or doctor name..."
              className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-emerald-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid gap-4 border-t border-white/10 pt-4 md:grid-cols-4"
          >
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Specialization"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
            />
            <input
              type="number"
              min="0"
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              placeholder="Min Experience (years)"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max Fee (Rs)"
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50"
            />
            <div className="flex gap-2 md:col-span-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-emerald-500/50"
              >
                <option value="createdAt" className="bg-black">
                  Newest
                </option>
                <option value="experience" className="bg-black">
                  Experience
                </option>
                <option value="price" className="bg-black">
                  Price
                </option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-emerald-500/50"
              >
                <option value="desc" className="bg-black">
                  High to Low
                </option>
                <option value="asc" className="bg-black">
                  Low to High
                </option>
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => void clearFilters()}
                  className="flex items-center rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {error ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.p>
      ) : null}

      <div className="flex items-center justify-between text-sm text-gray-400">
        <p>
          Showing <span className="text-white">{doctors.length}</span> of{" "}
          <span className="text-white">{total}</span> doctors
        </p>
        <p>
          Page <span className="text-white">{page}</span> of{" "}
          <span className="text-white">{totalPages}</span>
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {doctors.map((doctor, i) => (
          <motion.div
            key={doctor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:bg-white/10"
          >
            <div className="flex gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                <User className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Dr. {doctor.userId?.name || "Unknown"}
                </h2>
                <p className="text-sm text-emerald-400">{doctor.specialization}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {doctor.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {doctor.experience} years
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Rs. {doctor.price}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/booking?doctor=${doctor._id}`}
                className="flex flex-1 items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-600"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Link>
              <button className="flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10">
                <Star className="mr-2 h-4 w-4" />
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </section>

      {!loading && doctors.length === 0 && !error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <User className="h-16 w-16 text-gray-600" />
          <p className="mt-4 text-lg text-gray-400">No doctors found</p>
          <p className="text-sm text-gray-500">Try adjusting your search filters</p>
          <button
            onClick={() => void clearFilters()}
            className="mt-4 text-sm text-emerald-400 hover:underline"
          >
            Clear all filters
          </button>
        </motion.div>
      ) : null}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => void goToPage(page - 1)}
            disabled={loading || page <= 1}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => void goToPage(pageNum)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${
                    page === pageNum
                      ? "bg-emerald-500 text-white"
                      : "text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => void goToPage(page + 1)}
            disabled={loading || page >= totalPages}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
