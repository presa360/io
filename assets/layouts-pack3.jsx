/* global React */
/* ============================================================
   Presa — Template Pack 3 (Sprint 1: tables & pricing)
   Self-contained, theme-aware renderers registered into
   window.PresaExtraLayouts. Mirrors the approved Sprint-1 mockups.
   Palette `p`: bg, panel, panel2, title, body, faint, border,
   accent, accentSoft, dark.
   ============================================================ */
(function () {
  const h = React.createElement;
  const z = (base, scale) => `${(base * (scale || 1)).toFixed(2)}cqw`;
  const D = 'var(--font-sans)', MONO = 'var(--font-mono)';
  const num = (v) => { const m = String(v == null ? '' : v).replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 0; };
  const slideBase = { containerType: 'inline-size', position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: D };
  const mix = (c, pct, other) => `color-mix(in srgb, ${c} ${pct}%, ${other || '#fff'})`;
  const border = (p) => p.dark ? 'rgba(255,255,255,.14)' : mix(p.title, 12, '#fff');
  const softPanel = (p) => p.dark ? 'rgba(255,255,255,.05)' : p.panel;
  const accentSoft = (p) => p.dark ? mix(p.accent, 22, '#000') : mix(p.accent, 12, '#fff');

  const Bar = (p) => h('div', { key: 'bar', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '1.1cqw', background: p.accent, zIndex: 5 } });
  function Sec({ label, p, scale, onDark }) {
    if (!label) return null;
    return h('div', { 'data-f': 'eyebrow', style: { display: 'flex', alignItems: 'center', gap: '1.2cqw', fontFamily: MONO, fontWeight: 600, fontSize: z(1.5, scale), letterSpacing: '.16em', textTransform: 'uppercase', color: onDark ? 'rgba(255,255,255,.7)' : p.accent } },
      h('span', { style: { width: '2.4cqw', height: '0.22cqw', background: p.accent, display: 'inline-block' } }), label);
  }
  function Head({ f, p, scale, onDark, max, size }) {
    return h('h2', { 'data-f': 'title', style: { fontFamily: D, fontWeight: 800, fontSize: z(size || 3.7, scale), letterSpacing: '-0.02em', lineHeight: 1.06, margin: '1.6cqw 0 0', color: onDark ? '#fff' : p.title, maxWidth: max || '92%' } }, f.title || '');
  }
  function Sub({ f, p, scale, onDark }) {
    if (!f.subtitle) return null;
    return h('p', { 'data-f': 'subtitle', style: { margin: '1.1cqw 0 0', fontSize: z(1.7, scale), lineHeight: 1.42, color: onDark ? 'rgba(255,255,255,.78)' : p.body, maxWidth: '80%' } }, f.subtitle);
  }
  function Foot({ p, brand, n, total, onDark }) {
    const B = brand || {}; const col = onDark ? 'rgba(255,255,255,.66)' : p.faint;
    return h('div', { style: { position: 'absolute', left: '7cqw', right: '7cqw', bottom: '2.5cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 6 } },
      h('span', { style: { display: 'flex', alignItems: 'center', gap: '0.9cqw', fontWeight: 800, fontSize: z(1.5, scale_(1)), color: onDark ? '#fff' : p.title } },
        h('span', { style: { width: '1.7cqw', height: '1.7cqw', borderRadius: '0.4cqw', background: p.accent, display: 'inline-block' } }), B.name || 'Presa'),
      B.pageNum !== false ? h('span', { style: { fontFamily: MONO, fontSize: z(1.35, scale_(1)), color: col } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')) : null);
  }
  const scale_ = (s) => s || 1;

  const Pad = (kids, justify) => h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw 7cqw 6.5cqw', display: 'flex', flexDirection: 'column', justifyContent: justify || 'flex-start' } }, kids);

  // checkmark / dash / circle / text cell
  function mark(v, p, scale) {
    const s = String(v == null ? '' : v).trim();
    if (s === '✓' || /^(да|yes|true|\+|v)$/i.test(s))
      return h('span', { style: { color: p.accent, fontWeight: 800, fontSize: z(2.1, scale) } }, '✓');
    if (s === '○' || /^(part|частич)$/i.test(s))
      return h('span', { style: { color: p.faint, fontWeight: 700, fontSize: z(1.9, scale) } }, '○');
    if (s === '✕' || s === '—' || s === '-' || s === '' || /^(нет|no|false)$/i.test(s))
      return h('span', { style: { color: p.dark ? 'rgba(255,255,255,.28)' : mix(p.title, 24, '#fff'), fontSize: z(2, scale) } }, '—');
    return h('span', { style: { fontFamily: D, fontWeight: 600, fontSize: z(1.6, scale), color: p.title } }, s);
  }

  /* ---- shared matrix table (feature × columns) ---- */
  function MatrixTable({ f, p, scale, hiCol, prices, cellRender }) {
    const cols = (f.columns || []).slice(0, 3);
    const rows = (f.rows || []).slice(0, 6);
    const pr = prices ? (f.prices || []).slice(0, 3) : null;
    const colW = '1.8fr ' + cols.map(() => '1fr').join(' ');
    const cr = cellRender || ((v) => mark(v, p, scale));
    const cellBg = (ci) => ci === hiCol ? (p.dark ? 'rgba(255,255,255,.06)' : accentSoft(p)) : 'transparent';
    return h('div', { style: { marginTop: z(2.2, scale), flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
      h('div', { style: { border: `1px solid ${border(p)}`, borderRadius: '1.3cqw', overflow: 'hidden' } },
        // header
        h('div', { style: { display: 'grid', gridTemplateColumns: colW, background: softPanel(p), borderBottom: `1px solid ${border(p)}` } },
          [h('div', { key: 'hf', style: { padding: `${z(1.1, scale)} 1.8cqw`, fontFamily: D, fontWeight: 700, fontSize: z(1.55, scale), color: p.body } }, f.rowsLabel || '')]
            .concat(cols.map((c, ci) => h('div', { key: 'hc' + ci, style: { padding: `${z(1.0, scale)} 1cqw`, textAlign: 'center', background: ci === hiCol ? p.accent : 'transparent', color: ci === hiCol ? '#fff' : p.title } },
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(1.75, scale) } }, c),
              pr && pr[ci] ? h('div', { style: { fontFamily: MONO, fontWeight: 500, fontSize: z(1.3, scale), color: ci === hiCol ? 'rgba(255,255,255,.82)' : p.body, marginTop: '0.2cqw' } }, pr[ci]) : null)))),
        // body
        rows.map((r, ri) => h('div', { key: ri, 'data-f': 'rows', 'data-fi': ri, style: { display: 'grid', gridTemplateColumns: colW, borderTop: ri ? `1px solid ${border(p)}` : 'none', alignItems: 'stretch' } },
          [h('div', { key: 'cf', style: { padding: `${z(1.02, scale)} 1.8cqw`, fontFamily: D, fontWeight: 600, fontSize: z(1.6, scale), color: p.title, display: 'flex', alignItems: 'center' } }, r.feature || '')]
            .concat(cols.map((c, ci) => h('div', { key: 'cc' + ci, style: { padding: `${z(0.9, scale)} 1cqw`, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', background: cellBg(ci) } }, cr(r['c' + (ci + 1)], ci))))))));
  }

  /* ===== table-02 — feature matrix with prices, hi middle ===== */
  function L_featureMatrixPriced(f, p, scale, B, n, total) {
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Тарифы', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h(MatrixTable, { key: 'm', f, p, scale, hiCol: 1, prices: true })
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== table-03 — compare check, hi first (us) ===== */
  function L_compareCheck(f, p, scale, B, n, total) {
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Сравнение', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h(MatrixTable, { key: 'm', f, p, scale, hiCol: 0, prices: false })
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== table-04 — price matrix, prices header, hi middle ===== */
  function L_priceMatrix(f, p, scale, B, n, total) {
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Тарифы', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h(MatrixTable, { key: 'm', f, p, scale, hiCol: 1, prices: true })
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== table-05 — role matrix (colored tags) ===== */
  function L_roleMatrix(f, p, scale, B, n, total) {
    const tag = (v, ci) => {
      const s = String(v == null ? '' : v).trim();
      if (!s || s === '—' || s === '-') return h('span', { style: { color: p.faint, fontSize: z(1.5, scale) } }, '—');
      const lead = ci === 0;
      const st = lead
        ? { background: p.accent, color: '#fff' }
        : { background: accentSoft(p), color: p.dark ? '#fff' : mix(p.accent, 70, '#000'), border: `1px solid ${p.dark ? 'rgba(255,255,255,.12)' : mix(p.accent, 22, '#fff')}` };
      return h('span', { style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.25, scale), padding: '0.4cqw 1cqw', borderRadius: '99px', whiteSpace: 'nowrap', ...st } }, s);
    };
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Процесс', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h(MatrixTable, { key: 'm', f, p, scale, hiCol: 0, prices: false, cellRender: tag })
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== table-06 — data with total row ===== */
  function L_dataTotal(f, p, scale, B, n, total) {
    const rows = (f.rows || []).slice(0, 5);
    const colW = '2.2fr 1fr 1fr 1fr';
    const pos = (v) => /^[-−–+×x]|%/.test(String(v || '').trim()) || /^[×x]/.test(String(v || ''));
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Результат', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          h('div', { style: { border: `1px solid ${border(p)}`, borderRadius: '1.3cqw', overflow: 'hidden' } },
            h('div', { style: { display: 'grid', gridTemplateColumns: colW, background: p.title } },
              [f.h1, f.h2, f.h3, f.h4].map((hh, i) => h('div', { key: i, style: { padding: '1.3cqw 1.9cqw', fontFamily: D, fontWeight: 700, fontSize: z(1.5, scale), color: p.dark ? p.bg : '#fff', textAlign: i ? 'right' : 'left' } }, hh || ''))),
            rows.map((r, ri) => h('div', { key: ri, 'data-f': 'rows', 'data-fi': ri, style: { display: 'grid', gridTemplateColumns: colW, borderTop: `1px solid ${border(p)}`, alignItems: 'center' } },
              h('div', { style: { padding: '1.25cqw 1.9cqw', fontFamily: D, fontWeight: 600, fontSize: z(1.62, scale), color: p.title } }, r.label || ''),
              [r.c1, r.c2, r.c3].map((cv, ci) => h('div', { key: ci, style: { padding: '1.25cqw 1.9cqw', textAlign: 'right', fontFamily: MONO, fontSize: z(1.6, scale), color: ci === 2 ? p.accent : p.body, fontWeight: ci === 2 ? 700 : 500 } }, cv || '')))),
            (f.totalLabel || f.totalValue) ? h('div', { style: { display: 'grid', gridTemplateColumns: colW, borderTop: `1px solid ${border(p)}`, background: accentSoft(p), alignItems: 'center' } },
              h('div', { style: { padding: '1.4cqw 1.9cqw', fontFamily: D, fontWeight: 700, fontSize: z(1.8, scale), color: p.dark ? '#fff' : mix(p.accent, 70, '#000') } }, f.totalLabel || ''),
              h('div', { style: { gridColumn: 'span 2' } }),
              h('div', { style: { padding: '1.4cqw 1.9cqw', textAlign: 'right', fontFamily: D, fontWeight: 800, fontSize: z(1.95, scale), color: p.title } }, f.totalValue || '')) : null))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== table-07 — bar table ===== */
  function L_barTable(f, p, scale, B, n, total) {
    const data = (f.data || []).slice(0, 6);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Метрики', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.6cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0' } },
          data.map((d, i) => {
            const pct = Math.max(4, Math.min(100, num(d.pct != null && d.pct !== '' ? d.pct : d.value)));
            const soft = i === data.length - 1 && data.length > 2 && pct < 30;
            return h('div', { key: i, 'data-f': 'data', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: '1.5fr 2.4fr auto', alignItems: 'center', gap: '2.4cqw', padding: '1.45cqw 0.2cqw', borderBottom: `1px solid ${border(p)}` } },
              h('div', null,
                h('div', { style: { fontFamily: D, fontWeight: 600, fontSize: z(1.78, scale) } }, d.label || ''),
                d.sub ? h('div', { style: { fontFamily: MONO, fontWeight: 500, fontSize: z(1.3, scale), color: p.faint, marginTop: '0.2cqw' } }, d.sub) : null),
              h('div', { style: { height: '1.5cqw', background: softPanel(p), borderRadius: '99px', overflow: 'hidden' } },
                h('div', { style: { height: '100%', width: pct + '%', borderRadius: '99px', background: soft ? (p.dark ? 'rgba(255,255,255,.25)' : mix(p.title, 26, '#fff')) : p.accent } })),
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.1, scale), letterSpacing: '-0.02em', color: soft ? p.faint : p.title, minWidth: '7cqw', textAlign: 'right' } }, d.value || ''));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== pricing-04 — three tiers, featured middle ===== */
  function tierFeatures(features, p, scale, onDark) {
    return h('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.9cqw', flex: 1 } },
      (features || []).slice(0, 6).map((ft, i) => h('li', { key: i, style: { display: 'flex', gap: '1cqw', alignItems: 'flex-start', fontSize: z(1.5, scale), lineHeight: 1.28, color: onDark ? 'rgba(255,255,255,.86)' : p.body } },
        h('span', { style: { color: onDark ? '#fff' : p.accent, fontWeight: 800, fontSize: z(1.7, scale), lineHeight: 1, flex: '0 0 auto' } }, '✓'), ft)));
  }
  function L_tier3Featured(f, p, scale, B, n, total) {
    const tiers = (f.tiers || []).slice(0, 3);
    const hiIdx = tiers.length === 3 ? 1 : tiers.length - 1;
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Тарифы', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${Math.max(tiers.length, 1)},1fr)`, gap: '1.8cqw', alignItems: 'stretch' } },
          tiers.map((t, i) => {
            const on = i === hiIdx;
            return h('div', { key: i, 'data-f': 'tiers', 'data-fi': i, style: { border: `1px solid ${on ? (p.dark ? p.accent : p.title) : border(p)}`, background: on ? (p.dark ? softPanel(p) : p.title) : p.bg, color: on ? '#fff' : p.title, borderRadius: '1.4cqw', padding: '2cqw', display: 'flex', flexDirection: 'column' } },
              on ? h('span', { style: { alignSelf: 'flex-start', fontFamily: MONO, fontWeight: 600, fontSize: z(1.1, scale), letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: p.accent, padding: '0.4cqw 1cqw', borderRadius: '99px', marginBottom: '1cqw' } }, f.popularLabel || 'Популярный') : null,
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.8, scale), color: on ? '#fff' : p.title } }, t.name || ''),
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(3, scale), letterSpacing: '-0.03em', margin: '0.5cqw 0 1.2cqw' } }, t.price || ''),
              h('div', { style: { height: '1px', background: on ? 'rgba(255,255,255,.16)' : border(p), margin: '0 0 1.4cqw' } }),
              tierFeatures(t.features, p, scale, on));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== pricing-05 — two big tiers (light + dark) ===== */
  function L_tier2Big(f, p, scale, B, n, total) {
    const tiers = (f.tiers || []).slice(0, 2);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Тарифы', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.6cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.2cqw' } },
          tiers.map((t, i) => {
            const dark = i === 1;
            const bg = dark ? (p.dark ? mix(p.title, 60, '#000') : '#16181d') : p.bg;
            const fg = dark ? '#fff' : p.title;
            return h('div', { key: i, 'data-f': 'tiers', 'data-fi': i, style: { position: 'relative', overflow: 'hidden', borderRadius: '1.8cqw', padding: '2.8cqw 2.6cqw', border: dark ? 'none' : `1px solid ${border(p)}`, background: bg, color: fg, display: 'flex', flexDirection: 'column' } },
              dark ? h('div', { style: { position: 'absolute', right: '-6cqw', top: '-6cqw', width: '22cqw', height: '22cqw', borderRadius: '50%', background: `radial-gradient(circle, ${mix(p.accent, 60, '#000')}, transparent 70%)`, opacity: .5 } }) : null,
              h('div', { style: { position: 'relative', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1cqw' } },
                h('span', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.3, scale), letterSpacing: '-0.01em' } }, t.name || ''),
                h('span', { style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.2, scale), letterSpacing: '.06em', textTransform: 'uppercase', color: dark ? '#fff' : p.accent, background: dark ? 'rgba(229,50,43,.22)' : accentSoft(p), padding: '0.45cqw 1cqw', borderRadius: '99px' } }, i === 0 ? 'для команд' : 'для компаний')),
              h('div', { style: { position: 'relative', fontFamily: D, fontWeight: 800, fontSize: z(4, scale), letterSpacing: '-0.03em', margin: '1.2cqw 0 0' } }, t.price || ''),
              t.tagline ? h('div', { style: { position: 'relative', fontSize: z(1.55, scale), color: dark ? 'rgba(255,255,255,.74)' : p.body, margin: '0.8cqw 0 0' } }, t.tagline) : null,
              h('ul', { style: { position: 'relative', listStyle: 'none', margin: '2cqw 0 0', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1cqw 1.8cqw' } },
                (t.features || []).slice(0, 6).map((ft, fi) => h('li', { key: fi, style: { display: 'flex', gap: '1cqw', alignItems: 'flex-start', fontSize: z(1.5, scale), lineHeight: 1.28, color: dark ? 'rgba(255,255,255,.9)' : p.title } },
                  h('span', { style: { color: dark ? '#fff' : p.accent, fontWeight: 800, fontSize: z(1.6, scale), flex: '0 0 auto' } }, '✓'), ft))));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== pricing-06 — single price + checklist ===== */
  function L_singlePrice(f, p, scale, B, n, total) {
    const feats = (f.features || []).slice(0, 8);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Тариф', p, scale }),
        f.title ? h(Head, { key: 'h', f, p, scale }) : null,
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '3cqw', alignItems: 'center' } },
          h('div', { key: 'l', style: { display: 'flex', flexDirection: 'column' } },
            h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(6.4, scale), letterSpacing: '-0.04em', lineHeight: 0.92, color: p.accent } }, f.price || ''),
            h('div', { style: { fontFamily: D, fontWeight: 600, fontSize: z(1.85, scale), color: p.title, marginTop: '1cqw' } }, f.per || ''),
            f.note ? h('div', { style: { fontSize: z(1.5, scale), color: p.body, marginTop: '1.4cqw', lineHeight: 1.45, maxWidth: '92%' } }, f.note) : null,
            f.buttonLabel ? h('div', { style: { alignSelf: 'flex-start', whiteSpace: 'nowrap', marginTop: '2cqw', fontFamily: D, fontWeight: 700, fontSize: z(1.6, scale), background: p.accent, color: '#fff', padding: `${z(1.15, scale)} 2.4cqw`, borderRadius: '1cqw' } }, f.buttonLabel) : null),
          h('div', { key: 'r', style: { background: softPanel(p), border: `1px solid ${border(p)}`, borderRadius: '1.6cqw', padding: '2.8cqw' } },
            h('div', { style: { fontFamily: MONO, fontWeight: 700, fontSize: z(1.4, scale), letterSpacing: '.1em', textTransform: 'uppercase', color: p.body, marginBottom: '1.6cqw' } }, f.featuresLabel || 'Что входит'),
            h('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.4cqw 1.8cqw' } },
              feats.map((ft, i) => h('li', { key: i, 'data-f': 'features', 'data-fi': i, style: { display: 'flex', gap: '1.1cqw', alignItems: 'center', fontSize: z(1.55, scale), lineHeight: 1.25, color: p.title } },
                h('span', { style: { width: '2.1cqw', height: '2.1cqw', borderRadius: '50%', background: p.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: z(1.2, scale), fontWeight: 800, flex: '0 0 auto' } }, '✓'), ft)))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== pricing-07 — value scale (from X) + 3 steps ===== */
  function L_valueScale(f, p, scale, B, n, total) {
    const steps = (f.steps || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Тарифы', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'hero', style: { display: 'flex', alignItems: 'baseline', gap: '1.6cqw', marginTop: '2.6cqw' } },
          h('span', { style: { fontFamily: D, fontWeight: 600, fontSize: z(1.9, scale), color: p.body } }, 'от'),
          h('span', { style: { fontFamily: D, fontWeight: 800, fontSize: z(6.4, scale), letterSpacing: '-0.04em', lineHeight: 0.9, color: p.accent } }, f.fromValue || (steps[0] && steps[0].price) || ''),
          f.fromNote ? h('span', { style: { fontFamily: D, fontWeight: 600, fontSize: z(1.7, scale), color: p.body } }, f.fromNote) : null),
        h('div', { key: 'steps', style: { marginTop: 'auto', display: 'grid', gridTemplateColumns: `repeat(${Math.max(steps.length, 1)},1fr)`, gap: 0, position: 'relative', borderTop: `0.25cqw solid ${border(p)}`, paddingTop: '3cqw' } },
          h('div', { style: { position: 'absolute', left: 0, top: '-0.25cqw', height: '0.25cqw', width: `${100 / Math.max(steps.length, 1) * 2}%`, background: p.accent } }),
          steps.map((s, i) => h('div', { key: i, 'data-f': 'steps', 'data-fi': i, style: { position: 'relative', paddingRight: '2.4cqw' } },
            h('div', { style: { position: 'absolute', top: '-3.55cqw', left: 0, width: '1.7cqw', height: '1.7cqw', borderRadius: '50%', background: i < 2 ? p.accent : p.bg, border: `0.4cqw solid ${i < 2 ? p.accent : (p.dark ? 'rgba(255,255,255,.3)' : mix(p.title, 30, '#fff'))}` } }),
            h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.6, scale), letterSpacing: '-0.02em' } }, s.price || ''),
            h('div', { style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.5, scale), letterSpacing: '.04em', color: p.accent, marginTop: '0.4cqw' } }, s.name || ''),
            h('div', { style: { fontSize: z(1.45, scale), lineHeight: 1.4, color: p.body, marginTop: '0.7cqw' } }, s.desc || ''))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== case-04 — before / after + KPI ===== */
  function L_beforeAfter(f, p, scale, B, n, total) {
    const col = (label, items, after) => h('div', { style: { flex: 1, border: `1px solid ${after ? (p.dark ? 'rgba(229,50,43,.4)' : mix(p.accent, 22, '#fff')) : border(p)}`, background: after ? accentSoft(p) : 'transparent', borderRadius: '1.4cqw', padding: '2.2cqw 2.2cqw', display: 'flex', flexDirection: 'column' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.8cqw', fontFamily: MONO, fontWeight: 600, fontSize: z(1.3, scale), letterSpacing: '.1em', textTransform: 'uppercase', color: after ? p.accent : p.faint } },
        h('span', { style: { width: '1.3cqw', height: '1.3cqw', borderRadius: '50%', background: 'currentColor', display: 'inline-block' } }), label),
      h('ul', { style: { listStyle: 'none', margin: '1.4cqw 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.9cqw' } },
        items.map((it, i) => h('li', { key: i, style: { display: 'flex', gap: '1cqw', alignItems: 'flex-start', fontSize: z(1.55, scale), lineHeight: 1.3, color: after ? p.title : p.body } },
          h('span', { style: { color: after ? p.accent : p.faint, fontWeight: 800, fontSize: z(1.6, scale), flex: '0 0 auto' } }, after ? '✓' : '✕'), it))));
    const kpis = (f.kpis || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Кейс', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '2cqw' } },
          h('div', { style: { flex: 1, display: 'flex', gap: '2cqw' } }, col(f.beforeLabel || 'Было', (f.before || []).slice(0, 4), false), col(f.afterLabel || 'Стало', (f.after || []).slice(0, 4), true)),
          h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${Math.max(kpis.length, 1)},1fr)`, gap: '2cqw' } },
            kpis.map((s, i) => h('div', { key: i, 'data-f': 'kpis', 'data-fi': i, style: { borderTop: `0.25cqw solid ${p.accent}`, paddingTop: '1.1cqw' } },
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(3.4, scale), letterSpacing: '-0.03em', color: p.accent, lineHeight: 1 } }, s.value || ''),
              h('div', { style: { marginTop: '0.6cqw', fontSize: z(1.4, scale), color: p.body, lineHeight: 1.3 } }, s.label || '')))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== case-05 — quote + result panel ===== */
  function L_quoteResult(f, p, scale, B, n, total) {
    const stats = (f.stats || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Кейс', p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3cqw' } },
          h('div', { key: 'l', style: { display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
            h('div', { style: { fontFamily: 'Georgia, serif', color: p.accent, fontSize: z(9, scale), lineHeight: 0.6, height: z(4.4, scale) } }, '\u201C'),
            h('blockquote', { 'data-f': 'quote', style: { margin: 0, fontFamily: D, fontWeight: 700, fontSize: z(2.7, scale), lineHeight: 1.32, letterSpacing: '-0.01em', color: p.title, maxWidth: '96%' } }, f.quote || ''),
            h('div', { style: { marginTop: '2.4cqw', display: 'flex', alignItems: 'center', gap: '1.4cqw' } },
              h('div', { style: { width: z(4.4, scale), height: z(4.4, scale), borderRadius: '1cqw', background: p.title, color: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(2.2, scale) } }, f.logo || (f.author || 'A').slice(0, 1)),
              h('div', null,
                h('div', { 'data-f': 'author', style: { fontFamily: D, fontWeight: 700, fontSize: z(1.85, scale) } }, f.author || ''),
                f.role ? h('div', { 'data-f': 'role', style: { fontSize: z(1.5, scale), color: p.body, marginTop: '0.2cqw' } }, f.role) : null))),
          h('div', { key: 'r', style: { background: softPanel(p), border: `1px solid ${border(p)}`, borderRadius: '1.5cqw', padding: '2.6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
            stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { padding: '1.6cqw 0', borderBottom: i < stats.length - 1 ? `1px solid ${border(p)}` : 'none' } },
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(3.4, scale), letterSpacing: '-0.03em', color: p.accent, lineHeight: 1 } }, s.value || ''),
              h('div', { style: { marginTop: '0.5cqw', fontSize: z(1.4, scale), color: p.body } }, s.label || '')))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== case-06 — implementation timeline ===== */
  function L_caseTimeline(f, p, scale, B, n, total) {
    const ms = (f.milestones || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Кейс', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: 'auto', marginBottom: 'auto', display: 'grid', gridTemplateColumns: `repeat(${Math.max(ms.length, 1)},1fr)`, gap: '2cqw', position: 'relative', paddingTop: '4.4cqw' } },
          h('div', { style: { position: 'absolute', left: '1.2cqw', right: '1.2cqw', top: '5.3cqw', height: '0.2cqw', background: border(p) } }),
          ms.map((mi, i) => {
            const last = i === ms.length - 1;
            return h('div', { key: i, 'data-f': 'milestones', 'data-fi': i, style: { position: 'relative' } },
              h('div', { style: { width: '2.4cqw', height: '2.4cqw', borderRadius: '50%', background: p.accent, position: 'relative', zIndex: 2 } }),
              h('div', { style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.35, scale), color: p.accent, letterSpacing: '.06em', marginTop: '1.8cqw', textTransform: 'uppercase' } }, mi.week || ''),
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(2.1, scale), margin: '0.6cqw 0 0', letterSpacing: '-0.01em' } }, mi.title || ''),
              (last && f.resultValue) ? h('div', { style: { display: 'inline-block', marginTop: '1cqw', fontFamily: D, fontWeight: 800, fontSize: z(2.4, scale), color: p.accent, letterSpacing: '-0.02em' } }, f.resultValue)
                : h('div', { style: { margin: '0.7cqw 0 0', fontSize: z(1.45, scale), lineHeight: 1.4, color: p.body, maxWidth: '94%' } }, mi.desc || ''));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== case-07 — result + photo ===== */
  function Photo({ p, label, src }) {
    if (src) return h('img', { src, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } });
    return h('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(150deg,#1b1f27,#0c0e12)', overflow: 'hidden' } },
      h('div', { style: { position: 'absolute', inset: 0, opacity: .5, backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)', backgroundSize: '3.4cqw 3.4cqw' } }),
      h('div', { style: { position: 'absolute', inset: 0, background: `radial-gradient(40cqw 40cqw at 72% 24%, ${mix(p.accent, 55, '#000')}, transparent 66%)`, opacity: .8 } }),
      label ? h('div', { style: { position: 'absolute', left: '1.6cqw', bottom: '1.4cqw', fontFamily: MONO, fontWeight: 500, fontSize: '1.3cqw', color: 'rgba(255,255,255,.74)', display: 'flex', alignItems: 'center', gap: '0.8cqw' } },
        h('span', { style: { width: '0.9cqw', height: '0.9cqw', borderRadius: '50%', background: p.accent } }), label) : null);
  }
  function L_caseResultPhoto(f, p, scale, B, n, total) {
    const kpis = (f.kpis || []).slice(0, 3);
    const line = (label, txt) => h('div', { style: { display: 'flex', gap: '1.4cqw', alignItems: 'flex-start' } },
      h('div', { style: { fontFamily: MONO, fontWeight: 700, fontSize: z(1.3, scale), letterSpacing: '.08em', textTransform: 'uppercase', color: p.accent, flex: '0 0 8cqw', paddingTop: '0.3cqw' } }, label),
      h('div', { style: { fontSize: z(1.7, scale), lineHeight: 1.4, color: p.title } }, txt));
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p),
      h('div', { style: { position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '0.92fr 1.08fr' } },
        h('div', { key: 'l', style: { position: 'relative' } }, h(Photo, { p, label: f.imageLabel, src: f.image })),
        h('div', { key: 'r', style: { padding: '6cqw 6cqw 5cqw', display: 'flex', flexDirection: 'column' } },
          h(Sec, { label: f.eyebrow || 'Кейс', p, scale }),
          h('h2', { 'data-f': 'title', style: { fontFamily: D, fontWeight: 800, fontSize: z(3.2, scale), letterSpacing: '-0.02em', lineHeight: 1.08, margin: '1.4cqw 0 0', color: p.title } }, f.title || ''),
          h('div', { style: { marginTop: '2.2cqw', display: 'flex', flexDirection: 'column', gap: '1.4cqw' } }, line('Задача', f.challenge || ''), line('Решение', f.solution || '')),
          h('div', { style: { marginTop: 'auto', display: 'grid', gridTemplateColumns: `repeat(${Math.max(kpis.length, 1)},1fr)`, gap: '1.6cqw', paddingTop: '2.4cqw', borderTop: `1px solid ${border(p)}` } },
            kpis.map((s, i) => h('div', { key: i, 'data-f': 'kpis', 'data-fi': i },
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(3.2, scale), letterSpacing: '-0.03em', color: p.accent, lineHeight: 1 } }, s.value || ''),
              h('div', { style: { marginTop: '0.5cqw', fontSize: z(1.32, scale), color: p.body, lineHeight: 1.3 } }, s.label || '')))))),
      h(Foot, { p, brand: B, n, total }));
  }

  /* ===== comparison-05 — vs columns ===== */
  function L_vsColumns(f, p, scale, B, n, total) {
    const winCol = h('div', { style: { borderRadius: '1.6cqw', padding: '2.8cqw 2.6cqw', position: 'relative', zIndex: 2, background: `linear-gradient(155deg, ${p.accent}, ${mix(p.accent, 70, '#000')})`, color: '#fff', boxShadow: '0 10px 30px -10px rgba(0,0,0,.3)', display: 'flex', flexDirection: 'column' } },
      h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.3, scale), letterSpacing: '-0.01em' } }, f.winLabel || 'С Presa'),
      f.winSub ? h('div', { style: { fontSize: z(1.4, scale), marginTop: '0.6cqw', opacity: .85 } }, f.winSub) : null,
      h('ul', { style: { listStyle: 'none', margin: '2cqw 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2cqw' } },
        (f.winItems || []).slice(0, 5).map((it, i) => h('li', { key: i, style: { display: 'flex', gap: '1.2cqw', alignItems: 'flex-start', fontSize: z(1.6, scale), lineHeight: 1.3, color: 'rgba(255,255,255,.94)' } },
          h('span', { style: { fontWeight: 800, flex: '0 0 auto' } }, '✓'), it))));
    const loseCol = h('div', { style: { borderRadius: '1.6cqw', padding: '2.8cqw 2.6cqw 2.8cqw 4cqw', marginLeft: '-1.6cqw', background: softPanel(p), border: `1px solid ${border(p)}`, display: 'flex', flexDirection: 'column' } },
      h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.3, scale), letterSpacing: '-0.01em', color: p.body } }, f.loseLabel || 'Без Presa'),
      f.loseSub ? h('div', { style: { fontSize: z(1.4, scale), marginTop: '0.6cqw', color: p.faint } }, f.loseSub) : null,
      h('ul', { style: { listStyle: 'none', margin: '2cqw 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2cqw' } },
        (f.loseItems || []).slice(0, 5).map((it, i) => h('li', { key: i, style: { display: 'flex', gap: '1.2cqw', alignItems: 'flex-start', fontSize: z(1.6, scale), lineHeight: 1.3, color: p.body } },
          h('span', { style: { color: p.faint, fontWeight: 800, flex: '0 0 auto' } }, '✕'), it))));
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Сравнение', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch', position: 'relative' } },
          winCol, loseCol,
          h('div', { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 5, width: '6cqw', height: '6cqw', borderRadius: '50%', background: p.bg, border: `0.3cqw solid ${border(p)}`, boxShadow: '0 6px 18px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(1.7, scale), color: p.title } }, 'VS'))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== comparison-06 — transformation ===== */
  function L_transformation(f, p, scale, B, n, total) {
    const kpis = (f.kpis || []).slice(0, 3);
    const state = (after, title, txt) => h('div', { style: { flex: 1, height: '100%', borderRadius: '1.6cqw', padding: '2.6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: after ? `linear-gradient(155deg, ${p.accent}, ${mix(p.accent, 70, '#000')})` : softPanel(p), border: after ? 'none' : `1px solid ${border(p)}`, color: after ? '#fff' : p.title } },
      h('div', { style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.3, scale), letterSpacing: '.1em', textTransform: 'uppercase', color: after ? 'rgba(255,255,255,.78)' : p.faint } }, after ? 'Стало' : 'Было'),
      h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.5, scale), letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: '1cqw' } }, title || ''),
      h('div', { style: { fontSize: z(1.5, scale), lineHeight: 1.4, marginTop: '0.9cqw', color: after ? 'rgba(255,255,255,.84)' : p.body } }, txt || ''));
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Сравнение', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '2.2cqw' } },
          h('div', { style: { flex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '2cqw' } },
            state(false, f.beforeTitle, f.beforeText),
            h('div', { style: { width: z(5, scale), height: z(5, scale), borderRadius: '50%', background: p.title, color: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: z(2.6, scale), fontWeight: 800 } }, '\u2192'),
            state(true, f.afterTitle, f.afterText)),
          h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${Math.max(kpis.length, 1)},1fr)`, gap: '2cqw' } },
            kpis.map((s, i) => h('div', { key: i, 'data-f': 'kpis', 'data-fi': i, style: { display: 'flex', alignItems: 'baseline', gap: '1cqw' } },
              h('span', { style: { fontFamily: D, fontWeight: 800, fontSize: z(3, scale), letterSpacing: '-0.03em', color: p.accent, lineHeight: 1 } }, s.value || ''),
              h('span', { style: { fontSize: z(1.45, scale), color: p.body, lineHeight: 1.2 } }, s.label || '')))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== comparison-07 — criteria scale ===== */
  function L_criteriaScale(f, p, scale, B, n, total) {
    const rows = (f.rows || []).slice(0, 5);
    const track = p.dark ? 'rgba(255,255,255,.08)' : softPanel(p);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Сравнение', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'leg', style: { display: 'flex', gap: '2.6cqw', marginTop: '2cqw' } },
          [[f.usLabel || 'Presa', p.accent], [f.themLabel || 'Другие', p.dark ? 'rgba(255,255,255,.3)' : mix(p.title, 30, '#fff')]].map((lg, i) => h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '0.9cqw', fontFamily: D, fontWeight: 600, fontSize: z(1.4, scale), color: i ? p.body : p.title } },
            h('span', { style: { width: '1.5cqw', height: '1.5cqw', borderRadius: '50%', background: lg[1], display: 'inline-block' } }), lg[0]))),
        h('div', { key: 'm', style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2.4cqw' } },
          rows.map((r, i) => {
            const us = Math.max(0, Math.min(100, num(r.us))), them = Math.max(0, Math.min(100, num(r.them)));
            return h('div', { key: i, 'data-f': 'rows', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: '13cqw 1fr', alignItems: 'center', gap: '2.4cqw' } },
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.7, scale) } }, r.label || ''),
              h('div', { style: { position: 'relative', height: '0.9cqw', background: track, border: `1px solid ${border(p)}`, borderRadius: '99px' } },
                h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: us + '%', borderRadius: '99px', background: `linear-gradient(90deg, ${mix(p.accent, 22, '#fff')}, ${p.accent})` } }),
                h('div', { style: { position: 'absolute', top: '50%', left: them + '%', width: '2.4cqw', height: '2.4cqw', borderRadius: '50%', transform: 'translate(-50%,-50%)', background: p.dark ? '#5b6573' : mix(p.title, 30, '#fff'), border: `0.35cqw solid ${p.bg}` } }),
                h('div', { style: { position: 'absolute', top: '50%', left: us + '%', width: '2.4cqw', height: '2.4cqw', borderRadius: '50%', transform: 'translate(-50%,-50%)', background: p.accent, border: `0.35cqw solid ${p.bg}`, zIndex: 2 } })));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== chart-06 — donut + legend ===== */
  function L_chartDonut2(f, p, scale, B, n, total) {
    const data = (f.data || []).slice(0, 6);
    const sum = data.reduce((s, d) => s + num(d.value), 0) || 1;
    const cols = [p.accent, p.title, p.dark ? '#5b6573' : mix(p.title, 30, '#fff'), mix(p.accent, 45, '#fff'), mix(p.title, 50, '#fff'), mix(p.accent, 70, '#000')];
    let acc = 0;
    const stops = data.map((d, i) => { const a = acc; acc += num(d.value) / sum * 100; return `${cols[i % cols.length]} ${a}% ${acc}%`; }).join(',');
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Data', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '3cqw', alignItems: 'center' } },
          h('div', { key: 'ring', style: { position: 'relative', width: '78%', aspectRatio: '1', maxHeight: '40cqw', margin: '0 auto', borderRadius: '50%', backgroundImage: `conic-gradient(${stops})` } },
            h('div', { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '54%', height: '54%', borderRadius: '50%', background: p.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
              f.centerValue ? h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(3.4, scale), letterSpacing: '-0.03em', color: p.title, lineHeight: 1 } }, f.centerValue) : null,
              f.centerLabel ? h('div', { style: { fontFamily: MONO, fontWeight: 500, fontSize: z(1.3, scale), color: p.faint, marginTop: '0.5cqw' } }, f.centerLabel) : null)),
          h('ul', { key: 'leg', style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5cqw' } },
            data.map((d, i) => h('li', { key: i, 'data-f': 'data', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '1.4cqw' } },
              h('span', { style: { width: '1.6cqw', height: '1.6cqw', borderRadius: '0.4cqw', background: cols[i % cols.length] } }),
              h('span', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.85, scale) } }, d.label || ''),
              h('span', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2, scale), letterSpacing: '-0.02em', color: p.title } }, Math.round(num(d.value) / sum * 100) + '%')))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== chart-07 — horizontal bars ===== */
  function L_barHorizontal(f, p, scale, B, n, total) {
    const data = (f.data || []).slice(0, 6);
    const mx = Math.max(...data.map((d) => num(d.value)), 1);
    const hi = data.reduce((bi, d, i, a) => num(d.value) > num(a[bi].value) ? i : bi, 0);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Data', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.6cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2cqw' } },
          data.map((d, i) => {
            const w = Math.max(5, num(d.value) / mx * 100);
            const on = i === hi;
            return h('div', { key: i, 'data-f': 'data', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: '13cqw 1fr', alignItems: 'center', gap: '2.2cqw' } },
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.75, scale), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, d.label || ''),
              h('div', { style: { position: 'relative', height: '3.4cqw', background: softPanel(p), borderRadius: '0.7cqw', overflow: 'hidden' } },
                h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: w + '%', borderRadius: '0.7cqw', background: on ? p.accent : mix(p.accent, p.dark ? 42 : 30, p.dark ? '#000' : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '1.4cqw' } },
                  h('span', { style: { fontFamily: D, fontWeight: 800, fontSize: z(1.6, scale), color: on ? '#fff' : p.title } }, d.value || ''))));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== chart-08 — trend (area) ===== */
  function L_chartTrend(f, p, scale, B, n, total) {
    const data = (f.data || []).slice(0, 8);
    const vals = data.map((d) => num(d.value));
    const mn = Math.min(...vals, 0), mx = Math.max(...vals, 1);
    const pts = data.map((d, i) => { const x = data.length > 1 ? i / (data.length - 1) * 100 : 0; const y = 38 - ((num(d.value) - mn) / ((mx - mn) || 1)) * 34; return [x, y]; });
    const line = pts.map((pt, i) => `${i ? 'L' : 'M'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');
    const area = `${line} L100,40 L0,40 Z`;
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Data', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'top', style: { marginTop: '2.2cqw', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2cqw' } },
          h('div', { 'data-f': 'bigValue', style: { fontFamily: D, fontWeight: 800, fontSize: z(5.2, scale), letterSpacing: '-0.04em', lineHeight: 0.9, color: p.accent } }, f.bigValue || ''),
          f.delta ? h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.7, scale), whiteSpace: 'nowrap', color: p.accent, background: accentSoft(p), border: `1px solid ${p.dark ? 'rgba(229,50,43,.4)' : mix(p.accent, 22, '#fff')}`, borderRadius: '99px', padding: '0.6cqw 1.4cqw' } }, '↗ ' + f.delta) : null),
        h('div', { key: 'chart', style: { flex: 1, minHeight: 0, marginTop: '1.6cqw', position: 'relative' } },
          h('svg', { viewBox: '0 0 100 40', preserveAspectRatio: 'none', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
            h('defs', null, h('linearGradient', { id: 'pgrad', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '0', stopColor: p.accent, stopOpacity: 0.28 }), h('stop', { offset: '1', stopColor: p.accent, stopOpacity: 0 }))),
            h('path', { d: area, fill: 'url(#pgrad)' }),
            h('path', { d: line, fill: 'none', stroke: p.accent, strokeWidth: 0.9, strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' }))),
        h('div', { key: 'x', style: { display: 'flex', justifyContent: 'space-between', marginTop: '1cqw', fontFamily: MONO, fontWeight: 500, fontSize: z(1.3, scale), color: p.faint } },
          data.map((d, i) => h('span', { key: i }, d.label || '')))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== contact-04 — CTA + QR ===== */
  function qrCells() {
    // deterministic pseudo-QR 7×7 with finder corners
    const pat = [1,1,1,0,1,1,1, 1,0,1,0,0,0,1, 1,0,1,1,1,0,1, 0,0,0,1,0,1,0, 1,1,0,1,1,0,1, 1,0,0,0,0,0,1, 1,1,1,0,1,1,1];
    return pat;
  }
  function L_ctaQr(f, p, scale, B, n, total) {
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p),
      h('div', { style: { position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1.4fr 1fr' } },
        h('div', { key: 'l', style: { padding: '6cqw 5cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          h(Sec, { label: f.eyebrow || 'Следующий шаг', p, scale }),
          h('h2', { 'data-f': 'title', style: { fontFamily: D, fontWeight: 800, fontSize: z(4.4, scale), letterSpacing: '-0.025em', lineHeight: 1.04, margin: '1.4cqw 0 0', color: p.title } }, f.title || ''),
          f.subtitle ? h('p', { 'data-f': 'subtitle', style: { fontSize: z(1.8, scale), color: p.body, margin: '1.4cqw 0 0', lineHeight: 1.45, maxWidth: '90%' } }, f.subtitle) : null,
          h('div', { 'data-f': 'buttonLabel', style: { alignSelf: 'flex-start', marginTop: '2.4cqw', fontFamily: D, fontWeight: 700, fontSize: z(1.8, scale), background: p.accent, color: '#fff', padding: '1.4cqw 2.8cqw', borderRadius: '1cqw' } }, f.buttonLabel || '')),
        h('div', { key: 'r', style: { position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#1c2029,#0c0e12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2cqw' } },
          h('div', { style: { position: 'absolute', right: '-8cqw', top: '-8cqw', width: '28cqw', height: '28cqw', borderRadius: '50%', background: `radial-gradient(circle, ${mix(p.accent, 55, '#000')}, transparent 66%)`, opacity: .7 } }),
          h('div', { style: { position: 'relative', zIndex: 1, width: '17cqw', height: '17cqw', borderRadius: '1.6cqw', background: '#fff', padding: '1.4cqw', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gridTemplateRows: 'repeat(7,1fr)', gap: '0.45cqw' } },
            qrCells().map((b, i) => h('span', { key: i, style: { borderRadius: '0.18cqw', background: b ? '#0e1116' : 'transparent' } }))),
          f.qrCaption ? h('div', { style: { position: 'relative', zIndex: 1, color: 'rgba(255,255,255,.78)', fontFamily: MONO, fontWeight: 500, fontSize: z(1.45, scale), letterSpacing: '.04em' } }, f.qrCaption) : null)),
      h(Foot, { p, brand: B, n, total }));
  }

  /* ===== contact-05 — details + stylized map ===== */
  function L_contactMap(f, p, scale, B, n, total) {
    const items = (f.items || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Contact', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3cqw', alignItems: 'center' } },
          h('ul', { key: 'l', style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.6cqw' } },
            items.map((it, i) => h('li', { key: i, 'data-f': 'items', 'data-fi': i, style: { display: 'flex', alignItems: 'center', gap: '1.6cqw' } },
              h('span', { style: { width: '4cqw', height: '4cqw', borderRadius: '1cqw', background: accentSoft(p), color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', fontFamily: D, fontWeight: 800, fontSize: z(1.7, scale) } }, (it.label || 'A').slice(0, 1)),
              h('div', null,
                h('div', { style: { fontFamily: MONO, fontWeight: 500, fontSize: z(1.3, scale), color: p.faint, letterSpacing: '.04em', textTransform: 'uppercase' } }, it.label || ''),
                h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(2, scale), letterSpacing: '-0.01em', marginTop: '0.1cqw' } }, it.value || ''))))),
          h('div', { key: 'r', style: { position: 'relative', borderRadius: '1.6cqw', overflow: 'hidden', background: 'linear-gradient(150deg,#1b1f27,#0c0e12)', aspectRatio: '1.5' } },
            h('div', { style: { position: 'absolute', inset: 0, opacity: .5, backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)', backgroundSize: '3cqw 3cqw' } }),
            h('div', { style: { position: 'absolute', left: 0, right: 0, top: '42%', height: '0.5cqw', background: 'rgba(255,255,255,.16)' } }),
            h('div', { style: { position: 'absolute', top: 0, bottom: 0, left: '54%', width: '0.5cqw', background: 'rgba(255,255,255,.16)' } }),
            h('div', { style: { position: 'absolute', left: '54%', top: '42%', transform: 'translate(-50%,-100%)' } },
              h('span', { style: { display: 'block', width: '2.6cqw', height: '2.6cqw', borderRadius: '50% 50% 50% 0', background: p.accent, transform: 'rotate(-45deg)' } })),
            f.city ? h('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '2.6cqw 1.8cqw 1.4cqw', background: 'linear-gradient(transparent, rgba(8,10,14,.78))', color: '#fff', fontFamily: D, fontWeight: 700, fontSize: z(1.6, scale), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, f.city) : null))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== contact-06 — full accent finale ===== */
  function L_ctaAccent(f, p, scale, B, n, total) {
    const chips = (f.chips || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: `linear-gradient(150deg, ${p.accent}, ${mix(p.accent, 70, '#000')})`, color: '#fff' } },
      h('div', { style: { position: 'absolute', right: '-10cqw', bottom: '-12cqw', width: '40cqw', height: '40cqw', borderRadius: '50%', background: 'rgba(255,255,255,.08)' } }),
      h('div', { style: { position: 'absolute', right: '6cqw', top: '-10cqw', width: '24cqw', height: '24cqw', borderRadius: '50%', border: '0.4cqw solid rgba(255,255,255,.16)' } }),
      h('div', { style: { position: 'absolute', inset: 0, padding: '6cqw 7cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        f.eyebrow ? h('div', { 'data-f': 'eyebrow', style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.5, scale), letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.82)', position: 'relative', zIndex: 1 } }, f.eyebrow) : null,
        h('h2', { 'data-f': 'title', style: { fontFamily: D, fontWeight: 800, fontSize: z(5.6, scale), letterSpacing: '-0.03em', lineHeight: 1.02, margin: '1.6cqw 0 0', position: 'relative', zIndex: 1, maxWidth: '88%' } }, f.title || ''),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { fontSize: z(1.95, scale), margin: '1.6cqw 0 0', color: 'rgba(255,255,255,.9)', position: 'relative', zIndex: 1, maxWidth: '72%', lineHeight: 1.4 } }, f.subtitle) : null,
        h('div', { style: { marginTop: '3cqw', display: 'flex', gap: '1.4cqw', flexWrap: 'wrap', position: 'relative', zIndex: 1 } },
          chips.map((c, i) => h('span', { key: i, 'data-f': 'chips', 'data-fi': i, style: i === 0
            ? { fontFamily: D, fontWeight: 700, fontSize: z(1.5, scale), background: '#fff', color: mix(p.accent, 70, '#000'), borderRadius: '99px', padding: '0.9cqw 1.8cqw' }
            : { fontFamily: MONO, fontWeight: 600, fontSize: z(1.5, scale), background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.24)', borderRadius: '99px', padding: '0.9cqw 1.8cqw' } }, c))),
        h('div', { style: { position: 'absolute', left: '7cqw', right: '7cqw', bottom: '2.5cqw', display: 'flex', justifyContent: 'flex-end', zIndex: 6 } },
          (B && B.pageNum !== false) ? h('span', { style: { fontFamily: MONO, fontSize: z(1.35, scale), color: 'rgba(255,255,255,.7)' } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')) : null)));
  }

  /* ============ SPRINT 3 — roadmap / team / process ============ */

  /* ===== roadmap-04 — quarters timeline ===== */
  function L_roadmapQuarters(f, p, scale, B, n, total) {
    const cols = (f.cols || []).slice(0, 4);
    const done = Math.max(0, Math.min(cols.length, parseInt(f.done, 10) || 0));
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Roadmap', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: 'auto', marginBottom: 'auto', position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${Math.max(cols.length, 1)},1fr)`, gap: '2cqw', paddingTop: '5cqw' } },
          h('div', { style: { position: 'absolute', left: '1cqw', right: '1cqw', top: '5.9cqw', height: '0.25cqw', background: border(p) } }),
          done > 0 ? h('div', { style: { position: 'absolute', left: '1cqw', top: '5.9cqw', height: '0.25cqw', width: `${Math.max(0, (done - 0.5) / cols.length * 100)}%`, background: p.accent } }) : null,
          cols.map((c, i) => {
            const on = i < done;
            return h('div', { key: i, 'data-f': 'cols', 'data-fi': i, style: { position: 'relative' } },
              h('div', { style: { position: 'relative', zIndex: 2, width: '2.6cqw', height: '2.6cqw', borderRadius: '50%', background: on ? p.accent : p.bg, border: `0.45cqw solid ${on ? p.accent : (p.dark ? 'rgba(255,255,255,.3)' : mix(p.title, 30, '#fff'))}` } }),
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.85, scale), marginTop: '1.9cqw', letterSpacing: '-0.01em', color: on ? p.accent : p.title } }, c.q || ''),
              c.tag ? h('span', { style: { display: 'inline-block', fontFamily: MONO, fontWeight: 600, fontSize: z(1.15, scale), letterSpacing: '.08em', textTransform: 'uppercase', padding: '0.35cqw 0.9cqw', borderRadius: '99px', marginTop: '0.9cqw', background: on ? accentSoft(p) : softPanel(p), color: on ? (p.dark ? '#fff' : mix(p.accent, 70, '#000')) : p.faint } }, c.tag) : null,
              h('ul', { style: { listStyle: 'none', margin: '1.3cqw 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8cqw' } },
                (c.items || []).slice(0, 3).map((it, k) => h('li', { key: k, style: { fontSize: z(1.5, scale), lineHeight: 1.32, color: p.body, paddingLeft: '1.6cqw', position: 'relative' } },
                  h('span', { style: { position: 'absolute', left: 0, top: '0.7cqw', width: '0.6cqw', height: '0.6cqw', borderRadius: '50%', background: p.accent } }), it))));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== roadmap-05 — vertical milestones ===== */
  function L_roadmapMilestones(f, p, scale, B, n, total) {
    const ms = (f.milestones || []).slice(0, 5);
    const done = Math.max(0, Math.min(ms.length, parseInt(f.done, 10) || 0));
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Roadmap', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', paddingLeft: '1cqw' } },
          h('div', { style: { position: 'absolute', left: '1.85cqw', top: '1.6cqw', bottom: '1.6cqw', width: '0.25cqw', background: border(p) } }),
          ms.map((mi, i) => {
            const on = i < done;
            return h('div', { key: i, 'data-f': 'milestones', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.4cqw', alignItems: 'flex-start', padding: '0.85cqw 0', position: 'relative' } },
              h('div', { style: { width: '1.7cqw', height: '1.7cqw', borderRadius: '50%', background: on ? p.accent : p.bg, border: `0.4cqw solid ${on ? p.accent : (p.dark ? 'rgba(255,255,255,.3)' : mix(p.title, 30, '#fff'))}`, marginTop: '0.5cqw', position: 'relative', zIndex: 2 } }),
              h('div', { style: { display: 'grid', gridTemplateColumns: '9cqw 1fr', gap: '2.4cqw', alignItems: 'baseline' } },
                h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(1.85, scale), letterSpacing: '-0.01em', color: on ? p.accent : p.title } }, mi.w || ''),
                h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.85, scale), letterSpacing: '-0.01em' } }, mi.heading || ''),
                h('div', { style: { gridColumn: 2, fontSize: z(1.45, scale), color: p.body, marginTop: '0.35cqw', lineHeight: 1.35 } }, mi.text || '')));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== roadmap-06 — gantt bars ===== */
  function L_roadmapGantt(f, p, scale, B, n, total) {
    const rows = (f.rows || []).slice(0, 5);
    const periods = (f.periods || []).slice(0, 4);
    const colors = [p.accent, p.title, p.accent, p.dark ? 'rgba(255,255,255,.25)' : mix(p.title, 28, '#fff')];
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Roadmap', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } },
          h('div', { style: { display: 'grid', gridTemplateColumns: `14cqw repeat(${Math.max(periods.length, 1)},1fr)`, marginBottom: '1.4cqw' } },
            [h('span', { key: 'rl', style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.35, scale), color: p.faint } }, f.rowsLabel || '')]
              .concat(periods.map((pr, i) => h('span', { key: i, style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.35, scale), color: p.faint, textAlign: 'center' } }, pr)))),
          h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1.3cqw', justifyContent: 'center', position: 'relative' } },
            h('div', { style: { position: 'absolute', inset: 0, left: '14cqw', display: 'grid', gridTemplateColumns: `repeat(${Math.max(periods.length, 1)},1fr)` } },
              periods.map((pr, i) => h('div', { key: i, style: { borderLeft: i ? `1px solid ${border(p)}` : 'none' } }))),
            rows.map((r, i) => h('div', { key: i, 'data-f': 'rows', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: '14cqw 1fr', alignItems: 'center', gap: '1.4cqw', position: 'relative', zIndex: 2 } },
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.55, scale), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, r.label || ''),
              h('div', { style: { position: 'relative', height: '2.4cqw' } },
                h('div', { style: { position: 'absolute', top: 0, bottom: 0, left: Math.max(0, Math.min(100, num(r.start))) + '%', width: Math.max(8, Math.min(100, num(r.width))) + '%', borderRadius: '99px', background: colors[i % colors.length], display: 'flex', alignItems: 'center', padding: '0 1.4cqw', fontFamily: D, fontWeight: 600, fontSize: z(1.3, scale), color: (i % colors.length === 3) ? p.body : '#fff', whiteSpace: 'nowrap', overflow: 'hidden' } }, r.note || ''))))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== roadmap-07 — now / soon / later phases ===== */
  function L_roadmapPhases(f, p, scale, B, n, total) {
    const phases = (f.phases || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Roadmap', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${Math.max(phases.length, 1)},1fr)`, gap: '2cqw' } },
          phases.map((ph, i) => {
            const now = i === 0;
            return h('div', { key: i, 'data-f': 'phases', 'data-fi': i, style: { borderRadius: '1.5cqw', padding: '2.4cqw 2.2cqw', display: 'flex', flexDirection: 'column', background: now ? (p.dark ? softPanel(p) : p.title) : 'transparent', border: `1px solid ${now ? (p.dark ? p.accent : p.title) : border(p)}`, color: now ? '#fff' : p.title } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.9cqw', fontFamily: MONO, fontWeight: 600, fontSize: z(1.3, scale), letterSpacing: '.1em', textTransform: 'uppercase', color: now ? '#fff' : p.accent } },
                h('span', { style: { width: '1.3cqw', height: '1.3cqw', borderRadius: '50%', background: now ? '#fff' : p.accent } }), ph.lab || ''),
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.3, scale), letterSpacing: '-0.01em', marginTop: '1.1cqw' } }, ph.heading || ''),
              h('ul', { style: { listStyle: 'none', margin: '1.6cqw 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '1cqw' } },
                (ph.items || []).slice(0, 4).map((it, k) => h('li', { key: k, style: { fontSize: z(1.5, scale), lineHeight: 1.32, color: now ? 'rgba(255,255,255,.84)' : p.body, paddingLeft: '1.8cqw', position: 'relative' } },
                  h('span', { style: { position: 'absolute', left: 0, top: '0.6cqw', width: '0.7cqw', height: '0.7cqw', borderRadius: '50%', background: p.accent } }), it))));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ---- avatar placeholder ---- */
  function Avatar({ p, initials, size, radius }) {
    return h('div', { style: { width: size, height: size, borderRadius: radius || '1.1cqw', flex: '0 0 auto', position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#1b1f27,#0c0e12)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      h('div', { style: { position: 'absolute', inset: 0, background: `radial-gradient(60% 60% at 50% 28%, ${mix(p.accent, 50, '#000')}, transparent 66%)`, opacity: .85 } }),
      h('span', { style: { position: 'relative', fontFamily: D, fontWeight: 800, fontSize: `calc(${size} * 0.4)`, color: 'rgba(255,255,255,.9)' } }, initials || ''));
  }

  /* ===== team-04 — 3×2 grid ===== */
  function L_teamGrid6(f, p, scale, B, n, total) {
    const ms = (f.members || []).slice(0, 6);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Team', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridAutoRows: '1fr', gap: '2cqw' } },
          ms.map((mi, i) => h('div', { key: i, 'data-f': 'members', 'data-fi': i, style: { display: 'flex', alignItems: 'center', gap: '1.6cqw', border: `1px solid ${border(p)}`, borderRadius: '1.3cqw', padding: '1.6cqw' } },
            h(Avatar, { p, initials: mi.initials, size: '6cqw' }),
            h('div', null,
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.8, scale), letterSpacing: '-0.01em' } }, mi.name || ''),
              h('div', { style: { fontSize: z(1.4, scale), color: p.accent, fontWeight: 600, marginTop: '0.3cqw' } }, mi.role || ''),
              mi.bio ? h('div', { style: { fontSize: z(1.3, scale), color: p.body, marginTop: '0.5cqw', lineHeight: 1.35 } }, mi.bio) : null))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== team-05 — lead + team ===== */
  function L_teamLead(f, p, scale, B, n, total) {
    const ms = (f.members || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Team', p, scale }),
        f.title ? h(Head, { key: 'h', f, p, scale }) : null,
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.05fr 1.4fr', gap: '3cqw' } },
          h('div', { key: 'l', style: { display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
            h(Avatar, { p, initials: f.leadInitials, size: '11cqw', radius: '1.6cqw' }),
            h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(2.7, scale), letterSpacing: '-0.02em', marginTop: '1.6cqw' } }, f.leadName || ''),
            h('div', { style: { fontFamily: D, fontWeight: 600, fontSize: z(1.6, scale), color: p.accent, marginTop: '0.4cqw' } }, f.leadRole || ''),
            f.leadQuote ? h('div', { style: { fontSize: z(1.6, scale), color: p.body, marginTop: '1.4cqw', lineHeight: 1.45, maxWidth: '92%' } }, f.leadQuote) : null),
          h('div', { key: 'r', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8cqw', alignContent: 'center' } },
            ms.map((mi, i) => h('div', { key: i, 'data-f': 'members', 'data-fi': i, style: { display: 'flex', alignItems: 'center', gap: '1.3cqw' } },
              h(Avatar, { p, initials: mi.initials, size: '5cqw', radius: '0.9cqw' }),
              h('div', null,
                h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.6, scale) } }, mi.name || ''),
                h('div', { style: { fontSize: z(1.35, scale), color: p.body, marginTop: '0.2cqw' } }, mi.role || ''))))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== team-06 — founder quote dark split ===== */
  function L_teamQuoteSplit(f, p, scale, B, n, total) {
    const ms = (f.members || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p),
      h('div', { style: { position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1.15fr' } },
        h('div', { key: 'l', style: { position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#1c2029,#0c0e12)', color: '#fff', padding: '6cqw 5cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          h('div', { style: { position: 'absolute', left: '-6cqw', bottom: '-6cqw', width: '24cqw', height: '24cqw', borderRadius: '50%', background: `radial-gradient(circle, ${mix(p.accent, 55, '#000')}, transparent 68%)` } }),
          h('div', { style: { fontFamily: 'Georgia, serif', fontSize: z(9, scale), lineHeight: 0.5, height: z(4, scale), color: p.accent, position: 'relative' } }, '\u201C'),
          h('blockquote', { 'data-f': 'quote', style: { margin: 0, fontFamily: D, fontWeight: 700, fontSize: z(2.5, scale), lineHeight: 1.36, position: 'relative', zIndex: 1, letterSpacing: '-0.01em' } }, f.quote || ''),
          h('div', { style: { marginTop: '2.4cqw', display: 'flex', alignItems: 'center', gap: '1.4cqw', position: 'relative', zIndex: 1 } },
            h(Avatar, { p, initials: f.authorInitials, size: '5cqw', radius: '1cqw' }),
            h('div', null,
              h('div', { 'data-f': 'author', style: { fontFamily: D, fontWeight: 700, fontSize: z(1.8, scale) } }, f.author || ''),
              f.role ? h('div', { style: { fontSize: z(1.4, scale), color: 'rgba(255,255,255,.66)', marginTop: '0.2cqw' } }, f.role) : null))),
        h('div', { key: 'r', style: { padding: '6cqw 5cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          h('div', { style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.35, scale), letterSpacing: '.12em', textTransform: 'uppercase', color: p.faint } }, 'Команда'),
          h('div', { style: { marginTop: '2cqw', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8cqw' } },
            ms.map((mi, i) => h('div', { key: i, 'data-f': 'members', 'data-fi': i, style: { display: 'flex', alignItems: 'center', gap: '1.3cqw', border: `1px solid ${border(p)}`, borderRadius: '1.1cqw', padding: '1.4cqw' } },
              h(Avatar, { p, initials: mi.initials, size: '4.4cqw', radius: '0.8cqw' }),
              h('div', null,
                h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.55, scale) } }, mi.name || ''),
                h('div', { style: { fontSize: z(1.3, scale), color: p.accent, fontWeight: 600, marginTop: '0.2cqw' } }, mi.role || ''))))))),
      h(Foot, { p, brand: B, n, total }));
  }

  /* ===== team-07 — team + trust stats ===== */
  function L_teamTrust(f, p, scale, B, n, total) {
    const ms = (f.members || []).slice(0, 4);
    const stats = (f.stats || []).slice(0, 3);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Team', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '2.4cqw', justifyContent: 'center' } },
          h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${Math.max(ms.length, 1)},1fr)`, gap: '2cqw' } },
            ms.map((mi, i) => h('div', { key: i, 'data-f': 'members', 'data-fi': i, style: { textAlign: 'center' } },
              h('div', { style: { display: 'flex', justifyContent: 'center' } }, h(Avatar, { p, initials: mi.initials, size: '7cqw', radius: '50%' })),
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.7, scale), marginTop: '1.1cqw' } }, mi.name || ''),
              h('div', { style: { fontSize: z(1.35, scale), color: p.body, marginTop: '0.3cqw' } }, mi.role || '')))),
          h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${Math.max(stats.length, 1)},1fr)`, gap: '2cqw', paddingTop: '2.2cqw', borderTop: `1px solid ${border(p)}` } },
            stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { textAlign: 'center' } },
              h('div', { style: { fontFamily: D, fontWeight: 800, fontSize: z(3.4, scale), color: p.accent, letterSpacing: '-0.03em', lineHeight: 1 } }, s.value || ''),
              h('div', { style: { fontSize: z(1.4, scale), color: p.body, marginTop: '0.5cqw' } }, s.label || '')))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== process-04 — arrow steps ===== */
  function L_processArrows(f, p, scale, B, n, total) {
    const steps = (f.steps || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Process', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${Math.max(steps.length, 1)},1fr)`, alignItems: 'stretch', gap: '3cqw' } },
          steps.map((s, i) => h('div', { key: i, 'data-f': 'steps', 'data-fi': i, style: { position: 'relative', border: `1px solid ${border(p)}`, borderRadius: '1.4cqw', padding: '2.2cqw 1.9cqw', display: 'flex', flexDirection: 'column' } },
            i < steps.length - 1 ? h('div', { style: { position: 'absolute', right: '-2cqw', top: '50%', transform: 'translateY(-50%)', width: '2cqw', height: '0.25cqw', background: p.dark ? 'rgba(255,255,255,.25)' : mix(p.title, 28, '#fff') } }) : null,
            i < steps.length - 1 ? h('div', { style: { position: 'absolute', right: '-1cqw', top: '50%', transform: 'translateY(-50%) rotate(45deg)', width: '1cqw', height: '1cqw', borderTop: `0.25cqw solid ${p.dark ? 'rgba(255,255,255,.25)' : mix(p.title, 28, '#fff')}`, borderRight: `0.25cqw solid ${p.dark ? 'rgba(255,255,255,.25)' : mix(p.title, 28, '#fff')}`, zIndex: 2 } }) : null,
            h('div', { style: { width: '3.4cqw', height: '3.4cqw', borderRadius: '0.9cqw', background: p.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(1.8, scale) } }, String(i + 1)),
            h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.95, scale), marginTop: '1.5cqw', letterSpacing: '-0.01em' } }, s.title || ''),
            h('div', { style: { fontSize: z(1.45, scale), color: p.body, marginTop: '0.8cqw', lineHeight: 1.4 } }, s.desc || ''))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== process-05 — circular cycle ===== */
  function L_processCycle(f, p, scale, B, n, total) {
    const steps = (f.steps || []).slice(0, 4);
    const positions = [{ left: '50%', top: '0%' }, { left: '100%', top: '50%' }, { left: '50%', top: '100%' }, { left: '0%', top: '50%' }];
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Process', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '3cqw', alignItems: 'center' } },
          h('div', { key: 'ring', style: { position: 'relative', width: '78%', aspectRatio: '1', maxHeight: '38cqw', margin: '0 auto' } },
            h('div', { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '40%', height: '40%', borderRadius: '50%', background: p.title, color: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(2, scale), textAlign: 'center' } }, f.centerLabel || 'Presa'),
            steps.map((s, i) => h('div', { key: i, style: { position: 'absolute', left: positions[i].left, top: positions[i].top, transform: 'translate(-50%,-50%)', width: '5.4cqw', height: '5.4cqw', borderRadius: '50%', background: p.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(2, scale) } }, String(i + 1)))),
          h('ul', { key: 'list', style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.6cqw' } },
            steps.map((s, i) => h('li', { key: i, 'data-f': 'steps', 'data-fi': i, style: { display: 'flex', gap: '1.4cqw', alignItems: 'flex-start' } },
              h('div', { style: { width: '2.8cqw', height: '2.8cqw', borderRadius: '0.7cqw', background: accentSoft(p), color: p.dark ? '#fff' : mix(p.accent, 70, '#000'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(1.5, scale), flex: '0 0 auto' } }, String(i + 1)),
              h('div', null,
                h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.8, scale) } }, s.heading || ''),
                h('div', { style: { fontSize: z(1.45, scale), color: p.body, marginTop: '0.3cqw', lineHeight: 1.35 } }, s.text || ''))))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== process-06 — steps + owners ===== */
  function L_processOwners(f, p, scale, B, n, total) {
    const steps = (f.steps || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Process', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.2cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', borderTop: `1px solid ${border(p)}` } },
          steps.map((s, i) => h('div', { key: i, 'data-f': 'steps', 'data-fi': i, style: { flex: 1, display: 'grid', gridTemplateColumns: '4cqw 1fr 16cqw', gap: '2.4cqw', alignItems: 'center', padding: '1.3cqw 0.2cqw', borderBottom: `1px solid ${border(p)}` } },
            h('div', { style: { width: '3.4cqw', height: '3.4cqw', borderRadius: '50%', border: `0.3cqw solid ${p.accent}`, color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(1.6, scale) } }, String(i + 1)),
            h('div', null,
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.95, scale), letterSpacing: '-0.01em' } }, s.title || ''),
              s.desc ? h('div', { style: { fontSize: z(1.45, scale), color: p.body, marginTop: '0.3cqw' } }, s.desc) : null),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '1cqw' } },
              h(Avatar, { p, initials: (s.owner || 'A').slice(0, 1), size: '3cqw', radius: '50%' }),
              h('div', null,
                h('div', { style: { fontFamily: D, fontWeight: 600, fontSize: z(1.45, scale) } }, s.owner || ''),
                s.ownerRole ? h('div', { style: { fontSize: z(1.2, scale), color: p.body, marginTop: '0.1cqw' } }, s.ownerRole) : null)))))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== numbers-08 — progress rings ===== */
  function L_progressRings(f, p, scale, B, n, total) {
    const rings = (f.rings || []).slice(0, 4);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Numbers', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${Math.max(rings.length, 1)},1fr)`, gap: '2.4cqw', alignItems: 'center', paddingBottom: '2cqw' } },
          rings.map((r, i) => {
            const pct = Math.max(0, Math.min(100, num(r.pct)));
            return h('div', { key: i, 'data-f': 'rings', 'data-fi': i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } },
              h('div', { style: { position: 'relative', width: '58%', aspectRatio: '1', maxHeight: '20cqw' } },
                h('svg', { viewBox: '0 0 36 36', style: { width: '100%', height: '100%', transform: 'rotate(-90deg)' } },
                  h('circle', { cx: 18, cy: 18, r: 15.5, fill: 'none', stroke: softPanel(p), strokeWidth: 4 }),
                  h('circle', { cx: 18, cy: 18, r: 15.5, fill: 'none', stroke: p.accent, strokeWidth: 4, strokeLinecap: 'round', strokeDasharray: `${(pct * 0.974).toFixed(1)} 100` })),
                h('div', { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: D, fontWeight: 800, fontSize: z(3, scale), letterSpacing: '-0.03em', color: p.title } }, pct + '%')),
              h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(1.85, scale), marginTop: '1.4cqw', whiteSpace: 'nowrap' } }, r.heading || ''),
              h('div', { style: { fontSize: z(1.4, scale), color: p.body, marginTop: '0.4cqw', lineHeight: 1.35, whiteSpace: 'nowrap' } }, r.desc || ''));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== solution-09 — flow input → hub → output ===== */
  function L_solutionFlow(f, p, scale, B, n, total) {
    const side = (label, items, to) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1.4cqw' } },
      h('div', { style: { fontFamily: MONO, fontWeight: 600, fontSize: z(1.35, scale), letterSpacing: '.1em', textTransform: 'uppercase', color: to ? p.accent : p.faint } }, label),
      items.map((it, i) => h('div', { key: i, 'data-f': to ? 'outputs' : 'inputs', 'data-fi': i, style: { display: 'flex', alignItems: 'center', gap: '1.4cqw', border: `1px solid ${to ? (p.dark ? 'rgba(229,50,43,.4)' : mix(p.accent, 22, '#fff')) : border(p)}`, background: to ? accentSoft(p) : 'transparent', borderRadius: '1.2cqw', padding: '1.5cqw 1.8cqw' } },
        h('span', { style: { width: '1.4cqw', height: '1.4cqw', borderRadius: '50%', background: to ? p.accent : (p.dark ? 'rgba(255,255,255,.3)' : mix(p.title, 28, '#fff')), flex: '0 0 auto' } }),
        h('span', { style: { fontSize: z(1.55, scale), fontWeight: 600, lineHeight: 1.3, color: p.title } }, it.text || ''))));
    const arrow = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4cqw' } },
      h('span', { style: { fontSize: z(2.6, scale), color: p.faint, lineHeight: 1 } }, '\u2192'),
      h('div', { style: { width: '8cqw', height: '8cqw', borderRadius: '1.8cqw', background: p.title, color: p.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
        h('span', { style: { fontFamily: D, fontWeight: 800, fontSize: z(1.7, scale) } }, f.hubLabel || 'Presa'),
        f.hubSub ? h('span', { style: { fontFamily: MONO, fontWeight: 500, fontSize: z(1.1, scale), color: p.dark ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.6)', marginTop: '0.2cqw' } }, f.hubSub) : null),
      h('span', { style: { fontSize: z(2.6, scale), color: p.faint, lineHeight: 1 } }, '\u2192'));
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Solution', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.6cqw', flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2cqw', alignItems: 'center' } },
          side(f.inputsLabel || 'Было — вход', (f.inputs || []).slice(0, 3), false),
          arrow,
          side(f.outputsLabel || 'Стало — результат', (f.outputs || []).slice(0, 3), true))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  /* ===== solution-10 — layers ===== */
  function L_solutionLayers(f, p, scale, B, n, total) {
    const layers = (f.layers || []).slice(0, 5);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg, color: p.title } },
      Bar(p), Pad([
        h(Sec, { key: 's', label: f.eyebrow || 'Solution', p, scale }),
        h(Head, { key: 'h', f, p, scale }),
        h(Sub, { key: 'u', f, p, scale }),
        h('div', { key: 'm', style: { marginTop: '2.4cqw', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.2cqw' } },
          layers.map((ly, i) => {
            const on = i === 0;
            return h('div', { key: i, 'data-f': 'layers', 'data-fi': i, style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2cqw', alignItems: 'center', border: `1px solid ${on ? p.accent : border(p)}`, background: on ? p.accent : 'transparent', color: on ? '#fff' : p.title, borderRadius: '1.3cqw', padding: '1.5cqw 2.2cqw' } },
              h('div', { style: { width: '3.4cqw', height: '3.4cqw', borderRadius: '0.9cqw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontWeight: 800, fontSize: z(1.7, scale), background: on ? 'rgba(255,255,255,.2)' : accentSoft(p), color: on ? '#fff' : (p.dark ? '#fff' : mix(p.accent, 70, '#000')), flex: '0 0 auto' } }, String(i + 1)),
              h('div', null,
                h('div', { style: { fontFamily: D, fontWeight: 700, fontSize: z(2, scale), letterSpacing: '-0.01em' } }, ly.heading || ''),
                ly.text ? h('div', { style: { fontSize: z(1.55, scale), color: on ? 'rgba(255,255,255,.86)' : p.body, marginTop: '0.3cqw', lineHeight: 1.35 } }, ly.text) : null));
          }))
      ]), h(Foot, { p, brand: B, n, total }));
  }

  window.PresaExtraLayouts = Object.assign(window.PresaExtraLayouts || {}, {
    feature_matrix_priced: L_featureMatrixPriced,
    compare_check: L_compareCheck,
    price_matrix: L_priceMatrix,
    role_matrix: L_roleMatrix,
    data_total: L_dataTotal,
    bar_table: L_barTable,
    tier_3_featured: L_tier3Featured,
    tier_2_big: L_tier2Big,
    single_price: L_singlePrice,
    value_scale: L_valueScale,
    before_after: L_beforeAfter,
    quote_result: L_quoteResult,
    case_timeline: L_caseTimeline,
    case_result_photo: L_caseResultPhoto,
    vs_columns: L_vsColumns,
    transformation: L_transformation,
    criteria_scale: L_criteriaScale,
    chart_donut2: L_chartDonut2,
    bar_horizontal: L_barHorizontal,
    chart_trend: L_chartTrend,
    cta_qr: L_ctaQr,
    contact_map: L_contactMap,
    cta_accent: L_ctaAccent,
    roadmap_quarters: L_roadmapQuarters,
    roadmap_milestones: L_roadmapMilestones,
    roadmap_gantt: L_roadmapGantt,
    roadmap_phases: L_roadmapPhases,
    team_grid_6: L_teamGrid6,
    team_lead: L_teamLead,
    team_quote_split: L_teamQuoteSplit,
    team_trust: L_teamTrust,
    process_arrows: L_processArrows,
    process_cycle: L_processCycle,
    process_owners: L_processOwners,
    progress_rings: L_progressRings,
    solution_flow: L_solutionFlow,
    solution_layers: L_solutionLayers
  });
})();
