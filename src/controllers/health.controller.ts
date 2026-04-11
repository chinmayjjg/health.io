import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { createSuccessResponse } from "../utils/api-response";

export const healthCheckController = (req: Request, res: Response): void => {
  res.status(200).json(
    createSuccessResponse(
      {
        status: "ok",
        environment: env.NODE_ENV,
        requestId: req.id,
        uptimeSeconds: Math.round(process.uptime()),
        mongoReadyState: mongoose.connection.readyState,
      },
      "Health Consultation API is running",
    ),
  );
};
