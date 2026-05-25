import { fontFamily, type JerseyState, type TextPlacement } from "@/types/jersey";

export const JERSEY_W = 400;
export const JERSEY_H = 480;
const SCALE = 2.5;

// Realistic football-jersey silhouette: rounded shoulders, deeper V-neck on
// front, flat collar band on back, tapered body (wider at chest, narrower at
// hem), sleeves angled outward.
export const JERSEY_PATH =
  "M60 80 Q90 55 135 50 L165 75 Q200 130 235 75 L265 50 Q310 55 340 80 " +
  "L375 170 L305 195 Q315 290 295 432 Q295 452 280 452 L120 452 " +
  "Q105 452 105 432 Q85 290 95 195 L25 170 Z";

export const JERSEY_PATH_BACK =
  "M60 80 Q90 55 135 50 L168 62 L232 62 L265 50 Q310 55 340 80 " +
  "L375 170 L305 195 Q315 290 295 432 Q295 452 280 452 L120 452 " +
  "Q105 452 105 432 Q85 290 95 195 L25 170 Z";

const SLEEVE_LEFT = "M60 80 Q90 55 135 50 L95 195 L25 170 Z";
const SLEEVE_RIGHT = "M340 80 Q310 55 265 50 L305 195 L375 170 Z";
const COLLAR_FRONT = "M165 75 Q200 130 235 75 L227 92 Q200 142 173 92 Z";
const COLLAR_BACK = "M168 62 L232 62 L228 78 L172 78 Z";
// Small label tag at back of neck — visual cue this is the back.
const BACK_TAG = "M190 62 L210 62 L208 73 L192 73 Z";

export interface TextureAssets {
  patternImg?: HTMLImageElement | null;
  logoImg?: HTMLImageElement | null;
  sponsorImg?: HTMLImageElement | null;
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat gambar"));
    img.src = dataUrl;
  });
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

function tintImage(img: HTMLImageElement, color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || 256;
  c.height = img.naturalHeight || 256;
  const x = c.getContext("2d")!;
  x.drawImage(img, 0, 0, c.width, c.height);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  state: JerseyState,
  assets: TextureAssets,
) {
  const { patternType, patternColor, patternScale, patternOpacity } = state;
  if (patternType === "solid") return;

  ctx.save();
  ctx.globalAlpha = patternOpacity;
  ctx.fillStyle = patternColor;
  ctx.strokeStyle = patternColor;
  const s = patternScale || 1;

  if (patternType === "stripes") {
    const w = 26 / s;
    for (let x = -w; x < JERSEY_W + w; x += w * 2) ctx.fillRect(x, 0, w, JERSEY_H);
  } else if (patternType === "hoops") {
    const h = 30 / s;
    for (let y = -h; y < JERSEY_H + h; y += h * 2) ctx.fillRect(0, y, JERSEY_W, h);
  } else if (patternType === "halves") {
    ctx.fillRect(0, 0, JERSEY_W / 2, JERSEY_H);
  } else if (patternType === "sash") {
    ctx.lineWidth = 70 / s;
    ctx.beginPath();
    ctx.moveTo(-40, JERSEY_H);
    ctx.lineTo(JERSEY_W + 40, -40);
    ctx.stroke();
  } else if (patternType === "chevron") {
    const step = 60 / s;
    ctx.lineWidth = 14 / s;
    for (let y = -step; y < JERSEY_H + step * 2; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(JERSEY_W / 2, y + step / 2);
      ctx.lineTo(JERSEY_W, y);
      ctx.stroke();
    }
  } else if (patternType === "grid") {
    const g = 36 / s;
    ctx.lineWidth = 4 / s;
    for (let x = 0; x < JERSEY_W; x += g) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, JERSEY_H);
      ctx.stroke();
    }
    for (let y = 0; y < JERSEY_H; y += g) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(JERSEY_W, y);
      ctx.stroke();
    }
  } else if (patternType === "custom" && assets.patternImg) {
    const src: CanvasImageSource = state.patternTinted
      ? tintImage(assets.patternImg, patternColor)
      : assets.patternImg;
    const tile = document.createElement("canvas");
    const size = Math.max(40, 140 / s);
    tile.width = size;
    tile.height = size;
    tile.getContext("2d")!.drawImage(src, 0, 0, size, size);
    const pat = ctx.createPattern(tile, "repeat");
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, JERSEY_W, JERSEY_H);
    }
  }
  ctx.restore();
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

function placementXY(p: TextPlacement): { x: number; y: number } {
  switch (p) {
    case "frontTop":
    case "backTop":
      return { x: 200, y: 150 };
    case "frontBottom":
    case "backBottom":
      return { x: 200, y: 415 };
  }
}

/**
 * Make sure the chosen font is loaded before drawing onto a canvas.
 * Browsers won't use a not-yet-loaded font in canvas.
 */
async function ensureFont(family: string) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(`900 48px ${family}`);
  } catch {
    // ignore — fallback to system font
  }
}

