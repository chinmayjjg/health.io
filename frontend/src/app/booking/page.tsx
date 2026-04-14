"use client";

import { useEffect, useState, useMemo } from "react";
import { apiAuthPost, apiGet } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Calendar, User, Video, MapPin, DollarSign } from "lucide-react";

type Doctor = { _id: string; userId: { name: string }; specialization: string; location: string; price: number; experience: number };
type Slot = { date: string; time: string };

export default function BookingPage() {
  const authorized = useRequireAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [consultationType, setConsultationType] = useState<"video" | "offline">("offline");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedDoctor = useMemo(() => doctors.find(d => d._id === selectedDoctorId), [doctors, selectedDoctorId]);

  useEffect(() => {
    if (!authorized) return;
    apiGet<{ success: boolean; doctors: Doctor[] }>("/api/doctors").then(d => setDoctors(d.doctors)).catch(() => setError("Failed to load doctors")).finally(() => setLoading(false));
  }, [authorized]);

  useEffect(() => {
    if (!selectedDoctorId) { setSlots([]); return; }
    setSelectedSlot("");
    apiGet<{ success: boolean; slots: Slot[] }>(`/api/doctors/${selectedDoctorId}/slots`).then(d => setSlots(d.slots)).catch(() => setSlots([]));
  }, [selectedDoctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedSlot) { setError("Select doctor and slot"); return; }
    const [date, time] = selectedSlot.split("|");
    setSubmitting(true);
    setError("");
    try {
      const res = await apiAuthPost<{ success: boolean; message: string }>("/api/appointments/book", { doctorId: selectedDoctorId, date, time, consultationType });
      setSuccess(res.message || "Booking successful!");
    } catch (err) { setError(err instanceof Error ? err.message : "Booking failed"); }
    finally { setSubmitting(false); }
  };

  if (!authorized) return <main className="min-h-screen pt-14 flex items-center justify-center"><p className="text-gray-500">Please login to book</p></main>;
  if (loading) return <main className="min-h-screen pt-14 flex items-center justify-center"><p className="text-gray-500">Loading...</p></main>;

  return (
    <main className="min-h-screen pt-14 px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
      <p className="text-gray-500 mt-1">Select doctor and time slot</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-white/10 bg-white/5 p-5">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Select Doctor</label>
          <div className="grid gap-2 md:grid-cols-2">
            {doctors.map(d => (
              <button key={d._id} type="button" onClick={() => setSelectedDoctorId(d._id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left ${selectedDoctorId === d._id ? "border-emerald-500 bg-emerald-500/20" : "border-white/10 bg-white/5"}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20"><User className="h-5 w-5 text-emerald-400" /></div>
                <div><p className="font-medium text-white">Dr. {d.userId?.name}</p><p className="text-xs text-emerald-400">{d.specialization}</p></div>
              </button>
            ))}
          </div>
        </div>

        {selectedDoctor && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div><p className="text-sm text-gray-400">Fee</p><p className="text-xl font-bold text-white">Rs. {selectedDoctor.price}</p></div>
            <div className="flex items-center gap-2 text-emerald-400"><Video className="h-4 w-4" /><span className="text-sm">{consultationType === "video" ? "Video" : "Offline"}</span></div>
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-400 mb-2">Select Date & Time</label>
          <div className="grid grid-cols-3 gap-2">
            {slots.map(s => { const key = `${s.date}|${s.time}`; return (<button key={key} type="button" onClick={() => setSelectedSlot(key)} className={`rounded-lg border p-2 text-center ${selectedSlot === key ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-white/10 bg-white/5 text-gray-300"}`}><p className="text-sm font-medium">{s.date}</p><p className="text-xs">{s.time}</p></button>); })}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConsultationType("offline")} className={`rounded-lg border p-2 ${consultationType === "offline" ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-white/10 text-gray-400"}`}>Offline</button>
            <button type="button" onClick={() => setConsultationType("video")} className={`rounded-lg border p-2 ${consultationType === "video" ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" : "border-white/10 text-gray-400"}`}>Video</button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <button type="submit" disabled={submitting || !selectedDoctorId || !selectedSlot} className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60">
          {submitting ? "Booking..." : "Book Appointment"}
        </button>
      </form>
    </main>
  );
}
