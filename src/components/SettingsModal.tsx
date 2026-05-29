"use client";

import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  clearSettings,
  getSettings,
  MODEL_HINTS,
  saveSettings,
  type AppSettings,
} from "@/lib/settings";

const PROVIDERS: { value: AppSettings["provider"]; label: string }[] = [
  { value: "", label: "Default (server)" },
  { value: "freepik", label: "Freepik / Magnific" },
  { value: "kieai", label: "KieAI" },
  { value: "mock", label: "Mock (tanpa API)" },
];

const FREEPIK_MODELS = [
  "seedream-v4-5-edit",
  "nano-banana-pro",
  "nano-banana",
];

// Model KieAI yang cocok untuk edit (foto + jersey -> orang pakai jersey).
const KIEAI_MODELS = [
  "google/nano-banana-edit",
  "nano-banana-pro",
  "google/nano-banana",
  "bytedance/seedream-v4-edit",
];

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [provider, setProvider] = useState<AppSettings["provider"]>("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [show, setShow] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setProvider(s.provider);
    setApiKey(s.apiKey);
    setModel(s.model);
  }, []);

  function handleSave() {
    saveSettings({ provider, apiKey: apiKey.trim(), model: model.trim() });
    setSavedNote(true);
    setTimeout(() => {
      setSavedNote(false);
      onClose();
    }, 800);
  }

  function handleReset() {
    clearSettings();
    setProvider("");
    setApiKey("");
    setModel("");
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink/55 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white">
              <KeyRound className="h-4 w-4" />
            </div>
            <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-ink">
              Setelan API
            </h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-mute transition hover:bg-paper"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              Provider AI
            </label>
            <select
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as AppSettings["provider"])
              }
              className="jg-input"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {provider !== "mock" && (
            <>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Tempel API key di sini…"
                    className="jg-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                    aria-label="Tampilkan key"
                  >
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  Model{" "}
                  <span className="font-medium normal-case text-ink-soft">
                    (opsional)
                  </span>
                </label>
                {provider === "freepik" ? (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="jg-input"
                  >
                    <option value="">Default ({MODEL_HINTS.freepik})</option>
                    {FREEPIK_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : provider === "kieai" ? (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="jg-input"
                  >
                    <option value="">Default ({MODEL_HINTS.kieai})</option>
                    {KIEAI_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder={MODEL_HINTS[provider] || "default"}
                    className="jg-input"
                  />
                )}
              </div>
            </>
          )}

          <p className="rounded-lg bg-paper px-3 py-2.5 text-[11px] leading-relaxed text-ink-mute">
            <strong className="text-ink">Catatan:</strong> key disimpan di browser
            ini saja (localStorage) &amp; dipakai untuk generate dari perangkat ini.
            Untuk semua pengunjung situs, set juga lewat Environment Variable di
            Vercel. Kosongkan provider = pakai setelan server.
          </p>
        </div>

        <div className="flex gap-2 border-t border-line px-5 py-4">
          <button
            onClick={handleReset}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink-mute transition hover:bg-paper"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
          >
            {savedNote ? "Tersimpan ✓" : "Simpan Setelan"}
          </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
