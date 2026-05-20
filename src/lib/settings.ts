"use client";

const KEY = "jerseygen_settings_v1";

export interface AppSettings {
  /** "" = pakai default dari server (env var). */
  provider: "" | "kieai" | "freepik" | "mock";
  apiKey: string;
  model: string;
}

const DEFAULTS: AppSettings = { provider: "", apiKey: "", model: "" };

export function getSettings(): AppSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: AppSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSettings() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

/** Saran model default per provider (ditampilkan sebagai placeholder). */
export const MODEL_HINTS: Record<string, string> = {
  freepik: "seedream-v4-5-edit",
  kieai: "google/nano-banana-edit",
  mock: "—",
  "": "—",
};
