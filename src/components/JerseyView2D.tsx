"use client";

import { useEffect, useRef } from "react";
import { drawJerseyTexture, resolveAssets } from "@/lib/jerseyTexture";
import type { JerseyState } from "@/types/jersey";

/**
 * Flat 2D jersey preview. Renders the same `drawJerseyTexture` used for
 * export/print/AI reference — so what the user sees IS what they get.
 * Re-renders whenever state or front/back toggle changes.
 */
export default function JerseyView2D({
  state,
  showBack,
}: {
  state: JerseyState;
  showBack: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    (async () => {
      const assets = await resolveAssets(state);
      if (cancelled) return;
      await drawJerseyTexture(
        canvas,
        showBack ? "back" : "front",
        state,
        assets,
        true,
        true,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [state, showBack]);

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        className="block h-auto w-auto max-h-full max-w-full"
      />
    </div>
  );
}
