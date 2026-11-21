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
  /** Latest news (owner, 2026-11-21): the newest items of the News page, each linking to it. */
  news: { title: string; more: string; all: string };
};

const en: HomeContent = {
  meta: {
    title: "Bridging Our Voices — Women leading dialogue and peacebuilding",
    description:
      "A regional and international initiative that champions women’s leadership and empowers peacemakers and community leaders across the Arab region and Africa, women and men, to lead dialogue, conflict resolution and the prevention of violent extremism.",
  },
  hero: {
    eyebrow: "Regional & international initiative",
    title: "Women leading dialogue and peacebuilding",
    lead: "A regional initiative that strengthens women’s role and leadership in dialogue and peacebuilding, and empowers peacemakers and community leaders, women and men, to move from informal roles into recognised, influential leadership in peacebuilding and interfaith and intercultural dialogue.",
    primary: "Explore our activities",
    secondary: "Contact us",
  },
  ticker: {
    label: "Latest",
    items: [
      "Our online training programme has launched: opening lecture by Dr Mohamed El-Wardany (Al-Azhar University) on religious and cultural conflict on social media",
      "A three-day training workshop for refugees in Alexandria, held at UNHCR, and the launch of the Bridging Our Voices Network for Dialogue and Coexistence",
      "The official launch of Bridging Our Voices: Women Leading Dialogue and Peacebuilding",
      "Registration for our online training programme (Arabic and English cohorts) is now closed — thank you to all applicants",
      "Join the Bridging Our Voices network of peacebuilders",
    ],
  },
  announcement: {
    badge: "Registration closed",
    deadline: "Registration closed on 12 November 2026",
    title: "First Arabic-language cohort of our digital training course",
    body: "A complete digital training programme delivered entirely in Arabic over Zoom for one full month, giving participants core skills and practical tools in dialogue facilitation, community mediation, diversity management and conflict transformation.",
    chips: ["Free of charge", "Online · Zoom", "One month", "Ages 25+", "Certificate"],
    primary: "Discover e-learning",
    secondary: "Programme details →",
    image: "/banner-fellows.png",
    bannerAlt: "Bridging Our Voices fellows from the Philippines, Nigeria, South Africa and Egypt, with partner logos",
  },
  vision: {
    eyebrow: "Our vision",
    quote:
      "To establish an inclusive regional and international dialogue ecosystem where women and young leaders have legitimate, recognised authority as the primary facilitators and mediators in resolving community conflicts and sustaining peace.",
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
      { title: "Training programmes", body: "Accredited learning tracks grounded in interfaith dialogue.", href: "/activities/training" },
      { title: "Seminars", body: "Open sessions with practitioners and scholars.", href: "/activities/seminars" },
      { title: "Conferences", body: "Regional and international gatherings.", href: "/activities/conferences" },
      { title: "Fellowship", body: "A year of mentoring, accreditation and leadership.", href: "/activities/fellowship" },
    ],
  },
  news: { title: "Latest news", more: "Read more →", all: "All news →" },
};

