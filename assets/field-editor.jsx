/* global React, CX */
/* ============================================================
   Presa — SlideFieldEditor v2
   - label + char counter on every field (yellow near limit, red over)
   - active-field highlight, synced with the canvas
   - overflow warning with actions: shorten / shrink font / change template
   - groups (metrics etc): drag handle, up/down, delete, add
   Emits onChange(key, nextValue). Pure controlled component.
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useRef, useState } = React;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;

  const ADD_NOUN = {
    stats: 'метрику', cards: 'карточку', steps: 'шаг', milestones: 'этап',
    tiers: 'тариф', rows: 'строку', members: 'участника', items: 'пункт', bullets: 'пункт'
  };
  const addLabel = (def) => 'Добавить ' + (ADD_NOUN[def.key] || 'элемент');

  // ---- char counter ----
  function Counter({ value, max }) {
    if (!max) return null;
    const len = (value || '').length;
    const cls = len > max ? ' over' : len >= max * 0.85 ? ' near' : '';
    return h('span', { className: 'fe-count' + cls }, `${len}/${max}`);
  }
  const inputTone = (value, max) => {
    if (!max) return '';
    const len = (value || '').length;
    return len > max ? ' fe-over' : len >= max * 0.85 ? ' fe-near' : '';
  };

  // ---- overflow warning with actions ----
  function OverflowWarn({ fieldKey, onAction }) {
    return h('div', { className: 'fe-overflow' },
      h('div', { className: 'fe-overflow__txt' },
        h(Svg, { d: I.warn, s: 14 }),
        h('span', null, 'Текст длинный для этого шаблона. Сократить автоматически?')),
      h('div', { className: 'fe-overflow__btns' },
        h('button', { className: 'fe-fix fe-fix--primary', onClick: () => onAction('shorten', fieldKey) }, 'Сократить'),
        h('button', { className: 'fe-fix', onClick: () => onAction('shrink', fieldKey) }, 'Уменьшить шрифт'),
        h('button', { className: 'fe-fix', onClick: () => onAction('template', fieldKey) }, 'Другой шаблон')));
  }

  function fieldWrap(def, active, children) {
    return h('div', {
      className: 'fe-field' + (active ? ' fe-field--active' : ''),
      'data-fekey': def.key
    }, children);
  }

  // ---- single text/textarea ----
  function TextControl({ def, value, onChange, active, onFocusField, onOverflowAction }) {
    const Tag = def.type === 'textarea' ? 'textarea' : 'input';
    const over = def.maxLength && (value || '').length > def.maxLength;
    return fieldWrap(def, active, [
      h('label', { className: 'fe-label', key: 'l', htmlFor: 'fe-' + def.key },
        h('span', null, def.label),
        h(Counter, { value, max: def.maxLength })),
      h(Tag, {
        key: 'i', id: 'fe-' + def.key,
        className: 'fe-input' + (def.type === 'textarea' ? ' fe-textarea' : '') + inputTone(value, def.maxLength),
        value: value || '',
        placeholder: def.placeholder || '',
        onFocus: () => onFocusField && onFocusField(def.key),
        onChange: (e) => onChange(def.key, e.target.value)
      }),
      over ? h(OverflowWarn, { key: 'w', fieldKey: def.key, onAction: onOverflowAction }) : null
    ]);
  }

  // ---- list of strings ----
  function ListControl({ def, value, onChange, active, onFocusField }) {
    const items = Array.isArray(value) ? value : [];
    const atMax = def.maxItems && items.length >= def.maxItems;
    const overMax = def.maxItems && items.length > def.maxItems;
    const set = (i, v) => { const next = items.slice(); next[i] = v; onChange(def.key, next); };
    const add = () => onChange(def.key, [...items, '']);
    const remove = (i) => onChange(def.key, items.filter((_, j) => j !== i));
    return fieldWrap(def, active, [
      h('label', { className: 'fe-label', key: 'l' },
        h('span', null, def.label),
        h('span', { className: 'fe-range' + (overMax ? ' over' : atMax ? ' near' : '') }, `${items.length}${def.maxItems ? ' / ' + def.maxItems : ''}`)),
      h('div', { className: 'fe-list', key: 'rows' },
        items.map((it, i) => h('div', { className: 'fe-listrow', key: i },
          h('span', { className: 'fe-listdot' + (def.maxItems && i >= def.maxItems ? ' muted' : '') }, i + 1),
          h('div', { className: 'fe-listcell' },
            h('input', {
              className: 'fe-input' + (def.maxItems && i >= def.maxItems ? ' fe-dim' : '') + inputTone(it, def.maxItemLength),
              value: it, placeholder: def.placeholder || 'Текст пункта…',
              onFocus: () => onFocusField && onFocusField(def.key),
              onChange: (e) => set(i, e.target.value)
            }),
            def.maxItemLength ? h('span', { className: 'fe-listcount' }, h(Counter, { value: it, max: def.maxItemLength })) : null),
          h('button', { className: 'fe-rm', title: 'Удалить', onClick: () => remove(i) }, h(Svg, { d: I.close, s: 12 }))))),
      h('button', { className: 'fe-add', key: 'add', disabled: !!atMax, onClick: add },
        h(Svg, { d: I.plus, s: 13 }), addLabel(def), atMax ? h('span', { className: 'fe-addhint' }, `максимум ${def.maxItems}`) : null)
    ]);
  }

  // ---- group: array of objects (metrics, cards, steps…) ----
  // compact image picker used inside a group card
  function SubImage({ value, onChange, onFocus }) {
    const inputRef = useRef(null);
    const pick = () => inputRef.current && inputRef.current.click();
    const onFile = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      window.CX.readImageFile(file, 1400).then(({ dataUrl }) => { onChange(dataUrl); onFocus && onFocus(); }).catch(() => {});
    };
    return h('div', { className: 'fe-subfield' },
      h('label', { className: 'fe-sublabel' }, h('span', null, 'Фото')),
      h('input', { ref: inputRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: onFile }),
      value
        ? h('div', { className: 'fe-subimg' },
            h('img', { src: value, alt: '' }),
            h('div', { className: 'fe-subimg__btns' },
              h('button', { className: 'fe-fix', onClick: pick }, 'Заменить'),
              h('button', { className: 'fe-fix', onClick: () => onChange('') }, 'Удалить')))
        : h('button', { className: 'fe-imgadd fe-imgadd--sm', onClick: pick }, h(Svg, { d: I.img, s: 14 }), 'Загрузить фото'));
  }

  // render a glyph for any icon name (legacy stroke array OR Material fill object)
  function IconGlyph({ name, size }) {
    const set = (window.PresaIcons) || {};
    const ic = set[name]; if (!ic) return null;
    const fill = ic && ic.f;
    const paths = fill ? ic.p : ic;
    const vb = fill ? (ic.vb || '0 -960 960 960') : '0 0 24 24';
    return h('svg', { width: size || 18, height: size || 18, viewBox: vb,
      fill: fill ? 'currentColor' : 'none', stroke: fill ? 'none' : 'currentColor',
      strokeWidth: fill ? 0 : 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' },
      paths.map((d, i) => h('path', { key: i, d })));
  }

  // icon picker: searchable grid over the curated set + Google Material Symbols
  function SubIcon({ value, onChange, onFocus }) {
    const set = (window.PresaIcons) || {};
    const meta = window.PresaIconMeta;
    const [q, setQ] = useState('');
    const curated = Object.keys(set).filter((n) => !(meta && meta.isMaterial(n)));
    let names;
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      const inCur = curated.filter((n) => n.toLowerCase().indexOf(qq) >= 0);
      const inMat = meta ? meta.search(qq) : [];
      names = inCur.concat(inMat);
    } else {
      names = curated.concat(meta ? meta.names : []);
    }
    const labelOf = (n) => meta && meta.isMaterial(n) ? meta.label(n) : n;
    return h('div', { className: 'fe-subfield' },
      h('label', { className: 'fe-sublabel' },
        h('span', null, 'Иконка'),
        h('span', { className: 'fe-iconcount' }, names.length + ' из ' + Object.keys(set).length)),
      h('input', { type: 'text', className: 'fe-input fe-iconsearch', placeholder: 'Поиск иконки — напр. «команда», «график», «облако»…',
        value: q, onChange: (e) => setQ(e.target.value), onFocus: () => onFocus && onFocus() }),
      h('div', { className: 'fe-iconpick' },
        names.slice(0, 240).map((name) => h('button', {
          key: name, type: 'button',
          className: 'fe-iconbtn' + (value === name ? ' on' : ''),
          title: labelOf(name),
          onClick: () => { onChange(name); onFocus && onFocus(); }
        }, h(IconGlyph, { name, size: 18 }))),
        names.length === 0 ? h('div', { className: 'fe-iconempty' }, 'Ничего не найдено') : null));
  }

  function GroupControl({ def, value, onChange, active, onFocusField }) {
    const items = Array.isArray(value) ? value : [];
    const atMax = def.maxItems && items.length >= def.maxItems;
    const overMax = def.maxItems && items.length > def.maxItems;
    const dragFrom = useRef(null);
    const [dragOver, setDragOver] = useState(null);

    const blank = () => { const o = {}; def.sub.forEach((sd) => { o[sd.key] = sd.type === 'list' ? [] : ''; }); return o; };
    const setSub = (i, key, v) => { const next = items.map((x, j) => j === i ? { ...x, [key]: v } : x); onChange(def.key, next); };
    const add = () => onChange(def.key, [...items, blank()]);
    const remove = (i) => onChange(def.key, items.filter((_, j) => j !== i));
    const move = (i, dir) => {
      const j = i + dir; if (j < 0 || j >= items.length) return;
      const next = items.slice(); const t = next[i]; next[i] = next[j]; next[j] = t; onChange(def.key, next);
    };
    const dropTo = (to) => {
      const from = dragFrom.current;
      dragFrom.current = null; setDragOver(null);
      if (from == null || from === to) return;
      const next = items.slice(); const [m] = next.splice(from, 1); next.splice(to, 0, m);
      onChange(def.key, next);
    };

    return fieldWrap(def, active, [
      h('label', { className: 'fe-label', key: 'l' },
        h('span', null, def.label),
        h('span', { className: 'fe-range' + (overMax ? ' over' : atMax ? ' near' : '') }, `${items.length}${def.maxItems ? ' / ' + def.maxItems : ''}`)),
      h('div', { className: 'fe-groups', key: 'g' },
        items.map((obj, i) => h('div', {
          className: 'fe-group' + (def.maxItems && i >= def.maxItems ? ' over' : '') + (dragOver === i ? ' dragover' : ''),
          key: i,
          onDragOver: (e) => { e.preventDefault(); if (dragOver !== i) setDragOver(i); },
          onDragLeave: () => setDragOver((d) => d === i ? null : d),
          onDrop: (e) => { e.preventDefault(); dropTo(i); }
        },
          h('div', { className: 'fe-grouphead' },
            h('span', {
              className: 'fe-grouphandle', title: 'Перетащите, чтобы изменить порядок',
              draggable: true,
              onDragStart: (e) => { dragFrom.current = i; e.dataTransfer.effectAllowed = 'move'; },
              onDragEnd: () => { dragFrom.current = null; setDragOver(null); }
            }, h(Svg, { d: I.drag, s: 14, w: 2.4 })),
            h('span', { className: 'fe-groupn' }, `${def.label} ${i + 1}`),
            h('div', { className: 'fe-grouptools' },
              h('button', { className: 'fe-mini', title: 'Выше', disabled: i === 0, onClick: () => move(i, -1) }, h(Svg, { d: 'M12 19V5M5 12l7-7 7 7', s: 12 })),
              h('button', { className: 'fe-mini', title: 'Ниже', disabled: i === items.length - 1, onClick: () => move(i, 1) }, h(Svg, { d: 'M12 5v14M19 12l-7 7-7-7', s: 12 })),
              h('button', { className: 'fe-mini fe-mini--rm', title: 'Удалить', onClick: () => remove(i) }, h(Svg, { d: I.trash, s: 12 })))),
          def.sub.map((sd) => sd.type === 'list'
            ? h(ListControl, { key: sd.key, def: sd, value: obj[sd.key], active: false, onFocusField: () => onFocusField && onFocusField(def.key), onChange: (_, v) => setSub(i, sd.key, v) })
            : sd.type === 'image'
            ? h(SubImage, { key: sd.key, value: obj[sd.key], onFocus: () => onFocusField && onFocusField(def.key), onChange: (v) => setSub(i, sd.key, v) })
            : sd.type === 'icon'
            ? h(SubIcon, { key: sd.key, value: obj[sd.key], onFocus: () => onFocusField && onFocusField(def.key), onChange: (v) => setSub(i, sd.key, v) })
            : h('div', { className: 'fe-subfield', key: sd.key },
                h('label', { className: 'fe-sublabel' }, h('span', null, sd.label), h(Counter, { value: obj[sd.key], max: sd.maxLength })),
                h(sd.type === 'textarea' ? 'textarea' : 'input', {
                  className: 'fe-input fe-input--sm' + (sd.type === 'textarea' ? ' fe-textarea' : '') + inputTone(obj[sd.key], sd.maxLength),
                  value: obj[sd.key] || '', placeholder: sd.placeholder || '',
                  onFocus: () => onFocusField && onFocusField(def.key),
                  onChange: (e) => setSub(i, sd.key, e.target.value)
                })))))),
      h('button', { className: 'fe-add', key: 'add', disabled: !!atMax, onClick: add },
        h(Svg, { d: I.plus, s: 13 }), addLabel(def), atMax ? h('span', { className: 'fe-addhint' }, `максимум ${def.maxItems}`) : null)
    ]);
  }

  // ---- image upload ----
  function ImageControl({ def, value, onChange, active, onFocusField }) {
    const inputRef = useRef(null);
    const pick = () => inputRef.current && inputRef.current.click();
    const onFile = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      window.CX.readImageFile(file, 1400)
        .then(({ dataUrl }) => { onChange(def.key, dataUrl); onFocusField && onFocusField(def.key); })
        .catch(() => {});
    };
    return fieldWrap(def, active, [
      h('label', { className: 'fe-label', key: 'l' }, h('span', null, def.label)),
      h('input', { key: 'f', ref: inputRef, type: 'file', accept: 'image/*', style: { display: 'none' }, onChange: onFile }),
      value
        ? h('div', { className: 'fe-imgprev', key: 'p' },
            h('img', { src: value, alt: '' }),
            h('div', { className: 'fe-imgprev__btns' },
              h('button', { className: 'fe-fix', onClick: pick }, 'Заменить'),
              h('button', { className: 'fe-fix', onClick: () => onChange(def.key, '') }, 'Удалить')))
        : h('button', { className: 'fe-imgadd', key: 'b', onClick: pick },
            h(Svg, { d: I.img, s: 15 }), 'Загрузить изображение')
    ]);
  }

  function FieldControl(props) {
    const t = props.def.type;
    if (t === 'list') return h(ListControl, props);
    if (t === 'group') return h(GroupControl, props);
    if (t === 'image') return h(ImageControl, props);
    return h(TextControl, props);
  }

  function SlideFieldEditor({ template, fields, onChange, activeField, onFocusField, onOverflowAction }) {
    const req = template.requiredFields || [];
    const opt = template.optionalFields || [];
    const render = (def) => h(FieldControl, {
      key: def.key, def, value: fields[def.key], onChange,
      active: activeField === def.key, onFocusField, onOverflowAction
    });
    return h('div', { className: 'fe' },
      req.map(render),
      opt.length ? h('div', { className: 'fe-optsep' }, 'Дополнительно') : null,
      opt.map(render));
  }

  window.SlideFieldEditor = SlideFieldEditor;
})();
