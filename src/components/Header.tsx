import { Shirt } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
            <Shirt className="h-[18px] w-[18px]" />
          </div>
          <span className="font-display text-lg font-extrabold uppercase tracking-tight">
            Jersey<span className="text-accent">Gen</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-mute md:flex">
          <a href="#designer" className="transition hover:text-ink">
            Designer
          </a>
          <a href="#how" className="transition hover:text-ink">
            Cara Pakai
          </a>
          <a href="#faq" className="transition hover:text-ink">
            FAQ
          </a>
        </nav>

        <a
          href="#designer"
          className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-ink/85"
        >
          Mulai Desain
        </a>
      </div>
    </header>
  );
}
