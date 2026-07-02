import Link from "next/link";
import { Brand } from "./Brand";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 h-[68px] border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-6 px-7">
        <Link href="/"><Brand /></Link>
        <nav className="hidden items-center gap-7 md:flex">
          <a href="#how" className="text-[14.5px] font-semibold text-ink-muted hover:text-ink">Как это работает</a>
          <a href="#benefits" className="text-[14.5px] font-semibold text-ink-muted hover:text-ink">Возможности</a>
          <a href="#types" className="text-[14.5px] font-semibold text-ink-muted hover:text-ink">Типы презентаций</a>
          <Link href="/generator" className="text-[14.5px] font-semibold text-ink-muted hover:text-ink">Генератор</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/generator" className="btn btn-ghost !px-3.5 !py-2 !text-[13.5px]">Войти</Link>
          <Link href="/generator" className="btn btn-primary !px-3.5 !py-2 !text-[13.5px]">Создать презентацию</Link>
        </div>
      </div>
    </header>
  );
}
