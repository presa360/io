import { NextRequest, NextResponse } from "next/server";
import { buildPptxBuffer } from "@/lib/pptx";
import { themeFor } from "@/lib/themes";
import type { Presentation, Tone } from "@/types/presentation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/export-pptx
 * Body: { presentation: Presentation, tone?: Tone }
 * Returns: a .pptx file as an attachment.
 */
export async function POST(req: NextRequest) {
  let body: { presentation?: Presentation; tone?: Tone };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в теле запроса" }, { status: 400 });
  }

  const presentation = body.presentation;
  if (!presentation || !Array.isArray(presentation.slides) || presentation.slides.length === 0) {
    return NextResponse.json({ error: "Отсутствует структура презентации" }, { status: 400 });
  }

  try {
    const theme = themeFor(body.tone ?? "tech");
    const buffer = await buildPptxBuffer(presentation, theme, "Presa");

    const safe =
      (presentation.presentationTitle || "presentation")
        .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
        .trim()
        .slice(0, 40) || "presentation";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safe)}-Presa.pptx"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    console.error("export-pptx failed:", err);
    return NextResponse.json({ error: "Не удалось собрать PPTX-файл" }, { status: 500 });
  }
}