export async function drawJerseyTexture(
  canvas: HTMLCanvasElement,
  side: "front" | "back",
  state: JerseyState,
  assets: TextureAssets = {},
  transparent = true,
  clip = true,
) {
  const family = fontFamily(state.font);
  await ensureFont(family);

  const { zones } = state;
  const bodyColor = zones.body.color;
  const sleeveColor = zones.sleeves.color;
  const collarColor = zones.collar.color;
  const accentColor = zones.frontPanel.color;

  canvas.width = JERSEY_W * SCALE;
  canvas.height = JERSEY_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.clearRect(0, 0, JERSEY_W, JERSEY_H);

  if (!transparent) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, JERSEY_W, JERSEY_H);
  }

  // Different silhouette per side so front/back are visually distinct
  // even when the design is empty (V-neck front vs flat-collar back).
  const path = new Path2D(
    side === "back" ? JERSEY_PATH_BACK : JERSEY_PATH,
  );

  ctx.save();
  if (clip) ctx.clip(path);

  // body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(0, 0, JERSEY_W, JERSEY_H);

  // sleeves
  if (zones.sleeves.visible) {
    ctx.fillStyle = sleeveColor;
    ctx.fill(new Path2D(SLEEVE_LEFT));
    ctx.fill(new Path2D(SLEEVE_RIGHT));
  }

  // pattern overlay
  drawPattern(ctx, state, assets);

  // cuff accent stripes — pas di bawah sleeve, sebagai band keliling lengan
  ctx.fillStyle = accentColor;
  ctx.fillRect(30, 162, 65, 14);
  ctx.fillRect(305, 162, 65, 14);

  // subtle shoulder seam lines (where sleeve meets body) for realism
  ctx.save();
  ctx.strokeStyle = shade(sleeveColor, -22);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(135, 50);
  ctx.lineTo(95, 195);
  ctx.moveTo(265, 50);
  ctx.lineTo(305, 195);
  ctx.stroke();
  // hem stitching line for realism
  ctx.strokeStyle = shade(bodyColor, -22);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(108, 438);
  ctx.lineTo(292, 438);
  ctx.stroke();
  ctx.restore();

  // collar — V-neck on front, flat band on back
  if (zones.collar.visible) {
    ctx.fillStyle = collarColor;
    ctx.fill(new Path2D(side === "back" ? COLLAR_BACK : COLLAR_FRONT));
    if (side === "back") {
      // small jersey label tag at back of neck for a clear visual cue
      ctx.fillStyle = shade(collarColor, 25);
      ctx.fill(new Path2D(BACK_TAG));
    }
  }

  const outline = shade(collarColor, -25);

  if (side === "front") {
    // logo — DADA KIRI (wearer's left) = sisi KANAN gambar (x ≈ 234)
    if (assets.logoImg) {
      const lw = 52;
      ctx.drawImage(assets.logoImg, 232, 168, lw, lw);
    }
    // sponsor (text mode atau image mode)
    if (state.sponsorMode === "image" && assets.sponsorImg) {
      const sw = 200;
      const sh = 60;
      ctx.drawImage(assets.sponsorImg, 200 - sw / 2, 250, sw, sh);
    } else if (state.sponsorMode === "text" && state.sponsorText) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = accentColor;
      roundRect(ctx, 96, 244, 208, 44, 8);
      ctx.fill();
      ctx.restore();
      drawText(
        ctx,
        state.sponsorText.toUpperCase().slice(0, 14),
        200,
        267,
        24,
        outline,
        accentColor,
        family,
      );
    }
    // NO chest number on front (per revisi poin 4)
    // front custom texts
    state.customTexts
      .filter((t) => t.value && (t.placement === "frontTop" || t.placement === "frontBottom"))
      .forEach((t) => {
        const { x, y } = placementXY(t.placement);
        drawText(ctx, t.value.toUpperCase().slice(0, 16), x, y, 26, t.color, outline, family);
      });
  } else {
    // back big number
    if (state.playerNumber) {
      drawText(
        ctx,
        state.playerNumber.slice(0, 2),
        200,
        290,
        150,
        accentColor,
        outline,
        family,
      );
    }
    // back player name
    if (state.playerName) {
      drawText(
        ctx,
        state.playerName.toUpperCase().slice(0, 12),
        200,
        150,
        38,
        accentColor,
        outline,
        family,
      );
    }
    state.customTexts
      .filter((t) => t.value && (t.placement === "backTop" || t.placement === "backBottom"))
      .forEach((t) => {
        const { x, y } = placementXY(t.placement);
        drawText(ctx, t.value.toUpperCase().slice(0, 16), x, y, 28, t.color, outline, family);
      });
  }

  ctx.restore();

  if (clip) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = shade(bodyColor, -30);
    ctx.stroke(path);
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function exportFrontPng(state: JerseyState): Promise<string> {
  const assets = await resolveAssets(state);
  const c = document.createElement("canvas");
  await drawJerseyTexture(c, "front", state, assets, false);
  return c.toDataURL("image/png");
}

