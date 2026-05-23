export type JerseySize = "oversize" | "regular" | "press";

export type PatternType =
  | "solid"
  | "stripes"
  | "hoops"
  | "halves"
  | "sash"
  | "chevron"
  | "grid"
  | "custom";

export type TextPlacement =
  | "frontTop"
  | "frontBottom"
  | "backTop"
  | "backBottom";

export interface CustomText {
  id: string;
  value: string;
  color: string;
  placement: TextPlacement;
}

// Multi-zone coloring (multi-mesh group dari GLB jersey1.glb).
export type ZoneId =
  | "body"
  | "sleeves"
  | "collar"
  | "frontPanel"
  | "backPanel"
  | "stitches";

export interface ZoneState {
  color: string;
  visible: boolean;
}

export type Zones = Record<ZoneId, ZoneState>;

export const ZONE_LABELS: Record<ZoneId, string> = {
  body: "Badan",
  sleeves: "Lengan",
  collar: "Kerah",
  frontPanel: "Stripe Dada Depan",
  backPanel: "Stripe Dada Belakang",
  stitches: "Hem & Cuff Lengan",
};

export type SponsorMode = "text" | "image";

export type JerseyFont =
  | "Inter"
  | "Arial"
  | "Times New Roman"
  | "Impact"
  | "Bebas Neue"
  | "Oswald"
  | "Anton"
  | "Roboto Mono";

export const FONT_OPTIONS: { value: JerseyFont; label: string; family: string }[] = [
  { value: "Inter", label: "Inter (Default)", family: "Inter, sans-serif" },
  { value: "Arial", label: "Arial", family: "Arial, sans-serif" },
  {
    value: "Times New Roman",
    label: "Times New Roman",
    family: '"Times New Roman", Times, serif',
  },
  { value: "Impact", label: "Impact", family: "Impact, sans-serif" },
  { value: "Bebas Neue", label: "Bebas Neue", family: '"Bebas Neue", sans-serif' },
  { value: "Oswald", label: "Oswald", family: "Oswald, sans-serif" },
  { value: "Anton", label: "Anton", family: "Anton, sans-serif" },
  { value: "Roboto Mono", label: "Roboto Mono", family: '"Roboto Mono", monospace' },
];

export function fontFamily(name: JerseyFont): string {
  const opt = FONT_OPTIONS.find((f) => f.value === name);
  return opt ? opt.family : "Inter, sans-serif";
}

export interface JerseyState {
  // multi-zone colors + visibility (replaces primary/secondary/accent)
  zones: Zones;
  // pattern
  patternType: PatternType;
  patternColor: string;
  patternScale: number;
  patternOpacity: number;
  patternDataUrl: string | null;
  patternTinted: boolean;
  // text
  playerName: string;
  playerNumber: string;
  sponsorMode: SponsorMode;
  sponsorText: string;
  sponsorImageDataUrl: string | null;
  font: JerseyFont;
  customTexts: CustomText[];
  // logo
  logoDataUrl: string | null;
  // generate options
  size: JerseySize;
  useFace: boolean;
  userPhotoDataUrl: string | null;
}

export interface SavedJersey {
  id: string;
  ownerName: string;
  createdAt: number;
  thumbnail: string;
  state: JerseyState;
}

export const PATTERN_LABELS: Record<PatternType, string> = {
  solid: "Polos",
  stripes: "Garis Vertikal",
  hoops: "Garis Horizontal",
  halves: "Dua Sisi",
  sash: "Selempang",
  chevron: "Chevron",
  grid: "Kotak",
  custom: "Pattern Sendiri",
};

export const SIZE_LABELS: Record<JerseySize, string> = {
  oversize: "Oversize",
  regular: "Regular",
  press: "Press Body",
};

export const PLACEMENT_LABELS: Record<TextPlacement, string> = {
  frontTop: "Depan Atas",
  frontBottom: "Depan Bawah",
  backTop: "Belakang Atas",
  backBottom: "Belakang Bawah",
};
