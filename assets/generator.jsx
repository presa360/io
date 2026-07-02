/* global React, PresaData, SlideCanvas, exportPPTX */
const { useState, useRef, useEffect, useCallback } = React;

const ICON = {
  back: 'M15 18l-6-6 6-6',
  download: 'M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14',
  spark: 'M13 2L4.5 12.5h6L11 22l8.5-11.5h-6L13 2z',
  check: 'M20 6L9 17l-5-5',
  warn: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  note: 'M4 4h16v12H7l-3 3V4z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z',
  chevL: 'M15 18l-6-6 6-6', chevR: 'M9 18l6-6-6-6',
  layers: 'M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18',
  target: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 5a4 4 0 100 8 4 4 0 000-8z'
};
const Svg = ({ d, s = 18, w = 2 }) => React.createElement('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none' },
  React.createElement('path', { d, stroke: 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }));

const { INDUSTRIES, GOALS, TONES, LANGUAGES, THEMES, buildPresentation } = PresaData;

function App() {
  const [view, setView] = useState('form');        // form | loading | result
  const [form, setForm] = useState({
    companyName: '', industry: '', presentationGoal: GOALS[0],
    targetAudience: '', slideCount: 10, tone: 'tech', language: 'ru', additionalInfo: ''
  });
  const [errors, setErrors] = useState({});
  const [presentation, setPresentation] = useState(null);
  const [themeKey, setThemeKey] = useState('tech');
  const [current, setCurrent] = useState(0);
  const [loadStep, setLoadStep] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [genError, setGenError] = useState(false);
  const cardRefs = useRef({});

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2600); };

  function validate() {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Укажите название компании';
    if (!form.industry.trim()) e.industry = 'Выберите или укажите сферу';
    if (!form.presentationGoal.trim()) e.presentationGoal = 'Выберите цель';
    if (!form.targetAudience.trim()) e.targetAudience = 'Опишите аудиторию';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const LOAD_STEPS = [
    'Анализируем бриф и аудиторию',
    'Строим структуру повествования',
    'Пишем тексты слайдов и заметки',
    'Собираем превью презентации'
  ];

  function handleGenerate() {
    setGenError(false);
    if (!validate()) { showToast('Заполните обязательные поля', false); return; }
    setView('loading'); setLoadStep(0);
    let step = 0;
    const iv = setInterval(() => { step += 1; setLoadStep(step); if (step >= LOAD_STEPS.length - 1) clearInterval(iv); }, 620);
    setTimeout(() => {
      try {
        const p = buildPresentation(form);
        setPresentation(p);
        setThemeKey(form.tone in THEMES ? form.tone : 'tech');
        setCurrent(0);
        setView('result');
        window.scrollTo({ top: 0 });
      } catch (err) {
        clearInterval(iv); setGenError(true); setView('form');
      }
    }, 2650);
  }

  function reset() { setView('form'); setPresentation(null); setGenError(false); }

  async function handleExport() {
    if (!presentation) return;
    setExporting(true);
    try {
      await exportPPTX(presentation, THEMES[themeKey], 'Presa');
      showToast('PPTX готов — файл скачивается', true);
    } catch (err) {
      showToast('Не удалось собрать PPTX', false);
    } finally { setExporting(false); }
  }

  // keyboard nav in result
  useEffect(() => {
    if (view !== 'result' || !presentation) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(c + 1, presentation.slides.length - 1));
      if (e.key === 'ArrowLeft') setCurrent((c) => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, presentation]);

  const selectSlide = (i) => {
    setCurrent(i);
    const el = cardRefs.current[i];
    if (el) el.scrollIntoView ? null : null; // avoid scrollIntoView per guidelines
  };

  // ---------- RENDER ----------
  return React.createElement(React.Fragment, null,
    // appbar
    React.createElement('header', { className: 'appbar' },
      React.createElement('div', { className: 'appbar__inner' },
        React.createElement('div', { className: 'appbar__left' },
          React.createElement('a', { className: 'appbar__back', href: 'index.html' }, React.createElement(Svg, { d: ICON.back, s: 16 }), 'На главную'),
          React.createElement('div', { className: 'appbar__divider' }),
          React.createElement('div', { className: 'appbar__title' }, 'Генератор презентаций',
            React.createElement('small', null, view === 'result' ? 'предпросмотр готов' : 'новый бриф'))
        ),
        React.createElement('div', { className: 'appbar__right' },
          view === 'result'
            ? React.createElement(React.Fragment, null,
                React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: reset }, 'Новый бриф'),
                React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: handleExport, disabled: exporting },
                  exporting ? 'Сборка…' : React.createElement(React.Fragment, null, React.createElement(Svg, { d: ICON.download, s: 16 }), 'Скачать PPTX')))
            : React.createElement('span', { className: 'chip mono', style: { fontSize: 12 } }, 'MVP · demo')
        )
      )
    ),
    // body
    React.createElement('main', { className: 'app' },
      React.createElement('div', { className: 'wrap' },
        view === 'form' && React.createElement(FormView, { form, set, errors, genError, onGenerate: handleGenerate }),
        view === 'loading' && React.createElement(LoadingView, { steps: LOAD_STEPS, active: loadStep }),
        view === 'result' && presentation && React.createElement(ResultView, {
          presentation, themeKey, setThemeKey, current, setCurrent: selectSlide, cardRefs, onExport: handleExport, exporting
        })
      )
    ),
    // toast
    toast && React.createElement('div', { className: 'toast show' },
      React.createElement('span', { className: 'toast__ic' }, React.createElement(Svg, { d: toast.ok ? ICON.check : ICON.warn, s: 17 })),
      toast.msg)
  );
}

