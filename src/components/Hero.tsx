import { Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 pb-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
        <Sparkles className="h-3.5 w-3.5" /> Powered by AI
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Desain Jersey Kamu, <br className="sm:hidden" />
        <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
          Lihat Hasilnya Dipakai
        </span>
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
        Pilih design, warna, nomor punggung, dan logo. Upload foto kamu, AI akan
        generate hasil kamu memakai jersey custom — dalam hitungan detik.
      </p>
    </section>
  );
}
