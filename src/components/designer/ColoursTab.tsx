"use client";

import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { useJerseyStore } from "@/lib/store";
import { ZONE_LABELS, type ZoneId } from "@/types/jersey";

const ZONE_ORDER: ZoneId[] = [
  "body",
  "sleeves",
  "collar",
  "frontPanel",
  "backPanel",
  "stitches",
];

const PALETTE = [
  "#0a0a0a", "#1d4ed8", "#0ea5e9", "#10b981",
  "#facc15", "#ff5b04", "#ef4444", "#a855f7",
  "#ec4899", "#ffffff", "#6f6f68", "#7c2d12",
];

export function ColoursTab() {
  const { zones, setZoneColor, setZoneVisible, patternColor, setPatternColor } =
    useJerseyStore();

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-ink-soft">
        Klik <Eye className="inline h-3 w-3" /> untuk tampilkan/sembunyikan bagian.
        Klik kotak warna untuk ganti.
      </p>
      <div className="space-y-2">
        {ZONE_ORDER.map((id) => {
          const z = zones[id];
          return (
            <ZoneRow
              key={id}
              label={ZONE_LABELS[id]}
              color={z.color}
              visible={z.visible}
              onChangeColor={(c) => setZoneColor(id, c)}
              onToggle={() => setZoneVisible(id, !z.visible)}
            />
          );
        })}
      </div>

      <div className="border-t border-line pt-4">
        <ZoneRow
          label="Warna Pattern"
          color={patternColor}
          visible
          onChangeColor={setPatternColor}
        />
      </div>
    </div>
  );
}

function ZoneRow({
  label,
  color,
  visible,
  onChangeColor,
  onToggle,
}: {
  label: string;
  color: string;
  visible: boolean;
  onChangeColor: (c: string) => void;
  onToggle?: () => void;
}) {
  return (
    <details className="group overflow-hidden rounded-xl border border-line bg-paper/50 open:bg-surface">
      <summary
        className={clsx(
          "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition",
          !visible && "opacity-55",
        )}
      >
        {onToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggle();
            }}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-mute hover:bg-line/60"
            aria-label={visible ? "Sembunyikan" : "Tampilkan"}
            title={visible ? "Klik untuk sembunyikan" : "Klik untuk tampilkan"}
          >
            {visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        )}
        <span
          className="h-7 w-7 shrink-0 rounded-md border border-line"
          style={{ background: color }}
        />
        <span className="flex-1 text-sm font-bold text-ink">{label}</span>
        <span className="font-mono text-[11px] uppercase text-ink-soft">
          {color}
        </span>
      </summary>
      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
            Pilih warna
          </span>
          <input
            type="color"
            value={color}
            onChange={(e) => onChangeColor(e.target.value)}
            className="h-7 w-9 rounded-md border border-line"
            aria-label={`${label} picker`}
          />
        </div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeColor(c)}
              className="aspect-square rounded-lg border border-line transition hover:scale-110"
              style={{
                background: c,
                boxShadow:
                  color.toLowerCase() === c ? "0 0 0 2px #ff5b04" : undefined,
              }}
              aria-label={`Pilih warna ${c}`}
            />
          ))}
        </div>
      </div>
    </details>
  );
}
