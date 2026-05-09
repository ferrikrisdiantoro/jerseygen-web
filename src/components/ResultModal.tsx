"use client";

import { Download, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="aspect-[3/4] w-full bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Hasil generate" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-3 p-5">
          <h3 className="text-lg font-bold text-slate-900">Hasil Generate Kamu</h3>
          <p className="text-sm text-slate-600">
            Belum sesuai? Klik tombol generate lagi untuk hasil baru, atau ubah desain dulu.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Generate Lagi
            </button>
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
