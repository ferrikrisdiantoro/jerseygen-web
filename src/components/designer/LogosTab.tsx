"use client";

import clsx from "clsx";
import { ImageIcon, Trash2, Upload, RefreshCw } from "lucide-react";
import { useRef } from "react";
import { useJerseyStore } from "@/lib/store";

export function LogosTab() {
  const {
    // State Logo Klub
    logoDataUrl, setLogo,
    logoScale, setLogoScale,
    logoPosition, setLogoPosition,
    
    // State Logo Apparel
    apparelDataUrl, setApparel,
    apparelScale, setApparelScale,
    apparelPosition, setApparelPosition,
    apparelColor, setApparelColor,

    // State Sponsor Utama (Murni Gambar)
    sponsorImageDataUrl, setSponsorImage,
    sponsorScale, setSponsorScale,
    sponsorPosition, setSponsorPosition,
    sponsorColor, setSponsorColor,
  } = useJerseyStore();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const apparelInputRef = useRef<HTMLInputElement>(null);
  const sponsorInputRef = useRef<HTMLInputElement>(null);

  // 1. Fungsi Validasi & Upload Logo Klub
  function onLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { 
      alert("Ukuran logo maksimal 2MB"); 
      return; 
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
      setLogoScale(1);
      setLogoPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  }

  // 2. Fungsi Validasi & Upload Logo Apparel
  function onApparelFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { 
      alert("Ukuran logo apparel maksimal 2MB"); 
      return; 
    }
    const reader = new FileReader();
    reader.onload = () => {
      setApparel(reader.result as string);
      setApparelScale(1);
      setApparelPosition({ x: 0, y: 0 });
      setApparelColor("#ffffff");
    };
    reader.readAsDataURL(file);
  }

  // 3. Fungsi Validasi & Upload Gambar Sponsor Utama
  function onSponsorFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { 
      alert("Ukuran gambar sponsor maksimal 2MB"); 
      return; 
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSponsorImage(reader.result as string);
      if (setSponsorScale) setSponsorScale(1);
      if (setSponsorPosition) setSponsorPosition({ x: 0, y: 0 });
      if (setSponsorColor) setSponsorColor("#ffffff");
    };
    reader.readAsDataURL(file);
  }

  function resetLogoTransform() {
    setLogoScale(1);
    setLogoPosition({ x: 0, y: 0 });
  }

  function resetApparelTransform() {
    setApparelScale(1);
    setApparelPosition({ x: 0, y: 0 });
  }

  function resetSponsorTransform() {
    if (setSponsorScale) setSponsorScale(1);
    if (setSponsorPosition) setSponsorPosition({ x: 0, y: 0 });
  }

  return (
    <div className="space-y-8">
      {/* ================= SECTION 1: LOGO KLUB (DADA KIRI) ================= */}
      <section>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Logo Klub / Dada</h3>
        {logoDataUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-line bg-paper/60 p-4">
              <div className="grid h-16 w-16 place-items-center rounded-lg border border-line bg-surface overflow-hidden">
                <img src={logoDataUrl} alt="Logo Klub" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">Logo Klub Terpasang</p>
                <p className="text-xs text-ink-soft">Format PNG direkomendasikan</p>
              </div>
              <button 
                onClick={() => setLogo(null)} 
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-line bg-paper/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Atur Posisi & Ukuran Logo</span>
                <button onClick={resetLogoTransform} className="flex items-center gap-1 text-xs text-ink-mute hover:text-accent transition font-medium">
                  <RefreshCw className="h-3 w-3" /> Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Ukuran</span><span>{Math.round((logoScale ?? 1) * 100)}%</span></div>
                <input type="range" min="0.3" max="2.5" step="0.05" value={logoScale ?? 1} onChange={(e) => setLogoScale(parseFloat(e.target.value))} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Posisi Horizontal (X)</span><span>{(logoPosition?.x ?? 0) > 0 ? `+${logoPosition?.x ?? 0}` : logoPosition?.x ?? 0} px</span></div>
                <input type="range" min="-250" max="250" step="1" value={logoPosition?.x ?? 0} onChange={(e) => setLogoPosition({ x: parseInt(e.target.value), y: logoPosition?.y ?? 0 })} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Posisi Vertikal (Y)</span><span>{(logoPosition?.y ?? 0) > 0 ? `+${logoPosition?.y ?? 0}` : logoPosition?.y ?? 0} px</span></div>
                <input type="range" min="-250" max="250" step="1" value={logoPosition?.y ?? 0} onChange={(e) => setLogoPosition({ x: logoPosition?.x ?? 0, y: parseInt(e.target.value) })} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => logoInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-paper/60 px-4 py-8 text-ink-soft transition hover:border-accent hover:bg-accent-soft/60">
            <Upload className="h-6 w-6" /> <span className="text-sm font-bold text-ink-mute">Upload Logo Klub</span>
          </button>
        )}
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoFile} />
      </section>

      {/* ================= SECTION 2: LOGO APPAREL (DADA KANAN) ================= */}
      <section className="border-t border-line pt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Logo Apparel (Specs, Nike, Adidas)</h3>
        {apparelDataUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-line bg-paper/60 p-4">
              <div className="grid h-16 w-16 place-items-center rounded-lg border border-line bg-surface overflow-hidden">
                <img src={apparelDataUrl} alt="Logo Apparel" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">Apparel Terpasang</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-ink-soft font-semibold">Warna Logo:</label>
                  <input 
                    type="color" 
                    value={apparelColor ?? "#ffffff"} 
                    onChange={(e) => setApparelColor(e.target.value)}
                    className="h-6 w-10 cursor-pointer rounded border border-line-strong bg-transparent p-0"
                  />
                  <span className="text-xs font-mono text-ink-soft uppercase">{apparelColor}</span>
                </div>
              </div>
              <button 
                onClick={() => setApparel(null)} 
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-line bg-paper/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Atur Posisi & Ukuran Apparel</span>
                <button onClick={resetApparelTransform} className="flex items-center gap-1 text-xs text-ink-mute hover:text-accent transition font-medium">
                  <RefreshCw className="h-3 w-3" /> Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Ukuran Apparel</span><span>{Math.round((apparelScale ?? 1) * 100)}%</span></div>
                <input type="range" min="0.3" max="2.5" step="0.05" value={apparelScale ?? 1} onChange={(e) => setApparelScale(parseFloat(e.target.value))} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Posisi Horizontal (X)</span><span>{(apparelPosition?.x ?? 0) > 0 ? `+${apparelPosition?.x ?? 0}` : apparelPosition?.x ?? 0} px</span></div>
                <input type="range" min="-250" max="250" step="1" value={apparelPosition?.x ?? 0} onChange={(e) => setApparelPosition({ x: parseInt(e.target.value), y: apparelPosition?.y ?? 0 })} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Posisi Vertikal (Y)</span><span>{(apparelPosition?.y ?? 0) > 0 ? `+${apparelPosition?.y ?? 0}` : apparelPosition?.y ?? 0} px</span></div>
                <input type="range" min="-250" max="250" step="1" value={apparelPosition?.y ?? 0} onChange={(e) => setApparelPosition({ x: apparelPosition?.x ?? 0, y: parseInt(e.target.value) })} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => apparelInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-paper/60 px-4 py-8 text-ink-soft transition hover:border-accent hover:bg-accent-soft/60">
            <Upload className="h-6 w-6" /> <span className="text-sm font-bold text-ink-mute">Upload Logo Apparel (PNG)</span>
          </button>
        )}
        <input ref={apparelInputRef} type="file" accept="image/*" className="hidden" onChange={onApparelFile} />
      </section>

      {/* ================= SECTION 3: SPONSOR UTAMA (MURNI GAMBAR & SKALA & WARNA) ================= */}
      <section className="border-t border-line pt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-soft">Sponsor Utama Tengah</h3>
        
        {sponsorImageDataUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-line bg-paper/60 p-4">
              <div className="grid h-16 w-24 place-items-center rounded-lg border border-line bg-surface overflow-hidden">
                <img src={sponsorImageDataUrl} alt="Sponsor" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">Sponsor Terpasang</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-ink-soft font-semibold">Warna Sponsor:</label>
                  <input 
                    type="color" 
                    value={sponsorColor ?? "#ffffff"} 
                    onChange={(e) => setSponsorColor && setSponsorColor(e.target.value)}
                    className="h-6 w-10 cursor-pointer rounded border border-line-strong bg-transparent p-0"
                  />
                  <span className="text-xs font-mono text-ink-soft uppercase">{sponsorColor ?? "#ffffff"}</span>
                </div>
              </div>
              <button 
                onClick={() => setSponsorImage(null)} 
                className="grid h-9 w-9 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-line bg-paper/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft">Atur Posisi & Ukuran Sponsor</span>
                <button onClick={resetSponsorTransform} className="flex items-center gap-1 text-xs text-ink-mute hover:text-accent transition font-medium">
                  <RefreshCw className="h-3 w-3" /> Reset
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Ukuran Sponsor</span><span>{Math.round((sponsorScale ?? 1) * 100)}%</span></div>
                <input type="range" min="0.3" max="2.5" step="0.05" value={sponsorScale ?? 1} onChange={(e) => setSponsorScale && setSponsorScale(parseFloat(e.target.value))} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Posisi Horizontal (X)</span><span>{(sponsorPosition?.x ?? 0) > 0 ? `+${sponsorPosition?.x ?? 0}` : sponsorPosition?.x ?? 0} px</span></div>
                <input type="range" min="-250" max="250" step="1" value={sponsorPosition?.x ?? 0} onChange={(e) => setSponsorPosition && setSponsorPosition({ x: parseInt(e.target.value), y: sponsorPosition?.y ?? 0 })} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-ink-soft"><span>Posisi Vertikal (Y)</span><span>{(sponsorPosition?.y ?? 0) > 0 ? `+${sponsorPosition?.y ?? 0}` : sponsorPosition?.y ?? 0} px</span></div>
                <input type="range" min="-250" max="250" step="1" value={sponsorPosition?.y ?? 0} onChange={(e) => setSponsorPosition && setSponsorPosition({ x: sponsorPosition?.x ?? 0, y: parseInt(e.target.value) })} className="w-full accent-ink bg-line h-1 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => sponsorInputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-paper/60 px-4 py-8 text-ink-soft transition hover:border-accent hover:bg-accent-soft/60">
            <Upload className="h-6 w-6" /> <span className="text-sm font-bold text-ink-mute">Upload Gambar Sponsor (PNG)</span>
          </button>
        )}
        <input ref={sponsorInputRef} type="file" accept="image/*" className="hidden" onChange={onSponsorFile} />
      </section>
    </div>
  );
}