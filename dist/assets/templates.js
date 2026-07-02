/* ============================================================
   Presa — Slide Template Library
   15 categories × 3 variants. Data-driven, typed fields so the
   editor + PPTX renderer stay generic and the library can grow
   to 20–50 variants per category without UI changes.

   Field types: text | textarea | list | group
   - list:  array of strings   (minItems, maxItems, maxItemLength)
   - group: array of objects    (sub: [{key,label,type,maxLength}], minItems, maxItems)
   ============================================================ */
(function () {
  // ---- field helpers ----
  const text = (key, label, maxLength, placeholder) => ({ key, label, type: 'text', maxLength, placeholder });
  const area = (key, label, maxLength, placeholder) => ({ key, label, type: 'textarea', maxLength, placeholder });
  const list = (key, label, minItems, maxItems, maxItemLength, placeholder) => ({ key, label, type: 'list', minItems, maxItems, maxItemLength, placeholder });
  const group = (key, label, sub, minItems, maxItems) => ({ key, label, type: 'group', sub, minItems, maxItems });
  const image = (key, label) => ({ key, label, type: 'image' });
  const icon = (key, label) => ({ key, label, type: 'icon' });

  // ---- curated corporate stock photos (Unsplash, replaceable by drag-drop) ----
  const stock = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w || 1280}&q=72`;
  const STOCK = {
    buildings: '1486406146926-c627a92ad1ab', officeHall: '1497366754035-f200968a6e72', meeting: '1521737604893-d14cc237f11d',
    handshake: '1521791136064-7986c2920216', teamLaptops: '1522071820081-009f0129c71c', analytics: '1460925895917-afdab827c52f',
    deskDocs: '1454165804606-c3d57bc86b40', openOffice: '1504384308090-c894fdcc538d', officeWindow: '1497215728101-856f4ea42174',
    collab: '1556761175-b413da4baf72', developer: '1581094794329-c8112a89af12', construction: '1565008447742-97f6f38c985c',
    coworking: '1542744173-8e7e53415bb0', loft: '1559136555-9303baea8ebd', devicesNature: '1573164713714-d95e436ab8d6', twoDevs: '1551434678-e076c223a692'
  };
  window.PresaStock = { url: stock, ids: STOCK };

  // ---- curated icon set for service/product cards (stroke style, 24×24) ----
  window.PresaIcons = {
    spark:   ['M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z', 'M9 21h6', 'M10 17v4', 'M14 17v4'],
    bolt:    ['M13 2L4 14h7l-1 8 9-12h-7l1-8z'],
    rocket:  ['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.78-.78.78-2.22 0-3a2.12 2.12 0 00-3 0z', 'M12 15l-3-3a22 22 0 014-9 11.5 11.5 0 015 5 22 22 0 01-9 4z', 'M9 12H5s.5-2.5 2-4 5-1 5-1', 'M12 15v4s2.5-.5 4-2 1-5 1-5'],
    gear:    ['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 13a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.2a1.6 1.6 0 00-2.7-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004.6 13H4a2 2 0 110-4h.2a1.6 1.6 0 001.1-2.7l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0011 3.6V3a2 2 0 114 0v.2a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 001.1 2.7H21a2 2 0 110 4h-.2a1.6 1.6 0 00-1.4 1z'],
    chart:   ['M4 20V10', 'M10 20V4', 'M16 20v-8', 'M22 20H2'],
    shield:  ['M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z', 'M9.5 12l2 2 3.5-3.5'],
    bulb:    ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 00-4 10.5c.6.6 1 1.3 1 2.1V17h6v-1.4c0-.8.4-1.5 1-2.1A6 6 0 0012 3z'],
    users:   ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z', 'M22 21v-2a4 4 0 00-3-3.9', 'M16 3.1a4 4 0 010 7.8'],
    clock:   ['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 6v6l4 2'],
    heart:   ['M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-6.6 1-1a5.5 5.5 0 000-7.8z'],
    star:    ['M12 3l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.5 9.1l5.9-.8L12 3z'],
    globe:   ['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M2 12h20', 'M12 2a15 15 0 010 20 15 15 0 010-20z'],
    chat:    ['M21 11.5a8.4 8.4 0 01-9 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z'],
    doc:     ['M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8l-5-5z', 'M14 3v5h5'],
    lock:    ['M5 11a1 1 0 011-1h12a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1v-9z', 'M8 11V7a4 4 0 118 0v4'],
    cart:    ['M9 21a1 1 0 100-2 1 1 0 000 2z', 'M19 21a1 1 0 100-2 1 1 0 000 2z', 'M2 3h3l2.5 12.5a2 2 0 002 1.5h8a2 2 0 002-1.5L22 7H6'],
    target:  ['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 18a6 6 0 100-12 6 6 0 000 12z', 'M12 14a2 2 0 100-4 2 2 0 000 4z'],
    badge:   ['M9 12l2 2 4-4', 'M12 22a10 10 0 100-20 10 10 0 000 20z'],
    layers:  ['M12 3l9 5-9 5-9-5 9-5z', 'M3 14l9 5 9-5'],
    cloud:   ['M7 18.5a4.5 4.5 0 01-.9-8.9A6 6 0 0117.8 11h.7a3.75 3.75 0 010 7.5H7z'],
    box:     ['M21 8l-9-5-9 5v8l9 5 9-5V8z', 'M3 8l9 5 9-5', 'M12 13v9'],
    palette: ['M12 21a9 9 0 110-18c5 0 9 3.1 9 7a4 4 0 01-4 4h-2.2a1.8 1.8 0 00-1.4 2.9c.3.4.6.8.6 1.3A1.8 1.8 0 0112 21z', 'M7.5 11a1 1 0 100-2 1 1 0 000 2z', 'M12 8a1 1 0 100-2 1 1 0 000 2z', 'M16.5 11a1 1 0 100-2 1 1 0 000 2z'],
    phone:   ['M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.5c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z'],
    handshake: ['M11 17l2 2a2 2 0 003-3', 'M14 16l2.5 2.5a2 2 0 003-3l-5-5', 'M21 11l-3.5-3.5a2 2 0 00-2.8 0L12 10l-2-2a2 2 0 00-2.8 0L3 12', 'M3 12l3 3', 'M9 7L7 5']
  };

  // common sub-shapes
  const cardSub = [text('heading', 'Заголовок', 38), area('text', 'Текст', 120)];
  const svcIconSub = [icon('icon', 'Иконка'), text('heading', 'Название', 34), area('text', 'Описание', 110)];
  const svcPhotoSub = [image('image', 'Фото'), text('heading', 'Название', 34), area('text', 'Описание', 100)];
  const statSub = [text('value', 'Значение', 10, '+87%'), text('label', 'Подпись', 44)];
  const stepSub = [text('title', 'Название', 40), area('desc', 'Описание', 110)];
  const tierSub = [text('name', 'Тариф', 28), text('price', 'Цена', 22), list('features', 'Что входит', 2, 5, 48)];
  const rowSub  = [text('label', 'Параметр', 40), text('left', 'Вы', 34), text('right', 'Другие', 34)];
  const memberSub = [text('name', 'Имя', 30), text('role', 'Роль', 36)];
  const chartSub = [text('label', 'Метка', 18, 'Q1'), text('value', 'Значение', 10, '42')];
  const tableRowSub = [text('c1', 'Колонка 1', 40), text('c2', 'Колонка 2', 30), text('c3', 'Колонка 3', 30)];
  const benefitRowSub = [text('heading', 'Заголовок', 34), area('text', 'Описание', 90)];
  const cmpRowSub = [text('feature', 'Возможность', 40), text('a', 'Presa', 6, '✓'), text('b', 'Другие', 6, '○'), text('c', 'Ручная', 6, '✕')];
  const aboutStatSub = [icon('icon', 'Иконка'), text('value', 'Значение', 10, '120+'), text('label', 'Подпись', 40), text('sub', 'Уточнение', 40)];
  const iconStatSub = [icon('icon', 'Иконка'), text('value', 'Значение', 8, '150+'), text('label', 'Подпись', 44)];
  const milestoneSub = [text('year', 'Год', 8, '2020'), text('heading', 'Заголовок', 40), area('text', 'Описание', 120)];

  // ---- categories ----
  const CATEGORIES = [
    { id: 'title',         label: 'Титульный слайд' },
    { id: 'agenda',        label: 'Содержание' },
    { id: 'about_company', label: 'О компании' },
    { id: 'problem',       label: 'Проблема клиента' },
    { id: 'solution',      label: 'Решение' },
    { id: 'services',      label: 'Продукт / услуги' },
    { id: 'benefits',      label: 'Преимущества' },
    { id: 'numbers',       label: 'Цифры / статистика' },
    { id: 'chart',         label: 'Диаграммы' },
    { id: 'table',         label: 'Таблица' },
    { id: 'case_study',    label: 'Кейсы' },
    { id: 'process',       label: 'Процесс работы' },
    { id: 'pricing',       label: 'Тарифы / пакеты' },
    { id: 'comparison',    label: 'Сравнение' },
    { id: 'roadmap',       label: 'Дорожная карта' },
    { id: 'team',          label: 'Команда' },
    { id: 'contact',       label: 'Контакты / CTA' }
  ];

  // ---- templates ----
  // helper to cut down on repetition
  let T = [];
  const add = (o) => T.push(o);

  /* ===== TITLE ===== */
  add({ id: 'title-01', category: 'title', variantNumber: 1, layoutType: 'title_hero', name: 'Титул — классический', description: 'Крупный заголовок и подзаголовок, акцентная линия слева', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28, 'PRESENTATION'), text('title', 'Заголовок', 48), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('footerLabel', 'Подпись внизу', 40)],
    sample: { eyebrow: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', title: 'Nordwave', subtitle: 'Платформа аналитики для растущих B2B-команд', footerLabel: 'presa.io' } });
  add({ id: 'title-02', category: 'title', variantNumber: 2, layoutType: 'split_accent', name: 'Титул — сплит с акцентом', description: 'Заголовок слева, цветная акцентная панель справа', themeSupport: ['light'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('sideLabel', 'Текст на панели', 30)],
    sample: { eyebrow: 'О КОМПАНИИ', title: 'Мы помогаем расти выручке', subtitle: 'Решения для отделов продаж и маркетинга', sideLabel: '2026' } });
  add({ id: 'title-03', category: 'title', variantNumber: 3, layoutType: 'title_dark', name: 'Титул — premium dark', description: 'Тёмный премиальный титул с акцентом', themeSupport: ['dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('footerLabel', 'Подпись внизу', 40)],
    sample: { eyebrow: 'PITCH DECK', title: 'Будущее корпоративных презентаций', subtitle: 'Конструктор слайдов с ИИ внутри библиотеки шаблонов', footerLabel: 'Конфиденциально' } });

  add({ id: 'title-04', category: 'title', variantNumber: 4, layoutType: 'title_center', name: 'Титул — по центру', description: 'Центрированная композиция с акцентной линией', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('footerLabel', 'Подпись внизу', 40)],
    sample: { eyebrow: 'ПРЕЗЕНТАЦИЯ КОМПАНИИ', title: 'Nordwave', subtitle: 'Платформа аналитики для растущих B2B-команд' } });
  add({ id: 'title-05', category: 'title', variantNumber: 5, layoutType: 'title_band', name: 'Титул — верхняя панель', description: 'Акцентная панель сверху, крупный заголовок ниже', themeSupport: ['light'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('sideLabel', 'Метка на панели', 24)],
    sample: { eyebrow: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', title: 'Растим выручку вместе', subtitle: 'Решения для отделов продаж и маркетинга', sideLabel: '2026' } });
  add({ id: 'title-06', category: 'title', variantNumber: 6, layoutType: 'title_minimal', name: 'Титул — минимализм', description: 'Много воздуха, заголовок в нижней трети', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [],
    sample: { eyebrow: 'PRESA · 2026', title: 'Меньше слов — больше смысла', subtitle: 'Презентации, которые читаются за минуту' } });

  add({ id: 'title-07', category: 'title', variantNumber: 7, layoutType: 'title_image_full', name: 'Титул — фото на весь экран', description: 'Полноэкранное фото с затемнением, заголовок снизу', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [image('image', 'Фон-изображение')],
    sample: { eyebrow: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', title: 'Nordwave', subtitle: 'Платформа аналитики для растущих B2B-команд', image: stock(STOCK.buildings) } });
  add({ id: 'title-08', category: 'title', variantNumber: 8, layoutType: 'title_image_split', name: 'Титул — фото сбоку', description: 'Заголовок слева, изображение во всю высоту справа', themeSupport: ['light'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [image('image', 'Изображение'), text('imageLabel', 'Подпись к визуалу', 30)],
    sample: { eyebrow: 'О КОМПАНИИ', title: 'Растим выручку вместе', subtitle: 'Решения для отделов продаж и маркетинга', imageLabel: 'Фото команды', image: stock(STOCK.meeting) } });
  add({ id: 'title-09', category: 'title', variantNumber: 9, layoutType: 'title_sidebar', name: 'Титул — вертикальная метка', description: 'Акцентная линия и вертикальная метка слева, крупный заголовок', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('sideLabel', 'Вертикальная метка', 24)],
    sample: { eyebrow: 'ПРЕЗЕНТАЦИЯ КОМПАНИИ', title: 'Будущее корпоративных презентаций', subtitle: 'Конструктор слайдов с библиотекой готовых дизайнов', sideLabel: 'PRESA · 2026' } });
  add({ id: 'title-10', category: 'title', variantNumber: 10, layoutType: 'title_editorial', name: 'Титул — издательский', description: 'Верхняя линия с меткой и крупный заголовок', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('sideLabel', 'Метка справа', 24)],
    sample: { eyebrow: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', title: 'Меньше слов — больше смысла', subtitle: 'Презентации, которые читаются за минуту', sideLabel: '2026' } });
  add({ id: 'title-11', category: 'title', variantNumber: 11, layoutType: 'title_bold', name: 'Титул — смелый акцент', description: 'Полностью акцентный фон, крупный заголовок, сайт прижат к нижнему краю', themeSupport: ['light'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28, 'PRESENTATION'), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('footerLabel', 'Сайт / подпись внизу', 40, 'presa.io')],
    sample: { eyebrow: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', title: 'Растим выручку вместе', subtitle: 'Решения для отделов продаж и маркетинга', footerLabel: 'presa.io' } });
  add({ id: 'title-12', category: 'title', variantNumber: 12, layoutType: 'title_corporate', name: 'Титул — корпоративный', description: 'Строгая верхняя панель с брендом, акцентная линия, сайт у нижнего края', themeSupport: ['light'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28, 'PRESENTATION'), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('footerLabel', 'Сайт / подпись внизу', 40, 'presa.io')],
    sample: { eyebrow: 'ПРЕЗЕНТАЦИЯ КОМПАНИИ', title: 'Будущее корпоративных презентаций', subtitle: 'Конструктор слайдов с библиотекой готовых дизайнов', footerLabel: 'presa.io' } });

  add({ id: 'title-13', category: 'title', variantNumber: 13, layoutType: 'title_triangle_photo', name: 'Титул — фото + треугольник', description: 'Логотип сверху, крупный заголовок с акцентным словом слева, фото и красный треугольник справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40, 'ТЕХНОЛОГИИ ДЛЯ'), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('eyebrow', 'Надзаголовок', 36), text('titleAccent', 'Акцентное слово', 24, 'БУДУЩЕГО'), text('footerLabel', 'Год / подпись', 24, '2024'), image('image', 'Фото')],
    sample: { eyebrow: '', title: 'ТЕХНОЛОГИИ ДЛЯ', titleAccent: 'БУДУЩЕГО', subtitle: 'Инновационные решения для вашего бизнеса', footerLabel: '2024', image: stock(STOCK.officeHall) } });

  add({ id: 'title-14', category: 'title', variantNumber: 14, layoutType: 'title_aurora', name: 'Титул — Aurora', description: 'Премиальная обложка с мягким градиентным сиянием, чип-надзаголовок и крупный заголовок', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 30, 'PRESENTATION'), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('titleAccent', 'Акцентное слово', 26)],
    sample: { eyebrow: 'PRESENTATION', title: 'Презентации нового', titleAccent: 'поколения', subtitle: 'Собирайте красивые слайды за минуты — с ИИ и готовыми стилями' } });

  add({ id: 'title-15', category: 'title', variantNumber: 15, layoutType: 'title_spotlight', name: 'Титул — Spotlight', description: 'Смелая обложка на акцентном фоне с концентрическими кольцами и белым текстом', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 30, 'PRESENTATION'), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('titleAccent', 'Акцентное слово', 26)],
    sample: { eyebrow: 'КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', title: 'Растим выручку', titleAccent: 'вместе', subtitle: 'Решения для отделов продаж и маркетинга' } });

  add({ id: 'title-16', category: 'title', variantNumber: 16, layoutType: 'title_oversized', name: 'Титул — крупный акцент', description: 'Издательская обложка с гигантским заголовком, верхней меткой и линией', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 30, 'PRESENTATION'), text('title', 'Заголовок', 40), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('titleAccent', 'Акцентное слово', 24), text('footerLabel', 'Год / подпись', 24, '2026')],
    sample: { eyebrow: 'СТРАТЕГИЯ 2026', title: 'Меньше слов —', titleAccent: 'больше смысла', subtitle: 'Презентации, которые читаются за минуту', footerLabel: '2026' } });

  add({ id: 'title-17', category: 'title', variantNumber: 17, layoutType: 'title_frame', name: 'Титул — в рамке', description: 'Элегантная центрированная обложка во внутренней рамке с угловыми засечками', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 30, 'PRESENTATION'), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('titleAccent', 'Акцентное слово', 26)],
    sample: { eyebrow: 'ПРЕЗЕНТАЦИЯ КОМПАНИИ', title: 'Надёжный партнёр', titleAccent: 'вашего роста', subtitle: 'Опыт, экспертиза и результат для вашего бизнеса' } });

  /* ===== AGENDA ===== */
  add({ id: 'agenda-01', category: 'agenda', variantNumber: 1, layoutType: 'agenda', name: 'Содержание — нумерованное', description: 'Нумерованный список пунктов', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 40), list('items', 'Пункты', 3, 6, 60)], optionalFields: [],
    sample: { title: 'О чём поговорим', items: ['Кто мы и чем занимаемся', 'Какой вызов перед вами стоит', 'Наш подход и ценность', 'Кейсы и результаты', 'Дальнейшие шаги'] } });
  add({ id: 'agenda-02', category: 'agenda', variantNumber: 2, layoutType: 'cards', name: 'Содержание — карточки', description: 'Пункты повестки в виде карточек', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), group('cards', 'Разделы', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'Структура встречи', cards: [{ heading: 'Контекст', text: 'Рынок и ситуация клиента' }, { heading: 'Решение', text: 'Как мы закрываем задачу' }, { heading: 'Ценность', text: 'Что вы получаете' }, { heading: 'Шаги', text: 'Как начать работу' }] } });
  add({ id: 'agenda-03', category: 'agenda', variantNumber: 3, layoutType: 'bullets', name: 'Содержание — список', description: 'Заголовок и аккуратный список тезисов', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 40), list('bullets', 'Пункты', 3, 5, 70)], optionalFields: [text('footerLabel', 'Подпись внизу', 40)],
    sample: { title: 'Повестка', bullets: ['Проблема и контекст', 'Наше предложение', 'Экономика и сроки', 'Вопросы и ответы'] } });

  add({ id: 'agenda-04', category: 'agenda', variantNumber: 4, layoutType: 'agenda_grid', name: 'Содержание — сетка', description: 'Нумерованные пункты карточками в две колонки', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), list('items', 'Пункты', 3, 8, 60)], optionalFields: [],
    sample: { title: 'План встречи', items: ['Контекст и цели', 'Обзор решения', 'Демонстрация', 'Кейсы клиентов', 'Тарифы', 'Следующие шаги'] } });
  add({ id: 'agenda-05', category: 'agenda', variantNumber: 5, layoutType: 'side_list', name: 'Содержание — сплит', description: 'Пункты слева, акцентная панель с заголовком справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), list('items', 'Пункты', 3, 6, 60)], optionalFields: [text('sideLabel', 'Метка на панели', 24)],
    sample: { title: 'О чём поговорим', items: ['Кто мы', 'Проблема и решение', 'Экономика проекта', 'Дорожная карта'], sideLabel: 'AGENDA' } });
  add({ id: 'agenda-06', category: 'agenda', variantNumber: 6, layoutType: 'steps', name: 'Содержание — с пояснениями', description: 'Нумерованные разделы с коротким описанием каждого', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), group('steps', 'Разделы', stepSub, 3, 5)], optionalFields: [],
    sample: { title: 'План встречи', steps: [{ title: 'Контекст', desc: 'Ситуация на рынке и ваши задачи' }, { title: 'Решение', desc: 'Как мы закрываем задачу' }, { title: 'Экономика', desc: 'Сроки, бюджет и эффект' }, { title: 'Следующие шаги', desc: 'Что нужно, чтобы начать' }] } });

  /* ===== ABOUT COMPANY ===== */
  add({ id: 'about-company-01', category: 'about_company', variantNumber: 1, layoutType: 'bullets', name: 'О компании — 3 тезиса', description: 'Классический слайд с заголовком и тремя ключевыми фактами', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 60), list('bullets', 'Ключевые тезисы', 3, 5, 90)], optionalFields: [text('footerLabel', 'Подпись внизу', 40)],
    sample: { title: 'О компании', bullets: ['Nordwave работает в сфере B2B-аналитики с 2019 года', 'Фокус на измеримых бизнес-результатах', 'Нам доверяют более 120 команд'] } });
  add({ id: 'about-company-02', category: 'about_company', variantNumber: 2, layoutType: 'text_stats', name: 'О компании — текст + статистика', description: 'Текстовый блок и ряд ключевых метрик', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Описание', 240), group('stats', 'Метрики', statSub, 2, 4)], optionalFields: [],
    sample: { title: 'Кто мы', text: 'Команда экспертов в B2B-маркетинге и продажах. Помогаем компаниям быстрее готовить материалы и закрывать сделки.', stats: [{ value: '120+', label: 'клиентов' }, { value: '7 лет', label: 'на рынке' }, { value: '38', label: 'в команде' }] } });
  add({ id: 'about-company-03', category: 'about_company', variantNumber: 3, layoutType: 'cards', name: 'О компании — карточки фактов', description: 'Ключевые факты в виде карточек', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Факты', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'Коротко о нас', cards: [{ heading: 'Миссия', text: 'Сделать корпоративные презентации быстрыми и качественными' }, { heading: 'Подход', text: 'Библиотека шаблонов вместо случайной генерации' }, { heading: 'Результат', text: 'Готовый PPTX за минуты' }, { heading: 'Масштаб', text: 'От стартапов до enterprise-команд' }] } });

  add({ id: 'about-company-04', category: 'about_company', variantNumber: 4, layoutType: 'side_list', name: 'О компании — сплит', description: 'Факты слева, акцентная панель с заголовком справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), list('items', 'Факты', 3, 6, 70)], optionalFields: [text('sideLabel', 'Метка на панели', 24)],
    sample: { title: 'Кто мы такие', items: ['Работаем с 2019 года', '120+ клиентов в B2B', 'Команда из 38 экспертов', 'Офисы в 3 городах'], sideLabel: 'ABOUT' } });
  add({ id: 'about-company-05', category: 'about_company', variantNumber: 5, layoutType: 'big_stat', name: 'О компании — главная цифра', description: 'Одна доминирующая цифра о компании и пояснения', themeSupport: ['light', 'dark'],
    requiredFields: [text('statValue', 'Значение', 8, '120+'), text('statLabel', 'Подпись', 60), list('bullets', 'Пояснение', 0, 3, 70)], optionalFields: [],
    sample: { statValue: '120+', statLabel: 'компаний доверяют нам презентации', bullets: ['От стартапов до enterprise', 'Продажи, маркетинг и HR', 'NPS 61 по итогам 2025 года'] } });
  add({ id: 'about-company-06', category: 'about_company', variantNumber: 6, layoutType: 'quote', name: 'О компании — миссия', description: 'Крупная формулировка миссии компании', themeSupport: ['light', 'dark'],
    requiredFields: [area('quote', 'Миссия', 160)], optionalFields: [text('author', 'Имя', 36), text('role', 'Роль', 40)],
    sample: { quote: 'Мы делаем так, чтобы каждая корпоративная презентация собиралась за минуты и выглядела достойно бренда.', author: 'Иван Петров', role: 'Основатель Presa' } });
  add({ id: 'about-company-07', category: 'about_company', variantNumber: 7, layoutType: 'stats_row', name: 'О компании — цифры в ряд', description: 'Ключевые метрики компании крупным планом', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('stats', 'Метрики', statSub, 2, 4)], optionalFields: [text('note', 'Примечание', 70)],
    sample: { title: 'Компания в цифрах', stats: [{ value: '120+', label: 'клиентов' }, { value: '7', label: 'лет на рынке' }, { value: '38', label: 'экспертов в команде' }], note: 'Данные на 2026 год' } });
  add({ id: 'about-company-08', category: 'about_company', variantNumber: 8, layoutType: 'text_media', name: 'О компании — с фото', description: 'Текст о компании и место под фотографию', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Описание', 240)], optionalFields: [image('image', 'Изображение'), text('imageLabel', 'Подпись к фото', 30)],
    sample: { title: 'Команда Nordwave', text: 'Работаем с 2019 года: эксперты в продукте, дизайне и B2B-продажах. Нам доверяют более 120 команд.', imageLabel: 'Фото команды', image: stock(STOCK.teamLaptops) } });
  add({ id: 'about-company-09', category: 'about_company', variantNumber: 9, layoutType: 'timeline', name: 'О компании — история', description: 'Ключевые вехи развития на таймлайне', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('milestones', 'Вехи', stepSub, 3, 5)], optionalFields: [],
    sample: { title: 'Как мы росли', milestones: [{ title: '2019', desc: 'Основание компании' }, { title: '2021', desc: 'Первые 50 клиентов' }, { title: '2024', desc: 'Выход в enterprise-сегмент' }, { title: '2026', desc: '120+ команд и новая платформа' }] } });

  add({ id: 'about-company-10', category: 'about_company', variantNumber: 10, layoutType: 'about_lead_cards', name: 'О компании — ценности (иконки)', description: 'Вводный текст и четыре карточки с иконками', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), area('intro', 'Описание', 220), group('cards', 'Карточки', svcIconSub, 3, 4)], optionalFields: [],
    sample: { title: 'О компании', intro: 'Presa — российская SaaS-компания, создающая решения для автоматизации бизнес-процессов и повышения эффективности предприятий.', cards: [
      { icon: 'target', heading: 'Миссия', text: 'Мы помогаем компаниям расти и становиться эффективнее за счёт технологий, которые упрощают сложное.' },
      { icon: 'shield', heading: 'Экспертиза', text: 'Глубоко понимаем бизнес-процессы и отраслевые особенности, чтобы предлагать решения с измеримым эффектом.' },
      { icon: 'users', heading: 'Команда', text: 'Профессионалы с опытом в разработке, внедрении и поддержке сложных корпоративных решений.' },
      { icon: 'chart', heading: 'Результаты', text: 'Наши клиенты достигают конкретных результатов: сокращают издержки, ускоряют процессы и увеличивают выручку.' } ] } });
  add({ id: 'about-company-11', category: 'about_company', variantNumber: 11, layoutType: 'about_timeline_stats', name: 'О компании — история и метрики', description: 'Описание и метрики слева, таймлайн развития справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), area('intro', 'Описание', 300), group('stats', 'Метрики', aboutStatSub, 2, 2), text('panelTitle', 'Заголовок панели', 40), group('milestones', 'Этапы', milestoneSub, 3, 4)], optionalFields: [],
    sample: { title: 'О компании', intro: 'Presa — российская продуктовая компания, разрабатывающая облачную платформу для автоматизации бизнес-процессов и управления корпоративным контентом. Наши решения помогают компаниям повышать эффективность и принимать решения на основе данных.', stats: [
      { icon: 'users', value: '250+', label: 'клиентов', sub: 'из разных отраслей' },
      { icon: 'chart', value: '99,9%', label: 'доступность', sub: 'платформы (SLA)' } ], panelTitle: 'Наша история и рост', milestones: [
      { year: '2018', heading: 'Основание компании', text: 'Запуск компании с фокусом на разработку решений для автоматизации документооборота.' },
      { year: '2020', heading: 'Запуск платформы Presa', text: 'Выход первой версии платформы в облаке и первые крупные клиенты.' },
      { year: '2022', heading: 'Масштабирование и развитие', text: 'Расширение функциональности, выход на новые рынки, интеграции и рост команды.' },
      { year: '2025', heading: 'Новый этап роста', text: 'Усиление продуктовой линейки, развитие AI-возможностей и укрепление лидерских позиций на рынке.' } ] } });
  add({ id: 'about-company-12', category: 'about_company', variantNumber: 12, layoutType: 'about_text_media', name: 'О компании — текст + продукт', description: 'Описание и метрики слева, изображение продукта справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), area('intro', 'Описание', 320), group('stats', 'Метрики', aboutStatSub, 3, 3)], optionalFields: [image('image', 'Изображение продукта'), text('imageLabel', 'Подпись к фото', 30)],
    sample: { title: 'О компании', intro: 'Presa — российская SaaS-платформа для автоматизации финансового планирования и анализа. Мы помогаем компаниям принимать обоснованные решения, опираясь на точные данные и современные технологии. Наша миссия — делать сложные процессы простыми и создавать ценность для бизнеса наших клиентов.', image: stock(STOCK.openOffice), stats: [
      { icon: 'users', value: '120+', label: 'клиентов' },
      { icon: 'clock', value: '7', label: 'лет на рынке' },
      { icon: 'badge', value: '38', label: 'в команде' } ] } });

  add({ id: 'about-company-13', category: 'about_company', variantNumber: 13, layoutType: 'about_geo_icons', name: 'О компании — текст + 3 иконки', description: 'Крупный заголовок и абзац, ниже ряд из трёх иконок с подписями', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 40, 'О компании'), area('intro', 'Описание', 200), group('cards', 'Иконки', svcIconSub, 3, 4)], optionalFields: [text('eyebrow', 'Надзаголовок', 36, 'PRESA')],
    sample: { eyebrow: 'PRESA', title: 'О компании', intro: 'Мы создаём технологичные продукты и решения, которые помогают бизнесу развиваться и достигать новых высот.', cards: [
      { icon: 'users', heading: 'Команда', text: 'Опытные специалисты с экспертизой в сфере IT' },
      { icon: 'target', heading: 'Фокус', text: 'Инновации, качество и результат' },
      { icon: 'rocket', heading: 'Миссия', text: 'Технологии для роста вашего бизнеса' } ] } });

  /* ===== PROBLEM ===== */
  add({ id: 'problem-01', category: 'problem', variantNumber: 1, layoutType: 'bullets', name: 'Проблема — список болей', description: 'Заголовок и список проблем аудитории', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 60), list('bullets', 'Боли клиента', 3, 5, 90)], optionalFields: [],
    sample: { title: 'С чем вы сталкиваетесь', bullets: ['Слайды собираются вручную по полдня', 'Качество скачет от человека к человеку', 'Нет единого корпоративного стиля'] } });
  add({ id: 'problem-02', category: 'problem', variantNumber: 2, layoutType: 'quote', name: 'Проблема — крупная формулировка', description: 'Одна сильная формулировка проблемы', themeSupport: ['light', 'dark'],
    requiredFields: [area('quote', 'Формулировка проблемы', 160)], optionalFields: [text('author', 'Источник', 40)],
    sample: { quote: 'Команды тратят до 40% времени не на смысл презентации, а на её оформление.', author: 'Исследование рынка B2B, 2025' } });
  add({ id: 'problem-03', category: 'problem', variantNumber: 3, layoutType: 'cards', name: 'Проблема — карточки', description: 'Боли клиента в виде карточек', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Проблемы', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'Три главных барьера', cards: [{ heading: 'Долго', text: 'Подготовка слайдов отнимает часы' }, { heading: 'Неровно', text: 'Нет единого стандарта качества' }, { heading: 'Дорого', text: 'Дизайнеры заняты или недоступны' }, { heading: 'Рискованно', text: 'Сырые материалы бьют по репутации' }] } });
  add({ id: 'problem-04', category: 'problem', variantNumber: 4, layoutType: 'big_stat', name: 'Проблема — цена бездействия', description: 'Одна крупная цифра о масштабе проблемы', themeSupport: ['light', 'dark'],
    requiredFields: [text('statValue', 'Значение', 8, '40%'), text('statLabel', 'Подпись', 60), list('bullets', 'Пояснение', 0, 3, 70)], optionalFields: [],
    sample: { statValue: '40%', statLabel: 'времени уходит на оформление, а не на смысл', bullets: ['Слайды собираются вручную по полдня', 'Качество зависит от исполнителя', 'Сделки ждут материалов'] } });
  add({ id: 'problem-05', category: 'problem', variantNumber: 5, layoutType: 'side_list', name: 'Проблема — сплит', description: 'Список болей слева, акцентная панель справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), list('items', 'Боли клиента', 3, 6, 60)], optionalFields: [text('sideLabel', 'Метка на панели', 24)],
    sample: { title: 'С чем вы сталкиваетесь', items: ['Слайды вручную по полдня', 'Качество «плывёт» от человека к человеку', 'Нет единого стиля', 'Дизайнеры перегружены'], sideLabel: 'PROBLEM' } });
  add({ id: 'problem-06', category: 'problem', variantNumber: 6, layoutType: 'text_media', name: 'Проблема — с визуалом', description: 'Описание проблемы и место под иллюстрацию', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Описание проблемы', 240)], optionalFields: [image('image', 'Изображение'), text('imageLabel', 'Подпись к визуалу', 30)],
    sample: { title: 'Как это выглядит сейчас', text: 'Каждый отдел собирает презентации по-своему: разные шаблоны, разные шрифты, потерянные часы на правки.', imageLabel: 'Скриншот «до»', image: stock(STOCK.deskDocs) } });
  add({ id: 'problem-07', category: 'problem', variantNumber: 7, layoutType: 'text_bullets', name: 'Проблема — описание + пункты', description: 'Вводный абзац и список ключевых болей', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 60), area('text', 'Описание', 280), list('bullets', 'Пункты', 0, 5, 80)], optionalFields: [],
    sample: { title: 'Проблема', text: 'Сотрудники ежедневно тратят значительное время на поиск информации, подготовку документов и ответы на типовые вопросы.', bullets: ['Потеря времени', 'Высокая нагрузка', 'Медленное обучение', 'Ошибки из-за человеческого фактора'] } });
  add({ id: 'problem-08', category: 'problem', variantNumber: 8, layoutType: 'statement_bold', name: 'Проблема — смелая формулировка', description: 'Одна сильная мысль на акцентном фоне, сайт у нижнего края', themeSupport: ['light'],
    requiredFields: [area('quote', 'Формулировка проблемы', 160)], optionalFields: [text('eyebrow', 'Надзаголовок', 28, 'ПРОБЛЕМА'), text('author', 'Источник', 40), text('footerLabel', 'Сайт / подпись внизу', 40)],
    sample: { eyebrow: 'ПРОБЛЕМА', quote: 'Команды тратят до 40% времени не на смысл презентации, а на её оформление.', author: 'Исследование рынка, 2025' } });
  add({ id: 'problem-09', category: 'problem', variantNumber: 9, layoutType: 'cards_band', name: 'Проблема — акцентная шапка', description: 'Заголовок на акцентной плашке, боли карточками ниже', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Проблемы', cardSub, 3, 6)], optionalFields: [text('eyebrow', 'Надзаголовок', 28, 'ПРОБЛЕМА')],
    sample: { eyebrow: 'ПРОБЛЕМА', title: 'Три главных барьера', cards: [{ heading: 'Долго', text: 'Подготовка слайдов отнимает часы рабочего времени' }, { heading: 'Неровно', text: 'Качество скачет от человека к человеку' }, { heading: 'Дорого', text: 'Дизайнеры и переделки увеличивают бюджет' }] } });

  /* ===== SOLUTION ===== */
  add({ id: 'solution-01', category: 'solution', variantNumber: 1, layoutType: 'text_media', name: 'Решение — текст + визуал', description: 'Текст слева, плейсхолдер изображения справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Описание', 240)], optionalFields: [image('image', 'Изображение'), text('imageLabel', 'Подпись к визуалу', 30)],
    sample: { title: 'Наше решение', text: 'Presa — конструктор презентаций на библиотеке готовых шаблонов. Вы выбираете дизайн, заполняете поля, а система сама подгоняет контент под композицию.', imageLabel: 'Скриншот продукта', image: stock(STOCK.analytics) } });
  add({ id: 'solution-02', category: 'solution', variantNumber: 2, layoutType: 'bullets', name: 'Решение — тезисы', description: 'Заголовок и ключевые пункты решения', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), list('bullets', 'Что мы даём', 3, 5, 90)], optionalFields: [],
    sample: { title: 'Как мы это решаем', bullets: ['Библиотека качественных шаблонов по категориям', 'Автоподгонка текста под дизайн', 'Экспорт в редактируемый PPTX'] } });
  add({ id: 'solution-03', category: 'solution', variantNumber: 3, layoutType: 'steps', name: 'Решение — шаги', description: 'Решение как последовательность шагов', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Шаги', stepSub, 3, 4)], optionalFields: [],
    sample: { title: 'Путь к результату', steps: [{ title: 'Бриф', desc: 'Опишите компанию и цель' }, { title: 'Сборка', desc: 'Выберите шаблоны и заполните поля' }, { title: 'Экспорт', desc: 'Скачайте готовый PPTX' }] } });
  add({ id: 'solution-04', category: 'solution', variantNumber: 4, layoutType: 'cards', name: 'Решение — карточки', description: 'Составляющие решения в виде карточек (4–10)', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки решения', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'Из чего состоит решение', cards: [{ heading: 'Библиотека', text: 'Готовые шаблоны по категориям' }, { heading: 'Автоподгонка', text: 'Текст подстраивается под дизайн' }, { heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты' }, { heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }] } });
  add({ id: 'solution-05', category: 'solution', variantNumber: 5, layoutType: 'text_bullets', name: 'Решение — описание + пункты', description: 'Вводный абзац и ключевые пункты решения', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 60), area('text', 'Описание', 280), list('bullets', 'Пункты', 0, 5, 80)], optionalFields: [],
    sample: { title: 'Наше решение', text: 'Presa превращает короткий бриф в готовую презентацию: вы выбираете дизайн, а система сама распределяет контент по композиции слайда.', bullets: ['Готовые шаблоны по категориям', 'Автоподгонка текста под дизайн', 'Экспорт в редактируемый PPTX'] } });
  add({ id: 'solution-06', category: 'solution', variantNumber: 6, layoutType: 'cards_band', name: 'Решение — акцентная шапка', description: 'Заголовок на акцентной плашке, блоки решения карточками', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки решения', cardSub, 3, 6)], optionalFields: [text('eyebrow', 'Надзаголовок', 28, 'РЕШЕНИЕ')],
    sample: { eyebrow: 'РЕШЕНИЕ', title: 'Из чего состоит решение', cards: [{ heading: 'Библиотека', text: 'Готовые шаблоны по категориям слайдов' }, { heading: 'Автоподгонка', text: 'Текст сам подстраивается под дизайн' }, { heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }] } });
  add({ id: 'solution-07', category: 'solution', variantNumber: 7, layoutType: 'feature_rows', name: 'Решение — крупные строки', description: 'Нумерованные строки решения, корпоративный стиль', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), list('bullets', 'Что мы даём', 3, 5, 70)], optionalFields: [text('eyebrow', 'Надзаголовок', 28, 'РЕШЕНИЕ')],
    sample: { eyebrow: 'РЕШЕНИЕ', title: 'Как мы это решаем', bullets: ['Библиотека качественных шаблонов', 'Автоподгонка текста под дизайн', 'Единый стандарт для всей команды', 'Экспорт в редактируемый PPTX'] } });

  add({ id: 'solution-08', category: 'solution', variantNumber: 8, layoutType: 'solution_badges', name: 'Решение — бейджи с иконками', description: 'Вертикальный список решений: иконка в бейдже, заголовок и описание; геометрический акцент', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 40, 'Наши решения'), group('cards', 'Решения', svcIconSub, 2, 4)], optionalFields: [text('eyebrow', 'Надзаголовок', 36, 'ПРОДУКТ')],
    sample: { eyebrow: 'ПРОДУКТ', title: 'Наши решения', cards: [
      { icon: 'doc', heading: 'Разработка ПО', text: 'Создаём надёжные и масштабируемые программные решения' },
      { icon: 'cloud', heading: 'Облачные решения', text: 'Обеспечиваем гибкость, безопасность и высокую доступность' },
      { icon: 'shield', heading: 'Кибербезопасность', text: 'Защищаем данные и инфраструктуру вашего бизнеса' } ] } });

  /* ===== SERVICES ===== */
  add({ id: 'services-01', category: 'services', variantNumber: 1, layoutType: 'cards', name: 'Услуги — карточки', description: 'Сетка карточек продуктов или услуг', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'Что мы предлагаем', cards: [{ heading: 'Конструктор', text: 'Сборка презентаций из шаблонов' }, { heading: 'AI-помощник', text: 'Улучшение текста под лимиты' }, { heading: 'Экспорт', text: 'PPTX в корпоративном стиле' }, { heading: 'Библиотека', text: 'Десятки готовых дизайнов' }] } });
  add({ id: 'services-02', category: 'services', variantNumber: 2, layoutType: 'bullets', name: 'Услуги — список', description: 'Перечень услуг тезисами', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), list('bullets', 'Услуги', 3, 6, 80)], optionalFields: [],
    sample: { title: 'Направления работы', bullets: ['Коммерческие предложения', 'Презентации компании', 'Pitch deck для инвесторов', 'HR и онбординг'] } });
  add({ id: 'services-03', category: 'services', variantNumber: 3, layoutType: 'text_media', name: 'Услуги — флагман', description: 'Описание ключевой услуги с визуалом', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Описание', 240)], optionalFields: [image('image', 'Изображение'), text('imageLabel', 'Подпись к визуалу', 30)],
    sample: { title: 'Флагманский продукт', text: 'Конструктор Presa превращает короткий бриф в готовую презентацию: выбираете категорию слайда, вариант дизайна и заполняете поля.', imageLabel: 'Интерфейс конструктора', image: stock(STOCK.collab) } });
  add({ id: 'services-04', category: 'services', variantNumber: 4, layoutType: 'service_icons', name: 'Услуги — с иконками', description: 'Карточки услуг с иконками', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Что мы предлагаем', cards: [{ icon: 'spark', heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { icon: 'layers', heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { icon: 'bolt', heading: 'Скорость', text: 'Готовая презентация за минуты' }, { icon: 'shield', heading: 'Стандарт', text: 'Единое качество по всей команде' }, { icon: 'doc', heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { icon: 'palette', heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }] } });
  add({ id: 'services-05', category: 'services', variantNumber: 5, layoutType: 'service_photos', name: 'Услуги — с фото', description: 'Карточки услуг с фотографией', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', svcPhotoSub, 2, 6)], optionalFields: [],
    sample: { title: 'Наши услуги', cards: [{ heading: 'Дизайн презентаций', text: 'Корпоративный стиль и шаблоны под бренд', image: stock(STOCK.collab, 700) }, { heading: 'Pitch deck', text: 'Структура и визуал для инвесторов', image: stock(STOCK.analytics, 700) }, { heading: 'Обучение команды', text: 'Воркшопы по сборке слайдов', image: stock(STOCK.meeting, 700) }] } });
  add({ id: 'services-06', category: 'services', variantNumber: 6, layoutType: 'service_photo_icon', name: 'Услуги — иконка в строку', description: 'Красный бейдж с иконкой и заголовок в одной строке, описание ниже', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', svcIconSub, 2, 6)], optionalFields: [],
    sample: { title: 'Что мы предлагаем', cards: [{ icon: 'spark', heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { icon: 'layers', heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { icon: 'bolt', heading: 'Скорость', text: 'Готовая презентация за минуты' }, { icon: 'shield', heading: 'Стандарт', text: 'Единое качество по всей команде' }, { icon: 'doc', heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { icon: 'palette', heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }] } });
  add({ id: 'services-07', category: 'services', variantNumber: 7, layoutType: 'service_minimal', name: 'Услуги — минимализм', description: 'Лёгкие карточки с иконкой и стрелкой', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', svcIconSub, 2, 6)], optionalFields: [],
    sample: { title: 'Что мы предлагаем', cards: [{ icon: 'spark', heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { icon: 'layers', heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { icon: 'bolt', heading: 'Скорость', text: 'Готовая презентация за минуты' }, { icon: 'shield', heading: 'Стандарт', text: 'Единое качество по всей команде' }, { icon: 'doc', heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { icon: 'palette', heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }] } });

  add({ id: 'services-08', category: 'services', variantNumber: 8, layoutType: 'service_list_panel', name: 'Услуги — список + панель', description: 'Список услуг с иконками слева и акцентная панель-итог справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', svcIconSub, 3, 6)], optionalFields: [area('panelText', 'Текст на панели', 110)],
    sample: { title: 'Что мы предлагаем', panelText: 'Все инструменты в одной системе для создания сильных презентаций', cards: [{ icon: 'spark', heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { icon: 'layers', heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { icon: 'bolt', heading: 'Скорость', text: 'Готовая презентация за минуты' }, { icon: 'shield', heading: 'Стандарт', text: 'Единое качество по всей команде' }, { icon: 'doc', heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { icon: 'palette', heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }] } });
  add({ id: 'services-09', category: 'services', variantNumber: 9, layoutType: 'service_flagship', name: 'Услуги — флагман + сетка', description: 'Тёмная герой-карточка флагмана и сетка дополнительных услуг', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги (первая — флагман)', svcIconSub, 3, 5)], optionalFields: [],
    sample: { title: 'Что мы предлагаем', cards: [{ icon: 'bolt', heading: 'Скорость', text: 'Готовая презентация за минуты. Создавайте профессиональные презентации быстрее, чем когда-либо.' }, { icon: 'spark', heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { icon: 'layers', heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { icon: 'doc', heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { icon: 'palette', heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }] } });
  add({ id: 'services-10', category: 'services', variantNumber: 10, layoutType: 'service_row_icons', name: 'Услуги — иконки в строку', description: 'Минималистичный ряд круглых иконок с подписями', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Что мы предлагаем', cards: [{ icon: 'spark', heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { icon: 'layers', heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { icon: 'bolt', heading: 'Скорость', text: 'Готовая презентация за минуты' }, { icon: 'shield', heading: 'Стандарт', text: 'Единое качество по всей команде' }, { icon: 'doc', heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { icon: 'palette', heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }] } });
  add({ id: 'services-11', category: 'services', variantNumber: 11, layoutType: 'service_results', name: 'Услуги — выгоды + результаты', description: 'Чек-лист слева и панель с ключевыми результатами справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Преимущества', benefitRowSub, 3, 6), group('stats', 'Результаты', statSub, 2, 4)], optionalFields: [text('panelTitle', 'Заголовок панели', 30, 'Результат для вас')],
    sample: { title: 'Что мы предлагаем', panelTitle: 'Результат для вас', cards: [{ heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { heading: 'Скорость', text: 'Готовая презентация за минуты' }, { heading: 'Стандарт', text: 'Единое качество по всей команде' }, { heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }], stats: [{ value: '−80%', label: 'времени на создание презентаций' }, { value: '+50%', label: 'качества визуальной коммуникации' }, { value: '100%', label: 'единый стиль во всех материалах' }] } });
  add({ id: 'services-12', category: 'services', variantNumber: 12, layoutType: 'service_blocks', name: 'Услуги — цветные блоки', description: 'Контрастные блоки: акцентные сверху, тёмные снизу', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Услуги', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Что мы предлагаем', cards: [{ icon: 'spark', heading: 'AI-помощник', text: 'Улучшает формулировки под лимиты слайда' }, { icon: 'layers', heading: 'Библиотека', text: 'Десятки готовых дизайнов под задачу' }, { icon: 'bolt', heading: 'Скорость', text: 'Готовая презентация за минуты' }, { icon: 'shield', heading: 'Стандарт', text: 'Единое качество по всей команде' }, { icon: 'doc', heading: 'Экспорт', text: 'Редактируемый PPTX в один клик' }, { icon: 'palette', heading: 'Брендинг', text: 'Ваши цвета, шрифты и логотип' }] } });
  add({ id: 'services-13', category: 'services', variantNumber: 13, layoutType: 'service_process', name: 'Услуги — процесс', description: 'Как это работает: нумерованные шаги со стрелками', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Шаги', stepSub, 3, 5)], optionalFields: [],
    sample: { title: 'Как это работает', steps: [{ title: 'Выбираете шаблон', desc: 'Подходящий дизайн под вашу задачу' }, { title: 'Заполняете контент', desc: 'Текст, данные и изображения' }, { title: 'AI улучшает структуру', desc: 'Формулировки, логика, визуальная подача' }, { title: 'Экспортируете PPTX', desc: 'Готовая презентация в один клик' }] } });
  add({ id: 'services-14', category: 'services', variantNumber: 14, layoutType: 'service_compare', name: 'Услуги — сравнение', description: 'Таблица «что входит» с отметками по колонкам', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('h1', 'Шапка — параметр', 28, 'Возможности'), text('h2', 'Колонка 1', 22, 'Presa'), text('h3', 'Колонка 2', 26, 'Другие решения'), text('h4', 'Колонка 3', 26, 'Ручная работа'), group('rows', 'Строки (✓ / ○ / ✕)', cmpRowSub, 3, 6)], optionalFields: [],
    sample: { title: 'Что входит в наши услуги', h1: 'Возможности', h2: 'Presa', h3: 'Другие решения', h4: 'Ручная работа', rows: [{ feature: 'Готовые шаблоны', a: '✓', b: '○', c: '✕' }, { feature: 'AI-помощник', a: '✓', b: '○', c: '✕' }, { feature: 'Быстрая подготовка', a: '✓', b: '○', c: '✕' }, { feature: 'Единый корпоративный стиль', a: '✓', b: '○', c: '✕' }, { feature: 'Экспорт в PPTX', a: '✓', b: '✓', c: '✓' }, { feature: 'Библиотека контента', a: '✓', b: '○', c: '✕' }] } });

  /* ===== BENEFITS ===== */
  add({ id: 'benefits-01', category: 'benefits', variantNumber: 1, layoutType: 'cards', name: 'Преимущества — карточки', description: 'Ключевые выгоды в карточках', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Преимущества', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'Почему выбирают нас', cards: [{ heading: 'Быстро', text: 'Презентация за минуты, а не за день' }, { heading: 'Стабильно', text: 'Единое качество по всей команде' }, { heading: 'Профессионально', text: 'Готовый корпоративный стиль' }, { heading: 'Гибко', text: 'Десятки шаблонов под любую задачу' }] } });
  add({ id: 'benefits-02', category: 'benefits', variantNumber: 2, layoutType: 'bullets', name: 'Преимущества — тезисы', description: 'Преимущества списком', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), list('bullets', 'Преимущества', 3, 5, 90)], optionalFields: [],
    sample: { title: 'Что вы получаете', bullets: ['Экономию десятков часов в месяц', 'Единый стандарт оформления', 'Редактируемые файлы PPTX', 'Поддержку двух языков'] } });
  add({ id: 'benefits-03', category: 'benefits', variantNumber: 3, layoutType: 'text_stats', name: 'Преимущества — с метриками', description: 'Текст и доказательные цифры', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Описание', 200), group('stats', 'Метрики', statSub, 2, 3)], optionalFields: [],
    sample: { title: 'Эффект для бизнеса', text: 'Команды быстрее готовят материалы и закрывают сделки, освобождая время на стратегию.', stats: [{ value: '−40%', label: 'времени на слайды' }, { value: '×3', label: 'презентаций в месяц' }] } });
  add({ id: 'benefits-04', category: 'benefits', variantNumber: 4, layoutType: 'text_bullets', name: 'Преимущества — описание + пункты', description: 'Вводный абзац и список выгод', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 60), area('text', 'Описание', 280), list('bullets', 'Пункты', 0, 5, 80)], optionalFields: [],
    sample: { title: 'Что вы получаете', text: 'Presa берёт на себя оформление, чтобы команда сосредоточилась на смысле и результате.', bullets: ['Экономия десятков часов в месяц', 'Единый стандарт оформления', 'Редактируемые файлы PPTX'] } });
  add({ id: 'benefits-05', category: 'benefits', variantNumber: 5, layoutType: 'service_icons', name: 'Преимущества — с иконками', description: 'Карточки преимуществ с иконками', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Преимущества', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Почему выбирают нас', cards: [{ icon: 'bolt', heading: 'Быстро', text: 'Презентация за минуты, а не за день' }, { icon: 'badge', heading: 'Стабильно', text: 'Единое качество по всей команде' }, { icon: 'star', heading: 'Профессионально', text: 'Готовый корпоративный стиль' }, { icon: 'layers', heading: 'Гибко', text: 'Десятки шаблонов под любую задачу' }, { icon: 'chart', heading: 'Измеримо', text: 'Результат виден в конверсии' }, { icon: 'shield', heading: 'Надёжно', text: 'Стандарт качества для всей команды' }] } });
  add({ id: 'benefits-06', category: 'benefits', variantNumber: 6, layoutType: 'service_minimal', name: 'Преимущества — минимализм', description: 'Лёгкие карточки с иконкой и стрелкой', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Преимущества', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Что вы получаете', cards: [{ icon: 'bolt', heading: 'Быстро', text: 'Презентация за минуты, а не за день' }, { icon: 'badge', heading: 'Стабильно', text: 'Единое качество по всей команде' }, { icon: 'star', heading: 'Профессионально', text: 'Готовый корпоративный стиль' }, { icon: 'layers', heading: 'Гибко', text: 'Десятки шаблонов под любую задачу' }, { icon: 'chart', heading: 'Измеримо', text: 'Результат виден в конверсии' }, { icon: 'shield', heading: 'Надёжно', text: 'Стандарт качества для всей команды' }] } });
  add({ id: 'benefits-07', category: 'benefits', variantNumber: 7, layoutType: 'feature_rows', name: 'Преимущества — крупные строки', description: 'Нумерованные строки преимуществ, корпоративный стиль', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), list('bullets', 'Преимущества', 3, 5, 70)], optionalFields: [text('eyebrow', 'Надзаголовок', 28, 'ПРЕИМУЩЕСТВА')],
    sample: { eyebrow: 'ПРЕИМУЩЕСТВА', title: 'Что вы получаете', bullets: ['Экономию десятков часов в месяц', 'Единый стандарт оформления', 'Редактируемые файлы PPTX', 'Поддержку двух языков'] } });
  add({ id: 'benefits-08', category: 'benefits', variantNumber: 8, layoutType: 'cards_band', name: 'Преимущества — акцентная шапка', description: 'Заголовок на акцентной плашке, выгоды карточками ниже', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Преимущества', cardSub, 3, 6)], optionalFields: [text('eyebrow', 'Надзаголовок', 28, 'ПРЕИМУЩЕСТВА')],
    sample: { eyebrow: 'ПРЕИМУЩЕСТВА', title: 'Почему выбирают нас', cards: [{ heading: 'Быстро', text: 'Презентация за минуты, а не за день' }, { heading: 'Стабильно', text: 'Единое качество по всей команде' }, { heading: 'Профессионально', text: 'Готовый корпоративный стиль' }] } });

  add({ id: 'benefits-09', category: 'benefits', variantNumber: 9, layoutType: 'benefits_check_rings', name: 'Преимущества — чек-лист + кольца', description: 'Чек-лист слева, концентрические кольца с ромбом справа', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 40, 'Преимущества'), group('cards', 'Преимущества', benefitRowSub, 3, 5)], optionalFields: [text('eyebrow', 'Надзаголовок', 36, 'ПОЧЕМУ МЫ')],
    sample: { eyebrow: 'ПОЧЕМУ МЫ', title: 'Преимущества', cards: [
      { heading: 'Индивидуальный подход', text: 'Решения под потребности вашего бизнеса' },
      { heading: 'Высокое качество', text: 'Используем лучшие практики разработки' },
      { heading: 'Гибкость и масштабируемость', text: 'Легко адаптируемся к изменениям' },
      { heading: 'Поддержка 24/7', text: 'Мы рядом на каждом этапе' } ] } });

  /* ===== NUMBERS ===== */
  add({ id: 'numbers-01', category: 'numbers', variantNumber: 1, layoutType: 'stats_row', name: 'Цифры — ряд метрик', description: 'Три–четыре крупные метрики в ряд', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('stats', 'Метрики', statSub, 2, 4)], optionalFields: [text('note', 'Примечание', 70)],
    sample: { title: 'Presa в цифрах', stats: [{ value: '120+', label: 'клиентов' }, { value: '−40%', label: 'времени на подготовку' }, { value: '4.9', label: 'средняя оценка' }], note: 'Данные за 2025 год' } });
  add({ id: 'numbers-02', category: 'numbers', variantNumber: 2, layoutType: 'big_stat', name: 'Цифры — одна крупная', description: 'Одна доминирующая цифра с пояснением', themeSupport: ['light', 'dark'],
    requiredFields: [text('statValue', 'Значение', 8, '×3'), text('statLabel', 'Подпись', 60), list('bullets', 'Пояснение', 0, 3, 70)], optionalFields: [],
    sample: { statValue: '×3', statLabel: 'больше презентаций в месяц', bullets: ['Без роста нагрузки на команду', 'При стабильном качестве'] } });
  add({ id: 'numbers-03', category: 'numbers', variantNumber: 3, layoutType: 'text_stats', name: 'Цифры — текст + метрики', description: 'Короткий вывод и подтверждающие метрики', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Вывод', 200), group('stats', 'Метрики', statSub, 2, 3)], optionalFields: [],
    sample: { title: 'Результаты говорят сами', text: 'После внедрения Presa команды ускоряют подготовку и повышают конверсию материалов.', stats: [{ value: '+18%', label: 'к конверсии КП' }, { value: '6 ч', label: 'экономии в неделю' }] } });

  add({ id: 'numbers-04', category: 'numbers', variantNumber: 4, layoutType: 'numbers_icon_stats', name: 'Цифры — иконки + метрики', description: 'Ряд из 3–4 метрик: иконка, крупная цифра, подпись; геометрический акцент', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 40, 'Наши результаты'), group('stats', 'Метрики', iconStatSub, 3, 4)], optionalFields: [text('eyebrow', 'Надзаголовок', 36, 'ИТОГИ')],
    sample: { eyebrow: 'ИТОГИ', title: 'Наши результаты', stats: [
      { icon: 'chart', value: '150+', label: 'Успешных проектов' },
      { icon: 'users', value: '98%', label: 'Довольных клиентов' },
      { icon: 'clock', value: '5+', label: 'Лет на рынке технологий' },
      { icon: 'globe', value: '20+', label: 'Стран сотрудничества' } ] } });

  /* ===== CHARTS ===== */
  add({ id: 'chart-01', category: 'chart', variantNumber: 1, layoutType: 'chart_bar', name: 'Диаграмма — столбцы', description: 'Сравнение значений по категориям', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('data', 'Данные', chartSub, 2, 8)], optionalFields: [text('note', 'Примечание', 70)],
    sample: { title: 'Выручка по кварталам', data: [{ label: 'Q1', value: '12' }, { label: 'Q2', value: '18' }, { label: 'Q3', value: '26' }, { label: 'Q4', value: '34' }], note: 'млн ₽ · 2025' } });
  add({ id: 'chart-02', category: 'chart', variantNumber: 2, layoutType: 'chart_line', name: 'Диаграмма — линия', description: 'Динамика показателя во времени', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('data', 'Данные', chartSub, 3, 8)], optionalFields: [text('note', 'Примечание', 70)],
    sample: { title: 'Рост активных пользователей', data: [{ label: 'Янв', value: '4' }, { label: 'Мар', value: '7' }, { label: 'Май', value: '11' }, { label: 'Июл', value: '16' }, { label: 'Сен', value: '24' }, { label: 'Ноя', value: '31' }], note: 'тыс. пользователей' } });
  add({ id: 'chart-03', category: 'chart', variantNumber: 3, layoutType: 'chart_donut', name: 'Диаграмма — donut', description: 'Структура целого по долям', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('data', 'Доли', chartSub, 2, 6)], optionalFields: [text('note', 'Примечание', 70)],
    sample: { title: 'Структура выручки', data: [{ label: 'Подписки', value: '56' }, { label: 'Enterprise', value: '28' }, { label: 'Услуги', value: '16' }], note: '% от выручки · 2025' } });

  /* ===== TABLE ===== */
  add({ id: 'table-01', category: 'table', variantNumber: 1, layoutType: 'table', name: 'Таблица — три колонки', description: 'Данные в таблице с шапкой', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('h1', 'Шапка — колонка 1', 28, 'Показатель'), text('h2', 'Шапка — колонка 2', 22), text('h3', 'Шапка — колонка 3', 22), group('rows', 'Строки', tableRowSub, 2, 6)], optionalFields: [text('note', 'Примечание', 70)],
    sample: { title: 'Ключевые показатели', h1: 'Показатель', h2: '2024', h3: '2025', rows: [{ c1: 'Выручка, млн ₽', c2: '54', c3: '90' }, { c1: 'Клиенты', c2: '85', c3: '120' }, { c1: 'NPS', c2: '44', c3: '61' }, { c1: 'Команда', c2: '21', c3: '38' }], note: 'Данные управленческой отчётности' } });

  /* ===== CASE STUDY ===== */
  add({ id: 'case-01', category: 'case_study', variantNumber: 1, layoutType: 'text_stats', name: 'Кейс — задача и результат', description: 'Описание кейса и метрики результата', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Контекст и задача', 240), group('stats', 'Результаты', statSub, 2, 3)], optionalFields: [],
    sample: { title: 'Кейс: Mercato', text: 'Отдел продаж готовил коммерческие предложения вручную. С Presa перешли на единый шаблон и ускорили цикл.', stats: [{ value: '−55%', label: 'времени на КП' }, { value: '+22%', label: 'к ответам клиентов' }] } });
  add({ id: 'case-02', category: 'case_study', variantNumber: 2, layoutType: 'quote', name: 'Кейс — отзыв клиента', description: 'Цитата клиента о результате', themeSupport: ['light', 'dark'],
    requiredFields: [area('quote', 'Цитата', 180), text('author', 'Имя', 36)], optionalFields: [text('role', 'Должность', 40)],
    sample: { quote: 'Presa сократила подготовку коммерческих предложений с двух дней до пары часов — и качество стало ровным.', author: 'Анна Котова', role: 'Head of Sales, Mercato' } });
  add({ id: 'case-03', category: 'case_study', variantNumber: 3, layoutType: 'text_media', name: 'Кейс — с визуалом', description: 'Описание кейса и место под скриншот', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'Описание кейса', 240)], optionalFields: [image('image', 'Изображение'), text('imageLabel', 'Подпись к визуалу', 30)],
    sample: { title: 'Как это выглядело', text: 'Единый шаблон коммерческого предложения с автоподгонкой контента под фирменный стиль клиента.', imageLabel: 'До / после', image: stock(STOCK.twoDevs) } });

  /* ===== PROCESS ===== */
  add({ id: 'process-01', category: 'process', variantNumber: 1, layoutType: 'timeline', name: 'Процесс — таймлайн', description: 'Горизонтальный таймлайн этапов', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('milestones', 'Этапы', stepSub, 3, 5)], optionalFields: [],
    sample: { title: 'Как мы работаем', milestones: [{ title: 'Бриф', desc: 'Согласуем цель и аудиторию' }, { title: 'Сборка', desc: 'Готовим слайды из шаблонов' }, { title: 'Правки', desc: 'Дорабатываем вместе' }, { title: 'Запуск', desc: 'Передаём готовый файл' }] } });
  add({ id: 'process-02', category: 'process', variantNumber: 2, layoutType: 'steps', name: 'Процесс — шаги', description: 'Вертикальные нумерованные шаги', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Шаги', stepSub, 3, 5)], optionalFields: [],
    sample: { title: 'Процесс внедрения', steps: [{ title: 'Знакомство', desc: 'Изучаем ваши материалы' }, { title: 'Настройка', desc: 'Адаптируем шаблоны под бренд' }, { title: 'Обучение', desc: 'Показываем команде' }] } });
  add({ id: 'process-03', category: 'process', variantNumber: 3, layoutType: 'cards', name: 'Процесс — карточки этапов', description: 'Этапы как нумерованные карточки', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Этапы', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'Четыре шага', cards: [{ heading: 'Анализ', text: 'Разбираем задачу и контекст' }, { heading: 'Дизайн', text: 'Подбираем шаблоны слайдов' }, { heading: 'Контент', text: 'Заполняем и улучшаем тексты' }, { heading: 'Сдача', text: 'Отдаём готовый PPTX' }] } });

  /* ===== PRICING ===== */
  add({ id: 'pricing-01', category: 'pricing', variantNumber: 1, layoutType: 'pricing', name: 'Тарифы — пакеты', description: 'Два-три тарифных пакета', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('tiers', 'Тарифы', tierSub, 2, 3)], optionalFields: [],
    sample: { title: 'Тарифы', tiers: [{ name: 'Start', price: '0 ₽', features: ['5 шаблонов', 'Экспорт PPTX', '1 пользователь'] }, { name: 'Team', price: '2 900 ₽/мес', features: ['Все шаблоны', 'AI-помощник', 'До 10 пользователей'] }, { name: 'Enterprise', price: 'по запросу', features: ['Брендинг', 'SSO и поддержка', 'Безлимит'] }] } });
  add({ id: 'pricing-02', category: 'pricing', variantNumber: 2, layoutType: 'compare', name: 'Тарифы — таблица', description: 'Сравнение двух пакетов по параметрам', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('leftLabel', 'Левый столбец', 24, 'Team'), text('rightLabel', 'Правый столбец', 24, 'Enterprise'), group('rows', 'Строки', rowSub, 2, 6)], optionalFields: [],
    sample: { title: 'Что входит в пакеты', leftLabel: 'Team', rightLabel: 'Enterprise', rows: [{ label: 'Шаблоны', left: 'Все', right: 'Все + кастом' }, { label: 'AI-помощник', left: 'Да', right: 'Да' }, { label: 'Брендинг', left: '—', right: 'Да' }, { label: 'Поддержка', left: 'Почта', right: 'Менеджер' }] } });
  add({ id: 'pricing-03', category: 'pricing', variantNumber: 3, layoutType: 'big_stat', name: 'Тарифы — одна цена', description: 'Одно ключевое предложение и условия', themeSupport: ['light', 'dark'],
    requiredFields: [text('statValue', 'Цена', 14, '2 900 ₽'), text('statLabel', 'Условие', 50, 'в месяц за команду'), list('bullets', 'Что входит', 2, 4, 60)], optionalFields: [],
    sample: { statValue: '2 900 ₽', statLabel: 'в месяц за всю команду', bullets: ['Все шаблоны и обновления', 'AI-помощник по текстам', 'Экспорт без ограничений'] } });

  /* ===== COMPARISON ===== */
  add({ id: 'comparison-01', category: 'comparison', variantNumber: 1, layoutType: 'compare', name: 'Сравнение — мы vs другие', description: 'Сравнительная таблица по параметрам', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('leftLabel', 'Левый столбец', 24, 'Presa'), text('rightLabel', 'Правый столбец', 24, 'Обычный подход'), group('rows', 'Параметры', rowSub, 2, 6)], optionalFields: [],
    sample: { title: 'Почему Presa', leftLabel: 'Presa', rightLabel: 'Вручную', rows: [{ label: 'Скорость', left: 'Минуты', right: 'Часы' }, { label: 'Качество', left: 'Стабильное', right: 'Зависит от человека' }, { label: 'Стиль', left: 'Единый', right: 'Разный' }, { label: 'Формат', left: 'PPTX', right: 'PPTX' }] } });
  add({ id: 'comparison-02', category: 'comparison', variantNumber: 2, layoutType: 'cards', name: 'Сравнение — две карточки', description: 'Два подхода в виде карточек', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Подходы', cardSub, 2, 2)], optionalFields: [],
    sample: { title: 'Два пути', cards: [{ heading: 'Без Presa', text: 'Ручная вёрстка, разное качество, потеря времени' }, { heading: 'С Presa', text: 'Готовые шаблоны, единый стиль, скорость' }] } });
  add({ id: 'comparison-03', category: 'comparison', variantNumber: 3, layoutType: 'bullets', name: 'Сравнение — преимущества', description: 'Список отличий тезисами', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), list('bullets', 'Отличия', 3, 5, 90)], optionalFields: [],
    sample: { title: 'В чём разница', bullets: ['Библиотека шаблонов вместо случайной генерации', 'Автоподгонка контента под дизайн', 'Превью совпадает с экспортом', 'Архитектура под рост библиотеки'] } });

  /* ===== ROADMAP ===== */
  add({ id: 'roadmap-01', category: 'roadmap', variantNumber: 1, layoutType: 'timeline', name: 'Дорожная карта — таймлайн', description: 'Этапы развития на линии времени', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('milestones', 'Этапы', stepSub, 3, 5)], optionalFields: [],
    sample: { title: 'Дорожная карта', milestones: [{ title: 'Q1', desc: 'Запуск конструктора' }, { title: 'Q2', desc: '50 шаблонов и брендинг' }, { title: 'Q3', desc: 'Командные роли' }, { title: 'Q4', desc: 'Интеграции и API' }] } });
  add({ id: 'roadmap-02', category: 'roadmap', variantNumber: 2, layoutType: 'cards', name: 'Дорожная карта — кварталы', description: 'Кварталы в виде карточек', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Кварталы', cardSub, 4, 10)], optionalFields: [],
    sample: { title: 'План на год', cards: [{ heading: 'Q1', text: 'MVP конструктора слайдов' }, { heading: 'Q2', text: 'Расширение библиотеки' }, { heading: 'Q3', text: 'Совместная работа' }, { heading: 'Q4', text: 'Интеграции' }] } });
  add({ id: 'roadmap-03', category: 'roadmap', variantNumber: 3, layoutType: 'steps', name: 'Дорожная карта — шаги', description: 'Этапы списком с описанием', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Этапы', stepSub, 3, 5)], optionalFields: [],
    sample: { title: 'Куда движемся', steps: [{ title: 'Сейчас', desc: 'Базовая библиотека и экспорт' }, { title: 'Скоро', desc: 'AI-помощник и брендинг' }, { title: 'Потом', desc: 'Командная работа и API' }] } });

  /* ===== TEAM ===== */
  add({ id: 'team-01', category: 'team', variantNumber: 1, layoutType: 'team', name: 'Команда — сетка', description: 'Карточки участников команды', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('members', 'Команда', memberSub, 2, 6)], optionalFields: [],
    sample: { title: 'Наша команда', members: [{ name: 'Иван Петров', role: 'CEO' }, { name: 'Анна Котова', role: 'Product' }, { name: 'Дмитрий Лис', role: 'Design' }, { name: 'Мария Гросс', role: 'Sales' }] } });
  add({ id: 'team-02', category: 'team', variantNumber: 2, layoutType: 'quote', name: 'Команда — слово основателя', description: 'Цитата основателя', themeSupport: ['light', 'dark'],
    requiredFields: [area('quote', 'Цитата', 180), text('author', 'Имя', 36)], optionalFields: [text('role', 'Роль', 40)],
    sample: { quote: 'Мы строим инструмент, который делает каждую корпоративную презентацию быстрой и достойной бренда.', author: 'Иван Петров', role: 'Основатель Presa' } });
  add({ id: 'team-03', category: 'team', variantNumber: 3, layoutType: 'text_stats', name: 'Команда — о нас в цифрах', description: 'Короткий текст и цифры о команде', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), area('text', 'О команде', 200), group('stats', 'Цифры', statSub, 2, 3)], optionalFields: [],
    sample: { title: 'Команда', text: 'Эксперты в продукте, дизайне и B2B-продажах, собранные вокруг одной задачи.', stats: [{ value: '38', label: 'человек' }, { value: '6', label: 'стран' }, { value: '12', label: 'лет опыта в среднем' }] } });

  /* ===== CONTACT ===== */
  add({ id: 'contact-01', category: 'contact', variantNumber: 1, layoutType: 'cta', name: 'Контакты — призыв', description: 'Крупный призыв к действию и контакты', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), text('subtitle', 'Подзаголовок', 90), list('bullets', 'Контакты', 1, 3, 50)], optionalFields: [text('buttonLabel', 'Текст кнопки', 28)],
    sample: { title: 'Давайте начнём', subtitle: 'Соберём вашу первую презентацию вместе', bullets: ['hello@presa.io', '+7 999 000-00-00', 'presa.io'], buttonLabel: 'Запланировать звонок' } });
  add({ id: 'contact-02', category: 'contact', variantNumber: 2, layoutType: 'split_accent', name: 'Контакты — сплит', description: 'Контакты с акцентной панелью', themeSupport: ['light'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28, 'КОНТАКТЫ'), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)], optionalFields: [text('sideLabel', 'Текст на панели', 30)],
    sample: { eyebrow: 'СЛЕДУЮЩИЙ ШАГ', title: 'Готовы попробовать?', subtitle: 'Напишите нам — подготовим демо под вашу задачу', sideLabel: 'hello@presa.io' } });
  add({ id: 'contact-03', category: 'contact', variantNumber: 3, layoutType: 'title_dark', name: 'Контакты — premium dark', description: 'Тёмный финальный слайд с контактами', themeSupport: ['dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 28, 'СПАСИБО'), text('title', 'Заголовок', 44), text('subtitle', 'Контакты', 90)], optionalFields: [text('footerLabel', 'Подпись внизу', 40)],
    sample: { eyebrow: 'СПАСИБО ЗА ВНИМАНИЕ', title: 'Обсудим ваш проект?', subtitle: 'hello@presa.io · +7 999 000-00-00 · presa.io', footerLabel: 'Presa' } });

  /* ===== STROYKA PACK — bespoke construction templates (self-contained layouts) ===== */
  const conStat = [text('value', 'Значение', 10, '18'), text('label', 'Подпись', 26)];
  const conNumStat = [text('value', 'Значение', 10, '240'), text('unit', 'Единица', 4, '%'), text('label', 'Подпись', 48)];
  const conProj = [image('image', 'Фото'), text('title', 'Название', 30), text('meta', 'Описание', 44)];

  add({ id: 'con-cover', category: 'title', variantNumber: 20, layoutType: 'con_cover', name: 'Стройка — обложка', description: 'Тёмная панель с текстом + фото объекта и чип с метриками', themeSupport: ['light'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 34, 'СТРОИТЕЛЬСТВО ПОЛНОГО ЦИКЛА'), text('title', 'Заголовок', 44), text('subtitle', 'Подзаголовок', 90)],
    optionalFields: [text('titleAccent', 'Акцент в заголовке', 24), text('footerLabel', 'Подпись внизу', 30), image('image', 'Фото объекта'), group('stats', 'Метрики на чипе', conStat, 0, 2)],
    sample: { eyebrow: 'СТРОИТЕЛЬСТВО ПОЛНОГО ЦИКЛА', title: 'Строим объекты, которые работают', titleAccent: 'десятилетиями', subtitle: 'Жилые, складские и промышленные объекты под ключ.', footerLabel: 'Москва · с 2008', image: stock(STOCK.construction), stats: [{ value: '18', label: 'лет\nна рынке' }, { value: '240', label: 'объектов\nсдано' }] } });

  add({ id: 'con-about', category: 'about_company', variantNumber: 20, layoutType: 'con_about', name: 'Стройка — о компании', description: 'Текст слева, столбец метрик на бетонной панели справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 44), area('text', 'Описание', 240)],
    optionalFields: [text('titleAccent', 'Акцент в заголовке', 40), group('stats', 'Метрики', conStat, 2, 3)],
    sample: { title: 'Генподрядчик полного цикла —', titleAccent: 'от проекта до ключей', text: '18 лет проектируем и строим жильё, склады и производственные комплексы. Собственные бригады, техника и технадзор на каждом объекте — поэтому отвечаем за сроки и качество не на словах, а в договоре.', stats: [{ value: '18', label: 'лет на рынке\nстроительства' }, { value: '240', label: 'объектов сдано\nв эксплуатацию' }, { value: '1,2 млн', label: 'м² построено\nс 2008 года' }] } });

  add({ id: 'con-services', category: 'services', variantNumber: 20, layoutType: 'con_services', name: 'Стройка — направления', description: 'Сетка-таблица услуг с номерами и иконками', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), group('cards', 'Направления', svcIconSub, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 28)],
    sample: { eyebrow: 'Направления', title: 'Что мы строим', cards: [
      { icon: 'doc', heading: 'Проектирование', text: 'Полный комплект рабочей документации и согласования' },
      { icon: 'box', heading: 'Монолитные работы', text: 'Фундаменты, каркас и несущие конструкции' },
      { icon: 'layers', heading: 'Фасады', text: 'Навесные вентилируемые и мокрые системы' },
      { icon: 'gear', heading: 'Инженерные сети', text: 'Отопление, вентиляция, водоснабжение, электрика' },
      { icon: 'globe', heading: 'Благоустройство', text: 'Территория, дороги, озеленение и МАФ' },
      { icon: 'badge', heading: 'Сдача под ключ', text: 'Пуско-наладка, документы и гарантия до 5 лет' } ] } });

  add({ id: 'con-process', category: 'process', variantNumber: 20, layoutType: 'con_process', name: 'Стройка — этапы', description: 'Горизонтальный степпер этапов работы', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Этапы', stepSub, 3, 5)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 28)],
    sample: { eyebrow: 'Как мы работаем', title: 'Прозрачный процесс на каждом этапе', steps: [
      { title: 'Проект и смета', desc: 'Согласуем объём, бюджет и сроки в договоре' },
      { title: 'Площадка', desc: 'Подготовка, ограждение и нулевой цикл' },
      { title: 'Монолит', desc: 'Каркас, перекрытия и несущие конструкции' },
      { title: 'Отделка и сети', desc: 'Фасады, инженерия и внутренние работы' },
      { title: 'Сдача', desc: 'Пуско-наладка, документы и гарантия' } ] } });

  add({ id: 'con-projects', category: 'case_study', variantNumber: 20, layoutType: 'con_projects', name: 'Стройка — объекты', description: 'Галерея объектов: одно большое фото + два малых', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 40), group('projects', 'Объекты', conProj, 3, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 28)],
    sample: { eyebrow: 'Наши объекты', title: 'Ключевые объекты', projects: [
      { image: stock(STOCK.buildings), title: 'ЖК «Гранд Парк»', meta: 'Жилой комплекс · 84 000 м² · 2024' },
      { image: stock(STOCK.officeWindow, 900), title: 'БЦ «Меридиан»', meta: 'Офисный центр · 21 000 м²' },
      { image: stock(STOCK.construction, 900), title: 'РЦ «Восток»', meta: 'Склад класса A · 24 000 м²' } ] } });

  add({ id: 'con-numbers', category: 'numbers', variantNumber: 20, layoutType: 'con_numbers', name: 'Стройка — в цифрах', description: 'Тёмный слайд с четырьмя крупными метриками', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 60), group('stats', 'Метрики', conNumStat, 3, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 28)],
    sample: { eyebrow: 'Результаты', title: 'Цифры, за которыми стоит репутация', stats: [
      { value: '240', label: 'объектов сдано в эксплуатацию' },
      { value: '95', unit: '%', label: 'объектов сданы точно в срок' },
      { value: '18', label: 'лет непрерывной работы' },
      { value: '0', label: 'серьёзных замечаний при сдаче' } ] } });

  add({ id: 'con-why', category: 'benefits', variantNumber: 20, layoutType: 'con_why', name: 'Стройка — преимущества', description: 'Сетка 2×2 преимуществ + вертикальное фото', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Преимущества', svcIconSub, 4, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 28), image('image', 'Фото')],
    sample: { eyebrow: 'Почему мы', title: 'Снимаем главные риски стройки', image: stock(STOCK.loft), cards: [
      { icon: 'doc', heading: 'Фиксированная смета', text: 'Цена и сроки закреплены в договоре' },
      { icon: 'shield', heading: 'Собственные ресурсы', text: 'Бригады и техника — без субподряда вслепую' },
      { icon: 'clock', heading: 'Контроль каждый день', text: 'Технадзор и фотоотчёты по графику' },
      { icon: 'badge', heading: 'Гарантия до 5 лет', text: 'Отвечаем за результат после сдачи' } ] } });

  add({ id: 'con-cta', category: 'contact', variantNumber: 20, layoutType: 'con_cta', name: 'Стройка — контакты', description: 'Тёмный CTA с кнопкой и контактами', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('buttonLabel', 'Текст кнопки', 24, 'Запросить смету')],
    optionalFields: [text('eyebrow', 'Надзаголовок', 28), text('titleAccent', 'Акцент в заголовке', 30), list('contacts', 'Контакты', 1, 3, 30)],
    sample: { eyebrow: 'Следующий шаг', title: 'Обсудим', titleAccent: 'ваш объект', buttonLabel: 'Запросить смету', contacts: ['8 800 700-10-20', 'stroymonolit.ru'] } });

  function byCategory(cat) { return T.filter((t) => t.category === cat); }
  function byId(id) { return T.find((t) => t.id === id); }
  function categoryLabel(id) { const c = CATEGORIES.find((x) => x.id === id); return c ? c.label : id; }

  /* ============================================================
     Practical metadata for the library — derived from the
     template's layout + fields so it stays correct as the
     library grows. Each template advertises:
       useCase        — «для чего подходит» (one line)
       primary        — main collection field + optimal count
       contentLength  — 'short' | 'medium' | 'long'
       badges         — chips shown in the picker
     RENDER_CAP — how many collection items each layout actually
     draws (the renderer slices to this); drives «оптимальное
     количество» and overload suggestions in one place.
     ============================================================ */
  const RENDER_CAP = {
    about_geo_icons: 4, solution_badges: 4, benefits_check_rings: 5, numbers_icon_stats: 4,
    cards: 6, service_icons: 6, service_photos: 6, service_photo_icon: 6, service_minimal: 6,
    service_list_panel: 6, service_flagship: 5, service_row_icons: 6, service_results: 6,
    service_blocks: 6, service_process: 5, service_compare: 6,
    about_lead_cards: 4, about_timeline_stats: 4, about_text_media: 3,
    bullets: 5, text_bullets: 5, agenda: 6, agenda_grid: 8, side_list: 6,
    stats_row: 4, text_stats: 4, big_stat: 3,
    steps: 5, timeline: 5, pricing: 3, compare: 6, table: 10, team: 6,
    chart_bar: 8, chart_line: 8, chart_donut: 6,
    con_services: 6, con_process: 5, con_projects: 3, con_numbers: 4, con_why: 4, con_about: 3, con_cover: 2
  };

  // human nouns for the «для N …» badge, declined for Russian counts
  const NOUN = {
    projects: ['объект', 'объекта', 'объектов'],
    cards: ['карточка', 'карточки', 'карточек'], items: ['пункт', 'пункта', 'пунктов'],
    bullets: ['пункт', 'пункта', 'пунктов'], stats: ['метрика', 'метрики', 'метрик'],
    steps: ['шаг', 'шага', 'шагов'], milestones: ['этап', 'этапа', 'этапов'],
    tiers: ['тариф', 'тарифа', 'тарифов'], rows: ['строка', 'строки', 'строк'],
    members: ['человек', 'человека', 'человек'], data: ['значение', 'значения', 'значений']
  };
  function plural(n, forms) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  }

  const USECASE = {
    title: 'Открыть презентацию: тема, компания, контекст',
    agenda: 'Показать структуру выступления в начале',
    about_company: 'Рассказать, кто вы и чем сильны',
    problem: 'Обозначить боль и контекст клиента',
    solution: 'Показать продукт или подход к задаче',
    services: 'Перечислить продукты и услуги',
    benefits: 'Объяснить выгоды для клиента',
    numbers: 'Доказать результат крупными цифрами',
    chart: 'Показать динамику или структуру данных',
    table: 'Сравнить показатели по строкам',
    case_study: 'Показать кейс и результат клиента',
    process: 'Описать этапы работы или внедрения',
    pricing: 'Показать тарифы и условия',
    comparison: 'Сравнить вас с альтернативой',
    roadmap: 'Показать план развития по этапам',
    team: 'Представить команду',
    contact: 'Призыв к действию и контакты'
  };
  // sharper, layout-specific use cases where the generic category line is too vague
  const USECASE_LAYOUT = {
    big_stat: 'Одна доминирующая цифра с короткими пояснениями',
    quote: 'Сильная цитата, миссия или отзыв одним блоком',
    text_media: 'Абзац текста рядом с фото или скриншотом',
    text_bullets: 'Вводный абзац плюс список коротких тезисов',
    compare: 'Сравнение двух колонок по параметрам',
    table: 'Числовые показатели по строкам и колонкам',
    timeline: 'Вехи или этапы на горизонтальной линии',
    chart_bar: 'Сравнение значений по категориям',
    chart_line: 'Динамика показателя во времени',
    chart_donut: 'Структура целого по долям'
  };

  function primaryField(t) {
    const defs = [...t.requiredFields, ...(t.optionalFields || [])];
    const g = defs.find((d) => d.type === 'group');
    if (g) return g;
    const l = defs.find((d) => d.type === 'list' && d.key !== 'features');
    return l || null;
  }

  function contentLength(t) {
    const defs = [...t.requiredFields, ...(t.optionalFields || [])];
    let area = 0, listLen = 0;
    defs.forEach((d) => {
      if (d.type === 'textarea') area = Math.max(area, d.maxLength || 0);
      if (d.type === 'list') listLen = Math.max(listLen, d.maxItemLength || 0);
      if (d.type === 'group') (d.sub || []).forEach((s) => { if (s.type === 'textarea') area = Math.max(area, s.maxLength || 0); });
    });
    if (area >= 200) return 'long';
    if (area >= 100 || listLen >= 70) return 'medium';
    return 'short';
  }

  function hasIcon(t) {
    return [...t.requiredFields, ...(t.optionalFields || [])].some((d) => d.type === 'icon' || (d.type === 'group' && (d.sub || []).some((s) => s.type === 'icon')));
  }
  function hasPhoto(t) {
    return [...t.requiredFields, ...(t.optionalFields || [])].some((d) => d.type === 'image' || (d.type === 'group' && (d.sub || []).some((s) => s.type === 'image')));
  }

  const LEN_LABEL = { short: 'короткий текст', medium: 'средний текст', long: 'длинный текст' };

  function meta(t) {
    const pf = primaryField(t);
    const cap = RENDER_CAP[t.layoutType];
    let optimal = null, primary = null;
    if (pf) {
      const min = pf.minItems || 1;
      const max = Math.min(pf.maxItems || 99, cap || pf.maxItems || 99);
      const noun = NOUN[pf.key] || NOUN.items;
      optimal = { field: pf.key, min, max, cap: cap || max, type: pf.type,
        label: min === max ? `${max} ${plural(max, noun)}` : `${min}–${max} ${noun[2]}` };
      primary = { min, max, label: min === max ? `для ${max} ${plural(max, noun)}` : `для ${min}–${max} ${noun[2]}` };
    }
    const len = contentLength(t);
    const badges = [];
    if (primary) badges.push({ label: primary.label, kind: 'count' });
    badges.push({ label: LEN_LABEL[len], kind: 'len' });
    if (hasIcon(t)) badges.push({ label: 'с иконками', kind: 'icon' });
    if (hasPhoto(t)) badges.push({ label: 'с фото', kind: 'photo' });
    if (/^chart_|^table$/.test(t.layoutType)) badges.push({ label: 'данные', kind: 'data' });
    if (optimal && optimal.max >= 6) badges.push({ label: 'compact', kind: 'compact' });
    const premium = (t.themeSupport || []).length === 1 && t.themeSupport[0] === 'dark';
    if (premium) badges.push({ label: 'premium', kind: 'premium' });

    return {
      useCase: USECASE_LAYOUT[t.layoutType] || USECASE[t.category] || t.description,
      contentLength: len,
      optimal,
      badges
    };
  }

  window.PresaTemplates = { CATEGORIES, TEMPLATES: T, byCategory, byId, categoryLabel, meta, RENDER_CAP, primaryField };
})();
