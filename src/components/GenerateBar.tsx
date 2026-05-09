"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { useJerseyStore } from "@/lib/store";
import { svgElementToPngDataUrl } from "@/lib/svgToPng";
import {
  clearEmail,
  getEmail,
  getFreeQuota,
  getUsedCount,
  incrementUsed,
  setEmail,
} from "@/lib/quota";
import { ResultModal } from "./ResultModal";

export function GenerateBar({ svgRef }: { svgRef: RefObject<SVGSVGElement> }) {
  const jersey = useJerseyStore();
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
    if (jersey.useFace && !jersey.userPhotoDataUrl) {
      setError("Toggle 'pakai muka sendiri' aktif — silakan upload foto kamu dulu.");
      return;
    }
    if (!svgRef.current) {
      setError("Preview belum siap, coba lagi sebentar.");
      return;
    }

    try {
      setBusy(true);
      const previewDataUrl = await svgElementToPngDataUrl(svgRef.current, 800);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jersey: {
            design: jersey.design,
            primaryColor: jersey.primaryColor,
            secondaryColor: jersey.secondaryColor,
            accentColor: jersey.accentColor,
            playerName: jersey.playerName,
            playerNumber: jersey.playerNumber,
            sponsorText: jersey.sponsorText,
            logoDataUrl: jersey.logoDataUrl,
            size: jersey.size,
            useFace: jersey.useFace,
            userPhotoDataUrl: jersey.userPhotoDataUrl,
          },
          jerseyPreviewDataUrl: previewDataUrl,
        }),
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
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Kuota generate gratis: {remaining} / {quota}
          </span>
          {email ? (
            <button
              onClick={switchAccount}
              className="font-medium text-sky-600 hover:underline"
            >
              Ganti akun
            </button>
          ) : (
            <span className="text-slate-400">Login email untuk mulai</span>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sedang generate, mohon tunggu…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate dengan AI
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}
      </div>

      {emailModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            onSubmit={submitEmail}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-900">Mulai Generate</h3>
            <p className="mt-1 text-sm text-slate-600">
              Masukkan email untuk klaim kuota gratis kamu.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="kamu@email.com"
              className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
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
