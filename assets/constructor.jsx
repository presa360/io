/* global React, CX, PresaData, PresaTemplates, PresaFit, PresaAI */
/* ============================================================
   Presa — Constructor app v2
   Layout: topbar (brand · breadcrumbs · autosave · undo/redo ·
   export) | slide list with statuses | canvas stage | right tabs.
   ============================================================ */
const { useState, useRef, useEffect, useCallback, useMemo } = React;
const h = React.createElement;

const Lib = window.PresaTemplates;
const THEMES = window.PresaData.THEMES;
const Fit = window.PresaFit;
const AI = window.PresaAI;
const Svg = window.CX.Svg;
const I = window.CX.ICONS;

const STORE_KEY = 'presa.cx.v2';
const DEF_BRAND = { name: 'Presa', logo: null, logoRatio: null, accent: null, pageNum: true, showName: true };

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || !Array.isArray(d.slides) || !d.slides.length) return null;
    d.slides = d.slides.map((s) => ({ ...s, uid: window.CX.uid() }));
    return d;
  } catch (e) { return null; }
}

/* ============================================================ */
function ConstructorApp() {
  const draft = useRef(undefined);
  if (draft.current === undefined) draft.current = loadDraft();
  const forceNew = useRef(typeof location !== 'undefined' && /[?&]new=1/.test(location.search));
  const initialMode = useRef((typeof location !== 'undefined' && (location.search.match(/[?&]mode=(ai|paste|preset|blank)/) || [])[1]) || null);

  const [view, setView] = useState(draft.current && !forceNew.current ? 'editor' : 'wizard'); // wizard | editor
  const [slides, _setSlides] = useState(draft.current ? draft.current.slides : []);
  const [current, setCurrent] = useState(0);
  const [themeKey, setThemeKey] = useState(draft.current ? draft.current.themeKey || 'tech' : 'tech');
  const [deckTitle, setDeckTitle] = useState(draft.current ? draft.current.title || 'Без названия' : 'Без названия');
  const [brief, setBrief] = useState(draft.current ? draft.current.brief || null : null);
  const [brand, setBrand] = useState(draft.current && draft.current.brand ? { ...DEF_BRAND, ...draft.current.brand } : DEF_BRAND);
  const [tab, setTab] = useState('content');
  const [activeField, setActiveField] = useState(null);
  const [modal, setModal] = useState(null);            // null | 'add'
  const [busyAI, setBusyAI] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [saveState, setSaveState] = useState(draft.current ? 'saved' : 'idle');
  const [histVer, setHistVer] = useState(0);

  const hist = useRef({ past: [], future: [], lastTag: null, lastTime: 0 });
  const scrollPending = useRef(false);
  const dragFrom = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  if (window.PresaData.ensureTheme) window.PresaData.ensureTheme(themeKey);
  const theme = THEMES[themeKey] || THEMES.tech;
  const effTheme = useMemo(() => window.CXWiz ? window.CXWiz.applyBrand(theme, brand) : (brand.accent ? { ...theme, accent: brand.accent } : theme), [theme, brand.accent]);
  const cur = slides[current];
  const tpl = cur ? Lib.byId(cur.templateId) : null;

  const showToast = (title, sub, kind = 'ok') => {
    setToast({ title, sub, kind });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3200);
  };

  /* ---------- history-aware slide updates ---------- */
  const commit = useCallback((updater, tag) => {
    _setSlides((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next === prev) return prev;
      const H = hist.current;
      const now = Date.now();
      if (!(tag && tag === H.lastTag && now - H.lastTime < 900)) {
        H.past.push(prev);
        if (H.past.length > 60) H.past.shift();
        H.future = [];
      }
      H.lastTag = tag || null; H.lastTime = now;
      return next;
    });
    setHistVer((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    _setSlides((prev) => {
      const H = hist.current;
      if (!H.past.length) return prev;
      H.future.push(prev); H.lastTag = null;
      return H.past.pop();
    });
    setHistVer((v) => v + 1);
  }, []);
  const redo = useCallback(() => {
    _setSlides((prev) => {
      const H = hist.current;
      if (!H.future.length) return prev;
      H.past.push(prev); H.lastTag = null;
      return H.future.pop();
    });
    setHistVer((v) => v + 1);
  }, []);
  const canUndo = hist.current.past.length > 0;
  const canRedo = hist.current.future.length > 0;

  // keep current index in range after undo/redo/deletes
  useEffect(() => { if (current > slides.length - 1) setCurrent(Math.max(0, slides.length - 1)); }, [slides.length]);

  /* ---------- autosave ---------- */
  useEffect(() => {
    if (view !== 'editor') return;
    setSaveState('saving');
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ slides, themeKey, title: deckTitle, brief, brand, ts: Date.now() }));
        setSaveState('saved');
      } catch (e) { setSaveState('idle'); }
    }, 700);
    return () => window.clearTimeout(t);
  }, [slides, themeKey, deckTitle, brief, brand, view]);

  /* ---------- slide ops ---------- */
  const patchSlide = (i, patch, tag) => commit((ss) => ss.map((s, j) => j === i ? { ...s, ...patch } : s), tag);
  const setField = useCallback((key, value) => {
    commit((ss) => ss.map((s, j) => j === current ? { ...s, fields: { ...s.fields, [key]: value } } : s), `f:${current}:${key}`);
    setActiveField(key);
  }, [current, commit]);

  // inline edit from the canvas: whole field or one list item
  const inlineEdit = useCallback((key, idx, value) => {
    if (idx == null) {
      commit((ss) => ss.map((s, j) => j === current ? { ...s, fields: { ...s.fields, [key]: value } } : s), `f:${current}:${key}`);
    } else {
      commit((ss) => ss.map((s, j) => {
        if (j !== current) return s;
        const arr = Array.isArray(s.fields[key]) ? s.fields[key].slice() : [];
        arr[idx] = value;
        return { ...s, fields: { ...s.fields, [key]: arr } };
      }), `f:${current}:${key}:${idx}`);
    }
    setActiveField(key);
  }, [current, commit]);

  const addSlideFromTpl = (t, presetFields) => {
    const slide = window.CX.seedSlide(t.id);
    if (presetFields) slide.fields = presetFields;
    commit((ss) => {
      const n = ss.slice();
      n.splice(slides.length ? current + 1 : 0, 0, slide);
      return n;
    });
    setCurrent(slides.length ? current + 1 : 0);
    setModal(null); setTab('content'); setActiveField(null);
    showToast(presetFields ? 'Слайд создан по тексту' : 'Слайд добавлен', `${Lib.categoryLabel(t.category)} · ${t.name}`);
  };
  const duplicateSlide = (i) => {
    commit((ss) => { const copy = { ...ss[i], uid: window.CX.uid(), fields: JSON.parse(JSON.stringify(ss[i].fields)) }; const n = ss.slice(); n.splice(i + 1, 0, copy); return n; });
    setCurrent(i + 1);
  };
  const deleteSlide = (i) => {
    commit((ss) => ss.filter((_, j) => j !== i));
    setCurrent((c) => Math.max(0, c > i ? c - 1 : Math.min(i, slides.length - 2)));
  };
  const moveSlide = (from, to) => {
    if (from === to || from == null || to == null) return;
    commit((ss) => { const n = ss.slice(); const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; });
    setCurrent(to);
  };
  const toggleHidden = (i) => {
    const willHide = !slides[i].hidden;
    commit((ss) => ss.map((s, j) => j === i ? { ...s, hidden: !s.hidden } : s));
    showToast(willHide ? 'Слайд скрыт' : 'Слайд видим', willHide ? 'Не попадёт в экспорт PPTX' : 'Снова участвует в экспорте');
  };

  const changeCategory = (catId) => {
    const first = Lib.byCategory(catId)[0];
    patchSlide(current, { templateId: first.id, fields: window.CX.remapFields(first, cur.fields) });
    setActiveField(null);
  };

  // split the current slide's main collection across two slides of the same design
  const splitSlide = (i) => {
    const s = slides[i];
    if (!s) return;
    const t = Lib.byId(s.templateId);
    const pf = Lib.primaryField ? Lib.primaryField(t) : null;
    const arr = pf && Array.isArray(s.fields[pf.key]) ? s.fields[pf.key] : null;
    if (!pf || !arr || arr.length < 2) { showToast('Нечего разбивать', 'На слайде нет списка из 2+ элементов', 'warn'); return; }
    const half = Math.ceil(arr.length / 2);
    const a = arr.slice(0, half), b = arr.slice(half);
    const s1 = { ...s, fields: { ...s.fields, [pf.key]: JSON.parse(JSON.stringify(a)) } };
    const s2 = { uid: window.CX.uid(), templateId: s.templateId, fontScale: s.fontScale || 1, fields: JSON.parse(JSON.stringify({ ...s.fields, [pf.key]: b })) };
    if (s2.fields.title) s2.fields.title = String(s2.fields.title) + ' (2)';
    commit((ss) => { const n = ss.slice(); n.splice(i, 1, s1, s2); return n; });
    setCurrent(i); setActiveField(null);
    showToast('Слайд разбит на два', `${a.length} + ${b.length} элементов`);
  };

  // apply an action from a smart suggestion
  const applySuggestion = (i, action) => {
    if (action === 'split') return splitSlide(i);
    if (action && action.indexOf('category:') === 0) {
      const catId = action.split(':')[1];
      const first = Lib.byCategory(catId)[0];
      if (!first) return;
      setCurrent(i);
      patchSlide(i, { templateId: first.id, fields: window.CX.remapFields(first, slides[i].fields) });
      setActiveField(null); setTab('content');
      showToast('Категория изменена', Lib.categoryLabel(catId) + ' — проверьте поля');
    }
  };
  const setVariant = (v) => {
    patchSlide(current, { templateId: v.id, fields: window.CX.remapFields(v, cur.fields) });
  };

  /* ---------- active field: canvas ↔ panel ---------- */
  const onFieldClick = (key) => {
    setActiveField(key);
    setTab('content');
    scrollPending.current = true;
  };
  useEffect(() => {
    if (!scrollPending.current || tab !== 'content' || !activeField) return;
    scrollPending.current = false;
    const id = window.setTimeout(() => {
      const body = document.getElementById('cx-editbody');
      if (!body) return;
      const el = body.querySelector(`[data-fekey="${activeField}"]`);
      if (!el) return;
      const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 14;
      body.scrollTo({ top, behavior: 'smooth' });
      const inp = el.querySelector('input, textarea');
      if (inp) inp.focus({ preventScroll: true });
    }, 40);
    return () => window.clearTimeout(id);
  }, [activeField, tab, current]);

  /* ---------- overflow actions ---------- */
  const onOverflowAction = (action, key) => {
    if (!tpl) return;
    if (action === 'shorten') {
      const defs = [...tpl.requiredFields, ...(tpl.optionalFields || [])];
      const def = defs.find((d) => d.key === key);
      if (def && def.maxLength) {
        setField(key, window.CX.truncateSmart(String(cur.fields[key] || ''), def.maxLength));
        showToast('Текст сокращён', `«${def.label}» теперь помещается в дизайн`);
      }
    } else if (action === 'shrink') {
      const next = Math.max(0.84, (cur.fontScale || 1) - 0.08);
      patchSlide(current, { fontScale: next });
      showToast('Шрифт уменьшен', 'Вернуть можно во вкладке «Дизайн»');
    } else if (action === 'template') {
      setTab('design');
    }
  };

  /* ---------- AI ---------- */
  const runAI = (action) => {
    if (!tpl) return;
    if (action === 'autofill' && !brief) {
      showToast('Сначала заполните бриф', 'Создайте презентацию через мастер с режимом ИИ', 'warn');
      setView('wizard');
      return;
    }
    setBusyAI(action);
    window.setTimeout(() => {
      try {
        if (action === 'autofill') {
          const bf = { companyName: brief.company, industry: brief.industry, targetAudience: brief.audience, offer: brief.solution, goal: brief.goal };
          patchSlide(current, { fields: AI.autofillFromBrief(tpl, bf) });
          showToast('Слайд заполнен по брифу', 'Поля адаптированы под выбранный дизайн');
        } else {
          const { fields, explanation } = AI.improveSlideFields(tpl, cur.fields, action);
          patchSlide(current, { fields });
          showToast('Текст обновлён', explanation);
        }
      } catch (e) { showToast('Не удалось применить', 'Попробуйте ещё раз', 'warn'); }
      finally { setBusyAI(false); }
    }, 480);
  };

  /* ---------- flows ---------- */
  const onWizardComplete = (res) => {
    if (window.PresaData.THEMES[res.themeKey]) setThemeKey(res.themeKey);
    setBrand({ ...DEF_BRAND, ...res.brand });
    setBrief(res.brief || null);
    setDeckTitle(res.title || 'Без названия');
    commit(res.slides || []);
    setCurrent(0); setTab('content'); setActiveField(null);
    setView('editor');
    if (res.openLibrary) setModal('add');
    if (res.slides && res.slides.length) {
      const nm = (window.PresaData.THEMES[res.themeKey] || {}).name || '';
      showToast('Презентация готова', `${res.slides.length} слайдов${nm ? ' · ' + nm : ''} — редактируйте каждый`);
    }
  };
  const startManual = () => { commit([]); setCurrent(0); setView('editor'); setModal('add'); };
  const startPreset = (key) => {
    commit(window.CXScreens.buildPreset(key));
    setCurrent(0); setView('editor'); setTab('content');
    setDeckTitle(window.CXScreens.PRESETS[key].label);
    showToast('Сценарий готов', 'Замените примеры на свой контент');
  };
  const onBriefGenerate = (briefForm, deck) => {
    setBrief(briefForm);
    commit(deck);
    setCurrent(0); setView('editor'); setTab('content');
    if (briefForm.company.trim()) setDeckTitle(briefForm.company.trim());
    if (THEMES[briefForm.tone]) setThemeKey(briefForm.tone);
    showToast('Структура готова', `${deck.length} слайдов собрано по брифу — редактируйте каждый`);
  };
  const resetAll = () => {
    commit([]); setBrief(null); setDeckTitle('Без названия'); setBrand(DEF_BRAND); setView('wizard'); setActiveField(null);
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  };

  /* ---------- export ---------- */
  const handleExport = async () => {
    if (!slides.length) return;
    const visible = slides.filter((s) => !s.hidden);
    if (!visible.length) { showToast('Все слайды скрыты', 'Включите хотя бы один слайд для экспорта', 'warn'); return; }
    setExporting(true);
    try {
      await window.exportDeckPPTX(visible, effTheme, brand);
      const skipped = slides.length - visible.length;
      showToast('PPTX готов', skipped ? `Файл скачивается · скрытых слайдов пропущено: ${skipped}` : 'Файл использует шрифт Manrope — установите фирменные шрифты, если он не отображается', 'ok');
    } catch (e) { showToast('Не удалось собрать PPTX', String((e && e.message) || e), 'warn'); }
    finally { setExporting(false); }
  };
  const handleExportPDF = async () => {
    if (!slides.length) return;
    const visible = slides.filter((s) => !s.hidden);
    if (!visible.length) { showToast('Все слайды скрыты', 'Включите хотя бы один слайд для экспорта', 'warn'); return; }
    setExporting(true);
    try {
      await buildDeckPDF(visible, effTheme, brand, deckTitle);
      showToast('Готовим PDF', 'Откроется окно печати — выберите «Сохранить как PDF»');
    } catch (e) { showToast('Не удалось собрать PDF', String((e && e.message) || e), 'warn'); }
    finally { setExporting(false); }
  };
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify({ title: deckTitle, themeKey, brand, slides }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (deckTitle || 'presa') + '.json';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  /* ---------- keyboard ---------- */
  useEffect(() => {
    if (view !== 'editor') return;
    const onKey = (e) => {
      const inField = e.target && (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !inField) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (inField) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setCurrent((c) => Math.min(c + 1, slides.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCurrent((c) => Math.max(c - 1, 0)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, slides.length, undo, redo]);

  /* ---------- audits ---------- */
  const deckAudits = useMemo(() => slides.map((s) => {
    const t = Lib.byId(s.templateId);
    const a = window.CX.auditSlide(t, s.fields);
    const suggestions = window.CX.suggestSlide(t, s.fields);
    return { category: t.category, level: a.level, issues: a.issues, suggestions };
  }), [slides]);
  const deckNotes = useMemo(() => window.CX.auditDeck(slides), [slides]);
  const issueCount = deckAudits.reduce((m, a) => m + a.issues.filter((i) => i.level !== 'info').length + a.suggestions.filter((s) => s.level === 'warn').length, 0);
  const curAudit = deckAudits[current];

  const variants = tpl ? Lib.byCategory(tpl.category) : [];

  /* ============ RENDER ============ */
  return h('div', { className: 'cx' },
    h(TopBar, {
      view, deckTitle, setDeckTitle, saveState, canUndo, canRedo, undo, redo,
      onHome: () => { window.location.href = 'index.html'; }, onReset: resetAll,
      handleExport, handleExportPDF, handleExportJSON, exporting, hasSlides: slides.length > 0,
      openFonts: () => setModal('fonts')
    }),

    view === 'wizard' ? h(window.PresaWizard, { onComplete: onWizardComplete, onExit: () => { window.location.href = 'index.html'; }, initialMode: initialMode.current }) :

    h('div', { className: 'cx-work', 'data-screen-label': 'Редактор' },
      // LEFT: slides
      h('div', { className: 'cx-col cx-col--list', 'data-screen-label': 'Список слайдов' },
        h('div', { className: 'cx-listhead' }, h('h3', null, 'Слайды'), h('span', null, String(slides.length).padStart(2, '0'))),
        slides.length ? h('div', { className: 'cx-slides' },
          slides.map((s, i) => {
            const t = Lib.byId(s.templateId);
            const a = deckAudits[i];
            return h('div', {
              key: s.uid,
              className: 'cx-slide' + (i === current ? ' on' : '') + (dragOver === i ? ' dragover' : '') + (s.hidden ? ' is-hidden' : ''),
              onClick: () => { setCurrent(i); setActiveField(null); },
              draggable: true,
              onDragStart: () => { dragFrom.current = i; },
              onDragOver: (e) => { e.preventDefault(); if (dragOver !== i) setDragOver(i); },
              onDragLeave: () => setDragOver((d) => d === i ? null : d),
              onDrop: (e) => { e.preventDefault(); moveSlide(dragFrom.current, i); dragFrom.current = null; setDragOver(null); },
              onDragEnd: () => { dragFrom.current = null; setDragOver(null); }
            },
              h('div', { className: 'cx-slide__drag', title: 'Перетащите для сортировки' }, h(Svg, { d: I.drag, s: 14 })),
              h('div', { className: 'cx-slide__thumb' },
                h(window.CX.MiniSlide, { template: t, fields: s.fields, theme: effTheme, n: i + 1, total: slides.length, brand }),
                s.hidden ? h('span', { className: 'cx-slide__hidden', title: 'Слайд скрыт — не попадёт в экспорт' }, h(Svg, { d: I.eyeOff, s: 12, w: 2.4 })) : null,
                a.level !== 'ok' ? h('span', { className: 'cx-slide__status cx-sstat--' + a.level, title: a.issues.map((x) => x.message).join('\n') }) : null),
              h('div', { className: 'cx-slide__meta' },
                h('span', { className: 'cx-slide__n' }, String(i + 1).padStart(2, '0')),
                h('span', { className: 'cx-slide__cat' }, Lib.categoryLabel(t.category)),
                h('div', { className: 'cx-slide__tools' },
                  h('button', { className: 'cx-stool', title: s.hidden ? 'Показать слайд' : 'Скрыть слайд (не попадёт в экспорт)', onClick: (e) => { e.stopPropagation(); toggleHidden(i); } }, h(Svg, { d: s.hidden ? I.eyeOff : I.eye, s: 14 })),
                  h('button', { className: 'cx-stool', title: 'Дублировать', onClick: (e) => { e.stopPropagation(); duplicateSlide(i); } }, h(Svg, { d: I.copy, s: 14 })),
                  h('button', { className: 'cx-stool cx-stool--rm', title: 'Удалить', onClick: (e) => { e.stopPropagation(); deleteSlide(i); }, disabled: slides.length <= 1 }, h(Svg, { d: I.trash, s: 14 })))));
          })) : h('div', { className: 'cx-listempty' }, 'Слайдов пока нет'),
        h('button', { className: 'cx-addslide', onClick: () => setModal('add') }, h(Svg, { d: I.plus, s: 16 }), 'Добавить слайд')),

      // CENTER: canvas or empty state
      h('div', { className: 'cx-col cx-col--stage' },
        cur && tpl
          ? h(window.CXCanvasStage, {
              slide: cur, tpl, theme: effTheme, current, total: slides.length,
              activeField, audit: curAudit,
              onFieldClick,
              onInlineEdit: inlineEdit,
              brand,
              onVariant: setVariant,
              onOpenLibrary: () => setModal('add'),
              onOpenCheck: () => setTab('check'),
              suggestions: curAudit ? curAudit.suggestions : [],
              onSuggest: (action) => applySuggestion(current, action),
              onPrev: () => setCurrent((c) => Math.max(0, c - 1)),
              onNext: () => setCurrent((c) => Math.min(slides.length - 1, c + 1))
            })
          : h('div', { className: 'cx-empty', 'data-screen-label': 'Пустая презентация' },
              h('div', { className: 'cx-empty__pic' }, h(Svg, { d: I.layers, s: 26 })),
              h('h3', null, 'Презентация пока пуста'),
              h('p', null, 'Добавьте первый слайд из библиотеки дизайнов — или дайте ИИ собрать структуру по брифу.'),
              h('div', { className: 'cx-empty__btns' },
                h('button', { className: 'btn btn-primary', onClick: () => setModal('add') }, h(Svg, { d: I.plus, s: 15 }), 'Добавить слайд'),
                h('button', { className: 'btn btn-ghost', onClick: () => setView('wizard') }, h(Svg, { d: I.spark, s: 15 }), 'Собрать заново через мастер')))),

      // RIGHT: tabs
      cur && tpl
        ? h(window.CXRightPanel, {
            tab, setTab, badgeCount: issueCount,
            tpl, cur, theme: effTheme, setField, changeCategory,
            activeField, onFocusField: setActiveField, onOverflowAction,
            themeKey, setThemeKey, variants, onVariant: setVariant,
            brand, setBrand,
            setFontScale: (v) => patchSlide(current, { fontScale: v }, 'fs:' + current),
            setFontScaleAll: (v) => { commit((ss) => ss.map((s) => ({ ...s, fontScale: v })), 'fs:all'); showToast('Размер текста применён', `${Math.round(v * 100)}% на всех слайдах (${slides.length})`); },
            current, total: slides.length,
            runAI, busyAI, brief,
            slides, deckAudits, deckNotes,
            onGoIssue: (i, field) => { setCurrent(i); if (field) { setActiveField(field); setTab('content'); scrollPending.current = true; } },
            onSuggest: applySuggestion
          })
        : h('div', { className: 'cx-col cx-col--edit cx-panelempty' },
            h(Svg, { d: I.textT, s: 20 }),
            h('p', null, 'Добавьте слайд, чтобы редактировать контент'))),

    modal === 'add' ? h(window.CXScreens.AddSlideModal, { theme: effTheme, onAdd: addSlideFromTpl, onClose: () => setModal(null) }) : null,
    modal === 'fonts' ? h(FontsModal, { onClose: () => setModal(null) }) : null,

    toast ? h('div', { className: 'cx-toast show' },
      h('span', { className: 'cx-toast__ic cx-toast__ic--' + (toast.kind === 'warn' ? 'warn' : 'ok') }, h(Svg, { d: toast.kind === 'warn' ? I.warn : I.check, s: 15, w: 2.4 })),
      h('div', { className: 'cx-toast__body' }, h('b', null, toast.title), toast.sub ? h('span', null, toast.sub) : null)) : null
  );
}

/* ---------------- PDF EXPORT (print pipeline) ---------------- */
// Renders every visible slide at a fixed 16:9 size into an offscreen root,
// then opens a print-ready window (one slide per landscape page) so the user
// can save a vector PDF. Shares SlideRenderer with the preview + PPTX export.
function buildDeckPDF(visible, theme, brand, deckTitle) {
  return new Promise((resolve, reject) => {
    try {
      const PAGE_W = 1280, PAGE_H = 720;
      const holder = document.createElement('div');
      holder.setAttribute('aria-hidden', 'true');
      holder.style.cssText = 'position:fixed;left:-100000px;top:0;width:' + PAGE_W + 'px;opacity:0;pointer-events:none;z-index:-1;';
      document.body.appendChild(holder);
      const root = ReactDOM.createRoot(holder);
      const total = visible.length;
      const pages = visible.map((s, i) => {
        const tpl = Lib.byId(s.templateId);
        const fit = Fit.fitSlideContent(tpl, s.fields);
        const scale = fit.scale * (s.fontScale || 1);
        return h('div', { key: i, className: 'pdf-page', style: { width: PAGE_W + 'px', height: PAGE_H + 'px', overflow: 'hidden' } },
          h(window.SlideRenderer, { template: tpl, fields: fit.fields, theme, scale, slideNumber: i + 1, total, brand: brand || 'Presa' }));
      });
      root.render(h(React.Fragment, null, pages));
      window.setTimeout(() => {
        const imgs = Array.prototype.slice.call(holder.querySelectorAll('img'));
        Promise.all(imgs.map((im) => im.complete ? Promise.resolve() : new Promise((res) => { im.onload = res; im.onerror = res; })))
          .then(() => {
            const html = holder.innerHTML;
            try { root.unmount(); } catch (e) {}
            holder.remove();
            openPrintWindow(html, deckTitle, PAGE_W, PAGE_H);
            resolve();
          })
          .catch((e) => {
            try { root.unmount(); } catch (e2) {}
            try { holder.remove(); } catch (e2) {}
            reject(e);
          });
      }, 280);
    } catch (e) { reject(e); }
  });
}

function openPrintWindow(bodyHTML, title, W, H) {
  const win = window.open('', '_blank');
  if (!win) throw new Error('Браузер заблокировал окно. Разрешите всплывающие окна и повторите.');
  const safe = String(title || 'Презентация').replace(/[<>&]/g, '');
  const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">';
  const css = [
    '@page { size: ' + W + 'px ' + H + 'px; margin: 0; }',
    '* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
    ':root { --font-sans: \'Manrope\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; --font-mono: \'JetBrains Mono\', ui-monospace, \'SF Mono\', monospace; }',
    'html, body { margin: 0; padding: 0; background: #fff; font-family: var(--font-sans); }',
    '.pdf-page { width: ' + W + 'px; height: ' + H + 'px; overflow: hidden; position: relative; page-break-after: always; break-after: page; }',
    '.pdf-page:last-child { page-break-after: auto; break-after: auto; }',
    '.pdf-page .slide { width: ' + W + 'px !important; height: ' + H + 'px !important; aspect-ratio: auto !important; }',
    '@media screen { body { background:#2a2d33; padding: 60px 16px 16px; display:flex; flex-direction:column; gap:16px; align-items:center; } .pdf-page { box-shadow: 0 10px 34px rgba(0,0,0,.45); } .pdf-hint { position: fixed; top:0; left:0; right:0; z-index:9; background:#0E1116; color:#fff; font: 600 13px/1.4 var(--font-sans); padding: 13px 16px; text-align:center; } .pdf-hint b { color:#F0463E; } }',
    '@media print { .pdf-hint { display:none !important; } }'
  ].join('\n');
  win.document.open();
  win.document.write('<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>' + safe + '</title>' + fonts + '<style>' + css + '</style></head><body><div class="pdf-hint">Окно печати откроется автоматически. В принтере выберите <b>«Сохранить как PDF»</b>, поля — <b>Нет</b>.</div>' + bodyHTML + '</body></html>');
  win.document.close();
  const trigger = () => { try { win.focus(); win.print(); } catch (e) {} };
  try {
    if (win.document.fonts && win.document.fonts.ready) {
      win.document.fonts.ready.then(() => window.setTimeout(trigger, 350));
    } else {
      window.setTimeout(trigger, 800);
    }
  } catch (e) { window.setTimeout(trigger, 800); }
}

/* ---------------- BRAND FONTS MODAL ---------------- */
function FontsModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const FONTS = [
    { name: 'Manrope', sub: 'Основной шрифт — заголовки и текст', href: 'assets/fonts/Manrope-VariableFont_wght.ttf', file: 'Manrope.ttf' },
    { name: 'JetBrains Mono', sub: 'Моноширинный — надзаголовки и нумерация', href: 'assets/fonts/JetBrainsMono-VariableFont_wght.ttf', file: 'JetBrainsMono.ttf' }
  ];
  return h('div', { className: 'cx-overlay', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
    h('div', { className: 'cx-fontmodal', 'data-screen-label': 'Фирменные шрифты' },
      h('button', { className: 'cx-modal__close', onClick: onClose }, h(Svg, { d: I.close, s: 16 })),
      h('div', { className: 'cx-fontmodal__head' },
        h('h2', null, 'Фирменные шрифты'),
        h('p', null, 'Редактируемый PowerPoint использует шрифты Manrope и JetBrains Mono. Если их нет на компьютере, PowerPoint заменит их и вид «съедет». Установите шрифты один раз — и презентация будет выглядеть как в редакторе.')),
      h('div', { className: 'cx-fontmodal__list' },
        FONTS.map((f) => h('div', { className: 'cx-fontrow', key: f.name },
          h('div', { className: 'cx-fontrow__tx' },
            h('b', { style: { fontFamily: "'" + f.name + "', var(--font-sans)" } }, f.name),
            h('span', null, f.sub)),
          h('a', { className: 'btn btn-primary btn-sm', href: f.href, download: f.file },
            h(Svg, { d: I.download, s: 14 }), 'Скачать .ttf')))),
      h('div', { className: 'cx-fontmodal__how' },
        h('div', { className: 'cx-fontmodal__col' },
          h('div', { className: 'cx-fontmodal__lbl' }, 'Windows'),
          h('p', null, 'Откройте скачанный файл .ttf → кнопка «Установить». Затем перезапустите PowerPoint.')),
        h('div', { className: 'cx-fontmodal__col' },
          h('div', { className: 'cx-fontmodal__lbl' }, 'macOS'),
          h('p', null, 'Откройте файл .ttf → «Установить шрифт» в приложении «Шрифты». Перезапустите PowerPoint.'))),
      h('div', { className: 'cx-fontmodal__note' },
        h(Svg, { d: I.info, s: 14 }),
        h('span', null, 'Совет: чтобы файл открывался одинаково у всех, в PowerPoint можно встроить шрифты — «Файл → Параметры → Сохранение → Внедрить шрифты в файл».'))));
}

/* ---------------- EXPORT MENU (PDF / PPTX) ---------------- */
function ExportMenu({ handleExport, handleExportPDF, exporting, hasSlides, openFonts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const pick = (fn) => { setOpen(false); fn(); };
  return h('div', { className: 'cx-export', ref },
    h('button', { className: 'btn btn-primary btn-sm cx-export__btn', onClick: () => setOpen((v) => !v), disabled: exporting || !hasSlides, 'aria-haspopup': 'menu', 'aria-expanded': open },
      exporting ? 'Сборка…' : h(React.Fragment, null, h(Svg, { d: I.download, s: 15 }), 'Скачать презентацию', h(Svg, { d: I.chevronDown, s: 14, w: 2.4 }))),
    open ? h('div', { className: 'cx-export__menu', role: 'menu' },
      h('button', { className: 'cx-export__item', role: 'menuitem', onClick: () => pick(handleExportPDF) },
        h('span', { className: 'cx-export__ic' }, h(Svg, { d: I.file, s: 16 })),
        h('span', { className: 'cx-export__txt' }, h('b', null, 'PDF'), h('span', null, 'Для просмотра и печати'))),
      h('button', { className: 'cx-export__item', role: 'menuitem', onClick: () => pick(handleExport) },
        h('span', { className: 'cx-export__ic' }, h(Svg, { d: I.layers, s: 16 })),
        h('span', { className: 'cx-export__txt' }, h('b', null, 'PowerPoint (.pptx)'), h('span', null, 'Редактируемый файл'))),
      h('button', { className: 'cx-export__item', role: 'menuitem', onClick: () => { setOpen(false); openFonts && openFonts(); } },
        h('span', { className: 'cx-export__ic' }, h(Svg, { d: I.textT || I.file, s: 16 })),
        h('span', { className: 'cx-export__txt' }, h('b', null, 'Фирменные шрифты'), h('span', null, 'Чтобы PPTX выглядел как в редакторе')))) : null);
}

/* ---------------- TOP BAR ---------------- */
function TopBar({ view, deckTitle, setDeckTitle, saveState, canUndo, canRedo, undo, redo, onHome, onReset, handleExport, handleExportPDF, handleExportJSON, exporting, hasSlides, openFonts }) {
  const editor = view === 'editor';
  return h('header', { className: 'cx-bar', 'data-screen-label': 'Верхняя панель' },
    h('div', { className: 'cx-bar__l' },
      h('a', { className: 'cx-brand', href: 'index.html', title: 'Presa — на главную' },
        h('span', { className: 'mk' }, h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' },
          h('rect', { x: 5, y: 6, width: 14, height: 2.6, rx: 1.3, fill: '#fff' }),
          h('rect', { x: 5, y: 10.7, width: 14, height: 2.6, rx: 1.3, fill: '#fff', opacity: .6 }),
          h('rect', { x: 5, y: 15.4, width: 8.5, height: 2.6, rx: 1.3, fill: '#fff', opacity: .38 }))),
        'Presa'),
      h('div', { className: 'cx-bar__div' }),
      h('nav', { className: 'cx-crumbs' },
        h('button', { className: 'cx-crumb', onClick: onHome }, 'Мои презентации'),
        h('span', { className: 'cx-crumb__sep' }, '/'),
        editor
          ? h('input', {
              className: 'cx-titleinput', value: deckTitle, 'aria-label': 'Название презентации',
              onChange: (e) => setDeckTitle(e.target.value),
              onBlur: (e) => { if (!e.target.value.trim()) setDeckTitle('Без названия'); }
            })
          : h('span', { className: 'cx-crumb cx-crumb--cur' }, view === 'brief' ? 'Умный бриф' : 'Новая презентация'))),
    h('div', { className: 'cx-bar__r' },
      editor ? h('div', { className: 'cx-save' + (saveState === 'saving' ? ' busy' : '') },
        h(Svg, { d: I.cloud, s: 14 }),
        saveState === 'saving' ? 'Сохранение…' : saveState === 'saved' ? 'Сохранено' : 'Черновик') : null,
      editor ? h('div', { className: 'cx-bar__div' }) : null,
      editor ? h('button', { className: 'cx-iconbtn', title: 'Отменить (Ctrl+Z)', disabled: !canUndo, onClick: undo }, h(Svg, { d: I.undo, s: 16 })) : null,
      editor ? h('button', { className: 'cx-iconbtn', title: 'Повторить (Ctrl+Shift+Z)', disabled: !canRedo, onClick: redo }, h(Svg, { d: I.redo, s: 16 })) : null,
      editor ? h('div', { className: 'cx-bar__div' }) : null,
      editor ? h('button', { className: 'cx-iconbtn', title: 'Начать заново', onClick: onReset }, h(Svg, { d: I.trash, s: 15 })) : null,
      editor ? h('button', { className: 'cx-iconbtn', title: 'Скачать проект (.json)', onClick: handleExportJSON, disabled: !hasSlides }, h(Svg, { d: I.file, s: 15 })) : null,
      editor ? h(ExportMenu, { handleExport, handleExportPDF, exporting, hasSlides, openFonts }) : null));
}

window.PresaConstructor = ConstructorApp;
