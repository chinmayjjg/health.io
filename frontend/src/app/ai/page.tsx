"use client";

import { useState } from "react";
import { apiAuthPost } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Brain, Send, MapPin, Award, DollarSign, User } from "lucide-react";
import Link from "next/link";

type Doctor = { _id: string; userId: { name: string }; specialization: string; location: string; experience: number; price: number };

export default function AiPage() {
  const authorized = useRequireAuth();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ suggestion: { effectiveSpecialization: string; confidence: number }; doctors: Doctor[]; count: number } | null>(null);

  if (!authorized) return <main className="min-h-screen pt-14 flex items-center justify-center"><p className="text-gray-500">Please login to use AI</p></main>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiAuthPost<typeof result>("/api/ai/suggest-doctor", { symptoms });
      setResult(data);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to get suggestion"); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen pt-14 px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white">AI Doctor Suggestion</h1>
      <p className="text-gray-500 mt-1">Describe your symptoms for AI-powered recommendations</p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <textarea required value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Example: I have skin rash with itching for 5 days..." className="w-full min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500" />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="mt-3 w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60">
          {loading ? "Analyzing..." : "Get AI Recommendation"}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-gray-400">Suggested Specialization</p>
            <p className="text-lg font-semibold text-emerald-400">{result.suggestion.effectiveSpecialization}</p>
            <p className="text-sm text-gray-500">Confidence: {Math.round(result.suggestion.confidence * 100)}%</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Recommended Doctors ({result.count})</h2>
            {result.count === 0 ? <p className="text-gray-500">No doctors found</p> : (
              <div className="grid gap-3 md:grid-cols-2">
                {result.doctors.map(d => (
                  <div key={d._id} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20"><User className="h-6 w-6 text-emerald-400" /></div>
                    <div className="flex-1">
                      <p className="font-medium text-white">Dr. {d.userId?.name}</p>
                      <p className="text-sm text-emerald-400">{d.specialization}</p>
                      <div className="mt-1 flex gap-2 text-xs text-gray-500"><span><MapPin className="inline h-3 w-3" /> {d.location}</span><span><Award className="inline h-3 w-3" /> {d.experience}y</span><span><DollarSign className="inline h-3 w-3" /> {d.price}</span></div>
                    </div>
                    <Link href={`/booking?doctor=${d._id}`} className="self-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">Book</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
