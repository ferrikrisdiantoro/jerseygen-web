"use client";

import { useEffect, useRef, useState } from "react";
import { compositePsdJersey } from "@/lib/psd";
import { fontFamily, type JerseyState } from "@/types/jersey";

export type EnhancedJerseyState = JerseyState & {
  logoScale?: number;
  logoPosition?: { x: number; y: number };
  logoDataUrl?: string | null;
  apparelDataUrl?: string | null;
  apparelScale?: number;
  apparelPosition?: { x: number; y: number };
  apparelColor?: string;
  sponsorScale?: number;
  sponsorPosition?: { x: number; y: number };
  sponsorColor?: string;
  sponsorImageDataUrl?: string | null;
  customFontUrl?: string | null;
  namePosition?: { x: number; y: number };
  numberPosition?: { x: number; y: number };
  textStrokeType?: "none" | "thin" | "medium" | "thick";
  textStrokeColor?: string;
};

// Fungsi stateKey tetap sama untuk mendeteksi perubahan
function stateKey(s: EnhancedJerseyState, showBack: boolean): string {
  return [showBack ? "B" : "F", s.zones.body?.color, s.patternType, s.playerName, s.playerNumber].join("~");
}

export default function JerseyViewPSD({
  state,
  showBack,
}: {
  state: EnhancedJerseyState;
  showBack: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderIdRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = stateKey(state, showBack);
  // Deep-track semua field (logo, sponsor, posisi, dll) supaya render presisi.
  const deepKey = JSON.stringify(state);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setiap render dapat ID unik. Hanya render TERBARU yang boleh menyalin
    // hasil ke canvas terlihat — mencegah dua render async menggambar
    // tumpang tindih (bug "logo/baju jadi dua" / kedip).
    const myId = ++renderIdRef.current;

    const render = async () => {
      setLoading(true);
      try {
        setError(null);

        const fontName = fontFamily(state.font);
        if (document.fonts && !fontName.startsWith("custom-")) {
          try {
            await document.fonts.load(`bold 20px "${state.font}"`);
          } catch {
            // font belum siap — pakai fallback
          }
        }

        // Render ke canvas OFFSCREEN dulu (bukan ke canvas terlihat).
        const offscreen = document.createElement("canvas");
        await compositePsdJersey(
          offscreen,
          showBack ? "back" : "front",
          state as any,
          0.5,
        );

        // Kalau sudah ada render lain yang lebih baru, buang hasil ini.
        if (myId !== renderIdRef.current) return;

        // Salin atomik ke canvas terlihat (clear penuh dulu -> no ghosting).
        canvas.width = offscreen.width;
        canvas.height = offscreen.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreen, 0, 0);

        setLoading(false);
      } catch (e) {
        if (myId !== renderIdRef.current) return;
        setError(e instanceof Error ? e.message : "Gagal render");
        setLoading(false);
      }
    };

    render();
  }, [key, deepKey, showBack]);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <canvas 
        ref={canvasRef} 
        className="block h-auto w-auto max-h-full max-w-full"
        // Atribut ini memastikan html2canvas tidak melewatkan elemen ini
        style={{ imageRendering: 'pixelated' }} 
      />
      {loading && (
        <div className="absolute inset-0 grid place-items-center text-xs font-medium text-ink-soft bg-white/50 backdrop-blur-[1px]">
          Memuat…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center text-xs text-rose-600 bg-white/80">
          {error}
        </div>
      )}
    </div>
  );
}