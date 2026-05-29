// src/app/cara-pakai/page.tsx
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

export default function HowToPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-24 px-4">
        <HowItWorks />
      </div>
      <Footer />
    </main>
  );
}