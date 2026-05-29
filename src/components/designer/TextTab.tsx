"use client";

import React, { useRef, useEffect, useState } from "react";
import { Plus, Trash2, Upload, Move, Type } from "lucide-react"; // Ditambahkan Type icon untuk bagian stroke
import { useJerseyStore } from "@/lib/store";
import { FONT_OPTIONS, PLACEMENT_LABELS, type TextPlacement } from "@/types/jersey";

const PLACEMENTS: TextPlacement[] = ["frontTop", "frontBottom", "backTop", "backBottom"];

interface UploadedFont {
  id: string;
  name: string;
  data: string;
}

export function TextTab() {
  // AMBIL STATE & SETTER POSISI SERTA STROKE BARU DARI STORE
  const {
    playerName, playerNumber,
    setPlayerName, setPlayerNumber,
    font, setFont, setCustomFont,
    customTexts, addCustomText, updateCustomText, removeCustomText,
    namePosition, setNamePosition,
    numberPosition, setNumberPosition,
    // ================= AMBIL STATE & SETTER STROKE BARU DI SINI =================
    textStrokeType, setTextStrokeType,
    textStrokeColor, setTextStrokeColor,
  } = useJerseyStore() as any;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([]);

  // Load & Suntik font saat refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("jersey_fonts_v2");
        if (saved) {
          const list: UploadedFont[] = JSON.parse(saved);
          setUploadedFonts(list);

          // Suntik ke Head secara bersih
          list.forEach((f) => {
            if (!document.getElementById(`style-${f.id}`)) {
              const styleEl = document.createElement("style");
              styleEl.id = `style-${f.id}`;
              styleEl.innerHTML = `@font-face { font-family: '${f.id}'; src: url('${f.data}') format('truetype'); }`;
              document.head.appendChild(styleEl);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleFontUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;

      const fontId = `custom-${Date.now()}`;
      const cleanName = file.name.split(".")[0].replace(/\s+/g, " ");

      const styleEl = document.createElement("style");
      styleEl.id = `style-${fontId}`;
      styleEl.innerHTML = `@font-face { font-family: '${fontId}'; src: url('${base64}') format('truetype'); }`;
      document.head.appendChild(styleEl);

      const updated = [...uploadedFonts, { id: fontId, name: cleanName, data: base64 }];
      setUploadedFonts(updated);
      localStorage.setItem("jersey_fonts_v2", JSON.stringify(updated));

      setCustomFont(base64);
      setFont(fontId);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Field label="Font Teks" hint="Pilih font Anda">
  <div className="space-y-2">
    <select
      value={font || ""}
      onChange={(e) => setFont(e.target.value)}
      className="jg-input w-full p-2 border border-line rounded-lg"
    >
      <option value="">-- Pilih Font --</option>
      
      {/* Jika ada font di uploadFonts, tampilkan di sini */}
      {uploadedFonts && uploadedFonts.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>

    <input
      type="file"
      accept=".ttf,.otf"
      ref={fileInputRef}
      onChange={handleFontUpload}
      className="hidden"
    />
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-paper/80 py-2 text-xs font-bold text-ink hover:bg-surface transition"
    >
      <Upload className="h-3.5 w-3.5" /> Upload Font Baru (.ttf / .otf)
    </button>
  </div>
</Field>

      {/* ================= EDIT BARU: KONTROL KETEBALAN & WARNA STROKE NAMA & NOMOR ================= */}
      <Field label="Garis Tepi Teks (Stroke)" hint="khusus nama & nomor punggung">
        <div className="rounded-xl border border-line bg-surface/50 p-3 space-y-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-ink-soft uppercase tracking-wider">
            <Type className="h-3 w-3" /> Gaya Garis Tepi
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Pilihan Ketebalan Dropdown */}
            <div>
              <label className="text-[10px] text-ink-soft block mb-1">Ketebalan</label>
              <select
                value={textStrokeType || "none"}
                onChange={(e) => setTextStrokeType(e.target.value)}
                className="w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-xs font-medium outline-none focus:border-accent"
              >
                <option value="none">Tanpa Stroke</option>
                <option value="thin">Tipis</option>
                <option value="medium">Sedang</option>
                <option value="thick">Tebal</option>
              </select>
            </div>

            {/* Pilihan Warna Input Color */}
            <div>
              <label className="text-[10px] text-ink-soft block mb-1">Warna Stroke</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textStrokeColor || "#000000"}
                  onChange={(e) => setTextStrokeColor(e.target.value)}
                  disabled={textStrokeType === "none"}
                  className="h-8 w-12 rounded-md border border-line bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <span className="text-[10px] font-mono uppercase text-ink-soft">
                  {textStrokeType === "none" ? "—" : textStrokeColor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Field>

      {/* ================= FIELD NAMA PUNGGUNG + SLIDER POSISI ================= */}
      <Field label="Nama Punggung" hint="tampil di belakang">
        <div className="space-y-3">
          <input
            maxLength={12}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="MESSI"
            className="jg-input"
          />
          
          {/* SLIDER PERGESERAN NAMA */}
          <div className="rounded-xl border border-line bg-surface/50 p-3 space-y-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-ink-soft uppercase tracking-wider">
              <Move className="h-3 w-3" /> Atur Posisi Nama
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-ink-soft block mb-1">Kiri / Kanan ({namePosition?.x ?? 0})</label>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={namePosition?.x ?? 0}
                  onChange={(e) => setNamePosition({ x: Number(e.target.value), y: namePosition?.y ?? 0 })}
                  className="w-full accent-ink"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-soft block mb-1">Atas / Bawah ({namePosition?.y ?? 0})</label>
                <input
                  type="range"
                  min="-300"
                  max="300"
                  value={namePosition?.y ?? 0}
                  onChange={(e) => setNamePosition({ x: namePosition?.x ?? 0, y: Number(e.target.value) })}
                  className="w-full accent-ink"
                />
              </div>
            </div>
          </div>
        </div>
      </Field>

      {/* ================= FIELD NOMOR PUNGGUNG + SLIDER POSISI ================= */}
      <Field label="Nomor Punggung" hint="hanya di belakang (2 digit)">
        <div className="space-y-3">
          <input
            maxLength={2}
            inputMode="numeric"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="10"
            className="jg-input"
          />

          {/* SLIDER PERGESERAN NOMOR */}
          <div className="rounded-xl border border-line bg-surface/50 p-3 space-y-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-ink-soft uppercase tracking-wider">
              <Move className="h-3 w-3" /> Atur Posisi Nomor
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-ink-soft block mb-1">Kiri / Kanan ({numberPosition?.x ?? 0})</label>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={numberPosition?.x ?? 0}
                  onChange={(e) => setNumberPosition({ x: Number(e.target.value), y: numberPosition?.y ?? 0 })}
                  className="w-full accent-ink"
                />
              </div>
              <div>
                <label className="text-[10px] text-ink-soft block mb-1">Atas / Bawah ({numberPosition?.y ?? 0})</label>
                <input
                  type="range"
                  min="-300"
                  max="300"
                  value={numberPosition?.y ?? 0}
                  onChange={(e) => setNumberPosition({ x: numberPosition?.x ?? 0, y: Number(e.target.value) })}
                  className="w-full accent-ink"
                />
              </div>
            </div>
          </div>
        </div>
      </Field>

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
          {customTexts.map((t: any) => (
            <div key={t.id} className="flex items-center gap-2 rounded-xl border border-line bg-paper/60 p-2">
              <input
                maxLength={16}
                value={t.value}
                onChange={(e) => updateCustomText(t.id, { value: e.target.value })}
                placeholder="Teks…"
                className="jg-input !w-0 min-w-0 flex-1 !py-1.5"
              />
              <select
                value={t.placement}
                onChange={(e) => updateCustomText(t.id, { placement: e.target.value as TextPlacement })}
                className="min-w-0 shrink rounded-lg border border-line bg-surface px-1.5 py-1.5 text-xs font-medium outline-none focus:border-accent"
              >
                {PLACEMENTS.map((p) => (
                  <option key={p} value={p}>{PLACEMENT_LABELS[p]}</option>
                ))}
              </select>
              <input
                type="color"
                value={t.color}
                onChange={(e) => updateCustomText(t.id, { color: e.target.value })}
                className="h-8 w-8 rounded-md border border-line"
              />
              <button
                onClick={() => removeCustomText(t.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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