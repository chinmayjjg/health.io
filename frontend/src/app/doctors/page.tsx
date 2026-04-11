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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Find Doctors</h1>
        <p className="mt-2 text-gray-600">
          Browse doctors with indexed search, smarter filters, and paginated results.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 md:grid-cols-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by specialty or city"
          className="rounded-md border px-3 py-2 outline-none focus:border-black md:col-span-2"
        />
        <input
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          placeholder="Specialization (e.g. cardiologist)"
          className="rounded-md border px-3 py-2 outline-none focus:border-black"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g. Mumbai)"
          className="rounded-md border px-3 py-2 outline-none focus:border-black"
        />
        <input
          type="number"
          min="0"
          value={minExperience}
          onChange={(e) => setMinExperience(e.target.value)}
          placeholder="Min years"
          className="rounded-md border px-3 py-2 outline-none focus:border-black"
        />
        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max fee"
          className="rounded-md border px-3 py-2 outline-none focus:border-black"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-md border px-3 py-2 outline-none focus:border-black"
        >
          <option value="createdAt">Newest</option>
          <option value="experience">Experience</option>
          <option value="price">Price</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="rounded-md border px-3 py-2 outline-none focus:border-black"
        >
          <option value="desc">High to low</option>
          <option value="asc">Low to high</option>
        </select>
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

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Showing {doctors.length} of {total} doctors
        </p>
        <p>
          Page {page} of {totalPages}
        </p>
      </div>

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

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => void goToPage(page - 1)}
          disabled={loading || page <= 1}
          className="rounded-md border px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => void goToPage(page + 1)}
          disabled={loading || page >= totalPages}
          className="rounded-md border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}
