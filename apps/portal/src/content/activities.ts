import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";

/** Activities page copy, taken word for word from the brand file's Activities page (EN / FR / AR modes). */
export type ActivitiesContent = {
  meta: { title: string; description: string };
  /** `eyebrow` labels every Activities page; `lead` is shown under the Training programmes title. */
  header: { eyebrow: string; title: string; lead: string };
  training: { index: string; eyebrow: string; title: string };
  course: {
    badge: string;
    deadline: string;
    title: string;
    body: string;
    eligibility: string;
    whyTitle: string;
    why: string[];
    cta: string;
    modulesLabel: string;
    modules: { num: string; text: string }[];
    extra: string;
  };
  flagship: {
    eyebrow: string;
    title: string;
    body: string;
    steps: { num: string; title: string; body: string }[];
    tags: string[];
    /** Arch photo ("" = striped placeholder). */
    image: string;
    photoAlt: string;
    quote: string;
  };
  tracks: { num: string; title: string; body: string; tag: string }[];
  seminars: {
    index: string;
    eyebrow: string;
    title: string;
    lead: string;
    items: { image: string; meta: string; title: string; body: string; cta: string }[];
  };
  conferences: {
    index: string;
    eyebrow: string;
    title: string;
    lead: string;
    playLabel: string;
    featured: { image: string; kind: string; title: string };
    sessions: { image: string; kind: string; title: string }[];
  };
  fellowship: {
    index: string;
    eyebrow: string;
    title: string;
    lead: string;
    cta: string;
    status: string;
    benefits: { title: string; body: string }[];
  };
};

const en: ActivitiesContent = {
  meta: {
    title: "Activities",
    description:
      "Training programmes, seminars, conferences and a fellowship: four ways for women peacebuilders to learn, connect and lead with Bridging Our Voices.",
  },
  header: {
    eyebrow: "Activities",
    title: "How we build peace leaders",
    lead: "Training programmes, seminars, conferences and a fellowship, four ways to learn, connect and lead.",  },
  training: { index: "01", eyebrow: "Training programmes", title: "Accredited training in dialogue and peacebuilding" },
  course: {
    badge: "Current programme",
    deadline: "Deadline: 12 November 2026",
    title: "Bridging Our Voices: Women Leading Dialogue and Peacebuilding",
    body: "A complete digital training programme delivered entirely in Arabic over Zoom for one full month, giving participants core skills and practical tools in dialogue facilitation, community mediation, diversity management and conflict transformation.",
    eligibility: "Open to everyone aged 25 and over, no previous peacebuilding experience required.",
    whyTitle: "Why take part",
    why: [
      "Completely free online training",
      "Certificate of participation from the initiative on meeting the attendance requirement",
      "Regional and international networking, and membership of the Bridging Our Voices network of peacebuilders",
    ],
    cta: "Register now",
    modulesLabel: "Core modules",
    modules: [
      { num: "1", text: "Foundations of dialogue, effective communication and deep listening" },
      { num: "2", text: "Conflict-analysis tools and understanding the roots of community conflict" },
      { num: "3", text: "Activating the Women, Peace and Security (WPS) agenda" },
      { num: "4", text: "Community mediation skills and deconstructing stereotypes" },
      { num: "5", text: "Gender and conflict transformation" },
      { num: "6", text: "Religious and cultural diversity and the conflict map in Asia and Africa" },
      { num: "7", text: "Designing and developing applied community initiatives" },
    ],
    extra: "Live interactive sessions with international experts and specialists",
  },
  flagship: {
    eyebrow: "Flagship programme · Interfaith dialogue",
    title: "Many faiths, many cultures, one shared table.",
    body: "Women are often the first bridges between families of different faiths and backgrounds. Our interfaith and intercultural dialogue programme gives that everyday bridging structure, skills and recognition.",
    steps: [
      { num: "01", title: "Encounter", body: "Facilitated dialogue circles that bring women of different faiths and cultures together." },
      { num: "02", title: "Understanding", body: "Religious and cultural literacy to replace stereotypes with knowledge." },
      { num: "03", title: "Joint action", body: "Shared community initiatives that turn dialogue into everyday cooperation." },
    ],
    tags: ["#InterfaithDialogue", "#InterculturalDialogue"],
    image: "",
    photoAlt: "Women of different faiths in dialogue",
    quote: "“Dialogue begins when we listen to understand, not to reply.”",
  },
  tracks: [
    { num: "02", title: "Women in Peacebuilding", body: "Mediation, negotiation and women’s place in lasting peace processes.", tag: "#WomenInPeacebuilding" },
    { num: "03", title: "Countering Hate Speech", body: "Recognise, respond to and reframe divisive narratives online and offline.", tag: "#CounteringHateSpeech" },
    { num: "04", title: "Conflict Analysis & Management", body: "Map actors, causes and dynamics to manage disputes before they escalate.", tag: "#ConflictManagement" },
    { num: "05", title: "Citizenship & Leadership", body: "Civic participation and the confidence to lead in public life.", tag: "#Citizenship #Leadership" },
  ],
  seminars: {
    index: "02",
    eyebrow: "Seminars",
    title: "Open seminars and webinars",
    lead: "Short, open sessions with practitioners and scholars, online and in person, in Arabic and English.",
    items: [
      { image: "", meta: "Webinar series · Online", title: "Women, faith and the making of peace", body: "A four-part series on women’s roles in interreligious peace work.", cta: "Register →" },
      { image: "", meta: "Seminar · In person", title: "Hate speech: from recognition to response", body: "Case studies and tools for community leaders and educators.", cta: "Register →" },
      { image: "", meta: "Seminar · Online", title: "Citizenship and women’s public voice", body: "How civic participation opens paths to leadership.", cta: "Watch the recording →" },
    ],
  },
  conferences: {
    index: "03",
    eyebrow: "Conferences",
    title: "Launch conference",
    lead: "Our regional and international conference brings together participants, partners and experts to share practice and set the agenda.",
    playLabel: "Play video",
    featured: { image: "", kind: "Opening address", title: "Why women’s voices matter in peacebuilding" },
    sessions: [
      { image: "", kind: "Panel", title: "From informal mediation to recognised leadership" },
      { image: "", kind: "Keynote", title: "Interfaith and intercultural dialogue in practice" },
      { image: "", kind: "Workshop", title: "Countering hate speech in local communities" },
      { image: "", kind: "Testimony", title: "A community leader’s journey" },
      { image: "", kind: "Panel", title: "Conflict analysis and early response" },
      { image: "", kind: "Closing", title: "The road ahead for the network" },
    ],
  },
  fellowship: {
    index: "04",
    eyebrow: "Fellowship",
    title: "The Bridging Our Voices Fellowship",
    lead: "A year-long fellowship for women already active in their communities: mentoring, accreditation and the support to lead their own dialogue initiative.",
    cta: "Apply for the fellowship",
    status: "Applications open now",
    benefits: [
      { title: "Mentoring", body: "One-to-one guidance from experienced peacebuilders." },
      { title: "Accreditation", body: "A recognised certificate in dialogue and peacebuilding." },
      { title: "Community project", body: "Support to design and run your own dialogue initiative." },
      { title: "Network", body: "Lasting ties with fellows across the region and beyond." },
    ],
  },
};

