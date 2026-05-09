"use client";

import { Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { useJerseyStore } from "@/lib/store";

export function LogosTab() {
  const { logoDataUrl, setLogo } = useJerseyStore();
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (PNG/JPG/SVG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran logo maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {logoDataUrl ? (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid h-20 w-20 place-items-center rounded-lg bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoDataUrl} alt="Logo" className="max-h-full max-w-full" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Logo terupload</p>
            <p className="text-xs text-slate-500">Logo akan tampil di bagian dada jersey.</p>
          </div>
          <button
            onClick={() => setLogo(null)}
            className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
            aria-label="Hapus logo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-10 text-slate-500 transition hover:border-sky-400 hover:bg-sky-50/50"
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm font-medium">Upload Logo</span>
          <span className="text-[11px]">PNG / JPG / SVG — maks 2MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
