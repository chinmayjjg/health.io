import { Router } from "express";
import {
  endConsultation,
  getMeetingLink,
  getSessionStatus,
  startConsultation,
} from "../controllers/consultation.controller";
import { authenticate } from "../middleware/auth.middleware";

const consultationRouter = Router();

consultationRouter.get("/:appointmentId/meeting-link", authenticate, getMeetingLink);
consultationRouter.get("/:appointmentId/status", authenticate, getSessionStatus);
consultationRouter.post("/:appointmentId/start", authenticate, startConsultation);
consultationRouter.post("/:appointmentId/end", authenticate, endConsultation);

export default consultationRouter;
