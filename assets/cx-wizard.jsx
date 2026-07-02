/* global React, CX, CXWiz, PresaData, PresaTemplates */
/* ============================================================
   Presa — Guided wizard shell
   Owns wizard state, the step rail, per-step navigation, and the
   sticky footer. Calls onComplete(result) to hand off to the editor.
   ============================================================ */
const { useState, useMemo, useEffect } = React;
const wzh = React.createElement;

function WizardApp({ onComplete, onExit, initialMode }) {
  const W = window.CXWiz;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;
  const THEMES = window.PresaData.THEMES;

  const [mode, setMode] = useState(null);
  const [designId, setDesignId] = useState(null);
  const [brand, setBrand] = useState({ name: 'Presa', logo: null, logoRatio: null, accent: null, accent2: null, pageNum: true, bg: 'light' });
  const [ptype, setPtype] = useState(null);
  const [brief, setBrief] = useState({ company: '', industry: '', audience: '', goal: window.PresaData.GOALS[0], offer: '', problem: '', proofs: '', tone: 'expert', slideCount: 9 });
  const [pasteSlides, setPasteSlides] = useState(() => window.CXWiz.defaultBlocks());
  const [promptText, setPromptText] = useState('');
  const [genMode, setGenMode] = useState('faithful');
  const [deckTitle, setDeckTitle] = useState('');
  const [plan, setPlan] = useState([]);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  const PIPE = {
    ai: ['mode', 'design', 'brand', 'prompt', 'structure'],
    paste: ['mode', 'design', 'brand', 'type', 'paste', 'structure'],
    preset: ['mode', 'design', 'brand', 'type', 'structure'],
    blank: ['mode', 'design', 'brand']
  };
  const pipe = mode ? PIPE[mode] : ['mode'];
  const step = pipe[Math.min(idx, pipe.length - 1)] || 'mode';
  const last = idx >= pipe.length - 1;

  const design = W.DESIGNS.find((d) => d.id === designId);
  const tv = design ? W.themeVariant(design.themeKey, brand.bg) : W.themeVariant('tech', 'light');
  const previewTheme = W.applyBrand(tv.theme, brand);

  const data = { mode, designId, brand, ptype, brief, pasteSlides, promptText, genMode, deckTitle, themeKey: tv.key };

  // build the plan when arriving at the structure step
  // ai mode → real model call (async); others → quick local build
  useEffect(() => {
    if (step !== 'structure') return;
    if (plan.length) return;
    let cancelled = false;
    setBusy(true);
    if (mode === 'ai') {
      if (genMode === 'faithful' && W.buildFaithfulPlan) {
        const tf = window.setTimeout(() => { if (!cancelled) { setPlan(W.buildFaithfulPlan(data)); setBusy(false); } }, 400);
        return () => { cancelled = true; window.clearTimeout(tf); };
      }
      if (W.buildPromptPlanAI) {
        W.buildPromptPlanAI(data)
          .then((p) => { if (!cancelled) { setPlan(p && p.length ? p : W.buildPlan(data)); setBusy(false); } })
          .catch(() => { if (!cancelled) { setPlan(W.buildPlan(data)); setBusy(false); } });
        return () => { cancelled = true; };
      }
    }
    const t = window.setTimeout(() => { if (!cancelled) { setPlan(W.buildPlan(data)); setBusy(false); } }, mode === 'preset' ? 250 : 950);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [step]); // eslint-disable-line

  /* ---- navigation ---- */
  const pickMode = (m) => { setMode(m); setPlan([]); setIdx(1); };

  // deep-link from the home screen: ?mode=ai|paste|preset|blank → skip the
  // duplicate "choose method" step and land on the first real step.
  useEffect(() => {
    if (initialMode && PIPE[initialMode]) { setMode(initialMode); setIdx(1); }
  }, []); // eslint-disable-line
  const pickDesign = (id) => {
    const d = W.DESIGNS.find((x) => x.id === id);
    setDesignId(id);
    setBrand((b) => ({ ...b, bg: d.bg, accent: b.accent || THEMES[d.themeKey].accent }));
  };

  // Quick start: open the editor immediately with a ready deck in this style.
  const quickStart = (id) => {
    const d = W.DESIGNS.find((x) => x.id === id);
    if (!d) return;
    const b = { ...brand, bg: d.bg, accent: brand.accent || THEMES[d.themeKey].accent };
    const tvv = W.themeVariant(d.themeKey, b.bg);
    const starter = W.buildStarterDeck(d);
    onComplete({ themeKey: tvv.key, brand: b, slides: W.planToSlides(starter), title: d.name, brief: null, openLibrary: false });
  };

  // Blank: open an empty editor with the design library, user assembles it themselves.
  const blankStart = () => {
    const tvv = W.themeVariant('corporate', 'light');
    onComplete({ themeKey: tvv.key, brand: { ...brand, bg: 'light' }, slides: [], title: 'Новая презентация', brief: null, openLibrary: true });
  };

  const canNext = () => {
    if (step === 'design') return !!designId;
    if (step === 'type') return !!ptype;
    if (step === 'brief') return brief.company.trim() && brief.audience.trim();
    if (step === 'prompt') return (promptText || '').trim().length >= 20;
    if (step === 'paste') return W.blocksFilled(pasteSlides) > 0;
    if (step === 'structure') return plan.length > 0 && !busy;
    return true;
  };

  const finish = () => {
    if (mode === 'blank') {
      onComplete({ themeKey: tv.key, brand, slides: [], title: deckTitle || (design ? design.name : 'Презентация'), brief: null, openLibrary: true });
      return;
    }
    const p = plan.length ? plan : W.buildPlan(data);
    const title = deckTitle.trim() || (mode === 'ai' && p[0] && p[0].title) || (design ? design.name : 'Презентация');
    onComplete({ themeKey: tv.key, brand, slides: W.planToSlides(p), title: title || 'Без названия', brief: mode === 'ai' ? null : null, openLibrary: false });
  };

  const next = () => { if (!canNext()) return; if (last) finish(); else setIdx(idx + 1); };
  const back = () => { if (idx === 0) onExit(); else { if (step === 'structure') setPlan([]); setIdx(idx - 1); } };
  const jump = (i) => { if (i < idx) { if (step === 'structure') setPlan([]); setIdx(i); } };

  // changing inputs that feed the plan invalidates a built plan
  useEffect(() => { if (step !== 'structure') setPlan([]); }, [mode, designId, ptype, brief, pasteSlides, promptText, genMode]); // eslint-disable-line

  const nextLabel = step === 'prompt' ? 'Разобрать текст'
    : !last ? 'Далее'
    : mode === 'blank' ? 'Создать презентацию'
    : step === 'structure' ? (mode === 'ai' ? 'Сгенерировать презентацию' : 'Открыть в редакторе') : 'Готово';

  /* ---- render current step ---- */
  let screen = null;
  if (step === 'mode') screen = wzh(W.ModeStep, { mode, onPick: pickMode });
  else if (step === 'design') screen = wzh(W.DesignStep, { designId, onSelect: pickDesign, onQuickStart: quickStart, onBlank: blankStart });
  else if (step === 'brand') screen = wzh(W.BrandStep, { brand, setBrand, design, theme: previewTheme });
  else if (step === 'type') screen = wzh(W.TypeStep, { ptype, onSelect: setPtype });
  else if (step === 'brief') screen = wzh(W.BriefStep, { brief, setBrief, ptype: ptype || 'free' });
  else if (step === 'prompt') screen = wzh(W.PromptStep, { promptText, setPromptText, deckTitle, setDeckTitle, genMode, setGenMode });
  else if (step === 'paste') screen = wzh(W.PasteStep, { pasteSlides, setPasteSlides, deckTitle, setDeckTitle });
  else if (step === 'structure') screen = wzh(W.StructureStep, { plan, setPlan, theme: previewTheme, brand, data, busy });

  return wzh('div', { className: 'wz', 'data-screen-label': 'Мастер создания' },
    wzh(W.Rail, { pipe, idx, onJump: jump }),
    wzh('div', { className: 'wz-body' }, wzh('div', { className: 'wz-inner' }, screen)),
    wzh('div', { className: 'wz-foot' },
      wzh('button', { className: 'btn btn-ghost', onClick: back }, wzh(Svg, { d: I.back, s: 16 }), idx === 0 ? 'На главную' : 'Назад'),
      wzh('div', { className: 'wz-foot__mid' },
        wzh(Svg, { d: I.spark, s: 14 }),
        wzh('span', { className: 'wz-foot__help' }, 'Нужна помощь? ',
          wzh('button', { className: 'wz-foot__hlink', onClick: () => { setMode('ai'); setPlan([]); setIdx(PIPE.ai.indexOf('prompt')); } }, 'Создать с помощью ИИ'))),
      wzh('button', { className: 'btn btn-primary', onClick: next, disabled: !canNext() },
        nextLabel, wzh(Svg, { d: step === 'structure' || mode === 'blank' && last ? I.chevR : I.chevR, s: 16 }))));
}

window.PresaWizard = WizardApp;
