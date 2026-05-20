"use client";

import { Download, RotateCcw, X } from "lucide-react";

export function ResultModal({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  async function handleDownload() {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jerseygen-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface/95 text-ink shadow-card transition hover:bg-surface"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="aspect-[3/4] w-full bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Hasil generate" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-3 p-5">
          <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            Hasil AI
          </span>
          <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-ink">
            Jersey Kamu Sudah Jadi
          </h3>
          <p className="text-sm text-ink-mute">
            Belum sesuai? Generate lagi untuk hasil baru, atau ubah desainnya dulu.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-paper"
            >
              <RotateCcw className="h-4 w-4" /> Generate Lagi
            </button>
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
