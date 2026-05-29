import { Header } from "@/components/Header";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer"; // Opsional, jika ingin ada footer juga

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-surface">
      {/* Navbar di bagian atas */}
      <Header />
      
      {/* Konten FAQ dengan padding top agar tidak tertutup navbar sticky */}
      <div className="py-12">
        <Faq />
      </div>

      {/* Footer di bagian bawah (opsional) */}
      <Footer />
    </main>
  );
}