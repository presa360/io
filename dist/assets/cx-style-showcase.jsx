/* global React */
/* ============================================================
   Presa — StyleShowcase
   Rich, art-directed preview "mini-slides" for the style picker.
   Pure CSS/SVG (no photo assets). Scales via container queries:
   every dimension is in cqw, so the same composition reads well
   in a big card and in the small sidebar thumbnail.
   Exports window.CX.StyleShowcase({ design }).
   ============================================================ */
(function () {
  const h = React.createElement;
  const THEMES = (window.PresaData && window.PresaData.THEMES) || {};

  /* ---- tiny stroke-icon ---- */
  const ICN = {
    chart: 'M3 17l5-5 4 3 7-8M3 21h18',
    bolt: 'M13 2L4.5 12.5h6L11 22l8.5-11.5h-6L13 2z',
    layers: 'M12 3l9 5-9 5-9-5 9-5zM3 14l9 5 9-5',
    shield: 'M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z',
    target: 'M12 22a10 10 0 110-20 10 10 0 010 20zM12 17a5 5 0 110-10 5 5 0 010 10zM12 14a2 2 0 110-4 2 2 0 010 4z',
    growth: 'M3 17l6-6 4 4 8-9M14 6h7v7',
    check: 'M20 6L9 17l-5-5',
    spark: 'M12 3l2.2 6.3L20.5 12l-6.3 2.2L12 21l-2.2-6.8L3.5 12l6.3-2.7L12 3z'
  };
  function Icon(d, color, sz, w) {
    return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: w || 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { width: sz, height: sz, display: 'block' } },
      h('path', { d }));
  }
  function clampStyle(n) { return { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: n, overflow: 'hidden' }; }

  /* ---- palette from a theme key ---- */
  function pal(themeKey) {
    const t = THEMES[themeKey] || THEMES.tech || {};
    const dark = !!t.dark;
    return {
      bg: t.bg || '#fff', panel: t.panel || '#f4f6f8', title: t.title || '#0E1116',
      body: t.body || '#5B6573', accent: t.accent || '#E5322B', accentSoft: t.accentSoft || '#FFF2F0',
      dark,
      border: dark ? 'rgba(255,255,255,.12)' : 'rgba(14,17,22,.10)',
      borderS: dark ? 'rgba(255,255,255,.20)' : 'rgba(14,17,22,.16)',
      faint: dark ? 'rgba(255,255,255,.45)' : 'rgba(14,17,22,.42)'
    };
  }

  /* ============================================================
     SVG art pieces — all preserveAspectRatio slice to fill a box
     ============================================================ */
  function ArchFacade(p) {
    // abstract architecture: grey perspective facade + accent block
    const g1 = p.dark ? '#262a33' : '#e7eaee', g2 = p.dark ? '#1c2027' : '#d7dce2', g3 = p.dark ? '#30353f' : '#eef1f4';
    return h('div', { style: { position: 'relative', height: '100%', borderRadius: '1.8cqw', overflow: 'hidden', background: p.panel } },
      h('svg', { viewBox: '0 0 120 100', preserveAspectRatio: 'xMidYMid slice', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
        h('rect', { x: 0, y: 0, width: 120, height: 100, fill: g3 }),
        // tower block
        h('polygon', { points: '20,12 78,4 78,100 20,100', fill: g1 }),
        h('polygon', { points: '78,4 110,16 110,100 78,100', fill: g2 }),
        // floor lines
        ...Array.from({ length: 11 }, (_, i) => h('line', { key: 'f' + i, x1: 20, y1: 14 + i * 8, x2: 110, y2: 14 + i * 8 - 2, stroke: p.dark ? 'rgba(255,255,255,.06)' : 'rgba(14,17,22,.06)', strokeWidth: 1 })),
        // mullions
        ...Array.from({ length: 6 }, (_, i) => h('line', { key: 'm' + i, x1: 28 + i * 9, y1: 8, x2: 28 + i * 9, y2: 100, stroke: p.dark ? 'rgba(255,255,255,.05)' : 'rgba(14,17,22,.05)', strokeWidth: 1 })),
        // accent block
        h('rect', { x: 84, y: 60, width: 18, height: 18, fill: p.accent }),
        h('rect', { x: 84, y: 60, width: 18, height: 5, fill: 'rgba(255,255,255,.18)' })));
  }

  function Skyline(p, barColor) {
    const c = barColor || p.accent;
    const hs = [38, 64, 50, 82, 58, 94, 70, 46, 30];
    return h('div', { style: { position: 'relative', height: '100%', borderRadius: '1.8cqw', overflow: 'hidden', background: p.dark ? '#0f120f' : p.panel } },
      h('svg', { viewBox: '0 0 120 100', preserveAspectRatio: 'xMidYEnd slice', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
        hs.map((v, i) => h('rect', { key: i, x: 6 + i * 13, y: 100 - v, width: 10, height: v, rx: 1.5, fill: i % 3 === 1 ? c : (p.dark ? '#2c3a31' : '#cfd8d1') })),
        h('line', { x1: 0, y1: 99, x2: 120, y2: 99, stroke: p.dark ? 'rgba(255,255,255,.14)' : 'rgba(14,17,22,.12)', strokeWidth: 1.5 })));
  }

  function Mountains(p) {
    return h('div', { style: { position: 'relative', height: '100%', borderRadius: '1.8cqw', overflow: 'hidden', background: 'linear-gradient(180deg,#f4f5f6,#e9ebee)' } },
      h('svg', { viewBox: '0 0 120 100', preserveAspectRatio: 'xMidYMid slice', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
        h('circle', { cx: 92, cy: 24, r: 11, fill: '#dfe2e6' }),
        h('polygon', { points: '-4,100 34,40 60,72 78,48 124,100', fill: '#c4c9cf' }),
        h('polygon', { points: '-4,100 50,54 88,86 124,58 124,100', fill: '#aab0b8' }),
        h('polygon', { points: '34,40 44,52 30,58', fill: '#eef0f2' }),
        h('polygon', { points: '78,48 86,60 70,62', fill: '#eef0f2' })));
  }

  function Pipes(p) {
    const steel = '#9aa0a6', steelD = '#6f7479', accent = p.accent;
    return h('div', { style: { position: 'relative', height: '100%', borderRadius: '1.8cqw', overflow: 'hidden', background: 'linear-gradient(180deg,#3a3d42,#2a2c30)' } },
      h('svg', { viewBox: '0 0 120 100', preserveAspectRatio: 'xMidYMid slice', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
        // verticals
        h('rect', { x: 14, y: 6, width: 11, height: 94, rx: 4, fill: steel }),
        h('rect', { x: 14, y: 6, width: 4, height: 94, fill: 'rgba(255,255,255,.18)' }),
        h('rect', { x: 40, y: 18, width: 9, height: 82, rx: 4, fill: accent }),
        h('rect', { x: 40, y: 18, width: 3, height: 82, fill: 'rgba(255,255,255,.22)' }),
        h('rect', { x: 88, y: 10, width: 12, height: 90, rx: 4, fill: steelD }),
        h('rect', { x: 88, y: 10, width: 4, height: 90, fill: 'rgba(255,255,255,.12)' }),
        // horizontals
        h('rect', { x: 0, y: 40, width: 120, height: 8, rx: 4, fill: steel }),
        h('rect', { x: 0, y: 70, width: 120, height: 7, rx: 3.5, fill: steelD }),
        // flanges
        h('circle', { cx: 19.5, cy: 44, r: 7, fill: '#cfd3d7' }), h('circle', { cx: 19.5, cy: 44, r: 3, fill: '#73787d' }),
        h('circle', { cx: 44.5, cy: 73.5, r: 6.5, fill: '#cfd3d7' }), h('circle', { cx: 44.5, cy: 73.5, r: 2.6, fill: accent })));
  }

  function MiniLine(color, dir) {
    const up = dir !== 'down';
    const pts = up ? '2,32 16,26 30,28 44,18 58,20 72,10 86,6 98,3' : '2,8 16,12 30,10 44,18 58,16 72,24 86,28 98,33';
    return h('svg', { viewBox: '0 0 100 38', preserveAspectRatio: 'none', style: { width: '100%', height: '8cqw', display: 'block' } },
      h('polyline', { points: pts + ' 98,38 2,38', fill: color, opacity: 0.12, stroke: 'none' }),
      h('polyline', { points: pts, fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  }

  function AreaChart(color, p) {
    return h('svg', { viewBox: '0 0 120 56', preserveAspectRatio: 'none', style: { width: '100%', height: '100%', display: 'block' } },
      h('defs', null, h('linearGradient', { id: 'ag', x1: 0, y1: 0, x2: 0, y2: 1 },
        h('stop', { offset: '0%', stopColor: color, stopOpacity: 0.32 }), h('stop', { offset: '100%', stopColor: color, stopOpacity: 0.02 }))),
      h('polyline', { points: '0,44 18,38 36,40 54,28 72,30 90,16 108,12 120,6 120,56 0,56', fill: 'url(#ag)', stroke: 'none' }),
      h('polyline', { points: '0,44 18,38 36,40 54,28 72,30 90,16 108,12 120,6', fill: 'none', stroke: color, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  }

  function DashMock(p) {
    const bar = p.accent, soft = p.dark ? '#2a2f3a' : '#e3e9f4', soft2 = p.dark ? '#222633' : '#eef2f9';
    const hs = [40, 62, 30, 78, 54, 88];
    return h('div', { style: { height: '100%', borderRadius: '1.8cqw', overflow: 'hidden', background: p.dark ? '#13161e' : '#fff', border: '0.15cqw solid ' + p.border, boxShadow: '0 1cqw 3cqw rgba(14,17,22,.10)' } },
      h('div', { style: { display: 'flex', height: '100%' } },
        // sidebar
        h('div', { style: { width: '22%', background: soft2, padding: '2cqw 1.4cqw', display: 'flex', flexDirection: 'column', gap: '1.2cqw' } },
          h('div', { style: { width: '60%', height: '1.6cqw', borderRadius: '1cqw', background: bar } }),
          ...Array.from({ length: 4 }, (_, i) => h('div', { key: i, style: { width: i === 0 ? '90%' : '70%', height: '1.3cqw', borderRadius: '1cqw', background: soft } }))),
        // main
        h('div', { style: { flex: 1, padding: '2cqw 2.2cqw', display: 'flex', flexDirection: 'column', gap: '1.4cqw' } },
          h('div', { style: { display: 'flex', gap: '1.4cqw' } },
            h('div', { style: { flex: 1, height: '5cqw', borderRadius: '1cqw', background: soft2 } }),
            h('div', { style: { flex: 1, height: '5cqw', borderRadius: '1cqw', background: p.accentSoft } })),
          h('div', { style: { flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1.4cqw', paddingTop: '1cqw' } },
            hs.map((v, i) => h('div', { key: i, style: { flex: 1, height: v + '%', borderRadius: '0.8cqw 0.8cqw 0 0', background: i === 5 ? bar : soft } }))))));
  }

  /* ============================================================
     building blocks
     ============================================================ */
  function Title(p, text, size, accentTail) {
    return h('h3', { style: Object.assign({ margin: 0, fontWeight: 800, color: p.title, fontSize: (size || 5) + 'cqw', lineHeight: 1.08, letterSpacing: '-0.02em' }, clampStyle(3)) },
      text, accentTail ? h('span', { style: { color: p.accent } }, accentTail) : null);
  }
  function Sub(p, text, n) {
    return h('p', { style: Object.assign({ margin: '2cqw 0 0', color: p.body, fontSize: '2.25cqw', lineHeight: 1.4 }, clampStyle(n || 2)) }, text);
  }
  function StatChip(p, v, l) {
    return h('div', { style: { border: '0.15cqw solid ' + p.border, borderRadius: '1.4cqw', padding: '1.5cqw 1.6cqw', background: p.bg, minWidth: 0 } },
      h('div', { style: { fontWeight: 800, color: p.title, fontSize: '3.2cqw', lineHeight: 1, letterSpacing: '-0.02em' } }, v),
      h('div', { style: Object.assign({ color: p.body, fontSize: '1.45cqw', marginTop: '0.7cqw', lineHeight: 1.2 }, clampStyle(2)) }, l));
  }
  function MetricCard(p, v, l, dir) {
    return h('div', { style: { flex: 1, minWidth: 0, background: p.panel, border: '0.15cqw solid ' + p.border, borderRadius: '1.8cqw', padding: '1.8cqw' } },
      h('div', { style: { color: p.body, fontSize: '1.7cqw', fontWeight: 600 } }, l),
      h('div', { style: { color: p.accent, fontWeight: 800, fontSize: '4.4cqw', letterSpacing: '-0.03em', margin: '0.4cqw 0 1cqw' } }, v),
      MiniLine(p.accent, dir));
  }
  function FeatureBadge(p, ic, label, cap) {
    return h('div', { style: { flex: 1, minWidth: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9cqw' } },
      h('div', { style: { width: '7cqw', height: '7cqw', borderRadius: '50%', background: p.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, Icon(ic, p.accent, '3.4cqw', 2)),
      h('div', { style: Object.assign({ fontWeight: 700, color: p.title, fontSize: '1.85cqw', lineHeight: 1.1 }, clampStyle(1)) }, label),
      h('div', { style: Object.assign({ color: p.body, fontSize: '1.4cqw', lineHeight: 1.25 }, clampStyle(2)) }, cap));
  }
  function LogoRow(p, names) {
    return h('div', null,
      h('div', { style: { color: p.faint, fontSize: '1.5cqw', fontWeight: 600, letterSpacing: '.04em', marginBottom: '1.2cqw' } }, 'Нам доверяют'),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '3.4cqw', flexWrap: 'wrap' } },
        names.map((n, i) => h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '0.9cqw' } },
          h('span', { style: { width: '2.2cqw', height: '2.2cqw', borderRadius: '0.6cqw', background: i === 0 ? p.accent : (p.dark ? 'rgba(255,255,255,.3)' : 'rgba(14,17,22,.3)') } }),
          h('span', { style: { fontWeight: 800, fontSize: '2.1cqw', color: p.dark ? 'rgba(255,255,255,.78)' : 'rgba(14,17,22,.62)', letterSpacing: '-0.01em' } }, n)))));
  }

  /* ============================================================
     archetypes
     ============================================================ */
  function root(p, kids, padd) {
    return h('div', { style: { containerType: 'inline-size', position: 'relative', width: '100%', aspectRatio: '1.7', background: p.bg, color: p.title, overflow: 'hidden', fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)' } },
      h('div', { style: { position: 'absolute', inset: 0, padding: padd || '4.6cqw 5cqw', display: 'flex', flexDirection: 'column', gap: '3cqw' } }, kids));
  }

  function A_splitArch(p, c) {
    return root(p, [
      h('div', { key: 't', style: { display: 'flex', gap: '4cqw', flex: '1 1 0', minHeight: 0, alignItems: 'center' } },
        h('div', { style: { flex: '1.18', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          Title(p, c.title, 4.8), Sub(p, c.sub, 2)),
        h('div', { style: { flex: '1', alignSelf: 'stretch' } }, ArchFacade(p))),
      h('div', { key: 'c', style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5cqw', flex: '0 0 auto' } },
        c.stats.map((s, i) => h(React.Fragment, { key: i }, StatChip(p, s[0], s[1]))))
    ]);
  }

  function A_darkMetrics(p, c) {
    return root(p, [
      h('div', { key: 't', style: { display: 'flex', gap: '4cqw', flex: '1 1 0', minHeight: 0, alignItems: 'center' } },
        h('div', { style: { flex: '1.05', minWidth: 0 } }, Title(p, c.title, 4.6), Sub(p, c.sub, 3)),
        h('div', { style: { flex: '1.15', display: 'flex', gap: '1.6cqw', minWidth: 0 } },
          c.metrics.map((m, i) => h(React.Fragment, { key: i }, MetricCard(p, m.v, m.l, m.dir))))),
      h('div', { key: 'l', style: { flex: '0 0 auto' } }, LogoRow(p, c.logos))
    ]);
  }

  function A_productUI(p, c) {
    return root(p, [
      h('div', { key: 't', style: { display: 'flex', gap: '4cqw', flex: '1 1 0', minHeight: 0, alignItems: 'center' } },
        h('div', { style: { flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          Title(p, c.title, 4.6, c.titleTail), Sub(p, c.sub, 3)),
        h('div', { style: { flex: '1.12', alignSelf: 'stretch' } }, DashMock(p))),
      h('div', { key: 'f', style: { display: 'flex', gap: '2cqw', flex: '0 0 auto', borderTop: '0.15cqw solid ' + p.border, paddingTop: '2.4cqw' } },
        c.features.map((f, i) => h(React.Fragment, { key: i }, FeatureBadge(p, f[0], f[1], f[2]))))
    ]);
  }

  function A_skylineProof(p, c) {
    return root(p, [
      h('div', { key: 't', style: { display: 'flex', gap: '3.6cqw', flex: '1 1 0', minHeight: 0 } },
        h('div', { style: { flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          Title(p, c.title, 4.6), Sub(p, c.sub, 3)),
        h('div', { style: { flex: '1.05', display: 'flex', gap: '1.6cqw', minWidth: 0 } },
          h('div', { style: { flex: '1.4', alignSelf: 'stretch' } }, Skyline(p, c.barColor)),
          h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '1.4cqw', justifyContent: 'center' } },
            c.proof.map((pr, i) => h('div', { key: i, style: { background: i === 0 ? p.accent : p.panel, color: i === 0 ? '#fff' : p.title, borderRadius: '1.4cqw', padding: '1.5cqw 1.6cqw', border: i === 0 ? 'none' : '0.15cqw solid ' + p.border } },
              h('div', { style: { fontWeight: 800, fontSize: '3.4cqw', lineHeight: 1, letterSpacing: '-0.02em' } }, pr.v),
              h('div', { style: { fontSize: '1.5cqw', marginTop: '0.5cqw', opacity: i === 0 ? 0.85 : 1, color: i === 0 ? '#fff' : p.body } }, pr.l)))))),
      h('div', { key: 's', style: { flex: '0 0 auto', background: p.accent, color: '#fff', borderRadius: '1.4cqw', padding: '1.7cqw 2cqw', textAlign: 'center', fontWeight: 700, fontSize: '1.85cqw', letterSpacing: '.01em' } }, c.footer)
    ]);
  }

  function A_mountainsIcons(p, c) {
    return root(p, [
      h('div', { key: 't', style: { display: 'flex', gap: '4cqw', flex: '1 1 0', minHeight: 0, alignItems: 'center' } },
        h('div', { style: { flex: '1.05', minWidth: 0 } }, Title(p, c.title, 4.8), Sub(p, c.sub, 2)),
        h('div', { style: { flex: '1', alignSelf: 'stretch' } }, Mountains(p))),
      h('div', { key: 'i', style: { display: 'flex', gap: '2cqw', flex: '0 0 auto' } },
        c.icons.map((it, i) => h('div', { key: i, style: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '1.4cqw', borderTop: '0.3cqw solid ' + p.title, paddingTop: '1.5cqw' } },
          Icon(it[0], p.accent, '3.2cqw', 1.9),
          h('div', { style: { minWidth: 0 } },
            h('div', { style: Object.assign({ fontWeight: 700, color: p.title, fontSize: '1.85cqw', lineHeight: 1.1 }, clampStyle(1)) }, it[1]),
            h('div', { style: Object.assign({ color: p.body, fontSize: '1.4cqw', marginTop: '0.3cqw' }, clampStyle(1)) }, it[2])))))
    ]);
  }

  function A_pipesMetrics(p, c) {
    return root(p, [
      h('div', { key: 't', style: { display: 'flex', gap: '4cqw', flex: '1 1 0', minHeight: 0 } },
        h('div', { style: { flex: '0.85', alignSelf: 'stretch' } }, Pipes(p)),
        h('div', { style: { flex: '1.25', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          Title(p, c.title, 4.4), Sub(p, c.sub, 2),
          h('div', { style: { display: 'flex', gap: '3cqw', marginTop: '2.6cqw' } },
            c.metrics.map((m, i) => h('div', { key: i, style: { minWidth: 0 } },
              h('div', { style: { fontWeight: 800, color: p.accent, fontSize: '4.2cqw', lineHeight: 1, letterSpacing: '-0.02em' } }, m[0]),
              h('div', { style: Object.assign({ color: p.body, fontSize: '1.5cqw', marginTop: '0.7cqw', lineHeight: 1.2 }, clampStyle(2)) }, m[1]))))))
    ], '4.6cqw 5cqw');
  }

  function A_financeArea(p, c) {
    return root(p, [
      h('div', { key: 't', style: { display: 'flex', gap: '4cqw', flex: '1 1 0', minHeight: 0 } },
        h('div', { style: { flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          Title(p, c.title, 4.6), Sub(p, c.sub, 3)),
        h('div', { style: { flex: '1.1', alignSelf: 'stretch', background: p.panel, border: '0.15cqw solid ' + p.border, borderRadius: '1.8cqw', padding: '1.8cqw', display: 'flex', flexDirection: 'column' } },
          h('div', { style: { fontSize: '1.6cqw', color: p.body, fontWeight: 600 } }, c.chartLabel),
          h('div', { style: { fontWeight: 800, fontSize: '4cqw', color: p.title, letterSpacing: '-0.03em', margin: '0.3cqw 0 1cqw' } }, c.chartValue),
          h('div', { style: { flex: 1, minHeight: 0 } }, AreaChart(p.accent, p)))),
      h('div', { key: 'c', style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5cqw', flex: '0 0 auto' } },
        c.stats.map((s, i) => h(React.Fragment, { key: i }, StatChip(p, s[0], s[1]))))
    ]);
  }

  /* ============================================================
     per-style content
     ============================================================ */
  const CONTENT = {
    'corporate-white': { fn: A_splitArch, title: 'Стратегические решения для роста вашего бизнеса', sub: 'Практические подходы и инструменты для устойчивого развития', stats: [['120%', 'Рост выручки'], ['35%', 'Снижение затрат'], ['28', 'Запущенных проектов'], ['4.8/5', 'Удовлетворённость']] },
    'graphite-mono': { fn: A_splitArch, title: 'Данные. Анализ. Решения.', sub: 'Строгая аналитика и research-отчёты с акцентом на факты', stats: [['1.2K', 'Точек данных'], ['+19%', 'Точность'], ['42', 'Срезов'], ['A+', 'Достоверность']] },

    'dark-premium': { fn: A_darkMetrics, title: 'Технологии, которые двигают бизнес вперёд', sub: 'Передовые решения для повышения эффективности, ускорения роста и достижения ваших целей', metrics: [{ v: '+218%', l: 'Рост выручки', dir: 'up' }, { v: '−37%', l: 'Экономия затрат', dir: 'down' }], logos: ['СБЕР', 'Яндекс', 'Тинькофф', 'Ростелеком'] },
    'midnight-indigo': { fn: A_darkMetrics, title: 'Продукт, который масштабируется', sub: 'Платформа нового поколения для продуктовых команд и стартапов', metrics: [{ v: '×3.4', l: 'Рост MAU', dir: 'up' }, { v: '−52%', l: 'Отток', dir: 'down' }], logos: ['Notion', 'Linear', 'Figma', 'Vercel'] },

    'tech-blue': { fn: A_productUI, title: 'Сервисы нового поколения ', titleTail: 'для вашего бизнеса', sub: 'Масштабируемые решения для автоматизации процессов и роста эффективности', features: [[ICN.chart, 'AI-аналитика', 'Интеллектуальные инсайты'], [ICN.bolt, 'Автоматизация', 'Оптимизация процессов'], [ICN.layers, 'Интеграции', 'Без ограничений'], [ICN.shield, 'Безопасность', 'Защита данных']] },
    'ocean-teal': { fn: A_productUI, title: 'Сервис, которому ', titleTail: 'доверяют', sub: 'Цифровые решения для медицины, экологии и сервисных компаний', features: [[ICN.shield, 'Надёжность', 'Стабильность 24/7'], [ICN.chart, 'Прозрачность', 'Понятные метрики'], [ICN.layers, 'Интеграции', 'Любые системы'], [ICN.spark, 'Забота', 'Сервис под ключ']] },
    'studio-violet': { fn: A_productUI, title: 'Креатив ', titleTail: 'без границ', sub: 'Для агентств, дизайна и медиа — выразительно и по делу', features: [[ICN.spark, 'Идея', 'Сильный концепт'], [ICN.layers, 'Дизайн', 'Системный подход'], [ICN.chart, 'Эффект', 'Измеримый результат'], [ICN.bolt, 'Скорость', 'Быстрый запуск']] },

    'red-enterprise': { fn: A_skylineProof, title: 'Надёжность. Опыт. Результат.', sub: 'Комплексные решения для тендеров и государственных закупок с подтверждённой экспертизой', barColor: '#D72A23', proof: [{ v: '190+', l: 'проектов' }, { v: '20+ лет', l: 'на рынке' }], footer: 'Соблюдаем сроки • Гарантируем качество • Достигаем результатов' },

    'emerald-finance': { fn: A_financeArea, title: 'Финансовый рост под контролем', sub: 'Аналитика, прогнозирование и устойчивое развитие капитала', chartLabel: 'Динамика портфеля', chartValue: '+24.6%', stats: [['₽1.8B', 'Под управлением'], ['12.4%', 'Доходность'], ['98%', 'Удержание']] },

    'minimal-consulting': { fn: A_mountainsIcons, title: 'Фокус на главном. Ничего лишнего.', sub: 'Стратегические решения для сложных задач и устойчивого роста', icons: [[ICN.target, 'Стратегия', 'Анализ и планирование'], [ICN.growth, 'Рост', 'Устойчивое развитие'], [ICN.check, 'Результат', 'Измеримые показатели']] },
    'editorial-sand': { fn: A_mountainsIcons, title: 'Истории, которые продают бренд', sub: 'Издательский подход к имиджевым и брендовым презентациям', icons: [[ICN.spark, 'Идея', 'Сильный нарратив'], [ICN.layers, 'Форма', 'Чистая типографика'], [ICN.growth, 'Отклик', 'Внимание аудитории']] },

    'industrial': { fn: A_pipesMetrics, title: 'Индустриальные решения для сложных задач', sub: 'Надёжные технологии и опыт реализации проектов любой сложности', metrics: [['98%', 'Надёжность оборудования'], ['24/7', 'Техническая поддержка'], ['150+', 'Реализованных проектов']] }
  };

  function StyleShowcase({ design }) {
    if (!design) return null;
    const p = pal(design.themeKey);
    const c = CONTENT[design.id];
    if (!c) {
      // graceful fallback: simple titled cover
      return root(p, [h('div', { key: 'f', style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 } },
        Title(p, design.name, 5.4), Sub(p, design.short || '', 2))]);
    }
    return c.fn(p, c);
  }

  window.CX = window.CX || {};
  window.CX.StyleShowcase = StyleShowcase;
})();
