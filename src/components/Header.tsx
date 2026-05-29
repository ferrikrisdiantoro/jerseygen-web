import { SettingsButton } from "./SettingsButton";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        
        {/* Sisi Kiri: Logo */}
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

        {/* Sisi Kanan: Navigasi + Settings */}
        <div className="flex flex-1 items-center justify-end gap-6">
          <nav className="hidden items-center gap-6 text-sm font-bold text-ink-mute md:flex">
            <a href="/cara-pakai" className="transition hover:text-ink hover:font-extrabold">Cara Pakai</a>
            <a href="/faq" className="transition hover:text-ink hover:font-extrabold">FAQ</a>
          </nav>
          
          <div className="font-bold">
            <SettingsButton />
          </div>
        </div>

      </div>
    </header>
  );
}