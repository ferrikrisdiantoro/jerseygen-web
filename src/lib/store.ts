"use client";

import { create } from "zustand";
import type {
  JerseyState,
  JerseySize,
  PatternType,
  CustomText,
} from "@/types/jersey";

interface JerseyStore extends JerseyState {
  setPrimary: (c: string) => void;
  setSecondary: (c: string) => void;
  setAccent: (c: string) => void;
  setPatternType: (p: PatternType) => void;
  setPatternColor: (c: string) => void;
  setPatternScale: (n: number) => void;
  setPatternOpacity: (n: number) => void;
  setPatternDataUrl: (url: string | null) => void;
  setPatternTinted: (b: boolean) => void;
  setPlayerName: (s: string) => void;
  setPlayerNumber: (s: string) => void;
  setSponsorText: (s: string) => void;
  addCustomText: () => void;
  updateCustomText: (id: string, patch: Partial<CustomText>) => void;
  removeCustomText: (id: string) => void;
  setLogo: (url: string | null) => void;
  setSize: (s: JerseySize) => void;
  setUseFace: (b: boolean) => void;
  setUserPhoto: (url: string | null) => void;
  loadState: (s: JerseyState) => void;
  reset: () => void;
}

export const initialJersey: JerseyState = {
  primaryColor: "#1d4ed8",
  secondaryColor: "#0b1f57",
  accentColor: "#fbbf24",
  patternType: "solid",
  patternColor: "#ffffff",
  patternScale: 1,
  patternOpacity: 0.5,
  patternDataUrl: null,
  patternTinted: true,
  playerName: "",
  playerNumber: "",
  sponsorText: "",
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

/** Extract only the plain JerseyState fields from the full store object. */
export function extractJerseyState(store: JerseyStore): JerseyState {
  const src = store as unknown as Record<string, unknown>;
  const out = {} as Record<string, unknown>;
  for (const k of STATE_KEYS) out[k] = src[k];
  return out as unknown as JerseyState;
}

export const useJerseyStore = create<JerseyStore>((set) => ({
  ...initialJersey,
  setPrimary: (primaryColor) => set({ primaryColor }),
  setSecondary: (secondaryColor) => set({ secondaryColor }),
  setAccent: (accentColor) => set({ accentColor }),
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
  setSponsorText: (sponsorText) => set({ sponsorText }),
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
                color: s.accentColor,
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
  loadState: (s) => set({ ...s }),
  reset: () => set({ ...initialJersey }),
}));
