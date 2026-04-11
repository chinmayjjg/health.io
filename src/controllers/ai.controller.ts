import { Request, Response } from "express";
import { suggestDoctorSpecialization } from "../services/ai.service";

export const suggestDoctor = async (req: Request, res: Response): Promise<void> => {
  const { symptoms } = req.body as { symptoms?: string };

  if (!symptoms || !symptoms.trim()) {
    res.status(400).json({
      success: false,
      message: "symptoms is required",
    });
    return;
  }

  const suggestion = await suggestDoctorSpecialization(symptoms);

  res.status(200).json({
    success: true,
    input: {
      symptoms,
    },
    suggestion,
  });
};
