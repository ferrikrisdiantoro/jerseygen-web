"use client";

import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { exportFrontPng } from "@/lib/jerseyTexture";
import { getSettings } from "@/lib/settings";
import { ResultModal } from "./ResultModal";
import { Panel } from "./ui/Panel";

export function GenerateBar() {
  const store = useJerseyStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);

    if (store.useFace && !store.userPhotoDataUrl) {
      setError("Toggle 'pakai muka sendiri' aktif — silakan upload foto kamu dulu.");
      return;
    }

    try {
      setBusy(true);
      const jersey = extractJerseyState(store);
      const previewDataUrl = await exportFrontPng(jersey);
      const settings = getSettings();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jersey,
          jerseyPreviewDataUrl: previewDataUrl,
          provider: settings.provider || undefined,
          apiKey: settings.apiKey || undefined,
          model: settings.model || undefined,
        }),
      });

      const json = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok || !json.imageUrl) {
        throw new Error(json.error || "Generate gagal");
      }
      setResult(json.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Panel
        icon={<Wand2 className="h-[18px] w-[18px]" />}
        title="Generate dengan AI"
        desc="Lihat hasil orang memakai jersey custom buatanmu."
        tone="accent"
      >
        <button
          onClick={handleGenerate}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-card transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sedang generate, mohon tunggu…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Sekarang
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}
        <p className="mt-3 text-[11px] text-ink-soft">
          Generate memakai API key yang diatur di tombol ⚙️ Setelan (atau
          environment variable). Hasil bisa di-generate ulang sepuasnya.
        </p>
      </Panel>

      {result && <ResultModal imageUrl={result} onClose={() => setResult(null)} />}
    </>
  );
}
