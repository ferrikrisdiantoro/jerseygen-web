"use client";

import { create } from "zustand";
import type { JerseyState, JerseyDesign, JerseySize } from "@/types/jersey";

interface JerseyStore extends JerseyState {
  setDesign: (d: JerseyDesign) => void;
  setPrimary: (c: string) => void;
  setSecondary: (c: string) => void;
  setAccent: (c: string) => void;
  setPlayerName: (s: string) => void;
  setPlayerNumber: (s: string) => void;
  setSponsorText: (s: string) => void;
  setLogo: (url: string | null) => void;
  setSize: (s: JerseySize) => void;
  setUseFace: (b: boolean) => void;
  setUserPhoto: (url: string | null) => void;
  reset: () => void;
}

const initial: JerseyState = {
  design: "city",
  primaryColor: "#1d4ed8",
  secondaryColor: "#0b1f57",
  accentColor: "#fbbf24",
  playerName: "",
  playerNumber: "",
  sponsorText: "",
  logoDataUrl: null,
  size: "regular",
  useFace: false,
  userPhotoDataUrl: null,
};

export const useJerseyStore = create<JerseyStore>((set) => ({
  ...initial,
  setDesign: (design) => set({ design }),
  setPrimary: (primaryColor) => set({ primaryColor }),
  setSecondary: (secondaryColor) => set({ secondaryColor }),
  setAccent: (accentColor) => set({ accentColor }),
  setPlayerName: (playerName) => set({ playerName }),
  setPlayerNumber: (playerNumber) => set({ playerNumber }),
  setSponsorText: (sponsorText) => set({ sponsorText }),
  setLogo: (logoDataUrl) => set({ logoDataUrl }),
  setSize: (size) => set({ size }),
  setUseFace: (useFace) => set({ useFace }),
  setUserPhoto: (userPhotoDataUrl) => set({ userPhotoDataUrl }),
  reset: () => set(initial),
}));
