"use client";

import { fontFamily, type JerseyState, type ZoneId } from "@/types/jersey";

// 1. Definisikan ekstensi properti agar TypeScript di psd.ts mengenalinya
interface ExtendedLogoState {
  logoScale?: number;
  logoPosition?: { x: number; y: number };
  
  // Ekstensi untuk Apparel
  apparelDataUrl?: string | null;
  apparelScale?: number;
  apparelPosition?: { x: number; y: number };
  apparelColor?: string;

  // Ekstensi Baru untuk Sponsor Utama (Murni Gambar)
  sponsorScale?: number;
  sponsorPosition?: { x: number; y: number };
  sponsorColor?: string;

  // Posisi Koordinat Nama & Nomor
  namePosition?: { x: number; y: number };   
  numberPosition?: { x: number; y: number }; 

  // ================= EDIT BARU: EKSTENSI STATE STROKE CODES =================
  textStrokeType?: "none" | "thin" | "medium" | "thick";
  textStrokeColor?: string;
}

// 2. Gabungkan tipe data JerseyState dengan properti logo baru
type EnhancedJerseyState = JerseyState & ExtendedLogoState;

export interface PsdLayer {
  type: "pixel" | "group";
  file?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  blendMode?: string;
  opacity?: number;
  hidden?: boolean;
}

export interface PsdManifest {
  psdSize: [number, number];
  layers: Record<string, PsdLayer>;
}

interface LayerConfig {
  key: string;
  zone: ZoneId | null;
  /** Override blend mode for effect layers. */
  blend?: GlobalCompositeOperation;
}

const FRONT_LAYERS: LayerConfig[] = [
  { key: "front_design__front_base", zone: "body" },
  { key: "front_design__right_hand__r_hand_", zone: "sleeves" },
  { key: "front_design__left_hand__l_hand", zone: "sleeves" },
  { key: "front_design__right_hand__r_stripe", zone: "stitches" },
  { key: "front_design__left_hand__l_strip", zone: "stitches" },
  { key: "front_design__sholder_r", zone: "frontPanel" },
  { key: "front_design__sholder_l", zone: "frontPanel" },
  { key: "front_design__inside", zone: "collar" },
  { key: "front_design__collar__collar_left", zone: "collar" },
  { key: "front_design__collar__collar_right", zone: "collar" },
  { key: "front_design__collar__collar", zone: "collar" },
  {
    key: "front_design__effect__baise_copy",
    zone: null,
    blend: "multiply",
  },
  {
    key: "front_design__effect__baise_copy_2",
    zone: null,
    blend: "screen",
  },
];

const BACK_LAYERS: LayerConfig[] = [
  { key: "back_design__back_base", zone: "body" },
  { key: "back_design__r_hand__r_hand", zone: "sleeves" },
  { key: "back_design__l_hand__l_hand", zone: "sleeves" },
  { key: "back_design__r_hand__r_stripe", zone: "stitches" },
  { key: "back_design__l_hand__l_stripe", zone: "stitches" },
  { key: "back_design__collar", zone: "collar" },
  { key: "back_design__effect__effect", zone: null, blend: "multiply" },
  { key: "back_design__effect__effect_", zone: null, blend: "screen" },
];

const FRONT_BBOX = { left: 367, top: 268, width: 1142, height: 1451 };
const BACK_BBOX = { left: 1524, top: 253, width: 1182, height: 1463 };

const FRONT_VIEWPORT = { left: 150, top: 220, width: 1530, height: 1540 };
const BACK_VIEWPORT = { left: 1330, top: 200, width: 1600, height: 1560 };

let cachedManifest: PsdManifest | null = null;
const imageCache: Map<string, HTMLImageElement> = new Map();

async function loadManifest(): Promise<PsdManifest> {
  if (cachedManifest) return cachedManifest;
  const res = await fetch("/assets/jersey/manifest.json");
  if (!res.ok) throw new Error("Manifest jersey tidak ditemukan");
  cachedManifest = (await res.json()) as PsdManifest;
  return cachedManifest;
}

