/* global React */
/* ============================================================
   Presa — SlideRenderer
   One renderer, ~17 distinct compositions switched by layoutType.
   Scales via CSS container units (cqw); `scale` shrinks dense slides.
   The same layoutType map drives the PPTX exporter (pptx-render.js).
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useRef, useState, useLayoutEffect } = React;

  /* ============================================================
     AutoFitText — measures rendered line count and shrinks the
     font (in cqw, so it tracks the slide's container scaling)
     until the text fits within `maxLines`, down to `minScale`.
     Keeps composition intact (wraps + scales, never overflows).
     `data-f` stays on the root so click / inline-edit still work.
     ============================================================ */
  function AutoFitText(props) {
    const { tag, text, baseCqw, scale, maxLines, minScale, lineHeight, style, dataF } = props;
    const ref = useRef(null);
    const [fit, setFit] = useState(1);
    // reset to full size whenever the content or its base size changes
    useLayoutEffect(() => { setFit(1); }, [text, baseCqw, scale, maxLines]);
    // measure every render; only ever shrink from the reset baseline
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el || !text || !maxLines) return;
      const cs = window.getComputedStyle(el);
      const fpx = parseFloat(cs.fontSize) || 1;
      let lh = parseFloat(cs.lineHeight);
      if (!lh || isNaN(lh)) lh = (lineHeight || 1.2) * fpx;
      const lines = Math.max(1, Math.round(el.scrollHeight / lh));
      if (lines > maxLines) {
        const target = Math.max(minScale || 0.55, maxLines / lines);
        if (target < fit - 0.012) setFit(target);
      }
    });
    const size = baseCqw * (scale || 1) * fit;
    const st = Object.assign({}, style || {}, { fontSize: size.toFixed(2) + 'cqw' });
    if (lineHeight != null) st.lineHeight = lineHeight;
    return h(tag || 'div', { ref: ref, 'data-f': dataF, style: st }, text);
  }

  const LIGHT = { dark: false, bg: '#FFFFFF', panel: '#F6F7F9', panel2: '#EFF1F4', title: '#0E1116', body: '#5B6573', faint: '#9AA2AE', border: '#E7E9ED', onAccent: '#FFFFFF' };
  const DARK  = { dark: true,  bg: '#0C0E12', panel: '#15181F', panel2: '#1B1F27', title: '#FFFFFF', body: '#AEB5C0', faint: '#727A87', border: '#242833', onAccent: '#FFFFFF' };

  function palette(template, theme) {
    const forceDark = template.layoutType === 'title_dark';
    const dark = forceDark || (theme.dark && (template.themeSupport || []).includes('dark'));
    const p = dark ? { ...DARK } : { ...LIGHT };
    p.accent = theme.accent || (dark ? '#F0463E' : '#E5322B');
    p.accentSoft = dark ? 'rgba(240,70,62,.16)' : '#FFF2F0';
    return p;
  }

  // size helper: base cqw * scale
  const z = (base, scale) => `${(base * (scale || 1)).toFixed(2)}cqw`;

  // numeric parse for chart values ("12,5", "34 млн" → number)
  const num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : 0; };
  const chartColors = (p) => [p.accent, p.title, p.faint, '#F0A8A4', '#C9CFDA', '#8A4540'];

  // soft tint of the ACTUAL accent (palette.accentSoft is hardcoded red — avoid it for themed chips)
  const softTint = (p) => `color-mix(in srgb, ${p.accent} 12%, ${p.bg})`;

  // map a list item's text to a meaningful icon from PresaIcons; falls back to a varied cycle
  const ICON_KW = [
    [/печат|pdf|word|excel|документ|файл|бумаг|doc/i, 'doc'],
    [/скан|копир|оцифр/i, 'layers'],
    [/облак|cloud|удал[её]нн|онлайн|интернет|сеть/i, 'cloud'],
    [/монитор|аналит|отч[её]т|статист|метрик|данны|график|измер/i, 'chart'],
    [/безопас|защит|надёжн|secur|антивир/i, 'shield'],
    [/быстр|скорост|молни|мгновен|оператив/i, 'bolt'],
    [/цвет|дизайн|бренд|палитр|оформл/i, 'palette'],
    [/команд|сотрудник|польз|клиент|персонал|user/i, 'users'],
    [/врем|час\b|срок|расписан|график работ/i, 'clock'],
    [/цел|задач|результат|эффектив|target/i, 'target'],
    [/связ|контакт|звон|phone|телефон|поддержк/i, 'phone'],
    [/чат|сообщ|обращен|перепис/i, 'chat'],
    [/иде|инновац|умн|интеллект|ai|ии\b|smart/i, 'bulb'],
    [/рост|запуск|развит|масштаб|стартап/i, 'rocket'],
    [/настрой|интеграц|конфигур|gear|автоматиз/i, 'gear'],
    [/качеств|стандарт|сертиф|гаранти|badge/i, 'badge'],
    [/глоб|мир\b|стран|международ|globe|экспорт/i, 'globe'],
    [/замок|приват|пароль|шифр|lock|конфиденц/i, 'lock'],
    [/магазин|корзин|продаж|cart|покуп|заказ/i, 'cart'],
    [/звезд|премиум|лучш|топ|star|выгод/i, 'star'],
    [/сервер|систем|инфраструктур|box|оборудован/i, 'box'],
    [/договор|партн[её]р|сделк|сотруднич|handshake/i, 'handshake']
  ];
  const ICON_CYCLE = ['spark', 'bolt', 'layers', 'target', 'shield', 'chart', 'cloud', 'badge'];
  function guessIcon(text, i) {
    const s = String(text || '');
    for (let k = 0; k < ICON_KW.length; k++) if (ICON_KW[k][0].test(s)) return ICON_KW[k][1];
    return ICON_CYCLE[(i || 0) % ICON_CYCLE.length];
  }

  function Mark({ accent, size }) {
    return h('span', { style: { width: size, height: size, borderRadius: '0.6cqw', background: accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
      h('svg', { width: '60%', height: '60%', viewBox: '0 0 24 24', fill: 'none' },
        h('rect', { x: 5, y: 6, width: 14, height: 2.6, rx: 1.3, fill: '#fff' }),
        h('rect', { x: 5, y: 10.7, width: 14, height: 2.6, rx: 1.3, fill: '#fff', opacity: .6 }),
        h('rect', { x: 5, y: 15.4, width: 8.5, height: 2.6, rx: 1.3, fill: '#fff', opacity: .38 })));
  }

  function Eyebrow({ text, p, scale, fk, color }) {
    const c = color || p.accent;
    return h('div', { 'data-f': fk, style: { display: 'flex', alignItems: 'center', gap: '1.2cqw', color: c, fontFamily: 'var(--font-mono)', fontSize: z(1.5, scale), fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' } },
      h('span', { style: { width: '4cqw', height: '0.25cqw', background: c, display: 'inline-block' } }), text || '');
  }

  // camera-icon placeholder shown when an image slot is empty
  function ImgPlaceholder({ p, label, scale }) {
    return h('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.4cqw' } },
      h('svg', { width: '8cqw', height: '8cqw', viewBox: '0 0 24 24', fill: 'none' },
        h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 2, stroke: p.faint, strokeWidth: 1.4 }),
        h('circle', { cx: 8.5, cy: 9.5, r: 1.8, stroke: p.faint, strokeWidth: 1.4 }),
        h('path', { d: 'M4 17l5-5 4 4 3-3 4 4', stroke: p.faint, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' })),
      label ? h('div', { style: { color: p.faint, fontSize: z(1.6, scale), fontFamily: 'var(--font-mono)' } }, label) : null);
  }

  function Footer({ p, brand, n, total }) {
    const B = brand || {};
    return h('div', { style: { position: 'absolute', left: '8cqw', right: '8cqw', bottom: '2.4cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.5cqw', color: p.faint } },
      h('span', { style: { fontWeight: 700, color: p.title, letterSpacing: '.01em' } }, B.name || 'Presa'),
      B.pageNum !== false ? h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '1.35cqw' } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')) : null);
  }

  // brand logo lives in a TOP corner. Side depends on the design: right by default,
  // left when the layout's right side is already occupied by a panel or image.
  function logoSide(layoutType) {
    const rightHeavy = ['split_accent', 'side_list', 'title_image_split', 'text_media', 'chart_donut', 'big_stat'];
    return rightHeavy.indexOf(layoutType) >= 0 ? 'left' : 'right';
  }
  function TopLogo({ p, brand, layoutType, onDark }) {
    const B = brand || {};
    // layouts that already carry a brand mark / label in their top zone
    const skip = ['title_band', 'title_editorial', 'title_minimal', 'about_lead_cards', 'about_timeline_stats', 'about_text_media'];
    if (skip.indexOf(layoutType) >= 0) return null;
    const side = logoSide(layoutType);
    const st = { position: 'absolute', top: '4.2cqw', zIndex: 4, display: 'flex', alignItems: 'center' };
    st[side] = '8cqw';
    return h('div', { style: st },
      B.logo
        ? h('img', { src: B.logo, alt: '', style: { height: '3.8cqw', width: 'auto', display: 'block', filter: onDark ? 'drop-shadow(0 0.2cqw 1.4cqw rgba(0,0,0,.45))' : 'none' } })
        : h(Mark, { accent: p.accent, size: '3.2cqw' }));
  }

  const Bar = (p) => h('div', { key: 'accent-bar', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '1.4cqw', background: p.accent } });
  const pad = (justify) => ({ position: 'absolute', inset: 0, padding: '7cqw 8cqw 9cqw', display: 'flex', flexDirection: 'column', justifyContent: justify || 'flex-start' });
  const Title = (txt, p, scale, size) => h(AutoFitText, { tag: 'h2', dataF: 'title', text: txt, baseCqw: (size || 4.4), scale: scale, maxLines: 2, minScale: 0.6, lineHeight: 1.05, style: { fontWeight: 800, letterSpacing: '-0.02em', color: p.title, margin: '2cqw 0 0', maxWidth: '90%' } });
  // body paragraph that scales down (and wraps) so long descriptions never overflow
  const Body = (txt, p, scale, opts) => {
    const o = opts || {};
    return h(AutoFitText, { tag: 'p', dataF: o.fk || 'text', text: txt, baseCqw: (o.base || 2.4), scale: scale, maxLines: (o.maxLines || 4), minScale: (o.minScale || 0.72), lineHeight: (o.lineHeight || 1.45), style: Object.assign({ color: o.color || p.body, marginTop: o.marginTop || '2.4cqw', maxWidth: o.maxWidth || '78%' }, o.style || {}) });
  };

  // ---------------- LAYOUTS ----------------
  function L_title(f, p, scale, dark) {
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: f.eyebrow || 'PRESENTATION', p, scale, fk: 'eyebrow' }),
      h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 7, scale: scale, maxLines: 3, minScale: 0.46, lineHeight: 1.02, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: '3cqw 0 0', maxWidth: '84%' } }),
      f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.7, scale), marginTop: '2.6cqw', maxWidth: '68%', lineHeight: 1.4 } }, f.subtitle) : null)];
  }

  function L_split(f, p, scale) {
    return [h('div', { key: 'l', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '62%', padding: '7cqw 6cqw 7cqw 8cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h(Eyebrow, { text: f.eyebrow, p, scale, fk: 'eyebrow' }),
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 5.6, scale: scale, maxLines: 3, minScale: 0.5, lineHeight: 1.04, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: '2.6cqw 0 0' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.5, scale), marginTop: '2.4cqw', lineHeight: 1.4 } }, f.subtitle) : null),
      h('div', { key: 'r', style: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '38%', background: p.accent, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '6cqw' } },
        h('div', { style: { color: '#fff' } },
          h(Mark, { accent: 'rgba(255,255,255,.18)', size: '6cqw' }),
          f.sideLabel ? h('div', { 'data-f': 'sideLabel', style: { marginTop: '3cqw', fontFamily: 'var(--font-mono)', fontSize: '2cqw', fontWeight: 600, letterSpacing: '.04em' } }, f.sideLabel) : null))];
  }

  function L_titleCenter(f, p, scale) {
    return [h('div', { key: 'top', style: { position: 'absolute', left: 0, right: 0, top: 0, height: '0.9cqw', background: p.accent } }),
      h('div', { key: 'c', style: { ...pad('center'), alignItems: 'center', textAlign: 'center' } },
        h('div', { 'data-f': 'eyebrow', style: { color: p.accent, fontFamily: 'var(--font-mono)', fontSize: z(1.5, scale), fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' } }, f.eyebrow || 'PRESENTATION'),
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 6.4, scale: scale, maxLines: 3, minScale: 0.48, lineHeight: 1.04, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: '2.4cqw 0 0', maxWidth: '82%' } }),
        h('div', { style: { width: '6cqw', height: '0.4cqw', background: p.accent, margin: '2.6cqw 0 0', borderRadius: '0.2cqw' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.5, scale), marginTop: '2.4cqw', maxWidth: '62%', lineHeight: 1.4 } }, f.subtitle) : null)];
  }

  function L_titleBand(f, p, scale) {
    return [
      h('div', { key: 'band', style: { position: 'absolute', left: 0, right: 0, top: 0, height: '28%', background: p.accent, padding: '0 8cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4cqw' } },
        h('div', { 'data-f': 'eyebrow', style: { color: '#fff', fontFamily: 'var(--font-mono)', fontSize: z(1.7, scale), fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' } }, f.eyebrow || 'PRESENTATION'),
        f.sideLabel ? h('div', { 'data-f': 'sideLabel', style: { color: 'rgba(255,255,255,.85)', fontFamily: 'var(--font-mono)', fontSize: z(2, scale), fontWeight: 700, letterSpacing: '.06em' } }, f.sideLabel) : null),
      h('div', { key: 'c', style: { position: 'absolute', left: 0, right: 0, top: '28%', bottom: 0, padding: '4cqw 8cqw 9cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 6, scale: scale, maxLines: 2, minScale: 0.5, lineHeight: 1.04, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: 0, maxWidth: '86%' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.5, scale), marginTop: '2.4cqw', maxWidth: '66%', lineHeight: 1.4 } }, f.subtitle) : null)];
  }

  function L_titleMinimal(f, p, scale) {
    return [h('div', { key: 'c', style: { ...pad(), justifyContent: 'space-between' } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h(Eyebrow, { text: f.eyebrow, p, scale, fk: 'eyebrow' }),
        h('span', { style: { width: '2.2cqw', height: '2.2cqw', borderRadius: '50%', background: p.accent, flex: '0 0 auto' } })),
      h('div', { style: { paddingBottom: '1.5cqw' } },
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 5.8, scale: scale, maxLines: 3, minScale: 0.5, lineHeight: 1.05, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: 0, maxWidth: '78%' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.4, scale), marginTop: '2cqw', maxWidth: '60%', lineHeight: 1.45 } }, f.subtitle) : null))];
  }

  // full-bleed photo cover (renders its own slide + footer so colors invert on the image)
  function L_titleImageFull(f, p, scale, B, n, total) {
    const hasImg = !!f.image;
    const onImg = hasImg;
    const fg = onImg ? '#FFFFFF' : p.title;
    const Bo = B || { name: 'Presa', logo: null, pageNum: true };
    return h('div', { className: 'slide', style: { containerType: 'inline-size', background: onImg ? '#000' : p.bg, position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: 'var(--font-sans)' } },
      h('div', { key: 'bg', 'data-f': 'imageLabel', style: { position: 'absolute', inset: 0, background: hasImg ? '#000' : p.panel, overflow: 'hidden' } },
        hasImg ? h('img', { src: f.image, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }) : h(ImgPlaceholder, { p, label: 'Перетащите фон во вкладке «Контент»', scale }),
        hasImg ? h('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,10,14,.12) 0%, rgba(8,10,14,.28) 42%, rgba(8,10,14,.82) 100%)' } }) : null),
      Bar(p),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', bottom: '9.5cqw', zIndex: 2 } },
        h(Eyebrow, { text: f.eyebrow || 'PRESENTATION', p, scale, fk: 'eyebrow', color: onImg ? '#fff' : p.accent }),
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 6.6, scale: scale, maxLines: 3, minScale: 0.46, lineHeight: 1.02, style: { fontWeight: 800, letterSpacing: '-0.03em', color: fg, margin: '2.4cqw 0 0', maxWidth: '82%', textShadow: onImg ? '0 0.2cqw 2.4cqw rgba(0,0,0,.35)' : 'none' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: onImg ? 'rgba(255,255,255,.84)' : p.body, fontSize: z(2.5, scale), marginTop: '2cqw', maxWidth: '60%', lineHeight: 1.4 } }, f.subtitle) : null),
      h('div', { key: 'ft', style: { position: 'absolute', left: '8cqw', right: '8cqw', bottom: '4cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.5cqw', color: onImg ? 'rgba(255,255,255,.6)' : p.faint, zIndex: 2 } },
        h('span', { style: { fontWeight: 700, color: fg, letterSpacing: '.01em' } }, Bo.name || 'Presa'),
        Bo.pageNum !== false ? h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '1.35cqw' } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')) : null),
      h(TopLogo, { key: 'logo', p, brand: Bo, layoutType: 'title_image_full', onDark: onImg }));
  }

  // title left, full-height image panel right
  function L_titleImageSplit(f, p, scale) {
    const hasImg = !!f.image;
    return [
      h('div', { key: 'l', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '52%', padding: '7cqw 5cqw 9cqw 8cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h(Eyebrow, { text: f.eyebrow || 'PRESENTATION', p, scale, fk: 'eyebrow' }),
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 5.2, scale: scale, maxLines: 4, minScale: 0.5, lineHeight: 1.04, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: '2.6cqw 0 0' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.4, scale), marginTop: '2.4cqw', lineHeight: 1.4, maxWidth: '94%' } }, f.subtitle) : null),
      h('div', { key: 'r', 'data-f': 'imageLabel', style: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%', background: hasImg ? '#000' : p.panel, overflow: 'hidden' } },
        hasImg ? h('img', { src: f.image, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }) : h(ImgPlaceholder, { p, label: f.imageLabel || 'Изображение', scale }),
        h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '0.8cqw', background: p.accent } }))];
  }

  // editorial cover with a vertical accent label on the left rail (no image)
  function L_titleSidebar(f, p, scale) {
    return [
      h('div', { key: 'rule', style: { position: 'absolute', left: '6cqw', top: '7cqw', bottom: '7cqw', width: '0.4cqw', background: p.accent } }),
      h('div', { key: 'vl', 'data-f': 'sideLabel', style: { position: 'absolute', left: '2.4cqw', top: 0, bottom: 0, display: 'flex', alignItems: 'center' } },
        h('span', { style: { writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: p.faint, fontFamily: 'var(--font-mono)', fontSize: z(1.5, scale), fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase' } }, f.sideLabel || 'PRESA · 2026')),
      h('div', { key: 'c', style: { position: 'absolute', left: '9.5cqw', right: '8cqw', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '3cqw' } },
        h(Eyebrow, { text: f.eyebrow || 'PRESENTATION', p, scale, fk: 'eyebrow' }),
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 6.2, scale: scale, maxLines: 3, minScale: 0.48, lineHeight: 1.02, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: '2.6cqw 0 0', maxWidth: '94%' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.5, scale), marginTop: '2.4cqw', maxWidth: '74%', lineHeight: 1.4 } }, f.subtitle) : null)];
  }

  // big editorial headline with top rule (no image)
  function L_titleEditorial(f, p, scale) {
    return [
      h('div', { key: 'top', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: '7cqw', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `0.18cqw solid ${p.border}`, paddingBottom: '2cqw' } },
        h('div', { 'data-f': 'eyebrow', style: { color: p.accent, fontFamily: 'var(--font-mono)', fontSize: z(1.7, scale), fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' } }, f.eyebrow || 'PRESENTATION'),
        f.sideLabel ? h('div', { 'data-f': 'sideLabel', style: { color: p.faint, fontFamily: 'var(--font-mono)', fontSize: z(1.7, scale), fontWeight: 600 } }, f.sideLabel) : null),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: '33%', bottom: '9cqw', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' } },
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 8.2, scale: scale, maxLines: 3, minScale: 0.42, lineHeight: 0.98, style: { fontWeight: 800, letterSpacing: '-0.035em', color: p.title, margin: 0, maxWidth: '94%' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.6, scale), marginTop: '3cqw', maxWidth: '56%', lineHeight: 1.4 } }, f.subtitle) : null)];
  }

  /* ============================================================
     PREMIUM TITLE COVERS (SELF — own slide + logo + footer)
     ============================================================ */
  const clampN = (n) => ({ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: n, overflow: 'hidden' });
  function selfWrap(p, bg, kids) {
    return h('div', { className: 'slide', style: { containerType: 'inline-size', background: bg || p.bg, position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: 'var(--font-sans)' } }, kids);
  }
  function selfChrome(p, B, n, total, fg, markAccent) {
    const Bo = B || {};
    return [
      h('div', { key: 'lg', style: { position: 'absolute', top: '4.6cqw', left: '8cqw', zIndex: 5, display: 'flex', alignItems: 'center', gap: '1.2cqw' } },
        Bo.logo ? h('img', { src: Bo.logo, alt: '', style: { height: '3.6cqw', width: 'auto', display: 'block' } }) : h(Mark, { accent: markAccent || p.accent, size: '3.2cqw' })),
      h('div', { key: 'ft', style: { position: 'absolute', left: '8cqw', right: '8cqw', bottom: '4cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 5 } },
        h('span', { style: { fontWeight: 700, color: fg, fontSize: '1.6cqw', letterSpacing: '.01em' } }, Bo.name || 'Presa'),
        Bo.pageNum !== false ? h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '1.35cqw', color: fg, opacity: .6 } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')) : null)
    ];
  }
  function HeadAccent(f, mainColor, accentColor, sizeCqw, lines, ls, lh, maxW) {
    return h('h1', { style: Object.assign({ margin: 0, fontWeight: 800, letterSpacing: ls || '-0.03em', color: mainColor, fontSize: sizeCqw, lineHeight: lh || 1.02, maxWidth: maxW || '92%' }, clampN(lines || 3)) },
      h('span', { 'data-f': 'title' }, f.title),
      f.titleAccent ? h('span', { 'data-f': 'titleAccent', style: { color: accentColor } }, ' ' + f.titleAccent) : null);
  }

  // 1) Aurora — soft layered gradient glow, premium SaaS cover
  function L_titleAurora(f, p, scale, B, n, total) {
    const dark = p.dark;
    const glow = dark
      ? `radial-gradient(58cqw 42cqw at 84% 6%, color-mix(in srgb, ${p.accent} 42%, transparent), transparent 62%), radial-gradient(52cqw 44cqw at 4% 104%, color-mix(in srgb, ${p.accent} 22%, transparent), transparent 60%)`
      : `radial-gradient(56cqw 40cqw at 86% 4%, color-mix(in srgb, ${p.accent} 20%, transparent), transparent 62%), radial-gradient(48cqw 42cqw at -2% 102%, color-mix(in srgb, ${p.accent} 12%, transparent), transparent 60%)`;
    const dots = `radial-gradient(${dark ? 'rgba(255,255,255,.05)' : 'rgba(14,17,22,.05)'} 1px, transparent 1px)`;
    return selfWrap(p, p.bg, [
      h('div', { key: 'glow', style: { position: 'absolute', inset: 0, backgroundImage: glow } }),
      h('div', { key: 'dots', style: { position: 'absolute', inset: 0, backgroundImage: dots, backgroundSize: '3.4cqw 3.4cqw', WebkitMaskImage: 'radial-gradient(circle at 50% 46%, #000, transparent 78%)', maskImage: 'radial-gradient(circle at 50% 46%, #000, transparent 78%)', opacity: .8 } }),
      h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '7cqw 8cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 3 } },
        h('div', { 'data-f': 'eyebrow', style: { display: 'inline-flex', alignItems: 'center', gap: '1.1cqw', alignSelf: 'flex-start', background: dark ? 'rgba(255,255,255,.06)' : '#fff', border: `0.15cqw solid ${dark ? 'rgba(255,255,255,.14)' : p.border}`, borderRadius: '99cqw', padding: '1cqw 1.8cqw', color: p.accent, fontFamily: 'var(--font-mono)', fontSize: z(1.5, scale), fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', boxShadow: dark ? 'none' : '0 0.4cqw 1.6cqw rgba(14,17,22,.05)' } },
          h('span', { style: { width: '1.5cqw', height: '1.5cqw', borderRadius: '50%', background: p.accent } }), f.eyebrow || 'PRESENTATION'),
        h('div', { style: { marginTop: '3.2cqw' } }, HeadAccent(f, p.title, p.accent, z(6.6, scale), 3, '-0.03em', 1.0, '88%')),
        h('div', { style: { width: '7cqw', height: '0.34cqw', background: p.accent, borderRadius: '0.2cqw', margin: '3cqw 0 0' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.5, scale), marginTop: '2.6cqw', maxWidth: '60%', lineHeight: 1.45 } }, f.subtitle) : null),
      selfChrome(p, B, n, total, p.title)
    ]);
  }

  // 2) Spotlight — full-bleed accent, concentric rings, white type
  function L_titleSpotlight(f, p, scale, B, n, total) {
    const bg = `linear-gradient(135deg, color-mix(in srgb, ${p.accent} 88%, #fff) 0%, ${p.accent} 42%, color-mix(in srgb, ${p.accent} 64%, #000) 100%)`;
    const W = 'rgba(255,255,255,';
    return selfWrap(p, '#000', [
      h('div', { key: 'bg', style: { position: 'absolute', inset: 0, background: bg } }),
      h('div', { key: 'hl', style: { position: 'absolute', inset: 0, background: `radial-gradient(46cqw 40cqw at 12% 6%, ${W}.16), transparent 60%)` } }),
      h('svg', { key: 'rings', viewBox: '0 0 100 100', preserveAspectRatio: 'xMaxYMax slice', style: { position: 'absolute', right: '-6cqw', bottom: '-10cqw', width: '62cqw', height: '62cqw', opacity: .9 } },
        [34, 26, 18, 10].map((r, i) => h('circle', { key: i, cx: 78, cy: 80, r: r, fill: 'none', stroke: W + (i === 3 ? '.9)' : '.18)'), strokeWidth: i === 3 ? 1.4 : 0.8 }))),
      h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '7cqw 8cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 3 } },
        h('div', { 'data-f': 'eyebrow', style: { display: 'flex', alignItems: 'center', gap: '1.2cqw', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: z(1.6, scale), fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' } },
          h('span', { style: { width: '4cqw', height: '0.25cqw', background: '#fff' } }), f.eyebrow || 'PRESENTATION'),
        h('div', { style: { marginTop: '3cqw' } }, HeadAccent(f, '#fff', W + '.72)', z(7, scale), 3, '-0.035em', 1.0, '84%')),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: W + '.88)', fontSize: z(2.6, scale), marginTop: '2.8cqw', maxWidth: '60%', lineHeight: 1.45 } }, f.subtitle) : null),
      selfChrome(p, B, n, total, '#fff', 'rgba(255,255,255,.24)')
    ]);
  }

  // 3) Oversized — bold editorial, huge headline, top meta + rule
  function L_titleOversized(f, p, scale, B, n, total) {
    const Bo = B || {};
    return selfWrap(p, p.bg, [
      h('div', { key: 'top', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: '6.5cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 4 } },
        h('div', { 'data-f': 'eyebrow', style: { display: 'flex', alignItems: 'center', gap: '1.2cqw', color: p.accent, fontFamily: 'var(--font-mono)', fontSize: z(1.6, scale), fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' } },
          h(Mark, { accent: p.accent, size: '2.8cqw' }), f.eyebrow || 'PRESENTATION'),
        f.footerLabel ? h('span', { 'data-f': 'footerLabel', style: { color: p.faint, fontFamily: 'var(--font-mono)', fontSize: z(1.6, scale), fontWeight: 600 } }, f.footerLabel) : null),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        HeadAccent(f, p.title, p.accent, z(9.2, scale), 3, '-0.04em', 0.96, '96%'),
        h('div', { style: { borderTop: `0.18cqw solid ${p.border}`, margin: '3.4cqw 0 0' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.5, scale), marginTop: '2.6cqw', maxWidth: '58%', lineHeight: 1.45 } }, f.subtitle) : null),
      h('div', { key: 'ft', style: { position: 'absolute', left: '8cqw', right: '8cqw', bottom: '4cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 4 } },
        h('span', { style: { fontWeight: 700, color: p.title, fontSize: '1.6cqw' } }, Bo.name || 'Presa'),
        Bo.pageNum !== false ? h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: '1.35cqw', color: p.faint } }, String(n).padStart(2, '0'), ' / ', String(total).padStart(2, '0')) : null)
    ]);
  }

  // 4) Framed — inset border with corner ticks, centered premium cover
  function L_titleFrame(f, p, scale, B, n, total) {
    const Bo = B || {};
    const tick = (pos) => h('span', { style: Object.assign({ position: 'absolute', width: '3cqw', height: '3cqw', borderColor: p.accent, borderStyle: 'solid', borderWidth: 0 }, pos) });
    return selfWrap(p, p.bg, [
      h('div', { key: 'frame', style: { position: 'absolute', inset: '4.5cqw', border: `0.16cqw solid ${p.border}`, borderRadius: '1cqw' } },
        tick({ top: '-0.16cqw', left: '-0.16cqw', borderTopWidth: '0.5cqw', borderLeftWidth: '0.5cqw', borderTopLeftRadius: '1cqw' }),
        tick({ top: '-0.16cqw', right: '-0.16cqw', borderTopWidth: '0.5cqw', borderRightWidth: '0.5cqw', borderTopRightRadius: '1cqw' }),
        tick({ bottom: '-0.16cqw', left: '-0.16cqw', borderBottomWidth: '0.5cqw', borderLeftWidth: '0.5cqw', borderBottomLeftRadius: '1cqw' }),
        tick({ bottom: '-0.16cqw', right: '-0.16cqw', borderBottomWidth: '0.5cqw', borderRightWidth: '0.5cqw', borderBottomRightRadius: '1cqw' })),
      h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '11cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' } },
        h('div', { 'data-f': 'eyebrow', style: { color: p.accent, fontFamily: 'var(--font-mono)', fontSize: z(1.6, scale), fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase' } }, f.eyebrow || 'PRESENTATION'),
        h('div', { style: { marginTop: '3cqw' } }, h('h1', { style: Object.assign({ margin: 0, fontWeight: 800, letterSpacing: '-0.03em', color: p.title, fontSize: z(6, scale), lineHeight: 1.02, maxWidth: '80cqw', textAlign: 'center' }, clampN(3)) },
          h('span', { 'data-f': 'title' }, f.title), f.titleAccent ? h('span', { 'data-f': 'titleAccent', style: { color: p.accent } }, ' ' + f.titleAccent) : null)),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '1.4cqw', margin: '3cqw 0 0' } },
          h('span', { style: { width: '1.4cqw', height: '1.4cqw', borderRadius: '50%', background: p.accent } }),
          h('span', { style: { width: '9cqw', height: '0.18cqw', background: p.border } }),
          h('span', { style: { width: '1.4cqw', height: '1.4cqw', borderRadius: '50%', background: p.accent } })),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.4, scale), marginTop: '2.8cqw', maxWidth: '64%', lineHeight: 1.45 } }, f.subtitle) : null),
      h('div', { key: 'bm', style: { position: 'absolute', left: 0, right: 0, bottom: '7cqw', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2cqw', zIndex: 4 } },
        Bo.logo ? h('img', { src: Bo.logo, alt: '', style: { height: '3.2cqw', width: 'auto' } }) : h(Mark, { accent: p.accent, size: '2.8cqw' }),
        h('span', { style: { fontWeight: 700, color: p.title, fontSize: '1.7cqw', letterSpacing: '.01em' } }, Bo.name || 'Presa'))
    ]);
  }

  function L_agendaGrid(f, p, scale) {
    const items = f.items || [];
    const gcols = items.length > 3 ? 2 : 1;
    return [Bar(p), h('div', { key: 'c', style: pad('flex-start') },
      h(Eyebrow, { text: 'AGENDA', p, scale }), Title(f.title, p, scale, 4.2),
      h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${gcols}, 1fr)`, gap: '1.8cqw 2.4cqw', marginTop: '3.6cqw' } },
        items.map((b, i) => h('div', { key: i, 'data-f': 'items', 'data-fi': i, style: { display: 'flex', gap: '1.8cqw', alignItems: 'center', background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '1.2cqw', padding: '1.7cqw 2.2cqw' } },
          h('span', { style: { fontFamily: 'var(--font-mono)', color: p.accent, fontWeight: 700, fontSize: z(2.3, scale), flex: '0 0 auto' } }, String(i + 1).padStart(2, '0')),
          h('span', { style: { color: p.title, fontWeight: 600, fontSize: z(1.95, scale), lineHeight: 1.3, minWidth: 0 } }, b)))))];
  }

  function L_sideList(f, p, scale) {
    const items = f.items || [];
    return [
      h('div', { key: 'l', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '64%', padding: '7cqw 5cqw 9cqw 8cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h('ol', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: z(2.5, scale) } },
          items.map((b, i) => h('li', { key: i, 'data-f': 'items', 'data-fi': i, style: { display: 'flex', gap: '2cqw', alignItems: 'baseline', color: p.title, fontSize: z(2.4, scale), lineHeight: 1.3, fontWeight: 600 } },
            h('span', { style: { fontFamily: 'var(--font-mono)', color: p.accent, fontWeight: 700, fontSize: z(2, scale), minWidth: '3.4cqw', flex: '0 0 auto' } }, String(i + 1).padStart(2, '0')),
            h('span', { style: { minWidth: 0 } }, b))))),
      h('div', { key: 'r', style: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '36%', background: p.accent, padding: '7cqw 6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } },
        h('div', null,
          f.sideLabel ? h('div', { 'data-f': 'sideLabel', style: { color: 'rgba(255,255,255,.75)', fontFamily: 'var(--font-mono)', fontSize: z(1.5, scale), fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' } }, f.sideLabel) : null,
          h('h2', { 'data-f': 'title', style: { color: '#fff', fontWeight: 800, fontSize: z(3.8, scale), lineHeight: 1.08, letterSpacing: '-0.02em', margin: '2cqw 0 0' } }, f.title)),
        h(Mark, { accent: 'rgba(255,255,255,.18)', size: '4.6cqw' }))];
  }

  // list slide → presentable icon-card grid that fills the whole slide
  function L_bullets(f, p, scale) {
    const items = (f.bullets || []).filter((b) => String(b).trim() !== '').slice(0, 6);
    const n = Math.max(items.length, 1);
    const grid = cardsGrid(n);
    const t = cardsTier(n);
    const chip = n <= 2 ? '8cqw' : n === 3 ? '6.8cqw' : n === 4 ? '6cqw' : '5.2cqw';
    const ico  = n <= 2 ? '4.2cqw' : n === 3 ? '3.6cqw' : n === 4 ? '3.2cqw' : '2.8cqw';
    const rad  = n <= 2 ? '1.8cqw' : '1.5cqw';
    const txt  = n <= 2 ? 2.9 : n === 3 ? 2.5 : n === 4 ? 2.25 : 2.0;
    return [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '4.4cqw 7cqw 6cqw', display: 'flex', flexDirection: 'column' } },
      h(Eyebrow, { text: f.eyebrow || '01', p, scale, fk: 'eyebrow' }),
      Title(f.title, p, scale, 3.8),
      h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '2.2cqw', display: 'grid', gridTemplateColumns: grid.cols, gridTemplateRows: grid.rows, gap: t.gap } },
        items.map((b, i) => h('div', {
          key: i, 'data-f': 'bullets', 'data-fi': i,
          style: Object.assign({}, grid.span(i), { background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: t.radius, padding: t.pad, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.7cqw', overflow: 'hidden', position: 'relative', minWidth: 0 })
        },
          h('div', { style: { width: chip, height: chip, borderRadius: rad, background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', boxShadow: `0 0.8cqw 2cqw ${softTint(p)}` } },
            h(SvcIcon, { name: guessIcon(b, i), color: '#fff', size: ico, stroke: 1.9 })),
          h(AutoFitText, { tag: 'div', text: b, baseCqw: txt, scale, maxLines: 3, minScale: 0.58, lineHeight: 1.22, style: { fontWeight: 700, color: p.title, letterSpacing: '-0.01em' } })))))];
  }

  // title + lead description paragraph (regular text block) + supporting bullets
  function L_textBullets(f, p, scale) {
    const items = (f.bullets || []).filter((b) => String(b).trim() !== '');
    const dense = items.length >= 4;
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: '01', p, scale }), Title(f.title, p, scale, 4),
      f.text ? Body(f.text, p, scale, { fk: 'text', base: 2.35, maxLines: 4, minScale: 0.7, lineHeight: 1.5, marginTop: '2.6cqw', maxWidth: '84%' }) : null,
      items.length ? h('ul', { style: { listStyle: 'none', margin: (f.text ? '3.4cqw' : '4cqw') + ' 0 0', padding: 0, display: 'grid', gridTemplateColumns: items.length > 3 ? '1fr 1fr' : '1fr', gap: dense ? '1.6cqw 4cqw' : '2.2cqw', maxWidth: '92%' } },
        items.map((b, i) => h('li', { key: i, 'data-f': 'bullets', 'data-fi': i, style: { display: 'flex', gap: '1.5cqw', alignItems: 'flex-start', color: p.title, fontWeight: 600, fontSize: z(dense ? 2 : 2.3, scale), lineHeight: 1.3 } },
          h('span', { style: { flex: '0 0 auto', marginTop: z(0.8, scale), width: '1.2cqw', height: '1.2cqw', borderRadius: '0.3cqw', background: p.accent } }),
          h('span', { style: { minWidth: 0 } }, b)))) : null)];
  }

  function L_agenda(f, p, scale) {
    const items = f.items || [];
    return [Bar(p), h('div', { key: 'c', style: pad('flex-start') },
      h(Eyebrow, { text: 'AGENDA', p, scale }), Title(f.title, p, scale, 4.4),
      h('ol', { style: { listStyle: 'none', margin: '4cqw 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: z(2.2, scale), maxWidth: '88%', counterReset: 'a' } },
        items.map((b, i) => h('li', { key: i, 'data-f': 'items', 'data-fi': i, style: { display: 'flex', gap: '2.2cqw', alignItems: 'baseline', color: p.title, fontSize: z(2.5, scale), lineHeight: 1.3 } },
          h('span', { style: { fontFamily: 'var(--font-mono)', color: p.accent, fontWeight: 700, fontSize: z(2.2, scale), minWidth: '4cqw' } }, String(i + 1).padStart(2, '0')),
          h('span', null, b)))))];
  }

  // service/product icon glyph (reads the curated set defined in templates.js)
  function SvcIcon({ name, color, size, stroke }) {
    const set = (window.PresaIcons) || {};
    const paths = set[name] || set.spark || [];
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: stroke || 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' },
      paths.map((d, i) => h('path', { key: i, d })));
  }

  /* ---- smart grid descriptors for generic card layouts ----
     2 → two wide cards in one row
     3 → three equal columns, one row
     4 → 2×2 grid
     5 → first row 3 cards (each span 2 of 6 cols), second row 2 cards (each span 3)
     6 → 3×2 grid                                                                    */
  function cardsGrid(n) {
    if (n <= 1) return { cols: '1fr',            rows: '1fr',            span: () => ({}) };
    if (n === 2) return { cols: '1fr 1fr',        rows: '1fr',            span: () => ({}) };
    if (n === 3) return { cols: 'repeat(3,1fr)',  rows: '1fr',            span: () => ({}) };
    if (n === 4) return { cols: 'repeat(2,1fr)',  rows: '1fr 1fr',        span: () => ({}) };
    if (n === 5) return { cols: 'repeat(6,1fr)',  rows: '1fr 1fr',        span: (i) => i < 3 ? { gridColumn: 'span 2' } : { gridColumn: 'span 3' } };
    return               { cols: 'repeat(3,1fr)', rows: 'repeat(2,1fr)',  span: () => ({}) };
  }

  // font/padding tier scales with card count so cards fill the slide.
  // descriptions are capped at 2–3 lines so cards stay tidy and equal-height.
  function cardsTier(n) {
    if (n <= 2) return { pad: '3.6cqw', radius: '2cqw',   hBase: 2.9,  dBase: 2.0,  dLines: 3, barW: '3.4cqw', gap: '2.8cqw' };
    if (n === 3) return { pad: '3cqw',   radius: '1.8cqw', hBase: 2.5,  dBase: 1.85, dLines: 3, barW: '3cqw',   gap: '2.4cqw' };
    if (n === 4) return { pad: '2.6cqw', radius: '1.6cqw', hBase: 2.2,  dBase: 1.7,  dLines: 2, barW: '2.6cqw', gap: '2cqw'   };
    return               { pad: '2.2cqw', radius: '1.4cqw', hBase: 1.95, dBase: 1.55, dLines: 2, barW: '2.2cqw', gap: '1.8cqw' };
  }

  // small warning badge rendered inside a card when text is critically long
  function CardWarnBadge(p) {
    return h('div', { title: 'Текст слишком длинный для этой карточки.', style: { position: 'absolute', top: '1cqw', right: '1cqw', background: p.accent, color: '#fff', borderRadius: '0.5cqw', padding: '0.25cqw 0.7cqw', fontSize: '1.05cqw', fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1, zIndex: 6 } }, '⚠');
  }

  function L_cards(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const n    = Math.max(cards.length, 1);
    const grid = cardsGrid(n);
    const t    = cardsTier(n);
    return [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '4.2cqw 7cqw 6cqw', display: 'flex', flexDirection: 'column' } },
      h(Eyebrow, { text: '01', p, scale }),
      Title(f.title, p, scale, 3.8),
      h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '1.8cqw', display: 'grid', gridTemplateColumns: grid.cols, gridTemplateRows: grid.rows, gap: t.gap } },
        cards.map((c, i) => {
          const hLen    = String(c.heading || '').length;
          const tLen    = String(c.text    || '').length;
          const critical = tLen > 140;
          return h('div', {
            key: i, 'data-f': 'cards', 'data-fi': i,
            style: Object.assign({}, grid.span(i), {
              background: p.panel, border: `0.15cqw solid ${p.border}`,
              borderRadius: t.radius, padding: t.pad,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', position: 'relative', minWidth: 0
            })
          },
            h('div', { style: { width: t.barW, height: '0.4cqw', background: p.accent, borderRadius: '0.2cqw', marginBottom: '1.4cqw', flexShrink: 0 } }),
            h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: t.hBase, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.14, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.015em', flexShrink: 0 } }),
            c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: t.dBase, scale, maxLines: t.dLines, minScale: 0.6, lineHeight: 1.4, style: { color: p.body, marginTop: '1.1cqw', overflow: 'hidden' } }) : null,
            critical ? h(CardWarnBadge, { p }) : null
          );
        })
      )
    )];
  }

  /* ---- count-aware service layout engine ----
     Layout adapts to the number of cards instead of a fixed grid, and cards
     stretch to fill the usable area so the slide reads as a premium deck. */
  function svcLayout(n) {
    if (n <= 1) return { cols: '1fr', rows: '1fr', span: () => ({}) };
    if (n === 2) return { cols: '1fr 1fr', rows: '1fr', span: () => ({}) };          // two large cards
    if (n === 3) return { cols: '1.35fr 1fr', rows: '1fr 1fr', span: (i) => i === 0 ? { gridRow: '1 / 3' } : {} }; // one large + two small
    if (n === 4) return { cols: '1fr 1fr', rows: '1fr 1fr', span: () => ({}) };       // 2×2
    if (n === 5) return { cols: 'repeat(6, 1fr)', rows: '1fr 1fr', span: (i) => i < 2 ? { gridColumn: 'span 3' } : { gridColumn: 'span 2' } };
    return { cols: 'repeat(3, 1fr)', rows: '1fr 1fr', span: () => ({}) };             // 6 → 3×2
  }
  function svcTier(n) {
    if (n <= 2) return { pad: '3.6cqw', badge: '8.6cqw', icon: '4.6cqw', radius: '2.1cqw', h: 3.5, d: 2.2, m: 1.55, clamp: 3, gap: '2.8cqw', rail: '0.7cqw' };
    if (n === 3) return { pad: '3cqw', badge: '7.2cqw', icon: '3.9cqw', radius: '1.8cqw', h: 2.95, d: 2.0, m: 1.45, clamp: 3, gap: '2.4cqw', rail: '0.6cqw' };
    if (n === 4) return { pad: '2.8cqw', badge: '6.4cqw', icon: '3.4cqw', radius: '1.7cqw', h: 2.6, d: 1.9, m: 1.4, clamp: 2, gap: '2.2cqw', rail: '0.6cqw' };
    return { pad: '2.3cqw', badge: '5.4cqw', icon: '2.9cqw', radius: '1.4cqw', h: 2.15, d: 1.65, m: 1.3, clamp: 2, gap: '1.8cqw', rail: '0.5cqw' };
  }
  // header (eyebrow + title) auto height, cards area fills the rest
  function svcShell(p, title, scale, grid, gap, cards) {
    return [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '4.2cqw 7cqw 6cqw', display: 'flex', flexDirection: 'column' } },
      h(Eyebrow, { text: 'SERVICES', p, scale }),
      Title(title, p, scale, 3.6),
      h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '1.8cqw', display: 'grid', gridTemplateColumns: grid.cols, gridTemplateRows: grid.rows, gap: gap } }, cards))];
  }
  function svcMeta(p, scale, t, i, label) {
    return h('div', { style: { marginTop: 'auto', paddingTop: '1.4cqw', display: 'flex', alignItems: 'center', gap: '1.2cqw', borderTop: `0.12cqw solid ${p.border}` } },
      h('span', { style: { width: '2.6cqw', height: '0.3cqw', background: p.accent, borderRadius: '0.15cqw' } }),
      h('span', { style: { fontFamily: 'var(--font-mono)', color: p.faint, fontSize: z(t.m, scale), fontWeight: 700, letterSpacing: '.08em' } }, label));
  }

  // services with icons: count-aware, cards fill the slide
  function L_serviceIcons(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const n = cards.length;
    const grid = svcLayout(n);
    const t = svcTier(n);
    const body = cards.map((c, i) => {
      const critical = String(c.text || '').length > 140;
      return h('div', {
        key: i, 'data-f': 'cards', 'data-fi': i,
        style: Object.assign({}, grid.span(i), { background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '1.9cqw', padding: t.pad, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden', position: 'relative' })
      },
        h('div', { style: { width: t.badge, height: t.badge, borderRadius: t.radius, background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
          h(SvcIcon, { name: c.icon, color: '#fff', size: t.icon, stroke: 1.8 })),
        h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: t.h, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.12, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.015em', marginTop: t.gap } }),
        c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: t.d, scale, maxLines: t.clamp, minScale: 0.6, lineHeight: 1.42, style: { color: p.body, marginTop: '1.1cqw', overflow: 'hidden' } }) : null,
        svcMeta(p, scale, t, i, String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0')),
        critical ? h(CardWarnBadge, { p }) : null
      );
    });
    return svcShell(p, f.title, scale, grid, t.gap, body);
  }

  // services with photos: count-aware, photo grows with the card
  function L_servicePhotos(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const n = cards.length;
    const grid = svcLayout(n);
    const t = svcTier(n);
    const tall = n <= 2; // big cards → vertical split (photo left), small → photo on top
    const body = cards.map((c, i) => {
      const big      = grid.span(i).gridRow === '1 / 3' || tall;
      const critical = String(c.text || '').length > 140;
      return h('div', {
        key: i, 'data-f': 'cards', 'data-fi': i,
        style: Object.assign({}, grid.span(i), { background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '1.8cqw', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative' })
      },
        h('div', { style: { position: 'relative', width: '100%', flex: big ? '1.4 1 0' : '1 1 0', minHeight: '38%', background: c.image ? '#000' : p.bg, overflow: 'hidden' } },
          c.image
            ? h('img', { src: c.image, alt: c.heading || '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
            : h(ImgPlaceholder, { p, label: '', scale }),
          h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: t.rail, background: p.accent } })),
        h('div', { style: { padding: t.pad, display: 'flex', flexDirection: 'column', flex: '0 0 auto' } },
          h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: t.h, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.13, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.015em' } }),
          c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: t.d, scale, maxLines: tall ? 3 : 2, minScale: 0.6, lineHeight: 1.4, style: { color: p.body, marginTop: '1cqw', overflow: 'hidden' } }) : null),
        critical ? h(CardWarnBadge, { p }) : null
      );
    });
    return svcShell(p, f.title, scale, grid, t.gap, body);
  }

  /* ---- photo card: image at top, compact icon badge + text at bottom ---- */
  /* ---- inline-icon card: red badge + heading on one row, description below ---- */
  function L_servicePhotoIcon(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const n     = cards.length;
    const grid  = svcLayout(n);
    const t     = svcTier(n);
    const bSz  = n <= 2 ? '7cqw'   : n === 3 ? '6cqw'   : n === 4 ? '5.4cqw' : '4.8cqw';
    const bIco = n <= 2 ? '3.8cqw' : n === 3 ? '3.2cqw' : n === 4 ? '2.9cqw' : '2.6cqw';
    const bRad = n <= 2 ? '1.6cqw' : '1.3cqw';
    const body = cards.map((c, i) => {
      const critical = String(c.text || '').length > 140;
      return h('div', {
        key: i, 'data-f': 'cards', 'data-fi': i,
        style: Object.assign({}, grid.span(i), {
          background: p.bg, border: `0.15cqw solid ${p.border}`,
          borderRadius: '1.8cqw', padding: t.pad,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minHeight: 0, minWidth: 0, position: 'relative'
        })
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '1.8cqw' } },
          h('div', { style: { width: bSz, height: bSz, borderRadius: bRad, background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
            h(SvcIcon, { name: c.icon, color: '#fff', size: bIco, stroke: 2 })),
          h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: t.h, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.12, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.015em' } })),
        c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: t.d, scale, maxLines: t.clamp, minScale: 0.6, lineHeight: 1.42, style: { color: p.body, marginTop: '1.8cqw', overflow: 'hidden' } }) : null,
        critical ? h(CardWarnBadge, { p }) : null);
    });
    return svcShell(p, f.title, scale, grid, t.gap, body);
  }

  /* ---- minimal cards: neutral icon box + heading + desc + red arrow ---- */
  function L_serviceMinimal(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const n     = cards.length;
    const grid  = svcLayout(n);
    const t     = svcTier(n);
    const iSz  = n <= 2 ? '6cqw'   : n === 3 ? '5.2cqw' : n === 4 ? '4.6cqw' : '4cqw';
    const iIco = n <= 2 ? '3.2cqw' : n === 3 ? '2.8cqw' : n === 4 ? '2.4cqw' : '2.1cqw';
    const body = cards.map((c, i) => {
      const critical = String(c.text || '').length > 140;
      return h('div', {
        key: i, 'data-f': 'cards', 'data-fi': i,
        style: Object.assign({}, grid.span(i), {
          background: p.bg, border: `0.15cqw solid ${p.border}`,
          borderRadius: '1.8cqw', padding: t.pad,
          display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, position: 'relative'
        })
      },
        h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '1.6cqw' } },
          h('div', { style: { width: iSz, height: iSz, borderRadius: '1cqw', background: p.panel, border: `0.12cqw solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
            h(SvcIcon, { name: c.icon, color: p.title, size: iIco, stroke: 1.6 })),
          h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: t.h, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.12, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.015em', paddingTop: '0.3cqw' } })),
        c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: t.d, scale, maxLines: t.clamp, minScale: 0.6, lineHeight: 1.42, style: { color: p.body, marginTop: '1.2cqw', overflow: 'hidden' } }) : null,
        h('div', { style: { marginTop: 'auto', paddingTop: '1.2cqw', display: 'flex', justifyContent: 'flex-end' } },
          h('span', { style: { color: p.accent, fontSize: z(t.h * 0.85, scale), fontWeight: 800, lineHeight: 1 } }, '→')),
        critical ? h(CardWarnBadge, { p }) : null);
    });
    return svcShell(p, f.title, scale, grid, t.gap, body);
  }

  function L_textStats(f, p, scale) {
    const stats = f.stats || [];
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: '01', p, scale }), Title(f.title, p, scale, 4),
      f.text ? Body(f.text, p, scale, { fk: 'text', base: 2.4, maxLines: 3, minScale: 0.72, lineHeight: 1.45, marginTop: '2.4cqw', maxWidth: '78%' }) : null,
      h('div', { style: { display: 'flex', gap: '4cqw', marginTop: '4.5cqw' } },
        stats.map((s, i) => h('div', { key: i, 'data-f': 'stats' },
          h('div', { style: { fontWeight: 800, color: p.accent, fontSize: z(5, scale), letterSpacing: '-0.02em', lineHeight: 1 } }, s.value),
          h('div', { style: { color: p.body, fontSize: z(1.7, scale), marginTop: '0.8cqw' } }, s.label)))))];
  }

  function L_statsRow(f, p, scale) {
    const stats = f.stats || [];
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: 'METRICS', p, scale }), Title(f.title, p, scale, 4),
      h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${Math.max(stats.length,1)}, 1fr)`, gap: '2.4cqw', marginTop: '5cqw' } },
        stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', style: { borderLeft: `0.4cqw solid ${p.accent}`, paddingLeft: '2.2cqw' } },
          h('div', { style: { fontWeight: 800, color: p.title, fontSize: z(6, scale), letterSpacing: '-0.03em', lineHeight: 1 } }, s.value),
          h('div', { style: { color: p.body, fontSize: z(1.8, scale), marginTop: '1cqw' } }, s.label)))),
      f.note ? h('div', { 'data-f': 'note', style: { color: p.faint, fontSize: '1.5cqw', marginTop: '3.5cqw', fontFamily: 'var(--font-mono)' } }, f.note) : null)];
  }

  function L_bigStat(f, p, scale) {
    return [Bar(p), h('div', { key: 'c', style: { ...pad('center'), flexDirection: 'row', alignItems: 'center', gap: '6cqw' } },
      h('div', { style: { flex: '0 0 auto' } },
        h('div', { 'data-f': 'statValue', style: { fontWeight: 800, color: p.accent, fontSize: z(15, scale), letterSpacing: '-0.04em', lineHeight: 0.9 } }, f.statValue),
        h('div', { 'data-f': 'statLabel', style: { color: p.title, fontWeight: 700, fontSize: z(2.6, scale), marginTop: '1.5cqw', maxWidth: '24cqw', lineHeight: 1.2 } }, f.statLabel)),
      (f.bullets && f.bullets.length) ? h('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2cqw', borderLeft: `0.15cqw solid ${p.border}`, paddingLeft: '5cqw' } },
        f.bullets.map((b, i) => h('li', { key: i, 'data-f': 'bullets', 'data-fi': i, style: { display: 'flex', gap: '1.5cqw', alignItems: 'flex-start', color: p.body, fontSize: z(2.2, scale), lineHeight: 1.35 } },
          h('span', { style: { flex: '0 0 auto', marginTop: '1cqw', width: '1.2cqw', height: '1.2cqw', borderRadius: '0.3cqw', background: p.accent } }), b))) : null)];
  }

  function L_quote(f, p, scale) {
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h('div', { style: { fontFamily: 'Georgia, serif', color: p.accent, fontSize: '14cqw', lineHeight: 0.5, height: '6cqw' } }, '\u201C'),
      h('blockquote', { 'data-f': 'quote', style: { margin: '2cqw 0 0', fontWeight: 700, color: p.title, fontSize: z(3.6, scale), lineHeight: 1.28, letterSpacing: '-0.015em', maxWidth: '84%' } }, f.quote),
      (f.author || f.role) ? h('div', { 'data-f': 'author', style: { marginTop: '3.5cqw', display: 'flex', alignItems: 'center', gap: '1.4cqw' } },
        h('span', { style: { width: '3cqw', height: '0.3cqw', background: p.accent } }),
        h('div', null,
          h('span', { style: { fontWeight: 700, color: p.title, fontSize: z(1.9, scale) } }, f.author || ''),
          f.role ? h('span', { style: { color: p.body, fontSize: z(1.7, scale), marginLeft: '1cqw' } }, '· ' + f.role) : null)) : null)];
  }

  function L_textMedia(f, p, scale) {
    const hasImg = !!f.image;
    return [Bar(p), h('div', { key: 'l', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', padding: '7cqw 4cqw 9cqw 8cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h(Eyebrow, { text: '01', p, scale }), Title(f.title, p, scale, 3.8),
        f.text ? Body(f.text, p, scale, { fk: 'text', base: 2.2, maxLines: 6, minScale: 0.68, lineHeight: 1.5, marginTop: '2.4cqw', maxWidth: '100%' }) : null),
      h('div', { key: 'r', 'data-f': 'imageLabel', style: { position: 'absolute', right: '8cqw', top: '7cqw', bottom: '9cqw', width: '34%', borderRadius: '1.6cqw', background: p.panel, border: hasImg ? 'none' : `0.15cqw dashed ${p.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5cqw', overflow: 'hidden' } },
        hasImg ? h('img', { src: f.image, alt: f.imageLabel || '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }) : h('svg', { width: '7cqw', height: '7cqw', viewBox: '0 0 24 24', fill: 'none' },
          h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 2, stroke: p.faint, strokeWidth: 1.4 }),
          h('circle', { cx: 8.5, cy: 9.5, r: 1.8, stroke: p.faint, strokeWidth: 1.4 }),
          h('path', { d: 'M4 17l5-5 4 4 3-3 4 4', stroke: p.faint, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' })),
        hasImg && f.imageLabel ? h('div', { style: { position: 'absolute', left: '1.2cqw', bottom: '1.2cqw', background: 'rgba(14,17,22,.72)', color: '#fff', fontSize: '1.4cqw', fontFamily: 'var(--font-mono)', padding: '0.6cqw 1.2cqw', borderRadius: '0.6cqw' } }, f.imageLabel) : null,
        !hasImg && f.imageLabel ? h('div', { style: { color: p.faint, fontSize: '1.6cqw', fontFamily: 'var(--font-mono)' } }, f.imageLabel) : null)];
  }

  function L_steps(f, p, scale) {
    const steps = f.steps || [];
    return [Bar(p), h('div', { key: 'c', style: pad('flex-start') },
      h(Eyebrow, { text: 'PROCESS', p, scale }), Title(f.title, p, scale, 4),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: z(2, scale), marginTop: '4cqw', maxWidth: '86%' } },
        steps.map((s, i) => h('div', { key: i, 'data-f': 'steps', style: { display: 'flex', gap: '2.4cqw', alignItems: 'flex-start' } },
          h('span', { style: { flex: '0 0 auto', width: '4.4cqw', height: '4.4cqw', borderRadius: '50%', background: p.accentSoft, color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: z(2, scale) } }, String(i + 1)),
          h('div', null,
            h('div', { style: { fontWeight: 800, color: p.title, fontSize: z(2.3, scale) } }, s.title),
            s.desc ? h('div', { style: { color: p.body, fontSize: z(1.85, scale), marginTop: '0.5cqw', lineHeight: 1.4 } }, s.desc) : null)))))];
  }

  function L_timeline(f, p, scale) {
    const ms = f.milestones || [];
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: 'TIMELINE', p, scale }), Title(f.title, p, scale, 4),
      h('div', { style: { position: 'relative', marginTop: '6cqw', display: 'grid', gridTemplateColumns: `repeat(${Math.max(ms.length,1)}, 1fr)`, gap: '2cqw' } },
        h('div', { style: { position: 'absolute', left: '2cqw', right: '2cqw', top: '1.1cqw', height: '0.25cqw', background: p.border } }),
        ms.map((m, i) => h('div', { key: i, 'data-f': 'milestones', style: { position: 'relative', paddingRight: '2cqw' } },
          h('div', { style: { width: '2.4cqw', height: '2.4cqw', borderRadius: '50%', background: p.accent, border: `0.5cqw solid ${p.bg}`, boxShadow: `0 0 0 0.15cqw ${p.accent}` } }),
          h('div', { style: { fontWeight: 800, color: p.title, fontSize: z(2.1, scale), marginTop: '2cqw' } }, m.title),
          m.desc ? h('div', { style: { color: p.body, fontSize: z(1.7, scale), marginTop: '0.8cqw', lineHeight: 1.35 } }, m.desc) : null))))];
  }

  function L_pricing(f, p, scale) {
    const tiers = f.tiers || [];
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: 'PRICING', p, scale }), Title(f.title, p, scale, 3.8),
      h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${Math.max(tiers.length,1)}, 1fr)`, gap: '2.2cqw', marginTop: '4cqw' } },
        tiers.map((t, i) => {
          const hi = tiers.length === 3 ? i === 1 : i === tiers.length - 1;
          return h('div', { key: i, 'data-f': 'tiers', style: { borderRadius: '1.6cqw', padding: '2.8cqw', background: hi ? p.accent : p.panel, border: `0.15cqw solid ${hi ? p.accent : p.border}`, color: hi ? '#fff' : p.title } },
            h('div', { style: { fontWeight: 700, fontSize: z(1.9, scale), opacity: .9 } }, t.name),
            h('div', { style: { fontWeight: 800, fontSize: z(3.4, scale), letterSpacing: '-0.02em', margin: '1cqw 0 1.6cqw' } }, t.price),
            h('ul', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.1cqw' } },
              (t.features || []).map((ft, j) => h('li', { key: j, style: { display: 'flex', gap: '1.1cqw', alignItems: 'flex-start', fontSize: z(1.7, scale), color: hi ? 'rgba(255,255,255,.92)' : p.body, lineHeight: 1.3 } },
                h('span', { style: { color: hi ? '#fff' : p.accent, fontWeight: 800 } }, '✓'), ft))));
        })))];
  }

  function L_compare(f, p, scale) {
    const rows = f.rows || [];
    const cell = (txt, opts, fk) => h('div', { 'data-f': fk, style: { padding: '1.8cqw 2.2cqw', fontSize: z(1.9, scale), ...opts } }, txt);
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: 'COMPARE', p, scale }), Title(f.title, p, scale, 3.8),
      h('div', { style: { marginTop: '4cqw', border: `0.15cqw solid ${p.border}`, borderRadius: '1.4cqw', overflow: 'hidden' } },
        h('div', { style: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr' } },
          cell('', { background: p.panel }),
          cell(f.leftLabel || 'Вы', { background: p.accent, color: '#fff', fontWeight: 800, textAlign: 'center' }, 'leftLabel'),
          cell(f.rightLabel || 'Другие', { background: p.panel, color: p.title, fontWeight: 700, textAlign: 'center' }, 'rightLabel')),
        rows.map((r, i) => h('div', { key: i, 'data-f': 'rows', style: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', borderTop: `0.15cqw solid ${p.border}` } },
          cell(r.label, { color: p.title, fontWeight: 600 }),
          cell(r.left, { color: p.title, textAlign: 'center', background: p.accentSoft, fontWeight: 700 }),
          cell(r.right, { color: p.body, textAlign: 'center' })))))];
  }

  function L_team(f, p, scale) {
    const ms = f.members || [];
    const cols = ms.length <= 3 ? ms.length : Math.ceil(ms.length / 2) >= 3 ? 3 : ms.length;
    const c = ms.length <= 3 ? Math.max(ms.length,1) : (ms.length === 4 ? 4 : 3);
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: 'TEAM', p, scale }), Title(f.title, p, scale, 4),
      h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${c}, 1fr)`, gap: '2.4cqw', marginTop: '4.5cqw' } },
        ms.map((m, i) => h('div', { key: i, 'data-f': 'members', style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.4cqw' } },
          h('div', { style: { width: '8cqw', height: '8cqw', borderRadius: '50%', background: `linear-gradient(135deg, ${p.accentSoft}, ${p.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: z(2.6, scale) } }, (m.name || '?').trim().charAt(0)),
          h('div', null,
            h('div', { style: { fontWeight: 800, color: p.title, fontSize: z(2, scale) } }, m.name),
            m.role ? h('div', { style: { color: p.accent, fontSize: z(1.6, scale), marginTop: '0.4cqw', fontWeight: 600 } }, m.role) : null)))))];
  }

  function L_cta(f, p, scale, B) {
    const brandObj = B || { name: 'Presa', logo: null };
    const dark = p.dark;
    const bg = dark ? p.bg : p.title;
    const items = f.bullets || [];
    return h('div', { className: 'slide', style: { containerType: 'inline-size', background: bg, position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' } },
      h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '1.4cqw', background: p.accent } }),
      h('div', { style: pad('center') },
        h(Eyebrow, { text: 'LET\u2019S TALK', p: { ...p, title: '#fff' }, scale }),
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 5.4, scale: scale, maxLines: 3, minScale: 0.5, lineHeight: 1.04, style: { fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: '2.6cqw 0 0', maxWidth: '80%' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: 'rgba(255,255,255,.7)', fontSize: z(2.4, scale), marginTop: '2cqw', maxWidth: '64%', lineHeight: 1.4 } }, f.subtitle) : null,
        items.length ? h('div', { style: { display: 'flex', gap: '1.6cqw', marginTop: '4cqw', flexWrap: 'wrap' } },
          items.map((b, i) => h('span', { key: i, 'data-f': 'bullets', 'data-fi': i, style: { display: 'inline-flex', alignItems: 'center', gap: '1cqw', background: 'rgba(255,255,255,.08)', border: '0.15cqw solid rgba(255,255,255,.16)', borderRadius: '999px', padding: '1.2cqw 2.2cqw', color: '#fff', fontSize: z(1.8, scale), fontWeight: 600 } },
            h('span', { style: { width: '1cqw', height: '1cqw', borderRadius: '50%', background: p.accent } }), b))) : null,
        f.buttonLabel ? h('div', { style: { marginTop: '4cqw' } },
          h('span', { 'data-f': 'buttonLabel', style: { display: 'inline-block', background: p.accent, color: '#fff', fontWeight: 700, fontSize: z(2, scale), padding: '1.6cqw 3cqw', borderRadius: '1cqw' } }, f.buttonLabel)) : null),
      h('div', { style: { position: 'absolute', left: '8cqw', right: '8cqw', bottom: '4cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.5cqw', color: 'rgba(255,255,255,.5)' } },
        h('span', { style: { fontWeight: 700, color: '#fff', letterSpacing: '.01em' } }, brandObj.name || 'Presa')),
      h(TopLogo, { p, brand: brandObj, layoutType: 'cta', onDark: true }));
  }

  /* ---- charts & table ---- */
  function L_chartBar(f, p, scale) {
    const data = f.data || [];
    const max = Math.max(...data.map((d) => num(d.value)), 1);
    const colsCss = `repeat(${Math.max(data.length, 1)}, 1fr)`;
    return [Bar(p), h('div', { key: 'c', style: pad('flex-start') },
      h(Eyebrow, { text: 'DATA', p, scale }), Title(f.title, p, scale, 4),
      h('div', { 'data-f': 'data', style: { marginTop: '3.5cqw' } },
        h('div', { style: { display: 'grid', gridTemplateColumns: colsCss, gap: '2.4cqw', alignItems: 'end', height: '21cqw', borderBottom: `0.18cqw solid ${p.border}` } },
          data.map((d, i) => {
            const pct = Math.max(6, (num(d.value) / max) * 100);
            return h('div', { key: i, style: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', minWidth: 0 } },
              h('div', { style: { fontWeight: 800, color: p.title, fontSize: z(1.9, scale), marginBottom: '0.8cqw' } }, d.value),
              h('div', { style: { width: '58%', height: pct + '%', maxHeight: '82%', background: p.accent, borderRadius: '0.5cqw 0.5cqw 0 0' } }));
          })),
        h('div', { style: { display: 'grid', gridTemplateColumns: colsCss, gap: '2.4cqw', marginTop: '1.2cqw' } },
          data.map((d, i) => h('div', { key: i, style: { textAlign: 'center', color: p.body, fontSize: z(1.6, scale), fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, d.label)))),
      f.note ? h('div', { 'data-f': 'note', style: { color: p.faint, fontSize: '1.5cqw', marginTop: '2.4cqw', fontFamily: 'var(--font-mono)' } }, f.note) : null)];
  }

  function L_chartLine(f, p, scale) {
    const data = f.data || [];
    const vals = data.map((d) => num(d.value));
    const max = Math.max(...vals, 1), min = Math.min(...vals, 0);
    const px = (i) => data.length > 1 ? (i / (data.length - 1)) * 90 + 5 : 50;
    const py = (v) => 33 - ((v - min) / ((max - min) || 1)) * 26;
    const pts = vals.map((v, i) => `${px(i)},${py(v)}`).join(' ');
    const area = `5,35 ${pts} 95,35`;
    return [Bar(p), h('div', { key: 'c', style: pad('flex-start') },
      h(Eyebrow, { text: 'TREND', p, scale }), Title(f.title, p, scale, 4),
      h('div', { 'data-f': 'data', style: { marginTop: '2.5cqw' } },
        h('svg', { viewBox: '0 0 100 40', style: { width: '100%', height: 'auto', display: 'block', overflow: 'visible' } },
          h('line', { x1: 5, y1: 35, x2: 95, y2: 35, stroke: p.border, strokeWidth: 0.3 }),
          h('polygon', { points: area, fill: p.accent, opacity: 0.08 }),
          h('polyline', { points: pts, fill: 'none', stroke: p.accent, strokeWidth: 0.7, strokeLinejoin: 'round', strokeLinecap: 'round' }),
          vals.map((v, i) => h('g', { key: i },
            h('circle', { cx: px(i), cy: py(v), r: 1, fill: p.bg, stroke: p.accent, strokeWidth: 0.6 }),
            h('text', { x: px(i), y: py(v) - 2.4, textAnchor: 'middle', fontSize: 2.6, fontWeight: 700, fill: p.title, fontFamily: 'var(--font-sans)' }, String(data[i].value)),
            h('text', { x: px(i), y: 38.6, textAnchor: 'middle', fontSize: 2.1, fill: p.body, fontFamily: 'var(--font-mono)' }, String(data[i].label || '')))))),
      f.note ? h('div', { 'data-f': 'note', style: { color: p.faint, fontSize: '1.5cqw', marginTop: '1.6cqw', fontFamily: 'var(--font-mono)' } }, f.note) : null)];
  }

  function L_chartDonut(f, p, scale) {
    const data = f.data || [];
    const colors = chartColors(p);
    const total = data.reduce((m, d) => m + num(d.value), 0) || 1;
    let acc = 0;
    const stops = data.map((d, i) => {
      const a0 = (acc / total) * 360; acc += num(d.value); const a1 = (acc / total) * 360;
      return `${colors[i % colors.length]} ${a0.toFixed(1)}deg ${a1.toFixed(1)}deg`;
    }).join(', ');
    return [Bar(p), h('div', { key: 'c', style: { ...pad('center'), flexDirection: 'row', alignItems: 'center', gap: '7cqw' } },
      h('div', { style: { flex: '0 0 auto', position: 'relative', width: '26cqw', height: '26cqw' } },
        h('div', { style: { position: 'absolute', inset: 0, borderRadius: '50%', background: data.length ? `conic-gradient(${stops})` : p.panel } }),
        h('div', { style: { position: 'absolute', inset: '22%', borderRadius: '50%', background: p.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
          h('div', { style: { fontWeight: 800, color: p.title, fontSize: z(3.6, scale), letterSpacing: '-0.02em' } }, Math.round(total)),
          h('div', { style: { color: p.faint, fontSize: '1.4cqw', fontFamily: 'var(--font-mono)' } }, 'всего'))),
      h('div', { style: { minWidth: 0, flex: 1 } },
        h(Eyebrow, { text: 'SHARE', p, scale }), Title(f.title, p, scale, 3.6),
        h('div', { 'data-f': 'data', style: { display: 'flex', flexDirection: 'column', gap: z(1.6, scale), marginTop: '3cqw' } },
          data.map((d, i) => h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '1.6cqw' } },
            h('span', { style: { flex: '0 0 auto', width: '1.8cqw', height: '1.8cqw', borderRadius: '0.45cqw', background: colors[i % colors.length] } }),
            h('span', { style: { color: p.title, fontWeight: 600, fontSize: z(2, scale), minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, d.label),
            h('span', { style: { marginLeft: 'auto', color: p.body, fontWeight: 800, fontSize: z(2, scale), fontFamily: 'var(--font-mono)' } }, d.value)))),
        f.note ? h('div', { 'data-f': 'note', style: { color: p.faint, fontSize: '1.5cqw', marginTop: '2.4cqw', fontFamily: 'var(--font-mono)' } }, f.note) : null))];
  }

  function L_table(f, p, scale) {
    const rows = f.rows || [];
    // column count — inferred from headers / cells (supports 2 or 3 columns)
    const hasC3 = !!(f.h3 && String(f.h3).trim()) || rows.some((r) => String(r.c3 || '').trim());
    const hasC2 = !!(f.h2 && String(f.h2).trim()) || rows.some((r) => String(r.c2 || '').trim());
    const ncols = hasC3 ? 3 : (hasC2 ? 2 : 1);
    // numeric columns (prices, counts) right-align in mono; text columns left-align
    const isNum = (v) => { const s = String(v || '').trim(); return /\d/.test(s) && /^[\s\d.,%₸$€£+\-–—×x()\/]+$/.test(s); };
    const colNum = [0, 1, 2].map((ci) => { const k = 'c' + (ci + 1); const cells = rows.map((r) => String(r[k] || '').trim()).filter(Boolean); return cells.length > 0 && cells.every(isNum); });
    const aligns = (f.aligns && f.aligns.length) ? f.aligns : [0, 1, 2].map((ci) => ci === 0 ? 'left' : (colNum[ci] ? 'right' : 'left'));
    const gridCols = ncols === 3 ? '1.6fr 1fr 1fr' : (ncols === 2 ? '1.5fr 1fr' : '1fr');
    // row-count tiers keep tall tables inside the slide (no overflow into the footer)
    const n = rows.length;
    const tier = n <= 4 ? { pad: '1.45cqw 2.2cqw', fs: 1.9, mt: '3.2cqw' }
      : n <= 6 ? { pad: '1.0cqw 2cqw', fs: 1.7, mt: '2.4cqw' }
      : n <= 9 ? { pad: '0.62cqw 1.8cqw', fs: 1.52, mt: '1.8cqw' }
      : { pad: '0.42cqw 1.6cqw', fs: 1.36, mt: '1.4cqw' };
    const fsz = z(tier.fs, scale);
    const cell = (txt, opts, fk) => h('div', { 'data-f': fk, style: { padding: tier.pad, fontSize: fsz, minWidth: 0, lineHeight: 1.22, wordBreak: 'break-word', ...opts } }, txt);
    const fam = (ci) => colNum[ci] ? 'var(--font-mono)' : 'inherit';
    return [Bar(p), h('div', { key: 'c', style: pad('center') },
      h(Eyebrow, { text: 'TABLE', p, scale }), Title(f.title, p, scale, 3.8),
      h('div', { style: { marginTop: tier.mt, border: `0.15cqw solid ${p.border}`, borderRadius: '1.4cqw', overflow: 'hidden' } },
        h('div', { style: { display: 'grid', gridTemplateColumns: gridCols, background: p.title } },
          cell(f.h1 || '', { color: p.bg, fontWeight: 800, textAlign: aligns[0] }, 'h1'),
          ncols >= 2 ? cell(f.h2 || '', { color: p.bg, fontWeight: 800, textAlign: aligns[1] }, 'h2') : null,
          ncols >= 3 ? cell(f.h3 || '', { color: p.bg, fontWeight: 800, textAlign: aligns[2] }, 'h3') : null),
        rows.map((r, i) => h('div', { key: i, 'data-f': 'rows', style: { display: 'grid', gridTemplateColumns: gridCols, background: i % 2 ? p.panel : p.bg, borderTop: `0.15cqw solid ${p.border}` } },
          cell(r.c1, { color: p.title, fontWeight: 600, textAlign: aligns[0] }),
          ncols >= 2 ? cell(r.c2, { color: p.body, textAlign: aligns[1], fontFamily: fam(1) }) : null,
          ncols >= 3 ? cell(r.c3, { color: p.title, fontWeight: 700, textAlign: aligns[2], fontFamily: fam(2) }) : null))),
      f.note ? h('div', { 'data-f': 'note', style: { color: p.faint, fontSize: '1.5cqw', marginTop: '2cqw', fontFamily: 'var(--font-mono)' } }, f.note) : null)];
  }

  /* ============================================================
     BOLD + CORPORATE layouts (self-contained: own background + footer)
     The website / brand line is pinned to the very bottom edge as a
     full-width strip so it never collides with the content blocks.
     ============================================================ */
  const slideBase = { containerType: 'inline-size', position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: 'var(--font-sans)' };

  // full-width footer flush to the very bottom edge of the slide
  function EdgeFooter({ p, brand, fields, n, total, onAccent }) {
    const B = brand || {}; const f = fields || {};
    const fg   = onAccent ? '#fff' : p.title;
    const sub  = onAccent ? 'rgba(255,255,255,.72)' : p.faint;
    const line = onAccent ? 'rgba(255,255,255,.22)' : p.border;
    const site = f.footerLabel ? f.footerLabel : (B.pageNum !== false ? (String(n).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')) : '');
    return h('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '6cqw', padding: '0 8cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `0.12cqw solid ${line}` } },
      h('span', { style: { fontWeight: 700, color: fg, fontSize: '1.6cqw', letterSpacing: '.01em' } }, B.name || 'Presa'),
      site ? h('span', { 'data-f': f.footerLabel ? 'footerLabel' : undefined, style: { fontFamily: 'var(--font-mono)', color: sub, fontWeight: 600, fontSize: '1.45cqw', letterSpacing: '.02em' } }, site) : null);
  }

  // BOLD cover — full accent background, oversized headline
  function L_titleBold(f, p, scale, B, n, total) {
    const Bo = B || { name: 'Presa' };
    return h('div', { className: 'slide', style: { ...slideBase, background: p.accent } },
      h('div', { key: 'orb', style: { position: 'absolute', right: '-7cqw', top: '-8cqw', width: '38cqw', height: '38cqw', borderRadius: '50%', background: 'rgba(255,255,255,.08)' } }),
      h('div', { key: 'top', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: '7.5cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 } },
        h('div', { 'data-f': 'eyebrow', style: { color: '#fff', fontFamily: 'var(--font-mono)', fontSize: z(1.7, scale), fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' } }, f.eyebrow || 'PRESENTATION'),
        Bo.logo ? h('img', { src: Bo.logo, alt: '', style: { height: '4cqw', filter: 'brightness(0) invert(1)' } }) : h(Mark, { accent: 'rgba(255,255,255,.22)', size: '4cqw' })),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: 0, bottom: '6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 } },
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 8.6, scale: scale, maxLines: 3, minScale: 0.42, lineHeight: 0.98, style: { fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', margin: 0, maxWidth: '92%' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: 'rgba(255,255,255,.86)', fontSize: z(2.7, scale), marginTop: '2.8cqw', maxWidth: '62%', lineHeight: 1.4 } }, f.subtitle) : null),
      h(EdgeFooter, { p, brand: Bo, fields: f, n, total, onAccent: true }));
  }

  // CORPORATE cover — top brand band, accent rule, structured headline
  function L_titleCorporate(f, p, scale, B, n, total) {
    const Bo = B || { name: 'Presa' };
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg } },
      h('div', { key: 'band', style: { position: 'absolute', left: 0, right: 0, top: 0, height: '8cqw', borderBottom: `0.12cqw solid ${p.border}`, padding: '0 8cqw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '1.5cqw' } },
          Bo.logo ? h('img', { src: Bo.logo, alt: '', style: { height: '3.6cqw' } }) : h(Mark, { accent: p.accent, size: '3.2cqw' }),
          h('span', { style: { fontWeight: 800, color: p.title, fontSize: '2cqw', letterSpacing: '-0.01em' } }, Bo.name || 'Presa')),
        h('div', { 'data-f': 'eyebrow', style: { color: p.accent, fontFamily: 'var(--font-mono)', fontSize: z(1.5, scale), fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' } }, f.eyebrow || 'PRESENTATION')),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: '8cqw', bottom: '6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h('div', { style: { width: '7cqw', height: '0.5cqw', background: p.accent, marginBottom: '2.8cqw', borderRadius: '0.25cqw' } }),
        h(AutoFitText, { tag: 'h1', dataF: 'title', text: f.title, baseCqw: 6.8, scale: scale, maxLines: 3, minScale: 0.46, lineHeight: 1.0, style: { fontWeight: 800, letterSpacing: '-0.03em', color: p.title, margin: 0, maxWidth: '88%' } }),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.6, scale), marginTop: '2.4cqw', maxWidth: '64%', lineHeight: 1.4 } }, f.subtitle) : null),
      h(EdgeFooter, { p, brand: Bo, fields: f, n, total, onAccent: false }));
  }

  // BOLD statement — full accent background, one giant line (problem / solution)
  function L_statementBold(f, p, scale, B, n, total) {
    const Bo = B || { name: 'Presa' };
    return h('div', { className: 'slide', style: { ...slideBase, background: p.accent } },
      h('div', { key: 'eb', 'data-f': 'eyebrow', style: { position: 'absolute', left: '8cqw', top: '7.5cqw', color: 'rgba(255,255,255,.72)', fontFamily: 'var(--font-mono)', fontSize: z(1.7, scale), fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' } }, f.eyebrow || 'КЛЮЧЕВАЯ МЫСЛЬ'),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: 0, bottom: '6cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h('div', { style: { fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,.42)', fontSize: '13cqw', lineHeight: 0.5, height: '5.5cqw' } }, '\u201C'),
        h(AutoFitText, { tag: 'blockquote', dataF: 'quote', text: f.quote, baseCqw: 5.6, scale: scale, maxLines: 4, minScale: 0.48, lineHeight: 1.16, style: { margin: '2cqw 0 0', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', maxWidth: '90%' } }),
        f.author ? h('div', { 'data-f': 'author', style: { marginTop: '3.6cqw', display: 'flex', alignItems: 'center', gap: '1.4cqw', color: '#fff' } },
          h('span', { style: { width: '3cqw', height: '0.3cqw', background: '#fff' } }),
          h('span', { style: { fontWeight: 700, fontSize: z(1.9, scale) } }, f.author)) : null),
      h(EdgeFooter, { p, brand: Bo, fields: f, n, total, onAccent: true }));
  }

  // BOLD/CORP cards — accent header band, white cards below
  function L_cardsBand(f, p, scale, B, n, total) {
    const Bo = B || { name: 'Presa' };
    const cards = (f.cards || []).slice(0, 6);
    const nn = Math.max(cards.length, 1);
    const grid = cardsGrid(nn); const t = cardsTier(nn);
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg } },
      h('div', { key: 'band', style: { position: 'absolute', left: 0, right: 0, top: 0, height: '31%', background: p.accent, padding: '0 8cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        f.eyebrow ? h('div', { 'data-f': 'eyebrow', style: { color: 'rgba(255,255,255,.82)', fontFamily: 'var(--font-mono)', fontSize: z(1.6, scale), fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: '1cqw' } }, f.eyebrow) : null,
        h(AutoFitText, { tag: 'h2', dataF: 'title', text: f.title, baseCqw: 4.4, scale: scale, maxLines: 2, minScale: 0.6, lineHeight: 1.04, style: { fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0, maxWidth: '82%' } })),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: '31%', bottom: '6cqw', paddingTop: '3cqw', display: 'grid', gridTemplateColumns: grid.cols, gridTemplateRows: grid.rows, gap: t.gap } },
        cards.map((c, i) => {
          const critical = String(c.text || '').length > 140;
          return h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: Object.assign({}, grid.span(i), { background: p.bg, border: `0.15cqw solid ${p.border}`, borderRadius: t.radius, padding: t.pad, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minWidth: 0, boxShadow: '0 1cqw 3cqw rgba(15,18,25,.05)' }) },
            h('div', { style: { width: t.barW, height: '0.4cqw', background: p.accent, borderRadius: '0.2cqw', marginBottom: '1.4cqw', flexShrink: 0 } }),
            h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: t.hBase, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.14, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.015em', flexShrink: 0 } }),
            c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: t.dBase, scale, maxLines: t.dLines, minScale: 0.6, lineHeight: 1.4, style: { color: p.body, marginTop: '1.1cqw', overflow: 'hidden' } }) : null,
            critical ? h(CardWarnBadge, { p }) : null);
        })),
      h(EdgeFooter, { p, brand: Bo, fields: f, n, total, onAccent: false }));
  }

  // CORPORATE feature rows — big numbered editorial rows (benefits / solution)
  function L_featureRows(f, p, scale, B, n, total) {
    const Bo = B || { name: 'Presa' };
    const items = (f.bullets || []).filter((b) => String(b).trim() !== '').slice(0, 5);
    const rowH = items.length >= 5 ? 1.9 : items.length === 4 ? 2.3 : 2.8;
    return h('div', { className: 'slide', style: { ...slideBase, background: p.bg } },
      Bar(p),
      h('div', { key: 'c', style: { position: 'absolute', left: '8cqw', right: '8cqw', top: '7cqw', bottom: '6cqw', display: 'flex', flexDirection: 'column' } },
        h(Eyebrow, { text: f.eyebrow || '01', p, scale, fk: 'eyebrow' }),
        h(AutoFitText, { tag: 'h2', dataF: 'title', text: f.title, baseCqw: 4.2, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.04, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.02em', margin: '2cqw 0 0', maxWidth: '88%' } }),
        h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '2.4cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
          items.map((b, i) => h('div', { key: i, 'data-f': 'bullets', 'data-fi': i, style: { display: 'flex', alignItems: 'center', gap: '3cqw', padding: z(rowH, scale) + ' 0', borderTop: i ? `0.12cqw solid ${p.border}` : 'none' } },
            h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 800, color: p.accent, fontSize: z(3.4, scale), minWidth: '6.5cqw', flex: '0 0 auto', letterSpacing: '-0.02em' } }, String(i + 1).padStart(2, '0')),
            h(AutoFitText, { tag: 'div', text: b, baseCqw: 2.6, scale, maxLines: 2, minScale: 0.7, lineHeight: 1.25, style: { color: p.title, fontWeight: 600, minWidth: 0 } }))))),
      h(EdgeFooter, { p, brand: Bo, fields: f, n, total, onAccent: false }));
  }

  /* ============================================================
     SERVICES — extra variants (адаптированы из набора макетов)
     Все рендерят собственный заголовок «SERVICES» + Title.
     ============================================================ */
  const svcWrap = (p, title, scale, body) => [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '4.2cqw 7cqw 6cqw', display: 'flex', flexDirection: 'column' } },
    h(Eyebrow, { text: 'SERVICES', p, scale }), Title(title, p, scale, 3.6), body)];
  const redDeep = (p) => `color-mix(in srgb, ${p.accent} 72%, #000)`;

  // V2 — список с акцентами (список слева + панель справа)
  function L_serviceListPanel(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const panelText = f.panelText || 'Все инструменты в одной системе для создания сильных презентаций';
    const body = h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '2cqw', display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: '3.4cqw' } },
      h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        cards.map((c, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { display: 'flex', gap: '2cqw', alignItems: 'center', padding: '1.5cqw 0', borderBottom: i < cards.length - 1 ? `0.12cqw solid ${p.border}` : 'none' } },
          h('div', { style: { width: '5.2cqw', height: '5.2cqw', borderRadius: '1.3cqw', background: softTint(p), border: `0.12cqw solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
            h(SvcIcon, { name: c.icon, color: p.accent, size: '2.7cqw', stroke: 1.8 })),
          h('div', { style: { minWidth: 0 } },
            h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: 2.15, scale, maxLines: 1, minScale: 0.7, lineHeight: 1.1, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em' } }),
            c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: 1.6, scale, maxLines: 2, minScale: 0.7, lineHeight: 1.3, style: { color: p.body, marginTop: '0.3cqw' } }) : null)))),
      h('div', { 'data-f': 'panelText', style: { background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '2cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3.4cqw', gap: '2.4cqw' } },
        h('div', { style: { width: '8.6cqw', height: '8.6cqw', borderRadius: '2.1cqw', background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1cqw 3cqw ${softTint(p)}` } },
          h(SvcIcon, { name: 'layers', color: '#fff', size: '4.2cqw', stroke: 1.7 })),
        h(AutoFitText, { tag: 'div', text: panelText, baseCqw: 2.2, scale, maxLines: 4, minScale: 0.7, lineHeight: 1.3, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em' } }),
        h('div', { style: { width: '5cqw', height: '0.35cqw', background: p.accent, borderRadius: '0.2cqw' } })));
    return svcWrap(p, f.title, scale, body);
  }

  // V3 — флагман + дополнительные (тёмная герой-карточка + сетка)
  function L_serviceFlagship(f, p, scale) {
    const cards = (f.cards || []).slice(0, 5);
    const hero = cards[0] || {};
    const extras = cards.slice(1, 5);
    const body = h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '2cqw', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: '1fr 1fr', gap: '2.2cqw' } },
      h('div', { key: 'hero', 'data-f': 'cards', 'data-fi': 0, style: { gridRow: '1 / 3', background: '#0C0E12', color: '#fff', borderRadius: '1.9cqw', padding: '3cqw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' } },
        h('div', { style: { position: 'absolute', right: '-4cqw', top: '-4cqw', width: '17cqw', height: '17cqw', background: `radial-gradient(circle, ${p.accent}55, transparent 70%)` } }),
        h('div', { style: { position: 'relative', width: '6.2cqw', height: '6.2cqw', borderRadius: '1.5cqw', background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1cqw 3cqw ${softTint(p)}` } },
          h(SvcIcon, { name: hero.icon, color: '#fff', size: '3cqw', stroke: 1.9 })),
        h('div', { style: { position: 'relative' } },
          h(AutoFitText, { tag: 'div', text: hero.heading, baseCqw: 3, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.1, style: { fontWeight: 800, letterSpacing: '-0.01em' } }),
          hero.text ? h(AutoFitText, { tag: 'div', text: hero.text, baseCqw: 1.75, scale, maxLines: 4, minScale: 0.65, lineHeight: 1.45, style: { color: 'rgba(255,255,255,.72)', marginTop: '1cqw' } }) : null)),
      extras.map((c, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i + 1, style: { background: p.bg, border: `0.15cqw solid ${p.border}`, borderRadius: '1.6cqw', padding: '2.3cqw', display: 'flex', flexDirection: 'column', gap: '1.2cqw', overflow: 'hidden', minWidth: 0 } },
        h('div', { style: { width: '5cqw', height: '5cqw', borderRadius: '1.2cqw', background: softTint(p), border: `0.12cqw solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
          h(SvcIcon, { name: c.icon, color: p.accent, size: '2.5cqw', stroke: 1.8 })),
        h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: 1.95, scale, maxLines: 1, minScale: 0.65, lineHeight: 1.1, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em' } }),
        c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: 1.5, scale, maxLines: 2, minScale: 0.65, lineHeight: 1.35, style: { color: p.body } }) : null)));
    return svcWrap(p, f.title, scale, body);
  }

  // V4 — иконки в строку (минимализм)
  function L_serviceRowIcons(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const n = Math.max(cards.length, 1);
    const badge = n <= 4 ? '7.2cqw' : '6.2cqw';
    const ico = n <= 4 ? '3.4cqw' : '2.9cqw';
    const body = h('div', { style: { flex: '1 1 0', minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: '2.2cqw', alignContent: 'center' } },
      cards.map((c, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5cqw' } },
        h('div', { style: { width: badge, height: badge, borderRadius: '50%', background: p.panel, border: `0.12cqw solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          h(SvcIcon, { name: c.icon, color: p.accent, size: ico, stroke: 1.7 })),
        h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: 2, scale, maxLines: 2, minScale: 0.65, lineHeight: 1.1, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em' } }),
        c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: 1.5, scale, maxLines: 3, minScale: 0.65, lineHeight: 1.35, style: { color: p.body } }) : null)));
    return svcWrap(p, f.title, scale, body);
  }

  // V6 — две колонки: чек-лист + панель результатов
  function L_serviceResults(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const stats = (f.stats || []).slice(0, 4);
    const panelTitle = f.panelTitle || 'Результат для вас';
    const tick = h('div', { style: { width: '3cqw', height: '3cqw', borderRadius: '50%', background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: '0.2cqw' } },
      h('svg', { width: '1.7cqw', height: '1.7cqw', viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M5 12.5l4.2 4.2L19 7' })));
    const body = h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '2cqw', display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: '3.4cqw' } },
      h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.7cqw' } },
        cards.map((c, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { display: 'flex', gap: '1.6cqw', alignItems: 'flex-start' } },
          h('div', { key: 'tk', style: { width: '3cqw', height: '3cqw', borderRadius: '50%', background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: '0.2cqw' } },
            h('svg', { width: '1.7cqw', height: '1.7cqw', viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M5 12.5l4.2 4.2L19 7' }))),
          h('div', { style: { minWidth: 0 } },
            h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: 2, scale, maxLines: 1, minScale: 0.7, lineHeight: 1.1, style: { fontWeight: 800, color: p.title } }),
            c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: 1.55, scale, maxLines: 2, minScale: 0.7, lineHeight: 1.3, style: { color: p.body, marginTop: '0.2cqw' } }) : null)))),
      h('div', { style: { background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '2cqw', padding: '3.4cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
        h('div', { 'data-f': 'panelTitle', style: { fontWeight: 800, color: p.accent, fontSize: z(2.1, scale), marginBottom: '2.6cqw' } }, panelTitle),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.8cqw 2.4cqw' } },
          stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: i >= 2 ? { gridColumn: '1 / 3', borderTop: `0.15cqw solid ${p.border}`, paddingTop: '2.4cqw' } : {} },
            h('div', { style: { fontWeight: 800, color: p.accent, fontSize: z(4.4, scale), letterSpacing: '-0.03em', lineHeight: 1 } }, s.value),
            h('div', { style: { color: p.body, fontSize: z(1.5, scale), marginTop: '0.7cqw', lineHeight: 1.3 } }, s.label))))));
    return svcWrap(p, f.title, scale, body);
  }

  // V7 — блоки с акцентным цветом (красные + тёмные)
  function L_serviceBlocks(f, p, scale) {
    const cards = (f.cards || []).slice(0, 6);
    const n = Math.max(cards.length, 1);
    const grid = cardsGrid(n);
    const t = cardsTier(n);
    const half = Math.ceil(n / 2);
    const bSz = n <= 4 ? '5.6cqw' : '4.8cqw';
    const bIco = n <= 4 ? '2.9cqw' : '2.5cqw';
    const body = h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '2cqw', display: 'grid', gridTemplateColumns: grid.cols, gridTemplateRows: grid.rows, gap: t.gap } },
      cards.map((c, i) => {
        const red = i < half;
        return h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: Object.assign({}, grid.span(i), { borderRadius: t.radius, padding: t.pad, display: 'flex', flexDirection: 'column', gap: '1.2cqw', color: '#fff', overflow: 'hidden', minWidth: 0, background: red ? `linear-gradient(155deg, ${p.accent}, ${redDeep(p)})` : 'linear-gradient(155deg, #1C2029, #0C0E12)', boxShadow: red ? `0 1.2cqw 3cqw ${softTint(p)}` : 'none' }) },
          h('div', { style: { width: bSz, height: bSz, borderRadius: '1.2cqw', background: 'rgba(255,255,255,.14)', border: '0.12cqw solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
            h(SvcIcon, { name: c.icon, color: '#fff', size: bIco, stroke: 1.9 })),
          h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: t.hBase, scale, maxLines: 1, minScale: 0.6, lineHeight: 1.12, style: { fontWeight: 800, letterSpacing: '-0.01em' } }),
          c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: t.dBase, scale, maxLines: t.dLines, minScale: 0.6, lineHeight: 1.4, style: { color: 'rgba(255,255,255,.82)' } }) : null);
      }));
    return svcWrap(p, f.title, scale, body);
  }

  // V8 — процесс / как это работает (нумерованные круги + стрелки)
  function L_serviceProcess(f, p, scale) {
    const steps = (f.steps || []).slice(0, 5);
    const n = Math.max(steps.length, 1);
    const on = (s) => h('svg', { viewBox: '0 0 80 16', width: '100%', style: { maxWidth: '8cqw' }, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M2 8h70' }), h('path', { d: 'M66 3l6 5-6 5' }));
    const items = [];
    steps.forEach((s, i) => {
      items.push(h('div', { key: 's' + i, 'data-f': 'steps', 'data-fi': i, style: { flex: '0 0 auto', width: '17cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } },
        h('div', { style: { width: '9cqw', height: '9cqw', borderRadius: '50%', border: `0.25cqw solid ${p.border}`, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: z(3.2, scale), color: p.title, boxShadow: `0 0.6cqw 2cqw ${p.dark ? 'rgba(0,0,0,.3)' : 'rgba(15,18,25,.06)'}` } }, String(i + 1).padStart(2, '0')),
        h(AutoFitText, { tag: 'div', text: s.title, baseCqw: 2, scale, maxLines: 2, minScale: 0.65, lineHeight: 1.12, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em', marginTop: '2cqw' } }),
        s.desc ? h(AutoFitText, { tag: 'div', text: s.desc, baseCqw: 1.55, scale, maxLines: 3, minScale: 0.65, lineHeight: 1.4, style: { color: p.body, marginTop: '1cqw' } }) : null));
      if (i < n - 1) items.push(h('div', { key: 'a' + i, style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.border, marginTop: '4.2cqw' } }, on()));
    });
    const body = h('div', { style: { flex: '1 1 0', minHeight: 0, display: 'flex', alignItems: 'center' } },
      h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' } }, items));
    return svcWrap(p, f.title, scale, body);
  }

  // V9 — таблица сравнения возможностей
  function cmpMark(v, p) {
    const s = String(v == null ? '' : v).toLowerCase().trim();
    const yes = /^(да|yes|\+|v|1|true)$/.test(s) || s.indexOf('✓') >= 0 || s.indexOf('✔') >= 0;
    const no = !s || /^(нет|no|-|—|x|0|false)$/.test(s) || s.indexOf('✕') >= 0 || s.indexOf('✗') >= 0 || s.indexOf('✖') >= 0;
    if (yes) return h('svg', { width: '2.6cqw', height: '2.6cqw', viewBox: '0 0 24 24', fill: 'none', stroke: p.accent, strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M5 12.5l4.2 4.2L19 7' }));
    if (no) return h('svg', { width: '2.4cqw', height: '2.4cqw', viewBox: '0 0 24 24', fill: 'none', stroke: p.border, strokeWidth: 2.4, strokeLinecap: 'round' }, h('path', { d: 'M6.5 6.5l11 11M17.5 6.5l-11 11' }));
    return h('svg', { width: '2.4cqw', height: '2.4cqw', viewBox: '0 0 24 24', fill: 'none', stroke: p.faint, strokeWidth: 2 }, h('circle', { cx: 12, cy: 12, r: 7 }));
  }
  function L_serviceCompare(f, p, scale) {
    const rows = (f.rows || []).slice(0, 6);
    const thBase = { padding: '1.5cqw 2cqw', fontSize: z(1.8, scale), fontWeight: 800, verticalAlign: 'middle' };
    const tdBase = { padding: '1.45cqw 2cqw', fontSize: z(1.85, scale), borderTop: `0.12cqw solid ${p.border}`, verticalAlign: 'middle' };
    const body = h('table', { style: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginTop: '2.4cqw', tableLayout: 'fixed' } },
      h('thead', null, h('tr', null,
        h('th', { style: Object.assign({}, thBase, { textAlign: 'left', color: p.title, width: '40%' }) }, f.h1 || 'Возможности'),
        h('th', { 'data-f': 'h2', style: Object.assign({}, thBase, { textAlign: 'center', color: '#fff', background: p.accent, borderRadius: '1cqw 1cqw 0 0' }) }, f.h2 || 'Presa'),
        h('th', { 'data-f': 'h3', style: Object.assign({}, thBase, { textAlign: 'center', color: p.title }) }, f.h3 || 'Другие решения'),
        h('th', { 'data-f': 'h4', style: Object.assign({}, thBase, { textAlign: 'center', color: p.title }) }, f.h4 || 'Ручная работа'))),
      h('tbody', null, rows.map((r, i) => h('tr', { key: i, 'data-f': 'rows', 'data-fi': i },
        h('td', { style: Object.assign({}, tdBase, { textAlign: 'left', color: p.title, fontWeight: 600 }) }, r.feature),
        h('td', { style: Object.assign({}, tdBase, { textAlign: 'center', background: softTint(p) }) }, cmpMark(r.a, p)),
        h('td', { style: Object.assign({}, tdBase, { textAlign: 'center' }) }, cmpMark(r.b, p)),
        h('td', { style: Object.assign({}, tdBase, { textAlign: 'center' }) }, cmpMark(r.c, p))))));
    return svcWrap(p, f.title, scale, h('div', { style: { flex: '1 1 0', minHeight: 0 } }, body));
  }

  /* ============================================================
     ABOUT COMPANY — extra variants (mirror of provided reference set)
     lead text + icon cards · text/metrics + history timeline ·
     text/metrics + product image. All theme-aware via palette tokens.
     ============================================================ */

  // О компании — вводный текст + карточки с иконками (по центру)
  function L_aboutLeadCards(f, p, scale) {
    const cards = (f.cards || []).slice(0, 4);
    const n = Math.max(cards.length, 1);
    return [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '4.2cqw 7cqw 6cqw', display: 'flex', flexDirection: 'column' } },
      h(Eyebrow, { text: 'О КОМПАНИИ', p, scale }),
      Title(f.title, p, scale, 3.6),
      f.intro ? h(AutoFitText, { tag: 'p', dataF: 'intro', text: f.intro, baseCqw: 2, scale, maxLines: 2, minScale: 0.7, lineHeight: 1.5, style: { color: p.body, marginTop: '1.6cqw', maxWidth: '76%' } }) : null,
      h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '2.6cqw', display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: '2.2cqw' } },
        cards.map((c, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '1.8cqw', padding: '3cqw 2.4cqw', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 0 } },
          h('div', { style: { width: '7.4cqw', height: '7.4cqw', borderRadius: '50%', background: p.bg, border: `0.15cqw solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', boxShadow: `0 0.6cqw 2cqw ${p.dark ? 'rgba(0,0,0,.3)' : 'rgba(15,18,25,.05)'}` } },
            h(SvcIcon, { name: c.icon, color: p.accent, size: '3.8cqw', stroke: 1.8 })),
          h(AutoFitText, { tag: 'div', text: c.heading, baseCqw: 2.3, scale, maxLines: 1, minScale: 0.6, lineHeight: 1.1, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em', marginTop: '2.2cqw' } }),
          h('div', { style: { width: '3.2cqw', height: '0.3cqw', background: p.accent, borderRadius: '0.2cqw', margin: '1.4cqw 0' } }),
          c.text ? h(AutoFitText, { tag: 'div', text: c.text, baseCqw: 1.55, scale, maxLines: 5, minScale: 0.58, lineHeight: 1.45, style: { color: p.body, overflow: 'hidden' } }) : null))))];
  }

  // О компании — текст + метрики слева, таймлайн истории справа
  function L_aboutTimelineStats(f, p, scale) {
    const stats = (f.stats || []).slice(0, 2);
    const ms = (f.milestones || []).slice(0, 4);
    const stat = (s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { flex: 1, background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '1.6cqw', padding: '2cqw 2.2cqw', display: 'flex', alignItems: 'center', gap: '1.6cqw', minWidth: 0 } },
      h('div', { style: { width: '5.4cqw', height: '5.4cqw', borderRadius: '1.3cqw', background: softTint(p), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
        h(SvcIcon, { name: s.icon, color: p.accent, size: '2.8cqw', stroke: 1.8 })),
      h('div', { style: { minWidth: 0 } },
        h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '0.8cqw', flexWrap: 'wrap' } },
          h('div', { style: { fontWeight: 800, color: p.accent, fontSize: z(2.9, scale), letterSpacing: '-0.02em', lineHeight: 1 } }, s.value),
          h('div', { style: { fontWeight: 700, color: p.title, fontSize: z(1.65, scale) } }, s.label)),
        s.sub ? h('div', { style: { color: p.body, fontSize: z(1.4, scale), marginTop: '0.4cqw' } }, s.sub) : null));
    return [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '4.2cqw 7cqw 6cqw', display: 'grid', gridTemplateColumns: '0.84fr 1.16fr', gap: '3.6cqw' } },
      h('div', { style: { display: 'flex', flexDirection: 'column', minWidth: 0 } },
        h(Eyebrow, { text: 'О КОМПАНИИ', p, scale }),
        Title(f.title, p, scale, 5),
        f.intro ? h(AutoFitText, { tag: 'p', dataF: 'intro', text: f.intro, baseCqw: 1.95, scale, maxLines: 6, minScale: 0.66, lineHeight: 1.55, style: { color: p.body, marginTop: '2cqw' } }) : null,
        h('div', { style: { marginTop: 'auto', paddingTop: '2.4cqw', display: 'flex', gap: '1.6cqw' } }, stats.map(stat))),
      h('div', { style: { background: p.panel, border: `0.15cqw solid ${p.border}`, borderRadius: '2cqw', padding: '3.2cqw 3cqw', display: 'flex', flexDirection: 'column', minWidth: 0 } },
        h('div', { 'data-f': 'panelTitle', style: { fontWeight: 800, color: p.title, fontSize: z(2.4, scale), letterSpacing: '-0.01em', marginBottom: '2.2cqw' } }, f.panelTitle || 'Наша история и рост'),
        h('div', { style: { flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } },
          ms.map((m, i) => {
            const last = i === ms.length - 1;
            return h('div', { key: i, 'data-f': 'milestones', 'data-fi': i, style: { display: 'flex', gap: '1.8cqw' } },
              h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto' } },
                h('div', { style: { width: '2.4cqw', height: '2.4cqw', borderRadius: '50%', border: `0.45cqw solid ${p.accent}`, background: last ? p.accent : p.bg, boxSizing: 'border-box', flex: '0 0 auto' } }),
                !last ? h('div', { style: { flex: 1, width: '0.18cqw', background: p.border, margin: '0.4cqw 0', minHeight: '2.4cqw' } }) : null),
              h('div', { style: { paddingBottom: last ? 0 : '2cqw', flex: 1, minWidth: 0 } },
                h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '1.4cqw' } },
                  h('div', { style: { fontWeight: 800, color: p.accent, fontSize: z(2.3, scale), letterSpacing: '-0.01em', flex: '0 0 auto' } }, m.year),
                  h(AutoFitText, { tag: 'div', text: m.heading, baseCqw: 1.9, scale, maxLines: 2, minScale: 0.62, lineHeight: 1.12, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em' } })),
                m.text ? h(AutoFitText, { tag: 'div', text: m.text, baseCqw: 1.5, scale, maxLines: 2, minScale: 0.66, lineHeight: 1.4, style: { color: p.body, marginTop: '0.5cqw', overflow: 'hidden' } }) : null));
          }))))];
  }

  // О компании — текст + метрики слева, изображение продукта справа
  function L_aboutTextMedia(f, p, scale) {
    const stats = (f.stats || []).slice(0, 3);
    const hasImg = !!f.image;
    return [Bar(p),
      h('div', { key: 'l', style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '55%', padding: '4.2cqw 4cqw 6cqw 7cqw', display: 'flex', flexDirection: 'column' } },
        h(Eyebrow, { text: 'О КОМПАНИИ', p, scale }),
        Title(f.title, p, scale, 5),
        f.intro ? h(AutoFitText, { tag: 'p', dataF: 'intro', text: f.intro, baseCqw: 1.95, scale, maxLines: 7, minScale: 0.66, lineHeight: 1.55, style: { color: p.body, marginTop: '2cqw', maxWidth: '96%' } }) : null,
        h('div', { style: { marginTop: 'auto', paddingTop: '2.4cqw', display: 'flex', alignItems: 'stretch' } },
          stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { flex: 1, minWidth: 0, paddingLeft: i ? '2.4cqw' : 0, marginLeft: i ? '2.4cqw' : 0, borderLeft: i ? `0.15cqw solid ${p.border}` : 'none' } },
            h(SvcIcon, { name: s.icon, color: p.accent, size: '2.8cqw', stroke: 1.8 }),
            h('div', { style: { fontWeight: 800, color: p.title, fontSize: z(4.6, scale), letterSpacing: '-0.03em', lineHeight: 1, marginTop: '1.2cqw' } }, s.value),
            h('div', { style: { color: p.body, fontSize: z(1.6, scale), marginTop: '0.8cqw' } }, s.label))))),
      h('div', { key: 'r', style: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', background: p.panel, overflow: 'hidden' } },
        hasImg ? h('img', { 'data-f': 'image', src: f.image, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }) : h(ImgPlaceholder, { p, label: f.imageLabel || 'Изображение продукта', scale }))];
  }

  /* ============================================================
     RED-CORPORATE reference templates — geometric (triangles),
     red accent, clean white. Eyebrow is a normal kicker (no numbers).
     ============================================================ */

  // shared eyebrow + big black heading for the reference content slides
  function refHead(f, p, scale, fallback) {
    return h('div', { key: 'hd', style: { flex: '0 0 auto' } },
      h(Eyebrow, { text: f.eyebrow || fallback, p, scale, fk: 'eyebrow' }),
      h(AutoFitText, { tag: 'h2', dataF: 'title', text: f.title, baseCqw: 4.6, scale, maxLines: 2, minScale: 0.6, lineHeight: 1.05, style: { fontWeight: 800, letterSpacing: '-0.01em', color: p.title, textTransform: 'uppercase', margin: '2.2cqw 0 0', maxWidth: '92%' } }));
  }

  // faint geometric triangle motif (decoration), pinned to a corner
  function TriDeco(p, o) {
    o = o || {};
    return h('div', { key: 'tri', style: Object.assign({ position: 'absolute', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }, o.box || { right: 0, bottom: 0, width: '34%', height: '70%' }) },
      h('svg', { viewBox: '0 0 100 100', preserveAspectRatio: 'none', width: '100%', height: '100%' },
        h('polygon', { points: '100,34 100,100 30,100', fill: p.accent, opacity: o.solid != null ? o.solid : 0.07 }),
        h('polygon', { points: '100,8 100,100 8,100', fill: 'none', stroke: p.accent, strokeWidth: 0.5, opacity: 0.22 }),
        h('polygon', { points: '100,56 100,100 56,100', fill: 'none', stroke: p.accent, strokeWidth: 0.6, opacity: 0.4 })));
  }

  // 1) Титул — фото + красный треугольник (SELF: renders its own slide)
  function L_titleTrianglePhoto(f, p, scale, B) {
    const hasImg = !!f.image;
    const Bo = B || { name: 'Presa', logo: null, pageNum: true };
    return h('div', { className: 'slide', style: { containerType: 'inline-size', background: p.bg, position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: 'var(--font-sans)' } },
      Bar(p),
      // right photo region with a diagonal left edge
      h('div', { key: 'img', 'data-f': 'imageLabel', style: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '54%', background: p.panel, overflow: 'hidden', clipPath: 'polygon(26% 0, 100% 0, 100% 100%, 0 100%)' } },
        hasImg ? h('img', { src: f.image, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }) : h(ImgPlaceholder, { p, label: f.imageLabel || 'Перетащите фото', scale })),
      // red triangle wedge bottom-right, overlapping the photo
      h('div', { key: 'wedge', style: { position: 'absolute', right: 0, bottom: 0, width: '40%', height: '52%', background: p.accent, clipPath: 'polygon(8% 100%, 100% 16%, 100% 100%)' } }),
      // logo top-left
      h('div', { key: 'logo', style: { position: 'absolute', left: '7cqw', top: '6cqw', display: 'flex', alignItems: 'center', gap: '1.3cqw', zIndex: 3 } },
        Bo.logo ? h('img', { src: Bo.logo, alt: '', style: { height: '3.4cqw', width: 'auto', display: 'block' } }) : h(Mark, { accent: p.accent, size: '3.4cqw' }),
        h('span', { style: { fontWeight: 800, fontSize: z(2.1, scale), color: p.title, letterSpacing: '.06em', textTransform: 'uppercase' } }, Bo.name || 'Presa')),
      // text block on the left
      h('div', { key: 'c', style: { position: 'absolute', left: '7cqw', top: 0, bottom: 0, width: '46%', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 3 } },
        f.eyebrow ? h('div', { 'data-f': 'eyebrow', style: { color: p.body, fontSize: z(1.7, scale), fontWeight: 600, letterSpacing: '.04em', marginBottom: '1.6cqw' } }, f.eyebrow) : null,
        h('h1', { style: { margin: 0, fontWeight: 800, letterSpacing: '-0.015em', color: p.title, fontSize: z(6.6, scale), lineHeight: 1.04, textTransform: 'uppercase' } },
          h('span', { 'data-f': 'title' }, f.title),
          f.titleAccent ? h('span', { 'data-f': 'titleAccent', style: { color: p.accent } }, ' ' + f.titleAccent) : null),
        f.subtitle ? h('p', { 'data-f': 'subtitle', style: { color: p.body, fontSize: z(2.3, scale), marginTop: '2.6cqw', maxWidth: '90%', lineHeight: 1.45 } }, f.subtitle) : null,
        h('div', { style: { marginTop: '4cqw', display: 'flex', alignItems: 'center', gap: '1.6cqw' } },
          h('span', { style: { width: '5cqw', height: '0.3cqw', background: p.accent, display: 'inline-block' } }),
          f.footerLabel ? h('span', { 'data-f': 'footerLabel', style: { color: p.faint, fontFamily: 'var(--font-mono)', fontSize: z(1.8, scale), fontWeight: 600 } }, f.footerLabel) : null)));
  }

  // 2) О компании — текст + три иконки (Команда / Фокус / Миссия)
  function L_aboutGeoIcons(f, p, scale) {
    const cards = (f.cards || []).slice(0, 4);
    return [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '5cqw 8cqw 6cqw', display: 'flex', flexDirection: 'column' } },
      refHead(f, p, scale, 'О КОМПАНИИ'),
      f.intro ? h(AutoFitText, { tag: 'p', dataF: 'intro', text: f.intro, baseCqw: 2.2, scale, maxLines: 4, minScale: 0.7, lineHeight: 1.5, style: { color: p.body, marginTop: '2.6cqw', maxWidth: '64%' } }) : null,
      h('div', { style: { marginTop: 'auto', paddingTop: '3cqw', display: 'grid', gridTemplateColumns: `repeat(${Math.max(cards.length, 1)}, 1fr)`, gap: '3.4cqw' } },
        cards.map((cd, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { minWidth: 0 } },
          h(SvcIcon, { name: cd.icon, color: p.accent, size: '4.4cqw', stroke: 1.7 }),
          h(AutoFitText, { tag: 'div', text: cd.heading, baseCqw: 2.3, scale, maxLines: 1, minScale: 0.7, lineHeight: 1.1, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em', marginTop: '1.8cqw' } }),
          cd.text ? h(AutoFitText, { tag: 'div', text: cd.text, baseCqw: 1.6, scale, maxLines: 3, minScale: 0.66, lineHeight: 1.4, style: { color: p.body, marginTop: '0.9cqw' } }) : null))))];
  }

  // 3) Наши решения — бейджи с иконками + геометрический треугольник
  function L_solutionBadges(f, p, scale) {
    const cards = (f.cards || []).slice(0, 4);
    const n = Math.max(cards.length, 1);
    const bSz = n <= 3 ? '6.6cqw' : '5.6cqw';
    const ico = n <= 3 ? '3.4cqw' : '3cqw';
    return [Bar(p),
      TriDeco(p, { box: { right: '4cqw', top: '50%', width: '24%', height: '46%', transform: 'translateY(-50%)' }, solid: 0.06 }),
      h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '5cqw 8cqw 6cqw', display: 'flex', flexDirection: 'column' } },
        refHead(f, p, scale, 'НАШИ РЕШЕНИЯ'),
        h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '3cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: n <= 3 ? '2.8cqw' : '2cqw', maxWidth: '70%' } },
          cards.map((cd, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { display: 'flex', gap: '2.4cqw', alignItems: 'center' } },
            h('div', { style: { width: bSz, height: bSz, borderRadius: '1.2cqw', background: p.panel, border: `0.15cqw solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' } },
              h(SvcIcon, { name: cd.icon, color: p.accent, size: ico, stroke: 1.8 })),
            h('div', { style: { minWidth: 0 } },
              h(AutoFitText, { tag: 'div', text: cd.heading, baseCqw: 2.5, scale, maxLines: 1, minScale: 0.66, lineHeight: 1.1, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em' } }),
              cd.text ? h(AutoFitText, { tag: 'div', text: cd.text, baseCqw: 1.7, scale, maxLines: 2, minScale: 0.66, lineHeight: 1.4, style: { color: p.body, marginTop: '0.5cqw' } }) : null)))))];
  }

  // 4) Преимущества — чек-лист + концентрические кольца с ромбом
  function L_benefitsCheckRings(f, p, scale) {
    const cards = (f.cards || []).slice(0, 5);
    return [Bar(p), h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '5cqw 8cqw 6cqw', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '4cqw' } },
      h('div', { style: { display: 'flex', flexDirection: 'column', minWidth: 0 } },
        refHead(f, p, scale, 'ПРЕИМУЩЕСТВА'),
        h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '3cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: cards.length >= 4 ? '2.2cqw' : '2.8cqw' } },
          cards.map((cd, i) => h('div', { key: i, 'data-f': 'cards', 'data-fi': i, style: { display: 'flex', gap: '1.8cqw', alignItems: 'flex-start' } },
            h('div', { key: 'tk', style: { width: '3.2cqw', height: '3.2cqw', borderRadius: '50%', background: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginTop: '0.2cqw' } },
              h('svg', { width: '1.8cqw', height: '1.8cqw', viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }, h('path', { d: 'M5 12.5l4.2 4.2L19 7' }))),
            h('div', { style: { minWidth: 0 } },
              h(AutoFitText, { tag: 'div', text: cd.heading, baseCqw: 2.3, scale, maxLines: 1, minScale: 0.66, lineHeight: 1.12, style: { fontWeight: 800, color: p.title, letterSpacing: '-0.01em' } }),
              cd.text ? h(AutoFitText, { tag: 'div', text: cd.text, baseCqw: 1.65, scale, maxLines: 2, minScale: 0.66, lineHeight: 1.4, style: { color: p.body, marginTop: '0.4cqw' } }) : null))))),
      h('div', { style: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 } },
        h('svg', { viewBox: '0 0 200 200', width: '78%', style: { maxWidth: '34cqw' }, fill: 'none' },
          h('circle', { cx: 100, cy: 100, r: 92, stroke: p.border, strokeWidth: 1.4 }),
          h('circle', { cx: 100, cy: 100, r: 70, stroke: p.border, strokeWidth: 1.4 }),
          h('circle', { cx: 100, cy: 100, r: 48, stroke: p.border, strokeWidth: 1.4 }),
          h('path', { d: 'M100 8 A92 92 0 0 1 192 100', stroke: p.accent, strokeWidth: 7, strokeLinecap: 'round' }),
          h('path', { d: 'M100 30 A70 70 0 0 0 30 100', stroke: p.accent, strokeWidth: 7, strokeLinecap: 'round', opacity: 0.55 }),
          h('rect', { x: 100, y: 76, width: 34, height: 34, transform: 'rotate(45 100 100)', fill: 'none', stroke: p.accent, strokeWidth: 5, strokeLinejoin: 'round' }))))];
  }

  // 5) Наши результаты — 4 цифры с иконками + геометрия
  function L_numbersIconStats(f, p, scale) {
    const stats = (f.stats || []).slice(0, 4);
    return [Bar(p),
      TriDeco(p, { box: { right: 0, bottom: 0, width: '30%', height: '52%' }, solid: 0.05 }),
      h('div', { key: 'c', style: { position: 'absolute', inset: 0, padding: '5cqw 8cqw 6cqw', display: 'flex', flexDirection: 'column' } },
        refHead(f, p, scale, 'НАШИ РЕЗУЛЬТАТЫ'),
        h('div', { style: { flex: '1 1 0', minHeight: 0, marginTop: '3cqw', display: 'grid', gridTemplateColumns: `repeat(${Math.max(stats.length, 1)}, 1fr)`, gap: '3cqw', alignItems: 'center' } },
          stats.map((s, i) => h('div', { key: i, 'data-f': 'stats', 'data-fi': i, style: { minWidth: 0 } },
            h(SvcIcon, { name: s.icon, color: p.accent, size: '4.2cqw', stroke: 1.8 }),
            h('div', { style: { fontWeight: 800, color: p.accent, fontSize: z(6.2, scale), letterSpacing: '-0.03em', lineHeight: 1, marginTop: '2cqw' } }, s.value),
            h(AutoFitText, { tag: 'div', text: s.label, baseCqw: 1.8, scale, maxLines: 2, minScale: 0.66, lineHeight: 1.3, style: { color: p.body, marginTop: '1.2cqw', maxWidth: '92%' } })))))];
  }

  const MAP = {
    title_triangle_photo: L_titleTrianglePhoto, about_geo_icons: L_aboutGeoIcons,
    solution_badges: L_solutionBadges, benefits_check_rings: L_benefitsCheckRings, numbers_icon_stats: L_numbersIconStats,
    about_lead_cards: L_aboutLeadCards, about_timeline_stats: L_aboutTimelineStats, about_text_media: L_aboutTextMedia,
    service_list_panel: L_serviceListPanel, service_flagship: L_serviceFlagship,
    service_row_icons: L_serviceRowIcons, service_results: L_serviceResults,
    service_blocks: L_serviceBlocks, service_process: L_serviceProcess, service_compare: L_serviceCompare,
    title_bold: L_titleBold, title_corporate: L_titleCorporate, statement_bold: L_statementBold,
    title_aurora: L_titleAurora, title_spotlight: L_titleSpotlight, title_oversized: L_titleOversized, title_frame: L_titleFrame,
    cards_band: L_cardsBand, feature_rows: L_featureRows,
    title_hero: L_title, title_dark: L_title, split_accent: L_split, bullets: L_bullets,
    text_bullets: L_textBullets,
    title_center: L_titleCenter, title_band: L_titleBand, title_minimal: L_titleMinimal,
    title_image_full: L_titleImageFull, title_image_split: L_titleImageSplit,
    title_sidebar: L_titleSidebar, title_editorial: L_titleEditorial,
    agenda_grid: L_agendaGrid, side_list: L_sideList,
    agenda: L_agenda, cards: L_cards, text_stats: L_textStats, stats_row: L_statsRow,
    service_photos: L_servicePhotos, service_icons: L_serviceIcons,
    service_photo_icon: L_servicePhotoIcon, service_minimal: L_serviceMinimal,
    big_stat: L_bigStat, quote: L_quote, text_media: L_textMedia, steps: L_steps,
    timeline: L_timeline, pricing: L_pricing, compare: L_compare, team: L_team, cta: L_cta,
    chart_bar: L_chartBar, chart_line: L_chartLine, chart_donut: L_chartDonut, table: L_table
  };

  function SlideRenderer({ template, fields, theme, scale, slideNumber = 1, total = 1, brand = 'Presa' }) {
    const p = palette(template, theme || {});
    const B = (!brand || typeof brand === 'string')
      ? { name: brand || 'Presa', logo: null, pageNum: true }
      : { name: brand.name || 'Presa', logo: brand.logo || null, pageNum: brand.pageNum !== false };
    const extras = window.PresaExtraLayouts || {};
    if (extras[template.layoutType]) return extras[template.layoutType](fields, p, scale, B, slideNumber, total);
    const fn = MAP[template.layoutType] || L_bullets;
    if (template.layoutType === 'cta') return fn(fields, p, scale, B);
    const SELF = { title_image_full: 1, title_bold: 1, title_corporate: 1, statement_bold: 1, cards_band: 1, feature_rows: 1, title_triangle_photo: 1, title_aurora: 1, title_spotlight: 1, title_oversized: 1, title_frame: 1 };
    if (SELF[template.layoutType]) return fn(fields, p, scale, B, slideNumber, total);
    const inner = fn(fields, p, scale, p.dark);
    return h('div', { className: 'slide', style: { containerType: 'inline-size', background: p.bg, position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', fontFamily: 'var(--font-sans)' } },
      inner, h(TopLogo, { p, brand: B, layoutType: template.layoutType }), h(Footer, { p, brand: B, n: slideNumber, total }));
  }

  window.SlideRenderer = SlideRenderer;
  window.PresaPalette = palette;
})();
