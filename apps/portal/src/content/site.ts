import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";

/**
 * Copy shared by every page: brand, navigation, footer, accessibility labels.
 * Copy taken from the brand file (reference/bov-brand.html) in EN / FR / AR modes.
 *
 * Nav hrefs are locale-relative and turned into real URLs by localizeHref():
 *   "/"               → /en
 *   "/about/vision"   → /en/about/vision
 *   "/#announcement"  → /en#announcement
 *   "/agenda"         → /en/agenda
 *
 * Every dropdown child is its own page. The parent link points to the first child.
 */
export type NavLink = { label: string; href: string };
export type NavItem = NavLink & { key: string; children?: NavLink[] };

export type SiteContent = {
  /** Always the English name "Bridging Our Voices" — the owner asked not to translate the project name. */
  brandName: string;
  a11y: { skipToContent: string; menu: string; language: string; footerNav: string; sectionNav: string };
  /** "Next" link at the bottom of section sub-pages. */
  next: string;
  nav: NavItem[];
  footer: {
    tagline: string;
    newsletter: string;
    emailPlaceholder: string;
    subscribe: string;
    subscribed: string;
    error: string;
    copyright: string;
  };
  comingSoon: string;
  /** Messages shown when a form field is missing or wrong (owner, 2026-11-14). {min} = number of characters. */
  forms: {
    summary: string;
    required: string;
    email: string;
    tooShort: string;
    tooLong: string;
    choose: string;
    fieldsMax: string;
    consent: string;
    file: string;
  };
  /** Link to /privacy: footer label, and the sentence + link label shown under the contact and join forms. */
  privacy: { label: string; formNote: string; formLink: string };
};

const en: SiteContent = {
  brandName: "Bridging Our Voices",
  a11y: { skipToContent: "Skip to content", menu: "Menu", language: "Language", footerNav: "Footer", sectionNav: "Section pages" },
  next: "Next",
  nav: [
    { key: "home", label: "Home", href: "/" },
    {
      key: "about",
      label: "About",
      href: "/about/who-we-are",
      children: [
        { label: "Who we are", href: "/about/who-we-are" },
        { label: "Vision", href: "/about/vision" },
        { label: "Mission", href: "/about/mission" },
        { label: "Goals", href: "/about/goals" },
      ],
    },
    {
      key: "activities",
      label: "Activities",
      href: "/activities/training",
      children: [
        { label: "Training programmes", href: "/activities/training" },
        { label: "Seminars", href: "/activities/seminars" },
        { label: "Conferences", href: "/activities/conferences" },
        { label: "Fellowship", href: "/activities/fellowship" },
      ],
    },
    { key: "agenda", label: "Agenda", href: "/agenda" },
    {
      key: "network",
      label: "Network",
      href: "/network/membership",
      children: [
        { label: "Membership", href: "/network/membership" },
        { label: "Add your voice to ours", href: "/network/join" },
        { label: "Our members", href: "/network/members" },
      ],
    },
    { key: "contact", label: "Contact us", href: "/contact" },
  ],
  footer: {
    tagline: "Women leading dialogue and peacebuilding.",
    newsletter: "Newsletter",
    emailPlaceholder: "Your email",
    subscribe: "Subscribe",
    subscribed: "Thank you, you're subscribed.",
    error: "Something went wrong, please try again.",
    copyright: "© 2026 Bridging Our Voices",
  },
  comingSoon: "Coming soon",
  forms: {
    summary: "Please check the highlighted fields:",
    required: "This field is required.",
    email: "Please enter a valid email, e.g. name@example.com.",
    tooShort: "Please write at least {min} characters.",
    tooLong: "Please shorten this text.",
    choose: "Please choose an option.",
    fieldsMax: "Choose up to 3 fields.",
    consent: "Please tick this box to continue.",
    file: "Please check the attached file.",
  },
  privacy: { label: "Privacy policy", formNote: "How we use and protect your data:", formLink: "privacy policy" },
};

