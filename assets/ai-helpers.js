/* ============================================================
   Presa — AI helpers (deterministic stand-ins)
   Mirror the server AI routes' contract but run locally so the
   prototype works without a key. Same shapes the real model uses:
   - improveSlideFields(template, fields, action) -> { fields, explanation }
   - generateFromBrief(brief) -> [{ templateId, category, fields }]
   ============================================================ */
(function () {
  const FILLER = /\b(очень|реально|просто|как бы|в принципе|на самом деле|типа|вообще)\s*/gi;
  const CASUAL = [
    [/\bкрут\w*/gi, 'эффективн'], [/\bклассн\w*/gi, 'качественн'],
    [/\bбыстренько\b/gi, 'оперативно'], [/\bштук\w*/gi, 'решений'],
    [/\bделаем\b/gi, 'обеспечиваем'], [/\bделает\b/gi, 'обеспечивает'],
    [/\bпомогаем\b/gi, 'помогаем достигать'], [/\bхорош\w*/gi, 'высокого уровня']
  ];

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const tidy = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  function improveStr(s) {
    let t = tidy(s).replace(FILLER, '');
    t = cap(t);
    if (t.length > 24 && !/[.!?…]$/.test(t)) t += '.';
    return tidy(t);
  }
  function shortenStr(s) {
    let t = tidy(s).replace(FILLER, '');
    // keep first clause / first ~8 words
    const clause = t.split(/[—,;:]/)[0].trim();
    const base = clause.length >= 12 ? clause : t;
    const words = base.split(' ');
    t = words.slice(0, 8).join(' ');
    return cap(t.replace(/[.!?…]+$/, ''));
  }
  function businessStr(s) {
    let t = tidy(s).replace(FILLER, '');
    CASUAL.forEach(([re, to]) => { t = t.replace(re, to); });
    return cap(t);
  }
  function salesStr(s) {
    let t = businessStr(s);
    // emphasise value verbs at the start where it reads naturally
    t = t.replace(/^мы\s+/i, 'Мы ');
    return cap(t);
  }

  const FN = { improve: improveStr, shorten: shortenStr, business: businessStr, sales: salesStr };
  const EXPLAIN = {
    improve: 'Убрал лишние слова, поправил пунктуацию и заглавные буквы.',
    shorten: 'Сократил формулировки, чтобы текст лучше ложился в дизайн.',
    business: 'Сделал тон более деловым и нейтральным.',
    sales: 'Усилил акцент на ценности и сделал тон продающим.'
  };

  function applyToValue(def, value, fn) {
    if (def.type === 'text' || def.type === 'textarea') return fn(value || '');
    if (def.type === 'list') return (Array.isArray(value) ? value : []).map((x) => fn(String(x)));
    if (def.type === 'group') {
      return (Array.isArray(value) ? value : []).map((obj) => {
        const out = { ...obj };
        def.sub.forEach((sd) => {
          if (sd.type === 'list') out[sd.key] = (obj[sd.key] || []).map((x) => fn(String(x)));
          else if (sd.type === 'text' || sd.type === 'textarea') out[sd.key] = fn(obj[sd.key] || '');
        });
        return out;
      });
    }
    return value;
  }

  // skip transforming "value" fields like prices / stat numbers / labels meant verbatim
  const SKIP_KEYS = new Set(['statValue', 'price', 'value', 'sideLabel', 'footerLabel', 'eyebrow', 'leftLabel', 'rightLabel']);

  function improveSlideFields(template, fields, action) {
    const fn = FN[action] || improveStr;
    const out = { ...fields };
    const defs = [...template.requiredFields, ...(template.optionalFields || [])];
    defs.forEach((def) => {
      if (SKIP_KEYS.has(def.key)) return;
      out[def.key] = applyToValue(def, fields[def.key], fn);
    });
    return { fields: out, explanation: EXPLAIN[action] || EXPLAIN.improve };
  }

  // ---------- brief → content per category ----------
  function contentFor(category, b) {
    const company = b.companyName || 'Компания';
    const industry = b.industry || 'вашем рынке';
    const audience = b.targetAudience || 'клиентов';
    const offer = b.offer || b.goal || 'наше решение';
    switch (category) {
      case 'title': return { eyebrow: (b.goal || 'ПРЕЗЕНТАЦИЯ').toUpperCase(), title: company, subtitle: `${offer} для аудитории «${audience}»`, footerLabel: 'presa.io' };
      case 'agenda': return { title: 'О чём поговорим', items: ['Кто мы и чем занимаемся', 'Ваш контекст и задача', 'Наше решение и ценность', 'Результаты и кейсы', 'Дальнейшие шаги'] };
      case 'about_company': return { title: 'О компании', bullets: [`${company} работает в сфере «${industry}»`, 'Фокус на измеримых бизнес-результатах', `Помогаем аудитории «${audience}» достигать целей`], text: `${company} — команда в сфере «${industry}», сфокусированная на результате для клиента.`, stats: [{ value: '120+', label: 'клиентов' }, { value: '7 лет', label: 'на рынке' }, { value: '38', label: 'в команде' }] };
      case 'problem': return { title: 'С чем вы сталкиваетесь', bullets: [`${audience} теряют время на ручной работе`, 'Результат трудно прогнозировать', 'Нет единого стандарта качества'], quote: `${audience} тратят слишком много времени не на смысл, а на оформление.`, author: 'Контекст рынка' };
      case 'solution': return { title: 'Наше решение', bullets: [`Понятный путь от задачи к результату для «${audience}»`, 'Встраивается в ваши процессы', 'Результат, который можно показать'], text: `${offer}: понятный путь от задачи к результату, встроенный в ваши процессы.`, imageLabel: 'Скриншот продукта', steps: [{ title: 'Бриф', desc: 'Описываете задачу' }, { title: 'Сборка', desc: 'Готовим решение' }, { title: 'Результат', desc: 'Забираете готовое' }] };
      case 'services': return { title: 'Что мы предлагаем', cards: [{ heading: 'Направление 1', text: 'Ключевая услуга для клиента' }, { heading: 'Направление 2', text: 'Дополняющее решение' }, { heading: 'Направление 3', text: 'Поддержка и развитие' }], bullets: ['Коммерческие предложения', 'Презентации компании', 'Отчёты и аналитика'] };
      case 'benefits': return { title: 'Что вы получаете', cards: [{ heading: 'Быстро', text: 'Экономия времени команды' }, { heading: 'Стабильно', text: 'Единое качество результата' }, { heading: 'Выгодно', text: 'Больше фокуса на главном' }], bullets: ['Экономию десятков часов', 'Единый стандарт качества', 'Фокус на стратегии'], text: 'Команда быстрее достигает целей при стабильном качестве.', stats: [{ value: '−40%', label: 'времени' }, { value: '×3', label: 'скорость' }] };
      case 'numbers': return { title: `${company} в цифрах`, stats: [{ value: '120+', label: 'клиентов' }, { value: '−40%', label: 'времени' }, { value: '4.9', label: 'оценка' }], statValue: '×3', statLabel: 'рост ключевой метрики', bullets: ['При стабильном качестве', 'Без роста нагрузки'], text: 'Результаты подтверждают эффективность подхода.', note: 'Данные за последний год' };
      case 'case_study': return { title: `Кейс: ${audience}`, text: `Клиент из сферы «${industry}» внедрил решение и ускорил ключевой процесс.`, stats: [{ value: '−55%', label: 'времени' }, { value: '+22%', label: 'к результату' }], quote: 'Решение окупилось в первые недели — качество стало ровным.', author: 'Клиент', role: industry, imageLabel: 'До / после' };
      case 'process': return { title: 'Как мы работаем', milestones: [{ title: 'Бриф', desc: 'Согласуем цель' }, { title: 'Сборка', desc: 'Готовим решение' }, { title: 'Правки', desc: 'Дорабатываем' }, { title: 'Запуск', desc: 'Передаём результат' }], steps: [{ title: 'Знакомство', desc: 'Изучаем задачу' }, { title: 'Работа', desc: 'Готовим решение' }, { title: 'Передача', desc: 'Отдаём результат' }], cards: [{ heading: 'Анализ', text: 'Разбираем задачу' }, { heading: 'Работа', text: 'Готовим решение' }, { heading: 'Сдача', text: 'Передаём результат' }] };
      case 'pricing': return { title: 'Тарифы', tiers: [{ name: 'Start', price: '0 ₽', features: ['Базовый набор', '1 пользователь'] }, { name: 'Team', price: '2 900 ₽/мес', features: ['Полный набор', 'До 10 человек'] }, { name: 'Enterprise', price: 'по запросу', features: ['Индивидуально', 'Поддержка'] }], statValue: '2 900 ₽', statLabel: 'в месяц за команду', bullets: ['Полный набор возможностей', 'Поддержка и обновления'], leftLabel: 'Team', rightLabel: 'Enterprise', rows: [{ label: 'Возможности', left: 'Все', right: 'Все + кастом' }, { label: 'Поддержка', left: 'Почта', right: 'Менеджер' }] };
      case 'comparison': return { title: 'Почему мы', leftLabel: company, rightLabel: 'Другие', rows: [{ label: 'Скорость', left: 'Минуты', right: 'Часы' }, { label: 'Качество', left: 'Стабильное', right: 'Разное' }, { label: 'Стиль', left: 'Единый', right: 'Разный' }], cards: [{ heading: 'Обычный подход', text: 'Долго и нестабильно' }, { heading: `С ${company}`, text: 'Быстро и качественно' }], bullets: ['Скорость вместо рутины', 'Единый стандарт', 'Предсказуемый результат'] };
      case 'roadmap': return { title: 'Дорожная карта', milestones: [{ title: 'Q1', desc: 'Запуск' }, { title: 'Q2', desc: 'Развитие' }, { title: 'Q3', desc: 'Масштаб' }, { title: 'Q4', desc: 'Интеграции' }], cards: [{ heading: 'Q1', text: 'Запуск' }, { heading: 'Q2', text: 'Развитие' }, { heading: 'Q3', text: 'Масштаб' }, { heading: 'Q4', text: 'Интеграции' }], steps: [{ title: 'Сейчас', desc: 'База' }, { title: 'Скоро', desc: 'Развитие' }, { title: 'Потом', desc: 'Масштаб' }] };
      case 'team': return { title: 'Наша команда', members: [{ name: 'Иван Петров', role: 'CEO' }, { name: 'Анна Котова', role: 'Product' }, { name: 'Дмитрий Лис', role: 'Design' }, { name: 'Мария Гросс', role: 'Sales' }], quote: 'Мы собрали команду вокруг одной задачи — результата для клиента.', author: 'Основатель', role: company, text: 'Эксперты в продукте, дизайне и продажах.', stats: [{ value: '38', label: 'человек' }, { value: '6', label: 'стран' }] };
      case 'contact': return { title: 'Давайте начнём', subtitle: 'Соберём ваш проект вместе', bullets: ['hello@presa.io', '+7 999 000-00-00', 'presa.io'], buttonLabel: 'Запланировать звонок', eyebrow: 'СЛЕДУЮЩИЙ ШАГ', sideLabel: 'hello@presa.io', footerLabel: company };
      default: return {};
    }
  }

  // map a content superset onto exactly the template's fields (fallback to sample)
  function fitToTemplate(template, content) {
    const out = {};
    const defs = [...template.requiredFields, ...(template.optionalFields || [])];
    defs.forEach((def) => {
      if (content[def.key] !== undefined) out[def.key] = content[def.key];
      else if (template.sample && template.sample[def.key] !== undefined) out[def.key] = template.sample[def.key];
    });
    return out;
  }

  function autofillFromBrief(template, brief) {
    return fitToTemplate(template, contentFor(template.category, brief));
  }

  // choose a deck structure sized to slideCount and fill each slide
  function generateFromBrief(brief) {
    const Lib = window.PresaTemplates;
    const count = Math.max(5, Math.min(16, parseInt(brief.slideCount, 10) || 9));
    const core = ['title', 'about_company', 'problem', 'solution', 'benefits', 'numbers', 'case_study', 'process', 'comparison', 'pricing', 'roadmap', 'team'];
    const seq = ['title'];
    if (count >= 8) seq.push('agenda');
    let i = 1;
    while (seq.length < count - 1 && i < core.length) { if (core[i] !== 'title') seq.push(core[i]); i++; }
    seq.push('contact');

    return seq.slice(0, count).map((cat) => {
      const variants = Lib.byCategory(cat);
      const tpl = variants[0];
      return { templateId: tpl.id, category: cat, fields: autofillFromBrief(tpl, brief) };
    });
  }

  window.PresaAI = { improveSlideFields, autofillFromBrief, generateFromBrief, contentFor };
})();
