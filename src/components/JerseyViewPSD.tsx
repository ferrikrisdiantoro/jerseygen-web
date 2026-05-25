"use client";

import { useEffect, useRef, useState } from "react";
import { compositePsdJersey } from "@/lib/psd";
import type { JerseyState } from "@/types/jersey";

function stateKey(s: JerseyState, showBack: boolean): string {
  const z = s.zones;
  return [
    showBack ? "B" : "F",
    z.body.color, z.body.visible,
    z.sleeves.color, z.sleeves.visible,
    z.collar.color, z.collar.visible,
    z.frontPanel.color, z.frontPanel.visible,
    z.backPanel.color, z.backPanel.visible,
    z.stitches.color, z.stitches.visible,
    s.playerName, s.playerNumber,
    s.sponsorMode, s.sponsorText,
    s.sponsorImageDataUrl ? "s" + s.sponsorImageDataUrl.length : "0",
    s.logoDataUrl ? "l" + s.logoDataUrl.length : "0",
    s.font,
    s.customTexts.map((t) => `${t.value}|${t.color}|${t.placement}`).join(","),
  ].join("~");
}

export default function JerseyViewPSD({
  state,
  showBack,
}: {
  state: JerseyState;
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
    (async () => {
      try {
        setError(null);
        await compositePsdJersey(canvas, showBack ? "back" : "front", state, 0.5);
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Gagal render");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className="relative flex h-full w-full items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        className="block h-auto w-auto max-h-full max-w-full"
      />
      {loading && (
        <div className="absolute inset-0 grid place-items-center text-xs font-medium text-ink-soft">
          Memuat jersey…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center text-xs text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}
