"use client";

import { fontFamily, type JerseyState, type ZoneId } from "@/types/jersey";

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

// Render order matches PSD bottom-to-top. Each layer is tinted with its zone
// color (multiply), or composited with a blend mode if it's an effect overlay.
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

// Body base bbox in PSD coords — used to position text/logos/sponsor.
const FRONT_BBOX = { left: 367, top: 268, width: 1142, height: 1451 };
const BACK_BBOX = { left: 1524, top: 253, width: 1182, height: 1463 };

// Viewport — region of the full PSD canvas to crop & display for each side
// (so the jersey fills the preview, not a tiny corner of the full 3000x2000).
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

/** Tint a grayscale layer with a zone color (multiply + alpha mask). */
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
  // 1. fill with target color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  // 2. multiply with layer pixels (darkens based on grayscale)
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(img, 0, 0, width, height);
  // 3. mask to the layer's alpha (so we don't bleed outside its shape)
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(img, 0, 0, width, height);
  return c;
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

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontPx: number,
  color: string,
  outline: string,
  family: string,
) {
  ctx.save();
  ctx.font = `900 ${fontPx}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, fontPx * 0.07);
  ctx.strokeStyle = outline;
  ctx.strokeText(text, x, y);
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
    await document.fonts.load(`900 48px ${family}`);
  } catch {
    // ignore
  }
}

/**
 * Composite the layered PSD jersey onto the canvas at given scale factor.
 * scale=0.5 → render at 1500x1000 (half PSD resolution) — fast & sharp enough.
 */
export async function compositePsdJersey(
  canvas: HTMLCanvasElement,
  side: "front" | "back",
  state: JerseyState,
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
  // Translate so we render only the jersey region of the full PSD.
  ctx.save();
  ctx.translate(-vp.left * scale, -vp.top * scale);

  const layers = side === "back" ? BACK_LAYERS : FRONT_LAYERS;

  // Preload all images for this side in parallel.
  await Promise.all(
    layers.map(async (lc) => {
      const entry = manifest.layers[lc.key];
      if (entry?.file) await loadImage(entry.file);
    }),
  );

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
    } else {
      ctx.globalCompositeOperation = lc.blend ?? "source-over";
      ctx.drawImage(img, x, y, w, h);
    }
  }
  ctx.globalCompositeOperation = "source-over";

  // Text & graphic overlays (sponsor, number, name, logo, custom texts)
  await drawOverlays(ctx, side, state, scale, family);
  ctx.restore();
}

async function drawOverlays(
  ctx: CanvasRenderingContext2D,
  side: "front" | "back",
  state: JerseyState,
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
    // Logo — dada kiri pemakai (sisi kanan layar)
    if (state.logoDataUrl) {
      try {
        const logo = await loadUserImage(state.logoDataUrl);
        const lw = W * 0.18;
        ctx.drawImage(logo, cx + W * 0.18, top + H * 0.12, lw, lw);
      } catch {
        // ignore
      }
    }

    // Sponsor: image OR text
    if (state.sponsorMode === "image" && state.sponsorImageDataUrl) {
      try {
        const sponsor = await loadUserImage(state.sponsorImageDataUrl);
        const sw = W * 0.55;
        const sh = sw * 0.28;
        ctx.drawImage(sponsor, cx - sw / 2, top + H * 0.36, sw, sh);
      } catch {
        // ignore
      }
    } else if (state.sponsorMode === "text" && state.sponsorText.trim()) {
      const bandH = H * 0.075;
      const bandW = W * 0.6;
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = accent;
      ctx.fillRect(cx - bandW / 2, top + H * 0.36, bandW, bandH);
      ctx.restore();
      drawText(
        ctx,
        state.sponsorText.trim().toUpperCase().slice(0, 14),
        cx,
        top + H * 0.4,
        H * 0.05,
        outline,
        accent,
        family,
      );
    }

    // Front custom texts
    state.customTexts
      .filter(
        (t) =>
          t.value && (t.placement === "frontTop" || t.placement === "frontBottom"),
      )
      .forEach((t) => {
        const y =
          t.placement === "frontTop" ? top + H * 0.18 : top + H * 0.85;
        drawText(
          ctx,
          t.value.toUpperCase().slice(0, 16),
          cx,
          y,
          H * 0.045,
          t.color,
          outline,
          family,
        );
      });
  } else {
    // BACK
    // Big back number
    if (state.playerNumber.trim()) {
      drawText(
        ctx,
        state.playerNumber.trim().slice(0, 2),
        cx,
        top + H * 0.55,
        H * 0.3,
        accent,
        outline,
        family,
      );
    }
    // Player name (upper back)
    if (state.playerName.trim()) {
      drawText(
        ctx,
        state.playerName.trim().toUpperCase().slice(0, 12),
        cx,
        top + H * 0.22,
        H * 0.075,
        accent,
        outline,
        family,
      );
    }
    // Back custom texts
    state.customTexts
      .filter(
        (t) =>
          t.value && (t.placement === "backTop" || t.placement === "backBottom"),
      )
      .forEach((t) => {
        const y =
          t.placement === "backTop" ? top + H * 0.32 : top + H * 0.88;
        drawText(
          ctx,
          t.value.toUpperCase().slice(0, 16),
          cx,
          y,
          H * 0.05,
          t.color,
          outline,
          family,
        );
      });
  }
}

/** Light-weight wrapper for tests/export — same API as the old flat texture. */
export async function renderJerseyToCanvas(
  side: "front" | "back",
  state: JerseyState,
  scale = 0.5,
): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  await compositePsdJersey(c, side, state, scale);
  return c;
}
