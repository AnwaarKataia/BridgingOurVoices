import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "../fonts";
import { dir, isPublishedLocale, publishedLocales } from "@/i18n/config";
import { getSiteContent } from "@/content/site";
import { siteName, siteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#08163a" };

/** Site-wide defaults. Each page adds its own title, description, canonical and Open Graph via pageMetadata(). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  const { brandName } = await getSiteContent(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: brandName, template: `%s — ${brandName}` },
    applicationName: siteName,
    icons: { icon: "/logo.png", apple: "/logo.png" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) notFound();

  return (
    <html lang={locale} dir={dir(locale)} className={fontVariables}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
