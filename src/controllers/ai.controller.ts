import type { Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { doctorService } from "../services/doctor.service";
import { suggestDoctorSpecialization } from "../services/ai.service";
import { createSuccessResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { suggestDoctorSchema } from "../validators/ai.validator";

const CONFIDENCE_THRESHOLD = 0.6;
const FALLBACK_SPECIALIZATION = "general physician";

export const suggestDoctor = asyncHandler(async (req: Request, res: Response) => {
  const input = suggestDoctorSchema.parse(req.body);

  const rawSuggestion = await suggestDoctorSpecialization(input.symptoms);

  const lowConfidence = rawSuggestion.confidence < CONFIDENCE_THRESHOLD;
  const aiFailed = rawSuggestion.specialization === FALLBACK_SPECIALIZATION;

  const initialSpecialization = lowConfidence
    ? FALLBACK_SPECIALIZATION
    : rawSuggestion.specialization.trim();

  let effectiveSpecialization = initialSpecialization;
  let searchResult = await doctorService.searchDoctors({
    specialization: effectiveSpecialization,
    page: 1,
    limit: 8,
    sortBy: "experience",
    sortOrder: "desc",
  });

  let fallbackApplied = lowConfidence || aiFailed;

  if (searchResult.doctors.length === 0 && effectiveSpecialization !== FALLBACK_SPECIALIZATION) {
    effectiveSpecialization = FALLBACK_SPECIALIZATION;
    searchResult = await doctorService.searchDoctors({
      specialization: FALLBACK_SPECIALIZATION,
      page: 1,
      limit: 8,
      sortBy: "experience",
      sortOrder: "desc",
    });
    fallbackApplied = true;
  }

  res.status(200).json(
    createSuccessResponse(
      {
        input: {
          symptoms: input.symptoms,
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
        count: searchResult.doctors.length,
        doctors: searchResult.doctors,
      },
      "Doctor suggestion generated",
    ),
  );
});