const fr: ActivitiesContent = {
  meta: {
    title: "Activités",
    description:
      "Programmes de formation, séminaires, congrès et bourse : quatre manières d’apprendre, de se relier et de diriger avec Bridging Our Voices.",
  },
  header: {
    eyebrow: "Activités",
    title: "Comment nous formons des leaders de la paix",
    lead: "Programmes de formation, séminaires, congrès et bourse, quatre manières d’apprendre, de se relier et de diriger.",  },
  training: { index: "01", eyebrow: "Programmes de formation", title: "Formations certifiantes en dialogue et consolidation de la paix" },
  course: {
    badge: "Programme en cours",
    deadline: "Date limite : 12 novembre 2026",
    title: "Bridging Our Voices : les femmes au cœur du dialogue et de la consolidation de la paix",
    body: "Un programme de formation numérique complet, entièrement en arabe sur Zoom pendant un mois, qui donne aux participants les compétences de base et des outils pratiques en facilitation du dialogue, médiation communautaire, gestion de la diversité et transformation des conflits.",
    eligibility: "Ouvert à toutes et tous à partir de 25 ans, aucune expérience préalable en consolidation de la paix requise.",
    whyTitle: "Pourquoi participer",
    why: [
      "Formation en ligne entièrement gratuite",
      "Certificat de participation délivré par l’initiative selon le taux de présence requis",
      "Mise en réseau régionale et internationale et adhésion au réseau d’artisans de la paix Bridging Our Voices",
    ],
    cta: "S’inscrire",
    modulesLabel: "Modules principaux",
    modules: [
      { num: "1", text: "Fondements du dialogue, communication efficace et écoute profonde" },
      { num: "2", text: "Outils d’analyse des conflits et compréhension des racines des conflits communautaires" },
      { num: "3", text: "Mise en œuvre de l’agenda Femmes, paix et sécurité (FPS)" },
      { num: "4", text: "Médiation communautaire et déconstruction des stéréotypes" },
      { num: "5", text: "Genre et transformation des conflits" },
      { num: "6", text: "Diversité religieuse et culturelle et carte des conflits en Asie et en Afrique" },
      { num: "7", text: "Conception et développement d’initiatives communautaires appliquées" },
    ],
    extra: "Rencontres interactives en direct avec des experts internationaux",
  },
  flagship: {
    eyebrow: "Programme phare · Dialogue interreligieux",
    title: "Plusieurs religions, plusieurs cultures, une même table.",
    body: "Les femmes sont souvent les premiers ponts entre des familles de religions et d’horizons différents. Notre programme de dialogue interreligieux et interculturel donne à ce rôle quotidien une méthode, des compétences et une reconnaissance.",
    steps: [
      { num: "01", title: "Rencontre", body: "Des cercles de dialogue animés réunissant des femmes de religions et de cultures différentes." },
      { num: "02", title: "Compréhension", body: "Une culture religieuse et interculturelle pour remplacer les stéréotypes par la connaissance." },
      { num: "03", title: "Action commune", body: "Des initiatives communautaires partagées qui font du dialogue une coopération quotidienne." },
    ],
    tags: ["#InterfaithDialogue", "#InterculturalDialogue"],
    image: "",
    photoAlt: "Femmes de différentes religions en dialogue",
    quote: "« Le dialogue commence quand on écoute pour comprendre, et non pour répondre. »",
  },
  tracks: [
    { num: "02", title: "Les femmes et la consolidation de la paix", body: "Médiation, négociation et place des femmes dans les processus de paix durables.", tag: "#WomenInPeacebuilding" },
    { num: "03", title: "Contrer les discours de haine", body: "Repérer, répondre et reformuler les récits qui divisent, en ligne et hors ligne.", tag: "#CounteringHateSpeech" },
    { num: "04", title: "Analyse et gestion des conflits", body: "Cartographier acteurs, causes et dynamiques pour gérer les tensions avant qu’elles ne s’aggravent.", tag: "#ConflictManagement" },
    { num: "05", title: "Citoyenneté et leadership", body: "Participation civique et confiance pour agir dans la vie publique.", tag: "#Citizenship #Leadership" },
  ],
  seminars: {
    index: "02",
    eyebrow: "Séminaires",
    title: "Séminaires et webinaires ouverts",
    lead: "Des sessions courtes et ouvertes avec praticiens et chercheurs, en ligne et en présentiel, en arabe, anglais et français.",
    items: [
      { image: "", meta: "Cycle de webinaires · En ligne", title: "Femmes, foi et construction de la paix", body: "Un cycle en quatre séances sur le rôle des femmes dans la paix interreligieuse.", cta: "S’inscrire →" },
      { image: "", meta: "Séminaire · Présentiel", title: "Discours de haine : du repérage à la réponse", body: "Études de cas et outils pour leaders communautaires et éducateurs.", cta: "S’inscrire →" },
      { image: "", meta: "Séminaire · En ligne", title: "Citoyenneté et voix publique des femmes", body: "Comment la participation civique ouvre la voie au leadership.", cta: "Voir l’enregistrement →" },
    ],
  },
  conferences: {
    index: "03",
    eyebrow: "Congrès",
    title: "Congrès de lancement",
    lead: "Notre congrès régional et international réunit participantes, partenaires et experts pour partager les pratiques et fixer les priorités.",
    playLabel: "Lire la vidéo",
    featured: { image: "", kind: "Discours d’ouverture", title: "Pourquoi la voix des femmes compte dans la consolidation de la paix" },
    sessions: [
      { image: "", kind: "Table ronde", title: "De la médiation informelle au leadership reconnu" },
      { image: "", kind: "Conférence", title: "Le dialogue interreligieux et interculturel en pratique" },
      { image: "", kind: "Atelier", title: "Contrer les discours de haine au niveau local" },
      { image: "", kind: "Témoignage", title: "Le parcours d’une leader communautaire" },
      { image: "", kind: "Table ronde", title: "Analyse des conflits et réponse précoce" },
      { image: "", kind: "Clôture", title: "Les perspectives du réseau" },
    ],
  },
  fellowship: {
    index: "04",
    eyebrow: "Bourse",
    title: "La bourse Bridging Our Voices",
    lead: "Une bourse d’un an pour les femmes déjà engagées dans leurs communautés : mentorat, certification et accompagnement pour mener leur propre initiative de dialogue.",
    cta: "Candidater à la bourse",
    status: "Candidatures ouvertes",
    benefits: [
      { title: "Mentorat", body: "Un accompagnement individuel par des artisanes de paix expérimentées." },
      { title: "Certification", body: "Un certificat reconnu en dialogue et consolidation de la paix." },
      { title: "Projet communautaire", body: "Un soutien pour concevoir et mener votre propre initiative de dialogue." },
      { title: "Réseau", body: "Des liens durables avec des boursières de la région et d’ailleurs." },
    ],
  },
};

