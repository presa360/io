/* global React, CX */
/* ============================================================
   Presa — CanvasStage
   Center column of the editor:
   toolbar (zoom · grid · safe zones · status · fullscreen)
   → 16:9 canvas with click-to-select fields and overlays
   → design-variant gallery for the current category.
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useState, useEffect, useMemo } = React;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;
  const Lib = window.PresaTemplates;
  const Fit = window.PresaFit;

  const ZOOMS = [0.5, 0.65, 0.8, 1, 1.25, 1.5];
  const BASE_W = 1160; // px width at 100%

  function statusChip(audit, onClick) {
    if (!audit) return null;
    const n = audit.issues.length;
    if (audit.level === 'ok') return h('button', { className: 'cx-statchip cx-statchip--ok', onClick, title: 'Открыть проверку' },
      h(Svg, { d: I.check, s: 13, w: 2.6 }), 'Слайд в порядке');
    return h('button', { className: 'cx-statchip cx-statchip--' + audit.level, onClick, title: 'Открыть проверку' },
      h(Svg, { d: audit.level === 'error' ? I.error : I.warn, s: 13, w: 2.2 }),
      n === 1 ? '1 замечание' : `${n} замечани${n < 5 ? 'я' : 'й'}`);
  }

  function CanvasStage(props) {
    const { slide, tpl, theme, current, total, activeField, audit,
            onFieldClick, onVariant, onOpenLibrary, onPrev, onNext, onOpenCheck,
            onInlineEdit, brand, suggestions, onSuggest } = props;
    const [zoom, setZoom] = useState('fit');     // 'fit' | number
    const [grid, setGrid] = useState(false);
    const [safe, setSafe] = useState(false);
    const [full, setFull] = useState(false);
    const [inline, setInline] = useState(null);  // { key, idx, raw, multiline, style }
    const boxRef = React.useRef(null);
    const hideElRef = React.useRef(null);

    const fit = useMemo(() => Fit.fitSlideContent(tpl, slide.fields), [tpl, slide.fields]);
    const scale = fit.scale * (slide.fontScale || 1);

    const variants = Lib.byCategory(tpl.category);
    const variantIndex = variants.findIndex((v) => v.id === tpl.id);

    // Esc closes fullscreen
    useEffect(() => {
      if (!full) return;
      const onKey = (e) => {
        if (e.key === 'Escape') setFull(false);
        if (e.key === 'ArrowLeft') onPrev();
        if (e.key === 'ArrowRight') onNext();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [full, onPrev, onNext]);

    const zoomIdx = typeof zoom === 'number' ? ZOOMS.indexOf(zoom) : -1;
    const zoomOut = () => setZoom(zoomIdx > 0 ? ZOOMS[zoomIdx - 1] : zoomIdx === -1 ? 0.8 : ZOOMS[0]);
    const zoomIn = () => setZoom(zoomIdx >= 0 && zoomIdx < ZOOMS.length - 1 ? ZOOMS[zoomIdx + 1] : zoomIdx === -1 ? 1.25 : ZOOMS[ZOOMS.length - 1]);

    const handleCanvasClick = (e) => {
      const el = e.target.closest && e.target.closest('[data-f]');
      if (el) onFieldClick(el.getAttribute('data-f'));
    };

    /* ---- inline editing (double-click on a text field) ---- */
    const restoreHidden = () => {
      const el = hideElRef.current;
      if (el) { try { el.style.visibility = ''; } catch (err) {} hideElRef.current = null; }
    };
    const endInline = (commitVal, st) => {
      restoreHidden();
      if (st && commitVal != null && onInlineEdit) onInlineEdit(st.key, st.idx, commitVal);
      setInline(null);
    };
    // editable targets on the slide, in DOM order (lists → one target per item)
    const getTargets = () => {
      const box = boxRef.current;
      if (!box) return [];
      const defs = [...tpl.requiredFields, ...(tpl.optionalFields || [])];
      const out = [];
      const seen = new Set();
      box.querySelectorAll('.slide [data-f]').forEach((el) => {
        const key = el.getAttribute('data-f');
        const def = defs.find((d) => d.key === key);
        if (!def || def.type === 'group' || def.type === 'image') return;
        let idx = null;
        if (def.type === 'list') {
          const fiEl = (el.closest && el.closest('[data-fi]')) || el;
          idx = parseInt(fiEl.getAttribute('data-fi') || '0', 10) || 0;
        }
        const id = key + ':' + idx;
        if (seen.has(id)) return;
        seen.add(id);
        out.push({ el, key, idx });
      });
      return out;
    };
    // commit current edit, then re-open the editor on the next/prev field (Tab / Shift+Tab)
    const moveEdit = (dir, st, val) => {
      restoreHidden();
      if (val != null && onInlineEdit) onInlineEdit(st.key, st.idx, val);
      setInline(null);
      window.setTimeout(() => {
        const ts = getTargets();
        if (!ts.length) return;
        const i = ts.findIndex((t) => t.key === st.key && (t.idx == null ? st.idx == null : t.idx === st.idx));
        const nx = ts[((i < 0 ? 0 : i) + dir + ts.length) % ts.length];
        if (nx) startInline(nx.el);
      }, 80);
    };
    const startInline = (el) => {
      const key = el.getAttribute('data-f');
      const defs = [...tpl.requiredFields, ...(tpl.optionalFields || [])];
      const def = defs.find((d) => d.key === key);
      if (!def) return;
      if (def.type === 'group' || def.type === 'image') { onFieldClick(key); return; }
      let idx = null, raw;
      if (def.type === 'list') {
        const fiEl = (el.closest && el.closest('[data-fi]')) || el;
        idx = parseInt(fiEl.getAttribute('data-fi') || '0', 10) || 0;
        const arr = Array.isArray(slide.fields[key]) ? slide.fields[key] : [];
        raw = String(arr[idx] != null ? arr[idx] : '');
      } else {
        raw = String(slide.fields[key] || '');
      }
      const box = boxRef.current;
      if (!box) return;
      const br = box.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      hideElRef.current = el;
      el.style.visibility = 'hidden';
      const max = def.type === 'list' ? (def.maxItemLength || null) : (def.maxLength || null);
      setInline({
        key, idx, raw, max, count: raw.length,
        chipTop: (er.top - br.top) + er.height + 8,
        chipLeft: (er.left - br.left),
        multiline: def.type === 'textarea',
        style: {
          left: (er.left - br.left) + 'px',
          top: (er.top - br.top) + 'px',
          width: Math.max(er.width, 80) + 'px',
          minHeight: er.height + 'px',
          fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing, color: cs.color, fontFamily: cs.fontFamily,
          textAlign: cs.textAlign, textTransform: cs.textTransform
        }
      });
      onFieldClick(key);
    };
    const handleCanvasDbl = (e) => {
      const el = e.target.closest && e.target.closest('[data-f]');
      if (el) startInline(el);
    };
    // close editor when the slide or template changes
    useEffect(() => { restoreHidden(); setInline(null); }, [current, tpl.id]);

    // Enter (outside inputs) opens the inline editor on the active — or first — field
    useEffect(() => {
      const onKey = (e) => {
        if (inline || full) return;
        if (e.key !== 'Enter' || e.metaKey || e.ctrlKey || e.altKey) return;
        const t = e.target;
        if (t && (/INPUT|TEXTAREA|SELECT|BUTTON/.test(t.tagName) || t.isContentEditable)) return;
        const ts = getTargets();
        if (!ts.length) return;
        const target = (activeField && ts.find((x) => x.key === activeField)) || ts[0];
        e.preventDefault();
        startInline(target.el);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    });

    const overlays = [
      grid ? h('div', { key: 'g', className: 'cx-ovl cx-ovl--grid' }) : null,
      safe ? h('div', { key: 's', className: 'cx-ovl cx-ovl--safe' }, h('span', null, 'SAFE ZONE')) : null
    ];

    const slideEl = h(window.SlideRenderer, {
      template: tpl, fields: fit.fields, theme, scale,
      slideNumber: current + 1, total, brand: brand || 'Presa'
    });

    return h('div', { className: 'cx-stage', 'data-screen-label': 'Канвас редактора' },
      // dynamic highlight styles for field selection
      h('style', null,
        `.cx-canvas .slide [data-f]{cursor:pointer;transition:box-shadow .12s ease;border-radius:.4cqw;}
         .cx-canvas .slide [data-f]:hover{box-shadow:0 0 0 .25cqw rgba(229,50,43,.38);}
         ${activeField ? `.cx-canvas .slide [data-f="${activeField}"]{box-shadow:0 0 0 .3cqw rgba(229,50,43,.85) !important;}` : ''}`),

      // ---- toolbar ----
      h('div', { className: 'cx-toolbar' },
        h('div', { className: 'cx-toolbar__info' },
          h('span', { className: 'cx-toolbar__cat' }, Lib.categoryLabel(tpl.category)),
          h('span', { className: 'cx-toolbar__tpl' }, `${tpl.name} · вариант ${variantIndex + 1}/${variants.length}`)),
        h('div', { className: 'cx-toolbar__mid' },
          h('div', { className: 'cx-zoom' },
            h('button', { className: 'cx-tbtn', title: 'Уменьшить', onClick: zoomOut }, h(Svg, { d: I.zoomOut, s: 15 })),
            h('button', { className: 'cx-zoom__val', title: 'Вписать в окно', onClick: () => setZoom('fit') },
              zoom === 'fit' ? 'Вписать' : Math.round(zoom * 100) + '%'),
            h('button', { className: 'cx-tbtn', title: 'Увеличить', onClick: zoomIn }, h(Svg, { d: I.zoomIn, s: 15 }))),
          h('div', { className: 'cx-tdiv' }),
          h('button', { className: 'cx-tbtn' + (grid ? ' on' : ''), title: 'Сетка 12 колонок', onClick: () => setGrid(!grid) }, h(Svg, { d: I.grid, s: 15 })),
          h('button', { className: 'cx-tbtn' + (safe ? ' on' : ''), title: 'Безопасные зоны', onClick: () => setSafe(!safe) }, h(Svg, { d: I.safe, s: 15 }))),
        h('div', { className: 'cx-toolbar__right' },
          slide.hidden ? h('span', { className: 'cx-statchip cx-statchip--hidden', title: 'Слайд не попадёт в экспорт' }, h(Svg, { d: I.eyeOff, s: 13, w: 2.2 }), 'Скрыт') : null,
          statusChip(audit, onOpenCheck),
          h('button', { className: 'cx-tbtn', title: 'На весь экран', onClick: () => setFull(true) }, h(Svg, { d: I.expand, s: 15 })))),

      // ---- smart suggestion banner: why this slide is overloaded + how to fix ----
      (suggestions && suggestions.length) ? h('div', { className: 'cx-suggestbar' },
        h('span', { className: 'cx-suggestbar__ic' }, h(Svg, { d: I.wand, s: 14 })),
        h('div', { className: 'cx-suggestbar__txt' },
          h('b', null, suggestions[0].message),
          suggestions.length > 1 ? h('span', null, `и ещё ${suggestions.length - 1} рекомендация во вкладке «Проверка»`) : null),
        suggestions[0].action && onSuggest
          ? h('button', { className: 'cx-suggestbar__btn', onClick: () => onSuggest(suggestions[0].action) },
              suggestions[0].action === 'split' ? 'Разбить на 2 слайда' : 'Исправить')
          : h('button', { className: 'cx-suggestbar__btn cx-suggestbar__btn--ghost', onClick: onOpenCheck }, 'Подробнее')) : null,

      // ---- canvas ----
      h('div', { className: 'cx-stagewrap' },
        h('div', {
          className: 'cx-canvasbox',
          ref: boxRef,
          style: zoom === 'fit'
            ? { width: '100%', maxWidth: 'min(100%, calc((100vh - 420px) * 1.7778))' }
            : { width: BASE_W * zoom + 'px', flex: '0 0 auto' }
        },
          h('div', { className: 'cx-canvas', onClick: handleCanvasClick, onDoubleClick: handleCanvasDbl },
            slideEl, overlays),
          inline ? h('div', {
            key: 'ed-' + inline.key + '-' + (inline.idx == null ? 'w' : inline.idx),
            className: 'cx-inline',
            contentEditable: true,
            suppressContentEditableWarning: true,
            spellCheck: false,
            ref: (node) => {
              if (node && node.dataset.init !== '1') {
                node.dataset.init = '1';
                node.textContent = inline.raw;
                node.focus();
                const r = document.createRange();
                r.selectNodeContents(node);
                const s = window.getSelection();
                s.removeAllRanges(); s.addRange(r);
              }
            },
            style: inline.style,
            onKeyDown: (e) => {
              e.stopPropagation();
              if (e.key === 'Escape') { e.preventDefault(); endInline(null, inline); }
              else if (e.key === 'Tab') { e.preventDefault(); moveEdit(e.shiftKey ? -1 : 1, inline, e.currentTarget.textContent); }
              else if (e.key === 'Enter' && (!inline.multiline || !e.shiftKey)) { e.preventDefault(); endInline(e.currentTarget.textContent, inline); }
            },
            onInput: (e) => {
              const n = (e.currentTarget.textContent || '').length;
              setInline((s) => s ? { ...s, count: n } : s);
            },
            onBlur: (e) => endInline(e.currentTarget.textContent, inline),
            onPaste: (e) => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text')); },
            onClick: (e) => e.stopPropagation(),
            onDoubleClick: (e) => e.stopPropagation()
          }) : null,
          inline ? h('div', {
            className: 'cx-inlinecount' + (inline.max && inline.count > inline.max ? ' over' : ''),
            style: { left: inline.chipLeft + 'px', top: inline.chipTop + 'px' }
          },
            inline.max ? `${inline.count} / ${inline.max}` : `${inline.count}`,
            h('span', { className: 'cx-inlinecount__keys' }, 'Tab — следующее · Enter — готово')) : null),
        h('div', { className: 'cx-canvashint' }, 'Двойной клик — править текст на слайде · Tab — следующее поле · Esc — отмена')),

      // ---- variant gallery ----
      h('div', { className: 'cx-gallery', 'data-screen-label': 'Варианты дизайна' },
        h('div', { className: 'cx-gallery__head' },
          h('span', { className: 'cx-gallery__lbl' }, 'Варианты дизайна'),
          h('button', { className: 'cx-gallery__lib', onClick: onOpenLibrary },
            h(Svg, { d: I.library, s: 14 }), 'Вся библиотека')),
        h('div', { className: 'cx-gallery__row' },
          variants.map((v, vi) => {
            const fields = window.CX.remapFields(v, slide.fields);
            return h('button', {
              key: v.id,
              className: 'cx-gthumb' + (vi === variantIndex ? ' on' : ''),
              title: v.name + ' — ' + v.description,
              onClick: () => onVariant(v)
            },
              h('div', { className: 'cx-gthumb__pic' },
                h(window.CX.MiniSlide, { template: v, fields, theme, n: current + 1, total, brand })),
              h('span', { className: 'cx-gthumb__name' }, vi === variantIndex ? h(Svg, { d: I.check, s: 11, w: 3 }) : null, v.name.split('—')[1] || v.name));
          }))),

      // ---- fullscreen overlay ----
      full ? h('div', { className: 'cx-fsoverlay', 'data-screen-label': 'Полноэкранный просмотр' },
        h('button', { className: 'cx-fs__close', title: 'Закрыть (Esc)', onClick: () => setFull(false) }, h(Svg, { d: I.close, s: 18 })),
        h('button', { className: 'cx-fs__nav cx-fs__nav--l', onClick: onPrev, disabled: current === 0 }, h(Svg, { d: I.chevL, s: 22 })),
        h('div', { className: 'cx-fs__slide' }, slideEl),
        h('button', { className: 'cx-fs__nav cx-fs__nav--r', onClick: onNext, disabled: current >= total - 1 }, h(Svg, { d: I.chevR, s: 22 })),
        h('div', { className: 'cx-fs__counter' }, `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`)) : null
    );
  }

  window.CXCanvasStage = CanvasStage;
})();
