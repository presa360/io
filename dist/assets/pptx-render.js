/* global PptxGenJS, PresaPalette, PresaFit, PresaTemplates */
/* ============================================================
   Presa — renderSlideToPptx
   Renders each template's layoutType to native PPTX shapes/text
   so the exported deck matches the on-screen preview composition.
   Mirrors the layout map in slide-layouts.jsx.
   ============================================================ */
(function () {
  const W = 13.333, H = 7.5;
  const M = 0.95;                 // content left margin
  const CW = W - M - 0.92;        // content width
  const hex = (c) => (c || '#000000').replace('#', '').toUpperCase();
  const F = 'Manrope', MONO = 'JetBrains Mono';
  const num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : 0; };
  const normBrand = (b) => (!b || typeof b === 'string')
    ? { name: b || 'Presa', logo: null, logoRatio: null, pageNum: true }
    : { name: b.name || 'Presa', logo: b.logo || null, logoRatio: b.logoRatio || null, pageNum: b.pageNum !== false };

  function bar(pptx, slide, p) {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: H, fill: { color: hex(p.accent) }, line: { type: 'none' } });
  }
  function eyebrow(slide, txt, p, y) {
    slide.addShape('rect', { x: M, y: y + 0.12, w: 0.34, h: 0.03, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText((txt || '').toUpperCase(), { x: M + 0.46, y, w: 7, h: 0.32, fontFace: MONO, fontSize: 11, bold: true, color: hex(p.accent), charSpacing: 2, valign: 'middle' });
  }
  function footer(pptx, slide, p, n, total, brand, onDark) {
    const B = normBrand(brand);
    slide.addText(B.name, { x: 0.62, y: H - 0.68, w: 5, h: 0.36, fontFace: F, fontSize: 12, bold: true, color: onDark ? 'FFFFFF' : hex(p.title), valign: 'middle' });
    if (B.pageNum) slide.addText(`${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, { x: W - 2.1, y: H - 0.68, w: 1.5, h: 0.36, fontFace: MONO, fontSize: 10, color: onDark ? 'C9CFDA' : hex(p.faint), align: 'right', valign: 'middle' });
  }
  // brand logo in a top corner (side mirrors the on-screen layout decision)
  function topLogo(pptx, slide, p, brand, layoutType, onDark) {
    if (['title_band', 'title_editorial', 'title_minimal'].indexOf(layoutType) >= 0) return;
    const B = normBrand(brand);
    const left = ['split_accent', 'side_list', 'title_image_split', 'text_media', 'chart_donut', 'big_stat'].indexOf(layoutType) >= 0;
    if (B.logo) {
      const ratio = B.logoRatio || 1;
      let lh = 0.5, lw = lh * ratio;
      if (lw > 2) { lw = 2; lh = lw / ratio; }
      slide.addImage({ data: B.logo, x: left ? 0.62 : (W - 0.62 - lw), y: 0.5, w: lw, h: lh });
    } else {
      slide.addShape(pptx.ShapeType.roundRect, { x: left ? 0.62 : (W - 0.62 - 0.28), y: 0.5, w: 0.28, h: 0.28, rectRadius: 0.05, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    }
  }
  function title(slide, txt, p, y, size) {
    slide.addText(txt || '', { x: M, y, w: CW, h: 1.0, fontFace: F, fontSize: size || 26, bold: true, color: hex(p.title), valign: 'top', charSpacing: -0.3 });
  }
  // grid x positions
  function cols(n, gap) {
    const w = (CW - gap * (n - 1)) / n;
    return Array.from({ length: n }, (_, i) => ({ x: M + i * (w + gap), w }));
  }

  // ---------------- LAYOUTS ----------------
  const L = {};

  L.title_hero = (c) => {
    const { slide, p, f, dark } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, f.eyebrow || 'PRESENTATION', p, 2.45);
    slide.addText(f.title || '', { x: M - 0.03, y: 2.95, w: 11, h: 1.9, fontFace: F, fontSize: 50, bold: true, color: hex(p.title), valign: 'top', charSpacing: -1 });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: 4.95, w: 8.6, h: 1.0, fontFace: F, fontSize: 19, color: hex(p.body), lineSpacingMultiple: 1.2 });
  };
  L.title_dark = L.title_hero;

  L.title_center = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    slide.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText((f.eyebrow || '').toUpperCase(), { x: 1.5, y: 2.0, w: W - 3, h: 0.35, fontFace: MONO, fontSize: 12, bold: true, color: hex(p.accent), charSpacing: 2, align: 'center' });
    slide.addText(f.title || '', { x: 1.2, y: 2.5, w: W - 2.4, h: 1.6, fontFace: F, fontSize: 48, bold: true, color: hex(p.title), align: 'center', valign: 'top', charSpacing: -1 });
    slide.addShape('rect', { x: W / 2 - 0.4, y: 4.35, w: 0.8, h: 0.06, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    if (f.subtitle) slide.addText(f.subtitle, { x: 2.6, y: 4.6, w: W - 5.2, h: 0.9, fontFace: F, fontSize: 18, color: hex(p.body), align: 'center', lineSpacingMultiple: 1.2 });
  };

  L.title_band = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    const bandH = H * 0.28;
    slide.addShape('rect', { x: 0, y: 0, w: W, h: bandH, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText((f.eyebrow || 'PRESENTATION').toUpperCase(), { x: M, y: bandH / 2 - 0.2, w: 8, h: 0.4, fontFace: MONO, fontSize: 13, bold: true, color: 'FFFFFF', charSpacing: 2, valign: 'middle' });
    if (f.sideLabel) slide.addText(f.sideLabel, { x: W - 4, y: bandH / 2 - 0.2, w: 3, h: 0.4, fontFace: MONO, fontSize: 14, bold: true, color: 'FFFFFF', align: 'right', valign: 'middle' });
    slide.addText(f.title || '', { x: M, y: bandH + 0.85, w: 11.4, h: 1.7, fontFace: F, fontSize: 44, bold: true, color: hex(p.title), valign: 'top', charSpacing: -1 });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: bandH + 2.65, w: 8.6, h: 0.9, fontFace: F, fontSize: 18, color: hex(p.body), lineSpacingMultiple: 1.2 });
  };

  L.title_minimal = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    eyebrow(slide, f.eyebrow || '', p, 0.85);
    slide.addShape(pptx.ShapeType.ellipse, { x: W - 1.35, y: 0.78, w: 0.42, h: 0.42, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText(f.title || '', { x: M, y: 3.6, w: 10.4, h: 1.8, fontFace: F, fontSize: 42, bold: true, color: hex(p.title), valign: 'top', charSpacing: -0.8 });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: 5.35, w: 8, h: 0.9, fontFace: F, fontSize: 17, color: hex(p.body), lineSpacingMultiple: 1.2 });
  };

  L.title_image_full = (c) => {
    const { pptx, slide, p, f, n, total, brand } = c;
    const hasImg = !!f.image;
    slide.background = { color: hasImg ? '000000' : hex(p.panel) };
    if (hasImg) {
      slide.addImage({ data: f.image, x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
      slide.addShape('rect', { x: 0, y: H * 0.42, w: W, h: H * 0.58, fill: { color: '080A0E', transparency: 22 }, line: { type: 'none' } });
    } else {
      slide.addText('🖼', { x: 0, y: H / 2 - 0.7, w: W, h: 0.9, fontSize: 40, align: 'center', color: hex(p.faint) });
    }
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: H, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    const fg = hasImg ? 'FFFFFF' : hex(p.title);
    slide.addShape('rect', { x: M, y: 4.1, w: 0.34, h: 0.03, fill: { color: hasImg ? 'FFFFFF' : hex(p.accent) }, line: { type: 'none' } });
    slide.addText((f.eyebrow || 'PRESENTATION').toUpperCase(), { x: M + 0.46, y: 3.98, w: 7, h: 0.32, fontFace: MONO, fontSize: 12, bold: true, color: hasImg ? 'FFFFFF' : hex(p.accent), charSpacing: 2, valign: 'middle' });
    slide.addText(f.title || '', { x: M - 0.03, y: 4.45, w: 10, h: 1.3, fontFace: F, fontSize: 46, bold: true, color: fg, valign: 'top', charSpacing: -1 });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: 5.85, w: 8, h: 0.8, fontFace: F, fontSize: 18, color: fg, transparency: hasImg ? 16 : 0, lineSpacingMultiple: 1.2 });
    footer(pptx, slide, p, n, total, brand, hasImg);
  };

  L.title_image_split = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    const splitX = W * 0.52;
    eyebrow(slide, f.eyebrow || '', p, 2.35);
    slide.addText(f.title || '', { x: M, y: 2.85, w: splitX - M - 0.4, h: 2.0, fontFace: F, fontSize: 34, bold: true, color: hex(p.title), valign: 'top', charSpacing: -0.6 });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: 4.85, w: splitX - M - 0.4, h: 1.3, fontFace: F, fontSize: 16, color: hex(p.body), lineSpacingMultiple: 1.2 });
    const hasImg = !!f.image;
    if (hasImg) {
      slide.addImage({ data: f.image, x: splitX, y: 0, w: W - splitX, h: H, sizing: { type: 'cover', w: W - splitX, h: H } });
    } else {
      slide.addShape('rect', { x: splitX, y: 0, w: W - splitX, h: H, fill: { color: hex(p.panel) }, line: { type: 'none' } });
      slide.addText('🖼', { x: splitX, y: H / 2 - 0.6, w: W - splitX, h: 0.8, fontSize: 34, align: 'center', color: hex(p.faint) });
    }
    slide.addShape('rect', { x: splitX, y: 0, w: 0.1, h: H, fill: { color: hex(p.accent) }, line: { type: 'none' } });
  };

  L.title_sidebar = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    slide.addShape('rect', { x: 0.82, y: 0.95, w: 0.05, h: H - 1.9, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText(f.sideLabel || 'PRESA · 2026', { x: -1.85, y: H / 2 - 0.25, w: 4, h: 0.5, rotate: 270, fontFace: MONO, fontSize: 11, bold: true, color: hex(p.faint), charSpacing: 3, align: 'center', valign: 'middle' });
    const cx = 1.55;
    slide.addShape('rect', { x: cx, y: 2.62, w: 0.34, h: 0.03, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText((f.eyebrow || 'PRESENTATION').toUpperCase(), { x: cx + 0.46, y: 2.5, w: 7, h: 0.32, fontFace: MONO, fontSize: 11, bold: true, color: hex(p.accent), charSpacing: 2, valign: 'middle' });
    slide.addText(f.title || '', { x: cx, y: 3.0, w: 10.4, h: 2.0, fontFace: F, fontSize: 44, bold: true, color: hex(p.title), valign: 'top', charSpacing: -1 });
    if (f.subtitle) slide.addText(f.subtitle, { x: cx, y: 5.0, w: 7.8, h: 0.9, fontFace: F, fontSize: 18, color: hex(p.body), lineSpacingMultiple: 1.2 });
  };

  L.title_editorial = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    slide.addText((f.eyebrow || 'PRESENTATION').toUpperCase(), { x: M, y: 1.0, w: 7, h: 0.4, fontFace: MONO, fontSize: 13, bold: true, color: hex(p.accent), charSpacing: 2, valign: 'middle' });
    if (f.sideLabel) slide.addText(f.sideLabel, { x: W - 4 - 0.95, y: 1.0, w: 4, h: 0.4, fontFace: MONO, fontSize: 13, color: hex(p.faint), align: 'right', valign: 'middle' });
    slide.addShape('rect', { x: M, y: 1.55, w: CW, h: 0.025, fill: { color: hex(p.border) }, line: { type: 'none' } });
    slide.addText(f.title || '', { x: M - 0.05, y: 2.95, w: 11.4, h: 2.7, fontFace: F, fontSize: 58, bold: true, color: hex(p.title), valign: 'top', charSpacing: -1.4, lineSpacingMultiple: 0.96 });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: 5.75, w: 7, h: 0.8, fontFace: F, fontSize: 18, color: hex(p.body), lineSpacingMultiple: 1.2 });
  };

  L.agenda_grid = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    eyebrow(slide, 'AGENDA', p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const items = f.items || [];
    const ncol = items.length > 3 ? 2 : 1;
    const nrow = Math.ceil(items.length / ncol);
    const gap = 0.25;
    const grid = cols(ncol, gap);
    const top = 2.6, areaH = 4.1;
    const cellH = Math.min(0.95, (areaH - gap * (nrow - 1)) / Math.max(nrow, 1));
    items.forEach((it, i) => {
      const r = Math.floor(i / ncol), cc = i % ncol;
      const x = grid[cc].x, w = grid[cc].w, y = top + r * (cellH + gap);
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: cellH, rectRadius: 0.07, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 1 } });
      slide.addText(String(i + 1).padStart(2, '0'), { x: x + 0.25, y, w: 0.7, h: cellH, fontFace: MONO, fontSize: 16, bold: true, color: hex(p.accent), valign: 'middle' });
      slide.addText(String(it || ''), { x: x + 0.95, y, w: w - 1.15, h: cellH, fontFace: F, fontSize: 14, bold: true, color: hex(p.title), valign: 'middle' });
    });
  };

  L.side_list = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    const px0 = W * 0.64;
    slide.addShape('rect', { x: px0, y: 0, w: W - px0, h: H, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    if (f.sideLabel) slide.addText(String(f.sideLabel).toUpperCase(), { x: px0 + 0.55, y: 0.95, w: W - px0 - 1.1, h: 0.35, fontFace: MONO, fontSize: 12, bold: true, color: 'FFFFFF', charSpacing: 2 });
    slide.addText(f.title || '', { x: px0 + 0.55, y: 1.45, w: W - px0 - 1.1, h: 3.2, fontFace: F, fontSize: 28, bold: true, color: 'FFFFFF', valign: 'top', charSpacing: -0.4, lineSpacingMultiple: 1.05 });
    slide.addShape(pptx.ShapeType.roundRect, { x: px0 + 0.55, y: H - 1.5, w: 0.66, h: 0.66, rectRadius: 0.09, fill: { color: 'FFFFFF', transparency: 82 }, line: { type: 'none' } });
    const items = f.items || [];
    const y0 = 1.4, rowH = Math.min(1.05, 4.7 / Math.max(items.length, 1));
    items.forEach((it, i) => {
      const y = y0 + i * rowH;
      slide.addText(String(i + 1).padStart(2, '0'), { x: M, y, w: 0.8, h: rowH, fontFace: MONO, fontSize: 17, bold: true, color: hex(p.accent), valign: 'top' });
      slide.addText(String(it || ''), { x: M + 0.9, y, w: px0 - M - 1.3, h: rowH, fontFace: F, fontSize: 16, bold: true, color: hex(p.title), valign: 'top' });
    });
  };

  L.split_accent = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    const splitX = W * 0.62;
    eyebrow(slide, f.eyebrow || '', p, 2.4);
    slide.addText(f.title || '', { x: M, y: 2.9, w: splitX - M - 0.4, h: 2.0, fontFace: F, fontSize: 38, bold: true, color: hex(p.title), valign: 'top', charSpacing: -0.6 });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: 4.9, w: splitX - M - 0.4, h: 1.2, fontFace: F, fontSize: 17, color: hex(p.body), lineSpacingMultiple: 1.2 });
    slide.addShape(pptx.ShapeType.rect, { x: splitX, y: 0, w: W - splitX, h: H, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addShape(pptx.ShapeType.roundRect, { x: splitX + 0.7, y: 0.9, w: 0.8, h: 0.8, rectRadius: 0.1, fill: { color: 'FFFFFF', transparency: 82 }, line: { type: 'none' } });
    if (f.sideLabel) slide.addText(f.sideLabel, { x: splitX + 0.7, y: H - 1.6, w: W - splitX - 1.2, h: 0.5, fontFace: MONO, fontSize: 15, bold: true, color: 'FFFFFF' });
  };

  L.bullets = (c) => {
    const { slide, p, f, n } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, String(n).padStart(2, '0'), p, 0.85);
    title(slide, f.title, p, 1.35, 30);
    slide.addShape('rect', { x: M, y: 2.35, w: 0.9, h: 0.05, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    const items = (f.bullets || []).map((b) => ({ text: b, options: { bullet: { code: '25AA', indent: 22 }, color: hex(p.body), fontSize: 17, paraSpaceAfter: 13, lineSpacingMultiple: 1.15 } }));
    if (items.length) slide.addText(items, { x: M, y: 2.7, w: CW * 0.92, h: 3.7, fontFace: F, valign: 'top' });
  };

  L.text_bullets = (c) => {
    const { slide, p, f, n } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, String(n).padStart(2, '0'), p, 0.85);
    title(slide, f.title, p, 1.35, 30);
    slide.addShape('rect', { x: M, y: 2.35, w: 0.9, h: 0.05, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    let y = 2.7;
    if (f.text) { slide.addText(f.text, { x: M, y: y, w: CW * 0.9, h: 1.4, fontFace: F, fontSize: 17, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.3 }); y += 1.55; }
    const bl = (f.bullets || []).filter((b) => String(b).trim() !== '');
    if (bl.length) {
      const items = bl.map((b) => ({ text: b, options: { bullet: { code: '25AA', indent: 22 }, color: hex(p.title), bold: true, fontSize: 15, paraSpaceAfter: 11, lineSpacingMultiple: 1.15 } }));
      slide.addText(items, { x: M, y: y, w: CW * 0.92, h: 6.4 - y, fontFace: F, valign: 'top' });
    }
  };

  L.agenda = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'AGENDA', p, 0.85);
    title(slide, f.title, p, 1.35, 30);
    const items = f.items || [];
    const y0 = 2.75, rowH = Math.min(0.78, 3.7 / Math.max(items.length, 1));
    items.forEach((it, i) => {
      const y = y0 + i * rowH;
      slide.addText(String(i + 1).padStart(2, '0'), { x: M, y, w: 0.8, h: rowH, fontFace: MONO, fontSize: 18, bold: true, color: hex(p.accent), valign: 'top' });
      slide.addText(it, { x: M + 0.85, y, w: CW - 0.85, h: rowH, fontFace: F, fontSize: 17, color: hex(p.title), valign: 'top' });
    });
  };

  // build an SVG data-URI for a curated icon, so it can be embedded as an image
  function iconUri(name, colorHex) {
    const set = (window.PresaIcons) || {};
    const paths = set[name] || set.spark || [];
    const inner = paths.map((d) => `<path d="${d}"/>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }

  // count-aware rectangles for service cards (mirrors the on-screen engine)
  function svcRects(n, top, areaH, gap) {
    const fw = CW;
    if (n <= 1) return [{ x: M, y: top, w: fw, h: areaH }];
    if (n === 2) { const w = (fw - gap) / 2; return [0, 1].map((i) => ({ x: M + i * (w + gap), y: top, w, h: areaH })); }
    if (n === 3) { const lw = fw * 0.42, rw = fw - lw - gap, rh = (areaH - gap) / 2; return [{ x: M, y: top, w: lw, h: areaH }, { x: M + lw + gap, y: top, w: rw, h: rh }, { x: M + lw + gap, y: top + rh + gap, w: rw, h: rh }]; }
    if (n === 4) { const w = (fw - gap) / 2, hh = (areaH - gap) / 2, o = []; for (let i = 0; i < 4; i++) { const r = Math.floor(i / 2), c = i % 2; o.push({ x: M + c * (w + gap), y: top + r * (hh + gap), w, h: hh }); } return o; }
    if (n === 5) { const hh = (areaH - gap) / 2, w2 = (fw - gap) / 2, w3 = (fw - 2 * gap) / 3, o = [{ x: M, y: top, w: w2, h: hh }, { x: M + w2 + gap, y: top, w: w2, h: hh }]; for (let i = 0; i < 3; i++) o.push({ x: M + i * (w3 + gap), y: top + hh + gap, w: w3, h: hh }); return o; }
    const hh = (areaH - gap) / 2, w3 = (fw - 2 * gap) / 3, o = []; for (let i = 0; i < 6; i++) { const r = Math.floor(i / 3), c = i % 3; o.push({ x: M + c * (w3 + gap), y: top + r * (hh + gap), w: w3, h: hh }); } return o;
  }
  function svcTierP(n) {
    if (n <= 2) return { pad: 0.42, badge: 1.0, hSize: 22, tSize: 14, clamp: 6, mSize: 11 };
    if (n === 3) return { pad: 0.34, badge: 0.82, hSize: 18, tSize: 12.5, clamp: 5, mSize: 10 };
    if (n === 4) return { pad: 0.3, badge: 0.72, hSize: 16, tSize: 12, clamp: 4, mSize: 9.5 };
    return { pad: 0.24, badge: 0.6, hSize: 13.5, tSize: 10.5, clamp: 3, mSize: 9 };
  }

  L.service_icons = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'SERVICES', p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const cards = (f.cards || []).slice(0, 6);
    const n = cards.length;
    const top = 2.55, areaH = 4.15, gap = 0.26;
    const rects = svcRects(n, top, areaH, gap);
    const t = svcTierP(n);
    cards.forEach((card, i) => {
      const { x, y, w, h } = rects[i];
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 1 } });
      slide.addShape(pptx.ShapeType.roundRect, { x: x + t.pad, y: y + t.pad, w: t.badge, h: t.badge, rectRadius: 0.12, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      slide.addImage({ data: iconUri(card.icon, '#FFFFFF'), x: x + t.pad + t.badge * 0.22, y: y + t.pad + t.badge * 0.22, w: t.badge * 0.56, h: t.badge * 0.56 });
      const ty = y + t.pad + t.badge + 0.28;
      slide.addText(card.heading || '', { x: x + t.pad, y: ty, w: w - t.pad * 2, h: 0.5, fontFace: F, fontSize: t.hSize, bold: true, color: hex(p.title), valign: 'top' });
      if (card.text) slide.addText(card.text, { x: x + t.pad, y: ty + 0.5, w: w - t.pad * 2, h: h - (ty - y) - 0.95, fontFace: F, fontSize: t.tSize, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.18 });
      slide.addText(`${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, { x: x + t.pad, y: y + h - 0.46, w: w - t.pad * 2, h: 0.32, fontFace: MONO, fontSize: t.mSize, bold: true, color: hex(p.faint), valign: 'middle' });
    });
  };

  L.service_photos = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'SERVICES', p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const cards = (f.cards || []).slice(0, 6);
    const n = cards.length;
    const top = 2.55, areaH = 4.15, gap = 0.28;
    const rects = svcRects(n, top, areaH, gap);
    const t = svcTierP(n);
    cards.forEach((card, i) => {
      const { x, y, w, h } = rects[i];
      const big = (n === 3 && i === 0) || n <= 2;
      const imgH = Math.min(big ? h * 0.62 : h * 0.5, h - 1.1);
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 1 } });
      if (card.image) slide.addImage({ data: card.image, x, y, w, h: imgH, sizing: { type: 'cover', w, h: imgH } });
      else slide.addShape('rect', { x, y, w, h: imgH, fill: { color: hex(p.bg) }, line: { type: 'none' } });
      slide.addShape('rect', { x, y, w: 0.07, h: imgH, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      const ty = y + imgH + 0.22;
      slide.addText(card.heading || '', { x: x + t.pad, y: ty, w: w - t.pad * 2, h: 0.42, fontFace: F, fontSize: t.hSize, bold: true, color: hex(p.title), valign: 'top' });
      if (card.text) slide.addText(card.text, { x: x + t.pad, y: ty + 0.44, w: w - t.pad * 2, h: h - imgH - 0.72, fontFace: F, fontSize: t.tSize, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.12 });
    });
  };

  L.cards = (c) => {
    const { pptx, slide, p, f, n } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, String(n).padStart(2, '0'), p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const cards = f.cards || [];
    const nc = cards.length;
    const ncol = nc <= 3 ? Math.max(nc, 1) : nc === 4 ? 2 : nc <= 6 ? 3 : nc <= 8 ? 4 : 5;
    const nrow = Math.ceil(nc / ncol);
    const gap = 0.24;
    const grid = cols(ncol, gap);
    const top = 2.6, areaH = 4.1;
    const cardH = (areaH - gap * (nrow - 1)) / Math.max(nrow, 1);
    const dense = ncol >= 4;
    const padX = dense ? 0.22 : 0.28;
    const hSize = dense ? 13 : 16;
    const tSize = dense ? 10.5 : 12.5;
    cards.forEach((card, i) => {
      const r = Math.floor(i / ncol), cc = i % ncol;
      const x = grid[cc].x, w = grid[cc].w, y = top + r * (cardH + gap);
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: cardH, rectRadius: 0.08, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 1 } });
      slide.addShape('rect', { x: x + padX, y: y + 0.26, w: 0.42, h: 0.07, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      slide.addText(card.heading || '', { x: x + padX, y: y + 0.44, w: w - padX * 2, h: 0.5, fontFace: F, fontSize: hSize, bold: true, color: hex(p.title), valign: 'top' });
      if (card.text) slide.addText(card.text, { x: x + padX, y: y + 0.94, w: w - padX * 2, h: cardH - 1.12, fontFace: F, fontSize: tSize, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.12 });
    });
  };

  L.text_stats = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, '01', p, 1.35);
    title(slide, f.title, p, 1.85, 28);
    if (f.text) slide.addText(f.text, { x: M, y: 2.9, w: CW * 0.82, h: 1.4, fontFace: F, fontSize: 16, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.25 });
    const stats = f.stats || [];
    const sw = 2.9, y = 4.7;
    stats.forEach((s, i) => {
      const x = M + i * sw;
      slide.addText(s.value || '', { x, y, w: sw - 0.3, h: 0.8, fontFace: F, fontSize: 40, bold: true, color: hex(p.accent), valign: 'top', charSpacing: -0.6 });
      slide.addText(s.label || '', { x, y: y + 0.82, w: sw - 0.3, h: 0.5, fontFace: F, fontSize: 13, color: hex(p.body), valign: 'top' });
    });
  };

  L.stats_row = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'METRICS', p, 1.35);
    title(slide, f.title, p, 1.85, 28);
    const stats = f.stats || [];
    const grid = cols(Math.max(stats.length, 1), 0.3);
    const y = 3.6;
    stats.forEach((s, i) => {
      const { x, w } = grid[i];
      slide.addShape('rect', { x, y, w: 0.06, h: 1.5, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      slide.addText(s.value || '', { x: x + 0.24, y: y - 0.1, w: w - 0.24, h: 0.95, fontFace: F, fontSize: 46, bold: true, color: hex(p.title), valign: 'top', charSpacing: -1 });
      slide.addText(s.label || '', { x: x + 0.24, y: y + 0.95, w: w - 0.24, h: 0.5, fontFace: F, fontSize: 13, color: hex(p.body), valign: 'top' });
    });
    if (f.note) slide.addText(f.note, { x: M, y: 5.7, w: CW, h: 0.4, fontFace: MONO, fontSize: 11, color: hex(p.faint) });
  };

  L.big_stat = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    slide.addText(f.statValue || '', { x: M - 0.05, y: 2.0, w: 6, h: 2.6, fontFace: F, fontSize: 120, bold: true, color: hex(p.accent), valign: 'middle', charSpacing: -2 });
    slide.addText(f.statLabel || '', { x: M, y: 4.5, w: 5.4, h: 1.2, fontFace: F, fontSize: 20, bold: true, color: hex(p.title), valign: 'top', lineSpacingMultiple: 1.1 });
    const bl = f.bullets || [];
    if (bl.length) {
      slide.addShape('rect', { x: 7.2, y: 2.4, w: 0.02, h: 2.7, fill: { color: hex(p.border) }, line: { type: 'none' } });
      const items = bl.map((b) => ({ text: b, options: { bullet: { code: '25AA', indent: 20 }, color: hex(p.body), fontSize: 16, paraSpaceAfter: 14, lineSpacingMultiple: 1.15 } }));
      slide.addText(items, { x: 7.5, y: 2.5, w: 4.6, h: 2.6, fontFace: F, valign: 'top' });
    }
  };

  L.quote = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    slide.addText('\u201C', { x: M - 0.1, y: 1.2, w: 2, h: 1.6, fontFace: 'Georgia', fontSize: 110, bold: true, color: hex(p.accent), valign: 'top' });
    slide.addText(f.quote || '', { x: M, y: 2.7, w: CW * 0.86, h: 2.4, fontFace: F, fontSize: 28, bold: true, color: hex(p.title), valign: 'top', charSpacing: -0.4, lineSpacingMultiple: 1.2 });
    if (f.author || f.role) {
      slide.addShape('rect', { x: M, y: 5.55, w: 0.42, h: 0.045, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      slide.addText([
        { text: f.author || '', options: { bold: true, color: hex(p.title) } },
        f.role ? { text: '   ·  ' + f.role, options: { color: hex(p.body) } } : { text: '' }
      ], { x: M + 0.6, y: 5.4, w: CW - 0.6, h: 0.4, fontFace: F, fontSize: 15, valign: 'middle' });
    }
  };

  L.text_media = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, '01', p, 1.5);
    title(slide, f.title, p, 2.0, 26);
    if (f.text) slide.addText(f.text, { x: M, y: 3.1, w: 5.3, h: 3.0, fontFace: F, fontSize: 16, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.3 });
    const ix = 7.4, iy = 1.6, iw = W - ix - 0.95, ih = H - iy - 1.5;
    if (f.image) {
      slide.addImage({ data: f.image, x: ix, y: iy, w: iw, h: ih, sizing: { type: 'cover', w: iw, h: ih } });
      if (f.imageLabel) slide.addText(f.imageLabel, { x: ix + 0.15, y: iy + ih - 0.5, w: iw - 0.3, h: 0.35, fontFace: MONO, fontSize: 10, color: 'FFFFFF', fill: { color: '0E1116', transparency: 28 }, align: 'center', valign: 'middle' });
    } else {
      slide.addShape(pptx.ShapeType.roundRect, { x: ix, y: iy, w: iw, h: ih, rectRadius: 0.08, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 1, dashType: 'dash' } });
      slide.addText('🖼', { x: ix, y: iy + ih / 2 - 0.6, w: iw, h: 0.8, fontSize: 30, align: 'center', color: hex(p.faint) });
      if (f.imageLabel) slide.addText(f.imageLabel, { x: ix, y: iy + ih / 2 + 0.2, w: iw, h: 0.4, fontFace: MONO, fontSize: 12, align: 'center', color: hex(p.faint) });
    }
  };

  L.steps = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'PROCESS', p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const steps = f.steps || [];
    const y0 = 2.7, rowH = Math.min(1.05, 3.9 / Math.max(steps.length, 1));
    steps.forEach((s, i) => {
      const y = y0 + i * rowH;
      slide.addShape(pptx.ShapeType.ellipse, { x: M, y, w: 0.62, h: 0.62, fill: { color: hex(p.accentSoft) }, line: { type: 'none' } });
      slide.addText(String(i + 1), { x: M, y, w: 0.62, h: 0.62, fontFace: F, fontSize: 18, bold: true, color: hex(p.accent), align: 'center', valign: 'middle' });
      slide.addText(s.title || '', { x: M + 0.85, y: y - 0.04, w: CW - 0.85, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: hex(p.title), valign: 'top' });
      if (s.desc) slide.addText(s.desc, { x: M + 0.85, y: y + 0.34, w: CW - 0.85, h: rowH - 0.4, fontFace: F, fontSize: 13, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.1 });
    });
  };

  L.timeline = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'TIMELINE', p, 1.35);
    title(slide, f.title, p, 1.85, 28);
    const ms = f.milestones || [];
    const grid = cols(Math.max(ms.length, 1), 0.25);
    const lineY = 3.9;
    slide.addShape('rect', { x: M + 0.1, y: lineY, w: CW - 0.2, h: 0.03, fill: { color: hex(p.border) }, line: { type: 'none' } });
    ms.forEach((m, i) => {
      const { x, w } = grid[i];
      slide.addShape(pptx.ShapeType.ellipse, { x: x, y: lineY - 0.13, w: 0.3, h: 0.3, fill: { color: hex(p.accent) }, line: { color: hex(p.bg), width: 3 } });
      slide.addText(m.title || '', { x: x, y: lineY + 0.35, w: w, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: hex(p.title), valign: 'top' });
      if (m.desc) slide.addText(m.desc, { x: x, y: lineY + 0.78, w: w, h: 1.2, fontFace: F, fontSize: 12.5, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.1 });
    });
  };

  L.pricing = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'PRICING', p, 0.85);
    title(slide, f.title, p, 1.35, 26);
    const tiers = f.tiers || [];
    const grid = cols(Math.max(tiers.length, 1), 0.28);
    const y = 2.7, cardH = 4.0;
    tiers.forEach((t, i) => {
      const { x, w } = grid[i];
      const hi = tiers.length === 3 ? i === 1 : i === tiers.length - 1;
      slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: cardH, rectRadius: 0.08, fill: { color: hi ? hex(p.accent) : hex(p.panel) }, line: { color: hi ? hex(p.accent) : hex(p.border), width: 1 } });
      const fg = hi ? 'FFFFFF' : hex(p.title), bd = hi ? 'FFFFFF' : hex(p.body);
      slide.addText(t.name || '', { x: x + 0.3, y: y + 0.32, w: w - 0.6, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: fg, transparency: hi ? 10 : 0 });
      slide.addText(t.price || '', { x: x + 0.3, y: y + 0.74, w: w - 0.6, h: 0.7, fontFace: F, fontSize: 28, bold: true, color: fg, charSpacing: -0.5 });
      const feats = (t.features || []).map((ft) => ({ text: ft, options: { bullet: { code: '2713', indent: 18 }, color: bd, fontSize: 13, paraSpaceAfter: 9, lineSpacingMultiple: 1.1 } }));
      if (feats.length) slide.addText(feats, { x: x + 0.3, y: y + 1.6, w: w - 0.6, h: cardH - 1.8, fontFace: F, valign: 'top' });
    });
  };

  L.compare = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'COMPARE', p, 0.85);
    title(slide, f.title, p, 1.35, 26);
    const rows = f.rows || [];
    const top = 2.7, c0 = M, c1w = CW * 0.42, c23w = CW * 0.29;
    const rowH = Math.min(0.62, 3.8 / (rows.length + 1));
    // header
    slide.addShape('rect', { x: c0, y: top, w: c1w, h: rowH, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 0.75 } });
    slide.addShape('rect', { x: c0 + c1w, y: top, w: c23w, h: rowH, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText(f.leftLabel || 'Вы', { x: c0 + c1w, y: top, w: c23w, h: rowH, fontFace: F, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    slide.addShape('rect', { x: c0 + c1w + c23w, y: top, w: c23w, h: rowH, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 0.75 } });
    slide.addText(f.rightLabel || 'Другие', { x: c0 + c1w + c23w, y: top, w: c23w, h: rowH, fontFace: F, fontSize: 14, bold: true, color: hex(p.title), align: 'center', valign: 'middle' });
    rows.forEach((r, i) => {
      const y = top + rowH * (i + 1);
      slide.addShape('rect', { x: c0, y, w: c1w, h: rowH, fill: { color: hex(p.bg) }, line: { color: hex(p.border), width: 0.75 } });
      slide.addText(r.label || '', { x: c0 + 0.2, y, w: c1w - 0.3, h: rowH, fontFace: F, fontSize: 13, bold: true, color: hex(p.title), valign: 'middle' });
      slide.addShape('rect', { x: c0 + c1w, y, w: c23w, h: rowH, fill: { color: hex(p.accentSoft) }, line: { color: hex(p.border), width: 0.75 } });
      slide.addText(r.left || '', { x: c0 + c1w, y, w: c23w, h: rowH, fontFace: F, fontSize: 13, bold: true, color: hex(p.title), align: 'center', valign: 'middle' });
      slide.addShape('rect', { x: c0 + c1w + c23w, y, w: c23w, h: rowH, fill: { color: hex(p.bg) }, line: { color: hex(p.border), width: 0.75 } });
      slide.addText(r.right || '', { x: c0 + c1w + c23w, y, w: c23w, h: rowH, fontFace: F, fontSize: 13, color: hex(p.body), align: 'center', valign: 'middle' });
    });
  };

  L.team = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'TEAM', p, 1.35);
    title(slide, f.title, p, 1.85, 28);
    const ms = f.members || [];
    const ncol = ms.length <= 3 ? Math.max(ms.length, 1) : (ms.length === 4 ? 4 : 3);
    const grid = cols(ncol, 0.3);
    const top = 3.5, av = 1.2;
    ms.forEach((m, i) => {
      const r = Math.floor(i / ncol), cc = i % ncol;
      const { x } = grid[cc], y = top + r * 1.9;
      slide.addShape(pptx.ShapeType.ellipse, { x, y, w: av, h: av, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      slide.addText((m.name || '?').trim().charAt(0), { x, y, w: av, h: av, fontFace: F, fontSize: 26, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      slide.addText(m.name || '', { x: x, y: y + av + 0.08, w: grid[cc].w, h: 0.36, fontFace: F, fontSize: 15, bold: true, color: hex(p.title), valign: 'top' });
      if (m.role) slide.addText(m.role, { x: x, y: y + av + 0.44, w: grid[cc].w, h: 0.32, fontFace: F, fontSize: 12.5, bold: true, color: hex(p.accent), valign: 'top' });
    });
  };

  L.cta = (c) => {
    const { pptx, slide, p, f, n, total, brand } = c;
    const ctaBg = p.dark ? hex(p.bg) : hex(p.title);
    slide.background = { color: ctaBg };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: H, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addShape('rect', { x: M, y: 1.62, w: 0.34, h: 0.03, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    slide.addText('LET\u2019S TALK', { x: M + 0.46, y: 1.5, w: 7, h: 0.32, fontFace: MONO, fontSize: 11, bold: true, color: hex(p.accent), charSpacing: 2, valign: 'middle' });
    slide.addText(f.title || '', { x: M, y: 2.0, w: 10.5, h: 1.3, fontFace: F, fontSize: 42, bold: true, color: 'FFFFFF', charSpacing: -0.8, valign: 'top' });
    if (f.subtitle) slide.addText(f.subtitle, { x: M, y: 3.3, w: 8.6, h: 0.8, fontFace: F, fontSize: 18, color: 'FFFFFF', transparency: 30 });
    const items = f.bullets || [];
    let bx = M;
    items.forEach((b) => {
      const wpx = 0.34 + (String(b).length * 0.105) + 0.4;
      slide.addShape(pptx.ShapeType.roundRect, { x: bx, y: 4.35, w: wpx, h: 0.52, rectRadius: 0.26, fill: { color: 'FFFFFF', transparency: 90 }, line: { color: 'FFFFFF', width: 0.75, transparency: 80 } });
      slide.addText(b, { x: bx, y: 4.35, w: wpx, h: 0.52, fontFace: F, fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      bx += wpx + 0.18;
    });
    if (f.buttonLabel) {
      slide.addShape(pptx.ShapeType.roundRect, { x: M, y: 5.25, w: 0.5 + f.buttonLabel.length * 0.12, h: 0.6, rectRadius: 0.1, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      slide.addText(f.buttonLabel, { x: M, y: 5.25, w: 0.5 + f.buttonLabel.length * 0.12, h: 0.6, fontFace: F, fontSize: 15, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    }
    // footer (dark)
    const FB = c.brand && typeof c.brand === 'object' ? c.brand : normBrand(c.brand);
    let ftx = 0.88;
    if (FB.logo) {
      const ratio = FB.logoRatio || 1;
      let lh = 0.3, lw = lh * ratio;
      if (lw > 1.4) { lw = 1.4; lh = lw / ratio; }
      slide.addImage({ data: FB.logo, x: 0.62, y: H - 0.5 - lh / 2, w: lw, h: lh });
      ftx = 0.62 + lw + 0.1;
    } else {
      slide.addShape(pptx.ShapeType.roundRect, { x: 0.62, y: H - 0.6, w: 0.2, h: 0.2, rectRadius: 0.04, fill: { color: hex(p.accent) }, line: { type: 'none' } });
    }
    slide.addText(FB.name, { x: ftx, y: H - 0.68, w: 3, h: 0.36, fontFace: F, fontSize: 10, bold: true, color: 'FFFFFF', valign: 'middle' });
    if (FB.pageNum) slide.addText(`${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, { x: W - 2.1, y: H - 0.68, w: 1.5, h: 0.36, fontFace: MONO, fontSize: 10, color: 'C9CFDA', align: 'right', valign: 'middle' });
  };

  /* ---- charts & table (native PPTX objects) ---- */
  L.chart_bar = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    eyebrow(slide, 'DATA', p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const data = f.data || [];
    slide.addChart(pptx.ChartType.bar, [{ name: f.title || 'Данные', labels: data.map((d) => String(d.label || '')), values: data.map((d) => num(d.value)) }], {
      x: M, y: 2.45, w: CW, h: 3.95,
      barDir: 'col', chartColors: [hex(p.accent)], barGapWidthPct: 60,
      showValue: true, dataLabelColor: hex(p.title), dataLabelFontSize: 12, dataLabelFontFace: F, dataLabelPosition: 'outEnd',
      catAxisLabelColor: hex(p.body), catAxisLabelFontSize: 11, catAxisLabelFontFace: MONO, catAxisLineColor: hex(p.border),
      valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
      showLegend: false, showTitle: false
    });
    if (f.note) slide.addText(f.note, { x: M, y: 6.55, w: CW, h: 0.35, fontFace: MONO, fontSize: 11, color: hex(p.faint) });
  };

  L.chart_line = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    eyebrow(slide, 'TREND', p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const data = f.data || [];
    slide.addChart(pptx.ChartType.line, [{ name: f.title || 'Динамика', labels: data.map((d) => String(d.label || '')), values: data.map((d) => num(d.value)) }], {
      x: M, y: 2.45, w: CW, h: 3.95,
      chartColors: [hex(p.accent)], lineSize: 2.5, lineSmooth: false,
      lineDataSymbol: 'circle', lineDataSymbolSize: 7,
      showValue: true, dataLabelColor: hex(p.title), dataLabelFontSize: 11, dataLabelFontFace: F, dataLabelPosition: 't',
      catAxisLabelColor: hex(p.body), catAxisLabelFontSize: 11, catAxisLabelFontFace: MONO, catAxisLineColor: hex(p.border),
      valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
      showLegend: false, showTitle: false
    });
    if (f.note) slide.addText(f.note, { x: M, y: 6.55, w: CW, h: 0.35, fontFace: MONO, fontSize: 11, color: hex(p.faint) });
  };

  L.chart_donut = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    eyebrow(slide, 'SHARE', p, 0.85);
    title(slide, f.title, p, 1.35, 28);
    const data = f.data || [];
    const palette = [hex(p.accent), hex(p.title), hex(p.faint), 'F0A8A4', 'C9CFDA', '8A4540'];
    slide.addChart(pptx.ChartType.doughnut, [{ name: f.title || 'Доли', labels: data.map((d) => String(d.label || '')), values: data.map((d) => num(d.value)) }], {
      x: M, y: 2.4, w: CW, h: 4.1,
      holeSize: 55, chartColors: palette.slice(0, Math.max(data.length, 1)),
      showLegend: true, legendPos: 'r', legendColor: hex(p.title), legendFontSize: 13, legendFontFace: F,
      showValue: false, showTitle: false, dataBorder: { pt: 1.5, color: hex(p.bg) }
    });
    if (f.note) slide.addText(f.note, { x: M, y: 6.55, w: CW, h: 0.35, fontFace: MONO, fontSize: 11, color: hex(p.faint) });
  };

  L.table = (c) => {
    const { slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(c.pptx, slide, p);
    eyebrow(slide, 'TABLE', p, 0.85);
    title(slide, f.title, p, 1.35, 26);
    const dataRows = f.rows || [];
    const hasC3 = !!(f.h3 && String(f.h3).trim()) || dataRows.some((r) => String(r.c3 || '').trim());
    const hasC2 = !!(f.h2 && String(f.h2).trim()) || dataRows.some((r) => String(r.c2 || '').trim());
    const ncols = hasC3 ? 3 : (hasC2 ? 2 : 1);
    const isNum = (v) => { const s = String(v || '').trim(); return /\d/.test(s) && /^[\s\d.,%₸$€£+\-–—×x()\/]+$/.test(s); };
    const colNum = [0, 1, 2].map((ci) => { const k = 'c' + (ci + 1); const cells = dataRows.map((r) => String(r[k] || '').trim()).filter(Boolean); return cells.length > 0 && cells.every(isNum); });
    const aligns = (f.aligns && f.aligns.length) ? f.aligns : [0, 1, 2].map((ci) => ci === 0 ? 'left' : (colNum[ci] ? 'right' : 'left'));
    const rows = [];
    const headOpt = { bold: true, color: hex(p.bg), fill: { color: hex(p.title) }, valign: 'middle' };
    const headRow = [{ text: f.h1 || '', options: { ...headOpt, align: aligns[0] } }];
    if (ncols >= 2) headRow.push({ text: f.h2 || '', options: { ...headOpt, align: aligns[1] } });
    if (ncols >= 3) headRow.push({ text: f.h3 || '', options: { ...headOpt, align: aligns[2] } });
    rows.push(headRow);
    dataRows.forEach((r, i) => {
      const fillC = i % 2 ? hex(p.panel) : hex(p.bg);
      const tr = [{ text: r.c1 || '', options: { bold: true, color: hex(p.title), fill: { color: fillC }, align: aligns[0], valign: 'middle' } }];
      if (ncols >= 2) tr.push({ text: r.c2 || '', options: { color: hex(p.body), fill: { color: fillC }, align: aligns[1], valign: 'middle' } });
      if (ncols >= 3) tr.push({ text: r.c3 || '', options: { bold: true, color: hex(p.title), fill: { color: fillC }, align: aligns[2], valign: 'middle' } });
      rows.push(tr);
    });
    const colW = ncols === 3 ? [CW * 0.46, CW * 0.27, CW * 0.27] : (ncols === 2 ? [CW * 0.6, CW * 0.4] : [CW]);
    const dense = dataRows.length > 4;
    slide.addTable(rows, {
      x: M, y: 2.55, w: CW, colW,
      fontFace: F, fontSize: dense ? 12 : 13, rowH: dense ? 0.42 : 0.52, margin: 0.12,
      border: { type: 'solid', color: hex(p.border), pt: 0.75 }
    });
    if (f.note) slide.addText(f.note, { x: M, y: 6.6, w: CW, h: 0.35, fontFace: MONO, fontSize: 11, color: hex(p.faint) });
  };

  // services — таблица сравнения (нативная таблица PPTX)
  L.service_compare = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    eyebrow(slide, 'SERVICES', p, 1.0);
    title(slide, f.title, p, 1.4, 26);
    const mk = (v) => {
      const s = String(v == null ? '' : v).toLowerCase().trim();
      if (/^(да|yes|\+|v|1|true)$/.test(s) || s.indexOf('✓') >= 0 || s.indexOf('✔') >= 0) return { t: '✓', c: hex(p.accent) };
      if (!s || /^(нет|no|-|—|x|0|false)$/.test(s) || s.indexOf('✕') >= 0 || s.indexOf('✗') >= 0 || s.indexOf('✖') >= 0) return { t: '✕', c: 'C9CFDA' };
      return { t: '○', c: hex(p.faint) };
    };
    const thOpt = (fill, color, align) => ({ fill: { color: fill }, color, bold: true, align: align || 'center', valign: 'middle', fontSize: 13 });
    const head = [
      { text: f.h1 || 'Возможности', options: thOpt(hex(p.panel), hex(p.title), 'left') },
      { text: f.h2 || 'Presa', options: thOpt(hex(p.accent), 'FFFFFF', 'center') },
      { text: f.h3 || 'Другие', options: thOpt(hex(p.panel), hex(p.title), 'center') },
      { text: f.h4 || 'Ручная', options: thOpt(hex(p.panel), hex(p.title), 'center') }
    ];
    const body = (f.rows || []).map((r) => {
      const a = mk(r.a), b = mk(r.b), cc = mk(r.c);
      return [
        { text: r.feature || '', options: { color: hex(p.title), bold: true, align: 'left', valign: 'middle', fontSize: 13 } },
        { text: a.t, options: { color: a.c, bold: true, align: 'center', valign: 'middle', fill: { color: hex(p.panel) }, fontSize: 15 } },
        { text: b.t, options: { color: b.c, bold: true, align: 'center', valign: 'middle', fontSize: 15 } },
        { text: cc.t, options: { color: cc.c, bold: true, align: 'center', valign: 'middle', fontSize: 15 } }
      ];
    });
    slide.addTable([head, ...body], { x: M, y: 2.55, w: CW, colW: [CW * 0.4, CW * 0.2, CW * 0.2, CW * 0.2], rowH: 0.52, fontFace: F, border: { type: 'solid', color: hex(p.border), pt: 1 }, valign: 'middle' });
  };

  // ---- reference-style (red corporate) layouts ----
  function refHeadP(slide, f, p, fallback) {
    eyebrow(slide, f.eyebrow || fallback, p, 0.95);
    slide.addText((f.title || '').toUpperCase(), { x: M - 0.03, y: 1.42, w: CW, h: 0.95, fontFace: F, fontSize: 32, bold: true, color: hex(p.title), valign: 'top', charSpacing: -0.3 });
  }

  L.about_geo_icons = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    refHeadP(slide, f, p, 'О КОМПАНИИ');
    if (f.intro) slide.addText(f.intro, { x: M, y: 2.55, w: CW * 0.62, h: 1.3, fontFace: F, fontSize: 16, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.3 });
    const cards = (f.cards || []).slice(0, 4);
    const grid = cols(Math.max(cards.length, 1), 0.45);
    const y = 4.3;
    cards.forEach((cd, i) => {
      const { x, w } = grid[i];
      slide.addImage({ data: iconUri(cd.icon, p.accent), x, y, w: 0.62, h: 0.62 });
      slide.addText(cd.heading || '', { x, y: y + 0.78, w, h: 0.45, fontFace: F, fontSize: 18, bold: true, color: hex(p.title), valign: 'top' });
      if (cd.text) slide.addText(cd.text, { x, y: y + 1.22, w: w - 0.2, h: 1.2, fontFace: F, fontSize: 12.5, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.18 });
    });
  };

  L.solution_badges = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    refHeadP(slide, f, p, 'НАШИ РЕШЕНИЯ');
    const cards = (f.cards || []).slice(0, 4);
    const n = Math.max(cards.length, 1);
    const top = 2.75, areaH = 3.95, rowH = Math.min(1.25, areaH / n), bSz = Math.min(0.95, rowH - 0.22);
    cards.forEach((cd, i) => {
      const y = top + i * rowH;
      slide.addShape(pptx.ShapeType.roundRect, { x: M, y, w: bSz, h: bSz, rectRadius: 0.1, fill: { color: hex(p.panel) }, line: { color: hex(p.border), width: 1 } });
      slide.addImage({ data: iconUri(cd.icon, p.accent), x: M + bSz * 0.24, y: y + bSz * 0.24, w: bSz * 0.52, h: bSz * 0.52 });
      slide.addText(cd.heading || '', { x: M + bSz + 0.42, y: y + 0.04, w: 7.6, h: 0.5, fontFace: F, fontSize: 20, bold: true, color: hex(p.title), valign: 'top' });
      if (cd.text) slide.addText(cd.text, { x: M + bSz + 0.42, y: y + 0.56, w: 7.7, h: rowH - 0.6, fontFace: F, fontSize: 13, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.15 });
    });
  };

  L.benefits_check_rings = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    refHeadP(slide, f, p, 'ПРЕИМУЩЕСТВА');
    const cards = (f.cards || []).slice(0, 5);
    const lw = CW * 0.6;
    const top = 2.85, rowH = Math.min(0.98, 3.8 / Math.max(cards.length, 1));
    cards.forEach((cd, i) => {
      const y = top + i * rowH;
      slide.addShape(pptx.ShapeType.ellipse, { x: M, y: y + 0.03, w: 0.44, h: 0.44, fill: { color: hex(p.accent) }, line: { type: 'none' } });
      slide.addText('✓', { x: M, y: y + 0.03, w: 0.44, h: 0.44, fontFace: F, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
      slide.addText(cd.heading || '', { x: M + 0.66, y, w: lw - 0.7, h: 0.45, fontFace: F, fontSize: 17, bold: true, color: hex(p.title), valign: 'top' });
      if (cd.text) slide.addText(cd.text, { x: M + 0.66, y: y + 0.44, w: lw - 0.7, h: rowH - 0.46, fontFace: F, fontSize: 12, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.12 });
    });
    const cx = W - 2.9, cy = H / 2 + 0.25;
    [[1.75, hex(p.border), 1.2], [1.25, hex(p.border), 1.2], [1.75, hex(p.accent), 3.2]].forEach(([r, col, wd], idx) => {
      slide.addShape(pptx.ShapeType.ellipse, { x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill: { type: 'none' }, line: { color: col, width: wd } });
    });
    slide.addShape('rect', { x: cx - 0.45, y: cy - 0.45, w: 0.9, h: 0.9, rotate: 45, fill: { type: 'none' }, line: { color: hex(p.accent), width: 2.5 } });
  };

  L.numbers_icon_stats = (c) => {
    const { pptx, slide, p, f } = c;
    slide.background = { color: hex(p.bg) };
    bar(pptx, slide, p);
    refHeadP(slide, f, p, 'НАШИ РЕЗУЛЬТАТЫ');
    const stats = (f.stats || []).slice(0, 4);
    const grid = cols(Math.max(stats.length, 1), 0.35);
    const y = 3.25;
    stats.forEach((s, i) => {
      const { x, w } = grid[i];
      slide.addImage({ data: iconUri(s.icon, p.accent), x, y, w: 0.66, h: 0.66 });
      slide.addText(s.value || '', { x: x - 0.04, y: y + 0.82, w: w, h: 1.05, fontFace: F, fontSize: 48, bold: true, color: hex(p.accent), valign: 'top', charSpacing: -1 });
      slide.addText(s.label || '', { x, y: y + 1.98, w: w - 0.2, h: 0.9, fontFace: F, fontSize: 13, color: hex(p.body), valign: 'top', lineSpacingMultiple: 1.15 });
    });
  };

  // map title_dark already aliased; ensure all layoutTypes covered
  const MAP = {
    title_triangle_photo: (ctx) => L.title_image_split({ ...ctx, f: { ...ctx.f, title: [ctx.f.title, ctx.f.titleAccent].filter(Boolean).join(' '), eyebrow: ctx.f.eyebrow || ctx.f.footerLabel } }),
    about_geo_icons: L.about_geo_icons, solution_badges: L.solution_badges,
    benefits_check_rings: L.benefits_check_rings, numbers_icon_stats: L.numbers_icon_stats,
    // construction pack — remap fields to nearest native PPTX composition
    con_cover: (ctx) => L.title_image_split({ ...ctx, f: { ...ctx.f, title: [ctx.f.title, ctx.f.titleAccent].filter(Boolean).join(' ') } }),
    con_about: (ctx) => L.text_stats({ ...ctx, f: { ...ctx.f, title: [ctx.f.title, ctx.f.titleAccent].filter(Boolean).join(' ') } }),
    con_services: L.service_icons,
    con_process: L.steps,
    con_projects: (ctx) => L.service_photos({ ...ctx, f: { ...ctx.f, cards: (ctx.f.projects || []).map((pr) => ({ image: pr.image, heading: pr.title, text: pr.meta })) } }),
    con_numbers: (ctx) => L.stats_row({ ...ctx, f: { ...ctx.f, stats: (ctx.f.stats || []).map((s) => ({ value: [s.value, s.unit].filter(Boolean).join(''), label: s.label })) } }),
    con_why: L.service_icons,
    con_cta: (ctx) => L.cta({ ...ctx, f: { ...ctx.f, title: [ctx.f.title, ctx.f.titleAccent].filter(Boolean).join(' '), subtitle: (ctx.f.contacts || []).join('  ·  ') } }),
    // about company — extra variants: remap fields to nearest native composition
    about_lead_cards: L.cards,
    about_timeline_stats: (ctx) => L.timeline({ ...ctx, f: { ...ctx.f, milestones: (ctx.f.milestones || []).map((m) => ({ title: [m.year, m.heading].filter(Boolean).join('  ·  '), desc: m.text })) } }),
    about_text_media: (ctx) => L.text_stats({ ...ctx, f: { ...ctx.f, text: ctx.f.intro } }),
    // services — extra variants: native compare table; the rest reuse the nearest composition
    service_list_panel: L.service_icons, service_flagship: L.service_icons,
    service_row_icons: L.service_icons, service_results: L.service_icons,
    service_blocks: L.cards, service_process: L.steps, service_compare: L.service_compare,
    // new bold/corporate layouts — PPTX export falls back to nearest native composition
    title_bold: L.title_hero, title_corporate: L.title_hero, statement_bold: L.quote,
    title_aurora: L.title_hero, title_spotlight: L.title_hero, title_oversized: L.title_hero, title_frame: L.title_center,
    cards_band: L.cards, feature_rows: L.bullets,
    title_hero: L.title_hero, title_dark: L.title_dark, split_accent: L.split_accent,
    title_center: L.title_center, title_band: L.title_band, title_minimal: L.title_minimal,
    title_image_full: L.title_image_full, title_image_split: L.title_image_split,
    title_sidebar: L.title_sidebar, title_editorial: L.title_editorial,
    agenda_grid: L.agenda_grid, side_list: L.side_list,
    bullets: L.bullets, agenda: L.agenda, cards: L.cards, text_stats: L.text_stats,
    service_icons: L.service_icons, service_photos: L.service_photos,
    text_bullets: L.text_bullets,
    stats_row: L.stats_row, big_stat: L.big_stat, quote: L.quote, text_media: L.text_media,
    steps: L.steps, timeline: L.timeline, pricing: L.pricing, compare: L.compare, team: L.team, cta: L.cta,
    chart_bar: L.chart_bar, chart_line: L.chart_line, chart_donut: L.chart_donut, table: L.table
  };

  /* ---- font-scale wrapper: scales every fontSize the layouts emit ---- */
  function scaleRuns(txt, k) {
    if (Array.isArray(txt)) return txt.map((r) => r && r.options && r.options.fontSize
      ? { ...r, options: { ...r.options, fontSize: Math.round(r.options.fontSize * k * 10) / 10 } } : r);
    return txt;
  }
  function scaledSlide(slide, k) {
    if (!k || Math.abs(k - 1) < 0.01) return slide;
    const sc = (o) => o && o.fontSize ? { ...o, fontSize: Math.round(o.fontSize * k * 10) / 10 } : o;
    return new Proxy(slide, {
      get(t, prop) {
        if (prop === 'addText') return (txt, opts) => t.addText(scaleRuns(txt, k), sc(opts));
        if (prop === 'addTable') return (rows, opts) => t.addTable(rows, sc(opts));
        const v = t[prop];
        return typeof v === 'function' ? v.bind(t) : v;
      },
      set(t, prop, val) { t[prop] = val; return true; }
    });
  }

  function renderSlideToPptx(pptx, slide, template, fields, theme, n, total, brand) {
    const p = window.PresaPalette(template, theme || {});
    const fn = MAP[template.layoutType] || L.bullets;
    const B = normBrand(brand);
    const ctx = { pptx, slide, p, f: fields, dark: p.dark, n, total, brand: B };
    fn(ctx);
    const selfFooter = template.layoutType === 'cta' || template.layoutType === 'title_image_full';
    if (!selfFooter) footer(pptx, slide, p, n, total, B, p.dark);
    topLogo(pptx, slide, p, B, template.layoutType);
  }

  // build full deck from constructor slides [{ templateId, fields, hidden }]
  function exportDeckPPTX(deckSlides, theme, brand) {
    if (typeof PptxGenJS === 'undefined') throw new Error('PptxGenJS не загружен');
    const B = normBrand(brand);
    const visible = deckSlides.filter((s) => !s.hidden);
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'Presa';
    pptx.company = B.name;
    const total = visible.length;
    visible.forEach((s, i) => {
      const tpl = window.PresaTemplates.byId(s.templateId);
      const fitted = window.PresaFit.fitSlideContent(tpl, s.fields);
      const slide = pptx.addSlide();
      const target = scaledSlide(slide, s.fontScale || 1);
      renderSlideToPptx(pptx, target, tpl, fitted.fields, theme, i + 1, total, B);
    });
    const first = visible[0] && visible[0].fields;
    const name = (first && (first.title || first.companyName)) || B.name || 'Presa';
    const safe = String(name).replace(/[^\p{L}\p{N}\-_ ]/gu, '').trim().slice(0, 40) || 'presentation';
    return pptx.writeFile({ fileName: `${safe} — ${B.name}.pptx` });
  }

  window.renderSlideToPptx = renderSlideToPptx;
  window.exportDeckPPTX = exportDeckPPTX;
})();
