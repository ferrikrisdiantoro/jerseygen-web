"use client";

import clsx from "clsx";
import { Camera, Trash2, UserRound } from "lucide-react";
import { useRef } from "react";
import { useJerseyStore } from "@/lib/store";
import { SIZE_LABELS, type JerseySize } from "@/types/jersey";
import { Panel } from "./ui/Panel";

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
    <Panel
      icon={<UserRound className="h-[18px] w-[18px]" />}
      title="Pakai Wajah Sendiri"
      desc="Aktifkan & upload foto, AI generate kamu memakai jersey ini."
    >
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-paper/70 px-3 py-2.5">
        <span className="text-sm font-bold text-ink">
          {useFace ? "Wajah sendiri: AKTIF" : "Wajah sendiri: NONAKTIF"}
        </span>
        <Toggle checked={useFace} onChange={setUseFace} />
      </div>

      {useFace && (
        <div className="mb-4">
          {userPhotoDataUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-line bg-paper/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userPhotoDataUrl}
                alt="Foto kamu"
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1 text-xs text-ink-mute">
                <p className="text-sm font-bold text-ink">Foto siap digunakan</p>
                <p>Wajah dari foto dipakai saat generate.</p>
              </div>
              <button
                onClick={() => setUserPhoto(null)}
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                aria-label="Hapus foto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-paper/60 py-6 text-sm font-bold text-ink-mute transition hover:border-accent hover:bg-accent-soft/60"
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
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
          Ukuran Jersey (efek visual)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={clsx(
                "rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition",
                size === s
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-surface text-ink-mute hover:border-line-strong",
              )}
            >
              {SIZE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </Panel>
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
        checked ? "bg-accent" : "bg-line-strong",
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