function loadImage(file: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(file);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(file, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Gagal memuat layer: " + file));
    img.src = `/assets/jersey/${file}`;
  });
}

function tintLayer(
  img: HTMLImageElement,
  color: string,
  width: number,
  height: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(img, 0, 0, width, height);
  return c;
}

function drawBodyPattern(
  ctx: CanvasRenderingContext2D,
  state: EnhancedJerseyState,
  bodyImg: HTMLImageElement,
  patternImg: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (state.patternType === "solid") return;

  const pat = document.createElement("canvas");
  pat.width = Math.max(1, Math.round(w));
  pat.height = Math.max(1, Math.round(h));
  const pctx = pat.getContext("2d")!;
  pctx.globalAlpha = state.patternOpacity;
  pctx.fillStyle = state.patternColor;
  pctx.strokeStyle = state.patternColor;
  const s = state.patternScale || 1;
  const W = pat.width;
  const H = pat.height;

  if (state.patternType === "stripes") {
    const sw = W / 9 / s;
    for (let px = -sw; px < W + sw; px += sw * 2) pctx.fillRect(px, 0, sw, H);
  } else if (state.patternType === "hoops") {
    const sh = H / 12 / s;
    for (let py = -sh; py < H + sh; py += sh * 2) pctx.fillRect(0, py, W, sh);
  } else if (state.patternType === "halves") {
    pctx.fillRect(0, 0, W / 2, H);
  } else if (state.patternType === "sash") {
    pctx.lineWidth = W / 5 / s;
    pctx.beginPath();
    pctx.moveTo(-W * 0.1, H);
    pctx.lineTo(W * 1.1, -H * 0.1);
    pctx.stroke(); // Diubah ke pctx agar sesuai konteks local canvas pattern
  } else if (state.patternType === "chevron") {
    const step = H / 8 / s;
    pctx.lineWidth = H / 36 / s;
    for (let py = -step; py < H + step * 2; py += step) {
      pctx.beginPath();
      pctx.moveTo(0, py);
      pctx.lineTo(W / 2, py + step / 2);
      pctx.lineTo(W, py);
      pctx.stroke(); // Diubah ke pctx agar sesuai konteks local canvas pattern
    }
  } else if (state.patternType === "grid") {
    const g = W / 9 / s;
    pctx.lineWidth = W / 110 / s;
    for (let px = 0; px < W; px += g) {
      pctx.beginPath();
      pctx.moveTo(px, 0);
      pctx.lineTo(px, H);
      pctx.stroke(); // Diubah ke pctx
    }
    for (let py = 0; py < H; py += g) {
      pctx.beginPath();
      pctx.moveTo(0, py);
      pctx.lineTo(W, py);
      pctx.stroke(); // Diubah ke pctx
    }
  } else if (state.patternType === "custom" && patternImg) {
    pctx.save();
    pctx.translate(W / 2, H / 2);
    pctx.scale(s, s);
    pctx.drawImage(patternImg, -W / 2, -H / 2, W, H);
    pctx.restore();
  }

  pctx.globalAlpha = 1;
  pctx.globalCompositeOperation = "destination-in";
  pctx.drawImage(bodyImg, 0, 0, W, H);

  ctx.drawImage(pat, x, y);
}

async function loadUserImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat gambar user"));
    img.src = dataUrl;
  });
}

