/* global React */
// SlideCanvas — renders one 16:9 business slide for a given theme.
// Scales fully via CSS container units (cqw), so it works as a thumbnail or full size.

function PresaMark({ size, bg }) {
  return (
    React.createElement('span', { className: 'm', style: { background: bg } },
      React.createElement('svg', { width: size * 0.62, height: size * 0.62, viewBox: '0 0 24 24', fill: 'none' },
        React.createElement('rect', { x: 5, y: 6, width: 14, height: 2.6, rx: 1.3, fill: '#fff' }),
        React.createElement('rect', { x: 5, y: 10.7, width: 14, height: 2.6, rx: 1.3, fill: '#fff', opacity: .6 }),
        React.createElement('rect', { x: 5, y: 15.4, width: 8.5, height: 2.6, rx: 1.3, fill: '#fff', opacity: .38 })
      )
    )
  );
}

function SlideCanvas({ slide, theme, brand, total }) {
  const t = theme;
  const isDark = t.dark;
  const titleColor = t.title;
  const bodyColor = t.body;
  const accent = t.accent;

  const rule = (() => {
    switch (t.rule) {
      case 'bar':   return React.createElement('div', { className: 'sl-accentbar', style: { background: accent } });
      case 'top':   return React.createElement('div', { className: 'sl-topbar', style: { background: accent } });
      case 'side':  return React.createElement('div', { className: 'sl-accentbar', style: { background: accent, width: '3.4cqw' } });
      default:      return null;
    }
  })();

  const foot = React.createElement('div', { className: 'sl-foot', style: { color: isDark ? 'rgba(255,255,255,.5)' : 'var(--text-faint)' } },
    React.createElement('div', { className: 'brand', style: { color: isDark ? '#fff' : 'var(--text)' } },
      React.createElement(PresaMark, { size: 14, bg: accent }),
      React.createElement('span', null, brand || 'Presa')
    ),
    React.createElement('div', { className: 'sl-pageno' }, String(slide.slideNumber).padStart(2, '0'), ' / ', String(total).padStart(2, '0'))
  );

  const eyebrow = (label) => React.createElement('div', {
    className: 'sl-eyebrow', style: { color: accent, fontFamily: t.mono ? 'var(--font-mono)' : 'var(--font-sans)' }
  },
    React.createElement('span', { className: 'dash', style: { background: accent } }),
    label
  );

  // ----- TITLE -----
  if (slide.layout === 'title') {
    return React.createElement('div', { className: 'slide', style: { background: t.bg } },
      rule,
      React.createElement('div', { className: 'sl-pad', style: { justifyContent: 'center' } },
        eyebrow(slide.subtitle ? (slide.meta || 'PRESENTATION') : 'PRESENTATION'),
        React.createElement('h1', { className: 'sl-title', style: { color: titleColor, fontSize: '6.6cqw', marginTop: '3cqw', maxWidth: '82%' } }, slide.title),
        slide.subtitle ? React.createElement('p', { style: { color: bodyColor, fontSize: '2.7cqw', marginTop: '2.6cqw', maxWidth: '70%', lineHeight: 1.4 } }, slide.subtitle) : null
      ),
      foot
    );
  }

  // ----- CTA -----
  if (slide.layout === 'cta') {
    return React.createElement('div', { className: 'slide', style: { background: isDark ? t.bg : t.title } },
      React.createElement('div', { className: 'sl-accentbar', style: { background: accent } }),
      React.createElement('div', { className: 'sl-pad', style: { justifyContent: 'center' } },
        React.createElement('div', { className: 'sl-eyebrow', style: { color: accent, fontFamily: t.mono ? 'var(--font-mono)' : 'var(--font-sans)' } },
          React.createElement('span', { className: 'dash', style: { background: accent } }), 'LET\u2019S TALK'),
        React.createElement('h1', { className: 'sl-title', style: { color: '#fff', fontSize: '5.6cqw', marginTop: '2.6cqw', maxWidth: '80%' } }, slide.title),
        React.createElement('ul', { className: 'sl-bullets', style: { marginTop: '3.4cqw', maxWidth: '74%' } },
          slide.bullets.map((b, i) => React.createElement('li', { key: i, style: { color: 'rgba(255,255,255,.82)', fontSize: '2.3cqw' } },
            React.createElement('span', { className: 'mk', style: { background: accent } }), b))
        )
      ),
      React.createElement('div', { className: 'sl-foot', style: { color: 'rgba(255,255,255,.5)' } },
        React.createElement('div', { className: 'brand', style: { color: '#fff' } },
          React.createElement(PresaMark, { size: 14, bg: accent }), React.createElement('span', null, brand || 'Presa')),
        React.createElement('div', { className: 'sl-pageno' }, String(slide.slideNumber).padStart(2, '0'), ' / ', String(total).padStart(2, '0'))
      )
    );
  }

  // ----- CONTENT -----
  const bulletCount = slide.bullets.length;
  const bulletSize = bulletCount > 4 ? '2.15cqw' : bulletCount > 3 ? '2.4cqw' : '2.6cqw';
  return React.createElement('div', { className: 'slide', style: { background: t.bg } },
    rule,
    React.createElement('div', { className: 'sl-pad' },
      eyebrow(String(slide.slideNumber).padStart(2, '0')),
      React.createElement('h2', { className: 'sl-title', style: { color: titleColor, fontSize: '4.4cqw', marginTop: '2.2cqw', maxWidth: '86%' } }, slide.title),
      React.createElement('div', { style: { width: '9cqw', height: '.4cqw', background: accent, margin: '2.4cqw 0 0', borderRadius: '.2cqw', display: t.rule === 'under' ? 'block' : 'none' } }),
      React.createElement('ul', { className: 'sl-bullets', style: { marginTop: '3.6cqw', maxWidth: '88%' } },
        slide.bullets.map((b, i) => React.createElement('li', { key: i, style: { color: bodyColor, fontSize: bulletSize } },
          React.createElement('span', { className: 'mk', style: { background: accent } }), b))
      )
    ),
    foot
  );
}

window.SlideCanvas = SlideCanvas;
