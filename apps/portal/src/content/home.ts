import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";

/**
 * Homepage copy. French and Arabic text is taken from the brand file (reference/bov-brand.html, FR / AR modes).
 * Shared copy (brand, nav, footer) lives in site.ts.
 */
export type HomeContent = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; lead: string; primary: string; secondary: string };
  ticker: { label: string; items: string[] };
  announcement: {
    badge: string;
    deadline: string;
    title: string;
    body: string;
    chips: string[];
    primary: string;
    secondary: string;
    /** Banner image path (editable in the dashboard; same in every language). */
    image: string;
    bannerAlt: string;
  };
  vision: { eyebrow: string; quote: string; link: string };
  pathway: { eyebrow: string; title: string; steps: { num: string; title: string; body: string }[] };
  activities: { title: string; items: { title: string; body: string; href: string }[] };
};

const en: HomeContent = {
  meta: {
    title: "Bridging Our Voices — Women leading dialogue and peacebuilding",
    description:
      "A regional and international initiative empowering women peacemakers and community leaders across the Arab region and Africa to lead dialogue, conflict resolution and the prevention of violent extremism.",
  },
  hero: {
    eyebrow: "Regional & international initiative",
    title: "Women leading dialogue and peacebuilding",
    lead: "A distinctive regional and international initiative empowering women peacemakers and community leaders, moving them from informal roles into recognised, influential leadership in peacebuilding and interfaith and intercultural dialogue.",
    primary: "Explore our activities",
    secondary: "Contact us",
  },
  ticker: {
    label: "Latest",
    items: [
      "Registration open: first Arabic-language cohort of our digital training, deadline 12 Nov 2026",
      "Officially launching Bridging Our Voices: Women Leading Dialogue and Peacebuilding",
      "Free one-month course on Zoom · certificate of participation",
      "Join the Bridging Our Voices network of women peacebuilders",
    ],
  },
  announcement: {
    badge: "Registration open",
    deadline: "Deadline: 12 November 2026",
    title: "First Arabic-language cohort of our digital training course",
    body: "A complete digital training programme delivered entirely in Arabic over Zoom for one full month, giving participants core skills and practical tools in dialogue facilitation, community mediation, diversity management and conflict transformation.",
    chips: ["Free of charge", "Online · Zoom", "One month", "Ages 25+", "Certificate"],
    primary: "Register now",
    secondary: "Programme details →",
    image: "/banner-fellows.png",
    bannerAlt: "Bridging Our Voices fellows from the Philippines, Nigeria, South Africa and Egypt, with partner logos",
  },
  vision: {
    eyebrow: "Our vision",
    quote:
      "To establish an inclusive regional and international dialogue ecosystem where women and young leaders possess legitimate, recognised authority as primary facilitators and mediators in resolving community conflicts and sustaining peace.",
    link: "More about us →",
  },
  pathway: {
    eyebrow: "The pathway",
    title: "From community voice to accredited leader",
    steps: [
      { num: "01", title: "Learn", body: "Bilingual modules led by practitioners from the region." },
      { num: "02", title: "Practise", body: "Facilitate real dialogue circles in your own community." },
      { num: "03", title: "Accredit", body: "Earn a recognised certification in dialogue and peacebuilding." },
      { num: "04", title: "Lead", body: "Join an international network and mentor the next cohort." },
    ],
  },
  activities: {
    title: "Our activities",
    items: [
      { title: "Training programmes", body: "Accredited learning tracks, led by interfaith dialogue.", href: "/activities/training" },
      { title: "Seminars", body: "Open sessions with practitioners and scholars.", href: "/activities/seminars" },
      { title: "Conferences", body: "Regional and international gatherings.", href: "/activities/conferences" },
      { title: "Fellowship", body: "A year of mentoring, accreditation and leadership.", href: "/activities/fellowship" },
    ],
  },
};

