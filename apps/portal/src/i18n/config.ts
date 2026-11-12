export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Locales with translated content. Others show as "coming soon" in the switcher. */
export const publishedLocales: Locale[] = ["en", "fr", "ar"];

export const localeLabels: Record<Locale, string> = { en: "EN", fr: "FR", ar: "AR" };

export function isPublishedLocale(value: string): value is Locale {
  return (publishedLocales as string[]).includes(value);
}

export function dir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
