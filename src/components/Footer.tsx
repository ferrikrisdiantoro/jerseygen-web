import { Shirt } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-7 sm:flex-row">
        <div className="flex-1">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/assets/snica.png" alt="SNICA" className="h-9 w-auto" />
            <span className="font-display text-lg font-extrabold uppercase tracking-tight flex items-center">
  JERSEY
  {/* Menghapus ml-1 agar GEN menempel rapat dengan JER */}
  <span className="relative inline-flex items-center justify-center text-accent">
    GEN
    <svg
      className="absolute bottom-0 left-0 w-full" 
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
  </span>
</span>
          </a>
        </div>
        <p className="text-xs text-ink-soft">
          © {new Date().getFullYear()} JerseyGen · Original Project Jp Corporate 
        </p>
      </div>
    </footer>
  );
}
