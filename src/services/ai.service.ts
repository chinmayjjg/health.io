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

const AI_TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000; // 1 second

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

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const attemptSuggestion = async (
  symptomsText: string,
  attempt: number = 1,
): Promise<DoctorSuggestion> => {
  if (!groqClient) {
    return FALLBACK_SUGGESTION;
  }

  const systemPrompt =
    "You are a medical triage classifier. Return ONLY valid JSON with keys specialization and confidence. Confidence must be a number between 0 and 1.";

  const userPrompt = `Symptoms: ${symptomsText}\n\nRespond as JSON only. Example: {"specialization":"dermatologist","confidence":0.82}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const completion = await groqClient.chat.completions.create({
      model: env.GROQ_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const content = completion.choices[0]?.message?.content ?? null;
    return parseSuggestion(content);
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
      return attemptSuggestion(symptomsText, attempt + 1);
    }

    return FALLBACK_SUGGESTION;
  }
};

export const suggestDoctorSpecialization = async (
  symptomsText: string,
): Promise<DoctorSuggestion> => {
  if (!symptomsText.trim()) {
    return FALLBACK_SUGGESTION;
  }

  return attemptSuggestion(symptomsText.trim());
};
