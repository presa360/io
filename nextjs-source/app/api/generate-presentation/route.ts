import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/validation";
import { generatePresentation, AIError } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate-presentation
 * Body: GenerateRequest (form payload)
 * Returns: Presentation JSON, or { error, fields? } with a 4xx/5xx status.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const validation = validateRequest(body);
  if (!validation.ok || !validation.value) {
    return NextResponse.json(
      { error: "Проверьте обязательные поля формы", fields: validation.errors },
      { status: 400 }
    );
  }

  try {
    const presentation = await generatePresentation(validation.value);
    return NextResponse.json(presentation, { status: 200 });
  } catch (err) {
    if (err instanceof AIError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("generate-presentation failed:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка при генерации презентации" },
      { status: 500 }
    );
  }
}