const fr: SiteContent = {
  brandName: "Bridging Our Voices",
  a11y: { skipToContent: "Aller au contenu", menu: "Menu", language: "Langue", footerNav: "Pied de page", sectionNav: "Pages de la rubrique" },
  next: "Suivant",
  nav: [
    { key: "home", label: "Accueil", href: "/" },
    {
      key: "about",
      label: "Qui sommes-nous",
      href: "/about/who-we-are",
      children: [
        { label: "Qui sommes-nous", href: "/about/who-we-are" },
        { label: "Vision", href: "/about/vision" },
        { label: "Mission", href: "/about/mission" },
        { label: "Objectifs", href: "/about/goals" },
      ],
    },
    {
      key: "activities",
      label: "Activités",
      href: "/activities/training",
      children: [
        { label: "Programmes de formation", href: "/activities/training" },
        { label: "Séminaires", href: "/activities/seminars" },
        { label: "Congrès", href: "/activities/conferences" },
        { label: "Bourse (Fellowship)", href: "/activities/fellowship" },
      ],
    },
    { key: "agenda", label: "Agenda", href: "/agenda" },
    {
      key: "network",
      label: "Réseau",
      href: "/network/membership",
      children: [
        { label: "Adhésion", href: "/network/membership" },
        { label: "Joignez votre voix à la nôtre", href: "/network/join" },
        { label: "Nos membres", href: "/network/members" },
      ],
    },
    { key: "contact", label: "Contact", href: "/contact" },
  ],
  footer: {
    tagline: "Les femmes au cœur du dialogue et de la consolidation de la paix.",
    newsletter: "Newsletter",
    emailPlaceholder: "Votre e-mail",
    subscribe: "S’abonner",
    subscribed: "Merci, votre inscription est confirmée.",
    error: "Une erreur s’est produite, veuillez réessayer.",
    copyright: "© 2026 Bridging Our Voices",
  },
  comingSoon: "Bientôt",
  forms: {
    summary: "Veuillez vérifier les champs signalés :",
    required: "Ce champ est obligatoire.",
    email: "Veuillez saisir une adresse e-mail valide, par ex. nom@exemple.com.",
    tooShort: "Veuillez écrire au moins {min} caractères.",
    tooLong: "Veuillez raccourcir ce texte.",
    choose: "Veuillez choisir une option.",
    fieldsMax: "Choisissez jusqu’à 3 domaines.",
    consent: "Veuillez cocher cette case pour continuer.",
    file: "Veuillez vérifier le fichier joint.",
  },
  privacy: { label: "Politique de confidentialité", formNote: "Comment nous utilisons et protégeons vos données :", formLink: "politique de confidentialité" },
};

const ar: SiteContent = {
  brandName: "Bridging Our Voices",
  a11y: { skipToContent: "انتقل إلى المحتوى", menu: "القائمة", language: "اللغة", footerNav: "روابط التذييل", sectionNav: "صفحات القسم" },
  next: "التالي",
  nav: [
    { key: "home", label: "الرئيسية", href: "/" },
    {
      key: "about",
      label: "من نحن",
      href: "/about/who-we-are",
      children: [
        { label: "من نحن", href: "/about/who-we-are" },
        { label: "الرؤية", href: "/about/vision" },
        { label: "الرسالة", href: "/about/mission" },
        { label: "الأهداف", href: "/about/goals" },
      ],
    },
    {
      key: "activities",
      label: "الأنشطة",
      href: "/activities/training",
      children: [
        { label: "برامج تدريبية", href: "/activities/training" },
        { label: "ندوات", href: "/activities/seminars" },
        { label: "مؤتمرات", href: "/activities/conferences" },
        { label: "زمالة", href: "/activities/fellowship" },
      ],
    },
    { key: "agenda", label: "الأجندة", href: "/agenda" },
    {
      key: "network",
      label: "الشبكة",
      href: "/network/membership",
      children: [
        { label: "عناصر الانضمام", href: "/network/membership" },
        { label: "ضم صوتك لصوتنا", href: "/network/join" },
        { label: "أعضاؤنا", href: "/network/members" },
      ],
    },
    { key: "contact", label: "تواصل معنا", href: "/contact" },
  ],
  footer: {
    tagline: "المرأة لقيادة الحوار وبناء السلام.",
    newsletter: "النشرة البريدية",
    emailPlaceholder: "بريدك الإلكتروني",
    subscribe: "اشتركي",
    subscribed: "شكرًا لكِ، تم اشتراككِ بنجاح.",
    error: "حدث خطأ، يُرجى المحاولة مرة أخرى.",
    copyright: "© ٢٠٢٦ Bridging Our Voices",
  },
  comingSoon: "قريبًا",
  forms: {
    summary: "يرجى مراجعة الحقول المحددة:",
    required: "هذا الحقل مطلوب.",
    email: "يرجى كتابة بريد إلكتروني صحيح، مثل name@example.com.",
    tooShort: "يرجى كتابة {min} أحرف على الأقل.",
    tooLong: "يرجى تقصير هذا النص.",
    choose: "يرجى اختيار أحد الخيارات.",
    fieldsMax: "اختر/ي ٣ مجالات على الأكثر.",
    consent: "يرجى وضع علامة في هذا المربع للمتابعة.",
    file: "يرجى مراجعة الملف المرفق.",
  },
  privacy: { label: "سياسة الخصوصية", formNote: "كيف نستخدم بياناتك ونحميها:", formLink: "سياسة الخصوصية" },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, SiteContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  return loadContent("site", locale, defaults[locale]);
}

/**
 * Tabs for the pages of one nav section (About, Activities): the dropdown children,
 * with the page at `path` marked current. Used under the page title of each sub-page.
 */
export function sectionTabs(site: SiteContent, locale: Locale, key: string, path: string) {
  const item = site.nav.find((n) => n.key === key);
  return (item?.children ?? []).map((c) => ({
    label: c.label,
    href: localizeHref(locale, c.href),
    current: c.href === path,
  }));
}

/** Turns a locale-relative nav href into a real URL (see the comment at the top). */
export function localizeHref(locale: Locale, href: string): string {
  if (href.startsWith("#")) return href;
  if (href === "/") return `/${locale}`;
  if (href.startsWith("/#")) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}
