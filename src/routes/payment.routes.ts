import { Router } from "express";
import {
  createPaymentOrder,
  handlePaymentWebhook,
  verifyPayment,
} from "../controllers/payment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";
import { paymentRateLimiter } from "../middleware/route-rate-limit.middleware";

const paymentRouter = Router();

paymentRouter.post(
  "/create-order",
  authenticate,
  authorizeRoles("patient"),
  paymentRateLimiter,
  createPaymentOrder,
);
paymentRouter.post(
  "/verify",
  authenticate,
  authorizeRoles("patient"),
  paymentRateLimiter,
  verifyPayment,
);
paymentRouter.post("/webhook", handlePaymentWebhook);

export default paymentRouter;
