"use client";

import { useJerseyStore } from "@/lib/store";

const PALETTE = [
  "#0f172a", "#1d4ed8", "#0ea5e9", "#10b981",
  "#facc15", "#f97316", "#ef4444", "#a855f7",
  "#ec4899", "#ffffff", "#64748b", "#7c2d12",
];

export function ColoursTab() {
  const {
    primaryColor, secondaryColor, accentColor, patternColor,
    setPrimary, setSecondary, setAccent, setPatternColor,
  } = useJerseyStore();

  return (
    <div className="space-y-5">
      <ColorRow label="Warna Utama" value={primaryColor} onChange={setPrimary} />
      <ColorRow label="Warna Sekunder (lengan)" value={secondaryColor} onChange={setSecondary} />
      <ColorRow label="Warna Aksen / Strip" value={accentColor} onChange={setAccent} />
      <ColorRow label="Warna Pattern" value={patternColor} onChange={setPatternColor} />
    </div>
  );
}

function ColorRow({
  label, value, onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </label>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded border border-slate-200"
          aria-label={`${label} picker`}
        />
      </div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="aspect-square rounded-md border border-slate-200 transition hover:scale-110"
            style={{ background: c, boxShadow: value === c ? "0 0 0 2px #0ea5e9" : undefined }}
            aria-label={`Pilih warna ${c}`}
          />
        ))}
      </div>
    </div>
  );
}
