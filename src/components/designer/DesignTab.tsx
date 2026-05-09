"use client";

import clsx from "clsx";
import { useJerseyStore } from "@/lib/store";
import { DESIGN_LABELS, type JerseyDesign } from "@/types/jersey";
import { JerseyPreview } from "../JerseyPreview";

const DESIGNS: JerseyDesign[] = ["cross", "tackle", "city", "pool", "nouCamp"];

export function DesignTab() {
  const { design, setDesign, primaryColor, secondaryColor, accentColor } = useJerseyStore();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {DESIGNS.map((d) => {
        const active = d === design;
        return (
          <button
            key={d}
            onClick={() => setDesign(d)}
            className={clsx(
              "group flex flex-col items-center gap-2 rounded-xl border-2 bg-white p-3 transition",
              active
                ? "border-sky-500 ring-2 ring-sky-100"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <div className="aspect-[4/5] w-full overflow-hidden rounded-md bg-slate-50">
              <JerseyPreview
                design={d}
                primary={primaryColor}
                secondary={secondaryColor}
                accent={accentColor}
                playerName=""
                playerNumber=""
                sponsorText=""
                logoDataUrl={null}
                className="h-full w-full"
              />
            </div>
            <span
              className={clsx(
                "text-xs font-medium",
                active ? "text-sky-700" : "text-slate-600",
              )}
            >
              {DESIGN_LABELS[d]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
