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

      {/* custom text — owayo style */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Teks Tambahan
          </p>
          <button
            onClick={addCustomText}
            disabled={customTexts.length >= 4}
            className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </div>

        {customTexts.length === 0 && (
          <p className="text-xs text-slate-400">
            Belum ada teks tambahan. Klik “Tambah” untuk menulis teks bebas di jersey.
          </p>
        )}

        <div className="space-y-2">
          {customTexts.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2"
            >
              <input
                maxLength={16}
                value={t.value}
                onChange={(e) => updateCustomText(t.id, { value: e.target.value })}
                placeholder="Tulis teks…"
                className="jg-input flex-1 !py-1.5"
              />
              <select
                value={t.placement}
                onChange={(e) =>
                  updateCustomText(t.id, { placement: e.target.value as TextPlacement })
                }
                className="rounded-md border border-slate-200 bg-white px-1.5 py-1.5 text-xs"
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
                className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                aria-label="Warna teks"
              />
              <button
                onClick={() => removeCustomText(t.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-rose-600 hover:bg-rose-50"
                aria-label="Hapus teks"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .jg-input {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          font-size: 14px;
          background: white;
          outline: none;
          transition: border-color 120ms;
        }
        .jg-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }
      `}</style>
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
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
