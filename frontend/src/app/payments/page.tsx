"use client";

import { FormEvent, useState } from "react";
import { apiAuthPost } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { motion } from "framer-motion";
import {
  CreditCard,
  Hash,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
} from "lucide-react";

type CreateOrderResponse = {
  success: boolean;
  data: {
    appointmentId: string;
    amount: number;
    slotHoldExpiresAt?: string;
    order: {
      id: string;
      amount: number;
      currency: string;
    };
  };
};

type VerifyPaymentResponse = {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
  };
};

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function PaymentsPage() {
  const authorized = useRequireAuth();
  const [appointmentId, setAppointmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePayNow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authorized) {
      setError("You must be signed in to make a payment.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!RAZORPAY_KEY_ID) {
        throw new Error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID in frontend env");
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error("Failed to load Razorpay SDK");
      }

      const createOrderData = await apiAuthPost<CreateOrderResponse>(
        "/api/payments/create-order",
        { appointmentId },
      );

      const razorpay = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: createOrderData.data.order.amount,
        currency: createOrderData.data.order.currency,
        name: "MediCare Hub",
        description: "Appointment Payment",
        order_id: createOrderData.data.order.id,
        notes: {
          appointmentId: createOrderData.data.appointmentId,
        },
        modal: {
          ondismiss: () => {
            setError("Payment popup closed before completion.");
          },
        },
        theme: {
          color: "#10b981",
        },
        handler: async (response) => {
          try {
            const verifyData = await apiAuthPost<VerifyPaymentResponse>(
              "/api/payments/verify",
              {
                appointmentId: createOrderData.data.appointmentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            );

            setSuccess(verifyData.message || "Payment verified successfully.");
            setError("");
          } catch (verifyError) {
            const message =
              verifyError instanceof Error
                ? verifyError.message
                : "Payment verification failed";
            setError(message);
            setSuccess("");
          }
        },
      });

      razorpay.on("payment.failed", (failureResponse) => {
        const message =
          failureResponse.error?.description ||
          failureResponse.error?.reason ||
          "Payment failed";
        setError(message);
        setSuccess("");
      });

      razorpay.open();
    } catch (paymentError) {
      const message =
        paymentError instanceof Error ? paymentError.message : "Unable to start payment";
      setError(message);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white">Payment</h1>
        <p className="mt-2 text-gray-400">Complete your payment securely via Razorpay</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 p-4">
          <Shield className="h-8 w-8 text-emerald-400" />
          <div className="text-left">
            <p className="font-medium text-white">Secure Payment</p>
            <p className="text-sm text-gray-400">Your payment is secured by Razorpay</p>
          </div>
        </div>

        <form onSubmit={handlePayNow} className="space-y-6">
          <div>
            <label
              htmlFor="appointmentId"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Appointment ID
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                id="appointmentId"
                type="text"
                required
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none transition-all focus:border-emerald-500/50"
                placeholder="Paste pending appointment id"
              />
            </div>
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

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
            >
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <p className="text-sm text-emerald-400">{success}</p>
            </motion.div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay with Razorpay
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Powered by Razorpay • Secure and encrypted payment
        </p>
      </motion.div>
    </main>
  );
}
