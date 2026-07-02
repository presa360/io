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
  // pack 2 sub-shapes
  const kpiSub = [icon('icon', 'Иконка'), text('value', 'Значение', 10, '128'), text('label', 'Подпись', 30), text('delta', 'Динамика', 10, '+12%')];
  const pointSub = [text('heading', 'Заголовок', 36), area('text', 'Описание', 90)];
  const barSub = [text('label', 'Метка', 22, 'Q1'), text('value', 'Значение', 10, '42')];
  const ringSub = [text('value', 'Значение', 8, '92%'), text('pct', 'Процент 0–100', 6, '92'), text('label', 'Подпись', 40)];
  const matrixRowSub = [text('feature', 'Возможность', 44), text('c1', 'Колонка 1', 14, '✓'), text('c2', 'Колонка 2', 14, '✓'), text('c3', 'Колонка 3', 14, '✕')];
  const contactSub = [text('label', 'Тип', 20, 'Почта'), text('value', 'Значение', 40, 'hello@presa.io')];

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

  add({ id: 'solution-11', category: 'solution', variantNumber: 11, layoutType: 'service_icons', name: 'Решение — карточки с иконками', description: 'Составляющие решения сеткой карточек с иконками (3–6)', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки решения', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Из чего состоит решение', cards: [
      { icon: 'layers', heading: 'Единая система', text: 'Поставки, запасы и логистика в одном контуре' },
      { icon: 'shield', heading: 'Управление рисками', text: 'Проактивное планирование и диверсификация закупок' },
      { icon: 'chart', heading: 'Прозрачность', text: 'Состояние заказов и запасов в реальном времени' },
      { icon: 'target', heading: 'Бизнес-результат', text: 'Непрерывность поставок и предсказуемость сроков' } ] } });
  add({ id: 'solution-12', category: 'solution', variantNumber: 12, layoutType: 'service_row_icons', name: 'Решение — строки с иконками', description: 'Составляющие решения горизонтальными строками с иконками', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки решения', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Как устроено решение', cards: [
      { icon: 'gear', heading: 'Автоматизация рутины', text: 'Единые процессы вместо ручной сборки' },
      { icon: 'bolt', heading: 'Скорость', text: 'Результат за минуты, а не за дни' },
      { icon: 'badge', heading: 'Единый стандарт', text: 'Одинаковое качество по всей команде' },
      { icon: 'chart', heading: 'Аналитика', text: 'Прозрачные метрики по каждому этапу' } ] } });
  add({ id: 'solution-13', category: 'solution', variantNumber: 13, layoutType: 'service_blocks', name: 'Решение — блоки', description: 'Составляющие решения крупными блоками с иконками', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки решения', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Наш подход к решению', cards: [
      { icon: 'target', heading: 'Диагностика', text: 'Находим узкие места и точки роста' },
      { icon: 'layers', heading: 'Архитектура', text: 'Собираем решение под ваши процессы' },
      { icon: 'rocket', heading: 'Внедрение', text: 'Запускаем и сопровождаем на всех этапах' } ] } });
  add({ id: 'solution-14', category: 'solution', variantNumber: 14, layoutType: 'service_flagship', name: 'Решение — ключевой блок + опоры', description: 'Ключевой блок решения крупно, остальные рядом (первый — главный)', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки (первый — ключевой)', svcIconSub, 3, 5)], optionalFields: [],
    sample: { title: 'Ядро решения и опоры', cards: [
      { icon: 'spark', heading: 'Единая платформа', text: 'Один контур управления поставками, запасами и логистикой — вместо разрозненных систем' },
      { icon: 'shield', heading: 'Устойчивость', text: 'Снижение рисков и непрерывность поставок' },
      { icon: 'chart', heading: 'Предсказуемость', text: 'Контроль объёмов и сроков в реальном времени' } ] } });
  add({ id: 'solution-15', category: 'solution', variantNumber: 15, layoutType: 'benefits_check_rings', name: 'Решение — чек-лист с кольцами', description: 'Что даёт решение — чек-лист с кольцевым акцентом', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 40, 'Что даёт решение'), group('cards', 'Пункты решения', benefitRowSub, 3, 5)], optionalFields: [text('eyebrow', 'Надзаголовок', 36, 'РЕШЕНИЕ')],
    sample: { eyebrow: 'РЕШЕНИЕ', title: 'Что даёт решение', cards: [
      { heading: 'Непрерывность поставок', text: 'Проактивное планирование и управление рисками' },
      { heading: 'Прозрачность', text: 'Состояние заказов и запасов в реальном времени' },
      { heading: 'Предсказуемость', text: 'Контроль объёмов и сроков на всех этапах' },
      { heading: 'Рост прибыли', text: 'Единая система вместо разрозненных процессов' } ] } });
  add({ id: 'solution-16', category: 'solution', variantNumber: 16, layoutType: 'service_list_panel', name: 'Решение — список-панель', description: 'Составляющие решения аккуратным списком-панелью с иконками', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки решения', svcIconSub, 3, 6)], optionalFields: [],
    sample: { title: 'Состав решения', cards: [
      { icon: 'box', heading: 'Управление поставками', text: 'Поставки, запасы и логистика в едином контуре' },
      { icon: 'shield', heading: 'Управление рисками', text: 'Проактивное планирование и диверсификация закупок' },
      { icon: 'chart', heading: 'Аналитика и KPI', text: 'Прозрачные показатели по каждому модулю' },
      { icon: 'target', heading: 'Бизнес-результат', text: 'Непрерывность поставок и предсказуемость сроков' } ] } });
  add({ id: 'solution-17', category: 'solution', variantNumber: 17, layoutType: 'service_minimal', name: 'Решение — минимализм', description: 'Составляющие решения лаконичными карточками с иконками', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('cards', 'Блоки решения', svcIconSub, 2, 6)], optionalFields: [],
    sample: { title: 'Ключевые составляющие', cards: [
      { icon: 'gear', heading: 'Проактивное планирование', text: 'Управляем рисками до того, как они проявятся' },
      { icon: 'layers', heading: 'Единая система', text: 'Поставки, запасы и логистика вместе' },
      { icon: 'bolt', heading: 'Скорость решений', text: 'Данные в реальном времени для быстрых действий' } ] } });

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

  /* ===== PACK 2 — data-viz & structure ===== */
  add({ id: 'numbers-06', category: 'numbers', variantNumber: 6, layoutType: 'kpi_dashboard', name: 'KPI-дашборд', description: 'Карточки ключевых показателей с динамикой', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('stats', 'Показатели', kpiSub, 2, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30)],
    sample: { eyebrow: 'Ключевые показатели', title: 'Итоги квартала в цифрах', stats: [
      { icon: 'chart', value: '₽128 млн', label: 'Выручка', delta: '+18%' },
      { icon: 'group', value: '2 400', label: 'Активных клиентов', delta: '+12%' },
      { icon: 'target', value: '94%', label: 'Удержание', delta: '+3%' },
      { icon: 'bolt', value: '1,8 дн', label: 'Среднее время сделки', delta: '−22%' } ] } });

  add({ id: 'numbers-07', category: 'numbers', variantNumber: 7, layoutType: 'stat_hero', name: 'Главная цифра', description: 'Одна крупная метрика и поддерживающие пункты', themeSupport: ['light', 'dark'],
    requiredFields: [text('value', 'Главное значение', 10, '3,2×'), text('title', 'Заголовок', 50), group('points', 'Пункты', pointSub, 2, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30), text('unit', 'Единица', 6), text('caption', 'Подпись под цифрой', 90)],
    sample: { eyebrow: 'Главный результат', value: '3,2', unit: '×', caption: 'рост скорости подготовки презентаций за первый квартал', title: 'Что это даёт бизнесу', points: [
      { heading: 'Быстрее запуск', text: 'Материалы готовы за часы, а не дни' },
      { heading: 'Единый стиль', text: 'Все слайды в фирменном оформлении' },
      { heading: 'Меньше правок', text: 'Контент сразу укладывается в макет' } ] } });

  add({ id: 'chart-04', category: 'chart', variantNumber: 4, layoutType: 'bar_compare', name: 'Столбцы — сравнение', description: 'Горизонтальные столбцы со значениями и акцентом', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('data', 'Данные', barSub, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30), text('caption', 'Подпись', 90)],
    sample: { eyebrow: 'Сравнение', title: 'Выручка по кварталам, млн ₽', caption: 'Динамика за последний год', data: [
      { label: 'Q1', value: '64' }, { label: 'Q2', value: '82' }, { label: 'Q3', value: '97' }, { label: 'Q4', value: '128' } ] } });

  add({ id: 'chart-05', category: 'chart', variantNumber: 5, layoutType: 'ring_kpis', name: 'Кольца — проценты', description: 'Кольцевые индикаторы с процентами', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('stats', 'Индикаторы', ringSub, 2, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30)],
    sample: { eyebrow: 'Метрики', title: 'Результаты внедрения', stats: [
      { value: '94%', pct: '94', label: 'Удовлетворённость клиентов' },
      { value: '78%', pct: '78', label: 'Сокращение ручной работы' },
      { value: '99,9%', pct: '99', label: 'Доступность сервиса' } ] } });

  add({ id: 'comparison-04', category: 'comparison', variantNumber: 4, layoutType: 'feature_matrix', name: 'Матрица тарифов', description: 'Таблица возможностей по пакетам с акцентной колонкой', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), list('columns', 'Колонки', 2, 3, 22), group('rows', 'Строки', matrixRowSub, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30), text('rowsLabel', 'Заголовок строк', 30)],
    sample: { eyebrow: 'Сравнение', title: 'Что входит в пакеты', rowsLabel: 'Возможности', columns: ['Базовый', 'Бизнес', 'Премиум'], rows: [
      { feature: 'Библиотека шаблонов', c1: '✓', c2: '✓', c3: '✓' },
      { feature: 'Экспорт в PDF и PPTX', c1: '✓', c2: '✓', c3: '✓' },
      { feature: 'Фирменные стили', c1: '✕', c2: '✓', c3: '✓' },
      { feature: 'ИИ-генерация по тексту', c1: '✕', c2: '✓', c3: '✓' },
      { feature: 'Приоритетная поддержка', c1: '✕', c2: '✕', c3: '✓' } ] } });

  add({ id: 'agenda-07', category: 'agenda', variantNumber: 7, layoutType: 'section_divider', name: 'Разделитель секции', description: 'Тёмный слайд-разделитель с номером и названием раздела', themeSupport: ['light', 'dark'],
    requiredFields: [text('eyebrow', 'Надзаголовок', 30, 'РАЗДЕЛ'), text('title', 'Название раздела', 40)],
    optionalFields: [text('num', 'Номер', 4, '01'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'Раздел 01', num: '01', title: 'Наше решение', subtitle: 'Как мы помогаем командам собирать презентации быстрее и в едином стиле' } });

  /* ===== PACK 3 — Sprint 1: tables & pricing ===== */
  const mxRow = [text('feature', 'Возможность', 44), text('c1', 'Колонка 1', 16, '✓'), text('c2', 'Колонка 2', 16, '✓'), text('c3', 'Колонка 3', 16, '✕')];
  const dtRow = [text('label', 'Статья', 36), text('c1', 'Колонка 1', 16), text('c2', 'Колонка 2', 16), text('c3', 'Колонка 3', 16)];
  const btRow = [text('label', 'Метрика', 34), text('sub', 'Уточнение', 30), text('value', 'Значение', 10, '88%'), text('pct', 'Процент 0–100', 6, '88')];
  const tier2 = [text('name', 'Тариф', 24), text('price', 'Цена', 24), text('tagline', 'Подзаголовок', 60), list('features', 'Что входит', 3, 6, 42)];
  const scaleStep = [text('price', 'Цена', 16, '2 900 ₽'), text('name', 'Название', 20, 'TEAM'), area('desc', 'Описание', 80)];

  add({ id: 'table-02', category: 'table', variantNumber: 2, layoutType: 'feature_matrix_priced', name: 'Матрица «фича × тариф»', description: 'Возможности по тарифам с ценами и акцентной колонкой', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), list('columns', 'Тарифы', 2, 3, 22), group('rows', 'Строки', mxRow, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ТАРИФЫ'), text('rowsLabel', 'Заголовок строк', 26, 'Возможность'), list('prices', 'Цены', 0, 3, 18), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'ТАРИФЫ', title: 'Что входит в каждый тариф', subtitle: 'Сравните возможности и выберите подходящий пакет.', rowsLabel: 'Возможность', columns: ['Start', 'Team', 'Enterprise'], prices: ['0 ₽', '2 900 ₽', 'по запросу'], rows: [
      { feature: 'Готовые шаблоны', c1: '5', c2: 'Все', c3: 'Все + кастом' }, { feature: 'AI-помощник по тексту', c1: '✕', c2: '✓', c3: '✓' }, { feature: 'Экспорт в PPTX', c1: '✓', c2: '✓', c3: '✓' }, { feature: 'Совместная работа', c1: '—', c2: 'до 10', c3: 'без лимита' }, { feature: 'Брендинг и шрифты', c1: '✕', c2: '✓', c3: '✓' }, { feature: 'Поддержка', c1: 'Почта', c2: 'Приоритет', c3: 'Менеджер' } ] } });

  add({ id: 'table-03', category: 'table', variantNumber: 3, layoutType: 'compare_check', name: 'Сравнение: мы vs конкуренты', description: 'Сравнительная таблица с галочками, первая колонка — вы', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), list('columns', 'Колонки', 2, 3, 22), group('rows', 'Строки', mxRow, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'СРАВНЕНИЕ'), text('rowsLabel', 'Заголовок строк', 26, 'Критерий'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'СРАВНЕНИЕ', title: 'Почему выбирают Presa', subtitle: 'Сравнение с типичными способами готовить презентации.', rowsLabel: 'Критерий', columns: ['Presa', 'Дизайнер', 'Вручную'], rows: [
      { feature: 'Скорость сборки', c1: '✓', c2: '✕', c3: '✕' }, { feature: 'Единый фирменный стиль', c1: '✓', c2: '✓', c3: '○' }, { feature: 'Стоимость на масштабе', c1: '✓', c2: '✕', c3: '✓' }, { feature: 'Правки без переверстки', c1: '✓', c2: '○', c3: '✕' }, { feature: 'Экспорт в PPTX', c1: '✓', c2: '○', c3: '✓' } ] } });

  add({ id: 'table-04', category: 'table', variantNumber: 4, layoutType: 'price_matrix', name: 'Прайс-матрица', description: 'Цены в шапке, возможности по строкам, колонка-герой', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), list('columns', 'Тарифы', 2, 3, 22), list('prices', 'Цены', 2, 3, 18), group('rows', 'Строки', mxRow, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ТАРИФЫ'), text('rowsLabel', 'Заголовок строк', 26, 'Возможности')],
    sample: { eyebrow: 'ТАРИФЫ', title: 'Тарифы и что в них входит', rowsLabel: 'Возможности', columns: ['Start', 'Team', 'Enterprise'], prices: ['0 ₽', '2 900 ₽', 'от 12 900 ₽'], rows: [
      { feature: 'Пользователей', c1: '1', c2: 'до 10', c3: 'без лимита' }, { feature: 'Шаблоны', c1: '5', c2: 'Все', c3: 'Все + кастом' }, { feature: 'AI-генерация', c1: '✕', c2: '✓', c3: '✓' }, { feature: 'Экспорт PPTX', c1: '✓', c2: '✓', c3: '✓' }, { feature: 'Хранилище', c1: '1 ГБ', c2: '50 ГБ', c3: '1 ТБ' }, { feature: 'SLA и менеджер', c1: '✕', c2: '✕', c3: '✓' } ] } });

  add({ id: 'table-05', category: 'table', variantNumber: 5, layoutType: 'role_matrix', name: 'Роли / зоны ответственности', description: 'Кто за что отвечает на каждом этапе — цветные теги', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), list('columns', 'Участники', 2, 3, 20), group('rows', 'Этапы', mxRow, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ПРОЦЕСС'), text('rowsLabel', 'Заголовок строк', 26, 'Этап работ'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'ПРОЦЕСС', title: 'Кто и за что отвечает', subtitle: 'Прозрачное распределение ролей на каждом этапе проекта.', rowsLabel: 'Этап работ', columns: ['Presa', 'Клиент', 'Подрядчик'], rows: [
      { feature: 'Бриф и цели', c1: 'Ведём', c2: 'Решает', c3: '—' }, { feature: 'Структура и текст', c1: 'Делаем', c2: 'Согласует', c3: '—' }, { feature: 'Дизайн слайдов', c1: 'Делаем', c2: 'Согласует', c3: '—' }, { feature: 'Данные и цифры', c1: 'Сверяет', c2: 'Даёт', c3: '—' }, { feature: 'Финальная сборка', c1: 'Делаем', c2: 'Принимает', c3: 'Печать' } ] } });

  add({ id: 'table-06', category: 'table', variantNumber: 6, layoutType: 'data_total', name: 'Данные с итоговой строкой', description: 'Числовая таблица с выделенной строкой итога', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('h1', 'Шапка — колонка 1', 26, 'Статья'), text('h2', 'Шапка — колонка 2', 18, 'Было'), text('h3', 'Шапка — колонка 3', 18, 'Стало'), text('h4', 'Шапка — колонка 4', 18, 'Разница'), group('rows', 'Строки', dtRow, 2, 5)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'РЕЗУЛЬТАТ'), text('subtitle', 'Подзаголовок', 90), text('totalLabel', 'Итог — подпись', 30, 'Экономия за год'), text('totalValue', 'Итог — значение', 16, '1,8 млн ₽')],
    sample: { eyebrow: 'РЕЗУЛЬТАТ', title: 'Экономика перехода на Presa', subtitle: 'Расчёт на команду из 10 человек за год.', h1: 'Статья', h2: 'Было', h3: 'Стало', h4: 'Разница', totalLabel: 'Экономия за год', totalValue: '1,8 млн ₽', rows: [
      { label: 'Часов на презентацию', c1: '12', c2: '3', c3: '−75%' }, { label: 'Стоимость дизайна, ₽/мес', c1: '180 000', c2: '29 000', c3: '−84%' }, { label: 'Срок согласования, дней', c1: '5', c2: '1', c3: '−80%' }, { label: 'Презентаций в месяц', c1: '8', c2: '22', c3: '×2,7' } ] } });

  add({ id: 'table-07', category: 'table', variantNumber: 7, layoutType: 'bar_table', name: 'Таблица с мини-барами', description: 'Метрики со значением и горизонтальной полосой', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('data', 'Метрики', btRow, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'МЕТРИКИ'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'МЕТРИКИ', title: 'Метрики после внедрения', subtitle: 'Сравнение ключевых показателей за первый квартал.', data: [
      { label: 'Скорость сборки', sub: 'презентация, часы', value: '−75%', pct: '88' }, { label: 'Соблюдение бренда', sub: 'доля слайдов в стиле', value: '96%', pct: '96' }, { label: 'Вовлечённость команды', sub: 'активных пользователей', value: '82%', pct: '82' }, { label: 'Ручная верстка', sub: 'осталось задач', value: '18%', pct: '18' } ] } });

  add({ id: 'pricing-04', category: 'pricing', variantNumber: 4, layoutType: 'tier_3_featured', name: 'Три тарифа, выделен центр', description: 'Три тарифных карточки с выделенным «популярным»', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('tiers', 'Тарифы', tierSub, 2, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ТАРИФЫ'), text('subtitle', 'Подзаголовок', 90), text('popularLabel', 'Бейдж популярного', 18, 'Популярный')],
    sample: { eyebrow: 'ТАРИФЫ', title: 'Простые и честные тарифы', subtitle: 'Без скрытых платежей. Меняйте план в любой момент.', popularLabel: 'Популярный', tiers: [
      { name: 'Start', price: '0 ₽ / мес', features: ['5 базовых шаблонов', 'Экспорт в PPTX', '1 пользователь'] }, { name: 'Team', price: '2 900 ₽ / мес', features: ['Все шаблоны и обновления', 'AI-помощник по тексту', 'До 10 пользователей', 'Брендинг и шрифты'] }, { name: 'Enterprise', price: 'по запросу', features: ['Всё из Team', 'SSO и безопасность', 'Выделенный менеджер'] } ] } });

  add({ id: 'pricing-05', category: 'pricing', variantNumber: 5, layoutType: 'tier_2_big', name: 'Два тарифа крупно', description: 'Два больших пакета: светлый и тёмный', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('tiers', 'Тарифы', tier2, 2, 2)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ТАРИФЫ'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'ТАРИФЫ', title: 'Два пакета под ваш масштаб', tiers: [
      { name: 'Team', price: '2 900 ₽ / мес', tagline: 'Всё, чтобы команда собирала презентации сама.', features: ['Все шаблоны', 'AI-помощник', 'До 10 человек', 'Брендинг', 'Экспорт PPTX', 'Приоритет-поддержка'] }, { name: 'Enterprise', price: 'от 12 900 ₽ / мес', tagline: 'Безопасность, интеграции и сопровождение.', features: ['Всё из Team', 'SSO / SAML', 'Без лимита мест', 'Кастом-шаблоны', 'API-доступ', 'Личный менеджер'] } ] } });

  add({ id: 'pricing-06', category: 'pricing', variantNumber: 6, layoutType: 'single_price', name: 'Один тариф + что входит', description: 'Крупная цена слева, чек-лист включённого справа', themeSupport: ['light'],
    requiredFields: [text('price', 'Цена', 16, '2 900 ₽'), text('per', 'Условие', 40, 'в месяц за всю команду'), list('features', 'Что входит', 4, 8, 40)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ТАРИФ'), text('title', 'Заголовок', 50), area('note', 'Примечание', 140), text('buttonLabel', 'Текст кнопки', 28, 'Попробовать 14 дней'), text('featuresLabel', 'Заголовок списка', 26, 'Что входит')],
    sample: { eyebrow: 'ТАРИФ', title: 'Одна подписка — всё включено', price: '2 900 ₽', per: 'в месяц за всю команду', note: 'Фиксированная цена до 10 человек. Без доплат за шаблоны, экспорт и обновления.', buttonLabel: 'Попробовать 14 дней', featuresLabel: 'Что входит', features: ['Все шаблоны', 'AI по тексту', 'Экспорт PPTX', 'Брендинг и шрифты', 'Совместная работа', 'Обновления', '50 ГБ хранилища', 'Приоритет-поддержка'] } });

  add({ id: 'pricing-07', category: 'pricing', variantNumber: 7, layoutType: 'value_scale', name: 'Шкала ценности «от X ₽»', description: 'Крупная стартовая цена и три ступени роста', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Ступени', scaleStep, 3, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ТАРИФЫ'), text('subtitle', 'Подзаголовок', 90), text('fromValue', 'Стартовое значение', 12, '0 ₽'), text('fromNote', 'Подпись к старту', 40, 'за старт — навсегда')],
    sample: { eyebrow: 'ТАРИФЫ', title: 'Цена растёт вместе с вами', subtitle: 'Начните бесплатно и масштабируйтесь по мере роста команды.', fromValue: '0 ₽', fromNote: 'за старт — навсегда', steps: [
      { price: '0 ₽', name: 'START', desc: 'Один пользователь, базовые шаблоны и экспорт.' }, { price: '2 900 ₽', name: 'TEAM', desc: 'Команда до 10, AI и весь набор возможностей.' }, { price: 'от 12 900 ₽', name: 'ENTERPRISE', desc: 'Без лимита мест, безопасность и менеджер.' } ] } });

  /* ===== PACK 3 — Sprint 2: case studies & comparison ===== */
  const tlStep = [text('week', 'Период', 16, 'Неделя 1'), text('title', 'Заголовок', 30), area('desc', 'Описание', 90)];
  const scaleRow = [text('label', 'Критерий', 30), text('us', 'Presa 0–100', 6, '90'), text('them', 'Другие 0–100', 6, '40')];

  add({ id: 'case-04', category: 'case_study', variantNumber: 4, layoutType: 'before_after', name: 'Кейс — до / после + KPI', description: 'Два состояния и метрики результата', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), list('before', 'Было', 2, 4, 70), list('after', 'Стало', 2, 4, 70), group('kpis', 'Результаты', statSub, 2, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'КЕЙС'), text('subtitle', 'Подзаголовок', 90), text('beforeLabel', 'Подпись «было»', 20, 'Было'), text('afterLabel', 'Подпись «стало»', 20, 'Стало')],
    sample: { eyebrow: 'КЕЙС', title: 'Как изменилась работа с презентациями', subtitle: 'Отдел продаж Mercato — до и после внедрения Presa.', beforeLabel: 'Было', afterLabel: 'Стало', before: ['Верстали каждое КП вручную в PowerPoint', 'Разный стиль у каждого менеджера', '2 дня на одно предложение'], after: ['Единый шаблон с автоподгонкой контента', 'Фирменный стиль на всех слайдах', '2 часа на готовое предложение'], kpis: [{ value: '−87%', label: 'времени на подготовку' }, { value: '×3,4', label: 'предложений в месяц' }, { value: '+22%', label: 'конверсия в сделку' }] } });

  add({ id: 'case-05', category: 'case_study', variantNumber: 5, layoutType: 'quote_result', name: 'Кейс — отзыв + результат', description: 'Цитата клиента и панель метрик', themeSupport: ['light', 'dark'],
    requiredFields: [area('quote', 'Цитата', 180), text('author', 'Имя', 36), group('stats', 'Результаты', statSub, 2, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'КЕЙС'), text('role', 'Должность', 40), text('logo', 'Инициал/лого', 2, 'M')],
    sample: { eyebrow: 'КЕЙС', quote: 'Presa сократила подготовку коммерческих предложений с двух дней до пары часов — и качество стало ровным во всём отделе.', author: 'Анна Котова', role: 'Руководитель продаж, Mercato', logo: 'M', stats: [{ value: '−75%', label: 'времени на КП' }, { value: '4,9', label: 'оценка отдела' }, { value: '12', label: 'менеджеров в работе' }] } });

  add({ id: 'case-06', category: 'case_study', variantNumber: 6, layoutType: 'case_timeline', name: 'Кейс — таймлайн внедрения', description: 'Этапы внедрения по неделям', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('milestones', 'Этапы', tlStep, 3, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'КЕЙС'), text('subtitle', 'Подзаголовок', 90), text('resultValue', 'Итог — значение', 16, '−75% времени')],
    sample: { eyebrow: 'КЕЙС', title: 'Путь от брифа до результата', subtitle: 'Внедрение заняло один месяц без остановки работы отдела.', resultValue: '−75% времени', milestones: [{ week: 'Неделя 1', title: 'Бриф и аудит', desc: 'Собрали шаблоны и фирменный стиль клиента.' }, { week: 'Неделя 2', title: 'Настройка', desc: 'Завели брендбук, шрифты и библиотеку слайдов.' }, { week: 'Неделя 3', title: 'Обучение', desc: 'Команда собрала первые КП самостоятельно.' }, { week: 'Неделя 4', title: 'Результат', desc: 'Вышли на стабильный поток предложений.' }] } });

  add({ id: 'case-07', category: 'case_study', variantNumber: 7, layoutType: 'case_result_photo', name: 'Кейс — результат + фото', description: 'Визуал слева, задача/решение и 3 KPI справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 60), area('challenge', 'Задача', 120), area('solution', 'Решение', 120), group('kpis', 'Результаты', statSub, 3, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'КЕЙС'), image('image', 'Изображение'), text('imageLabel', 'Подпись к визуалу', 30)],
    sample: { eyebrow: 'КЕЙС · NORDWAVE', title: 'Аналитика, которую покупают с первого слайда', challenge: 'Презентации продукта собирались неделями и выглядели по-разному.', solution: 'Единый набор шаблонов с автоподгонкой данных под бренд.', imageLabel: 'Скриншот: библиотека КП', kpis: [{ value: '−55%', label: 'срок подготовки' }, { value: '+18%', label: 'конверсия демо' }, { value: '120+', label: 'слайдов в библиотеке' }] } });

  add({ id: 'comparison-05', category: 'comparison', variantNumber: 5, layoutType: 'vs_columns', name: 'Сравнение — мы vs они', description: 'Две колонки «с / без» с разделителем VS', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('winLabel', 'Заголовок «за»', 30, 'С Presa'), list('winItems', 'Плюсы', 2, 5, 46), text('loseLabel', 'Заголовок «без»', 30, 'Без Presa'), list('loseItems', 'Минусы', 2, 5, 46)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'СРАВНЕНИЕ'), text('winSub', 'Подпись «за»', 50), text('loseSub', 'Подпись «без»', 50)],
    sample: { eyebrow: 'СРАВНЕНИЕ', title: 'С Presa и без неё', winLabel: 'С Presa', winSub: 'Команда собирает презентации сама', loseLabel: 'Без Presa', loseSub: 'Ручная вёрстка и подрядчики', winItems: ['Минуты на готовый слайд', 'Единый фирменный стиль', 'Правки без переверстки', 'Экспорт в PPTX в один клик'], loseItems: ['Часы и дни на презентацию', 'Разный стиль у каждого', 'Любая правка — заново', 'Зависимость от дизайнера'] } });

  add({ id: 'comparison-06', category: 'comparison', variantNumber: 6, layoutType: 'transformation', name: 'Сравнение — до → после', description: 'Трансформация состояния со стрелкой и метриками', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), text('beforeTitle', 'Было — заголовок', 60), area('beforeText', 'Было — текст', 100), text('afterTitle', 'Стало — заголовок', 60), area('afterText', 'Стало — текст', 100), group('kpis', 'Метрики', statSub, 3, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'СРАВНЕНИЕ')],
    sample: { eyebrow: 'СРАВНЕНИЕ', title: 'Что меняется после перехода', beforeTitle: 'Презентация — это проект на неделю', beforeText: 'Брифы, дизайнер, бесконечные правки и разный результат.', afterTitle: 'Презентация — это задача на час', afterText: 'Выбрал шаблон, заполнил, выгрузил. Стиль — единый.', kpis: [{ value: '−80%', label: 'срока подготовки' }, { value: '×3', label: 'больше презентаций' }, { value: '100%', label: 'в фирменном стиле' }] } });

  add({ id: 'comparison-07', category: 'comparison', variantNumber: 7, layoutType: 'criteria_scale', name: 'Сравнение — шкала по критериям', description: 'Позиции «мы / они» на шкалах по критериям', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('rows', 'Критерии', scaleRow, 3, 5)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'СРАВНЕНИЕ'), text('subtitle', 'Подзаголовок', 90), text('usLabel', 'Подпись «мы»', 24, 'Presa'), text('themLabel', 'Подпись «они»', 30, 'Дизайнер / вручную')],
    sample: { eyebrow: 'СРАВНЕНИЕ', title: 'Presa против привычных способов', subtitle: 'Позиция по ключевым критериям — чем правее, тем лучше.', usLabel: 'Presa', themLabel: 'Дизайнер / вручную', rows: [{ label: 'Скорость', us: '92', them: '32' }, { label: 'Единый стиль', us: '96', them: '48' }, { label: 'Стоимость на масштабе', us: '88', them: '28' }, { label: 'Гибкость правок', us: '90', them: '40' }] } });

  /* ===== PACK 4 — Sprint 3: roadmap, team, process ===== */
  const rmCol = [text('q', 'Период', 14, 'Q1'), text('tag', 'Метка', 16, 'Сейчас'), list('items', 'Пункты', 1, 3, 40)];
  const vmRow = [text('w', 'Период', 10, '2025'), text('heading', 'Заголовок', 30), area('text', 'Описание', 90)];
  const gtRow = [text('label', 'Направление', 30), text('start', 'Старт 0–100', 6, '0'), text('width', 'Длина 0–100', 6, '50'), text('note', 'Подпись на полосе', 14)];
  const phCol = [text('lab', 'Метка', 18, 'Сейчас'), text('heading', 'Заголовок', 24), list('items', 'Пункты', 1, 4, 36)];
  const tmMember = [text('initials', 'Инициалы', 3, 'ИП'), text('name', 'Имя', 28), text('role', 'Роль', 32), text('bio', 'О человеке', 40)];
  const ldMember = [text('initials', 'Инициалы', 3, 'АК'), text('name', 'Имя', 26), text('role', 'Роль', 30)];
  const paStep = [text('title', 'Заголовок', 28), area('desc', 'Описание', 90)];
  const cyStep = [text('heading', 'Шаг', 26), area('text', 'Описание', 80)];
  const poStep = [text('title', 'Этап', 28), area('desc', 'Описание', 70), text('owner', 'Ответственный', 24), text('ownerRole', 'Роль', 24)];

  add({ id: 'roadmap-04', category: 'roadmap', variantNumber: 4, layoutType: 'roadmap_quarters', name: 'Карта — таймлайн по кварталам', description: 'Горизонтальные вехи по кварталам с прогрессом', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('cols', 'Кварталы', rmCol, 3, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ROADMAP'), text('subtitle', 'Подзаголовок', 90), text('done', 'Сделано колонок', 2, '2')],
    sample: { eyebrow: 'ROADMAP', title: 'Куда движется продукт', subtitle: 'План развития Presa на ближайший год.', done: '2', cols: [{ q: 'Q1', tag: 'Запущено', items: ['Конструктор слайдов', 'Экспорт в PPTX'] }, { q: 'Q2', tag: 'Сейчас', items: ['Библиотека 120+ шаблонов', 'Брендинг и шрифты'] }, { q: 'Q3', tag: 'Скоро', items: ['AI-помощник по тексту', 'Совместная работа'] }, { q: 'Q4', tag: 'Планы', items: ['Интеграции и API', 'Аналитика просмотров'] }] } });

  add({ id: 'roadmap-05', category: 'roadmap', variantNumber: 5, layoutType: 'roadmap_milestones', name: 'Карта — вертикальные вехи', description: 'Вехи развития списком на вертикальной линии', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('milestones', 'Вехи', vmRow, 3, 5)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ROADMAP'), text('done', 'Достигнуто вех', 2, '2')],
    sample: { eyebrow: 'ROADMAP', title: 'Этапы развития', done: '2', milestones: [{ w: '2024', heading: 'Запуск', text: 'Конструктор и базовая библиотека шаблонов' }, { w: '2025', heading: 'Рост', text: 'AI-генерация, брендинг и командная работа' }, { w: '2026', heading: 'Масштаб', text: 'Интеграции, API и аналитика просмотров' }, { w: '2027', heading: 'Платформа', text: 'Маркетплейс шаблонов и партнёрская сеть' }] } });

  add({ id: 'roadmap-06', category: 'roadmap', variantNumber: 6, layoutType: 'roadmap_gantt', name: 'Карта — Gantt-полосы', description: 'Полосы работ по кварталам', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), list('periods', 'Периоды', 3, 4, 8), group('rows', 'Направления', gtRow, 2, 5)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ROADMAP'), text('rowsLabel', 'Заголовок строк', 26, 'Направление')],
    sample: { eyebrow: 'ROADMAP', title: 'План работ по кварталам', rowsLabel: 'Направление', periods: ['Q1', 'Q2', 'Q3', 'Q4'], rows: [{ label: 'Библиотека шаблонов', start: '0', width: '50', note: 'Готово' }, { label: 'AI-помощник', start: '25', width: '45', note: 'В работе' }, { label: 'Командная работа', start: '50', width: '30', note: 'Релиз Q3' }, { label: 'Интеграции и API', start: '75', width: '25', note: 'Q4' }] } });

  add({ id: 'roadmap-07', category: 'roadmap', variantNumber: 7, layoutType: 'roadmap_phases', name: 'Карта — сейчас / скоро / потом', description: 'Три горизонта развития в колонках', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('phases', 'Горизонты', phCol, 3, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'ROADMAP'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'ROADMAP', title: 'Три горизонта развития', phases: [{ lab: 'Сейчас', heading: 'В продукте', items: ['Конструктор слайдов', '120+ шаблонов', 'Экспорт в PPTX', 'Брендинг и шрифты'] }, { lab: 'Скоро', heading: 'Q3–Q4', items: ['AI-помощник по тексту', 'Совместная работа', 'Комментарии и роли'] }, { lab: 'Потом', heading: '2027', items: ['Интеграции и API', 'Аналитика просмотров', 'Маркетплейс шаблонов'] }] } });

  add({ id: 'team-04', category: 'team', variantNumber: 4, layoutType: 'team_grid_6', name: 'Команда — сетка 3×2 с фото', description: 'До шести участников с ролью и био', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('members', 'Команда', tmMember, 2, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'TEAM'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'TEAM', title: 'Кто за этим стоит', subtitle: 'Команда продукта, дизайна и продаж.', members: [{ initials: 'ИП', name: 'Иван Петров', role: 'CEO · стратегия', bio: '10 лет в B2B-SaaS' }, { initials: 'АК', name: 'Анна Котова', role: 'Product', bio: 'Ведёт развитие продукта' }, { initials: 'ДЛ', name: 'Дмитрий Лис', role: 'Design', bio: 'Дизайн-система и шаблоны' }, { initials: 'ЕС', name: 'Елена Сорокина', role: 'Sales', bio: 'Корпоративные клиенты' }, { initials: 'МР', name: 'Максим Рожков', role: 'Engineering', bio: 'Конструктор и экспорт' }, { initials: 'ОВ', name: 'Ольга Власова', role: 'Customer', bio: 'Внедрение и поддержка' }] } });

  add({ id: 'team-05', category: 'team', variantNumber: 5, layoutType: 'team_lead', name: 'Команда — лидер + команда', description: 'Флагман-лидер с цитатой и сетка команды', themeSupport: ['light'],
    requiredFields: [text('leadInitials', 'Инициалы лидера', 3, 'ИП'), text('leadName', 'Имя лидера', 26), text('leadRole', 'Роль лидера', 30), group('members', 'Команда', ldMember, 2, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'TEAM'), text('title', 'Заголовок', 50), area('leadQuote', 'Цитата лидера', 160)],
    sample: { eyebrow: 'TEAM', title: 'Команда основателей', leadInitials: 'ИП', leadName: 'Иван Петров', leadRole: 'Сооснователь и CEO', leadQuote: '«Мы делаем так, чтобы любая команда собирала презентации уровня агентства — за минуты, а не за дни.»', members: [{ initials: 'АК', name: 'Анна Котова', role: 'Product Lead' }, { initials: 'ДЛ', name: 'Дмитрий Лис', role: 'Head of Design' }, { initials: 'МР', name: 'Максим Рожков', role: 'CTO' }, { initials: 'ЕС', name: 'Елена Сорокина', role: 'Head of Sales' }] } });

  add({ id: 'team-06', category: 'team', variantNumber: 6, layoutType: 'team_quote_split', name: 'Команда — цитата основателя', description: 'Тёмный сплит: цитата слева, сетка справа', themeSupport: ['light'],
    requiredFields: [area('quote', 'Цитата', 160), text('author', 'Имя', 30), group('members', 'Команда', ldMember, 2, 4)],
    optionalFields: [text('role', 'Роль', 36), text('authorInitials', 'Инициалы', 3, 'ИП')],
    sample: { quote: 'Хорошая презентация не должна быть привилегией тех, у кого есть дизайнер.', author: 'Иван Петров', role: 'Сооснователь, CEO', authorInitials: 'ИП', members: [{ initials: 'АК', name: 'Анна Котова', role: 'Product' }, { initials: 'ДЛ', name: 'Дмитрий Лис', role: 'Design' }, { initials: 'МР', name: 'Максим Рожков', role: 'Engineering' }, { initials: 'ЕС', name: 'Елена Сорокина', role: 'Sales' }] } });

  add({ id: 'team-07', category: 'team', variantNumber: 7, layoutType: 'team_trust', name: 'Команда — доверие в цифрах', description: 'Сетка участников и полоса метрик доверия', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('members', 'Команда', ldMember, 3, 4), group('stats', 'Метрики', statSub, 2, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'TEAM')],
    sample: { eyebrow: 'TEAM', title: 'Команда, которой доверяют', members: [{ initials: 'ИП', name: 'Иван Петров', role: 'CEO' }, { initials: 'АК', name: 'Анна Котова', role: 'Product' }, { initials: 'ДЛ', name: 'Дмитрий Лис', role: 'Design' }, { initials: 'МР', name: 'Максим Рожков', role: 'CTO' }], stats: [{ value: '12 лет', label: 'средний опыт в B2B' }, { value: '500+', label: 'клиентов на платформе' }, { value: '4,9', label: 'оценка поддержки' }] } });

  add({ id: 'process-04', category: 'process', variantNumber: 4, layoutType: 'process_arrows', name: 'Процесс — шаги со стрелками', description: 'Горизонтальные карточки-шаги со стрелками', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Шаги', paStep, 3, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'PROCESS'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'PROCESS', title: 'Как мы работаем', subtitle: 'От первого брифа до готовой презентации.', steps: [{ title: 'Бриф', desc: 'Согласуем цель, аудиторию и ключевые сообщения' }, { title: 'Структура', desc: 'Собираем сценарий и подбираем шаблоны' }, { title: 'Сборка', desc: 'Наполняем слайды контентом в фирменном стиле' }, { title: 'Готово', desc: 'Выгружаем в PPTX и передаём с правками' }] } });

  add({ id: 'process-05', category: 'process', variantNumber: 5, layoutType: 'process_cycle', name: 'Процесс — круговой цикл', description: 'Кольцо этапов и расшифровка списком', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Этапы', cyStep, 3, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'PROCESS'), text('centerLabel', 'Подпись в центре', 12, 'Presa')],
    sample: { eyebrow: 'PROCESS', title: 'Цикл непрерывного улучшения', centerLabel: 'Presa', steps: [{ heading: 'Собрать', text: 'Готовим презентацию из шаблонов за минуты' }, { heading: 'Показать', text: 'Делимся ссылкой или выгружаем в PPTX' }, { heading: 'Измерить', text: 'Смотрим, какие слайды работают лучше' }, { heading: 'Улучшить', text: 'Обновляем шаблоны и повторяем цикл' }] } });

  add({ id: 'process-06', category: 'process', variantNumber: 6, layoutType: 'process_owners', name: 'Процесс — шаги + ответственный', description: 'Нумерованные этапы с владельцем на каждом', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('steps', 'Этапы', poStep, 3, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'PROCESS'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'PROCESS', title: 'Этапы и ответственные', subtitle: 'Прозрачно: кто ведёт каждый шаг проекта.', steps: [{ title: 'Бриф и цели', desc: 'Собираем требования и аудиторию', owner: 'Елена С.', ownerRole: 'Account' }, { title: 'Контент', desc: 'Готовим структуру и тексты', owner: 'Анна К.', ownerRole: 'Product' }, { title: 'Дизайн', desc: 'Собираем слайды в фирменном стиле', owner: 'Дмитрий Л.', ownerRole: 'Design' }, { title: 'Сдача', desc: 'Выгрузка, правки и передача', owner: 'Ольга В.', ownerRole: 'Customer' }] } });

  /* ===== PACK 4 — Sprint 4: charts ===== */
  add({ id: 'chart-06', category: 'chart', variantNumber: 6, layoutType: 'chart_donut2', name: 'Диаграмма — donut + легенда', description: 'Структура целого: кольцо и легенда с долями', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('data', 'Доли', chartSub, 2, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'DATA'), text('subtitle', 'Подзаголовок', 90), text('centerValue', 'Значение в центре', 12, '₽184М'), text('centerLabel', 'Подпись в центре', 20, 'за год')],
    sample: { eyebrow: 'DATA', title: 'Структура выручки', subtitle: 'Из чего складывается доход платформы.', centerValue: '₽184М', centerLabel: 'за год', data: [{ label: 'Подписки', value: '54' }, { label: 'Enterprise', value: '28' }, { label: 'Услуги', value: '18' }] } });

  add({ id: 'chart-07', category: 'chart', variantNumber: 7, layoutType: 'bar_horizontal', name: 'Диаграмма — горизонт. бары', description: 'Горизонтальные столбцы со значениями', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('data', 'Данные', barSub, 3, 6)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'DATA'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'DATA', title: 'Источники новых клиентов', subtitle: 'Доля каналов привлечения за квартал.', data: [{ label: 'Рекомендации', value: '92' }, { label: 'Контент-маркетинг', value: '74' }, { label: 'Прямые продажи', value: '58' }, { label: 'Реклама', value: '36' }, { label: 'Партнёры', value: '22' }] } });

  add({ id: 'chart-08', category: 'chart', variantNumber: 8, layoutType: 'chart_trend', name: 'Диаграмма — тренд', description: 'Крупное значение и кривая роста', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), text('bigValue', 'Главное значение', 12, '2 480'), group('data', 'Точки', chartSub, 3, 8)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'DATA'), text('delta', 'Динамика', 14, '+218% YoY')],
    sample: { eyebrow: 'DATA', title: 'Рост активных команд', bigValue: '2 480', delta: '+218% YoY', data: [{ label: 'Q1·24', value: '8' }, { label: 'Q2', value: '12' }, { label: 'Q3', value: '14' }, { label: 'Q4', value: '20' }, { label: 'Q1·25', value: '24' }, { label: 'Q2', value: '32' }, { label: 'Q3·25', value: '38' }] } });

  /* ===== PACK 4 — Sprint 4: contact ===== */
  add({ id: 'contact-04', category: 'contact', variantNumber: 4, layoutType: 'cta_qr', name: 'Контакты — CTA с QR', description: 'Призыв слева, QR-панель справа', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 60), text('buttonLabel', 'Кнопка / ссылка', 30, 'presa.io / start')],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'Следующий шаг'), area('subtitle', 'Подзаголовок', 120), text('qrCaption', 'Подпись под QR', 36, 'наведите камеру телефона')],
    sample: { eyebrow: 'Следующий шаг', title: 'Соберите первую презентацию сегодня', subtitle: 'Отсканируйте код — откроется демо-конструктор с готовыми шаблонами.', buttonLabel: 'presa.io / start', qrCaption: 'наведите камеру телефона' } });

  add({ id: 'contact-05', category: 'contact', variantNumber: 5, layoutType: 'contact_map', name: 'Контакты — реквизиты + город', description: 'Список контактов и стилизованная карта', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('items', 'Контакты', contactSub, 2, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'Contact'), text('city', 'Город / адрес', 40, 'Москва · Кутузовский, 12')],
    sample: { eyebrow: 'Contact', title: 'Давайте на связи', city: 'Москва · Кутузовский, 12', items: [{ label: 'Почта', value: 'hello@presa.io' }, { label: 'Телефон', value: '+7 999 000-00-00' }, { label: 'Сайт', value: 'presa.io' }] } });

  add({ id: 'contact-06', category: 'contact', variantNumber: 6, layoutType: 'cta_accent', name: 'Контакты — финал на акценте', description: 'Полноцветный финальный слайд с чипами', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 70), list('chips', 'Контакты-чипы', 2, 4, 30)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 36, 'Спасибо за внимание'), area('subtitle', 'Подзаголовок', 140)],
    sample: { eyebrow: 'Спасибо за внимание', title: 'Соберём вашу презентацию вместе', subtitle: 'Напишите нам — подготовим демо под вашу задачу за один день.', chips: ['hello@presa.io', '+7 999 000-00-00', 'presa.io'] } });

  /* ===== PACK 4 — Sprint 4: numbers & solution ===== */
  const progSub = [text('pct', 'Процент 0–100', 6, '82'), text('heading', 'Заголовок', 24), text('desc', 'Подпись', 36)];
  const flowSub = [text('text', 'Пункт', 44)];
  const layerSub = [text('heading', 'Заголовок', 30), area('text', 'Описание', 80)];

  add({ id: 'numbers-08', category: 'numbers', variantNumber: 8, layoutType: 'progress_rings', name: 'Цифры — прогресс к цели', description: 'Кольца прогресса с процентами', themeSupport: ['light', 'dark'],
    requiredFields: [text('title', 'Заголовок', 50), group('rings', 'Кольца', progSub, 2, 4)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'Numbers'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'Numbers', title: 'Динамика по целям года', subtitle: 'Где мы находимся по ключевым показателям.', rings: [{ pct: '82', heading: 'Удержание', desc: 'клиентов через год' }, { pct: '94', heading: 'SLA', desc: 'ответы в срок' }, { pct: '68', heading: 'Доля рынка', desc: 'в сегменте SMB' }] } });

  add({ id: 'solution-09', category: 'solution', variantNumber: 9, layoutType: 'solution_flow', name: 'Решение — схема вход → хаб → выход', description: 'Превращение входа в результат через хаб', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('inputs', 'Было', flowSub, 2, 3), group('outputs', 'Стало', flowSub, 2, 3)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'Solution'), text('subtitle', 'Подзаголовок', 90), text('hubLabel', 'Хаб — название', 14, 'Presa'), text('hubSub', 'Хаб — подпись', 16, 'движок'), text('inputsLabel', 'Подпись входа', 24, 'Было — вход'), text('outputsLabel', 'Подпись выхода', 28, 'Стало — результат')],
    sample: { eyebrow: 'Solution', title: 'Как Presa меняет процесс', subtitle: 'Превращаем разрозненную работу в один управляемый поток.', hubLabel: 'Presa', hubSub: 'движок', inputsLabel: 'Было — вход', outputsLabel: 'Стало — результат', inputs: [{ text: 'Ручная вёрстка слайдов' }, { text: 'Разрозненные шаблоны' }, { text: 'Правки через дизайнера' }], outputs: [{ text: 'Готовый дек за минуты' }, { text: 'Единый фирменный стиль' }, { text: 'Правки без переверстки' }] } });

  add({ id: 'solution-10', category: 'solution', variantNumber: 10, layoutType: 'solution_layers', name: 'Решение — слой за слоем', description: 'Нумерованные слои решения', themeSupport: ['light'],
    requiredFields: [text('title', 'Заголовок', 50), group('layers', 'Слои', layerSub, 3, 5)],
    optionalFields: [text('eyebrow', 'Надзаголовок', 30, 'Solution'), text('subtitle', 'Подзаголовок', 90)],
    sample: { eyebrow: 'Solution', title: 'Решение из четырёх слоёв', layers: [{ heading: 'Библиотека шаблонов', text: '120+ раскладок по категориям под любой слайд' }, { heading: 'Автоподгонка контента', text: 'Текст и данные сами укладываются в макет' }, { heading: 'Бренд-слой', text: 'Шрифты, цвета и логотип применяются ко всему деку' }, { heading: 'Экспорт', text: 'Готовый PPTX или ссылка в один клик' }] } });

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
    steps: 5, timeline: 5, pricing: 3, compare: 6, table: 6, team: 6,
    cards_band: 6, feature_rows: 5,
    chart_bar: 8, chart_line: 8, chart_donut: 6,
    con_services: 6, con_process: 5, con_projects: 3, con_numbers: 4, con_why: 4, con_about: 3, con_cover: 2,
    kpi_dashboard: 4, stat_hero: 3, bar_compare: 6, ring_kpis: 3, feature_matrix: 6, section_divider: 1,
    feature_matrix_priced: 6, compare_check: 6, price_matrix: 6, role_matrix: 6, data_total: 5, bar_table: 6,
    tier_3_featured: 3, tier_2_big: 2, single_price: 8, value_scale: 3,
    before_after: 4, quote_result: 3, case_timeline: 4, case_result_photo: 3, vs_columns: 5, transformation: 3, criteria_scale: 5,
    roadmap_quarters: 4, roadmap_milestones: 5, roadmap_gantt: 5, roadmap_phases: 3, team_grid_6: 6, team_lead: 4, team_quote_split: 4, team_trust: 4, process_arrows: 4, process_cycle: 4, process_owners: 4,
    chart_donut2: 6, bar_horizontal: 6, chart_trend: 8,
    cta_qr: 1, contact_map: 4, cta_accent: 4,
    progress_rings: 4, solution_flow: 3, solution_layers: 5
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
