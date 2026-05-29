// src/app/page.tsx
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
// Komponen lain seperti JerseyDesigner, HowItWorks, dll, dihapus sementara dari sini

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
    </main>
  );
}