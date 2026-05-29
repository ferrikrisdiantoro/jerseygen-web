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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = stateKey(state, showBack);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const render = async () => {
      setLoading(true);
      try {
        setError(null);
        
        // 1. Dapatkan nama font CSS yang valid
        const fontName = fontFamily(state.font);
        
        // 2. Load font secara eksplisit ke document.fonts
        // Jika font bawaan, dia akan mencoba load. 
        // Jika kustom (custom-xxx), dia akan terlewati (tidak error)
        if (document.fonts && !fontName.startsWith("custom-")) {
            try {
                await document.fonts.load(`bold 20px "${state.font}"`);
            } catch (err) {
                console.warn("Font mungkin belum siap atau tidak ditemukan:", fontName);
            }
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // 3. Render jersey
        await compositePsdJersey(canvas, showBack ? "back" : "front", state as any, 0.5);
        
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Gagal render");
        setLoading(false);
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [key, state, showBack]); // Menggunakan key agar trigger lebih presisi

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