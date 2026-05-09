"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const ITEMS = [
  {
    q: "Apakah hasil bisa di-download?",
    a: "Bisa. Setelah generate, tombol Download akan muncul untuk menyimpan gambar PNG.",
  },
  {
    q: "Berapa kali bisa generate gratis?",
    a: "Tergantung kuota gratis akun. Jika habis, kamu bisa login dengan email lain untuk lanjut generate.",
  },
  {
    q: "Apakah wajah pasti mirip kalau pakai foto sendiri?",
    a: "AI akan berusaha menjaga kemiripan wajah, namun hasil bisa berbeda di tiap generate. Pakai foto frontal dengan pencahayaan baik untuk hasil terbaik.",
  },
  {
    q: "Apa beda Oversize, Regular, dan Press Body?",
    a: "Hanya efek visual fit jersey saat AI generate — Oversize = longgar, Regular = standar, Press Body = ngepres badan.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="mb-6 text-center text-2xl font-extrabold tracking-tight text-slate-900">
        Pertanyaan Umum
      </h2>
      <div className="space-y-2">
        {ITEMS.map((it, idx) => {
          const isOpen = open === idx;
          return (
            <div
              key={it.q}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <button
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-slate-900">{it.q}</span>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 text-slate-500 transition",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                  {it.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
