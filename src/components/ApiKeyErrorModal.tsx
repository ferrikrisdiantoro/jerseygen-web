"use client";

import { KeyRound, Settings, X } from "lucide-react";
import { createPortal } from "react-dom";

export type ApiKeyErrorCode = "quota" | "auth";

export function ApiKeyErrorModal({
  code,
  rawMessage,
  onClose,
  onOpenSettings,
}: {
  code: ApiKeyErrorCode;
  rawMessage: string;
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  if (typeof document === "undefined") return null;

  const isQuota = code === "quota";

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink/55 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-white">
                <KeyRound className="h-[18px] w-[18px]" />
              </div>
              <h3 className="font-display text-base font-extrabold uppercase leading-tight tracking-tight text-ink">
                {isQuota ? "Kuota API Key Habis" : "API Key Bermasalah"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-mute transition hover:bg-paper"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 p-5">
            {isQuota ? (
              <>
                <p className="text-sm text-ink">
                  Limit pemakaian gratis dari API key yang dipakai sekarang sudah
                  habis. Generate tidak bisa dilanjutkan dengan key ini.
                </p>
                <div className="rounded-xl bg-paper p-3 text-sm text-ink-mute">
                  <p className="mb-1 font-bold text-ink">Cara lanjut:</p>
                  <ol className="list-decimal space-y-1 pl-4">
                    <li>Daftar akun baru di provider → dapat API key gratis baru, atau upgrade ke paket berbayar.</li>
                    <li>Buka <span className="font-semibold text-ink">Setelan</span>, ganti dengan API key yang baru.</li>
                    <li>Coba generate lagi.</li>
                  </ol>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-ink">
                  API key belum diatur atau tidak valid, jadi generate tidak bisa
                  dijalankan.
                </p>
                <div className="rounded-xl bg-paper p-3 text-sm text-ink-mute">
                  Buka <span className="font-semibold text-ink">Setelan</span>,
                  pilih provider, lalu masukkan API key yang benar.
                </div>
              </>
            )}

            {rawMessage && (
              <details className="text-[11px] text-ink-soft">
                <summary className="cursor-pointer select-none font-semibold">
                  Detail teknis
                </summary>
                <p className="mt-1 break-words rounded-lg bg-paper p-2 font-mono">
                  {rawMessage}
                </p>
              </details>
            )}
          </div>

          <div className="flex gap-2 border-t border-line px-5 py-4">
            <button
              onClick={onClose}
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink-mute transition hover:bg-paper"
            >
              Tutup
            </button>
            <button
              onClick={onOpenSettings}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-dark"
            >
              <Settings className="h-4 w-4" />
              Buka Setelan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
