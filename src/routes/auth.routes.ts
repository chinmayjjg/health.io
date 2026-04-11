import { Router } from "express";
import {
  doctorOnlyPing,
  getCurrentUser,
  login,
  logout,
  refresh,
  signup,
} from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/auth-rate-limit.middleware";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/signup", authRateLimiter, signup);
authRouter.post("/login", authRateLimiter, login);
authRouter.post("/refresh", authRateLimiter, refresh);
authRouter.post("/logout", logout);

authRouter.get("/me", authenticate, getCurrentUser);
authRouter.get("/doctor-only", authenticate, authorizeRoles("doctor"), doctorOnlyPing);

export default authRouter;
