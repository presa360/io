/* global React, CX, CXWiz, PresaData, PresaTemplates */
/* ============================================================
   Presa — Guided wizard, part 2
   The AI brief form and the structure-preview screen.
   Assigns BriefStep + StructureStep onto window.CXWiz.
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useState, useMemo } = React;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;
  const Lib = window.PresaTemplates;
  const W = window.CXWiz;

  /* ============== BRIEF ============== */
  function BriefStep({ brief, setBrief, ptype }) {
    const { GOALS, INDUSTRIES } = window.PresaData;
    const type = W.TYPES.find((t) => t.id === ptype) || W.TYPES[0];
    const set = (k, v) => setBrief((b) => ({ ...b, [k]: v }));
    const seq = useMemo(() => {
      const flow = type.flow.slice();
      const target = W.clamp(brief.slideCount || flow.length, 5, 16);
      return flowAdjust(flow, target);
    }, [ptype, brief.slideCount]);

    function flowAdjust(flow, target) {
      const pool = ['benefits', 'numbers', 'case_study', 'process', 'comparison', 'roadmap', 'services', 'team', 'pricing'];
      let f = flow.slice();
      while (f.length > target && f.length > 2) f.splice(f.length - 2, 1);
      let pi = 0;
      while (f.length < target && pi < pool.length * 2) { if (!f.includes(pool[pi % pool.length])) f.splice(f.length - 1, 0, pool[pi % pool.length]); pi++; }
      return f;
    }

    const Field = (key, label, opts = {}) => h('div', { className: 'wz-fld' + (opts.grow ? ' wz-fld--grow' : '') },
      h('label', null, label, opts.req ? h('span', { className: 'req' }, ' *') : opts.opt ? h('span', { className: 'wz-fld__opt' }, ' необязательно') : null),
      opts.area
        ? h('textarea', { className: 'fe-input fe-textarea', rows: opts.rows || 3, placeholder: opts.ph || '', value: brief[key], onChange: (e) => set(key, e.target.value) })
        : h('input', { className: 'fe-input', placeholder: opts.ph || '', list: opts.list, value: brief[key], onChange: (e) => set(key, e.target.value) }));

    return h('div', { className: 'wz-screen wz-screen--wide', 'data-screen-label': 'Бриф для ИИ' },
      h(W.StepHead, { eyebrow: 'ШАГ 5 · БРИФ', title: 'Расскажите о презентации', sub: 'Чем подробнее ответы, тем точнее ИИ соберёт структуру и тексты. Обязательны два поля.' }),
      h('div', { className: 'wz-brief' },
        h('div', { className: 'wz-brief__form' },
          h('div', { className: 'wz-bgrid' },
            Field('company', 'Название компании или проекта', { req: true, ph: 'Например, Nordwave' }),
            Field('audience', 'Для кого презентация?', { req: true, ph: 'CFO, отделы закупок, инвесторы…' }),
            Field('industry', 'Сфера бизнеса', { opt: true, ph: 'IT и SaaS, финансы…', list: 'wz-inds' }),
            h('datalist', { id: 'wz-inds' }, INDUSTRIES.map((x) => h('option', { key: x, value: x }))),
            h('div', { className: 'wz-fld' },
              h('label', null, 'Цель презентации'),
              h('div', { className: 'cx-catselect' },
                h('select', { value: brief.goal, onChange: (e) => set('goal', e.target.value) }, GOALS.map((g) => h('option', { key: g, value: g }, g)))))),
          Field('offer', 'Что нужно показать или продать?', { area: true, ph: 'Продукт, услуга или идея — это ляжет в слайд «Решение» и обложку' }),
          Field('problem', 'Какая главная проблема аудитории?', { area: true, ph: 'По одной боли на строку — каждая станет пунктом слайда «Проблема»' }),
          Field('proofs', 'Преимущества, цифры, факты или кейсы', { area: true, ph: 'Например: «−55% времени на КП», «120+ клиентов»' }),
          h('div', { className: 'wz-bgrid' },
            h('div', { className: 'wz-fld' },
              h('label', null, 'Тон презентации'),
              h('div', { className: 'cx-seg cx-seg--wrap' }, W.TONES.map((t) => h('button', { key: t.id, className: 'cx-seg__opt' + (brief.tone === t.id ? ' on' : ''), onClick: () => set('tone', t.id) }, t.label)))),
            h('div', { className: 'wz-fld' },
              h('label', null, 'Сколько слайдов нужно?'),
              h('div', { className: 'cx-counter' },
                h('button', { onClick: () => set('slideCount', Math.max(5, (brief.slideCount || 9) - 1)), disabled: (brief.slideCount || 9) <= 5 }, '−'),
                h('span', null, brief.slideCount || 9),
                h('button', { onClick: () => set('slideCount', Math.min(16, (brief.slideCount || 9) + 1)), disabled: (brief.slideCount || 9) >= 16 }, '+'))))),
        h('div', { className: 'wz-brief__side' },
          h('div', { className: 'wz-brief__card' },
            h('div', { className: 'wz-brief__head' }, h(Svg, { d: I.spark, s: 15 }), h('div', null, h('b', null, 'Предварительная структура'), h('span', null, `${seq.length} слайдов · ${type.name}`))),
            h('ol', { className: 'wz-structpreview' },
              seq.map((cat, i) => h('li', { key: i },
                h('span', { className: 'wz-structpreview__n' }, String(i + 1).padStart(2, '0')),
                h('span', { className: 'wz-structpreview__t' }, Lib.categoryLabel(cat)))))))));
  }

  /* ============== STRUCTURE PREVIEW ============== */
  function StructureStep({ plan, setPlan, theme, brand, data, busy }) {
    const [sel, setSel] = useState(0);
    const [adding, setAdding] = useState(false);
    const dragFrom = React.useRef(null);
    const [dragOver, setDragOver] = useState(null);

    const cur = plan[Math.min(sel, plan.length - 1)];
    const tpl = cur ? Lib.byId(cur.templateId) : null;

    const update = (i, patch) => setPlan((p) => p.map((s, j) => j === i ? { ...s, ...patch } : s));
    const setTitle = (i, val) => {
      const s = plan[i]; const t = Lib.byId(s.templateId); const key = W.primaryTextKey(t);
      const fields = key ? { ...s.fields, [key]: val } : s.fields;
      update(i, { title: val, fields });
    };
    // edit the slide's «основной текст» and «пункты» right here in the structure
    const setMain = (i, val) => {
      const t = Lib.byId(plan[i].templateId); const k = W.mainTextKey(t);
      if (!k) return; update(i, { fields: { ...plan[i].fields, [k]: val } });
    };
    const setBullets = (i, raw) => {
      const t = Lib.byId(plan[i].templateId); const k = W.listKey(t);
      if (!k) return; update(i, { fields: { ...plan[i].fields, [k]: raw.split(/\n/).map((s) => s.trim()).filter(Boolean) } });
    };
    const setMeaning = (i, val) => update(i, { desc: val });
    const removeAt = (i) => { setPlan((p) => p.filter((_, j) => j !== i)); setSel((s) => Math.max(0, s > i ? s - 1 : Math.min(s, plan.length - 2))); };
    const move = (from, to) => { if (from == null || to == null || from === to) return; setPlan((p) => { const n = p.slice(); const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; }); setSel(to); };
    const changeCat = (i, cat) => {
      const t = Lib.byCategory(cat)[0];
      const fields = window.CX.remapFields(t, plan[i].fields);
      update(i, { templateId: t.id, category: cat, fields, desc: W.CAT_DESC[cat] || t.description, visual: W.VISUAL[t.layoutType] || 'Контент', layout: t.layoutType, title: W.planTitle(t, fields, cat) });
    };
    const changeVariant = (i, id) => {
      const t = Lib.byId(id);
      const fields = window.CX.remapFields(t, plan[i].fields);
      update(i, { templateId: id, fields, visual: W.VISUAL[t.layoutType] || 'Контент', layout: t.layoutType });
    };
    const addSlide = (cat) => {
      const t = Lib.byCategory(cat)[0];
      const slide = W.mkPlan(t, cat, window.CX.remapFields(t, t.sample || {}));
      setPlan((p) => { const n = p.slice(); n.splice(sel + 1, 0, slide); return n; });
      setSel(sel + 1); setAdding(false);
    };
    const regenerate = () => setPlan(W.buildPlan(data));
    const shortenAll = () => setPlan((p) => p.map((s) => {
      const t = Lib.byId(s.templateId); const key = W.primaryTextKey(t);
      const nt = window.CX.truncateSmart(String(s.title || ''), 46);
      return { ...s, title: nt, fields: key ? { ...s.fields, [key]: nt } : s.fields };
    }));

    const variants = tpl ? Lib.byCategory(tpl.category) : [];

    return h('div', { className: 'wz-screen wz-screen--full', 'data-screen-label': 'Структура презентации' },
      h(W.StepHead, { eyebrow: 'ПОСЛЕДНИЙ ШАГ · СТРУКТУРА', title: 'Проверьте структуру презентации', sub: 'Слева — слайды, в центре — детали, справа — команды ИИ. Всё можно поменять и здесь, и в редакторе.' }),
      busy
        ? h('div', { className: 'wz-genload' }, h('div', { className: 'spinner' }), h('p', null, data && data.mode === 'ai' ? (data.genMode === 'faithful' ? 'Раскладываем текст и таблицы по слайдам…' : 'ИИ анализирует текст и собирает слайды…') : 'Собираем структуру и заполняем слайды…'))
        : h('div', { className: 'wz-struct' },
            // ---- list ----
            h('div', { className: 'wz-struct__list' },
              h('div', { className: 'wz-struct__listhead' }, 'Слайды', h('span', null, String(plan.length).padStart(2, '0'))),
              h('div', { className: 'wz-struct__items' },
                plan.map((s, i) => h('div', {
                  key: s.uid, className: 'wz-sitem' + (i === sel ? ' on' : '') + (dragOver === i ? ' dragover' : ''),
                  draggable: true, onClick: () => setSel(i),
                  onDragStart: () => { dragFrom.current = i; }, onDragOver: (e) => { e.preventDefault(); if (dragOver !== i) setDragOver(i); },
                  onDragLeave: () => setDragOver((d) => d === i ? null : d),
                  onDrop: (e) => { e.preventDefault(); move(dragFrom.current, i); dragFrom.current = null; setDragOver(null); },
                  onDragEnd: () => { dragFrom.current = null; setDragOver(null); }
                },
                  h('span', { className: 'wz-sitem__drag' }, h(Svg, { d: I.drag, s: 14 })),
                  h('span', { className: 'wz-sitem__n' }, String(i + 1).padStart(2, '0')),
                  h('div', { className: 'wz-sitem__txt' }, h('b', null, s.title), h('span', null, Lib.categoryLabel(s.category))),
                  h('button', { className: 'wz-sitem__rm', title: 'Удалить', onClick: (e) => { e.stopPropagation(); removeAt(i); }, disabled: plan.length <= 1 }, h(Svg, { d: I.trash, s: 13 }))))),
              h('div', { className: 'wz-struct__add' },
                adding
                  ? h('div', { className: 'wz-addmenu' },
                      Lib.CATEGORIES.map((c) => h('button', { key: c.id, onClick: () => addSlide(c.id) }, c.label)))
                  : h('button', { className: 'wz-struct__addbtn', onClick: () => setAdding(true) }, h(Svg, { d: I.plus, s: 15 }), 'Добавить слайд'))),
            // ---- detail ----
            h('div', { className: 'wz-struct__detail' },
              cur ? h(React.Fragment, null,
                h('div', { className: 'wz-detail__prev' }, h(window.CX.MiniSlide, { template: tpl, fields: cur.fields, theme, n: sel + 1, total: plan.length, brand })),
                h('div', { className: 'wz-detail__num' }, 'Слайд ' + String(sel + 1).padStart(2, '0') + ' из ' + String(plan.length).padStart(2, '0')),
                h('div', { className: 'wz-detail__chips' },
                  h('span', { className: 'wz-chip wz-chip--type' }, h('em', null, 'Тип слайда'), Lib.categoryLabel(cur.category)),
                  h('span', { className: 'wz-chip' }, h('em', null, 'Визуальная рекомендация'), cur.visual)),
                h('div', { className: 'wz-fld' },
                  h('label', null, 'Заголовок'),
                  h('input', { className: 'fe-input', value: cur.title, onChange: (e) => setTitle(sel, e.target.value) })),
                (() => { const k = W.mainTextKey(tpl); return k ? h('div', { className: 'wz-fld' },
                  h('label', null, 'Основной текст'),
                  h('textarea', { className: 'fe-input fe-textarea', rows: 3, placeholder: 'Текст слайда', value: String(cur.fields[k] || ''), onChange: (e) => setMain(sel, e.target.value) })) : null; })(),
                (() => { const k = W.listKey(tpl); return k ? h('div', { className: 'wz-fld' },
                  h('label', null, 'Пункты ', h('span', { className: 'wz-fld__opt' }, 'по одному на строку')),
                  h('textarea', { className: 'fe-input fe-textarea', rows: 4, placeholder: 'Каждая строка — отдельный пункт', value: Array.isArray(cur.fields[k]) ? cur.fields[k].join('\n') : '', onChange: (e) => setBullets(sel, e.target.value) })) : null; })(),
                h('div', { className: 'wz-fld' },
                  h('label', null, 'Смысл слайда ', h('span', { className: 'wz-fld__opt' }, 'зачем он в презентации')),
                  h('input', { className: 'fe-input', value: cur.desc || '', onChange: (e) => setMeaning(sel, e.target.value) })),
                h('div', { className: 'wz-fld' },
                  h('label', null, 'Раздел презентации'),
                  h('div', { className: 'cx-catselect' },
                    h('select', { value: cur.category, onChange: (e) => changeCat(sel, e.target.value) }, Lib.CATEGORIES.map((c) => h('option', { key: c.id, value: c.id }, c.label))))),
                variants.length > 1 ? h('div', { className: 'wz-fld' },
                  h('label', null, 'Вариант дизайна'),
                  h('div', { className: 'wz-varrow' }, variants.map((v) => h('button', { key: v.id, className: 'wz-varbtn' + (v.id === cur.templateId ? ' on' : ''), onClick: () => changeVariant(sel, v.id), title: v.name }, h(window.CX.MiniSlide, { template: v, fields: cur.fields, theme, n: 1, total: 1, brand }))))) : null
              ) : h('div', { className: 'wz-detail__empty' }, 'Нет слайдов')),
            // ---- AI commands ----
            h('div', { className: 'wz-struct__ai' },
              h('div', { className: 'wz-ai__head' }, h(Svg, { d: I.spark, s: 15 }), 'Команды ИИ'),
              h('button', { className: 'wz-ai__btn', onClick: regenerate }, h(Svg, { d: I.wand, s: 15 }), h('div', null, h('b', null, 'Перегенерировать структуру'), h('span', null, 'Собрать заново по вашим данным'))),
              h('button', { className: 'wz-ai__btn', onClick: shortenAll }, h(Svg, { d: I.scissors, s: 15 }), h('div', null, h('b', null, 'Сократить заголовки'), h('span', null, 'Короче и чётче на всех слайдах'))),
              h('button', { className: 'wz-ai__btn', onClick: () => setAdding(true) }, h(Svg, { d: I.plus, s: 15 }), h('div', null, h('b', null, 'Добавить слайд'), h('span', null, 'Вставить раздел после текущего'))),
              h('div', { className: 'wz-ai__note' }, h(Svg, { d: I.info, s: 13 }), 'Дальше откроется редактор: inline-правка текста, дизайн, экспорт в PPTX и PDF.'))));
  }

  Object.assign(window.CXWiz, { BriefStep, StructureStep });
})();
