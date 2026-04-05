import { Router } from "express";
import { healthCheckController } from "../controllers/health.controller";
import authRouter from "./auth.routes";
import doctorRouter from "./doctor.routes";

const router = Router();

router.get("/", healthCheckController);
router.use("/api/auth", authRouter);
router.use("/api/doctors", doctorRouter);

export default router;
