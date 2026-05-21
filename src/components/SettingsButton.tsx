"use client";

import { Settings } from "lucide-react";
import { useUiStore } from "@/lib/ui";
import { SettingsModal } from "./SettingsModal";

export function SettingsButton() {
  const { settingsOpen, openSettings, closeSettings } = useUiStore();
  return (
    <>
      <button
        onClick={openSettings}
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-mute transition hover:bg-line/60 hover:text-ink"
        aria-label="Setelan API"
        title="Setelan API"
      >
        <Settings className="h-[18px] w-[18px]" />
      </button>
      {settingsOpen && <SettingsModal onClose={closeSettings} />}
    </>
  );
}
