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
  setSponsorScale: (n: number) => void;
  setSponsorPosition: (pos: { x: number; y: number }) => void;
  setSponsorColor: (c: string) => void;
  setFont: (f: JerseyFont | string) => void;
  setCustomFont: (url: string | null) => void;
  addCustomText: () => void;
  updateCustomText: (id: string, patch: Partial<CustomText>) => void;
  removeCustomText: (id: string) => void;
  setLogo: (url: string | null) => void;
  setLogoScale: (scale: number) => void;
  setLogoPosition: (pos: { x: number; y: number }) => void;
  setApparel: (url: string | null) => void;
  setApparelScale: (scale: number) => void;
  setApparelPosition: (pos: { x: number; y: number }) => void;
  setApparelColor: (color: string) => void;
  setSize: (s: JerseySize) => void;
  setUseFace: (b: boolean) => void;
  setUserPhoto: (url: string | null) => void;
  setNamePosition: (pos: { x: number; y: number }) => void;
  setNumberPosition: (pos: { x: number; y: number }) => void;
  setTextStrokeType: (type: "none" | "thin" | "medium" | "thick") => void;
  setTextStrokeColor: (color: string) => void;
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
  patternOpacity: 0.8,
  patternDataUrl: null,
  patternTinted: true,
  playerName: "",
  playerNumber: "",
  sponsorMode: "text",
  sponsorText: "",
  sponsorImageDataUrl: null,
  sponsorScale: 1,
  sponsorPosition: { x: 0, y: 0 },
  sponsorColor: "#ffffff",
  font: "Inter",
  customFontUrl: null,
  customTexts: [],
  logoDataUrl: null,
  logoScale: 1,
  logoPosition: { x: 0, y: 0 },
  apparelDataUrl: null,
  apparelScale: 1,
  apparelPosition: { x: 0, y: 0 },
  apparelColor: "#ffffff",
  size: "regular",
  useFace: false,
  userPhotoDataUrl: null,
  namePosition: { x: 0, y: 0 },
  numberPosition: { x: 0, y: 0 },
  textStrokeType: "none",
  textStrokeColor: "#000000",
  
  // TAMBAHKAN PROPERTI WAJIB INI:
  prodSize: "M", 
  sleeve: "short"
};
function uid() { return Math.random().toString(36).slice(2, 9); }

const STATE_KEYS = Object.keys(initialJersey) as (keyof JerseyState)[];

// Ambil HANYA field data (tanpa fungsi setter) lalu deep-clone.
// Aman untuk disimpan ke IndexedDB & dikirim ke AI (JSON.stringify).
export function extractJerseyState(store: JerseyStore): JerseyState {
  const src = store as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of STATE_KEYS) out[k] = src[k];
  return JSON.parse(JSON.stringify(out)) as JerseyState;
}

export function migrateJerseyState(s: unknown): JerseyState {
  return { ...initialJersey, ...(s as Partial<JerseyState>) };
}

export const useJerseyStore = create<JerseyStore>((set) => ({
  ...initialJersey,
  setZoneColor: (id, color) => set((st) => ({ zones: { ...st.zones, [id]: { ...st.zones[id], color } } })),
  setZoneVisible: (id, visible) => set((st) => ({ zones: { ...st.zones, [id]: { ...st.zones[id], visible } } })),
  setPatternType: (patternType) => set({ patternType }),
  setPatternColor: (patternColor) => set({ patternColor }),
  setPatternScale: (patternScale) => set({ patternScale }),
  setPatternOpacity: (patternOpacity) => set({ patternOpacity }),
  setPatternDataUrl: (url) => set((s) => ({ patternDataUrl: url, patternType: url ? "custom" : s.patternType })),
  setPatternTinted: (patternTinted) => set({ patternTinted }),
  setPlayerName: (playerName) => set({ playerName }),
  setPlayerNumber: (playerNumber) => set({ playerNumber }),
  setSponsorMode: (sponsorMode) => set({ sponsorMode }),
  setSponsorText: (sponsorText) => set({ sponsorText }),
  setSponsorImage: (url) => set({ sponsorImageDataUrl: url, sponsorMode: url ? "image" : "text" }),
  setSponsorScale: (sponsorScale) => set({ sponsorScale }),
  setSponsorPosition: (sponsorPosition) => set({ sponsorPosition }),
  setSponsorColor: (sponsorColor) => set({ sponsorColor }),
  setFont: (font) => {
    if (!font.startsWith("custom-")) { set({ font, customFontUrl: null }); return; }
    set({ font });
  },
  setCustomFont: (url) => set({ customFontUrl: url }),
  addCustomText: () => set((s) => ({ customTexts: s.customTexts.length >= 4 ? s.customTexts : [...s.customTexts, { id: uid(), value: "", color: s.zones.frontPanel.color, placement: "frontTop" }] })),
  updateCustomText: (id, patch) => set((s) => ({ customTexts: s.customTexts.map((t) => t.id === id ? { ...t, ...patch } : t) })),
  removeCustomText: (id) => set((s) => ({ customTexts: s.customTexts.filter((t) => t.id !== id) })),
  setLogo: (logoDataUrl) => set({ logoDataUrl }),
  setLogoScale: (logoScale) => set({ logoScale }),
  setLogoPosition: (logoPosition) => set({ logoPosition }),
  setApparel: (apparelDataUrl) => set({ apparelDataUrl }),
  setApparelScale: (apparelScale) => set({ apparelScale }),
  setApparelPosition: (apparelPosition) => set({ apparelPosition }),
  setApparelColor: (apparelColor) => set({ apparelColor }),
  setSize: (size) => set({ size }),
  setUseFace: (useFace) => set({ useFace }),
  setUserPhoto: (userPhotoDataUrl) => set({ userPhotoDataUrl }),
  setNamePosition: (namePosition) => set({ namePosition }),
  setNumberPosition: (numberPosition) => set({ numberPosition }),
  setTextStrokeType: (textStrokeType) => set({ textStrokeType }),
  setTextStrokeColor: (textStrokeColor) => set({ textStrokeColor }),
  loadState: (s) => set({ ...migrateJerseyState(s) }),
  reset: () => set({ ...initialJersey }),
}));