/* ---------------- FORM ---------------- */
function FormView({ form, set, errors, genError, onGenerate }) {
  const adjust = (delta) => set('slideCount', Math.max(5, Math.min(16, Number(form.slideCount) + delta)));
  return React.createElement('div', null,
    React.createElement('div', { className: 'gintro' },
      React.createElement('h1', null, 'Расскажите о презентации'),
      React.createElement('p', null, 'Заполните короткий бриф — Presa соберёт структуру, тексты и готовый PPTX.')
    ),
    genError && React.createElement('div', { className: 'banner' },
      React.createElement('span', { className: 'banner__ic' }, React.createElement(Svg, { d: ICON.warn, s: 18 })),
      React.createElement('div', null,
        React.createElement('b', null, 'Не удалось сгенерировать'),
        React.createElement('p', null, 'Сервис генерации недоступен. Проверьте данные и попробуйте ещё раз.'))
    ),
    React.createElement('div', { className: 'formcard' },
      React.createElement('div', { className: 'formcard__head' },
        React.createElement('div', { className: 'formcard__step' }, '1'),
        React.createElement('div', null,
          React.createElement('h2', null, 'Бриф презентации'),
          React.createElement('p', null, 'Поля со звёздочкой обязательны'))
      ),
      React.createElement('div', { className: 'formbody' },
        React.createElement('div', { className: 'fgrid' },
          field('Название компании', 'req', errors.companyName,
            React.createElement('input', { className: 'input' + (errors.companyName ? ' err' : ''), placeholder: 'Например, Nordwave', value: form.companyName, onChange: (e) => set('companyName', e.target.value) })),
          field('Сфера бизнеса', 'req', errors.industry,
            React.createElement('input', { className: 'input' + (errors.industry ? ' err' : ''), placeholder: 'IT и SaaS, финансы, ритейл…', list: 'industries', value: form.industry, onChange: (e) => set('industry', e.target.value) }),
            React.createElement('datalist', { id: 'industries' }, INDUSTRIES.map((x) => React.createElement('option', { key: x, value: x })))),
          field('Цель презентации', 'req', errors.presentationGoal,
            React.createElement('select', { className: 'select' + (errors.presentationGoal ? ' err' : ''), value: form.presentationGoal, onChange: (e) => set('presentationGoal', e.target.value) },
              GOALS.map((g) => React.createElement('option', { key: g, value: g }, g)))),
          field('Целевая аудитория', 'req', errors.targetAudience,
            React.createElement('input', { className: 'input' + (errors.targetAudience ? ' err' : ''), placeholder: 'CFO, отделы закупок, инвесторы…', value: form.targetAudience, onChange: (e) => set('targetAudience', e.target.value) })),

          // tone
          React.createElement('div', { className: 'field field--full' },
            React.createElement('label', null, 'Стиль презентации'),
            React.createElement('div', { className: 'seg' },
              TONES.map((t) => React.createElement('div', { key: t.id, className: 'seg__opt' + (form.tone === t.id ? ' on' : ''), onClick: () => set('tone', t.id) }, t.label)))
          ),

          // slide count + language row
          React.createElement('div', { className: 'field' },
            React.createElement('label', null, 'Количество слайдов'),
            React.createElement('div', { className: 'counter' },
              React.createElement('button', { type: 'button', onClick: () => adjust(-1), disabled: form.slideCount <= 5 }, '−'),
              React.createElement('span', null, form.slideCount),
              React.createElement('button', { type: 'button', onClick: () => adjust(1), disabled: form.slideCount >= 16 }, '+')),
            React.createElement('span', { className: 'hint' }, 'от 5 до 16 слайдов')
          ),
          React.createElement('div', { className: 'field' },
            React.createElement('label', null, 'Язык презентации'),
            React.createElement('div', { className: 'seg' },
              LANGUAGES.map((l) => React.createElement('div', { key: l.id, className: 'seg__opt' + (form.language === l.id ? ' on' : ''), onClick: () => set('language', l.id) }, l.label)))
          ),

          field('Дополнительная информация', '', null,
            React.createElement('textarea', { className: 'textarea', placeholder: 'Ключевые продукты, цифры, преимущества, особые требования к содержанию…', value: form.additionalInfo, onChange: (e) => set('additionalInfo', e.target.value) }),
            null, true)
        ),
        React.createElement('div', { className: 'formfoot' },
          React.createElement('div', { className: 'formfoot__note' },
            React.createElement(Svg, { d: ICON.spark, s: 15 }), 'Генерация занимает несколько секунд'),
          React.createElement('button', { className: 'btn btn-primary btn-lg', onClick: onGenerate },
            React.createElement(Svg, { d: ICON.spark, s: 17 }), 'Сгенерировать презентацию')
        )
      )
    )
  );
}

