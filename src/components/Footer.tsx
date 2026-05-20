import { Shirt } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-7 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-ink text-white">
            <Shirt className="h-4 w-4" />
          </div>
          <span className="font-display text-sm font-extrabold uppercase tracking-tight text-ink">
            Jersey<span className="text-accent">Gen</span>
          </span>
        </div>
        <p className="text-xs text-ink-soft">
          © {new Date().getFullYear()} JerseyGen · Dibuat untuk pencinta sepak bola.
        </p>
      </div>
    </footer>
  );
}
