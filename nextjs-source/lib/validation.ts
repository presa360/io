import type { GenerateRequest, Tone, Language } from "@/types/presentation";

const TONES: Tone[] = ["tech", "modern", "strict", "minimal", "premium", "corporate"];
const LANGS: Language[] = ["ru", "en"];

export interface ValidationResult {
  ok: boolean;
  errors: Record<string, string>;
  value?: GenerateRequest;
}

/**
 * Validate and normalise the incoming form payload.
 * Returns typed errors so the API can answer with 400 + field messages.
 */
export function validateRequest(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  const b = (body ?? {}) as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const companyName = str(b.companyName);
  const industry = str(b.industry);
  const presentationGoal = str(b.presentationGoal);
  const targetAudience = str(b.targetAudience);
  const additionalInfo = str(b.additionalInfo);

  if (!companyName) errors.companyName = "Укажите название компании";
  if (!industry) errors.industry = "Укажите сферу бизнеса";
  if (!presentationGoal) errors.presentationGoal = "Укажите цель презентации";
  if (!targetAudience) errors.targetAudience = "Опишите целевую аудиторию";

  let slideCount = Number(b.slideCount);
  if (!Number.isFinite(slideCount)) slideCount = 10;
  slideCount = Math.max(5, Math.min(16, Math.round(slideCount)));

  const tone = (TONES.includes(b.tone as Tone) ? b.tone : "tech") as Tone;
  const language = (LANGS.includes(b.language as Language) ? b.language : "ru") as Language;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    value: {
      companyName,
      industry,
      presentationGoal,
      targetAudience,
      additionalInfo,
      slideCount,
      tone,
      language,
    },
  };
}
