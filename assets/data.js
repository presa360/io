/* ============================================================
   Presa — data layer
   Form presets + a deterministic "AI" example generator that
   adapts a polished corporate deck to the user's brief.
   (Stands in for a real model call; same JSON contract.)
   ============================================================ */
(function () {
  const INDUSTRIES = [
    "IT и SaaS", "Финансы и финтех", "Производство", "Ритейл и e-commerce",
    "Консалтинг", "Маркетинг и реклама", "Логистика", "Здравоохранение",
    "Образование", "Недвижимость", "Телеком", "Энергетика"
  ];

  const GOALS = [
    "Коммерческое предложение", "Презентация компании", "Pitch deck для инвесторов",
    "HR-презентация", "Отчёт о результатах", "Вебинар / выступление",
    "Запуск продукта", "Партнёрская презентация"
  ];

  const TONES = [
    { id: "tech",          label: "Tech" },
    { id: "modern",        label: "Современный" },
    { id: "strict",        label: "Строгий" },
    { id: "minimal",       label: "Минималистичный" },
    { id: "premium",       label: "Premium" },
    { id: "corporate",     label: "Corporate" }
  ];

  const LANGUAGES = [
    { id: "ru", label: "Русский" },
    { id: "en", label: "English" }
  ];

  // ---- Slide visual themes (preview + pptx share these colors) ----
  const THEMES = {
    tech:      { name: "Tech",            dark: false, bg: "#FFFFFF", panel: "#F6F7F9", title: "#0E1116", body: "#5B6573", accent: "#E5322B", accentSoft: "#FFF2F0", rule: "bar",   mono: true,  titleDark: true },
    modern:    { name: "Современный",      dark: false, bg: "#FFFFFF", panel: "#F6F7F9", title: "#0E1116", body: "#5B6573", accent: "#E5322B", accentSoft: "#FFF2F0", rule: "under", mono: false, titleDark: true },
    strict:    { name: "Строгий",          dark: false, bg: "#FFFFFF", panel: "#F4F5F7", title: "#14161B", body: "#535C68", accent: "#C0241E", accentSoft: "#F7E9E8", rule: "top",   mono: false, titleDark: true },
    minimal:   { name: "Минималистичный",  dark: false, bg: "#FFFFFF", panel: "#FAFAFB", title: "#15181F", body: "#6B7280", accent: "#E5322B", accentSoft: "#FFF2F0", rule: "dot",   mono: false, titleDark: false },
    premium:   { name: "Premium",          dark: true,  bg: "#0C0E12", panel: "#15181F", title: "#FFFFFF", body: "#A7AEBB", accent: "#F0463E", accentSoft: "#1E2128", rule: "bar",   mono: false, titleDark: true },
    corporate: { name: "Corporate",        dark: false, bg: "#FFFFFF", panel: "#F4F6F8", title: "#0E1116", body: "#566070", accent: "#D72A23", accentSoft: "#FBEAE8", rule: "side",  mono: false, titleDark: true },
    blue:      { name: "Tech Blue",        dark: false, bg: "#FFFFFF", panel: "#EEF3FC", title: "#0B1B33", body: "#48566B", accent: "#2563EB", accentSoft: "#E4ECFB", rule: "bar",   mono: true,  titleDark: true },
    industrial:{ name: "Industrial",       dark: false, bg: "#FFFFFF", panel: "#F2F0EA", title: "#1B1A17", body: "#56564E", accent: "#C2410C", accentSoft: "#F7EBE1", rule: "side",  mono: false, titleDark: true },
    emerald:   { name: "Emerald",           dark: false, bg: "#FFFFFF", panel: "#EDF5F0", title: "#0B1F17", body: "#4B5C54", accent: "#0F8A5F", accentSoft: "#E2F2EA", rule: "side",  mono: false, titleDark: true },
    indigo:    { name: "Midnight Indigo",   dark: true,  bg: "#0D0F1A", panel: "#181B2C", title: "#FFFFFF", body: "#A6ABC4", accent: "#6366F1", accentSoft: "#1C2036", rule: "bar",   mono: false, titleDark: true },
    sand:      { name: "Editorial Sand",    dark: false, bg: "#F7F3EC", panel: "#EFE7DA", title: "#1E1A14", body: "#5C5448", accent: "#C2553B", accentSoft: "#F0E0D6", rule: "under", mono: false, titleDark: true },
    teal:      { name: "Ocean Teal",        dark: false, bg: "#FFFFFF", panel: "#E9F4F5", title: "#08252A", body: "#46585C", accent: "#0E8E9C", accentSoft: "#DEF0F2", rule: "bar",   mono: true,  titleDark: true },
    graphite:  { name: "Graphite Mono",     dark: false, bg: "#FFFFFF", panel: "#F1F2F4", title: "#16181C", body: "#5A6068", accent: "#2B2F36", accentSoft: "#EBEDF0", rule: "top",   mono: true,  titleDark: true },
    violet:    { name: "Studio Violet",     dark: false, bg: "#FFFFFF", panel: "#F4EFFB", title: "#1A1136", body: "#544C6B", accent: "#7C3AED", accentSoft: "#EEE6FC", rule: "dot",   mono: false, titleDark: true }
  };

  // ---- Helpers ----
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function firstWord(s) { return (s || "").trim().split(/\s+/)[0] || ""; }

  // Reconstruct a synthesized theme variant key ("<base>__dark|light|combo") into
  // THEMES if it's missing. Deterministic, so wizard-made decks survive a cold reload
  // even when the wizard never mounted to register the key.
  function ensureTheme(key) {
    if (!key || THEMES[key]) return key;
    const m = String(key).match(/^(.+)__(dark|light|combo)$/);
    if (!m) return key;
    const base = THEMES[m[1]];
    if (!base) return key;
    const v = m[2];
    if (v === 'dark') {
      THEMES[key] = base.dark ? { ...base }
        : { ...base, name: base.name + ' Dark', dark: true, bg: '#0C0E12', panel: '#161A21', title: '#FFFFFF', body: '#A7AEBB', accentSoft: '#1E2128', titleDark: true };
    } else if (v === 'light') {
      THEMES[key] = base.dark
        ? { ...base, name: base.name + ' Light', dark: false, bg: '#FFFFFF', panel: '#F6F7F9', title: '#0E1116', body: '#5B6573', accentSoft: '#FFF2F0', titleDark: true }
        : { ...base };
    } else if (v === 'combo') {
      THEMES[key] = base.dark ? { ...base, name: base.name + ' Combo', panel: '#222A36' }
        : { ...base, name: base.name + ' Combo', panel: base.accentSoft };
    }
    return key;
  }

  // EN dictionary for a couple of language-aware strings
  const T = {
    ru: {
      titleSub: (g) => g,
      agenda: "О чём поговорим",
      about: "О компании",
      problem: "Контекст и вызовы",
      solution: "Наше решение",
      how: "Как это работает",
      value: "Что вы получаете",
      cases: "Результаты и кейсы",
      why: "Почему мы",
      roadmap: "Этапы работы",
      offer: "Коммерческое предложение",
      team: "Команда",
      cta: "Следующий шаг"
    },
    en: {
      titleSub: (g) => g,
      agenda: "Agenda",
      about: "About us",
      problem: "Context & challenges",
      solution: "Our solution",
      how: "How it works",
      value: "What you get",
      cases: "Results & cases",
      why: "Why us",
      roadmap: "Roadmap",
      offer: "Commercial offer",
      team: "Team",
      cta: "Next step"
    }
  };

  // ---- The deterministic generator ----
  function buildPresentation(form) {
    const lang = form.language === "en" ? "en" : "ru";
    const L = T[lang];
    const company = (form.companyName || (lang === "en" ? "Your Company" : "Ваша компания")).trim();
    const industry = (form.industry || (lang === "en" ? "your market" : "вашем рынке")).trim();
    const audience = (form.targetAudience || (lang === "en" ? "decision makers" : "лиц, принимающих решения")).trim();
    const goal = (form.presentationGoal || GOALS[0]).trim();
    const extra = (form.additionalInfo || "").trim();
    const count = clamp(parseInt(form.slideCount, 10) || 10, 5, 16);

    const presentationTitle = company;
    const presentationSubtitle = lang === "en"
      ? `${goal} · for ${audience}`
      : `${goal} · для аудитории «${audience}»`;

    // Build a pool of content slides; we always keep title first + CTA last.
    const pool = [];

    pool.push({
      key: "agenda", title: L.agenda,
      bullets: lang === "en"
        ? ["Who we are and what we do", "The challenge you're facing", "Our approach and value", "Next steps"]
        : ["Кто мы и чем занимаемся", "Какой вызов перед вами стоит", "Наш подход и ценность", "Дальнейшие шаги"],
      speakerNotes: lang === "en"
        ? "Set expectations: keep it to four blocks, promise a clear next step at the end."
        : "Задайте рамку выступления: четыре блока и понятный следующий шаг в конце.",
      visualSuggestion: lang === "en" ? "Numbered list, generous whitespace" : "Нумерованный список, много воздуха"
    });

    pool.push({
      key: "about", title: L.about,
      bullets: lang === "en"
        ? [`${company} works in ${industry}`, "Focused on measurable business outcomes", "Trusted by teams that value clarity over noise"]
        : [`${company} работает в сфере «${industry}»`, "Фокус на измеримых бизнес-результатах", "Нам доверяют команды, которым важна ясность, а не шум"],
      speakerNotes: lang === "en"
        ? "One sentence of credibility, then pivot fast to the client's situation."
        : "Одно предложение о доверии — и быстро переходите к ситуации клиента.",
      visualSuggestion: lang === "en" ? "Three stat cards" : "Три карточки с фактами"
    });

    pool.push({
      key: "problem", title: L.problem,
      bullets: lang === "en"
        ? [`${audience} lose time on manual, repetitive work`, "Results are hard to predict and compare", "Existing tools are heavy and slow to adopt"]
        : [`${audience} теряют время на ручной рутинной работе`, "Результат трудно прогнозировать и сравнивать", "Существующие инструменты тяжёлые и медленно внедряются"],
      speakerNotes: lang === "en"
        ? "Name the pain in the client's own words. Don't sell yet — earn agreement."
        : "Назовите боль словами клиента. Пока не продавайте — добейтесь согласия.",
      visualSuggestion: lang === "en" ? "Before / after split" : "Сплит «было / стало»"
    });

    pool.push({
      key: "solution", title: L.solution,
      bullets: lang === "en"
        ? [`A clear path from brief to result for ${audience}`, "Built around your processes, not against them", "Outcomes you can show to stakeholders"]
        : [`Понятный путь от брифа к результату для аудитории «${audience}»`, "Встраивается в ваши процессы, а не ломает их", "Результат, который можно показать стейкхолдерам"],
      speakerNotes: lang === "en"
        ? "Position the solution as the bridge over the pain you just described."
        : "Подайте решение как мост над болью, о которой вы только что сказали.",
      visualSuggestion: lang === "en" ? "Central diagram with accent" : "Центральная схема с акцентом"
    });

    pool.push({
      key: "how", title: L.how,
      bullets: lang === "en"
        ? ["1 — Describe the goal and audience", "2 — We assemble the structure and content", "3 — You review and export the result"]
        : ["1 — Описываете цель и аудиторию", "2 — Мы собираем структуру и контент", "3 — Вы проверяете и забираете результат"],
      speakerNotes: lang === "en"
        ? "Three steps maximum. Simplicity here signals a low-effort onboarding."
        : "Максимум три шага. Простота здесь = лёгкое внедрение.",
      visualSuggestion: lang === "en" ? "Horizontal 3-step flow" : "Горизонтальный поток из 3 шагов"
    });

    pool.push({
      key: "value", title: L.value,
      bullets: lang === "en"
        ? ["Faster turnaround on key deliverables", "Consistent quality across the team", "More time for strategy, less for formatting"]
        : ["Быстрее готовите ключевые материалы", "Стабильное качество по всей команде", "Больше времени на стратегию, меньше — на оформление"],
      speakerNotes: lang === "en"
        ? "Translate features into business value the audience cares about."
        : "Переведите возможности в бизнес-ценность, важную для аудитории.",
      visualSuggestion: lang === "en" ? "Icon + benefit grid" : "Сетка «иконка + выгода»"
    });

    pool.push({
      key: "cases", title: L.cases,
      bullets: lang === "en"
        ? ["−40% time to first draft", "+3× presentations shipped per month", "Adopted across sales, marketing and HR"]
        : ["−40% времени до первого черновика", "+3× презентаций в месяц", "Внедрено в продажах, маркетинге и HR"],
      speakerNotes: lang === "en"
        ? "Use real numbers if you have them; otherwise keep ranges honest."
        : "Подставьте реальные цифры, если есть; иначе оставьте честные диапазоны.",
      visualSuggestion: lang === "en" ? "Three big metrics" : "Три крупные метрики"
    });

    pool.push({
      key: "why", title: L.why,
      bullets: lang === "en"
        ? ["Designed for B2B, not generic decks", "Clear, business-first writing — no fluff", "Export to editable PPTX in one click"]
        : ["Заточено под B2B, а не под «универсальные» слайды", "Ясный деловой текст без воды", "Экспорт в редактируемый PPTX в один клик"],
      speakerNotes: lang === "en"
        ? "Differentiate against the obvious alternative the buyer is considering."
        : "Отстройтесь от очевидной альтернативы, которую рассматривает клиент.",
      visualSuggestion: lang === "en" ? "Comparison checklist" : "Чек-лист сравнения"
    });

    pool.push({
      key: "roadmap", title: L.roadmap,
      bullets: lang === "en"
        ? ["Week 1 — brief & alignment", "Weeks 2–3 — build & review", "Week 4 — launch & handover"]
        : ["Неделя 1 — бриф и согласование", "Недели 2–3 — сборка и правки", "Неделя 4 — запуск и передача"],
      speakerNotes: lang === "en"
        ? "Make the timeline feel concrete and low-risk."
        : "Сделайте сроки конкретными и снимите ощущение риска.",
      visualSuggestion: lang === "en" ? "Timeline with milestones" : "Таймлайн с вехами"
    });

    pool.push({
      key: "offer", title: L.offer,
      bullets: lang === "en"
        ? ["Transparent scope and pricing", "Flexible by team size and volume", "Start with a pilot, scale on results"]
        : ["Прозрачный объём и стоимость", "Гибко под размер команды и объём", "Старт с пилота, масштабирование по результату"],
      speakerNotes: lang === "en"
        ? "Anchor on value first, then present the number with confidence."
        : "Сначала закрепите ценность, затем уверенно назовите цифру.",
      visualSuggestion: lang === "en" ? "Pricing tiers" : "Тарифные пакеты"
    });

    pool.push({
      key: "team", title: L.team,
      bullets: lang === "en"
        ? ["A focused team with B2B background", "Single point of contact", "Support that responds in hours, not days"]
        : ["Сфокусированная команда с опытом в B2B", "Единая точка контакта", "Поддержка, которая отвечает за часы, а не за дни"],
      speakerNotes: lang === "en"
        ? "People buy from people — keep it warm and specific."
        : "Покупают у людей — добавьте тепла и конкретики.",
      visualSuggestion: lang === "en" ? "Team avatars row" : "Ряд аватаров команды"
    });

    // If user added extra info, surface it as a tailored slide near the value section.
    if (extra) {
      pool.splice(6, 0, {
        key: "context", title: lang === "en" ? "Tailored to you" : "С учётом вашего контекста",
        bullets: extra.split(/[\n;•]+/).map(s => s.trim()).filter(Boolean).slice(0, 4).length
          ? extra.split(/[\n;•]+/).map(s => s.trim()).filter(Boolean).slice(0, 4)
          : [extra.slice(0, 120)],
        speakerNotes: lang === "en"
          ? "These points come straight from your brief — keep them front and centre."
          : "Эти пункты — прямо из вашего брифа, держите их в центре внимания.",
        visualSuggestion: lang === "en" ? "Highlighted callout" : "Выделенный блок-вынос"
      });
    }

    // Assemble: title + slice of pool + CTA
    const middleNeeded = count - 2;
    const middle = pool.slice(0, clamp(middleNeeded, 3, pool.length));

    const slides = [];
    // 1) Title slide
    slides.push({
      slideNumber: 1,
      layout: "title",
      title: presentationTitle,
      subtitle: presentationSubtitle,
      bullets: [],
      speakerNotes: lang === "en"
        ? "Open with one strong sentence about the outcome, then your name and role."
        : "Откройте одним сильным предложением о результате, затем имя и роль.",
      visualSuggestion: lang === "en" ? "Title centred, logo bottom-left" : "Заголовок по центру, логотип внизу слева"
    });
    // 2..) content
    middle.forEach((s, i) => {
      slides.push({
        slideNumber: i + 2,
        layout: "content",
        title: s.title,
        bullets: s.bullets,
        speakerNotes: s.speakerNotes,
        visualSuggestion: s.visualSuggestion
      });
    });
    // last) CTA
    slides.push({
      slideNumber: slides.length + 1,
      layout: "cta",
      title: L.cta,
      bullets: lang === "en"
        ? ["Book a 30-minute pilot call", "We prepare a tailored proposal", `Reach us — ${company}`]
        : ["Запланируйте 30-минутный пилотный звонок", "Мы готовим персональное предложение", `Свяжитесь с нами — ${company}`],
      speakerNotes: lang === "en"
        ? "End with one clear ask and make it effortless to say yes."
        : "Завершите одним понятным призывом и сделайте «да» лёгким.",
      visualSuggestion: lang === "en" ? "Large CTA, contact details" : "Крупный CTA, контакты"
    });

    // renumber
    slides.forEach((s, i) => s.slideNumber = i + 1);

    return { presentationTitle, presentationSubtitle, meta: { company, goal, audience, industry, count: slides.length, lang, style: form.tone }, slides };
  }

  window.PresaData = { INDUSTRIES, GOALS, TONES, LANGUAGES, THEMES, ensureTheme, buildPresentation };
})();
