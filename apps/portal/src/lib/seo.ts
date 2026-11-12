import type { Metadata } from "next";
import { defaultLocale, publishedLocales, type Locale } from "@/i18n/config";
import { siteName } from "@/lib/site";

const ogLocale: Record<Locale, string> = { en: "en_GB", fr: "fr_FR", ar: "ar_AR" };

const ogImage = { url: "/banner-fellows.png", width: 2400, height: 1580 };

/**
 * Per-page SEO: title, description, canonical, hreflang, Open Graph, Twitter.
 * `path` is the page path without the locale ("" for home, "/about" for About).
 * Home passes `absoluteTitle` so its title is not suffixed with the brand name.
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  meta: { title: string; description: string },
  { absoluteTitle = false }: { absoluteTitle?: boolean } = {},
): Metadata {
  // The project name is never translated, so it doesn't need the (async) site content
  const brandName = siteName;
  const fullTitle = absoluteTitle ? meta.title : `${meta.title} — ${brandName}`;
  const url = `/${locale}${path}`;

  return {
    title: absoluteTitle ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(publishedLocales.map((l) => [l, `/${l}${path}`])),
        "x-default": `/${defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: ogLocale[locale],
      alternateLocale: publishedLocales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      url,
      title: fullTitle,
      description: meta.description,
      images: [{ ...ogImage, alt: brandName }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: meta.description,
      images: [ogImage.url],
    },
  };
}
