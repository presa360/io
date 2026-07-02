import PptxGenJS from "pptxgenjs";
import type { Presentation, Theme } from "@/types/presentation";

const hex = (c: string) => (c || "#000000").replace("#", "").toUpperCase();

/**
 * Build a 16:9 corporate PPTX from a Presentation and return a Node Buffer.
 * White background, dark-red headings, grey body, slide numbers in the footer.
 */
export async function buildPptxBuffer(
  presentation: Presentation,
  theme: Theme,
  brand = "Presa"
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in (16:9)
  pptx.author = brand;
  pptx.company = brand;
  pptx.title = presentation.presentationTitle;

  const W = 13.333;
  const H = 7.5;
  const C = {
    bg: hex(theme.bg),
    title: hex(theme.title),
    body: hex(theme.body),
    accent: hex(theme.accent),
    faint: theme.dark ? "A7AEBB" : "9AA2AE",
  };
  const total = presentation.slides.length;

  const footer = (slide: PptxGenJS.Slide, n: number, onDark: boolean) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.62, y: H - 0.62, w: 0.2, h: 0.2,
      fill: { color: C.accent }, rectRadius: 0.04, line: { type: "none" },
    });
    slide.addText(brand, {
      x: 0.86, y: H - 0.7, w: 3, h: 0.36, fontFace: "Arial",
      fontSize: 10, bold: true, color: onDark ? "FFFFFF" : C.title, valign: "middle",
    });
    slide.addText(`${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
      x: W - 2.1, y: H - 0.7, w: 1.5, h: 0.36, fontFace: "Courier New",
      fontSize: 10, color: onDark ? "C9CFDA" : C.faint, align: "right", valign: "middle",
    });
  };

  presentation.slides.forEach((sl) => {
    const slide = pptx.addSlide();
    const layout = sl.layout ?? (sl.slideNumber === 1 ? "title" : "content");

    if (layout === "title") {
      slide.background = { color: C.bg };
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.accent }, line: { type: "none" } });
      slide.addText("PRESENTATION", { x: 0.95, y: 2.5, w: 8, h: 0.4, fontFace: "Courier New", fontSize: 12, color: C.accent, charSpacing: 2, bold: true });
      slide.addText(sl.title, { x: 0.92, y: 2.95, w: 10.5, h: 1.8, fontFace: "Arial", fontSize: 44, bold: true, color: C.title, valign: "top" });
      if (sl.subtitle) slide.addText(sl.subtitle, { x: 0.95, y: 4.7, w: 9, h: 0.9, fontFace: "Arial", fontSize: 18, color: C.body });
      footer(slide, sl.slideNumber, theme.dark);
      return;
    }

    if (layout === "cta") {
      const ctaBg = theme.dark ? C.bg : C.title;
      slide.background = { color: ctaBg };
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.accent }, line: { type: "none" } });
      slide.addText("LET\u2019S TALK", { x: 0.95, y: 1.7, w: 8, h: 0.4, fontFace: "Courier New", fontSize: 12, color: C.accent, charSpacing: 2, bold: true });
      slide.addText(sl.title, { x: 0.92, y: 2.15, w: 10.5, h: 1.2, fontFace: "Arial", fontSize: 40, bold: true, color: "FFFFFF" });
      slide.addText(
        sl.bullets.map((b) => ({ text: b, options: { bullet: { code: "2022", indent: 18 }, color: "E9ECF2", fontSize: 17, paraSpaceAfter: 10 } })),
        { x: 0.95, y: 3.6, w: 9.5, h: 2.6, fontFace: "Arial", valign: "top" }
      );
      slide.addShape(pptx.ShapeType.roundRect, { x: 0.62, y: H - 0.62, w: 0.2, h: 0.2, fill: { color: C.accent }, rectRadius: 0.04, line: { type: "none" } });
      slide.addText(brand, { x: 0.86, y: H - 0.7, w: 3, h: 0.36, fontFace: "Arial", fontSize: 10, bold: true, color: "FFFFFF", valign: "middle" });
      slide.addText(`${String(sl.slideNumber).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, { x: W - 2.1, y: H - 0.7, w: 1.5, h: 0.36, fontFace: "Courier New", fontSize: 10, color: "C9CFDA", align: "right", valign: "middle" });
      return;
    }

    // content
    slide.background = { color: C.bg };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.accent }, line: { type: "none" } });
    slide.addText(String(sl.slideNumber).padStart(2, "0"), { x: 0.95, y: 0.78, w: 4, h: 0.36, fontFace: "Courier New", fontSize: 12, color: C.accent, bold: true, charSpacing: 2 });
    slide.addText(sl.title, { x: 0.92, y: 1.2, w: 11.4, h: 1.0, fontFace: "Arial", fontSize: 28, bold: true, color: C.title, valign: "top" });
    slide.addShape(pptx.ShapeType.rect, { x: 0.95, y: 2.15, w: 1.0, h: 0.05, fill: { color: C.accent }, line: { type: "none" } });
    slide.addText(
      sl.bullets.map((b) => ({ text: b, options: { bullet: { code: "25AA", indent: 20 }, color: C.body, fontSize: 16, paraSpaceAfter: 14 } })),
      { x: 0.95, y: 2.55, w: 11.2, h: 3.8, fontFace: "Arial", valign: "top" }
    );
    if (sl.speakerNotes) slide.addNotes(sl.speakerNotes);
    footer(slide, sl.slideNumber, theme.dark);
  });

  // pptxgenjs returns ArrayBuffer/Blob/string depending on outputType
  const out = (await pptx.write({ outputType: "nodebuffer" })) as unknown as Buffer;
  return out;
}