const fr: HomeContent = {
  meta: {
    title: "Bridging Our Voices — Les femmes au cœur du dialogue et de la consolidation de la paix",
    description:
      "Une initiative régionale et internationale qui renforce les femmes artisanes de paix et les leaders communautaires du monde arabe et de l’Afrique pour conduire le dialogue, la résolution des conflits et la prévention de l’extrémisme violent.",
  },
  hero: {
    eyebrow: "Initiative régionale et internationale",
    title: "Les femmes au cœur du dialogue et de la consolidation de la paix",
    lead: "Une initiative régionale et internationale qui renforce les femmes artisanes de paix et les leaders communautaires, pour les faire passer de rôles informels à un leadership reconnu et influent dans la consolidation de la paix et le dialogue interreligieux et interculturel.",
    primary: "Découvrir nos activités",
    secondary: "Nous contacter",
  },
  ticker: {
    label: "À la une",
    items: [
      "Inscriptions ouvertes : première promotion en arabe de notre formation numérique, date limite 12 nov. 2026",
      "Lancement officiel de Bridging Our Voices",
      "Formation gratuite d’un mois sur Zoom · certificat de participation",
      "Rejoignez le réseau des artisanes de paix Bridging Our Voices",
    ],
  },
  announcement: {
    badge: "Inscriptions ouvertes",
    deadline: "Date limite : 12 novembre 2026",
    title: "Première promotion en arabe de notre formation numérique",
    body: "Un programme de formation numérique complet, entièrement en arabe sur Zoom pendant un mois, qui donne aux participants les compétences de base et des outils pratiques en facilitation du dialogue, médiation communautaire, gestion de la diversité et transformation des conflits.",
    chips: ["Gratuit", "En ligne · Zoom", "Un mois", "25 ans et plus", "Certificat"],
    primary: "S’inscrire",
    secondary: "Détails du programme →",
    image: "/banner-fellows.png",
    bannerAlt: "Fellows de Bridging Our Voices (Philippines, Nigeria, Afrique du Sud, Égypte) et logos des partenaires",
  },
  vision: {
    eyebrow: "Notre vision",
    quote:
      "Bâtir un écosystème de dialogue régional et international inclusif, où les femmes et les jeunes leaders disposent d’une autorité légitime et reconnue comme facilitatrices et médiatrices principales dans la résolution des conflits communautaires et le maintien de la paix.",
    link: "En savoir plus sur nous →",
  },
  pathway: {
    eyebrow: "Le parcours",
    title: "De la voix communautaire au leadership certifié",
    steps: [
      { num: "01", title: "Apprendre", body: "Des modules bilingues animés par des praticiens de la région." },
      { num: "02", title: "Pratiquer", body: "Animer de vrais cercles de dialogue dans sa propre communauté." },
      { num: "03", title: "Être certifiée", body: "Obtenir une certification reconnue en dialogue et consolidation de la paix." },
      { num: "04", title: "Diriger", body: "Rejoindre un réseau international et accompagner la promotion suivante." },
    ],
  },
  activities: {
    title: "Nos activités",
    items: [
      { title: "Programmes de formation", body: "Des parcours certifiants, portés par le dialogue interreligieux.", href: "/activities/training" },
      { title: "Séminaires", body: "Des sessions ouvertes avec praticiens et chercheurs.", href: "/activities/seminars" },
      { title: "Congrès", body: "Des rencontres régionales et internationales.", href: "/activities/conferences" },
      { title: "Bourse (Fellowship)", body: "Une année de mentorat, de certification et de leadership.", href: "/activities/fellowship" },
    ],
  },
};

