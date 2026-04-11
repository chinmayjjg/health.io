import crypto from "crypto";
import { Request, Response } from "express";
import Razorpay from "razorpay";
import { env } from "../config/env";

const getRazorpayClient = (): Razorpay | null => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
};

export const createPaymentOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { amount, currency = "INR", receipt } = req.body as {
    amount?: number;
    currency?: string;
    receipt?: string;
  };

  if (!amount || Number(amount) <= 0) {
    res.status(400).json({
      success: false,
      message: "amount must be a positive number",
    });
    return;
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    res.status(500).json({
      success: false,
      message: "Razorpay keys are not configured",
    });
    return;
  }

  const options = {
    amount: Math.round(Number(amount) * 100),
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  res.status(201).json({
    success: true,
    order,
  });
};

export const verifyPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({
      success: false,
      message:
        "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
    });
    return;
  }

  if (!env.RAZORPAY_KEY_SECRET) {
    res.status(500).json({
      success: false,
      message: "Razorpay secret is not configured",
    });
    return;
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    res.status(400).json({
      success: false,
      verified: false,
      message: "Invalid payment signature",
    });
    return;
  }

  res.status(200).json({
    success: true,
    verified: true,
    message: "Payment verified successfully",
  });
};
