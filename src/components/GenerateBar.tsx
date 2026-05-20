"use client";

import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { exportFrontPng } from "@/lib/jerseyTexture";
import {
  clearEmail,
  getEmail,
  getFreeQuota,
  getUsedCount,
  incrementUsed,
  setEmail,
} from "@/lib/quota";
import { ResultModal } from "./ResultModal";
import { Panel } from "./ui/Panel";

export function GenerateBar() {
  const store = useJerseyStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [used, setUsed] = useState(0);
  const [email, setEmailState] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const quota = getFreeQuota();

  useEffect(() => {
    setUsed(getUsedCount());
    setEmailState(getEmail());
  }, []);

  const remaining = Math.max(quota - used, 0);

  async function handleGenerate() {
    setError(null);

    if (!email) {
      setEmailModalOpen(true);
      return;
    }
    if (remaining <= 0) {
      setError("Kuota gratis sudah habis. Login dengan akun lain untuk lanjut generate.");
      return;
    }
    if (store.useFace && !store.userPhotoDataUrl) {
      setError("Toggle 'pakai muka sendiri' aktif — silakan upload foto kamu dulu.");
      return;
    }

    try {
      setBusy(true);
      const jersey = extractJerseyState(store);
      const previewDataUrl = await exportFrontPng(jersey);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jersey, jerseyPreviewDataUrl: previewDataUrl }),
      });

      const json = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok || !json.imageUrl) {
        throw new Error(json.error || "Generate gagal");
      }

      incrementUsed();
      setUsed(getUsedCount());
      setResult(json.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const v = emailInput.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      alert("Format email tidak valid");
      return;
    }
    setEmail(v);
    setEmailState(v);
    setEmailModalOpen(false);
    setEmailInput("");
  }

  function switchAccount() {
    clearEmail();
    setEmailState(null);
    setUsed(0);
  }

  return (
    <>
      <Panel
        icon={<Wand2 className="h-[18px] w-[18px]" />}
        title="Generate dengan AI"
        desc="Lihat hasil orang memakai jersey custom buatanmu."
        tone="accent"
      >
        <div className="mb-3 flex items-center justify-between rounded-xl bg-paper/70 px-3 py-2.5 text-xs">
          <span className="font-bold text-ink">
            Kuota gratis:{" "}
            <span className="text-accent">{remaining}</span> / {quota}
          </span>
          {email ? (
            <button
              onClick={switchAccount}
              className="font-bold text-accent transition hover:text-accent-dark"
            >
              Ganti akun
            </button>
          ) : (
            <span className="text-ink-soft">Login email untuk mulai</span>
          )}
        </div>

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
      </Panel>

      {emailModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={submitEmail}
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-pop"
          >
            <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-ink">
              Mulai Generate
            </h3>
            <p className="mt-1 text-sm text-ink-mute">
              Masukkan email untuk klaim kuota gratis kamu.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="kamu@email.com"
              className="jg-input mt-4"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-paper"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
              >
                Lanjut
              </button>
            </div>
          </form>
        </div>
      )}

      {result && <ResultModal imageUrl={result} onClose={() => setResult(null)} />}
    </>
  );
}