function field(label, req, err, control, extra, full) {
  return React.createElement('div', { className: 'field' + (full ? ' field--full' : '') },
    React.createElement('label', null, label, req ? React.createElement('span', { className: 'req' }, '*') : null),
    control, extra || null,
    err ? React.createElement('div', { className: 'errmsg' }, React.createElement(Svg, { d: ICON.warn, s: 13 }), err) : null
  );
}

/* ---------------- LOADING ---------------- */
function LoadingView({ steps, active }) {
  return React.createElement('div', { className: 'loading' },
    React.createElement('div', { className: 'spinner' }),
    React.createElement('h2', null, 'Собираем вашу презентацию'),
    React.createElement('p', null, 'Presa анализирует бриф и пишет слайды'),
    React.createElement('div', { className: 'loadsteps' },
      steps.map((s, i) => React.createElement('div', { key: i, className: 'loadstep ' + (i < active ? 'done' : i === active ? 'active' : '') },
        React.createElement('span', { className: 'loadstep__ic' }, i < active ? React.createElement(Svg, { d: ICON.check, s: 12, w: 2.6 }) : null),
        s))
    )
  );
}

/* ---------------- RESULT ---------------- */
function ResultView({ presentation, themeKey, setThemeKey, current, setCurrent, cardRefs, onExport, exporting }) {
  const theme = THEMES[themeKey];
  const slides = presentation.slides;
  const cur = slides[current];
  const meta = presentation.meta;

  const themeList = ['tech', 'modern', 'strict', 'minimal', 'premium', 'corporate'];

  return React.createElement('div', null,
    // header
    React.createElement('div', { className: 'result__head' },
      React.createElement('div', { className: 'result__title' },
        React.createElement('h1', null, presentation.presentationTitle),
        React.createElement('p', null, presentation.presentationSubtitle),
        React.createElement('div', { className: 'result__meta' },
          metachip(ICON.layers, `${slides.length} слайдов`),
          metachip(ICON.target, meta.goal),
          metachip(ICON.globe, meta.lang === 'en' ? 'English' : 'Русский'),
          metachip(ICON.eye, THEMES[themeKey].name))
      ),
      React.createElement('div', { className: 'result__actions' },
        React.createElement('button', { className: 'btn btn-primary btn-lg', onClick: onExport, disabled: exporting },
          exporting ? 'Сборка PPTX…' : React.createElement(React.Fragment, null, React.createElement(Svg, { d: ICON.download, s: 17 }), 'Скачать PPTX')))
    ),

    // theme switch
    React.createElement('div', { className: 'themebar' },
      React.createElement('span', { className: 'themebar__label' }, 'СТИЛЬ:'),
      themeList.map((k) => React.createElement('button', { key: k, className: 'themepill' + (k === themeKey ? ' on' : ''), onClick: () => setThemeKey(k) },
        React.createElement('span', { className: 'sw', style: { background: THEMES[k].dark ? THEMES[k].bg : THEMES[k].accent, border: THEMES[k].dark ? '1px solid #333' : 'none' } }),
        THEMES[k].name))
    ),

    // body grid
    React.createElement('div', { className: 'result__body' },
      // stage
      React.createElement('div', { className: 'stage' },
        React.createElement('div', { className: 'stagecard' },
          React.createElement('div', { className: 'stage__slide' },
            React.createElement(SlideCanvas, { slide: cur, theme, brand: 'Presa', total: slides.length })),
          React.createElement('div', { className: 'stage__nav' },
            React.createElement('div', { className: 'stage__count' }, `Слайд ${current + 1} из ${slides.length}`),
            React.createElement('div', { className: 'stage__btns' },
              React.createElement('button', { className: 'iconbtn', onClick: () => setCurrent(Math.max(0, current - 1)), disabled: current === 0 }, React.createElement(Svg, { d: ICON.chevL, s: 18 })),
              React.createElement('button', { className: 'iconbtn', onClick: () => setCurrent(Math.min(slides.length - 1, current + 1)), disabled: current === slides.length - 1 }, React.createElement(Svg, { d: ICON.chevR, s: 18 })))),
          React.createElement('div', { className: 'filmstrip' },
            slides.map((s, i) => React.createElement('div', { key: i, className: 'thumb' + (i === current ? ' on' : ''), onClick: () => setCurrent(i) },
              React.createElement('span', { className: 'thumb__n' }, String(i + 1).padStart(2, '0')),
              React.createElement(SlideCanvas, { slide: s, theme, brand: 'Presa', total: slides.length }))))
        )
      ),

      // side: slide content cards
      React.createElement('div', { className: 'side' },
        React.createElement('div', { className: 'sidehead' },
          React.createElement('h3', null, 'Содержание слайдов'),
          React.createElement('span', null, `${slides.length} шт.`)),
        React.createElement('div', { className: 'slist' },
          slides.map((s, i) => React.createElement('div', {
            key: i, ref: (el) => (cardRefs.current[i] = el),
            className: 'scard' + (i === current ? ' on' : ''), onClick: () => setCurrent(i)
          },
            React.createElement('div', { className: 'scard__top' },
              React.createElement('span', { className: 'scard__n' }, String(s.slideNumber).padStart(2, '0')),
              React.createElement('span', { className: 'scard__layout' }, s.layout === 'title' ? 'Титул' : s.layout === 'cta' ? 'Призыв' : 'Контент')),
            React.createElement('h4', null, s.title),
            s.subtitle ? React.createElement('p', { style: { fontSize: 13, color: 'var(--text-muted)', marginTop: 6 } }, s.subtitle) : null,
            s.bullets && s.bullets.length ? React.createElement('ul', { className: 'scard__bullets' }, s.bullets.map((b, j) => React.createElement('li', { key: j }, b))) : null,
            s.speakerNotes ? React.createElement('div', { className: 'scard__notes' },
              React.createElement('div', { className: 'lbl' }, React.createElement(Svg, { d: ICON.note, s: 12 }), 'Заметки спикера'),
              React.createElement('p', null, s.speakerNotes)) : null,
            s.visualSuggestion ? React.createElement('div', { className: 'scard__visual' },
              React.createElement(Svg, { d: ICON.eye, s: 13 }), s.visualSuggestion) : null
          ))
        )
      )
    )
  );
}

function metachip(d, label) {
  return React.createElement('span', { className: 'metachip' }, React.createElement(Svg, { d, s: 13 }), label);
}

window.PresaApp = App;
