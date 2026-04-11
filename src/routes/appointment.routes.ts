import { Router } from "express";
import { bookAppointment, getMyAppointments } from "../controllers/appointment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const appointmentRouter = Router();

appointmentRouter.post("/book", authenticate, authorizeRoles("patient"), bookAppointment);
appointmentRouter.get("/my", authenticate, getMyAppointments);

export default appointmentRouter;
