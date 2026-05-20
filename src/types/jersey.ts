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

export interface JerseyState {
  // base colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // pattern
  patternType: PatternType;
  patternColor: string;
  patternScale: number; // 0.5 - 2
  patternOpacity: number; // 0.15 - 1
  patternDataUrl: string | null; // uploaded custom pattern
  patternTinted: boolean; // recolor custom pattern with patternColor
  // text
  playerName: string;
  playerNumber: string;
  sponsorText: string;
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
