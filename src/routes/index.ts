import { Router } from "express";
import { healthCheckController } from "../controllers/health.controller";
import authRouter from "./auth.routes";

const router = Router();

router.get("/", healthCheckController);
router.use("/api/auth", authRouter);

export default router;
