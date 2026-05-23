"use client";

import clsx from "clsx";
import { Trash2, Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import { useJerseyStore } from "@/lib/store";
import { PATTERN_LABELS, type PatternType } from "@/types/jersey";

const PRESETS: PatternType[] = [
  "solid",
  "stripes",
  "hoops",
  "halves",
  "sash",
  "chevron",
  "grid",
];

export function PatternTab() {
  const {
    patternType,
    setPatternType,
    patternColor,
    patternScale,
    setPatternScale,
    patternOpacity,
    setPatternOpacity,
    patternDataUrl,
    setPatternDataUrl,
    patternTinted,
    setPatternTinted,
    zones,
  } = useJerseyStore();
  const bodyColor = zones.body.color;
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (PNG/JPG/SVG)");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("Ukuran pattern maksimal 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPatternDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      <div>
        <Label>Pilih Pattern</Label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPatternType(p)}
              className={clsx(
                "flex flex-col items-center gap-1.5 rounded-xl border-2 p-1.5 transition",
                patternType === p
                  ? "border-accent bg-accent-soft"
                  : "border-line hover:border-line-strong",
              )}
            >
              <PatternThumb type={p} base={bodyColor} color={patternColor} />
              <span className="text-[9px] font-semibold leading-tight text-ink-mute">
                {PATTERN_LABELS[p]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Pattern Sendiri (Upload)</Label>
        {patternDataUrl ? (
          <div
            className={clsx(
              "flex items-center gap-3 rounded-xl border-2 p-3 transition",
              patternType === "custom" ? "border-accent bg-accent-soft" : "border-line",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={patternDataUrl}
              alt="Pattern"
              className="h-14 w-14 rounded-lg border border-line object-cover"
            />
            <div className="flex-1">
              <button
                onClick={() => setPatternType("custom")}
                className="text-sm font-bold text-accent hover:underline"
              >
                Pakai pattern ini
              </button>
              <p className="text-xs text-ink-soft">Pattern di-tile ke seluruh jersey.</p>
            </div>
            <button
              onClick={() => {
                setPatternDataUrl(null);
                setPatternType("solid");
              }}
              className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
              aria-label="Hapus pattern"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line-strong bg-paper/60 py-7 text-ink-soft transition hover:border-accent hover:bg-accent-soft/60"
          >
            <Upload className="h-5 w-5" />
            <span className="text-sm font-bold text-ink-mute">
              Upload Pattern / Template
            </span>
            <span className="text-[11px]">PNG / JPG / SVG — maks 3MB</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        {patternType === "custom" && patternDataUrl && (
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-mute">
            <input
              type="checkbox"
              checked={patternTinted}
              onChange={(e) => setPatternTinted(e.target.checked)}
              className="h-4 w-4 rounded border-line-strong accent-accent"
            />
            Warnai ulang pattern dengan warna pattern
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Slider
          label="Ukuran Pattern"
          min={0.5}
          max={2}
          step={0.1}
          value={patternScale}
          onChange={setPatternScale}
        />
        <Slider
          label="Transparansi"
          min={0.15}
          max={1}
          step={0.05}
          value={patternOpacity}
          onChange={setPatternOpacity}
        />
      </div>
      <p className="text-[11px] text-ink-soft">
        Warna pattern diatur di tab <span className="font-bold text-ink-mute">Warna</span>.
      </p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
      {children}
    </p>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
          {label}
        </span>
        <span className="text-xs font-semibold text-ink-mute">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function PatternThumb({
  type,
  base,
  color,
}: {
  type: PatternType;
  base: string;
  color: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const S = 44;
    c.width = S;
    c.height = S;
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.85;
    if (type === "stripes") {
      for (let x = 0; x < S; x += 12) ctx.fillRect(x, 0, 6, S);
    } else if (type === "hoops") {
      for (let y = 0; y < S; y += 12) ctx.fillRect(0, y, S, 6);
    } else if (type === "halves") {
      ctx.fillRect(0, 0, S / 2, S);
    } else if (type === "sash") {
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-4, S);
      ctx.lineTo(S + 4, -4);
      ctx.stroke();
    } else if (type === "chevron") {
      ctx.lineWidth = 4;
      for (let y = -6; y < S + 6; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(S / 2, y + 6);
        ctx.lineTo(S, y);
        ctx.stroke();
      }
    } else if (type === "grid") {
      ctx.lineWidth = 2;
      for (let x = 0; x < S; x += 11) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, S);
        ctx.stroke();
      }
      for (let y = 0; y < S; y += 11) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(S, y);
        ctx.stroke();
      }
    }
  }, [type, base, color]);
  return <canvas ref={ref} className="h-11 w-11 rounded-lg" />;
}
