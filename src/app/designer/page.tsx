// src/app/designer/page.tsx
import { Header } from "@/components/Header";
import { JerseyDesigner } from "@/components/JerseyDesigner";
import { Footer } from "@/components/Footer";

export default function DesignerPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20"> 
        <JerseyDesigner />
      </div>
      <Footer />
    </main>
  );
}