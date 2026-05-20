"use client";

import { Download, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { buildDesignSheet } from "@/lib/jerseyTexture";

export function ExportBar() {
  const store = useJerseyStore();
  const [busy, setBusy] = useState<"download" | "print" | null>(null);

  async function handleDownload() {
    try {
      setBusy("download");
      const url = await buildDesignSheet(extractJerseyState(store));
      const a = document.createElement("a");
      a.href = url;
      a.download = `jersey-design-${Date.now()}.png`;
      a.click();
    } catch {
      alert("Gagal membuat file desain.");
    } finally {
      setBusy(null);
    }
  }

  async function handlePrint() {
    try {
      setBusy("print");
      const url = await buildDesignSheet(extractJerseyState(store));
      const w = window.open("", "_blank");
      if (!w) {
        alert("Popup diblokir. Izinkan popup untuk mencetak.");
        return;
      }
      w.document.write(`
        <html>
          <head><title>Print Jersey Design</title></head>
          <body style="margin:0;display:flex;align-items:center;justify-content:center;">
            <img src="${url}" style="max-width:100%;height:auto;"
                 onload="window.focus();window.print();" />
          </body>
        </html>
      `);
      w.document.close();
    } catch {
      alert("Gagal menyiapkan cetakan.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-1 text-sm font-bold text-slate-900">Ekspor Desain</p>
      <p className="mb-3 text-xs text-slate-500">
        Unduh atau cetak lembar desain jersey (tampak depan &amp; belakang).
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy === "download" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PNG
        </button>
        <button
          onClick={handlePrint}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy === "print" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          Print Design
        </button>
      </div>
    </div>
  );
}
