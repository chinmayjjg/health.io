import { Router } from "express";
import { suggestDoctor } from "../controllers/ai.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const aiRouter = Router();

aiRouter.post("/suggest-doctor", authenticate, authorizeRoles("patient"), suggestDoctor);

export default aiRouter;
