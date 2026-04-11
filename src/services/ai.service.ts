import Groq from "groq-sdk";
import { env } from "../config/env";

export type DoctorSuggestion = {
  specialization: string;
  confidence: number;
};

const FALLBACK_SUGGESTION: DoctorSuggestion = {
  specialization: "general physician",
  confidence: 0,
};

const groqClient = env.GROQ_API_KEY
  ? new Groq({ apiKey: env.GROQ_API_KEY })
  : null;

const parseSuggestion = (content: string | null): DoctorSuggestion => {
  if (!content) {
    return FALLBACK_SUGGESTION;
  }

  try {
    const parsed = JSON.parse(content) as {
      specialization?: unknown;
      confidence?: unknown;
    };

    const specialization =
      typeof parsed.specialization === "string" && parsed.specialization.trim()
        ? parsed.specialization.trim().toLowerCase()
        : FALLBACK_SUGGESTION.specialization;

    const confidenceValue =
      typeof parsed.confidence === "number" ? parsed.confidence : 0;

    const confidence = Math.max(0, Math.min(1, confidenceValue));

    return {
      specialization,
      confidence,
    };
  } catch {
    return FALLBACK_SUGGESTION;
  }
};

export const suggestDoctorSpecialization = async (
  symptomsText: string,
): Promise<DoctorSuggestion> => {
  if (!symptomsText.trim()) {
    return FALLBACK_SUGGESTION;
  }

  if (!groqClient) {
    return FALLBACK_SUGGESTION;
  }

  const systemPrompt =
    "You are a medical triage classifier. Return ONLY valid JSON with keys specialization and confidence. Confidence must be a number between 0 and 1.";

  const userPrompt = `Symptoms: ${symptomsText}\n\nRespond as JSON only. Example: {"specialization":"dermatologist","confidence":0.82}`;

  try {
    const completion = await groqClient.chat.completions.create({
      model: env.GROQ_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? null;
    return parseSuggestion(content);
  } catch {
    return FALLBACK_SUGGESTION;
  }
};
