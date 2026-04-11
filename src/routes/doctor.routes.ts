import { Router } from "express";
import {
  addDoctorAvailability,
  createDoctorProfile,
  getDoctorById,
  getDoctors,
  getDoctorSlots,
} from "../controllers/doctor.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const doctorRouter = Router();

doctorRouter.post("/profile", authenticate, authorizeRoles("doctor"), createDoctorProfile);
doctorRouter.post("/availability", authenticate, authorizeRoles("doctor"), addDoctorAvailability);
doctorRouter.get("/", getDoctors);
doctorRouter.get("/:id/slots", getDoctorSlots);
doctorRouter.get("/:id", getDoctorById);

export default doctorRouter;
