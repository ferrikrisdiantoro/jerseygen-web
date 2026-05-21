"use client";

import clsx from "clsx";
import { Grid2x2, Palette, RefreshCw, Shapes, Type } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { extractJerseyState, useJerseyStore } from "@/lib/store";
import { PatternTab } from "./designer/PatternTab";
import { ColoursTab } from "./designer/ColoursTab";
import { TextTab } from "./designer/TextTab";
import { LogosTab } from "./designer/LogosTab";
import { PhotoUploadSection } from "./PhotoUploadSection";
import { SavePanel } from "./SavePanel";
import { ExportBar } from "./ExportBar";
import { GenerateBar } from "./GenerateBar";

const JerseyView3D = dynamic(() => import("./JerseyView3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm font-medium text-ink-soft">
      Memuat tampilan 3D…
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
      className="mx-auto grid max-w-6xl scroll-mt-20 gap-5 px-4 py-6 sm:gap-6 sm:py-10 lg:grid-cols-[minmax(0,440px)_1fr]"
    >
      {/* 3D Preview */}
      <div className="order-1 mx-auto w-full max-w-md lg:sticky lg:top-[88px] lg:max-w-none lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-3 shadow-card sm:p-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#ecebe7]">
            <JerseyView3D state={jerseyState} showBack={showBack} />
            <button
              onClick={() => setShowBack((v) => !v)}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-card transition hover:bg-ink/85"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {showBack ? "Lihat Depan" : "Lihat Belakang"}
            </button>
            <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              3D Live
            </span>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-ink-soft">
            Drag untuk memutar · scroll untuk zoom
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className="order-2 min-w-0 space-y-4">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="flex gap-1 overflow-x-auto border-b border-line px-2 scrollbar-hide">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-bold transition",
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-ink-soft hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
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
    </section>
  );
}