const fr: HomeContent = {
  meta: {
    title: "Bridging Our Voices — Les femmes au cœur du dialogue et de la consolidation de la paix",
    description:
      "Une initiative régionale et internationale qui affirme le leadership des femmes et renforce les artisans de la paix et les leaders communautaires, femmes et hommes, du monde arabe et de l’Afrique, pour conduire le dialogue, la résolution des conflits et la prévention de l’extrémisme violent.",
  },
  hero: {
    eyebrow: "Initiative régionale et internationale",
    title: "Les femmes au cœur du dialogue et de la consolidation de la paix",
    lead: "Une initiative régionale qui renforce le rôle des femmes et leur leadership dans le dialogue et la consolidation de la paix, et qui accompagne les artisans et artisanes de la paix et les leaders communautaires, femmes et hommes, pour les faire passer de rôles informels à un leadership reconnu et influent dans la consolidation de la paix et le dialogue interreligieux et interculturel.",
    primary: "Découvrir nos activités",
    secondary: "Nous contacter",
  },
  ticker: {
    label: "À la une",
    items: [
      "Lancement de notre programme de formation en ligne : conférence inaugurale du Dr Mohamed El-Wardany (Université Al-Azhar) sur les conflits religieux et culturels sur les réseaux sociaux",
      "Atelier de formation de trois jours pour les personnes réfugiées à Alexandrie, au HCR, et lancement du réseau Bridging Our Voices pour le dialogue et la coexistence",
      "Lancement officiel de Bridging Our Voices",
      "Les inscriptions à notre programme de formation en ligne (promotions arabe et anglaise) sont closes — merci à toutes les personnes candidates",
      "Rejoignez le réseau d’artisans de la paix Bridging Our Voices",
    ],
  },
  announcement: {
    badge: "Inscriptions closes",
    deadline: "Inscriptions closes le 12 novembre 2026",
    title: "Première promotion en arabe de notre formation numérique",
    body: "Un programme de formation numérique complet, entièrement en arabe sur Zoom pendant un mois, qui donne aux participants les compétences de base et des outils pratiques en facilitation du dialogue, médiation communautaire, gestion de la diversité et transformation des conflits.",
    chips: ["Gratuit", "En ligne · Zoom", "Un mois", "25 ans et plus", "Certificat"],
    primary: "Découvrir l’apprentissage en ligne",
    secondary: "Détails du programme →",
    image: "/banner-fellows.png",
    bannerAlt: "Fellows de Bridging Our Voices (Philippines, Nigeria, Afrique du Sud, Égypte) et logos des partenaires",
  },
  vision: {
    eyebrow: "Notre vision",
    quote:
      "Bâtir un écosystème de dialogue régional et international inclusif, où les femmes et les jeunes leaders disposent d’une autorité légitime et reconnue en tant qu’actrices et acteurs principaux de la facilitation et de la médiation pour résoudre les conflits communautaires et maintenir la paix.",
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
  news: { title: "Dernières actualités", more: "Lire la suite →", all: "Toutes les actualités →" },
};

const ar: HomeContent = {
  meta: {
    title: "Bridging Our Voices — المرأة لقيادة الحوار وبناء السلام",
    description:
      "مبادرة إقليمية ودولية تؤكد قدرة المرأة على القيادة، وتمكّن صناع السلام والقيادات المجتمعية، نساءً ورجالًا، في المنطقة العربية وأفريقيا، وتنقلهم إلى قيادات معترف بها في الحوار وحل النزاعات والوقاية من التطرف العنيف.",
  },
  hero: {
    eyebrow: "مبادرة إقليمية ودولية",
    title: "المرأة لقيادة الحوار وبناء السلام",
    lead: "مبادرة إقليمية تعمل على تعزيز دور المرأة وقيادتها للحوار وبناء السلام، وتمكّن صناع السلام والقيادات المجتمعية، نساءً ورجالًا، وتنقلهم من أدوار غير رسمية إلى قيادات معترف بها ومؤثرة في بناء السلام والحوار بين الأديان والثقافات.",
    primary: "تعرّف/ي على أنشطتنا",
    secondary: "تواصل/ي معنا",
  },
  ticker: {
    label: "آخر الأخبار",
    items: [
      "انطلاق البرنامج التدريبي الإلكتروني: محاضرة افتتاحية للدكتور محمد الورداني (جامعة الأزهر) بعنوان «كيف يُدار الصراع الديني والثقافي على وسائل التواصل الاجتماعي؟»",
      "ورشة تدريبية لمدة ٣ أيام للوافدين بمحافظة الإسكندرية بمقر المفوضية السامية للأمم المتحدة لشؤون اللاجئين، وتدشين «شبكة أصواتنا جسور للحوار والتعايش»",
      "الإطلاق الرسمي لمبادرة «أصواتنا جسور: المرأة لقيادة الحوار وبناء السلام»",
      "أُغلق باب التسجيل في البرنامج التدريبي الإلكتروني (الدفعتان العربية والإنجليزية) — شكرًا لكل من تقدّم",
      "انضم/ي إلى شبكة «أصواتنا جسور» لصناع السلام",
    ],
  },
  announcement: {
    badge: "التسجيل مغلق",
    deadline: "أُغلق باب التسجيل في ١٢ نوفمبر ٢٠٢٦",
    title: "الدفعة الأولى باللغة العربية من دوراتنا التدريبية الرقمية",
    body: "برنامج تدريبي رقمي متكامل يُقدَّم بالكامل باللغة العربية عبر منصة Zoom على مدار شهر كامل، يهدف إلى تزويد المشاركين بالمهارات الأساسية والأدوات العملية في التيسير الحواري، والوساطة المجتمعية، وإدارة التنوع، وتفكيك النزاعات.",
    chips: ["مجاني بالكامل", "أونلاين · Zoom", "شهر كامل", "من سن ٢٥ عامًا", "شهادة مشاركة"],
    primary: "اكتشف/ي التعلم الإلكتروني",
    secondary: "تفاصيل البرنامج ←",
    image: "/banner-fellows.png",
    bannerAlt: "زميلات «أصواتنا جسور» من الفلبين ونيجيريا وجنوب أفريقيا ومصر، مع شعارات الشركاء",
  },
  vision: {
    eyebrow: "رؤيتنا",
    quote:
      "إرساء منظومة حوار إقليمية ودولية شاملة، تمتلك فيها النساء والقيادات الشابة سلطة شرعية ومعترفًا بها بوصفهم الميسّرين والوسطاء الأساسيين في حل النزاعات المجتمعية واستدامة السلام.",
    link: "المزيد عنّا ←",
  },
  pathway: {
    eyebrow: "المسار",
    title: "من صوت مجتمعي إلى قيادة معتمدة",
    steps: [
      { num: "٠١", title: "التعلّم", body: "وحدات ثنائية اللغة يقدّمها ممارسون من المنطقة." },
      { num: "٠٢", title: "الممارسة", body: "إدارة حلقات حوار حقيقية داخل مجتمعك." },
      { num: "٠٣", title: "الاعتماد", body: "شهادة معترف بها في الحوار وبناء السلام." },
      { num: "٠٤", title: "القيادة", body: "الانضمام إلى شبكة دولية ومرافقة الدفعة التالية." },
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
  news: { title: "آخر الأخبار", more: "اقرأ/ي المزيد ←", all: "كل الأخبار ←" },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, HomeContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getHomeContent(locale: Locale): Promise<HomeContent> {
  return loadContent("home", locale, defaults[locale]);
}
