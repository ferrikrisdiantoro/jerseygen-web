# JerseyGen — Web Custom Jersey AI

Landing page Next.js untuk custom jersey futsal/bola dengan **preview 3D** dan AI generate. User dapat:

1. Mendesain jersey 3D (pattern, warna, teks, logo) — preview bisa diputar 360°
2. Upload pattern/template sendiri + ubah warnanya
3. Tambah teks bebas di depan/belakang jersey (gaya owayo)
4. Simpan jersey atas nama tertentu, buka lagi kapan saja
5. Unduh / cetak lembar desain (tampak depan & belakang)
6. Upload foto wajah (opsional) → AI generate orang memakai jersey custom

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (state management)
- **Three.js + react-three-fiber + drei** (preview 3D)
- Lucide icons
- AI provider: KieAI (default) / Freepik / Mock

## Quick Start

```bash
cd web
npm install
cp .env.example .env.local
# isi KIEAI_API_KEY (daftar gratis di https://kie.ai)
npm run dev
```

Buka http://localhost:3000

## Konfigurasi AI Provider

Edit `.env.local`:

| Variable | Default | Catatan |
|---|---|---|
| `AI_PROVIDER` | `kieai` | `kieai` \| `freepik` \| `mock` |
| `KIEAI_API_KEY` | — | Dapat dari https://kie.ai/api-key |
| `KIEAI_MODEL` | `google/nano-banana-edit` | Model image-edit |
| `FREEPIK_API_KEY` | — | Optional, jika pakai Freepik |
| `NEXT_PUBLIC_FREE_QUOTA` | `5` | Jumlah generate gratis per akun |

**Tip hemat biaya AI**: KieAI memberi free credit untuk akun baru. Jika kuota habis,
daftar akun baru → ganti API key. Mode `mock` tidak memanggil API (untuk test UI).

## Deploy ke Vercel

1. Push folder `web/` ini sebagai root repo ke GitHub
2. Import ke https://vercel.com/new
3. Set Environment Variables (sama seperti `.env.local`)
4. Deploy

## Struktur

```
src/
├── app/
│   ├── page.tsx                    # landing page
│   └── api/generate/route.ts       # endpoint AI generate
├── components/
│   ├── JerseyDesigner.tsx          # layout: preview 3D + tab editor
│   ├── JerseyView3D.tsx            # viewer 3D (three / react-three-fiber)
│   ├── PhotoUploadSection.tsx      # toggle muka sendiri + size
│   ├── SavePanel.tsx               # simpan jersey atas nama + daftar tersimpan
│   ├── ExportBar.tsx               # download PNG + print design
│   ├── GenerateBar.tsx             # tombol generate + kuota + email gate
│   ├── ResultModal.tsx             # hasil AI + download
│   └── designer/
│       ├── PatternTab.tsx          # preset pattern + upload pattern + scale
│       ├── ColoursTab.tsx          # warna utama/sekunder/aksen/pattern
│       ├── TextTab.tsx             # nama, nomor, sponsor, teks bebas
│       └── LogosTab.tsx            # upload logo
├── lib/
│   ├── store.ts                    # Zustand store
│   ├── jerseyTexture.ts            # composit kanvas desain (warna+pattern+teks+logo)
│   ├── savedJerseys.ts             # CRUD jersey tersimpan (localStorage)
│   ├── prompt.ts                   # build prompt AI
│   ├── quota.ts                    # quota tracking (localStorage)
│   └── ai/                         # provider AI (kieai / freepik / mock)
└── types/jersey.ts
```

## Cara Kerja Preview 3D

- Desain digambar ke kanvas 2D (`jerseyTexture.ts`) — warna dasar, pattern,
  sponsor, nomor, nama, logo, teks bebas.
- Kanvas itu dipakai sebagai **texture** pada model jersey 3D procedural
  (dua panel melengkung depan + belakang) di `JerseyView3D.tsx`.
- Update real-time saat user mengubah desain. Bisa diputar (drag) & zoom (scroll).

## Pattern

- **Preset**: polos, garis vertikal/horizontal, dua sisi, selempang, chevron, kotak.
- **Upload sendiri**: user bisa upload gambar pattern/template (PNG/JPG/SVG),
  otomatis di-tile ke jersey. Ada opsi "warnai ulang" untuk recolor pattern.
- Warna pattern, ukuran, dan transparansi bisa diatur.

## Catatan Teknis

- **Quota & email gate**: localStorage based (per browser), tanpa auth real.
- **Saved jerseys**: disimpan di localStorage (maks 20 desain terakhir per browser).
- **3D**: model procedural (bukan file .glb) — ringan & tanpa aset eksternal.
- Untuk hasil 3D foto-realistis penuh, bisa upgrade ke model `.glb` di iterasi lanjut.

## Roadmap Lanjutan (Opsional)

- Auth real (Supabase/Clerk) + simpan jersey ke cloud
- Model jersey 3D realistis (.glb)
- Library pattern bawaan yang lebih banyak
- Checkout / order jersey hasil custom
```
