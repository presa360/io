/* ============================================================
   Presa — fitSlideContent
   Adapts user input to a template: clamps item counts and text
   lengths, computes a font scale for dense slides, and returns
   human-readable warnings. Pure function, no DOM.
   ============================================================ */
(function () {
  function truncate(str, max) {
    if (typeof str !== 'string' || str.length <= max) return { value: str, cut: false };
    // cut on a word boundary where possible
    let s = str.slice(0, max);
    const sp = s.lastIndexOf(' ');
    if (sp > max * 0.6) s = s.slice(0, sp);
    return { value: s.replace(/[\s.,;:–-]+$/, '') + '…', cut: true };
  }

  function clampField(def, value, warnings) {
    if (def.type === 'text' || def.type === 'textarea') {
      const s = value || '';
      // Title, subtitle and description (textarea) are NOT truncated any more — the
      // renderer autoscales them to fit. We only warn when they run long.
      const autoFit = def.type === 'textarea' || def.key === 'title' || def.key === 'subtitle';
      if (def.maxLength && s.length > def.maxLength) {
        if (autoFit) {
          warnings.push({ field: def.key, type: 'warn', message: `«${def.label}»: ${s.length}/${def.maxLength} — текст длинный, шрифт уменьшен автоматически. Лучше сократить для читаемости.` });
          return s;
        }
        const r = truncate(s, def.maxLength);
        if (r.cut) warnings.push({ field: def.key, type: 'warn', message: `«${def.label}» длиннее ${def.maxLength} символов — текст сокращён.` });
        return r.value;
      }
      return s;
    }

    if (def.type === 'list') {
      let items = Array.isArray(value) ? value.filter((x) => String(x).trim() !== '') : [];
      if (def.maxItems && items.length > def.maxItems) {
        warnings.push({ field: def.key, type: 'warn', message: `Для этого дизайна лучше до ${def.maxItems} пунктов. Лишние (${items.length - def.maxItems}) не попадут в слайд.` });
        items = items.slice(0, def.maxItems);
      }
      if (def.minItems && items.length < def.minItems) {
        warnings.push({ field: def.key, type: 'info', message: `Рекомендуется минимум ${def.minItems} пункта для «${def.label}».` });
      }
      items = items.map((it) => {
        if (def.maxItemLength) { const r = truncate(String(it), def.maxItemLength); if (r.cut) warnings.push({ field: def.key, type: 'warn', message: `Один из пунктов «${def.label}» сокращён до ${def.maxItemLength} символов.` }); return r.value; }
        return String(it);
      });
      return items;
    }

    if (def.type === 'group') {
      let items = Array.isArray(value) ? value : [];
      if (def.maxItems && items.length > def.maxItems) {
        warnings.push({ field: def.key, type: 'warn', message: `Для этого дизайна лучше до ${def.maxItems} элементов в «${def.label}». Лишние не отобразятся.` });
        items = items.slice(0, def.maxItems);
      }
      if (def.minItems && items.length < def.minItems) {
        warnings.push({ field: def.key, type: 'info', message: `Рекомендуется минимум ${def.minItems} элемента для «${def.label}».` });
      }
      items = items.map((obj) => {
        const out = {};
        def.sub.forEach((sd) => { out[sd.key] = clampField(sd, obj ? obj[sd.key] : undefined, warnings); });
        return out;
      });
      // ---- card-specific text-length warnings ----
      if (def.key === 'cards') {
        items.forEach(function(item, idx) {
          const hl = String(item.heading || item.title || '').length;
          const tl = String(item.text   || item.desc  || '').length;
          if (hl > 35) {
            warnings.push({ field: def.key, type: 'info', message: 'Карточка ' + (idx + 1) + ': заголовок длиннее 35 символов — шрифт уменьшится автоматически.' });
          }
          if (tl > 140) {
            warnings.push({ field: def.key, type: 'warn', message: 'Карточка ' + (idx + 1) + ': текст слишком длинный для этой карточки (' + tl + ' симв.). Рекомендуем сократить или разбить на два слайда.' });
          } else if (tl > 90) {
            warnings.push({ field: def.key, type: 'info', message: 'Карточка ' + (idx + 1) + ': описание длиннее 90 символов (' + tl + ') — шрифт уменьшится автоматически.' });
          }
        });
      }
      return items;
    }
    return value;
  }

  // density → font scale (used by layout renderers to shrink dense slides)
  function computeScale(template, fields) {
    let scale = 1;
    const defs = [...template.requiredFields, ...(template.optionalFields || [])];
    defs.forEach((def) => {
      const v = fields[def.key];
      if (def.type === 'list' && Array.isArray(v)) {
        const n = v.length;
        if (n >= 6) scale = Math.min(scale, 0.8);
        else if (n === 5) scale = Math.min(scale, 0.88);
        else if (n === 4) scale = Math.min(scale, 0.94);
        const longest = v.reduce((m, x) => Math.max(m, String(x).length), 0);
        if (longest > 70) scale = Math.min(scale, 0.9);
      }
      if (def.type === 'group' && Array.isArray(v)) {
        const n = v.length;
        if (n >= 4) scale = Math.min(scale, 0.92);
        if (n >= 6) scale = Math.min(scale, 0.84);
        if (n >= 8) scale = Math.min(scale, 0.78);
      }
      if (def.type === 'textarea' && typeof v === 'string') {
        if (v.length > 220) scale = Math.min(scale, 0.86);
        else if (v.length > 170) scale = Math.min(scale, 0.92);
      }
    });
    return Math.max(0.7, scale);
  }

  /**
   * fitSlideContent(template, rawFields) -> { fields, warnings, scale, hasWarnings }
   */
  function fitSlideContent(template, rawFields) {
    const warnings = [];
    const fields = {};
    const defs = [...template.requiredFields, ...(template.optionalFields || [])];
    defs.forEach((def) => { fields[def.key] = clampField(def, rawFields ? rawFields[def.key] : undefined, warnings); });
    // carry over any extra keys untouched
    if (rawFields) Object.keys(rawFields).forEach((k) => { if (!(k in fields)) fields[k] = rawFields[k]; });
    const scale = computeScale(template, fields);
    return { fields, warnings, scale, hasWarnings: warnings.some((w) => w.type === 'warn') };
  }

  /* ============================================================
     cardAutoscale(n, visualType, headingLen, descLen)
     Returns recommended baseCqw sizes, maxLines and warning flags
     for a card renderer — mirrors the tier tables in slide-layouts.jsx.
     ============================================================ */
  function cardAutoscale(n, visualType, headingLen, descLen) {
    var hBase, dBase, dLines;
    if      (n <= 2) { hBase = 2.9;  dBase = 2.0;  dLines = 3; }
    else if (n === 3){ hBase = 2.5;  dBase = 1.85; dLines = 3; }
    else if (n === 4){ hBase = 2.2;  dBase = 1.7;  dLines = 2; }
    else             { hBase = 1.95; dBase = 1.55; dLines = 2; }
    if (visualType === 'image') dLines = Math.max(2, dLines - 1);
    return {
      headingBase:  hBase,
      descBase:     dBase,
      descMaxLines: dLines,
      showWarning:  descLen > 90 || headingLen > 35,
      criticalWarn: descLen > 140
    };
  }

  window.PresaFit = { fitSlideContent, cardAutoscale };
})();