const ar: HomeContent = {
  meta: {
    title: "Bridging Our Voices — المرأة لقيادة الحوار وبناء السلام",
    description:
      "مبادرة إقليمية ودولية متميزة تهدف إلى تمكين صانعات السلام والقيادات المجتمعية في المنطقة العربية وأفريقيا، ونقلهن إلى قيادات معترف بها في الحوار وحل النزاعات والوقاية من التطرف العنيف.",
  },
  hero: {
    eyebrow: "مبادرة إقليمية ودولية",
    title: "المرأة لقيادة الحوار وبناء السلام",
    lead: "مبادرة إقليمية ودولية متميزة تهدف إلى تمكين صانعات السلام والقيادات المجتمعية، ونقلهن من أدوار غير رسمية إلى قيادات معترف بها ومؤثرة في بناء السلام والحوار بين الأديان والثقافات.",
    primary: "تعرّفي على أنشطتنا",
    secondary: "تواصلي معنا",
  },
  ticker: {
    label: "آخر الأخبار",
    items: [
      "فتح باب التسجيل في الدفعة الأولى باللغة العربية من دوراتنا التدريبية الرقمية، آخر موعد ١٢ نوفمبر ٢٠٢٦",
      "الإطلاق الرسمي لمبادرة «أصواتنا جسور: المرأة لقيادة الحوار وبناء السلام»",
      "دورة مجانية لمدة شهر عبر Zoom · شهادة مشاركة معتمدة",
      "انضمي إلى شبكة «أصواتنا جسور» لصانعات السلام",
    ],
  },
  announcement: {
    badge: "التسجيل مفتوح",
    deadline: "آخر موعد للتسجيل: ١٢ نوفمبر ٢٠٢٦",
    title: "فتح باب التسجيل في الدفعة الأولى باللغة العربية من دوراتنا التدريبية الرقمية",
    body: "برنامج تدريبي رقمي متكامل يُقدَّم بالكامل باللغة العربية عبر منصة Zoom على مدار شهر كامل، يهدف إلى تزويد المشاركين بالمهارات الأساسية والأدوات العملية في التيسير الحواري، والوساطة المجتمعية، وإدارة التنوع، وتفكيك النزاعات.",
    chips: ["مجاني بالكامل", "أونلاين · Zoom", "شهر كامل", "من سن ٢٥ عامًا", "شهادة مشاركة"],
    primary: "سجّل/ي الآن",
    secondary: "تفاصيل البرنامج ←",
    image: "/banner-fellows.png",
    bannerAlt: "زميلات «أصواتنا جسور» من الفلبين ونيجيريا وجنوب أفريقيا ومصر، مع شعارات الشركاء",
  },
  vision: {
    eyebrow: "رؤيتنا",
    quote:
      "إرساء منظومة حوار إقليمية ودولية شاملة، تمتلك فيها النساء والقيادات الشابة سلطة شرعية ومعترفًا بها بوصفهن الميسِّرات والوسيطات الأساسيات في حل النزاعات المجتمعية واستدامة السلام.",
    link: "المزيد عنّا ←",
  },
  pathway: {
    eyebrow: "المسار",
    title: "من صوت مجتمعي إلى قيادة معتمدة",
    steps: [
      { num: "٠١", title: "تعلّمي", body: "وحدات ثنائية اللغة يقدّمها ممارسون من المنطقة." },
      { num: "٠٢", title: "مارسي", body: "أديري حلقات حوار حقيقية داخل مجتمعك." },
      { num: "٠٣", title: "احصلي على الاعتماد", body: "شهادة معترف بها في الحوار وبناء السلام." },
      { num: "٠٤", title: "قودي", body: "انضمي إلى شبكة دولية ورافقي الدفعة التالية." },
    ],
  },
  activities: {
    title: "أنشطتنا",
    items: [
      { title: "برامج تدريبية", body: "مسارات تعليمية معتمدة يتصدرها الحوار بين الأديان.", href: "/activities/training" },
      { title: "ندوات", body: "جلسات مفتوحة مع ممارسين وباحثين.", href: "/activities/seminars" },
      { title: "مؤتمرات", body: "لقاءات إقليمية ودولية.", href: "/activities/conferences" },
      { title: "زمالة", body: "عام من الإرشاد والاعتماد والقيادة.", href: "/activities/fellowship" },
    ],
  },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, HomeContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getHomeContent(locale: Locale): Promise<HomeContent> {
  return loadContent("home", locale, defaults[locale]);
}