// ================= EDIT BARU: MODIFIKASI PARAMETER DAN LOGIKA STROKE CANVAS =================
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontPx: number,
  color: string,
  outlineColor: string,
  family: string,
  strokeWidth: number = 0,
) {
  ctx.save();
  
  const weight = family.startsWith("custom-") ? "bold" : "900"; // Paksa bold
  ctx.font = `${weight} ${fontPx}px "${family}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2; // Penting agar stroke sudut tajam tidak melebar aneh

  // Jika ada stroke, gambar stroke terlebih dahulu
  if (strokeWidth > 0) {
    ctx.lineWidth = strokeWidth * 2; // Kita kali 2 agar lebih tebal terlihat
    ctx.strokeStyle = outlineColor;
    ctx.strokeText(text, x, y);
    
    // Tambahan: Tambahkan stroke kedua agar terlihat solid dan tidak tipis
    ctx.strokeText(text, x, y); 
  }
  
  // Isi teks utama di atas stroke
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function shade(hex: string, percent: number): string {
  const m = hex.replace("#", "");
  if (m.length !== 6) return hex;
  const num = parseInt(m, 16);
  const adj = (v: number) =>
    Math.max(0, Math.min(255, v + Math.round(255 * (percent / 100))));
  const r = adj((num >> 16) & 0xff);
  const g = adj((num >> 8) & 0xff);
  const b = adj(num & 0xff);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

async function ensureFont(family: string) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`900 48px "${family}"`),
      document.fonts.load(`400 48px "${family}"`),
      document.fonts.load(`16px "${family}"`)
    ]);
  } catch (e) {
    console.warn("Gagal memastikan font kustom:", e);
  }
}

export async function compositePsdJersey(
  canvas: HTMLCanvasElement,
  side: "front" | "back",
  state: EnhancedJerseyState,
  scale = 0.5,
): Promise<void> {
  const manifest = await loadManifest();
  const family = fontFamily(state.font);
  await ensureFont(family);

  const vp = side === "back" ? BACK_VIEWPORT : FRONT_VIEWPORT;
  const W = Math.round(vp.width * scale);
  const H = Math.round(vp.height * scale);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(-vp.left * scale, -vp.top * scale);

  const layers = side === "back" ? BACK_LAYERS : FRONT_LAYERS;

  await Promise.all(
    layers.map(async (lc) => {
      const entry = manifest.layers[lc.key];
      if (entry?.file) await loadImage(entry.file);
    }),
  );

  let patternImg: HTMLImageElement | null = null;
  if (state.patternType === "custom" && state.patternDataUrl) {
    try {
      patternImg = await loadUserImage(state.patternDataUrl);
    } catch {
      patternImg = null;
    }
  }

  for (const lc of layers) {
    const entry = manifest.layers[lc.key];
    if (!entry || !entry.file || entry.width === undefined) continue;
    const img = imageCache.get(entry.file);
    if (!img) continue;

    const x = (entry.left ?? 0) * scale;
    const y = (entry.top ?? 0) * scale;
    const w = (entry.width ?? 0) * scale;
    const h = (entry.height ?? 0) * scale;

    if (lc.zone) {
      const zone = state.zones[lc.zone];
      if (!zone.visible) continue;
      const tinted = tintLayer(img, zone.color, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(tinted, x, y);
      if (lc.zone === "body") {
        drawBodyPattern(ctx, state, img, patternImg, x, y, w, h);
      }
    } else {
      ctx.globalCompositeOperation = lc.blend ?? "source-over";
      ctx.drawImage(img, x, y, w, h);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  await drawOverlays(ctx, side, state, scale, family);
  ctx.restore();
}

async function drawOverlays(
  ctx: CanvasRenderingContext2D,
  side: "front" | "back",
  state: EnhancedJerseyState,
  scale: number,
  family: string,
) {
  const bbox = side === "back" ? BACK_BBOX : FRONT_BBOX;
  const cx = (bbox.left + bbox.width / 2) * scale;
  const top = bbox.top * scale;
  const W = bbox.width * scale;
  const H = bbox.height * scale;

  const outline = shade(state.zones.collar.color, -25);
  const accent = state.zones.frontPanel.color;

  if (side === "front") {
    // ================= FITUR 1: LOGO KLUB (DADA KIRI) =================
    if (state.logoDataUrl) {
      try {
        const logo = await loadUserImage(state.logoDataUrl);
        const baseWidth = W * 0.18;
        const aspectRatio = logo.height / logo.width;
        const baseHeight = baseWidth * aspectRatio;
        
        const defaultCenterX = cx - W * 0.22;
        const defaultCenterY = top + H * 0.22;

        const finalWidth = baseWidth * (state.logoScale ?? 1);
        const finalHeight = baseHeight * (state.logoScale ?? 1);

        const offsetX = (state.logoPosition?.x ?? 0) * scale;
        const offsetY = (state.logoPosition?.y ?? 0) * scale;

        const drawX = defaultCenterX - (finalWidth / 2) + offsetX;
        const drawY = defaultCenterY - (finalHeight / 2) + offsetY;

        ctx.save();
        ctx.drawImage(logo, drawX, drawY, finalWidth, finalHeight);
        ctx.restore();
      } catch {
        // ignore
      }
    }

    // ================= FITUR 2: LOGO APPAREL (DADA KANAN) =================
    if (state.apparelDataUrl) {
      try {
        const apparelImg = await loadUserImage(state.apparelDataUrl);
        const baseApparelWidth = W * 0.16;
        const apparelAspect = apparelImg.height / apparelImg.width;
        const baseApparelHeight = baseApparelWidth * apparelAspect;

        const defaultApparelCenterX = cx + W * 0.22;
        const defaultApparelCenterY = top + H * 0.22;

        const finalApparelWidth = baseApparelWidth * (state.apparelScale ?? 1);
        const finalApparelHeight = baseApparelHeight * (state.apparelScale ?? 1);

        const apparelOffsetX = (state.apparelPosition?.x ?? 0) * scale;
        const apparelOffsetY = (state.apparelPosition?.y ?? 0) * scale;

        const apparelDrawX = defaultApparelCenterX - (finalApparelWidth / 2) + apparelOffsetX;
        const apparelDrawY = defaultApparelCenterY - (finalApparelHeight / 2) + apparelOffsetY;

        const offscreen = document.createElement("canvas");
        offscreen.width = Math.max(1, finalApparelWidth);
        offscreen.height = Math.max(1, finalApparelHeight);
        const offCtx = offscreen.getContext("2d");

        if (offCtx) {
          ctx.save();
          offCtx.drawImage(apparelImg, 0, 0, finalApparelWidth, finalApparelHeight);
          offCtx.globalCompositeOperation = "source-in";
          offCtx.fillStyle = state.apparelColor || "#ffffff";
          offCtx.fillRect(0, 0, finalApparelWidth, finalApparelHeight);
          ctx.drawImage(offscreen, apparelDrawX, apparelDrawY);
          ctx.restore();
        }
      } catch {
        // ignore
      }
    }

    // ================= FITUR 3: SPONSOR UTAMA GAMBAR =================
    if (state.sponsorImageDataUrl) {
      try {
        const sponsorImg = await loadUserImage(state.sponsorImageDataUrl);
        
        const baseSponsorWidth = W * 0.55;
        const sponsorAspect = sponsorImg.height / sponsorImg.width;
        const baseSponsorHeight = baseSponsorWidth * sponsorAspect;

        const defaultSponsorCenterX = cx;
        const defaultSponsorCenterY = top + H * 0.42; 

        const finalSponsorWidth = baseSponsorWidth * (state.sponsorScale ?? 1);
        const finalSponsorHeight = baseSponsorHeight * (state.sponsorScale ?? 1);

        const sponsorOffsetX = (state.sponsorPosition?.x ?? 0) * scale;
        const sponsorOffsetY = (state.sponsorPosition?.y ?? 0) * scale;

        const sponsorDrawX = defaultSponsorCenterX - (finalSponsorWidth / 2) + sponsorOffsetX;
        const sponsorDrawY = defaultSponsorCenterY - (finalSponsorHeight / 2) + sponsorOffsetY;

        const offscreenSponsor = document.createElement("canvas");
        offscreenSponsor.width = Math.max(1, finalSponsorWidth);
        offscreenSponsor.height = Math.max(1, finalSponsorHeight);
        const offSponsorCtx = offscreenSponsor.getContext("2d");

        if (offSponsorCtx) {
          ctx.save();
          offSponsorCtx.drawImage(sponsorImg, 0, 0, finalSponsorWidth, finalSponsorHeight);
          
          if (state.sponsorColor) {
            offSponsorCtx.globalCompositeOperation = "source-in";
            offSponsorCtx.fillStyle = state.sponsorColor;
            offSponsorCtx.fillRect(0, 0, finalSponsorWidth, finalSponsorHeight);
          }
          
          ctx.drawImage(offscreenSponsor, sponsorDrawX, sponsorDrawY);
          ctx.restore();
        }
      } catch {
        // ignore
      }
    }

    // Front custom texts
    state.customTexts
      .filter((t) => t.value && (t.placement === "frontTop" || t.placement === "frontBottom"))
      .forEach((t) => {
        const y = t.placement === "frontTop" ? top + H * 0.18 : top + H * 0.85;
        drawText(
          ctx,
          t.value.toUpperCase().slice(0, 16),
          cx,
          y,
          H * 0.045,
          t.color,
          outline,
          family,
          0,
        );
      });
  } else {
    // ================= BAGIAN BELAKANG (BACK) =================
    
    // ================= EDIT BARU: HITUNG TEBAL STROKE DARI STATE =================
    let calculatedStrokeWidth = 0;
    let targetStrokeColor = outline; // Default fallback outline warna kerah gelap

    if (state.textStrokeType && state.textStrokeType !== "none") {
      // Menentukan ketebalan stroke proporsional mengikuti tinggi bounding box jersey (H)
      let factor = 0;
      if (state.textStrokeType === "thin") factor = 0.012;     // Tipis
      if (state.textStrokeType === "medium") factor = 0.028;   // Sedang
      if (state.textStrokeType === "thick") factor = 0.048;    // Tebal
      
      calculatedStrokeWidth = H * factor;
      if (state.textStrokeColor) {
        targetStrokeColor = state.textStrokeColor;
      }
    } else if (state.textStrokeType === "none") {
      // Jika dipilih "Tanpa Stroke", set ukuran ketebalan ke 0 penuh
      calculatedStrokeWidth = 0;
    }

    // 1. DYNAMIC POSITIONING & STROKE: NOMOR PUNGGUNG
    if (state.playerNumber.trim()) {
      const defaultNumberX = cx;
      const defaultNumberY = top + H * 0.55;

      const numberOffsetX = (state.numberPosition?.x ?? 0) * scale;
      const numberOffsetY = (state.numberPosition?.y ?? 0) * scale;

      const finalNumberX = defaultNumberX + numberOffsetX;
      const finalNumberY = defaultNumberY + numberOffsetY;

      drawText(
        ctx,
        state.playerNumber.trim().slice(0, 2),
        finalNumberX,
        finalNumberY,
        H * 0.3,
        accent,
        targetStrokeColor,
        family,
        calculatedStrokeWidth, // <-- Oper variabel tebal stroke kustom
      );
    }

    // 2. DYNAMIC POSITIONING & STROKE: NAMA PUNGGUNG
    if (state.playerName.trim()) {
      const defaultNameX = cx;
      const defaultNameY = top + H * 0.22;

      const nameOffsetX = (state.namePosition?.x ?? 0) * scale;
      const nameOffsetY = (state.namePosition?.y ?? 0) * scale;

      const finalNameX = defaultNameX + nameOffsetX;
      const finalNameY = defaultNameY + nameOffsetY;

      drawText(
        ctx,
        state.playerName.trim().toUpperCase().slice(0, 12),
        finalNameX,
        finalNameY,
        H * 0.075,
        accent,
        targetStrokeColor,
        family,
        calculatedStrokeWidth, // <-- Oper variabel tebal stroke kustom
      );
    }

    // Back custom texts
    state.customTexts
      .filter((t) => t.value && (t.placement === "backTop" || t.placement === "backBottom"))
      .forEach((t) => {
        const y = t.placement === "backTop" ? top + H * 0.32 : top + H * 0.88;
        drawText(
          ctx,
          t.value.toUpperCase().slice(0, 16),
          cx,
          y,
          H * 0.05,
          t.color,
          outline,
          family,
          0,
        );
      });
  }
}

export async function renderJerseyToCanvas(
  side: "front" | "back",
  state: EnhancedJerseyState,
  scale = 0.5,
): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  await compositePsdJersey(c, side, state, scale);
  return c;
}