const ar: ActivitiesContent = {
  meta: {
    title: "الأنشطة",
    description:
      "برامج تدريبية وندوات ومؤتمرات وزمالة: أربعة طرق للتعلّم والتواصل والقيادة مع مبادرة «أصواتنا جسور» لصانعات السلام.",
  },
  header: {
    eyebrow: "الأنشطة",
    title: "كيف نصنع قيادات السلام",
    lead: "برامج تدريبية وندوات ومؤتمرات وزمالة، أربعة طرق للتعلّم والتواصل والقيادة.",  },
  training: { index: "01", eyebrow: "برامج تدريبية", title: "تدريب معتمد في الحوار وبناء السلام" },
  course: {
    badge: "البرنامج الحالي",
    deadline: "آخر موعد للتسجيل: ١٢ نوفمبر ٢٠٢٦",
    title: "«أصواتنا جسور: نساء لقيادة الحوار وبناء السلام»",
    body: "برنامج تدريبي رقمي متكامل يُقدَّم بالكامل باللغة العربية عبر منصة Zoom على مدار شهر كامل، يهدف إلى تزويد المشاركين بالمهارات الأساسية والأدوات العملية في التيسير الحواري، والوساطة المجتمعية، وإدارة التنوع، وتفكيك النزاعات.",
    eligibility: "الدورة مفتوحة لجميع المهتمين (من سن ٢٥ عامًا فأكثر) دون اشتراط خبرة سابقة في بناء السلام.",
    whyTitle: "مميزات المشاركة",
    why: [
      "تدريب إلكتروني مجاني بالكامل",
      "شهادة مشاركة معتمدة من المبادرة عند استكمال نسبة الحضور المطلوبة",
      "فرصة للتشبيك الإقليمي والدولي والانضمام لشبكة «أصواتنا جسور» لصناع السلام",
    ],
    cta: "سجّل/ي الآن",
    modulesLabel: "المحاور الرئيسية",
    modules: [
      { num: "١", text: "أسس الحوار ومهارات التواصل الفعّال والإنصات العميق" },
      { num: "٢", text: "أدوات تحليل الصراعات وفهم جذور النزاع المجتمعي" },
      { num: "٣", text: "تفعيل أجندة المرأة والسلام والأمن (WPS)" },
      { num: "٤", text: "مهارات الوساطة المجتمعية وتفكيك الصور النمطية" },
      { num: "٥", text: "النوع الاجتماعي وتحويل النزاعات" },
      { num: "٦", text: "التنوع الديني والثقافي وخريطة الصراعات في آسيا وإفريقيا" },
      { num: "٧", text: "تصميم وتطوير المبادرات المجتمعية التطبيقية" },
    ],
    extra: "لقاءات تفاعلية مباشرة مع خبراء ومتخصصين دوليين",
  },
  flagship: {
    eyebrow: "البرنامج الرئيسي · الحوار بين الأديان",
    title: "أديان كثيرة، وثقافات متعددة، ومائدة واحدة.",
    body: "كثيرًا ما تكون المرأة الجسر الأول بين أسر من أديان وخلفيات مختلفة. يمنح برنامج الحوار بين الأديان والثقافات هذا الدور اليومي منهجيةً ومهاراتٍ واعترافًا.",
    steps: [
      { num: "٠١", title: "اللقاء", body: "حلقات حوار مُيسَّرة تجمع نساءً من أديان وثقافات مختلفة." },
      { num: "٠٢", title: "الفهم", body: "معرفة دينية وثقافية تستبدل الصور النمطية بالمعرفة." },
      { num: "٠٣", title: "العمل المشترك", body: "مبادرات مجتمعية مشتركة تحوّل الحوار إلى تعاون يومي." },
    ],
    tags: ["#InterfaithDialogue", "#InterculturalDialogue"],
    image: "",
    photoAlt: "نساء من أديان مختلفة في حوار",
    quote: "«يبدأ الحوار حين نُصغي لنفهم، لا لنرد.»",
  },
  tracks: [
    { num: "٠٢", title: "المرأة وبناء السلام", body: "الوساطة والتفاوض ومكانة المرأة في عمليات السلام المستدامة.", tag: "#WomenInPeacebuilding" },
    { num: "٠٣", title: "مواجهة خطاب الكراهية", body: "رصد الخطابات المُفرِّقة والرد عليها وإعادة صياغتها رقميًا وواقعيًا.", tag: "#CounteringHateSpeech" },
    { num: "٠٤", title: "تحليل النزاعات وإدارتها", body: "تحديد الأطراف والأسباب والديناميكيات لإدارة الخلاف قبل تصاعده.", tag: "#ConflictManagement" },
    { num: "٠٥", title: "المواطنة والقيادة", body: "المشاركة المدنية والثقة للقيادة في الحياة العامة.", tag: "#Citizenship #Leadership" },
  ],
  seminars: {
    index: "02",
    eyebrow: "ندوات",
    title: "ندوات مفتوحة وندوات أونلاين",
    lead: "جلسات قصيرة ومفتوحة مع ممارسين وباحثين، أونلاين وحضوريًا، بالعربية والإنجليزية.",
    items: [
      { image: "", meta: "سلسلة ندوات · أونلاين", title: "المرأة والإيمان وصناعة السلام", body: "سلسلة من أربع حلقات عن دور المرأة في العمل السلمي بين الأديان.", cta: "سجّلي ←" },
      { image: "", meta: "ندوة · حضوري", title: "خطاب الكراهية: من الرصد إلى الرد", body: "دراسات حالة وأدوات للقيادات المجتمعية والمربّين.", cta: "سجّلي ←" },
      { image: "", meta: "ندوة · أونلاين", title: "المواطنة وصوت المرأة في الشأن العام", body: "كيف تفتح المشاركة المدنية طرقًا نحو القيادة.", cta: "شاهدي التسجيل ←" },
    ],
  },
  conferences: {
    index: "03",
    eyebrow: "مؤتمرات",
    title: "مؤتمر الإطلاق",
    lead: "يجمع مؤتمرنا الإقليمي والدولي المشاركات والشركاء والخبراء لتبادل الممارسات ورسم الأولويات.",
    playLabel: "تشغيل الفيديو",
    featured: { image: "", kind: "الكلمة الافتتاحية", title: "لماذا يهمّ صوت المرأة في بناء السلام" },
    sessions: [
      { image: "", kind: "جلسة نقاش", title: "من الوساطة غير الرسمية إلى القيادة المعترف بها" },
      { image: "", kind: "كلمة رئيسية", title: "الحوار بين الأديان والثقافات عمليًا" },
      { image: "", kind: "ورشة", title: "مواجهة خطاب الكراهية في المجتمعات المحلية" },
      { image: "", kind: "شهادة", title: "رحلة قائدة مجتمعية" },
      { image: "", kind: "جلسة نقاش", title: "تحليل النزاعات والاستجابة المبكرة" },
      { image: "", kind: "الختام", title: "الطريق أمام الشبكة" },
    ],
  },
  fellowship: {
    index: "04",
    eyebrow: "زمالة",
    title: "زمالة «أصواتنا جسور»",
    lead: "زمالة لمدة عام للنساء الفاعلات في مجتمعاتهن: إرشاد واعتماد ودعم لقيادة مبادرة حوار خاصة بهن.",
    cta: "قدّمي على الزمالة",
    status: "باب التقديم مفتوح الآن",
    benefits: [
      { title: "الإرشاد", body: "توجيه فردي من صانعات سلام ذوات خبرة." },
      { title: "الاعتماد", body: "شهادة معترف بها في الحوار وبناء السلام." },
      { title: "مشروع مجتمعي", body: "دعم لتصميم وتنفيذ مبادرة حوار خاصة بك." },
      { title: "الشبكة", body: "روابط دائمة مع زميلات من المنطقة وخارجها." },
    ],
  },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, ActivitiesContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getActivitiesContent(locale: Locale): Promise<ActivitiesContent> {
  return loadContent("activities", locale, defaults[locale]);
}
