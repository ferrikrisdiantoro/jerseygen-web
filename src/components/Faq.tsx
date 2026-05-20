"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const ITEMS = [
  {
    q: "Apakah hasil bisa di-download?",
    a: "Bisa. Setelah generate, tombol Download muncul untuk menyimpan gambar PNG. Lembar desain jersey juga bisa diunduh & dicetak.",
  },
  {
    q: "Berapa kali bisa generate gratis?",
    a: "Tergantung kuota gratis akun. Jika habis, kamu bisa login dengan email lain untuk lanjut generate.",
  },
  {
    q: "Apakah wajah pasti mirip kalau pakai foto sendiri?",
    a: "AI berusaha menjaga kemiripan wajah, namun hasil bisa berbeda di tiap generate. Pakai foto frontal dengan pencahayaan baik untuk hasil terbaik.",
  },
  {
    q: "Apa beda Oversize, Regular, dan Press Body?",
    a: "Itu efek visual fit jersey saat AI generate — Oversize = longgar, Regular = standar, Press Body = ngepres badan.",
  },
  {
    q: "Bisa pakai pattern/template saya sendiri?",
    a: "Bisa. Di tab Pattern ada slot upload — unggah gambar pattern kamu, otomatis di-tile ke jersey dan warnanya bisa diubah.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            FAQ
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-ink sm:text-4xl">
            Pertanyaan Umum
          </h2>
        </div>

        <div className="mt-8 space-y-2.5">
          {ITEMS.map((it, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={it.q}
                className={clsx(
                  "overflow-hidden rounded-xl border bg-surface transition",
                  isOpen ? "border-accent/40" : "border-line",
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-bold text-ink">{it.q}</span>
                  <span
                    className={clsx(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-md transition",
                      isOpen ? "rotate-45 bg-accent text-white" : "bg-paper text-ink-mute",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-line px-4 py-3.5 text-sm text-ink-mute">
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
