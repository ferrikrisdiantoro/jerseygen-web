"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { FileImage, Loader2, Download, Printer } from "lucide-react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { buildDesignSheet, handlePrintPattern } from "@/lib/jerseyTexture";

export function ExportBar() {
  const store = useJerseyStore();
  const [busy, setBusy] = useState<"download" | "print" | null>(null);

  async function handleDownload() {
    try {
      setBusy("download");
      const state = extractJerseyState(store);
      const url = await buildDesignSheet(state as any);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jersey-design-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error("Download Error:", err);
      alert("Gagal membuat file desain.");
    } finally {
      setBusy(null);
    }
  }

  async function handlePrintClick() {
    // Pastikan ID ini cocok dengan div penampung pola di komponen utama Anda
    const PRINT_CONTAINER_ID = "print-pattern-container";
    
    setBusy("print");
    try {
      await handlePrintPattern(PRINT_CONTAINER_ID);
    } catch (err) {
      console.error("Print Error:", err);
      alert("Gagal mencetak pola. Pastikan container pola tersedia.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      icon={<FileImage className="h-[18px] w-[18px]" />}
      title="Ekspor Desain"
      desc="Unduh desain untuk preview atau cetak pola untuk produksi."
    >
      <div className="grid grid-cols-2 gap-2">
        
        <button
  onClick={handlePrintClick}
  disabled={busy !== null}
  className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition hover:border-line-strong hover:bg-paper disabled:opacity-60"
>
  {busy === "print" ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Download className="h-4 w-4" /> // Ikon Printer diganti menjadi Download
  )}
  Download Pattern
</button>
      </div>
    </Panel>
  );
}