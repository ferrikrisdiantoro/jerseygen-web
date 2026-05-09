import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JerseyGen — Custom Jersey AI",
  description:
    "Desain jersey futsal/bola custom dan generate hasil orang memakai jersey kamu dengan AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans">{children}</body>
    </html>
  );
}
