"use client";

import clsx from "clsx";
import { ImageIcon, Plus, Trash2, Type } from "lucide-react";
import { useRef } from "react";
import { useJerseyStore } from "@/lib/store";
import {
  FONT_OPTIONS,
  PLACEMENT_LABELS,
  type JerseyFont,
  type TextPlacement,
} from "@/types/jersey";

const PLACEMENTS: TextPlacement[] = [
  "frontTop",
  "frontBottom",
  "backTop",
  "backBottom",
];

export function TextTab() {
  const {
    playerName, playerNumber,
    setPlayerName, setPlayerNumber,
    sponsorMode, setSponsorMode,
    sponsorText, setSponsorText,
    sponsorImageDataUrl, setSponsorImage,
    font, setFont,
    customTexts, addCustomText, updateCustomText, removeCustomText,
  } = useJerseyStore();

  const sponsorInputRef = useRef<HTMLInputElement>(null);

  function onSponsorFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar sponsor maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSponsorImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <Field label="Font Teks" hint="berlaku untuk semua teks di jersey">
        <select
          value={font}
          onChange={(e) => setFont(e.target.value as JerseyFont)}
          className="jg-input"
          style={{ fontFamily: FONT_OPTIONS.find((f) => f.value === font)?.family }}
        >
          {FONT_OPTIONS.map((f) => (
            <option
              key={f.value}
              value={f.value}
              style={{ fontFamily: f.family }}
            >
              {f.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Nama Punggung" hint="tampil di belakang">
        <input
          maxLength={12}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="MESSI"
          className="jg-input"
        />
      </Field>

      <Field label="Nomor Punggung" hint="hanya di belakang (2 digit)">
        <input
          maxLength={2}
          inputMode="numeric"
          value={playerNumber}
          onChange={(e) => setPlayerNumber(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="10"
          className="jg-input"
        />
      </Field>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            Sponsor Dada
          </span>
          <div className="inline-flex overflow-hidden rounded-md border border-line bg-paper">
            <button
              type="button"
              onClick={() => setSponsorMode("text")}
              className={clsx(
                "flex items-center gap-1 px-2 py-1 text-[11px] font-bold transition",
                sponsorMode === "text"
                  ? "bg-ink text-white"
                  : "text-ink-mute hover:bg-line/40",
              )}
            >
              <Type className="h-3 w-3" /> Teks
            </button>
            <button
              type="button"
              onClick={() => setSponsorMode("image")}
              className={clsx(
                "flex items-center gap-1 px-2 py-1 text-[11px] font-bold transition",
                sponsorMode === "image"
                  ? "bg-ink text-white"
                  : "text-ink-mute hover:bg-line/40",
              )}
            >
              <ImageIcon className="h-3 w-3" /> Gambar
            </button>
          </div>
        </div>

        {sponsorMode === "text" ? (
          <input
            maxLength={14}
            value={sponsorText}
            onChange={(e) => setSponsorText(e.target.value)}
            placeholder="ZAMBURGER"
            className="jg-input"
          />
        ) : sponsorImageDataUrl ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-paper/60 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sponsorImageDataUrl}
              alt="Sponsor"
              className="h-12 w-20 rounded object-contain"
            />
            <p className="flex-1 text-xs text-ink-mute">
              Gambar sponsor terpasang.
            </p>
            <button
              onClick={() => setSponsorImage(null)}
              className="grid h-8 w-8 place-items-center rounded-md text-rose-600 hover:bg-rose-50"
              aria-label="Hapus gambar sponsor"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => sponsorInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line-strong bg-paper/60 py-5 text-ink-soft hover:border-accent hover:bg-accent-soft/60"
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-sm font-bold text-ink-mute">
              Upload Gambar Sponsor
            </span>
            <span className="text-[10px]">PNG / JPG — maks 2MB</span>
          </button>
        )}
        <input
          ref={sponsorInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onSponsorFile}
        />
      </div>

      <div className="border-t border-line pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">
            Teks Tambahan
          </span>
          <button
            onClick={addCustomText}
            disabled={customTexts.length >= 4}
            className="flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold text-white hover:bg-ink/85 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </div>

        {customTexts.length === 0 && (
          <p className="text-xs text-ink-soft">
            Belum ada teks tambahan. Klik “Tambah” untuk menulis teks bebas.
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
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
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
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">{label}</span>
        {hint && <span className="text-[10px] text-ink-soft">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
