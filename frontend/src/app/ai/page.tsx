"use client";

import { FormEvent, useState } from "react";
import { apiAuthPost } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { motion } from "framer-motion";
import {
  Brain,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  MapPin,
  Award,
  DollarSign,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-4 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
          <Sparkles className="mr-2 h-4 w-4" />
          AI-Powered
        </div>
        <h1 className="text-4xl font-bold text-white">AI Doctor Suggestion</h1>
        <p className="mt-2 text-gray-400">
          Describe your symptoms and get AI-powered doctor recommendations
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="symptoms"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Describe Your Symptoms
            </label>
            <textarea
              id="symptoms"
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Example: I have a skin rash with itching for 5 days, fever and headache..."
              className="min-h-32 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-white placeholder-gray-500 outline-none transition-all focus:border-purple-500/50"
            />
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing symptoms...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Get AI Recommendation
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">AI Analysis Result</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-400">Suggested Specialization</p>
                <p className="text-lg font-semibold text-purple-400">
                  {result.suggestion.effectiveSpecialization}
                </p>
                {result.suggestion.fallbackApplied && (
                  <p className="text-xs text-yellow-400 mt-1">
                    (Fallback from: {result.suggestion.rawSpecialization})
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-gray-400">Confidence Score</p>
                <p
                  className={`text-lg font-semibold ${
                    result.suggestion.confidence >= 0.7
                      ? "text-emerald-400"
                      : "text-yellow-400"
                  }`}
                >
                  {Math.round(result.suggestion.confidence * 100)}%
                </p>
                <p className="text-xs text-gray-500">
                  Threshold: {Math.round(result.suggestion.threshold * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Recommended Doctors ({result.count})
            </h2>
            {result.count === 0 ? (
              <p className="text-gray-400 py-8 text-center">
                No doctors found for this specialization.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {result.doctors.map((doctor) => (
                  <motion.div
                    key={doctor._id}
                    whileHover={{ scale: 1.02 }}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all hover:border-purple-500/50 hover:bg-white/10"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
                        <User className="h-7 w-7 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                          Dr. {doctor.userId?.name || "Unknown"}
                        </h3>
                        <p className="text-sm text-purple-400">{doctor.specialization}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {doctor.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {doctor.experience} years
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Rs. {doctor.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/booking?doctor=${doctor._id}`}
                      className="mt-4 flex w-full items-center justify-center rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-600"
                    >
                      Book Appointment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </main>
  );
}
