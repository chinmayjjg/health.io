import { Router } from "express";
import {
  createDoctorProfile,
  getDoctorById,
  getDoctors,
} from "../controllers/doctor.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const doctorRouter = Router();

doctorRouter.post("/profile", authenticate, authorizeRoles("doctor"), createDoctorProfile);
doctorRouter.get("/", getDoctors);
doctorRouter.get("/:id", getDoctorById);

export default doctorRouter;
