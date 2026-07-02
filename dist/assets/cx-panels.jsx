/* global React, CX */
/* ============================================================
   Presa — RightPanel
   Tabs: Контент · Дизайн · AI · Проверка
   ============================================================ */
(function () {
  const h = React.createElement;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;
  const Lib = window.PresaTemplates;
  const THEMES = window.PresaData.THEMES;

  const TABS = [
    { id: 'content', label: 'Контент', icon: I.textT },
    { id: 'design', label: 'Дизайн', icon: I.palette },
    { id: 'ai', label: 'AI', icon: I.spark },
    { id: 'check', label: 'Проверка', icon: I.shield }
  ];

  /* ---------------- Контент ---------------- */
  function ContentTab(p) {
    const { tpl, cur, setField, changeCategory, activeField, onFocusField, onOverflowAction } = p;
    return h(React.Fragment, null,
      h('div', { className: 'cx-fieldgroup' },
        h('label', { className: 'fe-label' }, h('span', null, 'Категория слайда')),
        h('div', { className: 'cx-catselect' },
          h('select', { value: tpl.category, onChange: (e) => changeCategory(e.target.value) },
            Lib.CATEGORIES.map((c) => h('option', { key: c.id, value: c.id }, c.label))))),
      h(window.SlideFieldEditor, {
        template: tpl, fields: cur.fields, onChange: setField,
        activeField, onFocusField, onOverflowAction
      }));
  }

  /* ---------------- Дизайн ---------------- */
  function BrandKit({ brand, setBrand }) {
    const logoRef = React.useRef(null);
    const b = brand || {};
    const patch = (np) => setBrand({ ...b, ...np });
    const onLogo = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      window.CX.readImageFile(file, 480)
        .then(({ dataUrl, ratio }) => patch({ logo: dataUrl, logoRatio: ratio }))
        .catch(() => {});
    };
    const SWATCHES = ['#E5322B', '#1F6FDB', '#0E8A5F', '#6B3FD1', '#C8851A', '#0E1116'];
    return h('div', { className: 'cx-fieldgroup cx-brandkit', 'data-screen-label': 'Brand kit' },
      h('label', { className: 'fe-label' }, h('span', null, 'Brand kit'), h('span', { className: 'fe-range' }, 'на все слайды')),
      h('div', { className: 'cx-bk-row' },
        h('input', { ref: logoRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: onLogo }),
        h('button', { className: 'cx-bk-logo' + (b.logo ? ' has' : ''), title: b.logo ? 'Заменить логотип' : 'Загрузить логотип', onClick: () => logoRef.current && logoRef.current.click() },
          b.logo ? h('img', { src: b.logo, alt: 'Логотип' }) : h(Svg, { d: I.img, s: 16 })),
        h('input', { className: 'fe-input', value: b.name || '', placeholder: 'Сайт или название компании', 'aria-label': 'Сайт или название компании', onChange: (e) => patch({ name: e.target.value }) }),
        b.logo ? h('button', { className: 'fe-rm', title: 'Убрать логотип', onClick: () => patch({ logo: null, logoRatio: null }) }, h(Svg, { d: I.close, s: 12 })) : null),
      h('div', { className: 'cx-bk-hint' }, 'Логотип — в верхнем углу слайда, текст — внизу слева (напр. presa.io или Name Company)'),
      h('div', { className: 'cx-bk-sub' }, 'Фирменный цвет'),
      h('div', { className: 'cx-bk-swatches' },
        h('button', { className: 'cx-bk-sw cx-bk-sw--auto' + (!b.accent ? ' on' : ''), title: 'Цвет темы (по умолчанию)', onClick: () => patch({ accent: null }) }, 'A'),
        SWATCHES.map((c) => h('button', { key: c, className: 'cx-bk-sw' + (b.accent === c ? ' on' : ''), style: { background: c }, title: c, onClick: () => patch({ accent: c }) })),
        h('label', { className: 'cx-bk-sw cx-bk-sw--custom', title: 'Свой цвет' },
          h('input', { type: 'color', value: b.accent || '#E5322B', onChange: (e) => patch({ accent: e.target.value }) }),
          '+')),
      h('label', { className: 'cx-bk-check' },
        h('input', { type: 'checkbox', checked: b.pageNum !== false, onChange: (e) => patch({ pageNum: e.target.checked }) }),
        h('span', null, 'Нумерация слайдов в футере')));
  }

  function DesignTab(p) {
    const { tpl, cur, theme, themeKey, setThemeKey, variants, onVariant, setFontScale, setFontScaleAll, current, total, brand, setBrand } = p;
    const fontScale = cur.fontScale || 1;
    const FS_MIN = 0.7, FS_MAX = 1.3, FS_STEP = 0.05;
    const clampFS = (v) => Math.min(FS_MAX, Math.max(FS_MIN, Math.round(v * 100) / 100));
    const PRESETS = [[0.85, 'Мелкий'], [1, 'Авто'], [1.15, 'Крупный']];
    return h(React.Fragment, null,
      h('div', { className: 'cx-fieldgroup' },
        h('label', { className: 'fe-label' }, h('span', null, 'Стиль презентации')),
        h('div', { className: 'cx-themelist' },
          Object.keys(THEMES).map((k) => {
            const t = THEMES[k];
            return h('button', { key: k, className: 'cx-themerow' + (k === themeKey ? ' on' : ''), onClick: () => setThemeKey(k) },
              h('span', { className: 'cx-themerow__sw', style: { background: t.dark ? t.bg : '#fff' } },
                h('span', { style: { background: t.accent } })),
              h('span', { className: 'cx-themerow__name' }, t.name),
              k === themeKey ? h(Svg, { d: I.check, s: 14, w: 2.6 }) : null);
          }))),
      h(BrandKit, { brand, setBrand }),
      h('div', { className: 'cx-fieldgroup' },
        h('label', { className: 'fe-label' }, h('span', null, 'Размер текста слайда'),
          h('span', { className: 'fe-range' }, Math.round(fontScale * 100) + '%')),
        h('div', { className: 'cx-fontrow' },
          h('button', { className: 'cx-fontbtn', title: 'Меньше', 'aria-label': 'Уменьшить шрифт', disabled: fontScale <= FS_MIN + 0.001, onClick: () => setFontScale(clampFS(fontScale - FS_STEP)) }, 'А−'),
          h('input', {
            type: 'range', min: FS_MIN, max: FS_MAX, step: FS_STEP, value: fontScale,
            className: 'cx-fontslider', 'aria-label': 'Размер текста слайда',
            onChange: (e) => setFontScale(clampFS(parseFloat(e.target.value)))
          }),
          h('button', { className: 'cx-fontbtn', title: 'Больше', 'aria-label': 'Увеличить шрифт', disabled: fontScale >= FS_MAX - 0.001, onClick: () => setFontScale(clampFS(fontScale + FS_STEP)) }, 'А+')),
        h('div', { className: 'cx-seg cx-seg--block', style: { marginTop: 8 } },
          PRESETS.map(([v, lbl]) => h('button', {
            key: v, className: 'cx-seg__opt' + (Math.abs(fontScale - v) < 0.01 ? ' on' : ''),
            onClick: () => setFontScale(v)
          }, lbl))),
        h('button', { className: 'cx-fontall', onClick: () => setFontScaleAll(fontScale) },
          h(Svg, { d: I.layers, s: 13 }), `Применить ${Math.round(fontScale * 100)}% ко всем слайдам`),
        h('div', { className: 'cx-fonthint' }, 'Размер применяется и в превью, и при экспорте в PPTX')),
      h('div', { className: 'cx-fieldgroup' },
        h('label', { className: 'fe-label' }, h('span', null, 'Вариант дизайна'),
          h('span', { className: 'fe-range' }, `${variants.findIndex((v) => v.id === tpl.id) + 1} / ${variants.length}`)),
        h('div', { className: 'cx-varlist' },
          variants.map((v) => {
            const fields = window.CX.remapFields(v, cur.fields);
            const on = v.id === tpl.id;
            return h('button', { key: v.id, className: 'cx-varcard' + (on ? ' on' : ''), onClick: () => onVariant(v) },
              h('div', { className: 'cx-varcard__pic' },
                h(window.CX.MiniSlide, { template: v, fields, theme, n: current + 1, total, brand })),
              h('div', { className: 'cx-varcard__meta' },
                h('b', null, v.name),
                h('span', null, v.description),
                (() => { const bd = (Lib.meta(v).badges || []).filter((b) => b.kind === 'count' || b.kind === 'icon' || b.kind === 'photo'); return bd.length ? h('div', { className: 'cx-tplcard__badges' }, bd.map((b, i) => h('span', { key: i, className: 'cx-badge cx-badge--' + b.kind }, b.label))) : null; })()));
          }))));
  }

  /* ---------------- AI ---------------- */
  function AITab({ runAI, busyAI, brief }) {
    const ACTIONS = [
      { id: 'improve', icon: I.wand, label: 'Улучшить', desc: 'Чистит формулировки и пунктуацию' },
      { id: 'shorten', icon: I.scissors, label: 'Сократить', desc: 'Ужимает текст под лимиты дизайна' },
      { id: 'business', icon: I.pen, label: 'Деловой тон', desc: 'Нейтральные деловые формулировки' },
      { id: 'sales', icon: I.spark, label: 'Продающий', desc: 'Акцент на ценности для клиента' }
    ];
    return h(React.Fragment, null,
      h('div', { className: 'cx-aihead' },
        h(Svg, { d: I.spark, s: 15 }),
        h('div', null,
          h('b', null, 'AI-помощник'),
          h('span', null, 'Действия применяются ко всем полям текущего слайда'))),
      h('div', { className: 'cx-ailist' },
        ACTIONS.map((a) => h('button', { key: a.id, className: 'cx-airow', disabled: !!busyAI, onClick: () => runAI(a.id) },
          h('span', { className: 'cx-airow__ic' }, h(Svg, { d: a.icon, s: 15 })),
          h('span', { className: 'cx-airow__txt' }, h('b', null, a.label), h('span', null, a.desc)),
          busyAI === a.id ? h('span', { className: 'cx-airow__busy' }, '…') : h(Svg, { d: I.chevR, s: 14 })))),
      h('button', { className: 'cx-aifill', disabled: !!busyAI, onClick: () => runAI('autofill') },
        h(Svg, { d: I.brief, s: 15 }), 'Автозаполнить по брифу'),
      !brief ? h('div', { className: 'cx-ainote' }, h(Svg, { d: I.info, s: 13 }), 'Бриф ещё не заполнен — автозаполнение предложит открыть его') : null);
  }

  /* ---------------- Проверка ---------------- */
  function suggestBtnLabel(action) {
    if (action === 'split') return 'Разбить на 2 слайда';
    if (action && action.indexOf('category:') === 0) return 'Открыть «' + Lib.categoryLabel(action.split(':')[1]) + '»';
    return null;
  }

  function SuggestList({ suggestions, onSuggest }) {
    if (!suggestions || !suggestions.length) return null;
    return h('div', { className: 'cx-suggests' },
      suggestions.map((s, i) => h('div', { key: i, className: 'cx-suggest' },
        h('span', { className: 'cx-suggest__ic' }, h(Svg, { d: I.wand, s: 13 })),
        h('div', { className: 'cx-suggest__body' },
          h('p', null, s.message),
          s.action && onSuggest ? h('button', { className: 'cx-suggest__btn', onClick: () => onSuggest(s.action) },
            h(Svg, { d: s.action === 'split' ? I.copy : I.layers, s: 12 }), suggestBtnLabel(s.action)) : null))));
  }

  function CheckTab({ slides, deckAudits, deckNotes, current, onGoIssue, onSuggest }) {
    const okCount = deckAudits.filter((a) => a.level === 'ok' && !(a.suggestions || []).some((s) => s.level === 'warn')).length;
    const totalSuggest = deckAudits.reduce((m, a) => m + (a.suggestions || []).length, 0);
    const allOk = okCount === slides.length && !deckNotes.some((n) => n.level !== 'info');
    const IC = { error: I.error, warn: I.warn, info: I.info };
    return h(React.Fragment, null,
      h('div', { className: 'cx-checksum' + (allOk ? ' ok' : '') },
        h('span', { className: 'cx-checksum__ic' }, h(Svg, { d: allOk ? I.check : I.shield, s: 16, w: 2.4 })),
        h('div', null,
          h('b', null, allOk ? 'Всё в порядке' : `${okCount} из ${slides.length} слайдов без замечаний`),
          h('span', null, allOk ? 'Презентация готова к экспорту' : (totalSuggest ? 'Замечания — к полям, рекомендации — как улучшить слайд' : 'Кликните по замечанию, чтобы перейти к полю')))),
      deckNotes.length ? h('div', { className: 'cx-checkdeck' },
        deckNotes.map((n, i) => h('div', { key: i, className: 'cx-issue cx-issue--' + n.level },
          h(Svg, { d: IC[n.level] || I.info, s: 13 }), n.message))) : null,
      h('div', { className: 'cx-checklist' },
        deckAudits.map((a, i) => {
          const sugg = a.suggestions || [];
          const hasContent = a.issues.length || sugg.length;
          return h('div', { key: i, className: 'cx-checkslide' + (i === current ? ' on' : '') },
            h('button', { className: 'cx-checkslide__head', onClick: () => onGoIssue(i, null) },
              h('span', { className: 'cx-sstat cx-sstat--' + (sugg.some((s) => s.level === 'warn') && a.level === 'ok' ? 'warn' : a.level) }),
              h('span', { className: 'cx-checkslide__n' }, String(i + 1).padStart(2, '0')),
              h('span', { className: 'cx-checkslide__cat' }, Lib.categoryLabel(a.category)),
              h('span', { className: 'cx-checkslide__cnt' }, (a.issues.length + sugg.length) || h(Svg, { d: I.check, s: 12, w: 3 }))),
            hasContent ? h('div', { className: 'cx-checkslide__issues' },
              a.issues.map((iss, j) => h('button', { key: 'i' + j, className: 'cx-issue cx-issue--' + iss.level, onClick: () => onGoIssue(i, iss.field) },
                h(Svg, { d: IC[iss.level] || I.info, s: 13 }), iss.message)),
              h(SuggestList, { suggestions: sugg, onSuggest: (action) => onSuggest && onSuggest(i, action) })) : null);
        })));
  }

  /* ---------------- Panel shell ---------------- */
  function RightPanel(props) {
    const { tab, setTab, badgeCount } = props;
    return h('div', { className: 'cx-panel', 'data-screen-label': 'Правая панель' },
      h('div', { className: 'cx-tabs' },
        TABS.map((t) => h('button', {
          key: t.id, className: 'cx-tab' + (tab === t.id ? ' on' : ''), onClick: () => setTab(t.id)
        },
          h(Svg, { d: t.icon, s: 15 }), t.label,
          t.id === 'check' && badgeCount > 0 ? h('span', { className: 'cx-tab__badge' }, badgeCount) : null))),
      h('div', { className: 'cx-tabbody', id: 'cx-editbody' },
        tab === 'content' ? h(ContentTab, props) :
        tab === 'design' ? h(DesignTab, props) :
        tab === 'ai' ? h(AITab, props) :
        h(CheckTab, props)));
  }

  window.CXRightPanel = RightPanel;
})();
