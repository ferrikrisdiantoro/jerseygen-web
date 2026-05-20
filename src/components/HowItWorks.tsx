import { Camera, Palette, Sparkles } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Palette,
    title: "Desain Jersey",
    desc: "Pilih pattern, warna, tambahkan nama, nomor punggung, logo, dan teks bebas — semua dalam 3D.",
  },
  {
    n: "02",
    icon: Camera,
    title: "Upload Foto",
    desc: "Aktifkan toggle 'pakai muka sendiri' lalu upload fotomu. Tanpa foto pun tetap bisa.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Generate AI",
    desc: "Klik Generate, AI menampilkan hasil orang memakai jersey custom buatanmu.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Cara Pakai
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-ink sm:text-4xl">
            Tiga Langkah Saja
          </h2>
          <p className="mt-2 text-sm text-ink-mute">
            Dari desain kosong sampai hasil AI — kurang dari satu menit.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="group relative overflow-hidden rounded-2xl border border-line bg-paper/50 p-6 transition hover:border-accent/50"
            >
              <span className="absolute -right-2 -top-3 font-display text-7xl font-extrabold text-line">
                {s.n}
              </span>
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white transition group-hover:bg-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-display text-lg font-extrabold uppercase tracking-tight text-ink">
                  {s.title}
                </p>
                <p className="mt-1.5 text-sm text-ink-mute">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
