import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Newsreader } from "next/font/google";
import { getLang } from "@/lib/i18n";
import "./globals.css";

const newsreader = Newsreader({ subsets: ["latin"], weight: ["400"], variable: "--font-newsreader" });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600"], variable: "--font-plex-arabic" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  title: { default: "Dashboard — Bridging Our Voices", template: "%s — Bridging Our Voices" },
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={`${newsreader.variable} ${plexArabic.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
