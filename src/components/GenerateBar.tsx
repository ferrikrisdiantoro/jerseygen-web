"use client";

import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { exportPsdFrontPng } from "@/lib/psd";
import { getSettings } from "@/lib/settings";
import { useUiStore } from "@/lib/ui";
import { ResultModal } from "./ResultModal";
import { ApiKeyErrorModal, type ApiKeyErrorCode } from "./ApiKeyErrorModal";
import { Panel } from "./ui/Panel";

interface KeyError {
  code: ApiKeyErrorCode;
  message: string;
}

/**
 * Downsample a data-URL image so we don't send 5-10 MB photos to the AI provider
 * (KieAI throws server-500 on huge payloads). Re-encodes as JPEG.
 */
async function downsampleDataUrl(
  dataUrl: string,
  maxWidth = 1024,
  quality = 0.88,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(dataUrl);
        return;
      }
      const ratio = maxWidth / img.width;
      const c = document.createElement("canvas");
      c.width = maxWidth;
      c.height = Math.round(img.height * ratio);
      const ctx = c.getContext("2d");
      if (!ctx) return reject(new Error("Canvas tidak tersedia"));
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Gagal membaca foto"));
    img.src = dataUrl;
  });
}

export function GenerateBar() {
  const store = useJerseyStore();
  const openSettings = useUiStore((s) => s.openSettings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<KeyError | null>(null);

  async function handleGenerate() {
    setError(null);

    if (store.useFace && !store.userPhotoDataUrl) {
      setError("Toggle 'pakai muka sendiri' aktif — silakan upload foto kamu dulu.");
      return;
    }

    try {
      setBusy(true);
      const jersey = extractJerseyState(store);
      const previewDataUrl = await exportPsdFrontPng(jersey);
      // shrink the face photo so total POST payload stays under a few MB
      const jerseyForApi = jersey.userPhotoDataUrl
        ? {
            ...jersey,
            userPhotoDataUrl: await downsampleDataUrl(
              jersey.userPhotoDataUrl,
              1024,
            ),
          }
        : jersey;
      const settings = getSettings();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jersey: jerseyForApi,
          jerseyPreviewDataUrl: previewDataUrl,
          provider: settings.provider || undefined,
          apiKey: settings.apiKey || undefined,
          model: settings.model || undefined,
        }),
      });

      const json = (await res.json()) as {
        imageUrl?: string;
        error?: string;
        code?: string;
      };

      if (!res.ok || !json.imageUrl) {
        if (json.code === "quota" || json.code === "auth") {
          setKeyError({ code: json.code, message: json.error || "" });
          return;
        }
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

      {keyError && (
        <ApiKeyErrorModal
          code={keyError.code}
          rawMessage={keyError.message}
          onClose={() => setKeyError(null)}
          onOpenSettings={() => {
            setKeyError(null);
            openSettings();
          }}
        />
      )}
    </>
  );
}
