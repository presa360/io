/* global React, CX, PresaData, PresaTemplates, PresaAI */
/* ============================================================
   Presa — Guided wizard, part 1
   Data + helpers + the early step screens
   (Mode · Design · Brand · Type · Paste) and the step rail.
   Exports onto window.CXWiz; part 2 (flow) adds Brief + Structure.
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useState, useRef, useMemo } = React;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;
  const Lib = window.PresaTemplates;
  const THEMES = window.PresaData.THEMES;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  /* ---------- color helpers ---------- */
  function hexToRgb(hex) {
    const m = String(hex || '').replace('#', '').match(/.{1,2}/g) || ['00', '00', '00'];
    return m.map((x) => parseInt(x, 16));
  }
  function tintSoft(hex) {
    const [r, g, b] = hexToRgb(hex);
    const mix = (c) => Math.round(c * 0.12 + 255 * 0.88);
    const h2 = (c) => mix(c).toString(16).padStart(2, '0');
    return '#' + h2(r) + h2(g) + h2(b);
  }
  // recolor a theme to the brand accent (keeps soft tint consistent on light themes)
  function applyBrand(theme, brand) {
    const acc = (brand && brand.accent) || theme.accent;
    if (!acc || acc === theme.accent) return theme;
    return { ...theme, accent: acc, accentSoft: theme.dark ? theme.accentSoft : tintSoft(acc) };
  }

  /* ---------- background → theme variant (registered into THEMES) ---------- */
  function themeVariant(baseKey, bg) {
    const base = THEMES[baseKey] || THEMES.tech;
    const want = bg || (base.dark ? 'dark' : 'light');
    let key;
    if (want === 'dark') key = base.dark ? baseKey : baseKey + '__dark';
    else if (want === 'combined') key = baseKey + '__combo';
    else key = base.dark ? baseKey + '__light' : baseKey;
    window.PresaData.ensureTheme(key);
    return { key, theme: THEMES[key] };
  }

  /* ---------- modes ---------- */
  const MODES = [
    { id: 'ai', icon: I.spark, title: 'Создать с помощью ИИ', desc: 'Вставьте любой текст — описание проекта, КП, ТЗ, преимущества или идею. ИИ разберёт его на структуру слайдов, а вы её подтвердите.', go: 'Вставить текст' },
    { id: 'paste', icon: I.textT, title: 'Вставить свой текст', desc: 'Подходит, если у вас уже есть готовый материал. Сервис разделит текст на слайды и оформит его.', go: 'Вставить и разбить на слайды' },
    { id: 'preset', icon: I.layers, title: 'Готовый сценарий', desc: 'Соберём структуру под типовую задачу — вам останется заменить примеры на свой контент.', go: 'Выбрать тип презентации' },
    { id: 'blank', icon: I.plus, title: 'С чистого листа', desc: 'Пустой проект. Добавляйте слайды из библиотеки дизайнов вручную, в своём темпе.', go: 'Открыть пустой редактор' }
  ];

  /* ---------- design directions (mapped to themes) ---------- */
  const DESIGNS = [
    { id: 'corporate-white', name: 'Corporate White', themeKey: 'corporate', bg: 'light', cat: 'corp', badge: { text: 'Самый популярный', tone: 'pop' }, short: 'Для коммерческих предложений и отчётов', desc: 'Строгий белый корпоративный стиль для отчётов, КП и встреч с руководством.', goodFor: ['Коммерческих предложений', 'Тендеров и гос. закупок', 'Отчётов и презентаций', 'Презентаций для руководства'] },
    { id: 'dark-premium', name: 'Dark Premium', themeKey: 'premium', bg: 'dark', cat: 'dark', badge: { text: 'Премиум', tone: 'new' }, short: 'Для стратегий и презентаций высокого уровня', desc: 'Тёмный премиальный стиль для pitch deck, стратегии и презентаций высокого уровня.', goodFor: ['Pitch deck и стратегий', 'Презентаций высокого уровня', 'Инвесторских материалов'] },
    { id: 'tech-blue', name: 'Tech Blue', themeKey: 'blue', bg: 'light', cat: 'saas', badge: { text: 'Для SaaS и IT', tone: 'info' }, short: 'Для SaaS, IT-компаний и цифровых продуктов', desc: 'Технологичный стиль для IT, SaaS, автоматизации и цифровых решений.', goodFor: ['SaaS и IT-продуктов', 'Цифровых решений', 'Продуктовых демо', 'Технических презентаций'] }
  ];
  const STYLE_FILTERS = [];
  const BADGE_TONE = {
    pop: { bg: '#FFF3DC', fg: '#9A6A00', bd: '#F1DCA6', icon: I.spark },
    new: { bg: '#15181F', fg: '#fff', bd: '#15181F', icon: I.spark },
    info: { bg: '#E8F0FE', fg: '#1D4ED8', bd: '#CBDBFB', icon: I.layers },
    green: { bg: '#E7F4EC', fg: '#1F7A4D', bd: '#C5E6D3', icon: I.shield },
    violet: { bg: '#F1ECFD', fg: '#6D44C7', bd: '#DDD2F7', icon: I.palette },
    orange: { bg: '#FDEEE2', fg: '#B5530E', bd: '#F6D7BE', icon: I.chart },
    slate: { bg: '#EEF1F5', fg: '#48515E', bd: '#DCE1E8', icon: I.info }
  };

  /* ---------- presentation types → category flows ---------- */
  const TYPES = [
    { id: 'commercial', name: 'Коммерческое предложение', desc: 'Услуги, пакеты, условия', flow: ['title', 'about_company', 'problem', 'solution', 'services', 'benefits', 'pricing', 'process', 'contact'] },
    { id: 'product', name: 'Презентация продукта', desc: 'Проблема, решение, выгоды', flow: ['title', 'problem', 'solution', 'benefits', 'numbers', 'case_study', 'pricing', 'contact'] },
    { id: 'report', name: 'Отчёт для руководства', desc: 'Цифры, итоги, планы', flow: ['title', 'agenda', 'numbers', 'benefits', 'comparison', 'roadmap', 'contact'] },
    { id: 'project', name: 'Презентация проекта', desc: 'Контекст, этапы, команда', flow: ['title', 'about_company', 'problem', 'solution', 'process', 'roadmap', 'team', 'contact'] },
    { id: 'pitch', name: 'Pitch deck', desc: 'Рынок, продукт, рост', flow: ['title', 'problem', 'solution', 'numbers', 'benefits', 'case_study', 'team', 'roadmap', 'contact'] },
    { id: 'edu', name: 'Обучающая презентация', desc: 'Тема, разбор, итоги', flow: ['title', 'agenda', 'about_company', 'solution', 'process', 'benefits', 'contact'] },
    { id: 'case', name: 'Кейсовая презентация', desc: 'Задача, подход, результат', flow: ['title', 'about_company', 'problem', 'solution', 'numbers', 'case_study', 'contact'] },
    { id: 'free', name: 'Свободная тема', desc: 'Гибкая базовая структура', flow: ['title', 'agenda', 'solution', 'benefits', 'numbers', 'contact'] }
  ];

  const TONES = [
    { id: 'strict', label: 'Строгий' }, { id: 'sales', label: 'Продающий' },
    { id: 'expert', label: 'Экспертный' }, { id: 'simple', label: 'Простой' }, { id: 'premium', label: 'Премиальный' }
  ];

  const CAT_DESC = {
    title: 'Обложка с названием и подзаголовком', agenda: 'План презентации — о чём пойдёт речь',
    about_company: 'Кто вы и чем занимаетесь', problem: 'Проблема и контекст аудитории',
    solution: 'Ваше решение и как оно работает', services: 'Перечень продуктов или услуг',
    benefits: 'Что получает клиент — ключевые выгоды', numbers: 'Доказательства в цифрах',
    case_study: 'История клиента и результат', process: 'Как устроена работа по шагам',
    pricing: 'Тарифы и условия', comparison: 'Сравнение с альтернативой',
    roadmap: 'Этапы развития во времени', team: 'Люди за проектом', contact: 'Призыв к действию и контакты'
  };
  const VISUAL = {
    title_hero: 'Заголовок', split_accent: 'Сплит-обложка', title_dark: 'Тёмная обложка',
    title_center: 'Центр-обложка', title_band: 'Панель-обложка', title_minimal: 'Минимал-обложка',
    title_image_full: 'Фото-обложка', title_image_split: 'Фото сбоку', title_sidebar: 'Вертикальная метка', title_editorial: 'Издательская обложка',
    bullets: 'Список тезисов', agenda: 'Нумерованный список', agenda_grid: 'Сетка пунктов', side_list: 'Сплит-список',
    cards: 'Карточки', text_stats: 'Текст + цифры', text_media: 'Текст + визуал', steps: 'Шаги',
    stats_row: 'Ряд метрик', big_stat: 'Крупная цифра', quote: 'Цитата', timeline: 'Таймлайн',
    text_bullets: 'Описание + пункты',
    pricing: 'Тарифы', compare: 'Таблица сравнения', team: 'Команда', cta: 'Призыв к действию'
  };

  /* ---------- plan builders ---------- */
  const splitLines = (t) => String(t || '').split(/\n+/).map((x) => x.replace(/^[-—•·\d.)\s]+/, '').trim()).filter(Boolean);

  function primaryTextKey(tpl) {
    const defs = tpl.requiredFields || [];
    const t = defs.find((d) => d.key === 'title');
    if (t) return 'title';
    const any = defs.find((d) => d.type === 'text' || d.type === 'textarea');
    return any ? any.key : null;
  }
  // main body-text field (the slide's «основной текст»): a textarea, else subtitle
  function mainTextKey(tpl) {
    const defs = [...(tpl.requiredFields || []), ...(tpl.optionalFields || [])];
    const ta = defs.find((d) => d.type === 'textarea');
    if (ta) return ta.key;
    const sub = defs.find((d) => d.key === 'subtitle');
    return sub ? 'subtitle' : null;
  }
  // primary bullet list field («пункты»): a plain list that isn't tier features
  function listKey(tpl) {
    const defs = [...(tpl.requiredFields || []), ...(tpl.optionalFields || [])];
    const l = defs.find((d) => d.type === 'list' && d.key !== 'features');
    return l ? l.key : null;
  }
  function planTitle(tpl, fields, cat) {
    return fields.title || fields.statValue || fields.quote || Lib.categoryLabel(cat);
  }
  function mkPlan(tpl, cat, fields) {
    return {
      uid: window.CX.uid(), templateId: tpl.id, category: cat, fields,
      title: planTitle(tpl, fields, cat), desc: CAT_DESC[cat] || tpl.description,
      visual: VISUAL[tpl.layoutType] || 'Контент', layout: tpl.layoutType
    };
  }

  // resize a category flow to a target slide count, keeping cover first + contact last
  function adjustFlow(flow, target) {
    const pool = ['benefits', 'numbers', 'case_study', 'process', 'comparison', 'roadmap', 'services', 'team', 'pricing'];
    let f = flow.slice();
    target = clamp(target, 5, 16);
    while (f.length > target && f.length > 2) f.splice(f.length - 2, 1);     // trim from before contact
    let pi = 0;
    while (f.length < target && pi < pool.length) {
      if (!f.includes(pool[pi])) f.splice(f.length - 1, 0, pool[pi]);
      pi++;
      if (pi >= pool.length) pi = 0, f.splice(f.length - 1, 0, 'benefits');
    }
    return f;
  }

  function buildAiPlan(data) {
    const b = data.brief;
    const type = TYPES.find((t) => t.id === data.ptype) || TYPES[0];
    const flow = adjustFlow(type.flow, b.slideCount || type.flow.length);
    const bobj = { companyName: b.company, industry: b.industry, targetAudience: b.audience, offer: b.offer, goal: b.goal, slideCount: flow.length };
    const probLines = splitLines(b.problem);
    const proofLines = splitLines(b.proofs);
    return flow.map((cat) => {
      const tpl = Lib.byCategory(cat)[0];
      const fields = window.PresaAI.autofillFromBrief(tpl, bobj);
      if (cat === 'problem' && probLines.length && Array.isArray(fields.bullets)) fields.bullets = probLines.slice(0, 5);
      if (cat === 'solution' && b.offer && b.offer.trim()) { if ('text' in fields) fields.text = b.offer.trim(); }
      if ((cat === 'benefits' || cat === 'numbers') && proofLines.length && Array.isArray(fields.bullets)) fields.bullets = proofLines.slice(0, 5);
      return mkPlan(tpl, cat, fields);
    });
  }
  function buildPresetPlan(data) {
    const type = TYPES.find((t) => t.id === data.ptype) || TYPES[0];
    return type.flow.map((cat) => {
      const tpl = Lib.byCategory(cat)[0];
      return mkPlan(tpl, cat, window.CX.remapFields(tpl, tpl.sample || {}));
    });
  }

  /* Starter deck for a chosen style: a complete, coherent presentation
     in that style, opened straight in the editor. Cover copy is seeded
     from the style so the deck matches the card the user clicked. */
  const STARTER_COPY = {
    'corporate-white': { eyebrow: 'PRESA', title: 'Стратегические решения для роста вашего бизнеса', subtitle: 'Практические подходы и инструменты для устойчивого развития' },
    'graphite-mono': { eyebrow: 'ANALYTICS', title: 'Данные. Анализ. Решения.', subtitle: 'Строгая аналитика и research-отчёты с акцентом на факты' },
    'dark-premium': { eyebrow: 'PREMIUM', title: 'Технологии, которые двигают бизнес вперёд', subtitle: 'Передовые решения для повышения эффективности и роста' },
    'midnight-indigo': { eyebrow: 'PRODUCT', title: 'Продукт, который масштабируется', subtitle: 'Платформа нового поколения для продуктовых команд' },
    'tech-blue': { eyebrow: 'TECH', title: 'Сервисы нового поколения для вашего бизнеса', subtitle: 'Масштабируемые решения для автоматизации и роста эффективности' },
    'ocean-teal': { eyebrow: 'SERVICE', title: 'Сервис, которому доверяют', subtitle: 'Цифровые решения для медицины, экологии и сервисных компаний' },
    'studio-violet': { eyebrow: 'STUDIO', title: 'Креатив без границ', subtitle: 'Для агентств, дизайна и медиа — выразительно и по делу' },
    'red-enterprise': { eyebrow: 'ENTERPRISE', title: 'Надёжность. Опыт. Результат.', subtitle: 'Комплексные решения для тендеров и государственных закупок' },
    'emerald-finance': { eyebrow: 'FINANCE', title: 'Финансовый рост под контролем', subtitle: 'Аналитика, прогнозирование и устойчивое развитие капитала' },
    'minimal-consulting': { eyebrow: 'CONSULTING', title: 'Фокус на главном. Ничего лишнего.', subtitle: 'Стратегические решения для сложных задач и устойчивого роста' },
    'editorial-sand': { eyebrow: 'EDITORIAL', title: 'Истории, которые продают бренд', subtitle: 'Издательский подход к имиджевым и брендовым презентациям' },
    'industrial': { eyebrow: 'INDUSTRIAL', title: 'Индустриальные решения для сложных задач', subtitle: 'Надёжные технологии и опыт реализации проектов любой сложности' }
  };
  function buildStarterDeck(design) {
    const flow = ['title', 'about_company', 'solution', 'benefits', 'numbers', 'contact'];
    const cover = (design && STARTER_COPY[design.id]) || null;
    return flow.map((cat) => {
      const list = Lib.byCategory(cat);
      const tpl = (list && list[0]) || Lib.byId('title-01');
      const fields = window.CX.remapFields(tpl, tpl.sample || {});
      if (cat === 'title' && cover) {
        if ('title' in fields) fields.title = cover.title;
        if ('subtitle' in fields) fields.subtitle = cover.subtitle;
        if ('eyebrow' in fields) fields.eyebrow = cover.eyebrow;
      }
      return mkPlan(tpl, cat, fields);
    });
  }

  function parsePaste(text) {
    const t = String(text || '').trim();
    if (!t) return [];
    let chunks;
    if (/Слайд\s*\d+\s*[:.)\-–]/i.test(t)) {
      chunks = t.split(/\n?\s*Слайд\s*\d+\s*[:.)\-–]\s*/i).map((s) => s.trim()).filter(Boolean);
    } else {
      chunks = t.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
      if (chunks.length < 2) chunks = t.split(/\n/).map((s) => s.trim()).filter(Boolean);
    }
    return chunks;
  }
  /* ---- slide blocks (one card = one slide) ---- */
  function mkBlock(title, body) {
    return { uid: window.CX.uid(), title: title || '', body: body || '' };
  }
  // a couple of empty cards so the block structure is visible immediately
  function defaultBlocks() {
    return [mkBlock('', ''), mkBlock('', ''), mkBlock('', '')];
  }
  // bulk-import: turn one pasted blob into separate slide cards
  function blocksFromText(text) {
    const chunks = parsePaste(text);
    if (!chunks.length) return [];
    return chunks.map((chunk) => {
      const lines = chunk.split(/\n/).map((x) => x.trim()).filter(Boolean);
      return mkBlock(lines[0] || '', lines.slice(1).join('\n'));
    });
  }
  function cleanBlocks(blocks) {
    return (blocks || [])
      .map((b) => ({ title: String(b.title || '').trim(), body: String(b.body || '').trim() }))
      .filter((b) => b.title || b.body);
  }
  function blocksFilled(blocks) { return cleanBlocks(blocks).length; }

  /* ---- content classifier: split a slide's body into semantic zones ----
     Returns { desc, bullets, metrics } so content lands in the right slot
     instead of everything becoming a bullet list. ---- */
  function asMetric(line) {
    const m = String(line).match(/^([+\-−–]?\d[\d\s.,]*\s*(?:%|\+|×|x|тыс\.?|млн|млрд|₽|руб\.?|k|m|шт\.?|раза?|балл[а-я]*)?)\s*[—\-–:.]?\s+(.{2,})$/iu);
    if (m && m[2] && /\d/.test(m[1])) return { value: m[1].trim(), label: m[2].trim() };
    return null;
  }
  function classifyBody(body) {
    const rawLines = String(body || '').split(/\n/).map((s) => s.trim()).filter(Boolean);
    const metrics = [], rest = [], marks = [];
    rawLines.forEach((line) => {
      const mk = /^[-—–•*·▪►▶○●]/.test(line) || /^\d+[.)]\s/.test(line);
      const clean = line.replace(/^[-—–•*·▪►▶○●]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
      const met = !mk ? asMetric(clean) : null;
      if (met) metrics.push(met);
      else { rest.push(clean); marks.push(mk); }
    });
    let desc = '', bullets = [];
    const anyMark = marks.some(Boolean);
    // a line is "prose" (description) when it reads like a sentence, not a list item
    const isProse = (s) => s.length >= 64 || (s.split(/\s+/).length >= 9 && /[.!?…»)]$/.test(s));
    if (anyMark) {
      let i = 0; const lead = [];
      for (; i < rest.length && !marks[i]; i++) lead.push(rest[i]);
      desc = lead.join(' ');
      bullets = rest.slice(i);
    } else if (rest.length <= 1) {
      desc = rest[0] || '';
    } else {
      let i = 0; const lead = [];
      for (; i < rest.length && isProse(rest[i]); i++) lead.push(rest[i]);
      if (i === 0) bullets = rest;            // no leading prose → pure list
      else { desc = lead.join(' '); bullets = rest.slice(i); }
    }
    return { desc: desc.trim(), bullets: bullets.map((b) => b.trim()).filter(Boolean), metrics };
  }

  function buildPastePlan(data) {
    const blocks = cleanBlocks(data.pasteSlides);
    if (!blocks.length) return buildPresetPlan({ ptype: 'free' });
    const out = [];
    const add = (id, cat, fields) => { const tpl = Lib.byId(id); if (tpl) out.push(mkPlan(tpl, cat, fields)); };
    blocks.forEach((b, i) => {
      // title field wins; otherwise borrow the first body line as the heading
      let head = b.title, body = b.body;
      if (!head) {
        const lines = body.split(/\n/).map((s) => s.trim()).filter(Boolean);
        head = lines.shift() || `Слайд ${i + 1}`;
        body = lines.join('\n');
      }
      const zone = classifyBody(body);
      const hasDesc = !!zone.desc, hasBul = zone.bullets.length > 0, hasMet = zone.metrics.length >= 2;

      if (i === 0) {
        // cover: title + lead line as subtitle
        add('title-01', 'title', { eyebrow: 'ПРЕЗЕНТАЦИЯ', title: head, subtitle: zone.desc || zone.bullets[0] || data.deckTitle || '', footerLabel: '' });
        return;
      }
      if (hasMet && !hasDesc && !hasBul) {
        // pure metrics → a row of stats
        add('numbers-01', 'numbers', { title: head, stats: zone.metrics.slice(0, 4) });
      } else if (hasDesc && hasMet) {
        // description + metrics → text + stats
        add('benefits-03', 'benefits', { title: head, text: zone.desc, stats: zone.metrics.slice(0, 3) });
      } else if (hasDesc && hasBul) {
        // description paragraph + supporting bullets (the headline case)
        add('solution-05', 'solution', { title: head, text: zone.desc, bullets: zone.bullets.slice(0, 6) });
      } else if (hasDesc) {
        // description only → clean text block, no forced list
        add('solution-05', 'solution', { title: head, text: zone.desc, bullets: [] });
      } else if (hasBul) {
        // short list items → bullet layout
        add('solution-02', 'solution', { title: head, bullets: zone.bullets.slice(0, 6) });
      } else {
        // nothing but a heading → section divider
        add('title-04', 'title', { eyebrow: 'РАЗДЕЛ ' + String(i).padStart(2, '0'), title: head, subtitle: '' });
      }
    });
    return out;
  }

  /* ============================================================
     PROMPT MANAGER — raw text → analyzed slide plan
     Heuristic local "AI": segments the text, classifies each
     segment into a slide category, and fills templates from the
     user's own words. Never invents metrics — numbers come only
     from values actually present in the text.
     ============================================================ */
  const PROMPT_EXAMPLE = [
    'Nordwave — платформа для автоматизации коммерческих предложений.',
    '',
    'Проблема',
    'Менеджеры тратят до 8 часов в неделю на ручную сборку КП. Качество скачет от человека к человеку, нет единого стиля, а сделки простаивают в ожидании материалов.',
    '',
    'Решение',
    'Конструктор КП с готовыми блоками автоматизирует рутину и приводит оформление к единому стандарту.',
    'Автоподстановка цен и условий',
    'Шаблоны под отрасль клиента',
    'Экспорт в PDF и PPTX за минуту',
    '',
    'Преимущества',
    'Экономия времени команды на рутине',
    'Единый корпоративный стандарт оформления',
    'Прозрачная аналитика по отправленным КП',
    '',
    'Результаты',
    '−55% времени на подготовку КП',
    '+30% к конверсии в сделку',
    '120+ компаний уже используют Nordwave',
    '',
    'Как начать',
    'Бесплатный доступ на 14 дней без привязки карты.'
  ].join('\n');

  // numbered section header, e.g. "02   О проекте" or "1) Заголовок"
  const NUM_HEAD = /^\d{1,2}(?:[.)]|\s{2,})\s*[«"A-Za-zА-ЯЁа-яё]/;
  // a line that reads like a section header (short, no terminal punctuation, or "Заголовок:")
  function looksHeader(line) {
    const s = String(line || '').trim();
    if (!s) return false;
    if (s.indexOf('\t') >= 0) return false;        // tabbed line = table row, not a header
    if (/^#{1,3}\s+/.test(s)) return true;
    if (/^Слайд\s*\d+/i.test(s)) return true;
    if (NUM_HEAD.test(s) && s.length <= 64) return true;
    if (/:\s*$/.test(s) && s.length <= 80) return true;
    return s.length <= 56 && s.split(/\s+/).length <= 8 && !/[.!?…,;]$/.test(s);
  }
  const stripHead = (s) => String(s || '')
    .replace(/^#{1,3}\s*/, '')
    .replace(/^Слайд\s*\d+\s*[:.)\-–]?\s*/i, '')
    .replace(/^\d{1,2}(?:[.)]\s+|\s{2,})/, '')
    .replace(/:\s*$/, '').trim();

  // segment raw text into [{ head, body }]
  function segmentPrompt(text) {
    let raw = String(text || '').replace(/\r/g, '').trim();
    if (!raw) return [];
    let paras = raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    const segs = [];
    paras.forEach((p) => {
      const lines = p.split(/\n/).map((s) => s.trim()).filter(Boolean);
      if (lines.length > 1 && looksHeader(lines[0])) segs.push({ head: stripHead(lines[0]), body: lines.slice(1).join('\n') });
      else if (lines.length === 1 && looksHeader(lines[0])) segs.push({ head: stripHead(lines[0]), body: '' });
      else segs.push({ head: '', body: lines.join('\n') });
    });
    // if the user pasted one undivided wall of text, sentence-group it into 4–6 segments
    const headed = segs.filter((s) => s.head).length;
    if (segs.length <= 2 && headed === 0) {
      const blob = segs.map((s) => s.body).join(' ');
      const sents = blob.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
      if (sents.length >= 4) {
        const title = sents[0];
        const rest = sents.slice(1);
        const groups = Math.min(5, Math.max(3, Math.round(rest.length / 2)));
        const per = Math.ceil(rest.length / groups);
        const out = [{ head: '', body: title }];
        for (let i = 0; i < rest.length; i += per) out.push({ head: '', body: rest.slice(i, i + per).join(' ') });
        return out;
      }
    }
    return segs;
  }

  // pull metric pairs from arbitrary text (value + label) — only from real numbers
  function extractMetrics(text) {
    const out = [], seen = new Set();
    String(text || '').split(/\n|(?<=[.!?…])\s+|[•;]+/).forEach((line) => {
      const clean = String(line).trim().replace(/^[-—–•*·▪►▶○●]\s*/, '').replace(/^\d+[.)]\s*/, '');
      const m = asMetric(clean);
      if (m) { const k = m.value + '|' + m.label; if (!seen.has(k)) { seen.add(k); out.push(m); } }
    });
    return out;
  }

  // keyword → slide category
  const SECTION_KW = [
    { cat: 'agenda', re: /(содержани|повестк|план презентац|о ч[её]м|agenda)/i },
    { cat: 'problem', re: /(проблем|бол[ьи]\b|сложност|труднос|тер(я|яе)т|тратят|неэффект|риск|вызов|боль клиент|pain)/i },
    { cat: 'solution', re: /(решени|предлага|как (это )?работает|подход|алгоритм|механик|реализ)/i },
    { cat: 'services', re: /(услуг|направлени|что входит|спектр|перечень|ассортимент|продукт(ы|ов)?\b)/i },
    { cat: 'benefits', re: /(преимуществ|выгод|польз|получает|ценност|почему мы|зачем|сильны)/i },
    { cat: 'numbers', re: /(результат|цифр|метрик|показател|статистик|достижени|итог|kpi|эффект)/i },
    { cat: 'process', re: /(этап|шаг|процесс|как мы работаем|план работ|дорожн|roadmap|сроки|внедрен)/i },
    { cat: 'about_company', re: /(о компании|о нас|кто мы|наша компания|основан|на рынке с|наш опыт|миссия)/i },
    { cat: 'team', re: /(команд|сотрудник|эксперт|специалист|основател)/i },
    { cat: 'pricing', re: /(цен[аы]|тариф|стоимост|прайс|бюджет|оплат|условия сотруд)/i },
    { cat: 'comparison', re: /(сравнени|конкурент|в отличие|\bvs\b|против\b|альтернатив)/i },
    { cat: 'contact', re: /(контакт|связат|как начать|с чего начать|призыв|напишите|позвоните|демо|заявк|следующий шаг)/i }
  ];
  function classifyCategory(head, body) {
    const t = ((head || '') + ' \n ' + (body || '')).toLowerCase();
    for (const s of SECTION_KW) if (s.re.test(t)) return s.cat;
    return null;
  }

  // category + content-shape → [templateId, fields]
  function fieldsForCat(cat, head, zone) {
    const d = zone.desc, b = zone.bullets, m = zone.metrics;
    switch (cat) {
      case 'agenda': return ['agenda-01', { title: head || 'Содержание', items: (b.length ? b : splitLines(d)).slice(0, 6) }];
      case 'problem':
        if (b.length) return d ? ['problem-07', { title: head, text: d, bullets: b.slice(0, 5) }] : ['problem-01', { title: head, bullets: b.slice(0, 5) }];
        return d ? ['problem-07', { title: head, text: d, bullets: [] }] : ['problem-02', { quote: head, author: '' }];
      case 'solution':
        if (d && b.length) return ['solution-05', { title: head, text: d, bullets: b.slice(0, 6) }];
        if (b.length) return ['solution-02', { title: head, bullets: b.slice(0, 6) }];
        return ['solution-01', { title: head, text: d || head, imageLabel: 'Визуал решения' }];
      case 'services':
        if (b.length) return ['services-02', { title: head, bullets: b.slice(0, 6) }];
        return ['solution-01', { title: head, text: d || head, imageLabel: 'Визуал' }];
      case 'benefits':
        if (d && m.length >= 2) return ['benefits-03', { title: head, text: d, stats: m.slice(0, 3) }];
        if (b.length) return d ? ['benefits-04', { title: head, text: d, bullets: b.slice(0, 5) }] : ['benefits-02', { title: head, bullets: b.slice(0, 5) }];
        return ['benefits-02', { title: head, bullets: b.length ? b : [d].filter(Boolean) }];
      case 'numbers':
        if (m.length >= 2) return ['numbers-01', { title: head, stats: m.slice(0, 4) }];
        if (m.length === 1) return ['numbers-02', { statValue: m[0].value, statLabel: m[0].label, bullets: b.slice(0, 3) }];
        return ['benefits-02', { title: head, bullets: b.length ? b.slice(0, 5) : [d].filter(Boolean) }];
      case 'process':
        if (b.length) return ['process-02', { title: head, steps: b.slice(0, 5).map((x) => { const mm = String(x).split(/\s*[—:–]\s*/); return { title: (mm[0] || x).trim().slice(0, 40), desc: mm.slice(1).join(' ').trim() }; }) }];
        return ['solution-01', { title: head, text: d || head, imageLabel: 'Схема процесса' }];
      case 'about_company':
        if (m.length >= 2) return ['about-company-02', { title: head, text: d || head, stats: m.slice(0, 4) }];
        if (b.length) return ['about-company-01', { title: head, bullets: b.slice(0, 5) }];
        return ['about-company-08', { title: head, text: d || head, imageLabel: 'Фото' }];
      case 'team':
        if (m.length >= 2) return ['team-03', { title: head, text: d || head, stats: m.slice(0, 3) }];
        return ['about-company-08', { title: head, text: d || head, imageLabel: 'Фото команды' }];
      case 'comparison':
        return ['comparison-03', { title: head, bullets: (b.length ? b : [d].filter(Boolean)).slice(0, 5) }];
      case 'pricing':
        if (m.length) return ['pricing-03', { statValue: m[0].value, statLabel: m[0].label, bullets: b.slice(0, 4) }];
        return ['solution-02', { title: head, bullets: (b.length ? b : [d].filter(Boolean)).slice(0, 6) }];
      case 'contact':
        return ['contact-01', { eyebrow: 'СЛЕДУЮЩИЙ ШАГ', title: head || 'Следующий шаг', subtitle: d || '', bullets: (b.length ? b : ['Свяжитесь с нами, чтобы начать']).slice(0, 3), buttonLabel: 'Обсудить проект' }];
      default: return null;
    }
  }
  // fallback when no category keyword matched — route by content shape
  function shapeForBlock(head, zone) {
    const hasDesc = !!zone.desc, hasBul = zone.bullets.length > 0, hasMet = zone.metrics.length >= 2;
    if (hasMet && !hasDesc && !hasBul) return ['numbers', 'numbers-01', { title: head, stats: zone.metrics.slice(0, 4) }];
    if (hasDesc && hasMet) return ['benefits', 'benefits-03', { title: head, text: zone.desc, stats: zone.metrics.slice(0, 3) }];
    if (hasDesc && hasBul) return ['solution', 'solution-05', { title: head, text: zone.desc, bullets: zone.bullets.slice(0, 6) }];
    if (hasDesc) return ['solution', 'solution-05', { title: head, text: zone.desc, bullets: [] }];
    if (hasBul) return ['solution', 'solution-02', { title: head, bullets: zone.bullets.slice(0, 6) }];
    return ['solution', 'solution-01', { title: head, text: head, imageLabel: 'Визуал' }];
  }

  function buildPromptPlan(data) {
    const segs = segmentPrompt(data.promptText);
    if (!segs.length) return buildPresetPlan({ ptype: 'free' });

    const mk = (id, cat, fields) => { const tpl = Lib.byId(id); return tpl ? mkPlan(tpl, cat, fields) : null; };

    // cover from the first segment
    const cover = segs[0];
    const coverTitle = (cover.head || (cover.body.split(/(?<=[.!?…])\s+/)[0]) || data.deckTitle || 'Презентация').trim();
    const coverSub = (cover.head ? (cover.body.split(/\n/)[0] || '') : cover.body.split(/(?<=[.!?…])\s+/).slice(1).join(' ')).trim();
    const out = [mk('title-01', 'title', { eyebrow: 'ПРЕЗЕНТАЦИЯ', title: coverTitle.slice(0, 60), subtitle: coverSub.slice(0, 90), footerLabel: '' })];

    let contactItem = null, hasNumbers = false;
    segs.slice(1).forEach((seg, idx) => {
      const head = (seg.head || seg.body.split(/\n/)[0] || ('Слайд ' + (idx + 2))).trim();
      const body = seg.head ? seg.body : seg.body.split(/\n/).slice(1).join('\n');
      const zone = classifyBody(body || seg.body);
      const cat = classifyCategory(seg.head, seg.body);
      let id, real, fields;
      if (cat) { const r = fieldsForCat(cat, head.slice(0, 60), zone); if (r) { id = r[0]; real = cat; fields = r[1]; } }
      if (!id) { const r = shapeForBlock(head.slice(0, 60), zone); real = r[0]; id = r[1]; fields = r[2]; }
      const item = mk(id, real, fields);
      if (!item) return;
      if (real === 'numbers') hasNumbers = true;
      if (real === 'contact') { contactItem = item; return; }
      out.push(item);
    });

    // global metrics → a dedicated numbers slide (only from real values found in text)
    if (!hasNumbers) {
      const mets = extractMetrics(data.promptText);
      if (mets.length >= 3) out.push(mk('numbers-01', 'numbers', { title: 'Ключевые цифры', stats: mets.slice(0, 4) }));
    }
    // always close on a call-to-action
    out.push(contactItem || mk('contact-01', 'contact', { eyebrow: 'СЛЕДУЮЩИЙ ШАГ', title: 'Следующий шаг', subtitle: 'Готовы обсудить ваш проект', bullets: ['Свяжитесь с нами, чтобы начать'], buttonLabel: 'Обсудить проект' }));

    return out.filter(Boolean);
  }

  /* ============================================================
     SMART AI — real model call (window.claude.complete)
     Sends the raw text to the model, which REWRITES it into clean
     slide copy (punchy tezisy, proper headings) and returns a JSON
     structure. We map that onto real templates. Falls back to the
     local heuristic (buildPromptPlan) if the model is unavailable
     or returns something we can't parse. Numbers are never invented:
     the model is told to use only figures present in the source.
     ============================================================ */
  const AI_CATS = ['agenda', 'problem', 'solution', 'services', 'benefits', 'numbers', 'process', 'about_company', 'team', 'comparison', 'pricing', 'contact'];
  const AI_CAT_SET = new Set(AI_CATS);

  // pull the first {...} JSON object out of a model reply (handles ```json fences / chatter)
  function safeJsonObject(raw) {
    let s = String(raw || '').trim();
    if (!s) return null;
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a === -1 || b === -1 || b <= a) return null;
    let body = s.slice(a, b + 1);
    try { return JSON.parse(body); } catch (e) {}
    // tolerate trailing commas
    try { return JSON.parse(body.replace(/,\s*([}\]])/g, '$1')); } catch (e) {}
    return null;
  }

  // a model slide → the {desc, bullets, metrics} zone fieldsForCat expects
  function zoneFromAi(s) {
    const bullets = (Array.isArray(s.bullets) ? s.bullets : []).map((x) => String(x || '').trim()).filter(Boolean);
    const metrics = (Array.isArray(s.stats) ? s.stats : [])
      .map((m) => ({ value: String((m && m.value) || '').trim(), label: String((m && m.label) || '').trim() }))
      .filter((m) => m.value && m.label && /\d/.test(m.value));
    return { desc: String(s.text || '').trim(), bullets, metrics };
  }

  function aiPromptFor(text, deckTitle) {
    const cats = AI_CATS.join(', ');
    return [
      'Ты — редактор презентаций. На вход — сырой текст о проекте, продукте, услуге или КП.',
      'Преврати его в структуру слайдов делового выступления. Это НЕ дословный перенос текста — ты переписываешь и сокращаешь.',
      '',
      'Правила:',
      '1. Пиши на русском, деловой, ясный тон. Каждый пункт — короткий тезис (до 9 слов), без воды и вводных слов.',
      '2. НЕ копируй предложения из текста как есть — переформулируй в тезисы. Нормализуй («Вариант 1» → «Вариант 1», а не «вариант один»; раскрывай смысл, исправляй грамматику).',
      '3. Заголовок каждого слайда — ёмкий, до 6 слов.',
      '4. НЕ выдумывай цифры, факты и проценты. В stats и тезисы попадают только числа, реально присутствующие в исходном тексте. Если чисел нет — не добавляй слайд numbers.',
      '5. 5–8 содержательных слайдов. Логичный порядок: проблема → решение → выгоды → цифры → процесс → призыв. Последний слайд — type "contact" (призыв к действию).',
      '6. Поле type строго одно из: ' + cats + '.',
      '7. bullets — массив из 3–5 тезисов (для слайдов-списков). text — одно короткое предложение-подводка (необязательно). stats — массив {value,label} только для type numbers/benefits и только из реальных чисел.',
      '',
      'Верни СТРОГО JSON без markdown и пояснений в формате:',
      '{"title":"Короткое название (2–5 слов)","subtitle":"Одно предложение-подзаголовок","slides":[{"type":"problem","title":"...","text":"...","bullets":["...","..."],"stats":[{"value":"−55%","label":"времени на КП"}]}]}',
      '',
      (deckTitle && deckTitle.trim() ? 'Желаемое название презентации: ' + deckTitle.trim() : ''),
      'Исходный текст:',
      '"""',
      String(text || '').slice(0, 5000),
      '"""'
    ].filter(Boolean).join('\n');
  }

  async function callPromptLLM(text, deckTitle) {
    if (!(window.claude && typeof window.claude.complete === 'function')) return null;
    let raw;
    try {
      raw = await window.claude.complete({ messages: [{ role: 'user', content: aiPromptFor(text, deckTitle) }] });
    } catch (e) { return null; }
    const parsed = safeJsonObject(raw);
    if (!parsed || !Array.isArray(parsed.slides) || !parsed.slides.length) return null;
    return parsed;
  }

  async function buildPromptPlanAI(data) {
    const parsed = await callPromptLLM(data.promptText, data.deckTitle);
    if (!parsed) return buildPromptPlan(data); // graceful fallback to heuristic

    const mk = (id, cat, fields) => { const tpl = Lib.byId(id); return tpl ? mkPlan(tpl, cat, fields) : null; };
    const coverTitle = (String(data.deckTitle || '').trim() || String(parsed.title || '').trim() || 'Презентация').slice(0, 60);
    const coverSub = String(parsed.subtitle || '').trim().slice(0, 90);
    const out = [mk('title-01', 'title', { eyebrow: 'ПРЕЗЕНТАЦИЯ', title: coverTitle, subtitle: coverSub, footerLabel: '' })];

    let hasContact = false;
    (parsed.slides || []).slice(0, 9).forEach((s, i) => {
      if (!s || typeof s !== 'object') return;
      const head = (String(s.title || '').trim() || ('Слайд ' + (i + 2))).slice(0, 60);
      const zone = zoneFromAi(s);
      if (!zone.desc && !zone.bullets.length && !zone.metrics.length) return; // empty slide → skip
      const cat = String(s.type || '').toLowerCase().trim();
      let id, real, fields;
      if (AI_CAT_SET.has(cat)) { const r = fieldsForCat(cat, head, zone); if (r) { id = r[0]; real = cat; fields = r[1]; } }
      if (!id) { const r = shapeForBlock(head, zone); real = r[0]; id = r[1]; fields = r[2]; }
      const item = mk(id, real, fields);
      if (!item) return;
      if (real === 'contact') hasContact = true;
      out.push(item);
    });

    if (!hasContact) {
      out.push(mk('contact-01', 'contact', { eyebrow: 'СЛЕДУЮЩИЙ ШАГ', title: 'Следующий шаг', subtitle: 'Готовы обсудить ваш проект', bullets: ['Свяжитесь с нами, чтобы начать'], buttonLabel: 'Обсудить проект' }));
    }
    return out.filter(Boolean).length > 1 ? out.filter(Boolean) : buildPromptPlan(data);
  }

  /* ============================================================
     TABLE DETECTION — tab / pipe / wide-space rows → table fields
     Lets pasted tables survive as real tables instead of being
     flattened into bullet lists or dropped. Used by the faithful
     ("сохранить весь текст") builder.
     ============================================================ */
  function rowCells(line) {
    const s = String(line || '');
    if (s.indexOf('\t') >= 0) return s.split(/\t+/).map((c) => c.trim());
    if (s.split('|').length >= 3) return s.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
    if (/\S {3,}\S/.test(s)) return s.split(/ {3,}/).map((c) => c.trim());
    return null;
  }
  const isSepLine = (line) => /^[\s|:\-–—+=]+$/.test(String(line || '')); // markdown |---|---|

  // drop low-value columns: a leading running-index, or a column of identical short cells (a repeated unit)
  function pruneColumns(grid) {
    if (grid.length < 2) return grid;
    const head = grid[0], data = grid.slice(1), n = head.length, keep = [];
    for (let c = 0; c < n; c++) {
      const cells = data.map((r) => String(r[c] || '').trim());
      const isIndex = c === 0 && /^(№|#|n|no|п\/п)?$/i.test(String(head[0] || '').trim()) && cells.every((x, i) => x === String(i + 1) || x === '');
      const allSame = cells.length > 1 && cells.every((x) => x && x === cells[0]);
      const shortUnit = allSame && cells.every((x) => x.length <= 3);
      if (isIndex || shortUnit) continue;
      keep.push(c);
    }
    if (keep.length < 2) return grid; // never over-prune below 2 columns
    return grid.map((r) => keep.map((c) => r[c]));
  }

  function detectTable(body) {
    const lines = String(body || '').split(/\n/).map((s) => s.replace(/\s+$/, '')).filter((s) => s.trim() && !isSepLine(s));
    if (lines.length < 3) return null;                 // need a header + at least 2 rows
    const parsed = lines.map(rowCells);
    const ok = parsed.filter((r) => r && r.length >= 2);
    if (ok.length < 3 || ok.length < lines.length * 0.6) return null;
    let cols = Math.max(...ok.map((r) => r.length));
    let grid = ok.map((r) => { const c = r.slice(); while (c.length < cols) c.push(''); return c; });
    grid = pruneColumns(grid);
    cols = grid[0].length;
    if (cols < 2) return null;
    if (cols > 3) grid = grid.map((r) => [r[0], r[r.length - 2], r[r.length - 1]]); // keep first + last two
    return grid;
  }
  function tableFieldsFrom(title, grid) {
    const head = grid[0], data = grid.slice(1), cols = head.length;
    const rows = data.map((r) => ({ c1: r[0] || '', c2: r[1] || '', c3: cols >= 3 ? (r[2] || '') : '' }));
    return { title: title || 'Таблица', h1: head[0] || '', h2: head[1] || '', h3: cols >= 3 ? (head[2] || '') : '', rows };
  }

  /* ============================================================
     FAITHFUL PLAN — "сохранить весь текст"
     Deterministic typesetter: keeps every section, every line and
     every table verbatim. Never rewrites or shortens. Overflowing
     lists are split across continuation slides instead of trimmed.
     ============================================================ */
  const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };
  const contTitle = (head, i) => i === 0 ? head : head + ' (продолжение)';

  function pushFaithfulContent(out, mk, head, zone) {
    const BCAP = 5; // bullet/list render cap → split beyond it
    const hasDesc = !!zone.desc, mets = zone.metrics, bullets = zone.bullets;
    if (mets.length >= 2 && !bullets.length && !hasDesc) {
      chunk(mets, 4).forEach((g, i) => out.push(mk('numbers-01', 'numbers', { title: contTitle(head, i), stats: g })));
      return;
    }
    if (!bullets.length) {
      if (mets.length >= 2) out.push(mk('benefits-03', 'benefits', { title: head, text: zone.desc, stats: mets.slice(0, 3) }));
      else out.push(mk('solution-05', 'solution', { title: head, text: zone.desc || head, bullets: [] }));
      return;
    }
    chunk(bullets, BCAP).forEach((g, i) => {
      const title = contTitle(head, i);
      if (i === 0 && hasDesc) out.push(mk('solution-05', 'solution', { title, text: zone.desc, bullets: g }));
      else out.push(mk('solution-02', 'solution', { title, bullets: g }));
    });
  }

  function buildFaithfulPlan(data) {
    const segs = segmentPrompt(data.promptText);
    if (!segs.length) return buildPromptPlan(data);
    const mk = (id, cat, fields) => { const tpl = Lib.byId(id); return tpl ? mkPlan(tpl, cat, fields) : null; };
    const out = [];
    // cover from the first segment
    const cover = segs[0];
    const coverTitle = (String(data.deckTitle || '').trim() || cover.head || (cover.body.split(/(?<=[.!?…])\s+/)[0]) || 'Презентация').trim();
    const coverSub = (cover.head ? (cover.body.split(/\n/)[0] || '') : cover.body.split(/(?<=[.!?…])\s+/).slice(1).join(' ')).trim();
    out.push(mk('title-01', 'title', { eyebrow: 'ПРЕЗЕНТАЦИЯ', title: coverTitle.slice(0, 80), subtitle: coverSub.slice(0, 140), footerLabel: '' }));

    segs.slice(1).forEach((seg, idx) => {
      const tbl = detectTable(seg.body);
      if (tbl) {
        const title = seg.head ? seg.head.trim() : 'Таблица';
        out.push(mk('table-01', 'table', tableFieldsFrom(title, tbl)));
        return;
      }
      const clean = (s) => String(s || '').replace(/[ \t]*\t[ \t]*/g, ' — ');
      const head = clean(seg.head || seg.body.split(/\n/)[0] || ('Слайд ' + (idx + 2))).trim();
      const body = clean(seg.head ? seg.body : seg.body.split(/\n/).slice(1).join('\n'));
      const zone = classifyBody(body);
      pushFaithfulContent(out, mk, head.slice(0, 70), zone);
    });
    return out.filter(Boolean);
  }

  function buildPlan(data) {
    if (data.mode === 'ai') return data.genMode === 'faithful' ? buildFaithfulPlan(data) : buildPromptPlan(data);
    if (data.mode === 'paste') return buildPastePlan(data);
    return buildPresetPlan(data);
  }
  function planToSlides(plan) {
    return plan.map((p) => ({ uid: p.uid, templateId: p.templateId, fields: p.fields, fontScale: 1 }));
  }

  /* ============================================================ COMPONENTS ============ */

  function Rail({ pipe, idx, onJump }) {
    const LABEL = { mode: 'Способ', design: 'Стиль', brand: 'Бренд', type: 'Тип', brief: 'Бриф', prompt: 'Текст', paste: 'Контент', structure: 'Структура' };
    const pct = Math.round(((idx + 1) / pipe.length) * 100);
    return h('div', { className: 'wz-rail' },
      h('div', { className: 'wz-rail__inner' },
        h('div', { className: 'wz-rail__steps' },
          pipe.map((s, i) => h('button', {
            key: s, className: 'wz-step' + (i === idx ? ' on' : '') + (i < idx ? ' done' : ''),
            disabled: i > idx, onClick: () => i < idx && onJump(i)
          },
            h('span', { className: 'wz-step__n' }, i < idx ? h(Svg, { d: I.check, s: 13, w: 2.6 }) : String(i + 1)),
            h('span', { className: 'wz-step__l' }, LABEL[s] || s),
            i < pipe.length - 1 ? h('span', { className: 'wz-step__bar' }) : null))),
        h('div', { className: 'wz-rail__prog' },
          h('span', { className: 'wz-rail__pct' }, pct + '% готово'),
          h('div', { className: 'wz-rail__track' }, h('div', { className: 'wz-rail__fill', style: { width: pct + '%' } })))));
  }

  function StepHead({ eyebrow, title, sub }) {
    return h('div', { className: 'wz-head' },
      h('div', { className: 'eyebrow' }, eyebrow),
      h('h1', null, title),
      sub ? h('p', null, sub) : null);
  }

  /* ---- MODE ---- */
  function ModeStep({ mode, onPick }) {
    return h('div', { className: 'wz-screen', 'data-screen-label': 'Способ создания' },
      h(StepHead, { eyebrow: 'ШАГ 1 · СПОСОБ', title: 'Как создаём презентацию?', sub: 'Выберите, с чего удобнее начать. Дальше сервис проведёт вас по шагам.' }),
      h('div', { className: 'wz-modes' },
        MODES.map((m) => h('button', {
          key: m.id, className: 'wz-modecard' + (mode === m.id ? ' on' : ''), onClick: () => onPick(m.id)
        },
          h('span', { className: 'wz-modecard__ic' }, h(Svg, { d: m.icon, s: 22 })),
          h('h3', null, m.title),
          h('p', null, m.desc),
          h('span', { className: 'wz-modecard__go' }, m.go, h(Svg, { d: I.chevR, s: 15 }))))));
  }

  /* ---- DESIGN ---- */
  /* ---- DESIGN / STYLE ---- */
  function coverIdFor(design) { return design.bg === 'dark' ? 'title-03' : 'title-02'; }
  function StyleMini({ design, id, brand }) {
    const tv = themeVariant(design.themeKey, design.bg);
    const tpl = Lib.byId(id) || Lib.byId('title-01');
    return h(window.CX.MiniSlide, { template: tpl, fields: tpl.sample || {}, theme: tv.theme, n: 1, total: 1, brand: brand || 'Presa' });
  }
  function StyleBadge({ badge }) {
    if (!badge) return null;
    const t = BADGE_TONE[badge.tone] || BADGE_TONE.slate;
    return h('span', { className: 'wz-sbadge', style: { background: t.bg, color: t.fg, borderColor: t.bd } },
      t.icon ? h(Svg, { d: t.icon, s: 12, w: 2.2 }) : null, badge.text);
  }
  function Swatches({ design }) {
    const t = THEMES[design.themeKey];
    return h('div', { className: 'wz-pal' }, [t.bg, t.title, t.accent, t.panel].map((c, i) => h('span', { key: i, style: { background: c } })));
  }
  function StyleCard({ design, selected, onSelect, onPreview, onQuickStart }) {
    const feat = design.badge && design.badge.tone === 'pop';
    return h('div', { className: 'wz-scard' + (selected ? ' on' : '') + (feat ? ' feat' : ''), onClick: () => onSelect(design.id) },
      h('div', { className: 'wz-scard__head' },
        h(StyleBadge, { badge: design.badge }),
        selected ? h('span', { className: 'wz-scard__sel' }, h(Svg, { d: I.check, s: 13, w: 3 }), 'Выбран') : null),
      h('div', { className: 'wz-scard__prev' }, h(window.CX.StyleShowcase, { design })),
      h(Swatches, { design }),
      h('h3', { className: 'wz-scard__name' }, design.name),
      h('p', { className: 'wz-scard__short' }, design.short),
      h('div', { className: 'wz-scard__foot' },
        onQuickStart ? h('button', { className: 'wz-scard__go', onClick: (e) => { e.stopPropagation(); onQuickStart(design.id); } },
          'Создать в этом стиле', h(Svg, { d: I.chevR, s: 14, w: 2.6 })) : null,
        h('button', { className: 'wz-scard__ex', onClick: (e) => { e.stopPropagation(); onPreview(design); } },
          'Пример')));
  }
  function StyleSidebar({ design }) {
    const t = THEMES[design.themeKey];
    return h('div', { className: 'wz-spanel' },
      h('div', { className: 'wz-spanel__lbl' }, 'Выбранный стиль'),
      h('div', { className: 'wz-spanel__prev' }, h(window.CX.StyleShowcase, { design })),
      h('h3', null, design.name),
      h('p', { className: 'wz-spanel__desc' }, design.desc),
      h('div', { className: 'wz-spanel__div' }),
      h('div', { className: 'wz-spanel__sec' }, 'Подходит для:'),
      h('ul', { className: 'wz-spanel__list' },
        (design.goodFor || []).map((g, i) => h('li', { key: i },
          h('span', { className: 'wz-spanel__ck' }, h(Svg, { d: I.check, s: 12, w: 3 })), g))),
      h('div', { className: 'wz-spanel__sec' }, 'Будет создано:'),
      h('ul', { className: 'wz-spanel__meta' },
        h('li', null, h(Svg, { d: I.layers, s: 15 }), '12–16 слайдов'),
        h('li', null, h(Svg, { d: I.textT, s: 15 }), 'Форматы: PPTX, PDF'),
        h('li', null, h(Svg, { d: I.palette, s: 15 }), 'Адаптация под бренд')),
      h('div', { className: 'wz-spanel__sec' }, 'Цветовая палитра'),
      h('div', { className: 'wz-spanel__pal' },
        h('div', { className: 'wz-pal' }, [t.bg, t.title, t.accent].map((c, i) => h('span', { key: i, style: { background: c } }))),
        h('span', { className: 'wz-spanel__palnote' }, 'и ещё 2 дополнительных')),
      h('div', { className: 'wz-tip' },
        h('div', { className: 'wz-tip__h' }, h(Svg, { d: I.spark, s: 13 }), 'Совет'),
        h('p', null, 'Стиль можно будет изменить на следующем шаге или позже в редакторе.')));
  }
  function StyleModal({ design, onClose }) {
    if (!design) return null;
    return h('div', { className: 'wz-smodal', onClick: onClose },
      h('div', { className: 'wz-smodal__box', onClick: (e) => e.stopPropagation() },
        h('div', { className: 'wz-smodal__head' },
          h('div', null, h('h3', null, design.name), h('span', null, design.short)),
          h('button', { className: 'wz-smodal__x', onClick: onClose }, h(Svg, { d: I.close, s: 16, w: 2.4 }))),
        h('div', { className: 'wz-smodal__grid' },
          h('div', { className: 'wz-smodal__slide' }, h(StyleMini, { design, id: coverIdFor(design) })),
          h('div', { className: 'wz-smodal__slide' }, h(StyleMini, { design, id: 'benefits-01' })),
          h('div', { className: 'wz-smodal__slide' }, h(StyleMini, { design, id: design.bg === 'dark' ? 'numbers-01' : 'about-company-02' })))));
  }
  function BlankCard({ onBlank }) {
    return h('div', { className: 'wz-scard wz-scard--blank', onClick: () => onBlank && onBlank() },
      h('div', { className: 'wz-scard__head' },
        h('span', { className: 'wz-sbadge', style: { background: '#EEF1F4', color: '#5B6573', borderColor: '#E2E5EA' } }, h(Svg, { d: I.plus, s: 12, w: 2.4 }), 'Свой дизайн')),
      h('div', { className: 'wz-blank__art' },
        h('span', { className: 'wz-blank__plus' }, h(Svg, { d: I.plus, s: 30, w: 2.1 }))),
      h('h3', { className: 'wz-scard__name' }, 'Чистый лист'),
      h('p', { className: 'wz-scard__short' }, 'Пустой проект — соберите презентацию сами из библиотеки готовых слайдов.'),
      h('div', { className: 'wz-scard__foot' },
        h('button', { className: 'wz-scard__go', onClick: (e) => { e.stopPropagation(); onBlank && onBlank(); } },
          'Начать с чистого листа', h(Svg, { d: I.chevR, s: 14, w: 2.6 }))));
  }
  function DesignStep({ designId, onSelect, onQuickStart, onBlank }) {
    const [preview, setPreview] = useState(null);
    const sel = DESIGNS.find((d) => d.id === designId) || DESIGNS[0];
    return h('div', { className: 'wz-screen wz-screen--full', 'data-screen-label': 'Выбор стиля' },
      h('div', { className: 'wz-shead' },
        h('span', { className: 'wz-shead__ic' }, h(Svg, { d: I.spark, s: 22 })),
        h('div', { className: 'wz-shead__tx' },
          h('h1', null, 'Выберите стиль презентации'),
          h('p', null, 'Готовые стили собраны на проверенных шаблонах — откройте готовую презентацию в один клик или начните с чистого листа и соберите её сами.'))),
      h('div', { className: 'wz-style' },
        h('div', { className: 'wz-style__main' },
          h('div', { className: 'wz-style__grid' },
            DESIGNS.map((d) => h(StyleCard, { key: d.id, design: d, selected: designId === d.id, onSelect, onPreview: setPreview, onQuickStart })),
            h(BlankCard, { key: 'blank', onBlank }))),
        h('div', { className: 'wz-style__side' }, h(StyleSidebar, { design: sel }))),
      h(StyleModal, { design: preview, onClose: () => setPreview(null) }));
  }

  /* ---- BRAND ---- */
  const ACCENTS = ['#E5322B', '#2563EB', '#0E1116', '#1F8A5B', '#C2410C', '#7C3AED', '#0891B2', '#D72A23'];
  function Dropzone({ brand, setBrand }) {
    const [over, setOver] = useState(false);
    const inputRef = useRef(null);
    const take = (file) => {
      if (!file) return;
      window.CX.readImageFile(file, 600).then(({ dataUrl, ratio }) => setBrand((b) => ({ ...b, logo: dataUrl, logoRatio: ratio })))
        .catch(() => {});
    };
    return h('div', {
      className: 'wz-drop' + (over ? ' over' : '') + (brand.logo ? ' has' : ''),
      onDragOver: (e) => { e.preventDefault(); setOver(true); },
      onDragLeave: () => setOver(false),
      onDrop: (e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); },
      onClick: () => inputRef.current && inputRef.current.click()
    },
      h('input', { ref: inputRef, type: 'file', accept: 'image/png,image/jpeg,image/svg+xml,image/webp', style: { display: 'none' }, onChange: (e) => take(e.target.files[0]) }),
      brand.logo
        ? h(React.Fragment, null,
            h('img', { src: brand.logo, alt: 'Логотип', className: 'wz-drop__img' }),
            h('button', { className: 'wz-drop__rm', onClick: (e) => { e.stopPropagation(); setBrand((b) => ({ ...b, logo: null, logoRatio: null })); } }, h(Svg, { d: I.close, s: 13, w: 2.4 }), 'Убрать'))
        : h(React.Fragment, null,
            h('span', { className: 'wz-drop__ic' }, h(Svg, { d: I.img, s: 22 })),
            h('b', null, 'Перетащите логотип сюда'),
            h('span', { className: 'wz-drop__hint' }, 'PNG, SVG, JPG или WebP'),
            h('span', { className: 'btn btn-ghost btn-sm' }, 'Загрузить логотип')));
  }
  function BrandStep({ brand, setBrand, design, theme }) {
    const tCover = Lib.byId('title-01'), tInner = Lib.byId('about-company-02');
    return h('div', { className: 'wz-screen wz-screen--wide', 'data-screen-label': 'Настройка бренда' },
      h(StepHead, { eyebrow: 'ШАГ 3 · БРЕНД', title: 'Настройте бренд презентации', sub: 'Логотип и цвета применятся ко всем слайдам — и в превью, и при экспорте.' }),
      h('div', { className: 'wz-brand' },
        h('div', { className: 'wz-brand__form' },
          h('div', { className: 'wz-fld' }, h('label', null, 'Логотип'), h(Dropzone, { brand, setBrand })),
          h('div', { className: 'wz-fld' },
            h('label', null, 'Название бренда'),
            h('input', { className: 'fe-input', placeholder: 'Presa', value: brand.name, onChange: (e) => setBrand((b) => ({ ...b, name: e.target.value })) })),
          h('div', { className: 'wz-fld' },
            h('label', null, 'Основной цвет'),
            h('div', { className: 'wz-swatches' },
              ACCENTS.map((c) => h('button', { key: c, className: 'wz-sw' + (brand.accent === c ? ' on' : ''), style: { background: c }, onClick: () => setBrand((b) => ({ ...b, accent: c })), title: c },
                brand.accent === c ? h(Svg, { d: I.check, s: 14, w: 3 }) : null)))),
          h('div', { className: 'wz-fld' },
            h('label', null, 'Дополнительный цвет ', h('span', { className: 'wz-fld__opt' }, 'для выделений')),
            h('div', { className: 'wz-swatches' },
              ['#0E1116'].concat(ACCENTS.filter((c) => c !== brand.accent)).slice(0, 8).map((c) => h('button', { key: c, className: 'wz-sw wz-sw--sm' + (brand.accent2 === c ? ' on' : ''), style: { background: c }, onClick: () => setBrand((b) => ({ ...b, accent2: b.accent2 === c ? null : c })), title: c },
                brand.accent2 === c ? h(Svg, { d: I.check, s: 12, w: 3 }) : null)))),
          h('div', { className: 'wz-fld' },
            h('label', null, 'Фон'),
            h('div', { className: 'cx-seg cx-seg--block' },
              [['light', 'Светлый'], ['dark', 'Тёмный'], ['combined', 'Комбинированный']].map(([v, lbl]) =>
                h('button', { key: v, className: 'cx-seg__opt' + (brand.bg === v ? ' on' : ''), onClick: () => setBrand((b) => ({ ...b, bg: v })) }, lbl)))),
          h('label', { className: 'wz-check' },
            h('input', { type: 'checkbox', checked: brand.pageNum !== false, onChange: (e) => setBrand((b) => ({ ...b, pageNum: e.target.checked })) }),
            h('span', null, 'Нумерация и логотип в подвале слайдов'))),
        h('div', { className: 'wz-brand__prev' },
          h('div', { className: 'wz-brand__plabel' }, 'Предпросмотр'),
          h('div', { className: 'wz-brand__slide' }, h(window.CX.MiniSlide, { template: tCover, fields: tCover.sample || {}, theme, n: 1, total: 8, brand })),
          h('div', { className: 'wz-brand__slide' }, h(window.CX.MiniSlide, { template: tInner, fields: tInner.sample || {}, theme, n: 2, total: 8, brand })))));
  }

  /* ---- TYPE ---- */
  function TypeStep({ ptype, onSelect }) {
    return h('div', { className: 'wz-screen wz-screen--wide', 'data-screen-label': 'Тип презентации' },
      h(StepHead, { eyebrow: 'ШАГ 4 · ТИП', title: 'Какой тип презентации?', sub: 'От типа зависит структура слайдов. Её можно будет изменить на следующем шаге.' }),
      h('div', { className: 'wz-types' },
        TYPES.map((t) => h('button', {
          key: t.id, className: 'wz-tcard' + (ptype === t.id ? ' on' : ''), onClick: () => onSelect(t.id)
        },
          h('div', { className: 'wz-tcard__row' },
            h('h3', null, t.name),
            ptype === t.id ? h('span', { className: 'wz-tcard__chk' }, h(Svg, { d: I.check, s: 12, w: 3 })) : null),
          h('p', null, t.desc),
          h('span', { className: 'wz-tcard__n' }, h(Svg, { d: I.layers, s: 12 }), `${t.flow.length} слайдов`)))));
  }

  /* ---- PASTE — block editor: one card = one slide ---- */
  const PASTE_EXAMPLE = [
    mkBlock('Запуск Nordwave', 'Платформа для автоматизации коммерческих предложений'),
    mkBlock('Проблема', 'Сотрудники ежедневно тратят значительное время на поиск информации, подготовку документов и ответы на типовые вопросы.\nПотеря времени\nВысокая нагрузка\nМедленное обучение\nОшибки из-за человеческого фактора'),
    mkBlock('Решение', 'Конструктор КП с готовыми блоками автоматизирует рутину и приводит оформление к единому стандарту.\nАвтоподстановка цен и условий\nГотовые шаблоны под отрасль\nЭкспорт в PDF и PPTX за минуту'),
    mkBlock('Результаты', '−55% времени на подготовку КП\n+30% к конверсии в сделку\n120+ компаний уже используют Nordwave'),
    mkBlock('С чего начать', 'Бесплатный доступ на 14 дней — без карты')
  ];

  function SlideBlock({ block, index, total, selected, onTitle, onBody, onRemove, onDup, dnd }) {
    return h('div', {
      className: 'wz-block' + (dnd.over === index ? ' dragover' : ''),
      onDragOver: (e) => { e.preventDefault(); if (dnd.over !== index) dnd.setOver(index); },
      onDragLeave: () => dnd.setOver((d) => d === index ? null : d),
      onDrop: (e) => { e.preventDefault(); dnd.drop(index); },
    },
      h('div', { className: 'wz-block__head' },
        h('span', {
          className: 'wz-block__drag', title: 'Перетащите, чтобы изменить порядок',
          draggable: true,
          onDragStart: () => dnd.start(index),
          onDragEnd: () => dnd.end()
        }, h(Svg, { d: I.drag, s: 15 })),
        h('span', { className: 'wz-block__n' }, 'Слайд ' + String(index + 1).padStart(2, '0')),
        index === 0 ? h('span', { className: 'wz-block__tag' }, 'Обложка') : null,
        h('span', { className: 'wz-block__sp' }),
        h('button', { className: 'wz-block__act', title: 'Дублировать', onClick: onDup }, h(Svg, { d: I.copy, s: 14 })),
        h('button', { className: 'wz-block__act wz-block__act--rm', title: 'Удалить слайд', onClick: onRemove, disabled: total <= 1 }, h(Svg, { d: I.trash, s: 14 }))),
      h('input', {
        className: 'fe-input wz-block__title',
        placeholder: index === 0 ? 'Название презентации' : 'Название слайда',
        value: block.title,
        onChange: (e) => onTitle(e.target.value)
      }),
      h('textarea', {
        className: 'fe-input fe-textarea wz-block__body',
        placeholder: index === 0
          ? 'Подзаголовок обложки — короткое описание'
          : 'Текст слайда. Каждая строка станет отдельным пунктом.',
        rows: 3,
        value: block.body,
        onChange: (e) => onBody(e.target.value)
      }));
  }

  function PasteStep({ pasteSlides, setPasteSlides, deckTitle, setDeckTitle }) {
    const blocks = pasteSlides && pasteSlides.length ? pasteSlides : defaultBlocks();
    const filled = blocksFilled(blocks);
    const [importing, setImporting] = useState(false);
    const [importText, setImportText] = useState('');
    const dragFrom = useRef(null);
    const [over, setOver] = useState(null);

    const setAt = (i, patch) => setPasteSlides(blocks.map((b, j) => j === i ? { ...b, ...patch } : b));
    const addBlock = () => setPasteSlides([...blocks, mkBlock('', '')]);
    const removeAt = (i) => setPasteSlides(blocks.length <= 1 ? blocks : blocks.filter((_, j) => j !== i));
    const dupAt = (i) => { const n = blocks.slice(); n.splice(i + 1, 0, mkBlock(blocks[i].title, blocks[i].body)); setPasteSlides(n); };
    const move = (from, to) => {
      if (from == null || to == null || from === to) return;
      const n = blocks.slice(); const [m] = n.splice(from, 1); n.splice(to, 0, m); setPasteSlides(n);
    };
    const dnd = {
      over, setOver,
      start: (i) => { dragFrom.current = i; },
      drop: (i) => { move(dragFrom.current, i); dragFrom.current = null; setOver(null); },
      end: () => { dragFrom.current = null; setOver(null); }
    };
    const runImport = () => {
      const parsed = blocksFromText(importText);
      if (!parsed.length) return;
      const existing = cleanBlocks(blocks);
      setPasteSlides(existing.length ? blocks.filter((b) => (b.title || b.body).trim()).concat(parsed) : parsed);
      setImportText(''); setImporting(false);
    };
    const loadExample = () => setPasteSlides(PASTE_EXAMPLE.map((b) => mkBlock(b.title, b.body)));

    return h('div', { className: 'wz-screen wz-screen--wide', 'data-screen-label': 'Контент слайдов' },
      h(StepHead, { eyebrow: 'ШАГ 5 · КОНТЕНТ', title: 'Заполните слайды', sub: 'Один блок — один слайд. Добавьте столько, сколько нужно: сервис оформит каждый в выбранном дизайне.' }),
      h('div', { className: 'wz-paste' },
        h('div', { className: 'wz-paste__main' },
          h('div', { className: 'wz-fld' },
            h('label', null, 'Название презентации ', h('span', { className: 'wz-fld__opt' }, 'необязательно')),
            h('input', { className: 'fe-input', placeholder: 'Например, Запуск Nordwave', value: deckTitle, onChange: (e) => setDeckTitle(e.target.value) })),
          h('div', { className: 'wz-blocks' },
            blocks.map((b, i) => h(SlideBlock, {
              key: b.uid, block: b, index: i, total: blocks.length,
              onTitle: (v) => setAt(i, { title: v }),
              onBody: (v) => setAt(i, { body: v }),
              onRemove: () => removeAt(i),
              onDup: () => dupAt(i),
              dnd
            }))),
          h('button', { className: 'wz-blocks__add', onClick: addBlock },
            h(Svg, { d: I.plus, s: 16 }), 'Добавить слайд'),
          h('div', { className: 'wz-paste__count' },
            filled ? `Будет создано слайдов: ${filled}` : 'Заполните хотя бы один слайд, чтобы продолжить')),
        h('div', { className: 'wz-paste__side' },
          h('div', { className: 'wz-paste__card' },
            h('div', { className: 'wz-paste__cardhead' }, h(Svg, { d: I.info, s: 15 }), 'Как это работает'),
            h('ul', { className: 'wz-paste__list' },
              h('li', null, 'Каждая карточка — отдельный слайд презентации.'),
              h('li', null, 'Название карточки становится заголовком слайда.'),
              h('li', null, 'Каждая строка в тексте — отдельный пункт списка.'),
              h('li', null, 'Первый слайд оформляется как обложка.')),
            h('div', { className: 'wz-paste__imp' },
              importing
                ? h(React.Fragment, null,
                    h('div', { className: 'wz-paste__exhead' }, 'Вставьте текст целиком'),
                    h('textarea', {
                      className: 'fe-input fe-textarea wz-paste__imparea',
                      placeholder: 'Разделяйте слайды пустой строкой или метками «Слайд 1:», «Слайд 2:»…',
                      rows: 5, value: importText, onChange: (e) => setImportText(e.target.value)
                    }),
                    h('div', { className: 'wz-paste__improw' },
                      h('button', { className: 'btn btn-primary btn-sm', onClick: runImport, disabled: !importText.trim() }, 'Разбить на слайды'),
                      h('button', { className: 'btn btn-ghost btn-sm', onClick: () => { setImporting(false); setImportText(''); } }, 'Отмена')))
                : h('button', { className: 'btn btn-ghost btn-sm btn-block', onClick: () => setImporting(true) },
                    h(Svg, { d: I.textT, s: 14 }), 'Вставить одним текстом')),
            h('button', { className: 'btn btn-ghost btn-sm btn-block wz-paste__ex-btn', onClick: loadExample }, 'Загрузить пример')))));
  }

  /* ---- PROMPT MANAGER — one big field for raw text ---- */
  function PromptStep({ promptText, setPromptText, deckTitle, setDeckTitle, genMode, setGenMode }) {
    const text = promptText || '';
    const mode = genMode || 'faithful';
    const segs = useMemo(() => segmentPrompt(text), [text]);
    const metrics = useMemo(() => extractMetrics(text), [text]);
    const tables = useMemo(() => segs.filter((s) => detectTable(s.body)).length, [segs]);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const est = segs.length ? segs.length + (mode === 'faithful' ? 0 : 1) : 0;
    const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c); };

    return h('div', { className: 'wz-screen wz-screen--wide', 'data-screen-label': 'Prompt Manager' },
      h(StepHead, { eyebrow: 'ШАГ 4 · ТЕКСТ', title: 'Вставьте текст — ИИ разберёт его на слайды', sub: 'Описание проекта, услуга, КП, ТЗ, преимущества, проблемы, цифры или просто идея. Не нужно ничего форматировать — структуру предложит ИИ, а вы её подтвердите.' }),
      h('div', { className: 'wz-prompt' },
        h('div', { className: 'wz-prompt__main' },
          h('div', { className: 'wz-fld' },
            h('label', null, 'Название презентации ', h('span', { className: 'wz-fld__opt' }, 'необязательно')),
            h('input', { className: 'fe-input', placeholder: 'Например, Запуск Nordwave', value: deckTitle, onChange: (e) => setDeckTitle(e.target.value) })),
          h('div', { className: 'wz-fld' },
            h('label', null, 'Режим обработки текста'),
            h('div', { className: 'cx-seg cx-seg--block' },
              [['faithful', 'Сохранить весь текст'], ['condense', 'Сжать и оформить']].map(([v, lbl]) =>
                h('button', { key: v, className: 'cx-seg__opt' + (mode === v ? ' on' : ''), onClick: () => setGenMode(v) }, lbl))),
            h('div', { style: { marginTop: '8px', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.5, display: 'flex', gap: '7px', alignItems: 'flex-start' } },
              h(Svg, { d: mode === 'faithful' ? I.shield : I.spark, s: 14 }),
              h('span', null, mode === 'faithful'
                ? 'Текст и таблицы переносятся как есть — ничего не сокращается и не выкидывается. Каждый раздел и каждая таблица станут отдельными слайдами.'
                : 'ИИ переписывает текст в короткие тезисы и собирает сжатую презентацию из 5–8 слайдов.'))),
          h('div', { className: 'wz-fld wz-fld--grow' },
            h('label', null, 'Ваш текст'),
            h('textarea', {
              className: 'fe-input fe-textarea wz-prompt__area',
              placeholder: 'Вставьте сюда любой текст о вашем проекте, продукте или услуге.\n\nМожно одним абзацем или с заголовками разделов (Проблема, Решение, Преимущества, Результаты…). ИИ сам определит структуру и разложит контент по слайдам.',
              value: text,
              onChange: (e) => setPromptText(e.target.value)
            })),
          h('div', { className: 'wz-prompt__meta' },
            h('span', null, words ? `${words} слов` : 'Поле пустое'),
            est ? h('span', { className: 'wz-prompt__est' }, h(Svg, { d: I.layers, s: 13 }), `≈ ${est} слайдов`) : null,
            metrics.length ? h('span', { className: 'wz-prompt__est' }, h(Svg, { d: I.chart, s: 13 }), `${metrics.length} цифр найдено`) : null,
            tables ? h('span', { className: 'wz-prompt__est' }, h(Svg, { d: I.layers, s: 13 }), `${tables} ${plural(tables, 'таблица', 'таблицы', 'таблиц')} найдено`) : null)),
        h('div', { className: 'wz-prompt__side' },
          h('div', { className: 'wz-paste__card' },
            h('div', { className: 'wz-paste__cardhead' }, h(Svg, { d: I.spark, s: 15 }), 'Как работает Prompt Manager'),
            h('ol', { className: 'wz-prompt__steps' },
              h('li', null, h('b', null, 'Вставьте текст'), ' — сырой, без оформления.'),
              h('li', null, h('b', null, 'Разобрать текст'), ' — ИИ предложит структуру по слайдам.'),
              h('li', null, h('b', null, 'Проверьте и поправьте'), ' — тип, заголовок, текст, пункты, порядок.'),
              h('li', null, h('b', null, 'Сгенерировать'), ' — готовая презентация и экспорт в PDF / PPTX.')),
            h('div', { className: 'wz-prompt__note' }, h(Svg, { d: I.shield, s: 13 }), 'ИИ не выдумывает цифры — в слайды попадут только те значения, что есть в тексте.'),
            h('button', { className: 'btn btn-ghost btn-sm btn-block wz-paste__ex-btn', onClick: () => setPromptText(PROMPT_EXAMPLE) }, 'Загрузить пример текста')))));
  }

  window.CXWiz = {
    clamp, applyBrand, themeVariant, MODES, DESIGNS, TYPES, TONES, CAT_DESC, VISUAL,
    splitLines, primaryTextKey, mainTextKey, listKey, mkPlan, planTitle, buildPlan, planToSlides, parsePaste, buildStarterDeck,
    mkBlock, defaultBlocks, blocksFromText, cleanBlocks, blocksFilled,
    segmentPrompt, extractMetrics, buildPromptPlan, buildPromptPlanAI, buildFaithfulPlan, detectTable, tableFieldsFrom, PROMPT_EXAMPLE,
    Rail, StepHead, ModeStep, DesignStep, BrandStep, TypeStep, PasteStep, PromptStep
  };
})();
