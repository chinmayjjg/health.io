import { Router } from "express";
import { healthCheckController } from "../controllers/health.controller";
import aiRouter from "./ai.routes";
import appointmentRouter from "./appointment.routes";
import authRouter from "./auth.routes";
import doctorRouter from "./doctor.routes";
import paymentRouter from "./payment.routes";

const router = Router();

router.get("/", healthCheckController);
router.use("/api/auth", authRouter);
router.use("/api/doctors", doctorRouter);
router.use("/api/appointments", appointmentRouter);
router.use("/api/payments", paymentRouter);
router.use("/api/ai", aiRouter);

export default router;
