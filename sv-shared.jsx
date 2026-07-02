/* ============================================================
   Presa — Shared chrome, icons, data for Services slide variants
   ============================================================ */

// ---------- Icon set (24x24, stroke = currentColor) ----------
const ICON_PATHS = {
  ai: ( // sparkle / AI
    <g>
      <path d="M12 3l1.8 4.9L18.8 9.7 13.8 11.5 12 16.4 10.2 11.5 5.2 9.7 10.2 7.9z"/>
      <path d="M18.5 3.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/>
    </g>
  ),
  book: ( // library
    <g>
      <path d="M12 6.2C10.6 5.1 8.8 4.5 6.8 4.5c-1 0-2 .15-2.8.42v13C4.8 17.65 5.8 17.5 6.8 17.5c2 0 3.8.6 5.2 1.7"/>
      <path d="M12 6.2c1.4-1.1 3.2-1.7 5.2-1.7 1 0 2 .15 2.8.42v13c-.8-.27-1.8-.42-2.8-.42-2 0-3.8.6-5.2 1.7"/>
      <path d="M12 6.2v12.9"/>
    </g>
  ),
  bolt: ( // speed
    <path d="M13.5 3.5L5 13.2h5.6L9.8 20.5 18.5 10.4H12.7z"/>
  ),
  shield: ( // standard / quality
    <g>
      <path d="M12 3.2l7 2.6v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5z"/>
      <path d="M8.7 11.8l2.3 2.3 4.3-4.6"/>
    </g>
  ),
  file: ( // export
    <g>
      <path d="M7 3.5h6.5L18 8v12.5H7z"/>
      <path d="M13.3 3.6V8H18"/>
      <path d="M12 17V11.5"/>
      <path d="M9.4 13.8L12 11.2l2.6 2.6"/>
    </g>
  ),
  brand: ( // branding / palette
    <g>
      <path d="M12 3.5c-4.7 0-8.5 3.6-8.5 8 0 2.8 2.2 4.3 4.4 4.3h1.5c1 0 1.8.8 1.8 1.8 0 .5-.2.9-.4 1.3-.2.4-.4.8-.4 1.2 0 .9.8 1.4 1.6 1.4 4.7 0 8.5-4 8.5-8.7 0-5-3.8-8.6-8.5-8.6z"/>
      <circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="7.8" r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="15.2" cy="8.4" r="1.1" fill="currentColor" stroke="none"/>
    </g>
  ),
  layers: ( // all tools in one system
    <g>
      <path d="M12 3.5l8.5 4.3L12 12 3.5 7.8z"/>
      <path d="M3.5 12L12 16.3 20.5 12"/>
      <path d="M3.5 16.2L12 20.5 20.5 16.2"/>
    </g>
  ),
  check: <path d="M5 12.5l4.2 4.2L19 7"/>,
  cross: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>,
  dash: <path d="M7 12h10"/>,
};

function Icon({ name, size = 24, stroke = 2, className = "", style = {} }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {ICON_PATHS[name]}
    </svg>
  );
}

// ---------- Services content ----------
const SERVICES = [
  { icon: "ai",     title: "AI-помощник", desc: "Улучшает формулировки под лимиты слайда" },
  { icon: "book",   title: "Библиотека",  desc: "Десятки готовых дизайнов под задачу" },
  { icon: "bolt",   title: "Скорость",    desc: "Готовая презентация за минуту" },
  { icon: "shield", title: "Стандарт",    desc: "Единое качество по всей команде" },
  { icon: "file",   title: "Экспорт",     desc: "Редактируемый PPTX в один клик" },
  { icon: "brand",  title: "Брендинг",    desc: "Ваши цвета, шрифты и логотип" },
];

// ---------- Logo mark ----------
function PresaMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" rx="6" fill="#E5322B"/>
      <path d="M9 8.5h7.2c2.1 0 3.6 1.4 3.6 3.4 0 2-1.5 3.4-3.6 3.4H12v4.2H9z M12 11v2h3.6c.7 0 1.1-.4 1.1-1s-.4-1-1.1-1z"
        fill="#fff"/>
    </svg>
  );
}

// ---------- Corner button (red list square) ----------
function CornerBtn() {
  return (
    <div className="sv-corner">
      <span></span><span></span><span></span>
    </div>
  );
}

// ---------- Slide chrome ----------
// SlideFrame: white slide w/ left red accent, header eyebrow + corner, footer.
function SlideFrame({ children, eyebrow = "SERVICES", index = "01", total = "01", pad = 56 }) {
  return (
    <div className="sv-slide">
      <div className="sv-accent"></div>
      <div className="sv-inner" style={{ padding: pad }}>
        <div className="sv-head">
          <div className="sv-eyebrow"><i></i>{eyebrow}</div>
          <CornerBtn/>
        </div>
        <div className="sv-body">{children}</div>
        <div className="sv-foot">
          <div className="sv-wordmark"><PresaMark size={20}/><span>Presa</span></div>
          <div className="sv-page">{index} <em>/</em> {total}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, ICON_PATHS, SERVICES, PresaMark, CornerBtn, SlideFrame });
