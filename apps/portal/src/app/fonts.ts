import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Newsreader, Noto_Naskh_Arabic } from "next/font/google";

export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
  variable: "--font-naskh",
  display: "swap",
  preload: false,
});

export const fontVariables = [newsreader, plexArabic, plexMono, naskh].map((f) => f.variable).join(" ");
