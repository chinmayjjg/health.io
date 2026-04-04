import { Request, Response } from "express";

export const healthCheckController = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Health Consultation API is running",
  });
};
