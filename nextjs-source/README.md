# Presa — AI Presentation Builder

Сервис для создания корпоративных презентаций с помощью ИИ: пользователь заполняет
короткий бриф (компания, сфера, цель, аудитория, стиль, язык), модель возвращает
структуру презентации в строгом JSON, а сервис собирает готовый файл **PPTX**.

Стек: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Node API routes · pptxgenjs**.

---

## Возможности

- Лендинг с описанием сервиса (`/`)
- Генератор презентаций с формой и предпросмотром слайдов (`/generator`)
- AI-генерация структуры через любой **OpenAI-совместимый** Chat Completions API
- Генерация **PPTX** на сервере (16:9, корпоративный шаблон, заметки спикера, нумерация)
- Валидация формы и понятные ошибки, если AI-ключ не задан или ответ некорректен

---

## Быстрый старт

Требуется Node.js 18.17+.

```bash
# 1. Установить зависимости
npm install

# 2. Создать локальный .env и заполнить ключи
cp .env.example .env.local

# 3. Запустить дев-сервер
npm run dev
```

Откройте <http://localhost:3000>.

---

## Переменные окружения

Создайте `.env.local` на основе `.env.example`:

| Переменная     | Обязательна | Описание                                                            |
| -------------- | ----------- | ------------------------------------------------------------------- |
| `AI_API_KEY`   | да          | Ключ AI-провайдера. **Не коммитьте реальный ключ.**                 |
| `AI_MODEL`     | нет         | Идентификатор модели (по умолчанию `gpt-4o-mini`).                  |
| `AI_BASE_URL`  | нет         | Базовый URL API (по умолчанию `https://api.openai.com/v1`).         |

Подходит любой провайдер с эндпоинтом `/chat/completions` (OpenAI, OpenRouter,
Together, локальный gateway и т.д.) — достаточно поменять `AI_BASE_URL` и `AI_MODEL`.

Если `AI_API_KEY` не задан, `/api/generate-presentation` вернёт **503** с понятным
сообщением, а форма покажет ошибку — приложение не падает.

---

## Скрипты

```bash
npm run dev     # дев-сервер с hot reload
npm run build   # продакшн-сборка
npm run start   # запуск собранного приложения
npm run lint    # ESLint
```

---

## Деплой на Vercel

1. Запушьте репозиторий на GitHub/GitLab.
2. На <https://vercel.com> → **New Project** → импортируйте репозиторий.
3. В **Settings → Environment Variables** добавьте `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`.
4. Нажмите **Deploy**. Vercel сам определит Next.js — дополнительная конфигурация не нужна.

> Роуты PPTX и генерации используют `runtime = "nodejs"` (нужен Node, не Edge), так как
> `pptxgenjs` работает с Node Buffer.

---

## Архитектура

```
nextjs-source/
├─ app/
│  ├─ layout.tsx                      # корневой layout, шрифты, метаданные
│  ├─ globals.css                     # Tailwind + базовые стили
│  ├─ page.tsx                        # лендинг
│  ├─ generator/page.tsx              # клиентская страница генератора (форма → результат)
│  └─ api/
│     ├─ generate-presentation/route.ts   # POST: бриф → AI → Presentation JSON
│     └─ export-pptx/route.ts             # POST: Presentation JSON → .pptx
├─ components/
│  ├─ Brand.tsx                       # логотип/марка
│  ├─ SiteNav.tsx                     # навигация лендинга
│  ├─ Footer.tsx                      # футер
│  └─ SlidePreview.tsx                # рендер одного слайда 16:9 (предпросмотр)
├─ lib/
│  ├─ ai.ts                           # промт + вызов AI + парсинг/валидация ответа
│  ├─ pptx.ts                         # сборка PPTX через pptxgenjs (server)
│  ├─ themes.ts                       # визуальные темы (общий контракт с превью)
│  └─ validation.ts                   # валидация и нормализация формы
├─ types/presentation.ts             # общие типы
├─ .env.example
├─ tailwind.config.ts
├─ next.config.mjs
└─ package.json
```

### Поток данных

1. **Форма** (`/generator`) собирает `GenerateRequest` и шлёт `POST /api/generate-presentation`.
2. Роут валидирует ввод (`lib/validation`), затем вызывает `lib/ai.generatePresentation`,
   который отправляет системный + пользовательский промт в модель и требует строгий JSON.
3. Ответ парсится и нормализуется в объект `Presentation` (защита от «грязного» JSON).
4. Фронтенд показывает слайды (предпросмотр + карточки контента, тезисы, заметки спикера).
5. Кнопка **«Скачать PPTX»** шлёт `POST /api/export-pptx`; `lib/pptx` собирает файл и
   возвращает его как вложение.

### Контракт JSON, который возвращает модель

```json
{
  "presentationTitle": "string",
  "presentationSubtitle": "string",
  "slides": [
    {
      "slideNumber": 1,
      "layout": "title | content | cta",
      "title": "string",
      "subtitle": "string",
      "bullets": ["string", "string", "string"],
      "speakerNotes": "string",
      "visualSuggestion": "string"
    }
  ]
}
```

---

## Лицензия

MIT — используйте и дорабатывайте свободно.
