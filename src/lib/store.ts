"use client";

import { create } from "zustand";
import type {
  CustomText,
  JerseyFont,
  JerseyState,
  JerseySize,
  PatternType,
  SponsorMode,
  ZoneId,
  ZoneState,
} from "@/types/jersey";

interface JerseyStore extends JerseyState {
  setZoneColor: (id: ZoneId, color: string) => void;
  setZoneVisible: (id: ZoneId, visible: boolean) => void;
  setPatternType: (p: PatternType) => void;
  setPatternColor: (c: string) => void;
  setPatternScale: (n: number) => void;
  setPatternOpacity: (n: number) => void;
  setPatternDataUrl: (url: string | null) => void;
  setPatternTinted: (b: boolean) => void;
  setPlayerName: (s: string) => void;
  setPlayerNumber: (s: string) => void;
  setSponsorMode: (m: SponsorMode) => void;
  setSponsorText: (s: string) => void;
  setSponsorImage: (url: string | null) => void;
  setFont: (f: JerseyFont) => void;
  addCustomText: () => void;
  updateCustomText: (id: string, patch: Partial<CustomText>) => void;
  removeCustomText: (id: string) => void;
  setLogo: (url: string | null) => void;
  setSize: (s: JerseySize) => void;
  setUseFace: (b: boolean) => void;
  setUserPhoto: (url: string | null) => void;
  loadState: (s: unknown) => void;
  reset: () => void;
}

const DEFAULT_ZONES: Record<ZoneId, ZoneState> = {
  body: { color: "#1d4ed8", visible: true },
  sleeves: { color: "#0b1f57", visible: true },
  collar: { color: "#0b1f57", visible: true },
  frontPanel: { color: "#fbbf24", visible: true },
  backPanel: { color: "#fbbf24", visible: true },
  stitches: { color: "#0b1f57", visible: true },
};

export const initialJersey: JerseyState = {
  zones: DEFAULT_ZONES,
  patternType: "solid",
  patternColor: "#ffffff",
  patternScale: 1,
  patternOpacity: 0.5,
  patternDataUrl: null,
  patternTinted: true,
  playerName: "",
  playerNumber: "",
  sponsorMode: "text",
  sponsorText: "",
  sponsorImageDataUrl: null,
  font: "Inter",
  customTexts: [],
  logoDataUrl: null,
  size: "regular",
  useFace: false,
  userPhotoDataUrl: null,
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const STATE_KEYS = Object.keys(initialJersey) as (keyof JerseyState)[];

export function extractJerseyState(store: JerseyStore): JerseyState {
  const src = store as unknown as Record<string, unknown>;
  const out = {} as Record<string, unknown>;
  for (const k of STATE_KEYS) out[k] = src[k];
  return out as unknown as JerseyState;
}

/**
 * Migrate older saved-jersey shape (had primaryColor/secondaryColor/accentColor)
 * to the new zones-based shape. Idempotent — passes through new-format states.
 */
export function migrateJerseyState(
  s: Partial<JerseyState> & Record<string, unknown>,
): JerseyState {
  const out: JerseyState = { ...initialJersey, ...(s as Partial<JerseyState>) };
  if (!s.zones) {
    const primary = (s.primaryColor as string) || DEFAULT_ZONES.body.color;
    const secondary = (s.secondaryColor as string) || DEFAULT_ZONES.sleeves.color;
    const accent = (s.accentColor as string) || DEFAULT_ZONES.frontPanel.color;
    out.zones = {
      body: { color: primary, visible: true },
      sleeves: { color: secondary, visible: true },
      collar: { color: secondary, visible: true },
      frontPanel: { color: accent, visible: true },
      backPanel: { color: accent, visible: true },
      stitches: { color: "#0b1f57", visible: true },
    };
  }
  if (!s.sponsorMode) out.sponsorMode = "text";
  if (!s.font) out.font = "Inter";
  return out;
}

export const useJerseyStore = create<JerseyStore>((set) => ({
  ...initialJersey,
  setZoneColor: (id, color) =>
    set((st) => ({
      zones: { ...st.zones, [id]: { ...st.zones[id], color } },
    })),
  setZoneVisible: (id, visible) =>
    set((st) => ({
      zones: { ...st.zones, [id]: { ...st.zones[id], visible } },
    })),
  setPatternType: (patternType) => set({ patternType }),
  setPatternColor: (patternColor) => set({ patternColor }),
  setPatternScale: (patternScale) => set({ patternScale }),
  setPatternOpacity: (patternOpacity) => set({ patternOpacity }),
  setPatternDataUrl: (patternDataUrl) =>
    set((s) => ({
      patternDataUrl,
      patternType: patternDataUrl ? "custom" : s.patternType,
    })),
  setPatternTinted: (patternTinted) => set({ patternTinted }),
  setPlayerName: (playerName) => set({ playerName }),
  setPlayerNumber: (playerNumber) => set({ playerNumber }),
  setSponsorMode: (sponsorMode) => set({ sponsorMode }),
  setSponsorText: (sponsorText) => set({ sponsorText }),
  setSponsorImage: (sponsorImageDataUrl) =>
    set({ sponsorImageDataUrl, sponsorMode: sponsorImageDataUrl ? "image" : "text" }),
  setFont: (font) => set({ font }),
  addCustomText: () =>
    set((s) => ({
      customTexts:
        s.customTexts.length >= 4
          ? s.customTexts
          : [
              ...s.customTexts,
              {
                id: uid(),
                value: "",
                color: s.zones.frontPanel.color,
                placement: "frontTop",
              },
            ],
    })),
  updateCustomText: (id, patch) =>
    set((s) => ({
      customTexts: s.customTexts.map((t) =>
        t.id === id ? { ...t, ...patch } : t,
      ),
    })),
  removeCustomText: (id) =>
    set((s) => ({ customTexts: s.customTexts.filter((t) => t.id !== id) })),
  setLogo: (logoDataUrl) => set({ logoDataUrl }),
  setSize: (size) => set({ size }),
  setUseFace: (useFace) => set({ useFace }),
  setUserPhoto: (userPhotoDataUrl) => set({ userPhotoDataUrl }),
  loadState: (s) =>
    set({
      ...migrateJerseyState(
        (s ?? {}) as Partial<JerseyState> & Record<string, unknown>,
      ),
    }),
  reset: () => set({ ...initialJersey }),
}));
