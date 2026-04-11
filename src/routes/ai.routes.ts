import { Router } from "express";
import { suggestDoctor } from "../controllers/ai.controller";

const aiRouter = Router();

aiRouter.post("/suggest-doctor", suggestDoctor);

export default aiRouter;
