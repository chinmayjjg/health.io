import { Router } from "express";
import {
  bookAppointment,
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
} from "../controllers/appointment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";
import { bookingRateLimiter } from "../middleware/route-rate-limit.middleware";

const appointmentRouter = Router();

appointmentRouter.post(
  "/book",
  authenticate,
  authorizeRoles("patient"),
  bookingRateLimiter,
  bookAppointment,
);
appointmentRouter.get("/my", authenticate, getMyAppointments);
appointmentRouter.put(
  "/:id/cancel",
  authenticate,
  authorizeRoles("patient"),
  bookingRateLimiter,
  cancelAppointment,
);
appointmentRouter.put(
  "/:id/reschedule",
  authenticate,
  authorizeRoles("patient"),
  bookingRateLimiter,
  rescheduleAppointment,
);

export default appointmentRouter;
