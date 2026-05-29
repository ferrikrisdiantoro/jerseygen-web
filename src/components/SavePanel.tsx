"use client";

import { BookmarkPlus, FolderOpen, Loader2, Trash2, Copy, Save } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { buildThumbnail } from "@/lib/jerseyTexture";
import { deleteSavedJersey, listSavedJerseys, saveJersey } from "@/lib/savedJerseys";
// Tambahkan import tipe baru di bawah:
import type { SavedJersey, ProductionSize, SleeveType } from "@/types/jersey"; 
import { Panel } from "./ui/Panel";

export function SavePanel() {
  const store = useJerseyStore();
  const [ownerName, setOwnerName] = useState("");
  // Tambahkan state baru untuk ukuran produksi & lengan
  const [prodSize, setProdSize] = useState<ProductionSize>("M");
  const [sleeve, setSleeve] = useState<SleeveType>("short");
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<SavedJersey[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeJerseyId, setActiveJerseyId] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    const data = await listSavedJerseys();
    setSaved(data || []);
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  async function handleSave() {
    if (!ownerName.trim()) return alert("Isi nama pemilik!");
    setSaving(true);
    try {
      const state = extractJerseyState(store);
      if (!state) throw new Error("Data state tidak ditemukan");
      
      // Gabungkan state dari store dengan pilihan ukuran produksi
      const finalState = { ...state, prodSize, sleeve };
      
      const thumb = await buildThumbnail(finalState as any);
      await saveJersey(ownerName.trim(), finalState as any, thumb);
      
      await refreshList();
      setOwnerName("");
      setToast("Berhasil disimpan!");
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!activeJerseyId) return;
    setSaving(true);
    try {
      const state = extractJerseyState(store);
      const finalState = { ...state, prodSize, sleeve };
      
      const thumb = await buildThumbnail(finalState as any);
      await deleteSavedJersey(activeJerseyId);
      await saveJersey(ownerName.trim(), finalState as any, thumb);
      
      await refreshList();
      setToast("Perubahan tersimpan.");
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error(err);
      alert("Gagal update.");
    } finally {
      setSaving(false);
    }
  }

  // ... fungsi handleDelete & handleDuplicate tetap sama ...
  async function handleDelete(id: string) {
    if (!confirm("Hapus jersey tersimpan ini?")) return;
    await deleteSavedJersey(id);
    await refreshList();
    if (id === activeJerseyId) {
      setActiveJerseyId(null);
      setOwnerName("");
      store.reset();
    }
  }

  async function handleDuplicate(j: SavedJersey) {
    const newName = prompt("Nama pemilik baru:", `${j.ownerName} - Copy`);
    if (!newName?.trim()) return;
    try {
      await saveJersey(newName.trim(), j.state, j.thumbnail);
      await refreshList();
      setToast("Duplikat berhasil disimpan.");
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error(err);
      alert("Gagal duplikat.");
    }
  }

  function handleLoad(j: SavedJersey) {
    store.loadState(j.state);
    setOwnerName(j.ownerName);
    setActiveJerseyId(j.id);
    // Load ukuran produksi yang tersimpan
    setProdSize(j.state.prodSize || "M");
    setSleeve(j.state.sleeve || "short");
    setOpen(false);
    setToast(`Jersey "${j.ownerName}" dimuat.`);
    setTimeout(() => setToast(null), 2000);
  }

  return (
    <Panel icon={<BookmarkPlus className="h-[18px] w-[18px]" />} title="Simpan Jersey" desc="Simpan desain Anda.">
      <div className="flex flex-col gap-3">
        {/* Menu Pilihan Produksi */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-ink-soft uppercase">Ukuran</label>
            <select value={prodSize} onChange={(e) => setProdSize(e.target.value as ProductionSize)} className="jg-input w-full mt-1 text-sm">
              {["S", "M", "L", "XL", "XXL", "XXXL"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-soft uppercase">Lengan</label>
            <select value={sleeve} onChange={(e) => setSleeve(e.target.value as SleeveType)} className="jg-input w-full mt-1 text-sm">
              <option value="short">Pendek</option>
              <option value="long">Panjang</option>
            </select>
          </div>
        </div>

        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Nama pemilik..." className="jg-input" />
        
        {activeJerseyId ? (
          <button onClick={handleUpdate} disabled={saving} className="bg-emerald-600 text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Simpan Perubahan
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving} className="bg-ink text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />} Simpan Baru
          </button>
        )}
      </div>

      {/* ... bagian daftar jersey tersimpan tetap sama ... */}
      <button onClick={() => setOpen(!open)} className="mt-4 flex items-center gap-2 text-xs font-bold text-accent">
        <FolderOpen className="h-4 w-4" /> Jersey Tersimpan ({saved.length})
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {saved.map((j) => (
            <div key={j.id} className={`flex items-center gap-3 border p-2 rounded-xl ${j.id === activeJerseyId ? "border-emerald-500 bg-emerald-50/40" : ""}`}>
              <img src={j.thumbnail} className="h-10 w-8 rounded object-cover" />
              <div className="flex-1 text-sm font-bold truncate">{j.ownerName}</div>
              <button onClick={() => handleDuplicate(j)} className="p-1 hover:bg-paper rounded"><Copy className="h-4 w-4" /></button>
              <button onClick={() => handleLoad(j)} className="text-xs border px-2 py-1 rounded">Buka</button>
              <button onClick={() => handleDelete(j.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
      {toast && <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded">{toast}</div>}
    </Panel>
  );
}