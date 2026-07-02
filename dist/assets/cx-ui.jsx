/* global React */
/* ============================================================
   Presa — CX shared UI: icons, audit, slide utils, mini preview.
   Loaded first among Babel files; exports via window.CX.
   ============================================================ */
(function () {
  const h = React.createElement;

  const ICONS = {
    back: 'M15 18l-6-6 6-6',
    download: 'M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14',
    chevronDown: 'M6 9l6 6 6-6',
    file: 'M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5zM14 3v5h5',
    undo: 'M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 010 11H11',
    redo: 'M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 000 11H13',
    spark: 'M13 2L4.5 12.5h6L11 22l8.5-11.5h-6L13 2z',
    check: 'M20 6L9 17l-5-5',
    warn: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
    error: 'M12 8v5m0 3h.01M12 22a10 10 0 110-20 10 10 0 010 20z',
    info: 'M12 16v-4m0-4h.01M12 22a10 10 0 110-20 10 10 0 010 20z',
    plus: 'M12 5v14M5 12h14',
    copy: 'M9 9h10v10H9zM5 15V5h10',
    trash: 'M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0v12a1 1 0 001 1h6a1 1 0 001-1V7',
    drag: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
    chevL: 'M15 18l-6-6 6-6', chevR: 'M9 18l6-6-6-6', chevD: 'M6 9l6 6 6-6',
    close: 'M6 6l12 12M18 6L6 18',
    wand: 'M5 19l9-9m0 0l3-3-2-2-3 3m2 2L9 5 7 3 5 5l5 5m4 4l3 3 2-2-3-3',
    pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z',
    scissors: 'M6 6a2 2 0 100-.01M6 18a2 2 0 100-.01M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12',
    brief: 'M9 4h6a1 1 0 011 1v2h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1h3V5a1 1 0 011-1z',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    grid: 'M3 9h18M3 15h18M9 3v18M15 3v18',
    zoomIn: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3M11 8v6M8 11h6',
    zoomOut: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3M8 11h6',
    expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
    safe: 'M3 4h18v16H3zM7 8h10v8H7z',
    shield: 'M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3zM9.5 12l2 2 3.5-3.5',
    textT: 'M4 6V4h16v2M12 4v16M9 20h6',
    palette: 'M12 21a9 9 0 110-18c4.97 0 9 3.13 9 7a4 4 0 01-4 4h-2.2a1.8 1.8 0 00-1.4 2.9c.3.4.6.8.6 1.3A1.8 1.8 0 0112 21z',
    layers: 'M12 3l9 5-9 5-9-5 9-5zM3 14l9 5 9-5',
    library: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z',
    cloud: 'M7 18.5a4.5 4.5 0 01-.9-8.9A6 6 0 0117.8 11h.7a3.75 3.75 0 010 7.5H7z',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z',
    eyeOff: 'M3 3l18 18M10.6 5.1A9.8 9.8 0 0112 5c6.5 0 10 7 10 7a17.4 17.4 0 01-3.2 3.9M6.6 6.6A17 17 0 002 12s3.5 7 10 7a9.9 9.9 0 004.4-1M9.9 9.9a3 3 0 104.2 4.2',
    img: 'M3 5h18v14H3zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4 17l5-5 4 4 3-3 4 4',
    chart: 'M4 20V10M10 20V4M16 20v-8M22 20H2'
  };

  function Svg({ d, s = 18, w = 2 }) {
    return h('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none' },
      h('path', { d, stroke: 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  }

  // ---- ids ----
  let _uid = 0;
  const uid = () => 's' + (++_uid) + '-' + Math.random().toString(36).slice(2, 7);

  // ---- carry user fields onto a new template, falling back to its sample ----
  function remapFields(tpl, oldFields) {
    const out = {};
    const defs = [...tpl.requiredFields, ...(tpl.optionalFields || [])];
    defs.forEach((def) => {
      if (oldFields && oldFields[def.key] !== undefined && oldFields[def.key] !== '' &&
          !(Array.isArray(oldFields[def.key]) && oldFields[def.key].length === 0)) {
        out[def.key] = oldFields[def.key];
      } else if (tpl.sample && tpl.sample[def.key] !== undefined) {
        out[def.key] = JSON.parse(JSON.stringify(tpl.sample[def.key]));
      } else {
        out[def.key] = def.type === 'list' || def.type === 'group' ? [] : '';
      }
    });
    return out;
  }

  function seedSlide(templateId) {
    const tpl = window.PresaTemplates.byId(templateId);
    return { uid: uid(), templateId, fields: remapFields(tpl, tpl.sample || {}), fontScale: 1 };
  }

  /* ============================================================
     auditSlide(tpl, rawFields) -> { level, issues }
     level: 'ok' | 'warn' | 'error'
     ============================================================ */
  function auditSlide(tpl, raw) {
    const issues = [];
    const push = (level, field, message) => issues.push({ level, field, message });
    const checkDef = (def, val, required) => {
      if (def.type === 'text' || def.type === 'textarea') {
        const s = String(val || '');
        if (required && !s.trim()) { push('warn', def.key, `«${def.label}» не заполнено`); return; }
        if (def.maxLength) {
          if (s.length > def.maxLength) push('error', def.key, `«${def.label}»: ${s.length}/${def.maxLength} — лимит превышен, текст будет обрезан`);
          else if (s.length >= def.maxLength * 0.85 && s.length > 0) push('warn', def.key, `«${def.label}»: ${s.length}/${def.maxLength} — близко к лимиту`);
        }
      } else if (def.type === 'list') {
        const items = (Array.isArray(val) ? val : []).filter((x) => String(x).trim() !== '');
        if (required && !items.length) { push('warn', def.key, `«${def.label}» — нет пунктов`); return; }
        if (def.maxItems && items.length > def.maxItems) push('error', def.key, `«${def.label}»: ${items.length} пунктов при максимуме ${def.maxItems} — лишние не попадут в слайд`);
        if (def.minItems && items.length > 0 && items.length < def.minItems) push('info', def.key, `«${def.label}»: рекомендуется минимум ${def.minItems}`);
        if (def.maxItemLength) items.forEach((it, i) => {
          if (String(it).length > def.maxItemLength) push('error', def.key, `«${def.label}», пункт ${i + 1}: длиннее ${def.maxItemLength} символов`);
        });
      } else if (def.type === 'group') {
        const items = Array.isArray(val) ? val : [];
        if (required && !items.length) { push('warn', def.key, `«${def.label}» — пусто`); return; }
        if (def.maxItems && items.length > def.maxItems) push('error', def.key, `«${def.label}»: ${items.length} при максимуме ${def.maxItems} — лишние не отобразятся`);
        items.forEach((obj, i) => (def.sub || []).forEach((sd) => {
          if ((sd.type === 'text' || sd.type === 'textarea') && sd.maxLength) {
            const s = String((obj && obj[sd.key]) || '');
            if (s.length > sd.maxLength) push('error', def.key, `«${def.label} ${i + 1} · ${sd.label}»: ${s.length}/${sd.maxLength}`);
          }
        }));
      }
    };
    (tpl.requiredFields || []).forEach((d) => checkDef(d, raw ? raw[d.key] : undefined, true));
    (tpl.optionalFields || []).forEach((d) => checkDef(d, raw ? raw[d.key] : undefined, false));
    const level = issues.some((i) => i.level === 'error') ? 'error' : issues.some((i) => i.level === 'warn') ? 'warn' : 'ok';
    return { level, issues };
  }

  // deck-level notes
  function auditDeck(slides) {
    const Lib = window.PresaTemplates;
    const notes = [];
    if (!slides.length) return notes;
    const cats = slides.map((s) => Lib.byId(s.templateId).category);
    if (cats[0] !== 'title') notes.push({ level: 'info', message: 'Презентация не начинается с титульного слайда' });
    if (!cats.includes('contact')) notes.push({ level: 'info', message: 'Нет финального слайда с контактами / CTA' });
    if (slides.length > 16) notes.push({ level: 'warn', message: 'Больше 16 слайдов — аудитория может устать' });
    return notes;
  }

  /* ============================================================
     suggestSlide(tpl, fields) -> [{ kind, level, message, action }]
     Practical guidance: WHY a slide is overloaded and HOW to fix it.
     Actions are interpreted by the constructor:
       'split'              — разбить контент на 2 слайда
       'category:<id>'      — переключить категорию (например, на «Цифры»)
     ============================================================ */
  function looksNumeric(str) {
    const s = String(str || '').trim();
    if (!s) return false;
    // value-like: %, ×, +/−, currency, or mostly digits
    return /[%×x]|^[+\-–]?\s*\d/.test(s) || (/\d/.test(s) && s.replace(/[^\d]/g, '').length >= s.length * 0.4);
  }
  // step-like: numbered or phase/stage/quarter/period wording.
  // NB: \b doesn't work before Cyrillic in JS regex — pad with spaces and gate on \s.
  function looksLikeStep(str) {
    const s = ' ' + String(str || '').trim().toLowerCase() + ' ';
    if (s.trim() === '') return false;
    return /(^|\s)(\d{1,2}\s*[.)\-–:]|0\d(\s|$))/.test(s) ||
      /\s(шаг|этап|стади|фаза|step|phase|stage)/.test(s) ||
      /\s(q[1-4](\s|$)|квартал|недел|день|дни|месяц|спринт|sprint)/.test(s) ||
      /\s(янв|фев|мар|апр|ма[йя]|июн|июл|авг|сен|окт|ноя|дек)/.test(s);
  }
  // comparison-like: two-sided "X vs Y", "до/после", "было/стало", "мы … они"
  const COMPARE_RE = /\bvs\.?\b|\bversus\b|(^|\s)против\s|\u2194|до\s*[\/\u2192и]\s*после|было\s*[\/\u2192и]\s*стало|(^|\s)мы\s[^.]{0,30}\sони(\s|[.,!?]|$)/i;
  function textOfItems(items) {
    return items.map((it) => typeof it === 'string' ? it
      : [it && (it.heading || it.title), it && (it.text || it.desc)].filter(Boolean).join(' ')).join(' \n ');
  }

  function suggestSlide(tpl, raw) {
    const Lib = window.PresaTemplates;
    const out = [];
    if (!tpl || !raw) return out;
    const lt = tpl.layoutType;
    const cap = (Lib.RENDER_CAP && Lib.RENDER_CAP[lt]) || 99;
    const pf = Lib.primaryField ? Lib.primaryField(tpl) : null;

    // ---- 1. too many items for this layout → split ----
    if (pf) {
      const items = Array.isArray(raw[pf.key]) ? raw[pf.key].filter((x) => (typeof x === 'string' ? x.trim() : x)) : [];
      const n = items.length;
      if (n > cap) {
        out.push({ kind: 'overflow', level: 'warn', action: 'split',
          message: `${n} элементов — на этом дизайне помещается ${cap}. Разбить на 2 слайда?` });
      }
      // ---- 2. cards carry too much text → split / shorten ----
      if (pf.type === 'group') {
        const longCards = items.filter((it) => String((it && (it.text || it.desc)) || '').length > 140).length;
        const totalText = items.reduce((m, it) => m + String((it && (it.text || it.desc)) || '').length, 0);
        if (n <= cap && (longCards >= 2 || totalText > 720)) {
          out.push({ kind: 'dense', level: 'warn', action: 'split',
            message: 'Карточки перегружены текстом — слайд читается тяжело. Разбейте на 2 слайда или сократите описания.' });
        }
        // ---- 3. card values are numeric → stats template ----
        if (tpl.category !== 'numbers' && n >= 2) {
          const numeric = items.filter((it) => looksNumeric(it && (it.heading || it.title))).length;
          if (numeric >= Math.max(2, Math.ceil(n * 0.6))) {
            out.push({ kind: 'reroute', level: 'info', action: 'category:numbers',
              message: 'Похоже на цифры — шаблон «Цифры / статистика» покажет их крупнее и убедительнее.' });
          }
        }
      }
      // ---- 4. bullet list that is really data → stats ----
      if (pf.type === 'list' && tpl.category !== 'numbers' && lt === 'bullets') {
        const numeric = items.filter(looksNumeric).length;
        if (items.length >= 3 && numeric >= Math.ceil(items.length * 0.6)) {
          out.push({ kind: 'reroute', level: 'info', action: 'category:numbers',
            message: 'В пунктах в основном цифры — попробуйте шаблон «Цифры / статистика».' });
        }
      }

      // ---- 6. sequential / step-like content → process or roadmap ----
      const seqCats = ['process', 'roadmap', 'agenda'];
      const seqLayouts = ['timeline', 'steps'];
      if (!out.some((o) => o.kind === 'reroute') && seqCats.indexOf(tpl.category) < 0 && seqLayouts.indexOf(lt) < 0 && n >= 3) {
        const texts = (pf.type === 'group') ? items.map((it) => it && (it.heading || it.title)) : items;
        const steps = texts.filter(looksLikeStep).length;
        if (steps >= Math.ceil(n * 0.6)) {
          out.push({ kind: 'reroute', level: 'info', action: 'category:process',
            message: 'Похоже на этапы — шаблон «Процесс работы» или «Дорожная карта» покажет их как последовательность.' });
        }
      }

      // ---- 7. comparison-like content → comparison template ----
      if (!out.some((o) => o.kind === 'reroute') && tpl.category !== 'comparison' && lt !== 'compare' && n >= 2) {
        if (COMPARE_RE.test(textOfItems(items))) {
          out.push({ kind: 'reroute', level: 'info', action: 'category:comparison',
            message: 'Контент звучит как сравнение — шаблон «Сравнение» покажет варианты друг напротив друга.' });
        }
      }
    }

    // ---- 5. very long paragraph → break it up ----
    const defs = [...tpl.requiredFields, ...(tpl.optionalFields || [])];
    defs.forEach((d) => {
      if (d.type === 'textarea' && d.maxLength) {
        const s = String(raw[d.key] || '');
        if (s.length > d.maxLength * 1.3) {
          out.push({ kind: 'long', level: 'warn', action: null,
            message: `«${d.label}» очень длинный (${s.length} симв.). Разбейте мысль на список тезисов или на 2 слайда.` });
        }
      }
    });

    return out;
  }

  // small non-interactive slide preview (fits its container width)
  function MiniSlide({ template, fields, theme, n = 1, total = 1, brand }) {
    const fit = window.PresaFit.fitSlideContent(template, fields);
    return h('div', { style: { pointerEvents: 'none', width: '100%' } },
      h(window.SlideRenderer, { template, fields: fit.fields, theme, scale: fit.scale, slideNumber: n, total, brand: brand || 'Presa' }));
  }

  // truncate on word boundary (mirrors fit.js)
  function truncateSmart(str, max) {
    if (typeof str !== 'string' || str.length <= max) return str;
    let s = str.slice(0, max);
    const sp = s.lastIndexOf(' ');
    if (sp > max * 0.6) s = s.slice(0, sp);
    return s.replace(/[\s.,;:–-]+$/, '') + '…';
  }

  // read + downscale an image file → { dataUrl, ratio }
  function readImageFile(file, maxDim = 1280) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error('Не удалось прочитать файл'));
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, maxDim / Math.max(img.width, img.height));
          const cw = Math.max(1, Math.round(img.width * k)), ch = Math.max(1, Math.round(img.height * k));
          const cv = document.createElement('canvas');
          cv.width = cw; cv.height = ch;
          cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
          const keepAlpha = /png|svg|webp/.test(file.type || '');
          resolve({ dataUrl: keepAlpha ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.82), ratio: cw / ch });
        };
        img.onerror = () => reject(new Error('Не удалось открыть изображение'));
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  window.CX = { ICONS, Svg, uid, remapFields, seedSlide, auditSlide, auditDeck, suggestSlide, MiniSlide, truncateSmart, readImageFile };
})();
