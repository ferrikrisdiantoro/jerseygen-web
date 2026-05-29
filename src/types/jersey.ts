/**
 * KONFIGURASI JERSEY
 */

// 1. Gaya potongan untuk visual/AI
export type JerseySize = "oversize" | "regular" | "press";

// 2. Ukuran fisik untuk produksi
export type ProductionSize = "S" | "M" | "L" | "XL" | "XXL" | "XXXL";

// 3. Tipe Lengan
export type SleeveType = "short" | "long";

// 4. Data Chart Ukuran
export interface SizeDimension {
  width: string;
  length: string;
}

// Tambahkan ini di bagian bawah file src/types/jersey.ts

export const SIZE_CHART: Record<ProductionSize, SizeDimension> = {
  S: { width: "48cm", length: "68cm" },
  M: { width: "50cm", length: "70cm" },
  L: { width: "52cm", length: "72cm" },
  XL: { width: "54cm", length: "74cm" },
  XXL: { width: "56cm", length: "76cm" },
  XXXL: { width: "58cm", length: "78cm" },
};

// Pola Desain
export type PatternType =
  | "solid" | "stripes" | "hoops" | "halves" | "sash" | "chevron" | "grid" | "custom";

// Penempatan Teks
export type TextPlacement = "frontTop" | "frontBottom" | "backTop" | "backBottom";

export interface CustomText {
  id: string;
  value: string;
  color: string;
  placement: TextPlacement;
}

// Multi-zone coloring
export type ZoneId = "body" | "sleeves" | "collar" | "frontPanel" | "backPanel" | "stitches";

export interface ZoneState {
  color: string;
  visible: boolean;
}

export type Zones = Record<ZoneId, ZoneState>;

// Mode Sponsor
export type SponsorMode = "text" | "image";

// Font Options - Menambahkan string agar mendukung custom ID
export type JerseyFont = 
  | "Inter" | "Arial" | "Times New Roman" | "Impact" 
  | "Bebas Neue" | "Oswald" | "Anton" | "Roboto Mono" 
  | string; 

export const FONT_OPTIONS: { value: JerseyFont; label: string; family: string }[] = [
  { value: "Inter", label: "Inter (Default)", family: "Inter, sans-serif" },
  { value: "Arial", label: "Arial", family: "Arial, sans-serif" },
  { value: "Times New Roman", label: "Times New Roman", family: "'Times New Roman', Times, serif" },
  { value: "Impact", label: "Impact", family: "Impact, sans-serif" },
  { value: "Bebas Neue", label: "Bebas Neue", family: "'Bebas Neue', sans-serif" },
  { value: "Oswald", label: "Oswald", family: "'Oswald', sans-serif" },
  { value: "Anton", label: "Anton", family: "'Anton', sans-serif" },
  { value: "Roboto Mono", label: "Roboto Mono", family: "'Roboto Mono', monospace" },
];

// Helper Font yang diperbaiki
export function fontFamily(name: string): string {
  // Jika ini font kustom hasil upload, gunakan ID tersebut sebagai font-family
  if (name && (name.startsWith("custom-") || name.includes("data"))) {
    return name;
  }
  // Jika font bawaan
  const opt = FONT_OPTIONS.find((f) => f.value === name);
  return opt ? opt.family : "Inter, sans-serif";
}

// Posisi (geser) untuk logo / teks / dll
export interface Vec2 {
  x: number;
  y: number;
}

export type TextStrokeType = "none" | "thin" | "medium" | "thick";

// State Utama Jersey — satu sumber kebenaran (dipakai untuk save & AI).
export interface JerseyState {
  zones: Zones;
  patternType: PatternType;
  patternColor: string;
  patternScale: number;
  patternOpacity: number;
  patternDataUrl: string | null;
  patternTinted: boolean;
  playerName: string;
  playerNumber: string;
  // sponsor
  sponsorMode: SponsorMode;
  sponsorText: string;
  sponsorImageDataUrl: string | null;
  sponsorScale: number;
  sponsorPosition: Vec2;
  sponsorColor: string;
  // font
  font: JerseyFont; // bawaan atau custom ID/dataURL
  customFontUrl: string | null;
  customTexts: CustomText[];
  // logo klub (dada kiri)
  logoDataUrl: string | null;
  logoScale: number;
  logoPosition: Vec2;
  // logo apparel (dada kanan)
  apparelDataUrl: string | null;
  apparelScale: number;
  apparelPosition: Vec2;
  apparelColor: string;
  // teks nama/nomor
  namePosition: Vec2;
  numberPosition: Vec2;
  textStrokeType: TextStrokeType;
  textStrokeColor: string;
  // ukuran & opsi
  size: JerseySize;
  prodSize: ProductionSize;
  sleeve: SleeveType;
  useFace: boolean;
  userPhotoDataUrl: string | null;
}

// --- TAMBAHKAN KODE INI KE BAWAH FILE src/types/jersey.ts ---

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

export const SLEEVE_LABELS: Record<SleeveType, string> = {
  short: "Lengan Pendek",
  long: "Lengan Panjang",
};

export const ZONE_LABELS: Record<ZoneId, string> = {
  body: "Badan",
  sleeves: "Lengan",
  collar: "Kerah",
  frontPanel: "Panel Bahu",
  backPanel: "Panel Belakang",
  stitches: "Stripe Lengan",
};

export const PLACEMENT_LABELS: Record<TextPlacement, string> = {
  frontTop: "Depan Atas",
  frontBottom: "Depan Bawah",
  backTop: "Belakang Atas",
  backBottom: "Belakang Bawah",
};

// Jersey yang disimpan (untuk fitur Simpan Jersey via IndexedDB)
export interface SavedJersey {
  id: string;
  ownerName: string;
  createdAt: number;
  thumbnail: string;
  state: JerseyState;
}