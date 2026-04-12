"use client";

import { FormEvent, useState } from "react";
import { apiAuthPost } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

type SuggestedDoctorUser = {
  _id: string;
  name: string;
  email: string;
  role: "doctor" | "patient";
};

type SuggestedDoctor = {
  _id: string;
  userId: SuggestedDoctorUser;
  specialization: string;
  location: string;
  experience: number;
  price: number;
};

type SuggestionMeta = {
  rawSpecialization: string;
  confidence: number;
  threshold: number;
  lowConfidence: boolean;
  fallbackApplied: boolean;
  fallbackSpecialization: string;
  effectiveSpecialization: string;
};

type AiSuggestResponse = {
  success: boolean;
  suggestion: SuggestionMeta;
  count: number;
  doctors: SuggestedDoctor[];
};

export default function AiPage() {
  const authorized = useRequireAuth();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AiSuggestResponse | null>(null);

  if (!authorized) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiAuthPost<AiSuggestResponse>("/api/ai/suggest-doctor", {
        symptoms,
      });
      setResult(data);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to get AI suggestion";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-3xl font-semibold">AI Doctor Suggestion</h1>
        <p className="mt-2 text-gray-600">
          Describe symptoms and get suggested specialization with matching doctors.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-5">
        <div>
          <label htmlFor="symptoms" className="mb-1 block text-sm font-medium">
            Symptoms
          </label>
          <textarea
            id="symptoms"
            required
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Example: skin rash with itching for 5 days"
            className="min-h-28 w-full rounded-md border px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Suggest Doctor"}
        </button>
      </form>

      {result ? (
        <section className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">AI Result</h2>
            <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
              <p>
                <span className="font-medium">Raw Specialization:</span>{" "}
                {result.suggestion.rawSpecialization}
              </p>
              <p>
                <span className="font-medium">Effective Specialization:</span>{" "}
                {result.suggestion.effectiveSpecialization}
              </p>
              <p>
                <span className="font-medium">Confidence:</span>{" "}
                {result.suggestion.confidence}
              </p>
              <p>
                <span className="font-medium">Threshold:</span>{" "}
                {result.suggestion.threshold}
              </p>
              <p>
                <span className="font-medium">Low Confidence:</span>{" "}
                {result.suggestion.lowConfidence ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium">Fallback Applied:</span>{" "}
                {result.suggestion.fallbackApplied ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Suggested Doctors ({result.count})</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {result.doctors.map((doctor) => (
                <article key={doctor._id} className="rounded-lg border p-4">
                  <h3 className="text-base font-semibold">
                    Dr. {doctor.userId?.name || "Unknown"}
                  </h3>
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
            </div>

            {result.count === 0 ? (
              <p className="mt-3 text-sm text-gray-600">
                No doctors found for this specialization.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
