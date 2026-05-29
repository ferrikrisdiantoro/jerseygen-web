"use client";

import clsx from "clsx";
import { Grid2x2, Palette, RefreshCw, Shapes, Type } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useJerseyStore, extractJerseyState } from "@/lib/store";
import { PatternTab } from "./designer/PatternTab";
import { ColoursTab } from "./designer/ColoursTab";
import { TextTab } from "./designer/TextTab";
import { LogosTab } from "./designer/LogosTab";
import { PhotoUploadSection } from "./PhotoUploadSection";
import { SavePanel } from "./SavePanel";
import { ExportBar } from "./ExportBar";
import { GenerateBar } from "./GenerateBar";

const JerseyViewPSD = dynamic(() => import("./JerseyViewPSD"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm font-medium text-ink-soft">
      Memuat preview…
    </div>
  ),
});

const TABS = [
  { id: "pattern", label: "Pattern", icon: Shapes },
  { id: "colours", label: "Warna", icon: Palette },
  { id: "text", label: "Teks", icon: Type },
  { id: "logos", label: "Logo", icon: Grid2x2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function JerseyDesigner() {
  const [tab, setTab] = useState<TabId>("pattern");
  const [showBack, setShowBack] = useState(false);
  const store = useJerseyStore();
  
  const jerseyState = extractJerseyState(store);

  return (
    <section
      id="designer"
      className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-5 px-4 py-6 sm:gap-6 sm:py-10 lg:grid lg:grid-cols-[minmax(0,440px)_1fr]"
    >
      {/* 3D / PSD Canvas Preview */}
      <div className="order-1 mx-auto w-full min-w-0 max-w-md lg:sticky lg:top-[88px] lg:max-w-none lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-3 shadow-card sm:p-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#ecebe7]">
            <JerseyViewPSD state={jerseyState as any} showBack={showBack} />
            
            <button
              onClick={() => setShowBack((v) => !v)}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-card transition hover:bg-ink/85"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {showBack ? "Lihat Depan" : "Lihat Belakang"}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panels */}
      <div className="order-2 min-w-0 space-y-4">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="flex gap-1 overflow-x-auto border-b border-line px-2 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-bold transition",
                  tab === t.id ? "border-accent text-accent" : "border-transparent text-ink-soft hover:text-ink",
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
          
          <div className="p-4 sm:p-5">
            {tab === "pattern" && <PatternTab />}
            {tab === "colours" && <ColoursTab />}
            {tab === "text" && <TextTab />}
            {tab === "logos" && <LogosTab />}
          </div>
        </div>

        <PhotoUploadSection />
        <SavePanel />
        <ExportBar />
        <GenerateBar />
      </div>

      {/* --- DIV PENAMPUNG PRINT (Landscape Layout) --- */}
      <div 
  id="print-pattern-container" 
  style={{ 
    position: 'absolute', 
    top: '-9999px', 
    left: '-9999px', 
    width: '3508px', 
    height: '2480px', 
    background: 'white',
    padding: '80px',
    border: '40px solid #000', 
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif'
  }}
>
  {/* HEADER BOX */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '10px solid #000', paddingBottom: '30px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
    <img src="/path-to-77d6d6c8a560d86161fece0ef4b412cfd.png" alt="SNICA" style={{ height: '140px' }} />
    <div>
      <h1 style={{ fontSize: '100px', margin: 0, fontWeight: '900' }}>SNICA INDONESIA</h1>
    </div>
  </div>
  <div style={{ 
      fontSize: '60px', 
      fontWeight: 'bold', 
      border: '8px solid #000', 
      padding: '20px 60px',
      display: 'flex',          // <---
      justifyContent: 'center', // <--- Horizontal center
      alignItems: 'center',     // <--- Vertical center
      minWidth: '300px'
  }}>
    {jerseyState.playerName || "PLAYER NAME"}
  </div>
</div>

{/* --- CONTAINER WRAPPER UNTUK DEPAN & BELAKANG --- */}
<div style={{ display: 'flex', justifyContent: 'center', gap: '80px', marginTop: '60px', marginBottom: '60px' }}>
  
  {/* DEPAN */}
  <div style={{ textAlign: 'center' }}>
    <h2 style={{ fontSize: '70px', marginBottom: '30px' }}>DEPAN</h2>
    <div style={{ width: '1600px', height: '1500px', border: '5px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ transform: 'scale(1.9)', transformOrigin: 'center' }}>
        <JerseyViewPSD state={jerseyState as any} showBack={false} />
      </div>
    </div>
  </div>

  {/* BELAKANG */}
  <div style={{ textAlign: 'center' }}>
    <h2 style={{ fontSize: '70px', marginBottom: '30px' }}>BELAKANG</h2>
    <div style={{ width: '1600px', height: '1500px', border: '5px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ transform: 'scale(1.9)', transformOrigin: 'center' }}>
        <JerseyViewPSD state={jerseyState as any} showBack={true} />
      </div>
    </div>
  </div>

</div>

{/* --- FOOTER --- */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '10px solid #000', paddingTop: '30px', marginTop: 'auto' }}>
  <div style={{ fontSize: '40px', fontWeight: 'bold' }}>1. Collar | 2. Depan | 3. Belakang | 4. Lengan Kanan | 5. Lengan Kiri</div>
  
  {/* Kotak Ukuran: Dibuat flex agar angka/huruf di tengah */}
  <div style={{ 
      width: '250px', 
      height: '250px', 
      border: '8px solid #000', 
      display: 'flex',          // <---
      justifyContent: 'center', // <--- Horizontal center
      alignItems: 'center',     // <--- Vertical center
      fontSize: '120px', 
      fontWeight: 'bold' 
  }}>
    {jerseyState.prodSize || "M"}
  </div>
</div>
</div>
    </section>
  );
}