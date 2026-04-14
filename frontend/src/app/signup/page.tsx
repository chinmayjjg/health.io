"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { saveAuthToken } from "@/lib/auth";
import { Stethoscope, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiPost<{ success: boolean; token: string }>("/api/auth/signup", { name, email, password, role });
      saveAuthToken(data.token);
      router.push("/doctors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
            <Stethoscope className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-500 mt-1">Join MediCare Hub today</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500" placeholder="Min 6 characters" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole("patient")} className={`rounded-lg border p-2 text-sm ${role === "patient" ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-white/10 text-gray-400"}`}>Patient</button>
              <button type="button" onClick={() => setRole("doctor")} className={`rounded-lg border p-2 text-sm ${role === "doctor" ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-white/10 text-gray-400"}`}>Doctor</button>
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Login</Link></p>
      </div>
    </main>
  );
}