export async function buildDesignSheet(state: JerseyState): Promise<string> {
  const assets = await resolveAssets(state);
  const front = document.createElement("canvas");
  const back = document.createElement("canvas");
  await drawJerseyTexture(front, "front", state, assets, false);
  await drawJerseyTexture(back, "back", state, assets, false);

  const pad = 40;
  const sheet = document.createElement("canvas");
  sheet.width = front.width + back.width + pad * 3;
  sheet.height = front.height + pad * 2 + 60;
  const ctx = sheet.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  ctx.drawImage(front, pad, pad + 60);
  ctx.drawImage(back, pad * 2 + front.width, pad + 60);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 34px Arial, sans-serif";
  ctx.fillText("JerseyGen — Design Sheet", pad, 52);
  ctx.font = "500 26px Arial, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("DEPAN", pad, pad + 48);
  ctx.fillText("BELAKANG", pad * 2 + front.width, pad + 48);
  return sheet.toDataURL("image/png");
}

export async function buildThumbnail(state: JerseyState): Promise<string> {
  const assets = await resolveAssets(state);
  const full = document.createElement("canvas");
  await drawJerseyTexture(full, "front", state, assets, false);
  const thumb = document.createElement("canvas");
  thumb.width = 200;
  thumb.height = Math.round((200 * full.height) / full.width);
  const ctx = thumb.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, thumb.width, thumb.height);
  ctx.drawImage(full, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL("image/jpeg", 0.7);
}

/**
 * Draw the body color + pattern onto a square canvas, for use as the body
 * material `map` on the 3D model. NO graphics / silhouette — just color+pattern
 * so it tiles across the GLB body's UV as a fabric texture.
 */
export function drawBodyMapTexture(
  canvas: HTMLCanvasElement,
  state: JerseyState,
  assets: TextureAssets = {},
) {
  const W = 512;
  const H = 512;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = state.zones.body.color;
  ctx.fillRect(0, 0, W, H);

  if (state.patternType === "solid") return;

  ctx.save();
  ctx.globalAlpha = state.patternOpacity;
  ctx.fillStyle = state.patternColor;
  ctx.strokeStyle = state.patternColor;
  const s = state.patternScale || 1;

  // 3D body patterns: dibuat tebal supaya tetap kelihatan setelah dipetakan
  // ke UV jersey (kalau terlalu tipis, akan hilang waktu di-render).
  if (state.patternType === "stripes") {
    const w = 64 / s;
    for (let x = -w; x < W + w; x += w * 2) ctx.fillRect(x, 0, w, H);
  } else if (state.patternType === "hoops") {
    const h = 64 / s;
    for (let y = -h; y < H + h; y += h * 2) ctx.fillRect(0, y, W, h);
  } else if (state.patternType === "halves") {
    ctx.fillRect(0, 0, W / 2, H);
  } else if (state.patternType === "sash") {
    ctx.lineWidth = 140 / s;
    ctx.beginPath();
    ctx.moveTo(-40, H);
    ctx.lineTo(W + 40, -40);
    ctx.stroke();
  } else if (state.patternType === "chevron") {
    // step must divide H (512) so the chevron pattern is tileable.
    const step = 128 / s;
    ctx.lineWidth = 22 / s;
    for (let y = -step; y < H + step * 2; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W / 2, y + step / 2);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  } else if (state.patternType === "grid") {
    const g = 96 / s;
    ctx.lineWidth = 12 / s;
    for (let x = 0; x < W; x += g) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += g) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  } else if (state.patternType === "custom" && assets.patternImg) {
    const src: CanvasImageSource = state.patternTinted
      ? tintImage(assets.patternImg, state.patternColor)
      : assets.patternImg;
    const tile = document.createElement("canvas");
    const size = Math.max(60, 220 / s);
    tile.width = size;
    tile.height = size;
    tile.getContext("2d")!.drawImage(src, 0, 0, size, size);
    const pat = ctx.createPattern(tile, "repeat");
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, W, H);
    }
  }
  ctx.restore();
}

export async function resolveAssets(state: JerseyState): Promise<TextureAssets> {
  const assets: TextureAssets = {};
  if (state.patternType === "custom" && state.patternDataUrl) {
    try {
      assets.patternImg = await loadImage(state.patternDataUrl);
    } catch {
      assets.patternImg = null;
    }
  }
  if (state.logoDataUrl) {
    try {
      assets.logoImg = await loadImage(state.logoDataUrl);
    } catch {
      assets.logoImg = null;
    }
  }
  if (state.sponsorMode === "image" && state.sponsorImageDataUrl) {
    try {
      assets.sponsorImg = await loadImage(state.sponsorImageDataUrl);
    } catch {
      assets.sponsorImg = null;
    }
  }
  return assets;
}
