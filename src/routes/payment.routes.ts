import { Router } from "express";
import {
  createPaymentOrder,
  handlePaymentWebhook,
  verifyPayment,
} from "../controllers/payment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const paymentRouter = Router();

paymentRouter.post("/create-order", authenticate, authorizeRoles("patient"), createPaymentOrder);
paymentRouter.post("/verify", authenticate, authorizeRoles("patient"), verifyPayment);
paymentRouter.post("/webhook", handlePaymentWebhook);

export default paymentRouter;
