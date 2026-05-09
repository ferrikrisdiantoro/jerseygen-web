import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { JerseyDesigner } from "@/components/JerseyDesigner";
import { HowItWorks } from "@/components/HowItWorks";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <JerseyDesigner />
      <HowItWorks />
      <Faq />
      <Footer />
    </main>
  );
}
