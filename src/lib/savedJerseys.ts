"use client";

import type { JerseyState, SavedJersey } from "@/types/jersey";

const KEY = "jerseygen_saved_v1";

export function listSavedJerseys(): SavedJersey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedJersey[];
    return Array.isArray(arr) ? arr.sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

export function saveJersey(
  ownerName: string,
  state: JerseyState,
  thumbnail: string,
): SavedJersey {
  const item: SavedJersey = {
    id: Math.random().toString(36).slice(2, 10),
    ownerName: ownerName.trim() || "Tanpa Nama",
    createdAt: Date.now(),
    thumbnail,
    state,
  };
  const all = listSavedJerseys();
  all.unshift(item);
  // keep latest 20 to stay within localStorage limits
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 20)));
  return item;
}

export function deleteSavedJersey(id: string) {
  const all = listSavedJerseys().filter((j) => j.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
