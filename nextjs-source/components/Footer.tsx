import Link from "next/link";
import { Brand } from "./Brand";

const cols = [
  { h: "Продукт", links: ["Генератор", "Как это работает", "Возможности", "Сценарии"] },
  { h: "Компания", links: ["О нас", "Блог", "Карьера", "Контакты"] },
  { h: "Ресурсы", links: ["Документация", "Шаблоны", "Поддержка", "Статус"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto max-w-[1200px] px-7">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <Link href="/"><Brand /></Link>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-ink-muted">
              AI-сервис для корпоративных презентаций. Бриф → структура → готовый PPTX.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="font-mono text-[13px] font-medium uppercase tracking-wide text-ink-faint">{c.h}</h4>
              {c.links.map((l) => (
                <a key={l} href="#" className="mt-3 block text-[14.5px] text-ink-muted hover:text-red">{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-11 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[13px] text-ink-faint">
          <span>© 2026 Presa. Все права защищены.</span>
          <span className="font-mono">Сделано для B2B-команд</span>
        </div>
      </div>
    </footer>
  );
}
