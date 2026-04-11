import { Router } from "express";
import { bookAppointment } from "../controllers/appointment.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const appointmentRouter = Router();

appointmentRouter.post("/book", authenticate, authorizeRoles("patient"), bookAppointment);

export default appointmentRouter;
