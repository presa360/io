"use client";

import { useState } from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SlidePreview } from "@/components/SlidePreview";
import { THEMES } from "@/lib/themes";
import type { GenerateRequest, Presentation, Tone, Language } from "@/types/presentation";

const GOALS = [
  "Коммерческое предложение", "Презентация компании", "Pitch deck для инвесторов",
  "HR-презентация", "Отчёт о результатах", "Вебинар / выступление",
  "Запуск продукта", "Партнёрская презентация",
];
const TONES: { id: Tone; label: string }[] = [
  { id: "tech", label: "Tech" }, { id: "modern", label: "Современный" },
  { id: "strict", label: "Строгий" }, { id: "minimal", label: "Минималистичный" },
  { id: "premium", label: "Premium" }, { id: "corporate", label: "Corporate" },
];
const LANGS: { id: Language; label: string }[] = [
  { id: "ru", label: "Русский" }, { id: "en", label: "English" },
];

type View = "form" | "loading" | "result";

export default function GeneratorPage() {
  const [view, setView] = useState<View>("form");
  const [form, setForm] = useState<GenerateRequest>({
    companyName: "", industry: "", presentationGoal: GOALS[0],
    targetAudience: "", slideCount: 10, tone: "tech", language: "ru", additionalInfo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [themeKey, setThemeKey] = useState<Tone>("tech");
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const set = <K extends keyof GenerateRequest>(k: K, v: GenerateRequest[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  async function handleGenerate() {
    setError(null);
    setView("loading");
    try {
      const res = await fetch("/api/generate-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setError(data.error || "Не удалось сгенерировать презентацию");
        setView("form");
        return;
      }
      setPresentation(data as Presentation);
      setThemeKey(form.tone);
      setCurrent(0);
      setView("result");
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
      setView("form");
    }
  }

  async function handleDownload() {
    if (!presentation) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/export-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentation, tone: themeKey }),
      });
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.presentationTitle || "presentation"} — Presa.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Не удалось скачать PPTX");
    } finally {
      setDownloading(false);
    }
  }

  const theme = THEMES[themeKey];

  return (
    <div className="min-h-screen bg-subtle">
      {/* App bar */}
      <header className="sticky top-0 z-40 h-[60px] border-b border-border bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-ink-muted hover:text-ink">← На главную</Link>
            <span className="h-6 w-px bg-border" />
            <Brand />
          </div>
          {view === "result" && (
            <div className="flex items-center gap-2.5">
              <button onClick={() => setView("form")} className="btn btn-ghost !px-3.5 !py-2 !text-[13.5px]">Новый бриф</button>
              <button onClick={handleDownload} disabled={downloading} className="btn btn-primary !px-3.5 !py-2 !text-[13.5px] disabled:opacity-60">
                {downloading ? "Сборка…" : "Скачать PPTX"}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-6 py-9 pb-20">
        {error && view === "form" && (
          <div className="mx-auto mb-4 max-w-[760px] rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-[13px] font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}
        {view === "form" && (
          <div>
            <div className="mx-auto mb-7 max-w-[640px] text-center">
              <h1 className="text-[34px] font-extrabold tracking-tight">Расскажите о презентации</h1>
              <p className="mt-3 text-base text-ink-muted">Заполните короткий бриф — Presa соберёт структуру, тексты и готовый PPTX.</p>
            </div>
            <div className="mx-auto max-w-[760px] overflow-hidden rounded-[26px] border border-border bg-white shadow-md">
              <div className="flex items-center gap-3 border-b border-border px-7 py-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red text-sm font-bold text-white">1</span>
                <div>
                  <h2 className="text-[18px] font-extrabold">Бриф презентации</h2>
                  <p className="text-[13px] text-ink-faint">Поля со звёздочкой обязательны</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 p-7 sm:grid-cols-2">
                <Field label="Название компании" required error={errors.companyName}>
                  <input className={inputCls(errors.companyName)} placeholder="Например, Nordwave" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
                </Field>
                <Field label="Сфера бизнеса" required error={errors.industry}>
                  <input className={inputCls(errors.industry)} placeholder="IT и SaaS, финансы, ритейл…" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
                </Field>
                <Field label="Цель презентации" required error={errors.presentationGoal}>
                  <select className={inputCls(errors.presentationGoal)} value={form.presentationGoal} onChange={(e) => set("presentationGoal", e.target.value)}>
                    {GOALS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Целевая аудитория" required error={errors.targetAudience}>
                  <input className={inputCls(errors.targetAudience)} placeholder="CFO, отделы закупок, инвесторы…" value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} />
                </Field>

                <div className="sm:col-span-2">
                  <label className="text-[13px] font-bold">Стиль презентации</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button key={t.id} onClick={() => set("tone", t.id)} className={segCls(form.tone === t.id)}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-bold">Количество слайдов</label>
                  <div className="mt-2 inline-flex items-center overflow-hidden rounded-[9px] border-[1.5px] border-border bg-subtle">
                    <button onClick={() => set("slideCount", Math.max(5, form.slideCount - 1))} className="h-[42px] w-10 text-lg text-ink-muted hover:text-red">−</button>
                    <span className="min-w-[52px] text-center font-bold">{form.slideCount}</span>
                    <button onClick={() => set("slideCount", Math.min(16, form.slideCount + 1))} className="h-[42px] w-10 text-lg text-ink-muted hover:text-red">+</button>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-bold">Язык презентации</label>
                  <div className="mt-2 flex gap-2">
                    {LANGS.map((l) => (
                      <button key={l.id} onClick={() => set("language", l.id)} className={segCls(form.language === l.id)}>{l.label}</button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Дополнительная информация">
                    <textarea className={`${inputCls()} min-h-[92px] resize-y`} placeholder="Ключевые продукты, цифры, преимущества, особые требования…" value={form.additionalInfo} onChange={(e) => set("additionalInfo", e.target.value)} />
                  </Field>
                </div>

                <div className="sm:col-span-2 mt-1 flex items-center justify-between gap-4">
                  <span className="text-[12.5px] text-ink-faint">Генерация занимает несколько секунд</span>
                  <button onClick={handleGenerate} className="btn btn-primary !px-6 !py-3.5 !text-base">Сгенерировать презентацию</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {view === "loading" && (
          <div className="mx-auto max-w-[760px] rounded-[26px] border border-border bg-white p-12 text-center shadow-md">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-red-50 border-t-red" />
            <h2 className="text-[22px] font-extrabold">Собираем вашу презентацию</h2>
            <p className="mt-2 text-ink-muted">Presa анализирует бриф и пишет слайды…</p>
          </div>
        )}

        {/* RESULT */}
        {view === "result" && presentation && (
          <div>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-5">
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight">{presentation.presentationTitle}</h1>
                <p className="mt-1.5 text-[15px] text-ink-muted">{presentation.presentationSubtitle}</p>
              </div>
              <button onClick={handleDownload} disabled={downloading} className="btn btn-primary !px-6 !py-3.5 !text-base disabled:opacity-60">
                {downloading ? "Сборка PPTX…" : "Скачать PPTX"}
              </button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[12.5px] font-bold text-ink-faint">СТИЛЬ:</span>
              {TONES.map((t) => (
                <button key={t.id} onClick={() => setThemeKey(t.id)} className={`rounded-full border-[1.5px] px-3 py-1.5 text-[12.5px] font-semibold transition ${themeKey === t.id ? "border-red bg-red-50 text-red" : "border-border bg-white text-ink-muted hover:text-ink"}`}>
                  {THEMES[t.id].name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_372px]">
              {/* Stage */}
              <div className="lg:sticky lg:top-[84px] self-start">
                <div className="rounded-xl border border-border bg-white p-4 shadow-md">
                  <div className="overflow-hidden rounded-lg border border-border shadow-soft">
                    <SlidePreview slide={presentation.slides[current]} theme={theme} total={presentation.slides.length} />
                  </div>
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="font-mono text-[13px] text-ink-muted">Слайд {current + 1} из {presentation.slides.length}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} className="flex h-9 w-9 items-center justify-center rounded-[9px] border-[1.5px] border-border text-ink-muted hover:border-red hover:text-red disabled:opacity-40">←</button>
                      <button onClick={() => setCurrent(Math.min(presentation.slides.length - 1, current + 1))} disabled={current === presentation.slides.length - 1} className="flex h-9 w-9 items-center justify-center rounded-[9px] border-[1.5px] border-border text-ink-muted hover:border-red hover:text-red disabled:opacity-40">→</button>
                    </div>
                  </div>
                  <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-2">
                    {presentation.slides.map((s, i) => (
                      <button key={i} onClick={() => setCurrent(i)} className={`relative w-[116px] flex-none overflow-hidden rounded-md border-2 ${i === current ? "border-red" : "border-transparent"}`}>
                        <span className="absolute left-1 top-1 z-10 rounded bg-black/55 px-1.5 font-mono text-[9px] font-semibold text-white">{String(i + 1).padStart(2, "0")}</span>
                        <SlidePreview slide={s} theme={theme} total={presentation.slides.length} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side: slide content cards */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[15px] font-extrabold">Содержание слайдов</h3>
                  <span className="font-mono text-xs text-ink-faint">{presentation.slides.length} шт.</span>
                </div>
                <div className="flex flex-col gap-3">
                  {presentation.slides.map((s, i) => (
                    <button key={i} onClick={() => setCurrent(i)} className={`rounded-xl border bg-white p-4 text-left transition ${i === current ? "border-red ring-2 ring-red-50" : "border-border hover:border-[#DADDE3]"}`}>
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <span className="rounded bg-red px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">{String(s.slideNumber).padStart(2, "0")}</span>
                        <span className="font-mono text-[10.5px] uppercase tracking-wide text-ink-faint">{s.layout === "title" ? "Титул" : s.layout === "cta" ? "Призыв" : "Контент"}</span>
                      </div>
                      <h4 className="text-[15px] font-extrabold">{s.title}</h4>
                      {s.bullets.length > 0 && (
                        <ul className="mt-2.5 flex list-none flex-col gap-1.5 p-0">
                          {s.bullets.map((b, j) => (
                            <li key={j} className="relative pl-4 text-[13px] leading-snug text-ink-muted before:absolute before:left-0 before:top-[7px] before:h-[5px] before:w-[5px] before:rounded-[1.5px] before:bg-red before:content-['']">{b}</li>
                          ))}
                        </ul>
                      )}
                      {s.speakerNotes && (
                        <div className="mt-3 border-t border-dashed border-border pt-2.5">
                          <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-faint">Заметки спикера</div>
                          <p className="text-[12.5px] italic leading-relaxed text-ink-muted">{s.speakerNotes}</p>
                        </div>
                      )}
                      {s.visualSuggestion && (
                        <div className="mt-2 text-[11.5px] text-ink-faint">⊙ {s.visualSuggestion}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-[13px] font-bold">
        {label}{required && <span className="text-red">*</span>}
      </label>
      {children}
      {error && <span className="text-xs font-semibold text-red">{error}</span>}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-[9px] border-[1.5px] bg-subtle px-3.5 py-2.5 text-[14.5px] outline-none transition focus:border-red focus:bg-white focus:ring-4 focus:ring-red-50 ${error ? "border-red" : "border-border"}`;
}
function segCls(on: boolean) {
  return `rounded-[9px] border-[1.5px] px-3.5 py-2 text-[13.5px] font-semibold transition ${on ? "border-red bg-red text-white shadow-red" : "border-border bg-subtle text-ink-muted hover:text-ink"}`;
}
