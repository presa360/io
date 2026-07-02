/* global React, ReactDOM */
/* Presa — review decks for 5 work themes. Composed from real templates. */
(function () {
  const h = React.createElement;
  const Lib = window.PresaTemplates;
  const THEMES = window.PresaData.THEMES;
  const PS = window.PresaStock || { url: () => '', ids: {} };
  const img = (k, w) => PS.url(PS.ids[k], w);

  // clone a template's sample and apply field overrides (arrays replaced wholesale)
  function F(id, over) {
    const t = Lib.byId(id);
    const base = t && t.sample ? JSON.parse(JSON.stringify(t.sample)) : {};
    return Object.assign(base, over || {});
  }
  const S = (id, cat, over) => ({ id, cat, fields: F(id, over) });

  const DECKS = [
    {
      key: 'logistics', name: 'Логистическая компания', brand: 'ТрансЛайн', theme: 'blue',
      tagline: 'Грузоперевозки и складская логистика',
      slides: [
        S('title-08', 'Титул', { eyebrow: 'ЛОГИСТИКА И ДОСТАВКА', title: 'Доставляем точно в срок', subtitle: 'Грузоперевозки по России и СНГ — от одной паллеты до фуры', imageLabel: '', image: img('construction') }),
        S('about-company-13', 'О компании', { eyebrow: 'О КОМПАНИИ', title: 'О компании', intro: '«ТрансЛайн» — федеральный оператор грузоперевозок с собственным автопарком и сетью складов. Возим сборные и комплектные грузы, контролируем каждый рейс.', cards: [
          { icon: 'box', heading: 'Автопарк', text: '350 собственных машин разной грузоподъёмности' },
          { icon: 'globe', heading: 'География', text: '48 регионов России и страны СНГ' },
          { icon: 'shield', heading: 'Надёжность', text: 'Страхование и контроль на каждом этапе' } ] }),
        S('problem-09', 'Проблема', { eyebrow: 'ПРОБЛЕМА', title: 'С чем сталкивается бизнес', cards: [
          { heading: 'Срывы сроков', text: 'Простой склада и недовольные клиенты' },
          { heading: 'Нет прозрачности', text: 'Неизвестно, где груз прямо сейчас' },
          { heading: 'Простой техники', text: 'Холостые пробеги и лишние расходы' } ] }),
        S('solution-08', 'Решение', { eyebrow: 'РЕШЕНИЕ', title: 'Наши решения', cards: [
          { icon: 'box', heading: 'Магистральные перевозки', text: 'FTL и LTL по всей стране' },
          { icon: 'layers', heading: 'Складская логистика', text: 'Хранение, комплектация, фулфилмент' },
          { icon: 'chart', heading: 'Отслеживание 24/7', text: 'Онлайн-мониторинг каждого рейса' } ] }),
        S('services-10', 'Услуги', { title: 'Что мы возим и делаем', cards: [
          { icon: 'box', heading: 'FTL', text: 'Отдельная машина' }, { icon: 'layers', heading: 'LTL', text: 'Сборные грузы' },
          { icon: 'shield', heading: 'Складирование', text: 'Склады класса A' }, { icon: 'globe', heading: 'Экспедирование', text: 'Перевозки под ключ' },
          { icon: 'doc', heading: 'Таможня', text: 'ВЭД и оформление' }, { icon: 'badge', heading: 'Страхование', text: 'Каждого груза' } ] }),
        S('numbers-04', 'Цифры', { eyebrow: 'ИТОГИ', title: 'ТрансЛайн в цифрах', stats: [
          { icon: 'chart', value: '12 000', label: 'рейсов в год' }, { icon: 'clock', value: '99,2%', label: 'доставок в срок' },
          { icon: 'globe', value: '48', label: 'регионов присутствия' }, { icon: 'box', value: '350', label: 'единиц техники' } ] }),
        S('process-01', 'Процесс', { title: 'Как мы работаем', milestones: [
          { title: 'Заявка', desc: 'Расчёт стоимости за 30 минут' }, { title: 'Подбор', desc: 'Машина и оптимальный маршрут' },
          { title: 'Доставка', desc: 'Контроль и мониторинг 24/7' }, { title: 'Отчёт', desc: 'Документы и закрытие рейса' } ] }),
        S('comparison-01', 'Сравнение', { title: 'Почему ТрансЛайн', leftLabel: 'ТрансЛайн', rightLabel: 'Случайный перевозчик', rows: [
          { label: 'Сроки', left: 'Гарантия в договоре', right: 'Как получится' },
          { label: 'Мониторинг', left: 'Онлайн 24/7', right: 'Звонки водителю' },
          { label: 'Документы', left: 'ЭДО', right: 'Бумага и задержки' },
          { label: 'Ответственность', left: 'Страхование груза', right: 'На свой риск' } ] }),
        S('contact-02', 'Контакты', { eyebrow: 'КОНТАКТЫ', title: 'Рассчитаем доставку сегодня', subtitle: 'Пришлите маршрут и параметры груза — вернёмся с расчётом за 30 минут', sideLabel: '8 800 555-00-00' })
      ]
    },
    {
      key: 'construction', name: 'Строительная компания', brand: 'СтройМонолит', theme: 'industrial',
      tagline: 'Строительство полного цикла',
      slides: [
        S('title-07', 'Титул', { eyebrow: 'СТРОИТЕЛЬСТВО ПОЛНОГО ЦИКЛА', title: 'Строим на десятилетия', subtitle: 'Промышленные и жилые объекты под ключ', image: img('construction') }),
        S('about-company-08', 'О компании', { title: 'О компании', text: '«СтройМонолит» — генеральный подрядчик полного цикла: от проекта до сдачи объекта. 18 лет строим жильё, склады и производственные комплексы.', imageLabel: '', image: img('buildings') }),
        S('services-04', 'Услуги', { title: 'Что мы делаем', cards: [
          { icon: 'doc', heading: 'Проектирование', text: 'Полный комплект документации' }, { icon: 'box', heading: 'Монолит', text: 'Каркас и фундаменты' },
          { icon: 'layers', heading: 'Фасады', text: 'Навесные и мокрые системы' }, { icon: 'gear', heading: 'Инженерные сети', text: 'ОВ, ВК, электрика' },
          { icon: 'globe', heading: 'Благоустройство', text: 'Территория и МАФ' }, { icon: 'badge', heading: 'Сдача под ключ', text: 'С гарантией качества' } ] }),
        S('problem-01', 'Проблема', { title: 'Риски в строительстве', bullets: ['Срыв сроков и рост сметы', 'Низкое качество подрядчиков', 'Проблемы с документами и надзором'] }),
        S('solution-07', 'Решение', { eyebrow: 'ПОДХОД', title: 'Как мы снимаем риски', bullets: ['Фиксированная смета и сроки в договоре', 'Собственные бригады и техника', 'Технадзор и фотоотчёты каждый день', 'Гарантия на работы до 5 лет'] }),
        S('numbers-01', 'Цифры', { title: 'СтройМонолит в цифрах', stats: [
          { value: '1,2 млн', label: 'м² построено' }, { value: '18 лет', label: 'на рынке' }, { value: '240', label: 'объектов сдано' } ], note: 'Данные на 2026 год' }),
        S('case-01', 'Кейс', { title: 'Кейс: складской комплекс «Восток»', text: 'Построили распределительный центр 24 000 м² за 11 месяцев — от котлована до ввода в эксплуатацию, без замечаний при сдаче.', stats: [
          { value: '24 000', label: 'м² за 11 месяцев' }, { value: '0', label: 'замечаний при сдаче' } ] }),
        S('process-02', 'Процесс', { title: 'Этапы работы', steps: [
          { title: 'Проект и смета', desc: 'Согласуем объём и стоимость' }, { title: 'Площадка', desc: 'Подготовка и нулевой цикл' },
          { title: 'Строительство', desc: 'Монолит, фасады, инженерные сети' }, { title: 'Сдача', desc: 'Пуско-наладка и документы' } ] }),
        S('contact-01', 'Контакты', { title: 'Обсудим ваш объект', subtitle: 'Бесплатный расчёт сметы за 3 дня', bullets: ['build@stroymonolit.ru', '8 800 700-10-20', 'stroymonolit.ru'], buttonLabel: 'Запросить смету' })
      ]
    },
    {
      key: 'it', name: 'ИТ-компания', brand: 'Нордсофт', theme: 'tech',
      tagline: 'Разработка, облако, безопасность',
      slides: [
        S('title-14', 'Титул', { eyebrow: 'IT-РЕШЕНИЯ', title: 'Технологии для роста', titleAccent: 'вашего бизнеса', subtitle: 'Разработка, облако и кибербезопасность под задачи бизнеса' }),
        S('about-company-10', 'О компании', { title: 'О компании', intro: '«Нордсофт» — продуктовая IT-команда. Создаём и сопровождаем цифровые продукты для среднего и крупного бизнеса.', cards: [
          { icon: 'target', heading: 'Миссия', text: 'Делаем технологии понятными и полезными для бизнеса' },
          { icon: 'shield', heading: 'Экспертиза', text: '10+ лет в enterprise-разработке' },
          { icon: 'users', heading: 'Команда', text: '60 инженеров, дизайнеров и аналитиков' },
          { icon: 'chart', heading: 'Результат', text: 'Продукты с измеримым эффектом' } ] }),
        S('problem-07', 'Проблема', { title: 'Проблема', text: 'Бизнес теряет деньги на ручных процессах, разрозненных системах и небезопасной инфраструктуре.', bullets: ['Медленные процессы', 'Зоопарк систем', 'Риски утечек данных', 'Нет сквозной аналитики'] }),
        S('solution-08', 'Решение', { eyebrow: 'ПРОДУКТ', title: 'Наши решения', cards: [
          { icon: 'doc', heading: 'Разработка ПО', text: 'Веб, мобайл и интеграции под задачи' },
          { icon: 'cloud', heading: 'Облачные решения', text: 'Миграция в облако и DevOps' },
          { icon: 'shield', heading: 'Кибербезопасность', text: 'Аудит и защита данных' } ] }),
        S('services-04', 'Услуги', { title: 'Чем помогаем', cards: [
          { icon: 'doc', heading: 'Заказная разработка', text: 'MVP и сложные системы' }, { icon: 'cloud', heading: 'Облако', text: 'AWS, Yandex Cloud' },
          { icon: 'gear', heading: 'Интеграции', text: '1С, CRM, ERP' }, { icon: 'chart', heading: 'Аналитика', text: 'BI и дашборды' },
          { icon: 'shield', heading: 'Безопасность', text: 'Пентесты и SOC' }, { icon: 'bolt', heading: 'Поддержка', text: 'SLA 24/7' } ] }),
        S('numbers-04', 'Цифры', { eyebrow: 'ИТОГИ', title: 'Нордсофт в цифрах', stats: [
          { icon: 'chart', value: '180+', label: 'проектов завершено' }, { icon: 'users', value: '97%', label: 'клиентов остаются с нами' },
          { icon: 'clock', value: '10+', label: 'лет на рынке' }, { icon: 'shield', value: '24/7', label: 'мониторинг систем' } ] }),
        S('case-03', 'Кейс', { title: 'Кейс: финтех-платформа', text: 'Запустили платёжную платформу с нуля за 7 месяцев: микросервисная архитектура, отказоустойчивость и доступность 99,99%.', imageLabel: '', image: img('developer') }),
        S('benefits-09', 'Преимущества', { eyebrow: 'ПОЧЕМУ МЫ', title: 'Почему выбирают Нордсофт', cards: [
          { heading: 'Прозрачность', text: 'Демо каждые две недели' }, { heading: 'Качество', text: 'Тесты и код-ревью на каждом этапе' },
          { heading: 'Масштабируемость', text: 'Архитектура, готовая к росту' }, { heading: 'Поддержка 24/7', text: 'Дежурная команда на связи' } ] }),
        S('contact-03', 'Контакты', { eyebrow: 'ОБСУДИМ ПРОЕКТ', title: 'Готовы помочь с вашей задачей', subtitle: 'hello@nordsoft.ru · +7 495 000-00-00 · nordsoft.ru', footerLabel: 'Нордсофт' })
      ]
    },
    {
      key: 'startup', name: 'Стартап', brand: 'Флоу', theme: 'indigo',
      tagline: 'Продуктовый питч',
      slides: [
        S('title-15', 'Титул', { eyebrow: 'PRODUCT LAUNCH', title: 'Работа в потоке —', titleAccent: 'без хаоса', subtitle: 'Флоу объединяет задачи, документы и команду в одном окне' }),
        S('problem-04', 'Проблема', { statValue: '40%', statLabel: 'рабочего времени уходит на переключение между инструментами', bullets: ['Десятки открытых вкладок', 'Контекст постоянно теряется', 'Команда не синхронна'] }),
        S('solution-05', 'Решение', { title: 'Что такое Флоу', text: 'Флоу — рабочее пространство нового поколения: задачи, документы и общение живут вместе и связаны по смыслу.', bullets: ['Единое окно для всей работы', 'ИИ сам собирает контекст', 'Интеграции со всем стеком'] }),
        S('numbers-02', 'Тяга', { statValue: '×3', statLabel: 'быстрее закрываются задачи у команд на Флоу', bullets: ['Меньше переключений', 'Прозрачные приоритеты'] }),
        S('services-10', 'Продукт', { title: 'Возможности', cards: [
          { icon: 'layers', heading: 'Задачи', text: 'Доски и спринты' }, { icon: 'doc', heading: 'Документы', text: 'Совместная работа' },
          { icon: 'bolt', heading: 'ИИ', text: 'Саммари и поиск' }, { icon: 'chat', heading: 'Чат', text: 'В контексте задач' },
          { icon: 'chart', heading: 'Аналитика', text: 'Прогресс команды' }, { icon: 'gear', heading: 'Интеграции', text: '100+ сервисов' } ] }),
        S('numbers-01', 'Метрики', { title: 'Тяга рынка', stats: [
          { value: '12 000', label: 'команд в бете' }, { value: '+38%', label: 'рост MoM' }, { value: '4,9', label: 'оценка в сторах' } ], note: 'Данные за последние 6 месяцев' }),
        S('roadmap-01', 'Дорожная карта', { title: 'Дорожная карта', milestones: [
          { title: 'Q1', desc: 'Публичный запуск' }, { title: 'Q2', desc: 'Мобильные приложения' }, { title: 'Q3', desc: 'ИИ-агенты' }, { title: 'Q4', desc: 'Enterprise и SSO' } ] }),
        S('team-02', 'Команда', { quote: 'Мы строим инструмент, в котором команды наконец перестают терять контекст и работают в одном потоке.', author: 'Алексей Орлов', role: 'CEO и сооснователь Флоу' }),
        S('contact-01', 'Контакты', { title: 'Присоединяйтесь к бете', subtitle: 'Первые 3 месяца — бесплатно для команд до 10 человек', bullets: ['flow.app', 'hello@flow.app', '@flow'], buttonLabel: 'Получить доступ' })
      ]
    },
    {
      key: 'webinar', name: 'Вебинар', brand: 'Академия Роста', theme: 'violet',
      tagline: 'Обучающий онлайн-вебинар',
      slides: [
        S('title-16', 'Титул', { eyebrow: 'БЕСПЛАТНЫЙ ВЕБИНАР', title: 'Как вырасти в продажах', titleAccent: 'в 2026 году', subtitle: 'Практические инструменты для B2B-команд', footerLabel: '12 марта · 19:00 МСК' }),
        S('agenda-06', 'Программа', { title: 'Программа вебинара', steps: [
          { title: 'Тренды 2026', desc: 'Что меняется в B2B-продажах' }, { title: 'Воронка', desc: 'Где утекают сделки' },
          { title: 'Скрипты и ИИ', desc: 'Как ускорить работу менеджеров' }, { title: 'Разбор кейсов', desc: 'Живые примеры и ответы' } ] }),
        S('team-03', 'Спикер', { title: 'Спикер', text: 'Мария Соколова — 12 лет в B2B-продажах, выстроила отделы в 30+ компаниях, автор курса «Системные продажи».', stats: [
          { value: '30+', label: 'отделов продаж построено' }, { value: '12 лет', label: 'в B2B' }, { value: '5 000+', label: 'учеников' } ] }),
        S('problem-02', 'Почему важно', { quote: 'Большинство команд теряют до половины сделок не из-за продукта, а из-за хаоса в процессе продаж.', author: 'Исследование рынка B2B, 2025' }),
        S('solution-03', 'Метод', { title: '3 шага к росту', steps: [
          { title: 'Аудит', desc: 'Находим узкие места воронки' }, { title: 'Система', desc: 'Внедряем процесс и скрипты' }, { title: 'Масштаб', desc: 'Автоматизируем и растим' } ] }),
        S('numbers-03', 'Результаты', { title: 'Это работает', text: 'Участники прошлых потоков применяют систему и видят результат уже в первый месяц.', stats: [
          { value: '+27%', label: 'к конверсии в сделку' }, { value: '−30%', label: 'к длине цикла сделки' } ] }),
        S('process-03', 'Бонусы', { title: 'Что вы получите', cards: [
          { heading: 'Чек-лист воронки', text: 'Готовый шаблон для аудита продаж' }, { heading: 'Скрипты', text: 'Под разные этапы сделки' },
          { heading: 'Запись', text: 'Доступ к вебинару навсегда' }, { heading: 'Бонус', text: 'Шаблон отчёта для руководителя' } ] }),
        S('contact-01', 'Регистрация', { title: 'Регистрация на вебинар', subtitle: 'Участие бесплатное. Запись придёт всем зарегистрированным', bullets: ['academrosta.ru/webinar', '12 марта · 19:00 МСК'], buttonLabel: 'Зарегистрироваться' })
      ]
    }
  ];

  function Slide({ s, n, total, theme, brand }) {
    const tpl = Lib.byId(s.id);
    return h('div', { className: 'row' },
      h('div', { className: 'row__bar' },
        h('span', { className: 'row__idx' }, 'S' + String(n).padStart(2, '0')),
        h('span', { className: 'row__cat' }, s.cat),
        h('span', { className: 'row__tpl' }, tpl ? tpl.name : s.id)),
      h('div', { className: 'stage' },
        h(window.SlideRenderer, { template: tpl, fields: s.fields, theme, scale: 1, slideNumber: n, total, brand })));
  }

  function App() { return null; }

  // mount a single Root that owns tabs + deck (reuses page CSS classes)
  document.getElementById('tabs').remove();
  document.querySelector('.deck').remove();
  const host = document.createElement('div');
  document.querySelector('.note').insertAdjacentElement('afterend', host);
  function Root() {
    const init = (() => { try { return +localStorage.getItem('presa_deck_idx') || 0; } catch (e) { return 0; } })();
    const [idx, setIdx] = React.useState(Math.min(init, DECKS.length - 1));
    const deck = DECKS[idx];
    const theme = THEMES[deck.theme];
    const brand = { name: deck.brand, pageNum: true };
    return h(React.Fragment, null,
      h('div', { className: 'tabs' },
        h('div', { className: 'tabs__in' },
          DECKS.map((d, i) => h('button', {
            key: d.key, className: 'tab' + (i === idx ? ' on' : ''),
            style: i === idx ? { background: THEMES[d.theme].accent } : null,
            onClick: () => { setIdx(i); try { localStorage.setItem('presa_deck_idx', String(i)); } catch (e) {} window.scrollTo({ top: 0, behavior: 'smooth' }); }
          },
            h('span', { className: 'tab__dot', style: { background: i === idx ? '#fff' : THEMES[d.theme].accent } }),
            d.name, h('span', { className: 'tab__n' }, '· ' + d.slides.length)))) ),
      h('div', { className: 'deck' },
        h('div', { className: 'deck__head' },
          h('div', { className: 'deck__title' }, deck.brand),
          h('div', { className: 'deck__meta' }, deck.tagline + ' · ' + deck.slides.length + ' слайдов')),
        h('div', { className: 'slides' },
          deck.slides.map((s, i) => h(Slide, { key: deck.key + i, s, n: i + 1, total: deck.slides.length, theme, brand })))));
  }
  ReactDOM.createRoot(host).render(h(Root));
})();
