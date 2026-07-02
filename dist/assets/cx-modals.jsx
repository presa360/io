/* global React, CX */
/* ============================================================
   Presa — Entry screen («Что создаём?»), smart brief screen,
   and the «Добавить слайд» template-library modal.
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useState, useEffect, useMemo } = React;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;
  const Lib = window.PresaTemplates;

  /* ============== ENTRY: Что создаём? ============== */
  const PRESETS = {
    solution: {
      label: 'Презентация решения', desc: 'Проблема → решение → выгоды → кейс → шаги',
      flow: ['title-01', 'about-company-02', 'problem-01', 'solution-01', 'benefits-01', 'case-01', 'process-01', 'pricing-01', 'contact-01']
    },
    commercial: {
      label: 'Коммерческое предложение', desc: 'Структура КП: услуги, пакеты, сравнение, условия',
      flow: ['title-01', 'about-company-01', 'problem-03', 'solution-02', 'services-01', 'benefits-03', 'pricing-02', 'process-02', 'contact-02']
    },
    case: {
      label: 'Кейс', desc: 'История клиента: задача, подход, цифры, отзыв',
      flow: ['title-02', 'about-company-02', 'problem-02', 'solution-01', 'numbers-01', 'case-01', 'case-02', 'contact-01']
    }
  };

  function EntryScreen({ onManual, onBrief, onPreset }) {
    return h('div', { className: 'cx-entry', 'data-screen-label': 'Стартовый экран' },
      h('div', { className: 'cx-entry__inner' },
        h('div', { className: 'eyebrow cx-entry__eyebrow' }, 'НОВАЯ ПРЕЗЕНТАЦИЯ'),
        h('h1', null, 'Что создаём?'),
        h('p', null, 'Начните с чистого листа, дайте ИИ собрать структуру по брифу — или возьмите готовый сценарий под задачу.'),
        h('div', { className: 'cx-entry__cards' },
          h('button', { className: 'cx-entrycard cx-entrycard--big cx-entrycard--manual', onClick: onManual },
            h('div', { className: 'cx-entrycard__ic' }, h(Svg, { d: I.plus, s: 22 })),
            h('h3', null, 'Собрать вручную'),
            h('p', null, 'Пустая презентация. Добавляйте слайды из библиотеки дизайнов и заполняйте поля.'),
            h('div', { className: 'cx-entrycard__go' }, 'Начать с нуля', h(Svg, { d: I.chevR, s: 15 }))),
          h('button', { className: 'cx-entrycard cx-entrycard--big cx-entrycard--brief', onClick: onBrief },
            h('div', { className: 'cx-entrycard__ic' }, h(Svg, { d: I.spark, s: 22 })),
            h('h3', null, 'Сгенерировать по брифу'),
            h('p', null, 'Опишите компанию, проблему и решение — ИИ предложит структуру и заполнит слайды.'),
            h('div', { className: 'cx-entrycard__go' }, 'Заполнить бриф', h(Svg, { d: I.chevR, s: 15 }))),
          Object.keys(PRESETS).map((k) => h('button', { key: k, className: 'cx-entrycard cx-entrycard--preset', onClick: () => onPreset(k) },
            h('div', { className: 'cx-entrycard__ic' }, h(Svg, { d: I.layers, s: 18 })),
            h('h3', null, PRESETS[k].label),
            h('p', null, PRESETS[k].desc),
            h('div', { className: 'cx-entrycard__go' }, `${PRESETS[k].flow.length} слайдов`, h(Svg, { d: I.chevR, s: 14 })))))));
  }

  function buildPreset(key) {
    return PRESETS[key].flow.map((id) => window.CX.seedSlide(id));
  }

  /* ============== SMART BRIEF ============== */
  function briefSeq(count) {
    const core = ['title', 'about_company', 'problem', 'solution', 'benefits', 'numbers', 'case_study', 'process', 'comparison', 'pricing', 'roadmap', 'team'];
    const seq = ['title'];
    if (count >= 8) seq.push('agenda');
    let i = 1;
    while (seq.length < count - 1 && i < core.length) { seq.push(core[i]); i++; }
    seq.push('contact');
    return seq.slice(0, count);
  }

  const SOURCE_OF = {
    title: 'основная информация', agenda: 'структура', about_company: 'основная информация',
    problem: 'проблема клиента', solution: 'решение', benefits: 'выгоды',
    numbers: 'доказательства', case_study: 'доказательства', process: 'решение',
    comparison: 'выгоды', pricing: 'основная информация', roadmap: 'решение',
    team: 'основная информация', contact: 'следующий шаг'
  };
  const FILLED_BY = {
    problem: 'problem', solution: 'solution', benefits: 'benefits',
    numbers: 'proofs', case_study: 'proofs', contact: 'nextStep',
    title: 'company', about_company: 'company'
  };

  const splitLines = (t) => String(t || '').split(/\n+/).map((x) => x.replace(/^[-—•·]\s*/, '').trim()).filter(Boolean);

  function buildDeckFromBrief(f) {
    const AI = window.PresaAI;
    const plan = AI.generateFromBrief({
      companyName: f.company, industry: f.industry, targetAudience: f.audience,
      offer: f.solution || '', goal: f.goal, slideCount: f.slideCount
    });
    const lines = { problem: splitLines(f.problem), benefits: splitLines(f.benefits) };
    return plan.map((p) => {
      let templateId = p.templateId;
      let fields = p.fields;
      const patch = (tplId, fn) => {
        const tpl = Lib.byId(tplId);
        const next = window.CX.remapFields(tpl, fields);
        fn(next);
        templateId = tplId; fields = next;
      };
      if (p.category === 'problem' && lines.problem.length) {
        patch('problem-01', (n) => { n.bullets = lines.problem.slice(0, 5); });
      }
      if (p.category === 'solution' && f.solution.trim()) {
        patch('solution-01', (n) => { n.text = f.solution.trim(); });
      }
      if (p.category === 'benefits' && lines.benefits.length) {
        patch('benefits-02', (n) => { n.bullets = lines.benefits.slice(0, 5); });
      }
      if (p.category === 'case_study' && f.proofs.trim()) {
        patch('case-01', (n) => { n.text = f.proofs.trim(); n.title = 'Доказательства и кейсы'; });
      }
      if (p.category === 'contact' && f.nextStep.trim()) {
        patch('contact-01', (n) => { n.subtitle = f.nextStep.trim(); });
      }
      return { uid: window.CX.uid(), templateId, fields, fontScale: 1 };
    });
  }

  function BriefScreen({ onBack, onGenerate }) {
    const { GOALS, INDUSTRIES, TONES } = window.PresaData;
    const [f, setF] = useState({
      company: '', industry: '', audience: '', goal: GOALS[0], tone: 'tech', slideCount: 9,
      problem: '', solution: '', benefits: '', proofs: '', nextStep: ''
    });
    const [busy, setBusy] = useState(false);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const valid = f.company.trim() && f.industry.trim() && f.audience.trim();
    const seq = useMemo(() => briefSeq(f.slideCount), [f.slideCount]);

    const submit = () => {
      if (!valid) return;
      setBusy(true);
      window.setTimeout(() => onGenerate(f, buildDeckFromBrief(f)), 1100);
    };

    const Field = (key, label, opts = {}) => h('div', { className: 'cx-bfield' + (opts.full ? ' full' : '') },
      h('label', null, label, opts.req ? h('span', { className: 'req' }, '*') : null),
      opts.area
        ? h('textarea', { className: 'fe-input fe-textarea', rows: opts.rows || 3, placeholder: opts.ph || '', value: f[key], onChange: (e) => set(key, e.target.value) })
        : h('input', { className: 'fe-input', placeholder: opts.ph || '', list: opts.list, value: f[key], onChange: (e) => set(key, e.target.value) }));

    return h('div', { className: 'cx-briefview', 'data-screen-label': 'Умный бриф' },
      h('div', { className: 'cx-briefcols' },
        // ---- form ----
        h('div', { className: 'cx-briefform' },
          h('button', { className: 'cx-back', onClick: onBack }, h(Svg, { d: I.back, s: 15 }), 'Назад к выбору'),
          h('h1', null, 'Умный бриф'),
          h('p', { className: 'cx-briefsub' }, 'Чем подробнее ответы, тем точнее ИИ соберёт структуру и тексты. Обязательны только три поля.'),

          h('section', { className: 'cx-bsec' },
            h('h4', null, h('span', { className: 'cx-bsec__n' }, '1'), 'Основная информация'),
            h('div', { className: 'cx-bgrid' },
              Field('company', 'Название компании', { req: true, ph: 'Например, Nordwave' }),
              Field('industry', 'Сфера бизнеса', { req: true, ph: 'IT и SaaS, финансы…', list: 'cx-inds' }),
              h('datalist', { id: 'cx-inds' }, INDUSTRIES.map((x) => h('option', { key: x, value: x }))),
              Field('audience', 'Целевая аудитория', { req: true, ph: 'CFO, отделы закупок, инвесторы…' }),
              h('div', { className: 'cx-bfield' },
                h('label', null, 'Цель презентации'),
                h('div', { className: 'cx-catselect' },
                  h('select', { value: f.goal, onChange: (e) => set('goal', e.target.value) },
                    GOALS.map((g) => h('option', { key: g, value: g }, g))))),
              h('div', { className: 'cx-bfield' },
                h('label', null, 'Стиль'),
                h('div', { className: 'cx-seg' }, TONES.slice(0, 4).map((t) => h('button', { key: t.id, className: 'cx-seg__opt' + (f.tone === t.id ? ' on' : ''), onClick: () => set('tone', t.id) }, t.label)))),
              h('div', { className: 'cx-bfield' },
                h('label', null, 'Количество слайдов'),
                h('div', { className: 'cx-counter' },
                  h('button', { onClick: () => set('slideCount', Math.max(5, f.slideCount - 1)), disabled: f.slideCount <= 5 }, '−'),
                  h('span', null, f.slideCount),
                  h('button', { onClick: () => set('slideCount', Math.min(16, f.slideCount + 1)), disabled: f.slideCount >= 16 }, '+'))))),

          h('section', { className: 'cx-bsec' },
            h('h4', null, h('span', { className: 'cx-bsec__n' }, '2'), 'Проблема клиента'),
            Field('problem', 'С чем сталкивается аудитория', { area: true, full: true, ph: 'По одной боли на строку — каждая станет пунктом слайда «Проблема»' })),
          h('section', { className: 'cx-bsec' },
            h('h4', null, h('span', { className: 'cx-bsec__n' }, '3'), 'Решение'),
            Field('solution', 'Что предлагаете и как это работает', { area: true, full: true, ph: 'Продукт, услуга или подход — ляжет в слайд «Решение» и титул' })),
          h('section', { className: 'cx-bsec' },
            h('h4', null, h('span', { className: 'cx-bsec__n' }, '4'), 'Выгоды'),
            Field('benefits', 'Что получает клиент', { area: true, full: true, ph: 'По одной выгоде на строку' })),
          h('section', { className: 'cx-bsec' },
            h('h4', null, h('span', { className: 'cx-bsec__n' }, '5'), 'Доказательства'),
            Field('proofs', 'Цифры, кейсы, отзывы', { area: true, full: true, ph: 'Например: «−55% времени на КП у клиента из ритейла»' })),
          h('section', { className: 'cx-bsec' },
            h('h4', null, h('span', { className: 'cx-bsec__n' }, '6'), 'Следующий шаг'),
            Field('nextStep', 'Что должен сделать зритель', { full: true, ph: 'Запланировать звонок, запросить демо…' }))),

        // ---- AI structure preview ----
        h('div', { className: 'cx-briefside' },
          h('div', { className: 'cx-briefside__card' },
            h('div', { className: 'cx-briefside__head' },
              h(Svg, { d: I.spark, s: 15 }),
              h('div', null, h('b', null, 'AI-структура'), h('span', null, `${seq.length} слайдов · обновляется по брифу`))),
            h('ol', { className: 'cx-structure' },
              seq.map((cat, i) => {
                const fk = FILLED_BY[cat];
                const filled = fk && String(f[fk] || '').trim();
                return h('li', { key: i, className: filled ? 'filled' : '' },
                  h('span', { className: 'cx-structure__n' }, String(i + 1).padStart(2, '0')),
                  h('div', { className: 'cx-structure__txt' },
                    h('b', null, Lib.categoryLabel(cat)),
                    h('span', null, 'из брифа: ' + (SOURCE_OF[cat] || '—'))),
                  filled ? h(Svg, { d: I.check, s: 13, w: 2.6 }) : null);
              })),
            busy
              ? h('div', { className: 'cx-genload' }, h('div', { className: 'spinner' }), h('p', null, 'Собираем структуру и заполняем слайды…'))
              : h('button', { className: 'btn btn-primary btn-lg cx-briefgen', disabled: !valid, onClick: submit },
                  h(Svg, { d: I.spark, s: 16 }), 'Сгенерировать презентацию'),
            !valid && !busy ? h('div', { className: 'cx-briefhint' }, 'Заполните компанию, сферу и аудиторию') : null))));
  }

  /* ============== ADD SLIDE MODAL ============== */
  const KIND_FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'icon', label: 'С иконками' },
    { id: 'photo', label: 'С фото' },
    { id: 'data', label: 'Данные' },
    { id: 'long', label: 'Длинный текст' },
    { id: 'premium', label: 'Premium' }
  ];

  function TplBadges({ badges }) {
    if (!badges || !badges.length) return null;
    return h('div', { className: 'cx-tplcard__badges' },
      badges.map((b, i) => h('span', { key: i, className: 'cx-badge cx-badge--' + b.kind }, b.label)));
  }

  function AddSlideModal({ theme, onAdd, onClose }) {
    const [cat, setCat] = useState(Lib.CATEGORIES[0].id);
    const [query, setQuery] = useState('');
    const [style, setStyle] = useState('all'); // all | light | dark
    const [kind, setKind] = useState('all');    // content/feature filter

    useEffect(() => {
      const onKey = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const matchStyle = (t) => style === 'all' || (t.themeSupport || []).includes(style);
    const matchKind = (t) => {
      if (kind === 'all') return true;
      const m = Lib.meta(t);
      if (kind === 'long') return m.contentLength === 'long';
      return m.badges.some((b) => b.kind === kind);
    };
    const q = query.trim().toLowerCase();
    const results = useMemo(() => {
      let list = q
        ? Lib.TEMPLATES.filter((t) => (t.name + ' ' + t.description + ' ' + Lib.meta(t).useCase + ' ' + Lib.categoryLabel(t.category)).toLowerCase().includes(q))
        : Lib.byCategory(cat);
      return list.filter((t) => matchStyle(t) && matchKind(t));
    }, [q, cat, style, kind]);

    return h('div', { className: 'cx-overlay', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
      h('div', { className: 'cx-libmodal', 'data-screen-label': 'Библиотека шаблонов' },
        h('div', { className: 'cx-libmodal__head' },
          h('div', { className: 'cx-libmodal__title' },
            h('h2', null, 'Добавить слайд'),
            h('p', null, 'Выберите категорию и вариант дизайна')),
          h('div', { className: 'cx-libsearch' },
            h(Svg, { d: I.search, s: 15 }),
            h('input', { placeholder: 'Поиск по шаблонам…', value: query, autoFocus: true, onChange: (e) => setQuery(e.target.value) }),
            query ? h('button', { className: 'cx-libsearch__clr', onClick: () => setQuery('') }, h(Svg, { d: I.close, s: 12 })) : null),
          h('div', { className: 'cx-seg' },
            [['all', 'Все'], ['light', 'Светлые'], ['dark', 'Тёмные']].map(([v, lbl]) =>
              h('button', { key: v, className: 'cx-seg__opt' + (style === v ? ' on' : ''), onClick: () => setStyle(v) }, lbl))),
          h('button', { className: 'cx-modal__close', onClick: onClose }, h(Svg, { d: I.close, s: 16 }))),
        h('div', { className: 'cx-libmodal__body' },
          h('div', { className: 'cx-libcats' },
            Lib.CATEGORIES.map((c) => h('button', {
              key: c.id,
              className: 'cx-libcat' + (!q && c.id === cat ? ' on' : ''),
              onClick: () => { setQuery(''); setCat(c.id); }
            }, c.label, h('span', null, Lib.byCategory(c.id).length)))),
          h('div', { className: 'cx-libgrid' },
            h('div', { className: 'cx-libfilters' },
              KIND_FILTERS.map((k) => h('button', {
                key: k.id, className: 'cx-libfilter' + (kind === k.id ? ' on' : ''),
                onClick: () => setKind(k.id)
              }, k.label))),
            !q && Lib.byCategory(cat)[0] ? h('div', { className: 'cx-libcathint' },
              h(Svg, { d: I.info, s: 13 }),
              h('span', null, Lib.meta(Lib.byCategory(cat)[0]).useCase)) : null,
            q ? h('div', { className: 'cx-libres' }, `Найдено: ${results.length}`) : null,
            results.length ? h('div', { className: 'cx-libcards' },
              results.map((t) => {
                const m = Lib.meta(t);
                return h('div', { key: t.id, className: 'cx-tplcard' },
                  h('div', { className: 'cx-tplcard__pic' },
                    h(window.CX.MiniSlide, { template: t, fields: t.sample || {}, theme, n: 1, total: 1 }),
                    h('button', { className: 'cx-tplcard__add', onClick: () => onAdd(t) }, h(Svg, { d: I.plus, s: 14 }), 'Добавить')),
                  h('div', { className: 'cx-tplcard__meta' },
                    h('b', null, t.name),
                    h('span', { className: 'cx-tplcard__use' }, m.useCase),
                    m.optimal ? h('div', { className: 'cx-tplcard__optimal' },
                      h(Svg, { d: I.grid, s: 12 }),
                      h('span', null, 'Оптимально: ' + m.optimal.label)) : null,
                    h(TplBadges, { badges: m.badges })));
              }))
              : h('div', { className: 'cx-libempty' },
                  h(Svg, { d: I.search, s: 22 }),
                  h('p', null, 'Ничего не нашлось — попробуйте другой запрос или фильтр'))))));
  }

  window.CXScreens = { EntryScreen, BriefScreen, AddSlideModal, buildPreset, PRESETS };
})();
