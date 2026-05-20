"use client";

import clsx from "clsx";
import { BookmarkPlus, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { buildThumbnail } from "@/lib/jerseyTexture";
import {
  deleteSavedJersey,
  listSavedJerseys,
  saveJersey,
} from "@/lib/savedJerseys";
import type { SavedJersey } from "@/types/jersey";

export function SavePanel() {
  const store = useJerseyStore();
  const [ownerName, setOwnerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SavedJersey[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSaved(listSavedJerseys());
  }, []);

  async function handleSave() {
    if (!ownerName.trim()) {
      alert("Isi nama pemilik jersey dulu ya.");
      return;
    }
    try {
      setSaving(true);
      const state = extractJerseyState(store);
      const thumb = await buildThumbnail(state);
      saveJersey(ownerName, state, thumb);
      setSaved(listSavedJerseys());
      setToast(`Jersey atas nama "${ownerName.trim()}" tersimpan.`);
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert("Gagal menyimpan jersey.");
    } finally {
      setSaving(false);
    }
  }

  function handleLoad(j: SavedJersey) {
    store.loadState(j.state);
    setOwnerName(j.ownerName);
    setOpen(false);
    setToast(`Jersey "${j.ownerName}" dimuat.`);
    setTimeout(() => setToast(null), 3000);
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus jersey tersimpan ini?")) return;
    deleteSavedJersey(id);
    setSaved(listSavedJerseys());
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-1 text-sm font-bold text-slate-900">Simpan Jersey</p>
      <p className="mb-3 text-xs text-slate-500">
        Simpan desain ini atas nama tertentu, bisa dibuka lagi nanti.
      </p>

      <div className="flex gap-2">
        <input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Nama pemilik jersey…"
          maxLength={30}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookmarkPlus className="h-4 w-4" />
          )}
          Simpan
        </button>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:underline"
      >
        <FolderOpen className="h-4 w-4" />
        Jersey Tersimpan ({saved.length})
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {saved.length === 0 && (
            <p className="text-xs text-slate-400">Belum ada jersey tersimpan.</p>
          )}
          {saved.map((j) => (
            <div
              key={j.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={j.thumbnail}
                alt={j.ownerName}
                className="h-12 w-10 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {j.ownerName}
                </p>
                <p className="text-[11px] text-slate-400">
                  {new Date(j.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleLoad(j)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Buka
              </button>
              <button
                onClick={() => handleDelete(j.id)}
                className="grid h-7 w-7 place-items-center rounded-md text-rose-600 hover:bg-rose-50"
                aria-label="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <p
          className={clsx(
            "mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700",
          )}
        >
          {toast}
        </p>
      )}
    </div>
  );
}
