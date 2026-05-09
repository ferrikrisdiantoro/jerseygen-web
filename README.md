# JerseyGen — Web Custom Jersey AI

Landing page Next.js untuk custom jersey futsal/bola dengan AI generate. User dapat:

1. Mendesain jersey (design, warna, nama, nomor, logo, sponsor)
2. Upload foto wajah (opsional, toggle on/off)
3. Pilih size fit (Oversize / Regular / Press Body)
4. Generate hasil orang memakai jersey custom via AI

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (state management)
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

**Tip hemat biaya AI**: KieAI memberi free credit untuk akun baru. Jika kuota habis, daftar akun baru → ganti API key. Mock mode (`AI_PROVIDER=mock`) tidak memanggil API sama sekali (untuk test UI).

## Deploy ke Vercel

1. Push repo ini ke GitHub
2. Import ke https://vercel.com/new
3. Set Environment Variables (sama seperti `.env.local`) di project settings
4. Deploy

Hosting Vercel free tier sudah cukup untuk traffic awal.

## Struktur

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # landing page
│   ├── globals.css
│   └── api/generate/route.ts       # endpoint AI generate
├── components/
│   ├── Header.tsx, Hero.tsx, Footer.tsx
│   ├── HowItWorks.tsx, Faq.tsx
│   ├── JerseyDesigner.tsx          # main designer (preview + tabs)
│   ├── JerseyPreview.tsx           # SVG preview live
│   ├── PhotoUploadSection.tsx      # toggle face + upload + size
│   ├── GenerateBar.tsx             # tombol generate + quota + email gate
│   ├── ResultModal.tsx             # tampil hasil + download
│   └── designer/
│       ├── DesignTab.tsx
│       ├── ColoursTab.tsx
│       ├── TextTab.tsx
│       └── LogosTab.tsx
├── lib/
│   ├── store.ts                    # Zustand store
│   ├── prompt.ts                   # build AI prompt dari state jersey
│   ├── quota.ts                    # localStorage quota tracking
│   ├── svgToPng.ts                 # SVG → PNG dataURL
│   └── ai/
│       ├── index.ts                # provider router
│       ├── types.ts
│       ├── kieai.ts
│       ├── freepik.ts
│       └── mock.ts
└── types/jersey.ts
```

## Catatan Teknis

- **Quota** di-track via `localStorage` (per browser). Simple by design — sesuai requirement "ganti akun bisa lanjut generate".
- **Email gate**: hanya validasi format email, tidak ada autentikasi. Untuk auth real, bisa tambahkan Supabase/Clerk di iterasi berikutnya.
- **SVG Jersey Preview**: rendering pakai SVG primitif (5 design template). Bisa diganti dengan asset PNG/3D viewer kalau klien minta visual lebih realistis.
- **AI Provider**: KieAI pakai async pattern (createTask → poll). Freepik skeleton — verify endpoint sebelum dipakai live.

## Roadmap Lanjutan (Opsional)

- Auth real (Supabase/Clerk)
- Simpan riwayat generate
- 3D jersey viewer (Three.js)
- Checkout / order langsung jersey hasil custom
