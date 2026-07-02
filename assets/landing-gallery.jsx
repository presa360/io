/* global React, ReactDOM, PresaTemplates, PresaData, CX */
/* ============================================================
   Presa — Landing template gallery
   Renders REAL slide previews (same renderer as the product) in a
   filterable grid, so the homepage shows actual output, not mockups.
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useState } = React;
  const Lib = window.PresaTemplates;
  const THEMES = window.PresaData.THEMES;
  const MiniSlide = window.CX.MiniSlide;

  // design directions → base theme (mirror of the wizard)
  const DESIGNS = [
    { id: 'all', name: 'Все стили', theme: null },
    { id: 'corporate', name: 'Corporate White', theme: 'corporate' },
    { id: 'premium', name: 'Dark Premium', theme: 'premium' },
    { id: 'blue', name: 'Tech Blue', theme: 'blue' },
    { id: 'tech', name: 'Red Enterprise', theme: 'tech' },
    { id: 'minimal', name: 'Minimal Consulting', theme: 'minimal' },
    { id: 'industrial', name: 'Industrial', theme: 'industrial' }
  ];
  const NAME = { corporate: 'Corporate White', premium: 'Dark Premium', blue: 'Tech Blue', tech: 'Red Enterprise', minimal: 'Minimal', industrial: 'Industrial' };

  // a curated, varied set of templates to showcase
  const SHOW = ['title-03', 'about-company-02', 'agenda-04', 'benefits-01', 'numbers-01', 'case-01', 'pricing-01', 'roadmap-01', 'team-01'];
  const MIX = ['premium', 'corporate', 'blue', 'tech', 'industrial', 'minimal', 'corporate', 'blue', 'tech'];

  function Gallery() {
    const [sel, setSel] = useState('all');
    const items = SHOW.map((id, i) => {
      const tpl = Lib.byId(id);
      const themeKey = sel === 'all' ? MIX[i % MIX.length] : (DESIGNS.find((d) => d.id === sel).theme);
      return { tpl, themeKey };
    }).filter((x) => x.tpl);

    return h(React.Fragment, null,
      h('div', { className: 'gal__filters' },
        DESIGNS.map((d) => h('button', {
          key: d.id, className: 'gal__pill' + (sel === d.id ? ' on' : ''), onClick: () => setSel(d.id)
        }, d.name))),
      h('div', { className: 'gal__grid' },
        items.map((it, i) => h('a', { key: it.tpl.id + i, className: 'gal__card', href: 'generator.html?new=1' },
          h('div', { className: 'gal__slide' },
            h(MiniSlide, { template: it.tpl, fields: it.tpl.sample || {}, theme: THEMES[it.themeKey], n: i + 1, total: items.length, brand: 'Presa' })),
          h('div', { className: 'gal__cap' },
            h('b', null, Lib.categoryLabel(it.tpl.category)),
            h('span', null, NAME[it.themeKey] || ''))))),
      h('div', { className: 'gal__foot' },
        h('a', { className: 'btn btn-dark btn-lg btn-cta', href: 'generator.html?new=1' },
          'Открыть все шаблоны в конструкторе',
          h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none' },
            h('path', { d: 'M5 12h14M13 6l6 6-6 6', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' })))));
  }

  const mount = document.getElementById('gallery-root');
  if (mount) ReactDOM.createRoot(mount).render(h(Gallery));
})();
