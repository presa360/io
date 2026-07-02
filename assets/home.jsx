/* global React, ReactDOM, CX, PresaTemplates, PresaData */
/* ============================================================
   Presa — Home (clean product entry screen)
   No marketing scroll: a focused "how do we start?" screen with
   the four real creation methods (deep-linked into the wizard)
   plus a live, rotating preview of actual slide output.
   ============================================================ */
(function () {
  const h = React.createElement;
  const { useState, useEffect } = React;
  const Svg = window.CX.Svg;
  const I = window.CX.ICONS;
  const Lib = window.PresaTemplates;
  const THEMES = window.PresaData.THEMES;

  const ARROW = 'M5 12h14M13 6l6 6-6 6';

  /* the four real creation methods — mirror the wizard's MODES,
     each deep-links past the duplicate "choose method" step */
  const METHODS = [
    { id: 'ai', icon: I.spark, title: 'Создать с помощью ИИ', desc: 'Вставьте любой текст — ИИ разберёт его на слайды.', href: 'generator.html?new=1&mode=ai', badge: 'Быстрее всего' },
    { id: 'paste', icon: I.textT, title: 'Вставить свой текст', desc: 'Готовый материал — сервис разложит по слайдам.', href: 'generator.html?new=1&mode=paste' },
    { id: 'preset', icon: I.layers, title: 'Готовый сценарий', desc: 'Структура под типовую задачу — заменить примеры.', href: 'generator.html?new=1&mode=preset' },
    { id: 'blank', icon: I.plus, title: 'С чистого листа', desc: 'Пустой проект — соберите сами из библиотеки.', href: 'generator.html?new=1&mode=blank' }
  ];

  /* curated, varied slides to rotate through in the preview */
  const PREVIEW = [
    { id: 'title-03', theme: 'premium', label: 'Обложка' },
    { id: 'numbers-01', theme: 'tech', label: 'Цифры' },
    { id: 'benefits-01', theme: 'corporate', label: 'Преимущества' },
    { id: 'about-company-02', theme: 'blue', label: 'О компании' },
    { id: 'pricing-01', theme: 'minimal', label: 'Тарифы' }
  ].filter((p) => Lib.byId(p.id));

  function MethodCard({ m }) {
    return h('a', { className: 'hm-card', href: m.href, 'data-mode': m.id },
      h('span', { className: 'hm-card__ic' }, h(Svg, { d: m.icon, s: 22 })),
      h('div', { className: 'hm-card__tx' },
        h('div', { className: 'hm-card__row' },
          h('h3', null, m.title),
          m.badge ? h('span', { className: 'hm-card__badge' }, m.badge) : null),
        h('p', null, m.desc)),
      h('span', { className: 'hm-card__go' }, h(Svg, { d: ARROW, s: 17, w: 2.2 })));
  }

  function Preview() {
    const [i, setI] = useState(0);
    useEffect(() => {
      const t = window.setInterval(() => setI((x) => (x + 1) % PREVIEW.length), 3400);
      return () => window.clearInterval(t);
    }, []);
    const p = PREVIEW[i];
    const tpl = Lib.byId(p.id);
    const theme = THEMES[p.theme] || THEMES.tech;
    return h('div', { className: 'hm-prev' },
      h('div', { className: 'hm-prev__bar' },
        h('span', { className: 'hm-prev__dots' },
          h('span', null), h('span', null), h('span', null)),
        h('span', { className: 'hm-prev__url' }, 'presa.io · ', h('b', null, p.label)),
        h('span', { className: 'hm-prev__live' }, h('span', { className: 'hm-prev__pulse' }), 'Живой слайд')),
      h('div', { className: 'hm-prev__stage' },
        h('div', { className: 'hm-prev__slide', key: i },
          h(window.CX.MiniSlide, { template: tpl, fields: tpl.sample || {}, theme, n: i + 1, total: PREVIEW.length, brand: 'Presa' }))),
      h('div', { className: 'hm-prev__foot' },
        h('div', { className: 'hm-prev__steps' },
          PREVIEW.map((_, k) => h('button', {
            key: k, className: 'hm-prev__step' + (k === i ? ' on' : ''),
            onClick: () => setI(k), 'aria-label': 'Слайд ' + (k + 1)
          }))),
        h('span', { className: 'hm-prev__cap' }, 'Так выглядит результат — редактируемый PPTX')));
  }

  function Home() {
    return h('div', { className: 'hm' },
      h('header', { className: 'hm-top' },
        h('a', { className: 'hm-brand', href: 'index.html' },
          h('svg', { className: 'hm-brand__mk', viewBox: '0 0 32 32', fill: 'none', 'aria-hidden': true },
            h('rect', { x: 1, y: 1, width: 30, height: 30, rx: 8, fill: '#E5322B' }),
            h('rect', { x: 8.5, y: 9, width: 15, height: 3.4, rx: 1.7, fill: '#fff' }),
            h('rect', { x: 8.5, y: 14.6, width: 15, height: 3.4, rx: 1.7, fill: '#fff', opacity: .66 }),
            h('rect', { x: 8.5, y: 20.2, width: 9.5, height: 3.4, rx: 1.7, fill: '#fff', opacity: .4 })),
          'Presa'),
        h('a', { className: 'hm-top__link', href: 'index \u2014 \u043b\u0435\u043d\u0434\u0438\u043d\u0433 (\u0441\u0442\u0430\u0440\u044b\u0439).html' },
          'О сервисе', h(Svg, { d: I.chevR, s: 14, w: 2.4 }))),

      h('main', { className: 'hm-main', 'data-screen-label': '\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u2014 \u0432\u044b\u0431\u043e\u0440 \u0441\u043f\u043e\u0441\u043e\u0431\u0430' },
        h('div', { className: 'hm-left' },
          h('span', { className: 'eyebrow' }, 'Конструктор презентаций с ИИ'),
          h('h1', { className: 'hm-h1' }, 'С чего начнём?'),
          h('p', { className: 'hm-sub' }, 'Выберите способ — и через минуты заберёте готовую корпоративную презентацию в PPTX.'),
          h('div', { className: 'hm-cards' },
            METHODS.map((m) => h(MethodCard, { key: m.id, m }))),
          h('div', { className: 'hm-trust' },
            h('b', null, 'Бесплатно'), h('span', { className: 'hm-dot' }),
            'без регистрации', h('span', { className: 'hm-dot' }),
            'готовый PPTX за минуты')),
        h('div', { className: 'hm-right' }, h(Preview))));
  }

  const mount = document.getElementById('app');
  if (mount) ReactDOM.createRoot(mount).render(h(Home));
})();
