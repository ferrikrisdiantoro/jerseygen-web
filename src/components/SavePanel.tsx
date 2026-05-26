"use client";

import { BookmarkPlus, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { exportPsdThumbnail as buildThumbnail } from "@/lib/psd";
import {
  deleteSavedJersey,
  listSavedJerseys,
  saveJersey,
} from "@/lib/savedJerseys";
import type { SavedJersey } from "@/types/jersey";
import { Panel } from "./ui/Panel";

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
    <Panel
      icon={<BookmarkPlus className="h-[18px] w-[18px]" />}
      title="Simpan Jersey"
      desc="Simpan desain ini atas nama tertentu, bisa dibuka lagi nanti."
    >
      <div className="flex gap-2">
        <input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Nama pemilik jersey…"
          maxLength={30}
          className="jg-input min-w-0 flex-1"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ink/85 disabled:opacity-60"
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
        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-accent transition hover:text-accent-dark"
      >
        <FolderOpen className="h-4 w-4" />
        Jersey Tersimpan ({saved.length})
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {saved.length === 0 && (
            <p className="text-xs text-ink-soft">Belum ada jersey tersimpan.</p>
          )}
          {saved.map((j) => (
            <div
              key={j.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-paper/60 p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={j.thumbnail}
                alt={j.ownerName}
                className="h-12 w-10 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{j.ownerName}</p>
                <p className="text-[11px] text-ink-soft">
                  {new Date(j.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleLoad(j)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink transition hover:bg-paper"
              >
                Buka
              </button>
              <button
                onClick={() => handleDelete(j.id)}
                className="grid h-7 w-7 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                aria-label="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          {toast}
        </p>
      )}
    </Panel>
  );
}
