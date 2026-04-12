"use client";

import { FormEvent, useState } from "react";
import { apiAuthPost } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";

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
        name: "Health Consultation",
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
          color: "#111827",
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
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start payment";
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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Payments</h1>
        <p className="mt-2 text-gray-600">
          Enter appointment ID and complete Razorpay payment.
        </p>
      </header>

      <form onSubmit={handlePayNow} className="space-y-4 rounded-lg border p-5">
        <div>
          <label htmlFor="appointmentId" className="mb-1 block text-sm font-medium">
            Appointment ID
          </label>
          <input
            id="appointmentId"
            type="text"
            required
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            className="w-full rounded-md border px-3 py-2 outline-none focus:border-black"
            placeholder="Paste pending appointment id"
          />
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Preparing Payment..." : "Pay with Razorpay"}
        </button>
      </form>
    </main>
  );
}
