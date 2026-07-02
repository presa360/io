/* global React */
/* ============================================================
   Presa — Template Pack 2 (data-viz & structure)
   Self-contained, theme-aware renderers registered into
   window.PresaExtraLayouts. Fills audited gaps: KPI dashboard,
   stat hero, bar-compare, ring KPIs, feature matrix, section divider.
   Palette `p`: bg, panel, title, body, accent, accentSoft, dark.
   ============================================================ */
(function () {
  const h = React.createElement;
  const z = (base, scale) => `${(base * (scale || 1)).toFixed(2)}cqw`;
  const DISPLAY = 'var(--font-sans)';
  const num = (v) => { const m = String(v == null ? '' : v).replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; };
  const slideBase = { containerType: 'inline-size', position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: 'var(--font-sans)' };
  const mix = (c, pct, other) => `color-mix(in srgb, ${c} ${pct}%, ${other || '#fff'})`;
  const border = (p) => p.dark ? 'rgba(255,255,255,.14)' : mix(p.title, 12, '#fff');
  const softPanel = (p) => p.dark ? 'rgba(255,255,255,.05)' : p.panel;

  function Icon({ name, color, size, stroke }) {
    const set = (window.PresaIcons) || {};
    const ic = set[name]; if (!ic) return null;
    const fill = ic && ic.f;
    const paths = fill ? ic.p : ic;
    const vb = fill ? (ic.vb || '0 -960 960 960') : '0 0 24 24';
    return h('svg', { width: size, height: size, viewBox: vb, fill: fill ? color : 'none', stroke: fill ? 'none' : color, strokeWidth: fill ? 0 : (stroke || 1.7), strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: '0 0 auto' } },
      paths.map((d, i) => h('path', { key: i, d })));
  }
  // section eyebrow: ▮ label
  function Sec({ label, p, scale, onDark }) {
    if (!label) return null;
    return h('div', { 'data-f': 'eyebrow', style: { display: 'flex', alignItems: 'center', gap: '1.3cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.5, scale), letterSpacing: '.2em', textTransform: 'uppercase', color: onDark ? 'rgba(255,255,255,.62)' : p.body } },
      h('span', { style: { width: '3.2cqw', height: '0.28cqw', background: p.accent } }), label);
  }
  function Head({ f, p, scale, onDark, max }) {
    return h('h2', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(3.9, scale), letterSpacing: '-0.02em', lineHeight: 1.08, margin: '1.6cqw 0 0', color: onDark ? '#fff' : p.title, maxWidth: max || '92%' } }, f.title || '');
  }
  const trendColor = (d, p) => { const s = String(d || '').trim(); if (/^[-–]|↓|▼/.test(s) || num(s) < 0) return '#E5484D'; if (/^\+|↑|▲/.test(s) || num(s) > 0) return p.dark ? '#3DD68C' : '#15924A'; return p.body; };
  const trendArrow = (d) => { const s = String(d || '').trim(); if (/^[-–]|↓|▼/.test(s) || num(s) < 0) return '▾'; if (s) return '▴'; return ''; };

  /* ===== 1. KPI DASHBOARD (numbers) ===== */
  function L_kpiDashboard(f, p, scale, B, n, total) {
    const items = (f.stats || []).slice(0, 4);
    const cols = items.length <= 2 ? items.length : (items.length === 3 ? 3 : 2);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Ключевые показатели', p, scale }),
        h(Head, { f, p, scale }),
        h('div', { style: { marginTop: '3.4cqw', flex: 1, display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gridAutoRows: '1fr', gap: '1.8cqw' } },
          items.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { position: 'relative', background: softPanel(p), border: `1px solid ${border(p)}`, borderRadius: '1.4cqw', padding: '2.6cqw 2.6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' } },
            h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.4cqw', background: p.accent } }),
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1cqw' } },
              h('span', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(1.55, scale), color: p.body, letterSpacing: '.01em' } }, s.label || ''),
              s.icon ? h('span', { style: { color: p.accent } }, h(Icon, { name: s.icon, color: p.accent, size: '2.4cqw', stroke: 1.8 })) : null),
            h('div', { style: { marginTop: '1.6cqw' } },
              h('div', { style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(5.4, scale), letterSpacing: '-0.03em', lineHeight: 0.98 } }, s.value || ''),
              s.delta ? h('div', { style: { marginTop: '0.9cqw', display: 'inline-flex', alignItems: 'center', gap: '0.6cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.5, scale), color: trendColor(s.delta, p) } },
                h('span', null, trendArrow(s.delta)), s.delta) : null)))) ));
  }

  /* ===== 2. STAT HERO (numbers) — one giant metric + supporting points ===== */
  function L_statHero(f, p, scale, B, n, total) {
    const pts = (f.points || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', background: p.bg, color: p.title } },
      h('div', { key: 'l', style: { background: p.dark ? softPanel(p) : p.accent, color: '#fff', padding: '6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' } },
        h(Sec, { label: f.eyebrow || 'Главный результат', p: { ...p, body: 'rgba(255,255,255,.7)', accent: '#fff' }, scale, onDark: true }),
        h('div', { 'data-f': 'value', style: { fontFamily: DISPLAY, fontWeight: 800, fontSize: z(11, scale), letterSpacing: '-0.04em', lineHeight: 0.9, margin: '2cqw 0 0' } },
          f.value || '', f.unit ? h('span', { style: { fontSize: z(5, scale), opacity: 0.85 } }, f.unit) : null),
        f.caption ? h('div', { 'data-f': 'caption', style: { marginTop: '2.4cqw', fontSize: z(2, scale), lineHeight: 1.4, color: 'rgba(255,255,255,.9)', maxWidth: '88%' } }, f.caption) : null),
      h('div', { key: 'r', style: { padding: '6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h(Head, { f, p, scale, max: '100%' }),
        h('div', { style: { marginTop: '2.6cqw', display: 'flex', flexDirection: 'column', gap: '0' } },
          pts.map((s, i) => h('div', { key: i, 'data-f': 'points', 'data-fi': i, style: { display: 'flex', gap: '1.6cqw', alignItems: 'flex-start', padding: '2cqw 0', borderTop: `1px solid ${border(p)}` } },
            h('span', { style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.6, scale), color: p.accent, marginTop: '0.2cqw' } }, String(i + 1).padStart(2, '0')),
            h('div', null,
              h('div', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(2, scale) } }, s.heading || ''),
              s.text ? h('div', { style: { marginTop: '0.5cqw', fontSize: z(1.5, scale), lineHeight: 1.4, color: p.body } }, s.text) : null))))) );
  }

  /* ===== 3. BAR COMPARE (chart) — labeled horizontal bars ===== */
  function L_barCompare(f, p, scale, B, n, total) {
    const data = (f.data || []).slice(0, 6);
    const max = Math.max(...data.map((d) => num(d.value)), 1);
    const hi = data.reduce((bi, d, i, a) => num(d.value) > num(a[bi].value) ? i : bi, 0);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Сравнение', p, scale }),
        h(Head, { f, p, scale }),
        f.caption ? h('div', { 'data-f': 'caption', style: { marginTop: '1cqw', fontSize: z(1.6, scale), color: p.body } }, f.caption) : null,
        h('div', { style: { marginTop: '3cqw', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.8cqw' } },
          data.map((d, i) => {
            const w = Math.max(6, (num(d.value) / max) * 100);
            const on = i === hi;
            return h('div', { key: i, 'data-f': 'data', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: '14cqw 1fr', alignItems: 'center', gap: '2cqw' } },
              h('span', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(1.7, scale), color: p.title, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, d.label || ''),
              h('div', { style: { position: 'relative', height: '4.2cqw', background: softPanel(p), borderRadius: '0.6cqw', overflow: 'hidden' } },
                h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: w + '%', background: on ? p.accent : mix(p.accent, p.dark ? 40 : 28, p.dark ? '#000' : '#fff'), borderRadius: '0.6cqw', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '1.4cqw' } },
                  h('span', { style: { fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.6, scale), color: on ? '#fff' : p.title } }, d.value || ''))));
          }))));
  }

  /* ===== 4. RING KPIs (chart) — 3 donut gauges ===== */
  function Ring({ pct, color, track, label, value, p, scale }) {
    const R = 42, C = 2 * Math.PI * R, off = C * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.6cqw' } },
      h('div', { style: { position: 'relative', width: '20cqw', height: '20cqw' } },
        h('svg', { viewBox: '0 0 100 100', style: { width: '100%', height: '100%', transform: 'rotate(-90deg)' } },
          h('circle', { cx: 50, cy: 50, r: R, fill: 'none', stroke: track, strokeWidth: 9 }),
          h('circle', { cx: 50, cy: 50, r: R, fill: 'none', stroke: color, strokeWidth: 9, strokeLinecap: 'round', strokeDasharray: C, strokeDashoffset: off })),
        h('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(3, scale), letterSpacing: '-0.02em', color: p.title } }, value)),
      h('div', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(1.7, scale), color: p.body, textAlign: 'center', maxWidth: '22cqw', lineHeight: 1.3 } }, label));
  }
  function L_ringKpis(f, p, scale, B, n, total) {
    const items = (f.stats || []).slice(0, 3);
    const track = p.dark ? 'rgba(255,255,255,.1)' : mix(p.accent, 16, '#fff');
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Метрики', p, scale }),
        h(Head, { f, p, scale }),
        h('div', { style: { marginTop: 'auto', marginBottom: 'auto', display: 'grid', gridTemplateColumns: `repeat(${Math.max(items.length,1)},1fr)`, gap: '2cqw', paddingTop: '2cqw' } },
          items.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { display: 'flex', justifyContent: 'center' } },
            h(Ring, { pct: num(s.pct != null ? s.pct : s.value), value: s.value || (num(s.pct) + '%'), label: s.label || '', color: p.accent, track, p, scale }))))));
  }

  /* ===== 5. FEATURE MATRIX (comparison/table) ===== */
  function L_featureMatrix(f, p, scale, B, n, total) {
    const cols = (f.columns || ['Базовый', 'Бизнес', 'Премиум']).slice(0, 3);
    const rows = (f.rows || []).slice(0, 6);
    const hiCol = typeof f.highlight === 'number' ? f.highlight : 1;
    const mark = (v) => {
      const s = String(v == null ? '' : v).trim();
      if (s === '✓' || /^(да|yes|true|\+)$/i.test(s)) return h('span', { style: { color: p.accent, fontWeight: 700, fontSize: z(2.2, scale) } }, '✓');
      if (s === '✕' || s === '—' || /^(нет|no|false|-)$/i.test(s) || s === '') return h('span', { style: { color: p.dark ? 'rgba(255,255,255,.3)' : mix(p.title, 28, '#fff'), fontSize: z(2, scale) } }, '—');
      return h('span', { style: { fontFamily: DISPLAY, fontWeight: 600, fontSize: z(1.6, scale), color: p.title } }, s);
    };
    const colW = '1fr ' + cols.map(() => '0.66fr').join(' ');
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Sec, { label: f.eyebrow || 'Сравнение', p, scale }),
        h(Head, { f, p, scale }),
        h('div', { style: { marginTop: '3cqw', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          h('div', { style: { position: 'relative', borderRadius: '1.2cqw', overflow: 'hidden', border: `1px solid ${border(p)}` } },
            // highlight column band
            h('div', { style: { position: 'absolute', top: 0, bottom: 0, left: `calc((100% - 0px) * 0)`, width: 0 } }),
            // header
            h('div', { style: { display: 'grid', gridTemplateColumns: colW, background: softPanel(p), borderBottom: `1px solid ${border(p)}` } },
              [h('div', { key: 'h0', style: { padding: '1.8cqw 2.2cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.6, scale), color: p.body } }, f.rowsLabel || '')]
                .concat(cols.map((c, ci) => h('div', { key: 'h' + ci, style: { padding: '1.8cqw 1cqw', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.8, scale), color: ci === hiCol ? '#fff' : p.title, background: ci === hiCol ? p.accent : 'transparent' } }, c)))),
            rows.map((r, ri) => h('div', { key: ri, 'data-f': 'rows', 'data-fi': ri, style: { display: 'grid', gridTemplateColumns: colW, borderTop: ri ? `1px solid ${border(p)}` : 'none' } },
              [h('div', { key: 'c0', style: { padding: '1.6cqw 2.2cqw', fontFamily: DISPLAY, fontWeight: 600, fontSize: z(1.65, scale), color: p.title } }, r.feature || '')]
                .concat(cols.map((c, ci) => h('div', { key: 'c' + ci, style: { padding: '1.6cqw 1cqw', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ci === hiCol ? (p.dark ? 'rgba(255,255,255,.05)' : p.accentSoft) : 'transparent' } }, mark(r['c' + (ci + 1)])))))))) ));
  }

  /* ===== 6. SECTION DIVIDER (agenda) ===== */
  function L_sectionDivider(f, p, scale, B, n, total) {
    return h('div', { className: 'slide', style: { ...slideBase, background: p.dark ? p.bg : p.title, color: '#fff' } },
      h('div', { style: { position: 'absolute', inset: 0, opacity: p.dark ? 0.5 : 0.4, backgroundImage: `linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)`, backgroundSize: '5cqw 5cqw' } }),
      h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '1.1cqw', background: p.accent } }),
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw 8cqw', display: 'flex', alignItems: 'center', gap: '5cqw' } },
        f.num ? h('span', { 'data-f': 'num', style: { flex: '0 0 auto', fontFamily: DISPLAY, fontWeight: 800, fontSize: z(15, scale), letterSpacing: '-0.04em', color: p.accent, lineHeight: 1 } }, f.num) : null,
        h('div', { style: { flex: 1, minWidth: 0 } },
          h('div', { 'data-f': 'eyebrow', style: { display: 'flex', alignItems: 'center', gap: '1.6cqw', fontFamily: DISPLAY, fontWeight: 700, fontSize: z(1.6, scale), letterSpacing: '.22em', textTransform: 'uppercase', color: p.accent } },
            h('span', { style: { width: '4cqw', height: '0.3cqw', background: p.accent } }), f.eyebrow || 'Раздел'),
          h('h1', { 'data-f': 'title', style: { fontFamily: DISPLAY, fontWeight: 800, fontSize: z(6, scale), letterSpacing: '-0.025em', lineHeight: 1.04, margin: '1.8cqw 0 0' } }, f.title || ''),
          f.subtitle ? h('p', { 'data-f': 'subtitle', style: { margin: '2.2cqw 0 0', fontSize: z(2, scale), lineHeight: 1.45, color: 'rgba(255,255,255,.74)', maxWidth: '90%' } }, f.subtitle) : null)));
  }

  window.PresaExtraLayouts = Object.assign(window.PresaExtraLayouts || {}, {
    kpi_dashboard: L_kpiDashboard, stat_hero: L_statHero, bar_compare: L_barCompare,
    ring_kpis: L_ringKpis, feature_matrix: L_featureMatrix, section_divider: L_sectionDivider
  });
})();
