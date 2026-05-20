import { ArrowDown, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* decorative accent blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by AI
          </span>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.98] tracking-tight text-balance sm:text-6xl">
            Desain Jersey.{" "}
            <span className="relative inline-block text-accent">
              Generate
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 9C40 3 160 3 198 9"
                  stroke="#ff5b04"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            Pemakainya.
          </h1>

          <p className="mt-5 max-w-xl text-sm text-ink-mute sm:text-base">
            Rancang jersey futsal/bola dalam 3D — pattern, warna, nama, nomor,
            logo. Upload fotomu, AI tampilkan hasilnya kamu memakai jersey custom
            buatanmu sendiri.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#designer"
              className="group flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-accent-dark"
            >
              Mulai Desain
              <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
            </a>
            <a
              href="#how"
              className="rounded-xl border border-line bg-surface px-6 py-3.5 text-sm font-bold text-ink transition hover:border-line-strong"
            >
              Lihat Cara Pakai
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-ink-soft">
            <span>Preview 3D Real-time</span>
            <span className="hidden h-1 w-1 rounded-full bg-ink-soft sm:block" />
            <span>Pattern &amp; Logo Custom</span>
            <span className="hidden h-1 w-1 rounded-full bg-ink-soft sm:block" />
            <span>Generate Gratis</span>
          </div>
        </div>
      </div>
    </section>
  );
}
