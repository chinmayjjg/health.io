import { Request, Response } from "express";
import { Doctor } from "../models/doctor.model";
import { suggestDoctorSpecialization } from "../services/ai.service";

const CONFIDENCE_THRESHOLD = 0.6;
const FALLBACK_SPECIALIZATION = "general physician";

export const suggestDoctor = async (req: Request, res: Response): Promise<void> => {
  const { symptoms } = req.body as { symptoms?: string };

  if (!symptoms || !symptoms.trim()) {
    res.status(400).json({
      success: false,
      message: "symptoms is required",
    });
    return;
  }

  const rawSuggestion = await suggestDoctorSpecialization(symptoms);

  const lowConfidence = rawSuggestion.confidence < CONFIDENCE_THRESHOLD;
  const aiFailed = rawSuggestion.specialization === FALLBACK_SPECIALIZATION;

  const initialSpecialization = lowConfidence
    ? FALLBACK_SPECIALIZATION
    : rawSuggestion.specialization.trim();

  let effectiveSpecialization = initialSpecialization;

  let doctors = await Doctor.find({
    specialization: { $regex: effectiveSpecialization, $options: "i" },
  }).populate("userId", "name email role");

  let fallbackApplied = lowConfidence || aiFailed;

  if (doctors.length === 0 && effectiveSpecialization !== FALLBACK_SPECIALIZATION) {
    effectiveSpecialization = FALLBACK_SPECIALIZATION;
    doctors = await Doctor.find({
      specialization: { $regex: FALLBACK_SPECIALIZATION, $options: "i" },
    }).populate("userId", "name email role");
    fallbackApplied = true;
  }

  res.status(200).json({
    success: true,
    input: {
      symptoms,
    },
    suggestion: {
      rawSpecialization: rawSuggestion.specialization,
      confidence: rawSuggestion.confidence,
      threshold: CONFIDENCE_THRESHOLD,
      lowConfidence,
      fallbackApplied,
      fallbackSpecialization: FALLBACK_SPECIALIZATION,
      effectiveSpecialization,
    },
    count: doctors.length,
    doctors,
  });
};
