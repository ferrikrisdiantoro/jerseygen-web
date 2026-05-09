import { Shirt, ShoppingBag, User } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Shirt className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">JerseyGen</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              AI Custom Jersey
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#designer" className="hover:text-slate-900">
            Designer
          </a>
          <a href="#how" className="hover:text-slate-900">
            Cara Pakai
          </a>
          <a href="#faq" className="hover:text-slate-900">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            aria-label="Akun"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <User className="h-5 w-5" />
          </button>
          <button
            aria-label="Keranjang"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
