"use client";

import { useEffect, useRef } from "react";
import { drawJerseyTexture, resolveAssets } from "@/lib/jerseyTexture";
import type { JerseyState } from "@/types/jersey";

// 1. Perluas tipe data lokal agar mendukung custom font dan transformasi logo/apparel
type EnhancedJerseyState = Omit<JerseyState, "font"> & {
  font: string; // Mengizinkan string bebas untuk nama custom font
  customFontUrl?: string | null;
  logoScale?: number;
  logoPosition?: { x: number; y: number };
  apparelScale?: number;
  apparelPosition?: { x: number; y: number };
  sponsorScale?: number;
  sponsorPosition?: { x: number; y: number };
};

/**
 * Flat 2D jersey preview. Renders the same `drawJerseyTexture` used for
 * export/print/AI reference — so what the user sees IS what they get.
 * Re-renders whenever state or front/back toggle changes.
 */
export const getJerseyCanvasData = () => {
  const canvas = document.querySelector('canvas'); // Pastikan ini menunjuk ke canvas jersey
  return canvas ? canvas.toDataURL("image/png") : null;
};

export default function JerseyView2D({
  state,
  showBack,
}: {
  state: EnhancedJerseyState; 
  showBack: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mengonversi seluruh state menjadi string untuk pelacakan perubahan yang akurat secara mendalam (deep tracking)
  const stateString = JSON.stringify(state);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    
    (async () => {
      // Mengurai kembali string state menjadi objek bersih untuk fungsi render
      const parsedState = JSON.parse(stateString) as EnhancedJerseyState;
      
      // FIX: Jika user menggunakan font hasil upload, paksa browser untuk load font-nya ke memori canvas terlebih dahulu
      if (parsedState.font && parsedState.font.startsWith("uploaded-")) {
        try {
          // Menunggu browser berhasil mengenali format teks @font-face sebelum menggambar tekstur
          await document.fonts.load(`1em "${parsedState.font}"`);
        } catch (error) {
          console.error("Gagal memuat custom font ke canvas:", error);
        }
      }

      const assets = await resolveAssets(parsedState as any);
      if (cancelled) return;
      
      await drawJerseyTexture(
        canvas,
        showBack ? "back" : "front",
        parsedState as any,
        assets,
        true,
        true,
      );
    })();
    
    return () => {
      cancelled = true;
    };
  // Menggunakan stateString sebagai dependency utama, menjamin re-render instan saat slider digeser
  }, [stateString, showBack]);

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        className="block h-auto w-auto max-h-full max-w-full"
      />
    </div>
  );
}