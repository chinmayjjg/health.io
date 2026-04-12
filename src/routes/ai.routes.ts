import { Router } from "express";
import { suggestDoctor } from "../controllers/ai.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";
import { aiRateLimiter } from "../middleware/route-rate-limit.middleware";

const aiRouter = Router();

aiRouter.post(
  "/suggest-doctor",
  authenticate,
  authorizeRoles("patient"),
  aiRateLimiter,
  suggestDoctor,
);

export default aiRouter;
