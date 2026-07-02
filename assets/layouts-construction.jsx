/* global React */
/* ============================================================
   Presa — Construction template pack (8 bespoke layouts)
   Self-contained renderers (own background + footer). Registered
   into window.PresaExtraLayouts; SlideRenderer treats every key
   here as a self-contained layout. Theme-aware via palette `p`:
   accent → amber (industrial), title/body/border/bg/panel adapt.
   ============================================================ */
(function () {
  const h = React.createElement;
  const z = (base, scale) => `${(base * (scale || 1)).toFixed(2)}cqw`;
  const DISPLAY = 'var(--font-sans)';

  const GRAPHITE = '#15181C';      // fixed dark panel for cover/numbers/cta
  const slideBase = { containerType: 'inline-size', position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: 'var(--font-sans)' };

  function Icon({ name, color, size, stroke }) {
    const set = (window.PresaIcons) || {};
    const ic = set[name] || set.box || [];
    const fill = ic && ic.f;
    const paths = fill ? ic.p : ic;
    const vb = fill ? (ic.vb || '0 -960 960 960') : '0 0 24 24';
    return h('svg', { width: size, height: size, viewBox: vb, fill: fill ? color : 'none', stroke: fill ? 'none' : color, strokeWidth: fill ? 0 : (stroke || 1.7), strokeLinecap: 'round', strokeLinejoin: 'round', style: { width: size, height: size, flex: '0 0 auto' } },
      paths.map((d, i) => h('path', { key: i, d })));
  }

  // blueprint grid overlay
  function Blueprint({ ink, opacity }) {
    const c = ink ? 'rgba(21,24,28,.05)' : 'rgba(255,255,255,.10)';
    return h('div', { style: { position: 'absolute', inset: 0, opacity: opacity == null ? 1 : opacity, backgroundImage: `linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px)`, backgroundSize: '4.4cqw 4.4cqw', pointerEvents: 'none' } });
  }

  // section label: ▮ 03  НАПРАВЛЕНИЯ
  function Sec({ label, num, p, scale, onDark }) {
    const muted = onDark ? 'rgba(255,255,255,.6)' : p.body;
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: '1.4cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.5, scale), letterSpacing: '.22em', textTransform: 'uppercase', color: muted } },
      h('span', { style: { width: '3.4cqw', height: '0.28cqw', background: p.accent, display: 'inline-block' } }),
      num ? h('span', { style: { color: p.accent } }, num) : null,
      label ? h('span', null, label) : null);
  }

  // corner page index (top-right) for content slides
  function Corner({ n, total, p, onDark }) {
    return h('span', { style: { position: 'absolute', right: '6cqw', top: '6cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.5cqw', letterSpacing: '.06em', color: onDark ? 'rgba(255,255,255,.5)' : p.faint, zIndex: 5 } },
      String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0'));
  }

  const IMG = (src) => src || '';
  function brandName(B) { return (B && B.name) || 'СТРОЙМОНОЛИТ'; }

  /* ===== 1. COVER — split dark panel + photo ===== */
  function L_conCover(f, p, scale, B, n, total) {
    const acc = (f.titleAccent || '').trim();
    const stats = (f.stats || []).slice(0, 2);
    return h('div', { className: 'slide', style: { ...slideBase, display: 'grid', gridTemplateColumns: '1.04fr 0.96fr', background: GRAPHITE, color: '#fff' } },
      // left panel
      h('div', { key: 'l', style: { position: 'relative', padding: '6cqw', display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
        h(Blueprint, { opacity: 0.7 }),
        h('div', { style: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.3cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: '2cqw', letterSpacing: '.04em' } },
          h('span', { style: { width: '2.9cqw', height: '2.9cqw', borderRadius: '0.6cqw', background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
            h(Icon, { name: 'box', color: '#fff', size: '1.8cqw', stroke: 2 })),
          brandName(B)),
        h('div', { style: { position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          h('div', { 'data-f': 'eyebrow', style: { display: 'flex', alignItems: 'center', gap: '1.6cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.5, scale), letterSpacing: '.2em', textTransform: 'uppercase', color: p.accent, marginBottom: '2.6cqw' } },
            h('span', { style: { width: '5cqw', height: '0.3cqw', background: p.accent } }), f.eyebrow || ''),
          h('h1', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 800, fontSize: z(4, scale), lineHeight: 1.07, letterSpacing: '-0.025em', margin: 0 } },
            f.title || '', acc ? [' ', h('em', { key: 'a', 'data-f': 'titleAccent', style: { fontStyle: 'normal', color: p.accent } }, acc)] : null),
          f.subtitle ? h('p', { 'data-f': 'subtitle', style: { margin: '3.2cqw 0 0', fontSize: z(1.7, scale), lineHeight: 1.5, color: 'rgba(255,255,255,.78)', maxWidth: '88%' } }, f.subtitle) : null),
        h('div', { style: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: DISPLAY, fontWeight: 600, fontSize: '1.5cqw', letterSpacing: '.04em', color: 'rgba(255,255,255,.6)' } },
          h('span', { 'data-f': 'footerLabel' }, f.footerLabel || ''),
          h('span', { style: { color: p.accent } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')))),
      // right photo + chip
      h('div', { key: 'r', style: { position: 'relative', overflow: 'hidden' } },
        h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.5cqw', background: p.accent, zIndex: 2 } }),
        f.image
          ? h('img', { 'data-f': 'image', src: IMG(f.image), alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
          : h('div', { 'data-f': 'image', style: { position: 'absolute', inset: 0, background: '#2A2E35', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)', fontSize: '1.6cqw', fontFamily: DISPLAY } }, 'Фото объекта'),
        h('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(12,13,15,0),rgba(12,13,15,.26))' } }),
        stats.length ? h('div', { style: { position: 'absolute', left: 0, bottom: '6cqw', zIndex: 3, display: 'flex', alignItems: 'center', gap: '1.8cqw', background: '#fff', color: p.title, padding: '1.7cqw 2.4cqw', borderRadius: '0 1cqw 1cqw 0', boxShadow: '0 1cqw 3cqw rgba(0,0,0,.32)' } },
          stats.map((s, i) => [
            i ? h('span', { key: 'd' + i, style: { width: '1px', height: '3.4cqw', background: p.border } }) : null,
            h('b', { key: 'v' + i, 'data-f': 'stats', 'data-fi': i, style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(3, scale), letterSpacing: '-0.02em', lineHeight: 1 } }, s.value || ''),
            h('s', { key: 's' + i, style: { textDecoration: 'none', fontSize: z(1.25, scale), lineHeight: 1.2, color: p.body, whiteSpace: 'pre-line' } }, s.label || '')
          ])) : null));
  }

  /* ===== 2. ABOUT — split + metrics ===== */
  function L_conAbout(f, p, scale, B, n, total) {
    const acc = (f.titleAccent || '').trim();
    const stats = (f.stats || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, display: 'grid', gridTemplateColumns: '1.15fr 1fr', background: p.bg, color: p.title } },
      h(Corner, { n, total, p }),
      h('div', { key: 'l', style: { padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: 'О компании', num: '02', p, scale }),
        h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(4.2, scale), lineHeight: 1.08, letterSpacing: '-0.02em', margin: '3cqw 0 0' } },
          f.title || '', acc ? [h('br', { key: 'b' }), h('em', { key: 'a', 'data-f': 'titleAccent', style: { fontStyle: 'normal', color: p.accent } }, acc)] : null),
        f.text ? h('p', { 'data-f': 'text', style: { margin: '2.6cqw 0 0', color: p.body, fontSize: z(1.9, scale), lineHeight: 1.55, maxWidth: '92%' } }, f.text) : null),
      h('div', { key: 'r', style: { position: 'relative', background: p.panel, padding: '6cqw 5cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h('div', { style: { position: 'absolute', left: 0, top: '6cqw', bottom: '6cqw', width: '0.4cqw', background: p.accent } }),
        stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { display: 'flex', alignItems: 'baseline', gap: '1.8cqw', padding: '2.6cqw 0', borderBottom: i < stats.length - 1 ? `1px solid ${p.border}` : 'none' } },
          h('b', { style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(5, scale), letterSpacing: '-0.03em', color: p.title, minWidth: '8.5cqw' } }, s.value || ''),
          h('span', { style: { fontSize: z(1.7, scale), lineHeight: 1.3, color: p.body, whiteSpace: 'pre-line' } }, s.label || '')))));
  }

  /* ===== 3. SERVICES — grid table ===== */
  function L_conServices(f, p, scale, B, n, total) {
    const cards = (f.cards || []).slice(0, 6);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      h(Corner, { n, total, p }),
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Направления', num: '03', p, scale }),
        h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(4.2, scale), letterSpacing: '-0.02em', margin: '1.8cqw 0 0' } }, f.title || ''),
        h('div', { style: { marginTop: '2.6cqw', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridAutoRows: '1fr', borderTop: `1px solid ${p.border}`, borderLeft: `1px solid ${p.border}` } },
          cards.map((c, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { padding: '2.1cqw 2.4cqw', borderRight: `1px solid ${p.border}`, borderBottom: `1px solid ${p.border}`, display: 'flex', flexDirection: 'column' } },
            h('div', { style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.5, scale), color: p.accent, letterSpacing: '.04em' } }, String(i + 1).padStart(2, '0')),
            h('div', { style: { marginTop: '1cqw' } }, h(Icon, { name: c.icon || 'box', color: p.title, size: '3cqw', stroke: 1.7 })),
            h('div', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(2.1, scale), margin: '1cqw 0 0', letterSpacing: '-0.01em' } }, c.heading || ''),
            c.text ? h('div', { style: { margin: '0.6cqw 0 0', fontSize: z(1.4, scale), lineHeight: 1.38, color: p.body } }, c.text) : null)))));
  }

  /* ===== 4. PROCESS — horizontal stepper ===== */
  function L_conProcess(f, p, scale, B, n, total) {
    const steps = (f.steps || []).slice(0, 5);
    const nn = Math.max(steps.length, 1);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      h(Corner, { n, total, p }),
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Как мы работаем', num: '04', p, scale }),
        h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(4.2, scale), letterSpacing: '-0.02em', margin: '1.8cqw 0 0' } }, f.title || ''),
        h('div', { style: { marginTop: 'auto', display: 'grid', gridTemplateColumns: `repeat(${nn},1fr)`, gap: '2.2cqw', position: 'relative', paddingTop: '4cqw' } },
          h('div', { style: { position: 'absolute', left: '1.5cqw', right: '1.5cqw', top: '5.1cqw', height: '0.18cqw', background: p.border } }),
          steps.map((s, i) => h('div', { key: i, 'data-f': 'steps', 'data-fi': i, style: { position: 'relative' } },
            h('div', { style: { width: '2.2cqw', height: '2.2cqw', borderRadius: '50%', background: p.bg, border: `0.35cqw solid ${p.accent}`, position: 'relative', zIndex: 2 } }),
            h('div', { style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.4, scale), color: p.accent, marginTop: '1.8cqw', letterSpacing: '.04em' } }, 'ЭТАП ' + String(i + 1).padStart(2, '0')),
            h('div', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(2, scale), margin: '0.6cqw 0 0' } }, s.title || ''),
            s.desc ? h('div', { style: { margin: '0.7cqw 0 0', fontSize: z(1.4, scale), lineHeight: 1.4, color: p.body } }, s.desc) : null)))));
  }

  /* ===== 5. PROJECTS — gallery (1 big + 2 small) ===== */
  function L_conProjects(f, p, scale, B, n, total) {
    const items = (f.projects || []).slice(0, 3);
    const cap = (it, big) => h('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '2cqw', background: 'linear-gradient(0deg,rgba(12,13,15,.82),transparent)', color: '#fff' } },
      h('div', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(big ? 2.6 : 2, scale) } }, it.title || ''),
      it.meta ? h('div', { style: { fontSize: z(1.35, scale), color: 'rgba(255,255,255,.8)', marginTop: '0.4cqw' } }, it.meta) : null);
    const cell = (it, i, extra) => h('div', { key: i, 'data-f': 'projects', 'data-fi': i, style: { position: 'relative', borderRadius: '1cqw', overflow: 'hidden', background: '#ddd', ...(extra || {}) } },
      it && it.image ? h('img', { src: IMG(it.image), alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
        : h('div', { style: { position: 'absolute', inset: 0, background: p.panel } }),
      it ? cap(it, !!(extra && extra.gridRow)) : null);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      h(Corner, { n, total, p }),
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Наши объекты', num: '05', p, scale }),
        h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(4.2, scale), letterSpacing: '-0.02em', margin: '1.8cqw 0 0' } }, f.title || ''),
        h('div', { style: { marginTop: '3.4cqw', flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gridTemplateRows: '1fr 1fr', gap: '1.6cqw' } },
          cell(items[0], 0, { gridRow: '1 / span 2' }),
          cell(items[1], 1),
          cell(items[2], 2))));
  }

  /* ===== 6. NUMBERS — dark ===== */
  function L_conNumbers(f, p, scale, B, n, total) {
    const stats = (f.stats || []).slice(0, 4);
    const nn = Math.max(stats.length, 1);
    return h('div', { className: 'slide', style: { ...slideBase, background: GRAPHITE, color: '#fff' } },
      h(Corner, { n, total, p, onDark: true }),
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Результаты', num: '06', p, scale, onDark: true }),
        h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(4.2, scale), letterSpacing: '-0.02em', margin: '1.8cqw 0 0', maxWidth: '70%' } }, f.title || ''),
        h('div', { style: { marginTop: 'auto', display: 'grid', gridTemplateColumns: `repeat(${nn},1fr)`, borderTop: '1px solid rgba(255,255,255,.14)' } },
          stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { paddingTop: '3.4cqw' } },
            h('div', { style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(7, scale), letterSpacing: '-0.04em', lineHeight: 0.95, color: '#fff' } },
              s.value || '', s.unit ? h('em', { style: { fontStyle: 'normal', color: p.accent } }, s.unit) : null),
            h('div', { style: { marginTop: '1.4cqw', fontSize: z(1.6, scale), lineHeight: 1.35, color: 'rgba(255,255,255,.66)', maxWidth: '88%' } }, s.label || ''))))));
  }

  /* ===== 7. WHY — 2×2 + photo ===== */
  function L_conWhy(f, p, scale, B, n, total) {
    const cards = (f.cards || []).slice(0, 4);
    const soft = `color-mix(in srgb, ${p.accent} 14%, #fff)`;
    const deep = `color-mix(in srgb, ${p.accent} 80%, #000)`;
    return h('div', { className: 'slide', style: { ...slideBase, display: 'grid', gridTemplateColumns: '1fr 0.62fr', background: p.bg, color: p.title } },
      h('div', { key: 'l', style: { padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Почему мы', num: '07', p, scale }),
        h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(3.6, scale), letterSpacing: '-0.02em', margin: '1.8cqw 0 0' } }, f.title || ''),
        h('div', { style: { marginTop: '3.6cqw', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.4cqw', alignContent: 'center' } },
          cards.map((c, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { display: 'flex', gap: '1.8cqw', alignItems: 'flex-start' } },
            h('div', { style: { width: '4.2cqw', height: '4.2cqw', borderRadius: '1cqw', background: soft, color: deep, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
              h(Icon, { name: c.icon || 'badge', color: deep, size: '2.4cqw', stroke: 1.9 })),
            h('div', null,
              h('div', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(2.1, scale) } }, c.heading || ''),
              c.text ? h('div', { style: { margin: '0.6cqw 0 0', fontSize: z(1.45, scale), lineHeight: 1.42, color: p.body } }, c.text) : null))))),
      h('div', { key: 'r', style: { position: 'relative', background: p.panel } },
        f.image ? h('img', { 'data-f': 'image', src: IMG(f.image), alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
          : h('div', { 'data-f': 'image', style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.faint, fontSize: '1.6cqw', fontFamily: DISPLAY } }, 'Фото'),
        h('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0),rgba(21,24,28,.12))' } })));
  }

  /* ===== 8. CTA — dark ===== */
  function L_conCta(f, p, scale, B, n, total) {
    const acc = (f.titleAccent || '').trim();
    const contacts = (f.contacts || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, background: GRAPHITE, color: '#fff' } },
      h(Blueprint, { opacity: 1 }),
      h('span', { style: { position: 'absolute', right: '6cqw', top: '6cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.6cqw', color: 'rgba(255,255,255,.5)', letterSpacing: '.16em', zIndex: 5 } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')),
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 } },
        h(Sec, { label: f.eyebrow || 'Следующий шаг', p, scale }),
        h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(6, scale), letterSpacing: '-0.025em', lineHeight: 1.04, maxWidth: '80%', margin: '2.4cqw 0 0' } },
          f.title || '', acc ? [' ', h('em', { key: 'a', 'data-f': 'titleAccent', style: { fontStyle: 'normal', color: p.accent } }, acc)] : null),
        h('div', { style: { marginTop: '5cqw', display: 'flex', alignItems: 'center', gap: '3cqw', flexWrap: 'wrap' } },
          f.buttonLabel ? h('span', { 'data-f': 'buttonLabel', style: { display: 'inline-flex', alignItems: 'center', gap: '1.2cqw', background: p.accent, color: '#fff', fontFamily: DISPLAY, fontWeight: 600, fontSize: z(2, scale), padding: '1.8cqw 3cqw', borderRadius: '1cqw' } },
            f.buttonLabel, h('svg', { width: '2cqw', height: '2cqw', viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M5 12h14' }), h('path', { d: 'M13 6l6 6-6 6' }))) : null,
          contacts.length ? h('div', { style: { display: 'flex', gap: '3.4cqw', fontFamily: DISPLAY, fontWeight: 600, fontSize: z(1.8, scale), color: 'rgba(255,255,255,.82)', flexWrap: 'wrap' } },
            contacts.map((c, i) => h('span', { key: i, 'data-f': 'contacts', 'data-fi': i, style: { display: 'flex', alignItems: 'center', gap: '1cqw' } },
              h('span', { style: { width: '1cqw', height: '1cqw', borderRadius: '50%', background: p.accent } }), c))) : null)));
  }

  window.PresaExtraLayouts = Object.assign(window.PresaExtraLayouts || {}, {
    con_cover: L_conCover, con_about: L_conAbout, con_services: L_conServices,
    con_process: L_conProcess, con_projects: L_conProjects, con_numbers: L_conNumbers,
    con_why: L_conWhy, con_cta: L_conCta
  });
})();
