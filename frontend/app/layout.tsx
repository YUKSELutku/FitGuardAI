import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "FitGuard AI",
  description: "MedGemma + MediaPipe ile yerel çalışan fitness form asistanı.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-brand-border bg-brand-surface">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              FitGuard <span className="text-safe">AI</span>
            </Link>
            <nav className="flex gap-4 text-sm text-gray-300">
              <Link href="/" className="hover:text-white">Egzersizler</Link>
              <Link href="/history" className="hover:text-white">Geçmiş</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-brand-border text-xs text-gray-500 text-center py-3 px-4">
          Her şey bu bilgisayarda çalışır. Hiçbir veri internete gönderilmez.
          <span className="mx-2">·</span>
          Tıbbi tavsiye değildir. Ciddi rahatsızlıklarda doktora başvurun.
        </footer>
        <Disclaimer />
      </body>
    </html>
  );
}
