"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
import { useJerseyStore } from "@/lib/store";
import { JerseyPreview } from "./JerseyPreview";
import { DesignTab } from "./designer/DesignTab";
import { ColoursTab } from "./designer/ColoursTab";
import { TextTab } from "./designer/TextTab";
import { LogosTab } from "./designer/LogosTab";
import { PhotoUploadSection } from "./PhotoUploadSection";
import { GenerateBar } from "./GenerateBar";

const TABS = [
  { id: "design", label: "Design" },
  { id: "colours", label: "Colours" },
  { id: "text", label: "Text" },
  { id: "logos", label: "Logos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function JerseyDesigner() {
  const [tab, setTab] = useState<TabId>("design");
  const svgRef = useRef<SVGSVGElement>(null);
  const { design, primaryColor, secondaryColor, accentColor, playerName, playerNumber, sponsorText, logoDataUrl } =
    useJerseyStore();

  return (
    <section
      id="designer"
      className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 lg:grid-cols-[minmax(0,420px)_1fr]"
    >
      {/* Preview card */}
      <div className="order-1 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-slate-100">
            <JerseyPreview
              ref={svgRef}
              design={design}
              primary={primaryColor}
              secondary={secondaryColor}
              accent={accentColor}
              playerName={playerName}
              playerNumber={playerNumber}
              sponsorText={sponsorText}
              logoDataUrl={logoDataUrl}
              className="h-full w-full"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Live Preview</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">Update otomatis</span>
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
            {tab === "design" && <DesignTab />}
            {tab === "colours" && <ColoursTab />}
            {tab === "text" && <TextTab />}
            {tab === "logos" && <LogosTab />}
          </div>
        </div>

        <PhotoUploadSection />
        <GenerateBar svgRef={svgRef} />
      </div>
    </section>
  );
}
