"use client";

import { Download, FileImage, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { buildDesignSheet } from "@/lib/jerseyTexture";
import { Panel } from "./ui/Panel";

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
    <Panel
      icon={<FileImage className="h-[18px] w-[18px]" />}
      title="Ekspor Desain"
      desc="Unduh atau cetak lembar desain (tampak depan & belakang)."
    >
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition hover:border-line-strong hover:bg-paper disabled:opacity-60"
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
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition hover:border-line-strong hover:bg-paper disabled:opacity-60"
        >
          {busy === "print" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          Print Design
        </button>
      </div>
    </Panel>
  );
}
