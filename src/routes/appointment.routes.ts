import { Router } from "express";
import {
  bookAppointment,
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
} from "../controllers/appointment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const appointmentRouter = Router();

appointmentRouter.post("/book", authenticate, authorizeRoles("patient"), bookAppointment);
appointmentRouter.get("/my", authenticate, getMyAppointments);
appointmentRouter.put("/:id/cancel", authenticate, authorizeRoles("patient"), cancelAppointment);
appointmentRouter.put("/:id/reschedule", authenticate, authorizeRoles("patient"), rescheduleAppointment);

export default appointmentRouter;
