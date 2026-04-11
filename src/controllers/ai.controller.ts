import { Request, Response } from "express";
import { Doctor } from "../models/doctor.model";
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

  const specializationQuery = suggestion.specialization.trim();

  const doctors = await Doctor.find({
    specialization: { $regex: specializationQuery, $options: "i" },
  }).populate("userId", "name email role");

  res.status(200).json({
    success: true,
    input: {
      symptoms,
    },
    suggestion,
    count: doctors.length,
    doctors,
  });
};
