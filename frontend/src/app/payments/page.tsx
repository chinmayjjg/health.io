"use client";

import { useState } from "react";
import { apiAuthPost } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { CreditCard, Hash, Shield } from "lucide-react";

export default function PaymentsPage() {
  const authorized = useRequireAuth();
  const [appointmentId, setAppointmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!authorized) return <main className="min-h-screen pt-14 flex items-center justify-center"><p className="text-gray-500">Please login to make payments</p></main>;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!RAZORPAY_KEY) { setError("Razorpay key not configured"); setLoading(false); return; }

    try {
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        await new Promise((r, j) => { script.onload = r; script.onerror = j; });
      }

      const orderData = await apiAuthPost<{ success: boolean; data: { appointmentId: string; order: { id: string; amount: number; currency: string } } }>("/api/payments/create-order", { appointmentId });

      const razorpay = new window.Razorpay({
        key: RAZORPAY_KEY,
        amount: orderData.data.order.amount,
        currency: orderData.data.order.currency,
        name: "MediCare Hub",
        description: "Appointment Payment",
        order_id: orderData.data.order.id,
        theme: { color: "#10b981" },
        handler: async (res: any) => {
          try {
            const verify = await apiAuthPost<{ success: boolean; message: string }>("/api/payments/verify", {
              appointmentId: orderData.data.appointmentId,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });
            setSuccess(verify.message || "Payment successful!");
          } catch { setError("Payment verification failed"); }
        },
      });
      razorpay.open();
    } catch (err) { setError(err instanceof Error ? err.message : "Payment failed"); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen pt-14 px-4 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white">Payment</h1>
      <p className="text-gray-500 mt-1">Complete your payment via Razorpay</p>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
        <Shield className="h-5 w-5 text-emerald-400" />
        <span className="text-sm text-gray-400">Secure payment powered by Razorpay</span>
      </div>

      <form onSubmit={handlePay} className="mt-5 space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Appointment ID</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input type="text" required value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500" placeholder="Enter appointment ID" />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60">
          <CreditCard className="h-4 w-4" />
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
      </form>
    </main>
  );
}
