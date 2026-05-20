"use client";

import clsx from "clsx";
import { Rotate3d } from "lucide-react";
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
    <div className="grid h-full w-full place-items-center text-sm text-slate-400">
      Memuat tampilan 3D…
    </div>
  ),
});

const TABS = [
  { id: "pattern", label: "Pattern" },
  { id: "colours", label: "Warna" },
  { id: "text", label: "Teks" },
  { id: "logos", label: "Logo" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function JerseyDesigner() {
  const [tab, setTab] = useState<TabId>("pattern");
  const [autoRotate, setAutoRotate] = useState(true);
  const store = useJerseyStore();
  const jerseyState = extractJerseyState(store);

  return (
    <section
      id="designer"
      className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 lg:grid-cols-[minmax(0,440px)_1fr]"
    >
      {/* 3D Preview */}
      <div className="order-1 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-100 to-slate-200">
            <JerseyView3D state={jerseyState} autoRotate={autoRotate} />
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className={clsx(
                "absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow transition",
                autoRotate
                  ? "bg-sky-500 text-white"
                  : "bg-white/90 text-slate-700 hover:bg-white",
              )}
            >
              <Rotate3d className="h-3.5 w-3.5" />
              {autoRotate ? "Putar: ON" : "Putar: OFF"}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Preview 3D</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              Drag untuk putar · scroll untuk zoom
            </span>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="order-2 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
                  tab === t.id
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-slate-500 hover:text-slate-700",
                )}
              >
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
    </section>
  );
}
