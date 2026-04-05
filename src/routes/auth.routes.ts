import { Router } from "express";
import {
  doctorOnlyPing,
  getCurrentUser,
  login,
  signup,
} from "../controllers/auth.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);

authRouter.get("/me", authenticate, getCurrentUser);
authRouter.get("/doctor-only", authenticate, authorizeRoles("doctor"), doctorOnlyPing);

export default authRouter;
