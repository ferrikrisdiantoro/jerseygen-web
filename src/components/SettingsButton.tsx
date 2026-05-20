"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { SettingsModal } from "./SettingsModal";

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute transition hover:bg-line/60 hover:text-ink"
        aria-label="Setelan API"
        title="Setelan API"
      >
        <Settings className="h-[18px] w-[18px]" />
      </button>
      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  );
}
