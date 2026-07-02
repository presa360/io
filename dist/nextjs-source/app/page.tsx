import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";

const steps = [
  ["01", "Заполните бриф", "Компания, сфера, цель, аудитория и стиль. Пара минут — и контекст готов."],
  ["02", "ИИ строит структуру", "Модель собирает логику повествования: проблема, решение, ценность, призыв."],
  ["03", "Смотрите превью", "Тексты слайдов, тезисы, заметки спикера и подсказки по визуалу — сразу на экране."],
  ["04", "Скачивайте PPTX", "Аккуратный корпоративный шаблон 16:9. Открывается в PowerPoint и Keynote."],
];

const benefits = [
  ["Скорость вместо рутины", "То, что занимало полдня в редакторе, готово за минуты."],
  ["Логичная структура", "ИИ выстраивает повествование по проверенным сценариям продаж и питчей."],
  ["Готовый PPTX", "Редактируемый файл с титулом, заголовками, тезисами и нумерацией слайдов."],
  ["Заметки спикера", "К каждому слайду — подсказки, что говорить. Удобно для питчей и вебинаров."],
  ["Корпоративный тон", "Ясно, по-деловому, без штампов. Несколько стилей на выбор."],
  ["Два языка", "Русский и английский «из коробки» — для локального и международного рынка."],
];

const types = [
  ["SALES", "Коммерческое предложение", "Проблема клиента, решение, выгода и условия."],
  ["COMPANY", "Презентация компании", "Кто вы, чем сильны, кейсы и команда."],
  ["STARTUP", "Pitch deck", "Рынок, проблема, продукт, тяга и команда."],
  ["PEOPLE", "HR-презентация", "Онбординг, ценности, бренд работодателя."],
  ["REPORT", "Отчёт", "Итоги периода, метрики и выводы без перегруза."],
  ["WEBINAR", "Вебинар", "Сценарий выступления с тезисами и заметками."],
];

export default function HomePage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-7 md:grid-cols-2">
          <div>
            <span className="eyebrow">AI Presentation Builder</span>
            <h1 className="mt-5 text-[clamp(36px,6vw,56px)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              Создавайте корпоративные презентации <span className="text-red">с ИИ за минуты</span>
            </h1>
            <p className="mt-6 max-w-[530px] text-[19px] leading-relaxed text-ink-muted">
              Опишите компанию, продукт и цель — Presa соберёт структуру, напишет тексты слайдов и
              отдаст готовый файл PPTX. Без шаблонной «воды» и часов в редакторе.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/generator" className="btn btn-primary !px-6 !py-3.5 !text-base">Создать презентацию →</Link>
              <Link href="/generator" className="btn btn-ghost !px-6 !py-3.5 !text-base">Посмотреть пример</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`relative aspect-[16/10] overflow-hidden rounded-lg border border-border p-3 ${i === 0 ? "bg-ink" : "bg-white"}`}>
                  <div className="absolute left-0 top-0 h-full w-1 bg-red" />
                  <div className={`ml-1 mb-2 h-1.5 w-2/3 rounded ${i === 0 ? "bg-white" : "bg-ink"}`} />
                  <div className={`ml-1 mb-1.5 h-1 w-full rounded ${i === 0 ? "bg-white/25" : "bg-[#e4e7eb]"}`} />
                  <div className={`ml-1 h-1 w-3/5 rounded ${i === 0 ? "bg-white/25" : "bg-[#e4e7eb]"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24">
        <div className="mx-auto max-w-[1200px] px-7">
          <span className="eyebrow">Как это работает</span>
          <h2 className="mt-4 text-[40px] font-extrabold tracking-tight">Готовая презентация за четыре шага</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {steps.map(([n, t, d]) => (
              <div key={n}>
                <div className="font-mono text-[13px] font-semibold text-red">{n}</div>
                <h3 className="mt-4 text-[19px] font-extrabold">{t}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-y border-border bg-subtle py-24">
        <div className="mx-auto max-w-[1200px] px-7 text-center">
          <span className="eyebrow justify-center">Возможности</span>
          <h2 className="mt-4 text-[40px] font-extrabold tracking-tight">Почему команды выбирают Presa</h2>
          <div className="mt-12 grid gap-[18px] text-left md:grid-cols-3">
            {benefits.map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border bg-white p-6 shadow-soft">
                <h3 className="text-[18px] font-extrabold">{t}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types */}
      <section id="types" className="py-24">
        <div className="mx-auto max-w-[1200px] px-7 text-center">
          <span className="eyebrow justify-center">Сценарии</span>
          <h2 className="mt-4 text-[40px] font-extrabold tracking-tight">Под любой формат деловой презентации</h2>
          <div className="mt-12 grid gap-[18px] text-left md:grid-cols-3">
            {types.map(([tag, t, d]) => (
              <Link key={t} href="/generator" className="group rounded-xl border border-border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="font-mono text-[11px] text-ink-faint">// {tag}</div>
                <h3 className="mt-3.5 text-[20px] font-extrabold">{t}</h3>
                <p className="mt-2 text-[14px] leading-snug text-ink-muted">{d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-7">
          <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#15181f] to-[#0c0e12] px-14 py-16">
            <div className="relative flex flex-wrap items-center justify-between gap-10">
              <div>
                <h2 className="max-w-[560px] text-[38px] font-extrabold text-white">Соберите первую презентацию прямо сейчас</h2>
                <p className="mt-3.5 max-w-[480px] text-[17px] text-white/65">Заполните короткий бриф и получите готовую структуру со слайдами и файлом PPTX.</p>
              </div>
              <Link href="/generator" className="btn btn-primary !px-6 !py-3.5 !text-base">Создать презентацию →</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
