import type { GenerateRequest, Presentation, Slide } from "@/types/presentation";

/** Thrown when the AI provider is not configured or returns bad data. */
export class AIError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "AIError";
    this.status = status;
  }
}

const SYSTEM_PROMPT = `Ты эксперт по корпоративным презентациям, B2B-маркетингу, продажам и структуре коммерческих предложений. Создай логичную, убедительную и профессиональную презентацию для компании. Не используй воду. Пиши ясно, делово, с фокусом на ценность для клиента. Верни только валидный JSON без markdown.`;

function buildUserPrompt(req: GenerateRequest): string {
  const langName = req.language === "en" ? "English" : "Russian";
  return [
    `Сгенерируй структуру презентации на языке: ${langName}.`,
    `Компания: ${req.companyName}`,
    `Сфера бизнеса: ${req.industry}`,
    `Цель презентации: ${req.presentationGoal}`,
    `Целевая аудитория: ${req.targetAudience}`,
    `Стиль/тон: ${req.tone}`,
    `Количество слайдов: ровно ${req.slideCount}`,
    req.additionalInfo ? `Дополнительная информация: ${req.additionalInfo}` : "",
    "",
    "Требования к структуре:",
    "- Первый слайд — титульный (layout: \"title\"), последний — призыв к действию (layout: \"cta\").",
    "- На каждом контентном слайде 3–4 ёмких буллета без воды.",
    "- speakerNotes — короткая подсказка спикеру (1–2 предложения).",
    "- visualSuggestion — короткая рекомендация по визуалу слайда.",
    "",
    "Верни СТРОГО такой JSON (без markdown, без комментариев):",
    `{
  "presentationTitle": "string",
  "presentationSubtitle": "string",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "title|content|cta",
      "title": "string",
      "subtitle": "string (только для титульного)",
      "bullets": ["string", "string", "string"],
      "speakerNotes": "string",
      "visualSuggestion": "string"
    }
  ]
}`,
  ].filter(Boolean).join("\n");
}

/** Extract a JSON object from a model response that may include stray text. */
function extractJSON(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new AIError("Модель вернула невалидный JSON", 502);
  }
}

/** Validate + coerce the model output into a safe Presentation object. */
function normalise(data: unknown, req: GenerateRequest): Presentation {
  const d = data as Record<string, unknown>;
  if (!d || typeof d !== "object" || !Array.isArray(d.slides)) {
    throw new AIError("Структура презентации отсутствует в ответе модели", 502);
  }

  const slides: Slide[] = (d.slides as unknown[]).map((s, i) => {
    const o = (s ?? {}) as Record<string, unknown>;
    const bullets = Array.isArray(o.bullets)
      ? (o.bullets as unknown[]).map((b) => String(b)).filter(Boolean).slice(0, 6)
      : [];
    const layout =
      o.layout === "title" || o.layout === "cta" || o.layout === "content"
        ? o.layout
        : i === 0
        ? "title"
        : "content";
    return {
      slideNumber: i + 1,
      layout,
      title: String(o.title ?? `Слайд ${i + 1}`),
      subtitle: o.subtitle ? String(o.subtitle) : undefined,
      bullets,
      speakerNotes: String(o.speakerNotes ?? ""),
      visualSuggestion: String(o.visualSuggestion ?? ""),
    };
  });

  if (slides.length === 0) throw new AIError("Модель не вернула ни одного слайда", 502);

  return {
    presentationTitle: String(d.presentationTitle ?? req.companyName),
    presentationSubtitle: String(d.presentationSubtitle ?? req.presentationGoal),
    slides,
  };
}

/**
 * Call the configured AI provider (OpenAI-compatible Chat Completions) and
 * return a validated Presentation. Throws AIError with a clear message if the
 * key is missing or the response is malformed.
 */
export async function generatePresentation(req: GenerateRequest): Promise<Presentation> {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const baseURL = process.env.AI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    throw new AIError(
      "AI_API_KEY не задан. Добавьте ключ в .env.local (см. .env.example).",
      503
    );
  }

  let res: Response;
  try {
    res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(req) },
        ],
      }),
    });
  } catch (e) {
    throw new AIError("Не удалось связаться с AI-провайдером", 502);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AIError(
      `AI-провайдер вернул ошибку ${res.status}. ${text.slice(0, 200)}`,
      502
    );
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new AIError("Пустой ответ от модели", 502);

  return normalise(extractJSON(content), req);
}
