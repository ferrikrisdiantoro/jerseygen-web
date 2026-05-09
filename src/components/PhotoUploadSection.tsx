"use client";

import clsx from "clsx";
import { Camera, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useJerseyStore } from "@/lib/store";
import { SIZE_LABELS, type JerseySize } from "@/types/jersey";

const SIZES: JerseySize[] = ["oversize", "regular", "press"];

export function PhotoUploadSection() {
  const {
    useFace, setUseFace,
    userPhotoDataUrl, setUserPhoto,
    size, setSize,
  } = useJerseyStore();
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUserPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Pakai Wajah Sendiri</p>
          <p className="text-xs text-slate-500">
            Aktifkan dan upload foto, AI akan generate kamu memakai jersey ini.
          </p>
        </div>
        <Toggle checked={useFace} onChange={setUseFace} />
      </div>

      {useFace && (
        <div className="mb-4">
          {userPhotoDataUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userPhotoDataUrl}
                alt="Foto kamu"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">Foto siap digunakan</p>
                <p>Wajah dari foto akan digunakan saat generate.</p>
              </div>
              <button
                onClick={() => setUserPhoto(null)}
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 hover:bg-rose-50"
                aria-label="Hapus foto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white py-6 text-sm font-medium text-slate-500 transition hover:border-sky-400 hover:bg-sky-50/50"
            >
              <Camera className="h-5 w-5" /> Upload Foto Kamu
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Ukuran Jersey (efek visual)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={clsx(
                "rounded-lg border-2 px-3 py-2 text-sm font-semibold transition",
                size === s
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
              )}
            >
              {SIZE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-sky-500" : "bg-slate-300",
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}
