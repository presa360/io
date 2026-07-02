/* global PptxGenJS */
// Real client-side PPTX export. Builds a 16:9 corporate deck from the
// generated JSON, themed to match the on-screen preview.
(function () {
  const hex = (c) => (c || '#000000').replace('#', '').toUpperCase();

  function exportPPTX(presentation, theme, brandName) {
    if (typeof PptxGenJS === 'undefined') throw new Error('PptxGenJS не загружен');
    const t = theme;
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';        // 13.333 x 7.5 in (16:9)
    pptx.author = 'Presa';
    pptx.company = brandName || 'Presa';
    pptx.title = presentation.presentationTitle;

    const W = 13.333, H = 7.5;
    const C = {
      bg: hex(t.bg), title: hex(t.title), body: hex(t.body),
      accent: hex(t.accent), faint: t.dark ? 'A7AEBB' : '9AA2AE'
    };
    const isDark = t.dark;

    const addFooter = (slide, n, total, onDark) => {
      // accent mark
      slide.addShape(pptx.ShapeType.roundRect, { x: 0.62, y: H - 0.62, w: 0.2, h: 0.2, fill: { color: C.accent }, rectRadius: 0.04, line: { type: 'none' } });
      slide.addText(brandName || 'Presa', { x: 0.86, y: H - 0.7, w: 3, h: 0.36, fontFace: 'Arial', fontSize: 10, bold: true, color: onDark ? 'FFFFFF' : C.title, align: 'left', valign: 'middle' });
      slide.addText(`${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, { x: W - 2.1, y: H - 0.7, w: 1.5, h: 0.36, fontFace: 'Courier New', fontSize: 10, color: onDark ? 'C9CFDA' : C.faint, align: 'right', valign: 'middle' });
    };

    const total = presentation.slides.length;

    presentation.slides.forEach((sl) => {
      const slide = pptx.addSlide();

      // ---- TITLE ----
      if (sl.layout === 'title') {
        slide.background = { color: C.bg };
        slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.accent }, line: { type: 'none' } });
        slide.addText('PRESENTATION', { x: 0.95, y: 2.5, w: 8, h: 0.4, fontFace: 'Courier New', fontSize: 12, color: C.accent, charSpacing: 2, bold: true });
        slide.addText(sl.title, { x: 0.92, y: 2.95, w: 10.5, h: 1.8, fontFace: 'Arial', fontSize: 44, bold: true, color: C.title, align: 'left', valign: 'top' });
        if (sl.subtitle) slide.addText(sl.subtitle, { x: 0.95, y: 4.7, w: 9, h: 0.9, fontFace: 'Arial', fontSize: 18, color: C.body });
        addFooter(slide, sl.slideNumber, total, isDark);
        return;
      }

      // ---- CTA ----
      if (sl.layout === 'cta') {
        const ctaBg = isDark ? C.bg : C.title;
        slide.background = { color: ctaBg };
        slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.accent }, line: { type: 'none' } });
        slide.addText('LET\u2019S TALK', { x: 0.95, y: 1.7, w: 8, h: 0.4, fontFace: 'Courier New', fontSize: 12, color: C.accent, charSpacing: 2, bold: true });
        slide.addText(sl.title, { x: 0.92, y: 2.15, w: 10.5, h: 1.2, fontFace: 'Arial', fontSize: 40, bold: true, color: 'FFFFFF' });
        slide.addText(
          sl.bullets.map((b) => ({ text: b, options: { bullet: { code: '2022', indent: 18 }, color: 'E9ECF2', fontSize: 17, paraSpaceAfter: 10 } })),
          { x: 0.95, y: 3.6, w: 9.5, h: 2.6, fontFace: 'Arial', valign: 'top' }
        );
        // footer on dark
        slide.addShape(pptx.ShapeType.roundRect, { x: 0.62, y: H - 0.62, w: 0.2, h: 0.2, fill: { color: C.accent }, rectRadius: 0.04, line: { type: 'none' } });
        slide.addText(brandName || 'Presa', { x: 0.86, y: H - 0.7, w: 3, h: 0.36, fontFace: 'Arial', fontSize: 10, bold: true, color: 'FFFFFF', valign: 'middle' });
        slide.addText(`${String(sl.slideNumber).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, { x: W - 2.1, y: H - 0.7, w: 1.5, h: 0.36, fontFace: 'Courier New', fontSize: 10, color: 'C9CFDA', align: 'right', valign: 'middle' });
        return;
      }

      // ---- CONTENT ----
      slide.background = { color: C.bg };
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.16, h: H, fill: { color: C.accent }, line: { type: 'none' } });
      slide.addText(String(sl.slideNumber).padStart(2, '0'), { x: 0.95, y: 0.78, w: 4, h: 0.36, fontFace: 'Courier New', fontSize: 12, color: C.accent, bold: true, charSpacing: 2 });
      slide.addText(sl.title, { x: 0.92, y: 1.2, w: 11.4, h: 1.0, fontFace: 'Arial', fontSize: 28, bold: true, color: C.title, valign: 'top' });
      slide.addShape(pptx.ShapeType.rect, { x: 0.95, y: 2.15, w: 1.0, h: 0.05, fill: { color: C.accent }, line: { type: 'none' } });
      slide.addText(
        sl.bullets.map((b) => ({ text: b, options: { bullet: { code: '25AA', indent: 20 }, color: C.body, fontSize: 16, paraSpaceAfter: 14 } })),
        { x: 0.95, y: 2.55, w: 11.2, h: 3.8, fontFace: 'Arial', valign: 'top' }
      );
      if (sl.speakerNotes) slide.addNotes(sl.speakerNotes);
      addFooter(slide, sl.slideNumber, total, isDark);
    });

    const safe = (presentation.presentationTitle || 'presentation').replace(/[^\p{L}\p{N}\-_ ]/gu, '').trim().slice(0, 40) || 'presentation';
    return pptx.writeFile({ fileName: `${safe} — Presa.pptx` });
  }

  window.exportPPTX = exportPPTX;
})();
