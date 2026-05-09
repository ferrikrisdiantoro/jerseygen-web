import { Camera, Palette, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Palette,
    title: "1. Desain Jersey",
    desc: "Pilih design, warna, tambahkan nama, nomor punggung, dan logo sesuai kreasimu.",
  },
  {
    icon: Camera,
    title: "2. Upload Foto (Opsional)",
    desc: "Aktifkan toggle 'pakai muka sendiri' lalu upload foto kamu. Tanpa foto pun bisa.",
  },
  {
    icon: Sparkles,
    title: "3. Generate",
    desc: "Klik Generate, AI akan menampilkan hasil orang memakai jersey custommu.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-1 text-center text-2xl font-extrabold tracking-tight text-slate-900">
        Cara Pakai
      </h2>
      <p className="mb-8 text-center text-sm text-slate-600">
        Tiga langkah, kurang dari satu menit.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-600">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-bold text-slate-900">{s.title}</p>
            <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
