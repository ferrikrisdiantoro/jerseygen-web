"use client";

import { type JerseyState, type ProductionSize, SIZE_CHART } from "@/types/jersey";
import html2canvas from 'html2canvas';

export const JERSEY_W = 400;
export const JERSEY_H = 480;
const SCALE = 2.5;

export const JERSEY_PATH = "M60 80 Q90 55 135 50 L165 75 Q200 130 235 75 L265 50 Q310 55 340 80 L375 170 L305 195 Q315 290 295 432 Q295 452 280 452 L120 452 Q105 452 105 432 Q85 290 95 195 L25 170 Z";
export const JERSEY_PATH_BACK = "M60 80 Q90 55 135 50 L168 62 L232 62 L265 50 Q310 55 340 80 L375 170 L305 195 Q315 290 295 432 Q295 452 280 452 L120 452 Q105 452 105 432 Q85 290 95 195 L25 170 Z";

const SLEEVE_LEFT = "M60 80 Q90 55 135 50 L95 195 L25 170 Z";
const SLEEVE_RIGHT = "M340 80 Q310 55 265 50 L305 195 L375 170 Z";

export interface TextureAssets {
  patternImg?: HTMLImageElement | null;
  logoImg?: HTMLImageElement | null;
  sponsorImg?: HTMLImageElement | null;
}

// --- UTILS ---
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
  const adj = (v: number) => Math.max(0, Math.min(255, v + Math.round(255 * (percent / 100))));
  return `#${((1 << 24) | (adj((num >> 16) & 0xff) << 16) | (adj((num >> 8) & 0xff) << 8) | adj(num & 0xff)).toString(16).slice(1)}`;
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

// --- DRAWING LOGIC ---
function drawPattern(ctx: CanvasRenderingContext2D, state: JerseyState, assets: TextureAssets) {
  const { patternType, patternColor, patternScale, patternOpacity } = state;
  if (patternType === "solid") return;

  ctx.save();
  ctx.globalAlpha = patternOpacity;
  ctx.fillStyle = patternColor;
  ctx.strokeStyle = patternColor;
  const s = patternScale || 1;

  switch (patternType) {
    case "stripes":
      const w = 26 / s;
      for (let x = -w; x < JERSEY_W + w; x += w * 2) ctx.fillRect(x, 0, w, JERSEY_H);
      break;
    case "hoops":
      const h = 30 / s;
      for (let y = -h; y < JERSEY_H + h; y += h * 2) ctx.fillRect(0, y, JERSEY_W, h);
      break;
    case "halves":
      ctx.fillRect(0, 0, JERSEY_W / 2, JERSEY_H);
      break;
    case "sash":
      ctx.lineWidth = 70 / s;
      ctx.beginPath(); 
      ctx.moveTo(-40, JERSEY_H); 
      ctx.lineTo(JERSEY_W + 40, -40); 
      ctx.stroke();
      break;
    case "custom":
      if (assets.patternImg) {
        const src = state.patternTinted ? tintImage(assets.patternImg, patternColor) : assets.patternImg;
        const tile = document.createElement("canvas");
        const size = Math.max(40, 140 / s);
        tile.width = size; 
        tile.height = size;
        tile.getContext("2d")!.drawImage(src, 0, 0, size, size);
        const pat = ctx.createPattern(tile, "repeat");
        if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, JERSEY_W, JERSEY_H); }
      }
      break;
  }
  ctx.restore();
}

export async function resolveAssets(state: JerseyState): Promise<TextureAssets> {
  const assets: TextureAssets = {};
  if (state.patternType === "custom" && state.patternDataUrl) try { assets.patternImg = await loadImage(state.patternDataUrl); } catch {}
  if (state.logoDataUrl) try { assets.logoImg = await loadImage(state.logoDataUrl); } catch {}
  if (state.sponsorMode === "image" && state.sponsorImageDataUrl) try { assets.sponsorImg = await loadImage(state.sponsorImageDataUrl); } catch {}
  return assets;
}

export async function drawJerseyTexture(canvas: HTMLCanvasElement, side: "front" | "back", state: any, assets: TextureAssets = {}, transparent = true, clip = true) {
  const family = state.font || "Inter";
  await document.fonts.load(`16px "${family}"`).catch(() => {});
  
  canvas.width = JERSEY_W * SCALE;
  canvas.height = JERSEY_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.clearRect(0, 0, JERSEY_W, JERSEY_H);

  if (!transparent) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, JERSEY_W, JERSEY_H); }

  const path = new Path2D(side === "back" ? JERSEY_PATH_BACK : JERSEY_PATH);
  ctx.save();
  if (clip) ctx.clip(path);

  ctx.fillStyle = state.zones.body.color;
  ctx.fillRect(0, 0, JERSEY_W, JERSEY_H);

  if (state.zones.sleeves.visible) {
    ctx.fillStyle = state.zones.sleeves.color;
    ctx.fill(new Path2D(SLEEVE_LEFT));
    ctx.fill(new Path2D(SLEEVE_RIGHT));
  }

  drawPattern(ctx, state, assets);
  
  ctx.restore();
  if (clip) { ctx.lineWidth = 3; ctx.strokeStyle = shade(state.zones.body.color, -30); ctx.stroke(path); }
}

export async function buildThumbnail(state: JerseyState): Promise<string> {
  const assets = await resolveAssets(state);
  const full = document.createElement("canvas");
  await drawJerseyTexture(full, "front", state, assets, false);
  
  const thumb = document.createElement("canvas");
  thumb.width = 120; 
  thumb.height = Math.round((120 * full.height) / full.width);
  
  const ctx = thumb.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, thumb.width, thumb.height);
  ctx.drawImage(full, 0, 0, thumb.width, thumb.height);
  
  return thumb.toDataURL("image/jpeg", 0.4); 
}

export async function buildDesignSheet(state: JerseyState): Promise<string> {
  try {
    const assets = await resolveAssets(state);
    const front = document.createElement("canvas");
    const back = document.createElement("canvas");
    
    await drawJerseyTexture(front, "front", state, assets, false);
    await drawJerseyTexture(back, "back", state, assets, false);

    const pad = 40;
    const sheet = document.createElement("canvas");
    sheet.width = front.width + back.width + pad * 3;
    sheet.height = front.height + pad * 2 + 180; 
    
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

    const prodSize = (state.prodSize || "M") as ProductionSize;
    const dim = SIZE_CHART[prodSize];
    
    if (dim) {
      const infoY = front.height + pad + 100;
      ctx.fillStyle = "#000000";
      ctx.font = "700 28px Arial, sans-serif";
      ctx.fillText("DETAIL PRODUKSI:", pad, infoY);
      
      ctx.font = "500 24px Arial, sans-serif";
      ctx.fillText(`Ukuran: ${prodSize}`, pad, infoY + 40);
      ctx.fillText(`Dimensi: ${dim.width} x ${dim.length}`, pad, infoY + 75);
      ctx.fillText(`Lengan: ${state.sleeve === "long" ? "Panjang" : "Pendek"}`, pad, infoY + 110);
    }
    
    return sheet.toDataURL("image/png");
  } catch (error) {
    console.error("Gagal membuat Design Sheet:", error);
    throw error;
  }
}

export async function exportFrontPng(state: JerseyState): Promise<string> {
  const assets = await resolveAssets(state);
  const c = document.createElement("canvas");
  await drawJerseyTexture(c, "front", state, assets, false);
  return c.toDataURL("image/png");
}

export const handlePrintPattern = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Elemen print tidak ditemukan!");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const link = document.createElement("a");
    link.download = "Pola-Siap-Cetak.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Gagal melakukan print:", err);
  }
};