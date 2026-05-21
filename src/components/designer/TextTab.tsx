"use client";

import { Plus, Trash2 } from "lucide-react";
import { useJerseyStore } from "@/lib/store";
import { PLACEMENT_LABELS, type TextPlacement } from "@/types/jersey";

const PLACEMENTS: TextPlacement[] = [
  "frontTop",
  "frontBottom",
  "backTop",
  "backBottom",
];

export function TextTab() {
  const {
    playerName, playerNumber, sponsorText,
    setPlayerName, setPlayerNumber, setSponsorText,
    customTexts, addCustomText, updateCustomText, removeCustomText,
  } = useJerseyStore();

  return (
    <div className="space-y-4">
      <Field label="Nama Punggung" hint="tampil di belakang">
        <input
          maxLength={12}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="MESSI"
          className="jg-input"
        />
      </Field>
      <Field label="Nomor Punggung" hint="depan & belakang">
        <input
          maxLength={2}
          inputMode="numeric"
          value={playerNumber}
          onChange={(e) => setPlayerNumber(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="10"
          className="jg-input"
        />
      </Field>
      <Field label="Sponsor Dada" hint="tampil di depan">
        <input
          maxLength={14}
          value={sponsorText}
          onChange={(e) => setSponsorText(e.target.value)}
          placeholder="ZAMBURGER"
          className="jg-input"
        />
      </Field>

      <div className="border-t border-line pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            Teks Tambahan
          </span>
          <button
            onClick={addCustomText}
            disabled={customTexts.length >= 4}
            className="flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-ink/85 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </div>

        {customTexts.length === 0 && (
          <p className="text-xs text-ink-soft">
            Belum ada teks tambahan. Klik “Tambah” untuk menulis teks bebas di jersey.
          </p>
        )}

        <div className="space-y-2">
          {customTexts.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-xl border border-line bg-paper/60 p-2"
            >
              <input
                maxLength={16}
                value={t.value}
                onChange={(e) => updateCustomText(t.id, { value: e.target.value })}
                placeholder="Teks…"
                className="jg-input !w-0 min-w-0 flex-1 !py-1.5"
              />
              <select
                value={t.placement}
                onChange={(e) =>
                  updateCustomText(t.id, { placement: e.target.value as TextPlacement })
                }
                className="min-w-0 shrink rounded-lg border border-line bg-surface px-1.5 py-1.5 text-xs font-medium outline-none focus:border-accent"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>
                    {PLACEMENT_LABELS[p]}
                  </option>
                ))}
              </select>
              <input
                type="color"
                value={t.color}
                onChange={(e) => updateCustomText(t.id, { color: e.target.value })}
                className="h-8 w-8 rounded-md border border-line"
                aria-label="Warna teks"
              />
              <button
                onClick={() => removeCustomText(t.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                aria-label="Hapus teks"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
          {label}
        </span>
        {hint && <span className="text-[10px] text-ink-soft">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
