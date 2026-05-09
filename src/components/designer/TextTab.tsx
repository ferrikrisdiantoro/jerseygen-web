"use client";

import { useJerseyStore } from "@/lib/store";

export function TextTab() {
  const {
    playerName, playerNumber, sponsorText,
    setPlayerName, setPlayerNumber, setSponsorText,
  } = useJerseyStore();

  return (
    <div className="space-y-4">
      <Field label="Nama Punggung" hint="maks 12 karakter">
        <input
          maxLength={12}
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="MESSI"
          className="input"
        />
      </Field>
      <Field label="Nomor Punggung" hint="2 digit">
        <input
          maxLength={2}
          inputMode="numeric"
          value={playerNumber}
          onChange={(e) => setPlayerNumber(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="10"
          className="input"
        />
      </Field>
      <Field label="Sponsor Dada" hint="maks 14 karakter">
        <input
          maxLength={14}
          value={sponsorText}
          onChange={(e) => setSponsorText(e.target.value)}
          placeholder="ZAMBURGER"
          className="input"
        />
      </Field>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          font-size: 14px;
          background: white;
          outline: none;
          transition: border-color 120ms;
        }
        .input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
