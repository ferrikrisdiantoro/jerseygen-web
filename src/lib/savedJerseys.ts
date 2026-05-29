"use client";

import { get, set, keys, del } from 'idb-keyval';
import type { JerseyState, SavedJersey } from "@/types/jersey";

// Kita gunakan prefix untuk mengelola daftar ID yang tersimpan
const LIST_KEY = "jerseygen_ids";

export async function listSavedJerseys(): Promise<SavedJersey[]> {
  try {
    const ids = await get<string[]>(LIST_KEY) || [];
    const results = await Promise.all(ids.map(id => get<SavedJersey>(id)));
    // Filter jika ada data yang null, lalu urutkan
    return results
      .filter((j): j is SavedJersey => !!j)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveJersey(
  ownerName: string,
  state: JerseyState,
  thumbnail: string,
): Promise<SavedJersey> {
  const id = Math.random().toString(36).slice(2, 10);
  const item: SavedJersey = { id, ownerName, createdAt: Date.now(), thumbnail, state };
  
  // 1. Simpan item jersey ke kunci uniknya sendiri
  await set(id, item);
  
  // 2. Perbarui daftar ID saja (bukan seluruh objek)
  const ids = await get<string[]>(LIST_KEY) || [];
  await set(LIST_KEY, [id, ...ids]);
  
  return item;
}

export async function deleteSavedJersey(id: string) {
  // 1. Hapus data jersey-nya
  await del(id);
  
  // 2. Hapus ID dari daftar indeks
  const ids = await get<string[]>(LIST_KEY) || [];
  await set(LIST_KEY, ids.filter(i => i !== id));
}