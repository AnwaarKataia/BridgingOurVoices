import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";

/** About page copy, taken word for word from the brand file's About page (EN / FR / AR modes). */
export type AboutContent = {
  meta: { title: string; description: string };
  header: { eyebrow: string; title: string; lead: string };
  who: { eyebrow: string; title: string; paragraphs: string[]; partnersLabel: string; partners: string[] };
  vision: { eyebrow: string; text: string };
  mission: { eyebrow: string; text: string };
  goals: { eyebrow: string; title: string; items: { num: string; title: string; body: string }[] };
};

const en: AboutContent = {
  meta: {
    title: "Who we are",
    description:
      "Bridging Our Voices is a cross-regional, interreligious and intercultural initiative led by KAICIID Fellows alumni, moving women peacebuilders from informal roles to recognised, certified facilitators and mediators.",
  },
  header: { eyebrow: "About", title: "Who we are", lead: "Our story, vision, mission and goals." },
  who: {
    eyebrow: "Who we are",
    title: "Women have always mediated. It’s time it was recognised.",
    paragraphs: [
      "“Bridging Our Voices: Women Leading Dialogue and Peacebuilding” is a flagship cross-regional, interreligious and intercultural initiative led by alumni of the KAICIID International Fellows Programme. It empowers women peacebuilders, community leaders and young female change-makers across the Arab World, Africa and Southeast Asia, transitioning them from informal community observers into recognised, certified facilitators and mediators in interreligious dialogue, conflict transformation and social cohesion.",
      "Supported by the KAICIID Fellows Alumni Network (KFAN), the project operates in strategic partnership with organisations across three regions and with expert international consultants from South Africa.",
    ],
    partnersLabel: "Strategic partners",
    partners: [
      "KAICIID Fellows Alumni Network (KFAN)",
      "Dialogue for Citizenship and Countering Hate Speech",
      "Hayat Foundation for Development and Social Inclusion, Egypt",
      "Adyan Foundation, Lebanon",
      "Xavier University, Ateneo de Cagayan, Philippines",
      "LEGASI Initiative, Nigeria",
    ],
  },
  vision: {
    eyebrow: "Our vision",
    text: "To establish an inclusive regional and international dialogue ecosystem where women and young leaders possess legitimate, recognised authority as primary facilitators and mediators in resolving community conflicts and sustaining peace.",
  },
  mission: {
    eyebrow: "Our mission",
    text: "To equip women and youth with practical skills in conflict analysis, dialogue facilitation, community mediation, trauma resilience and hate-speech deconstruction, providing documented digital and field platforms that enable them to lead peacebuilding and active citizenship.",
  },
  goals: {
    eyebrow: "Strategic objectives",
    title: "Five objectives guide our work",
    items: [
      { num: "01", title: "Bridge the recognition gap", body: "Elevate female grassroots actors from informal observers to certified, recognised peace facilitators and mediators." },
      { num: "02", title: "Develop technical competencies", body: "Provide specialised training in conflict analysis, early warning, interreligious dialogue facilitation and counter-hate speech." },
      { num: "03", title: "Strengthen resilience & healing", body: "Integrate mindfulness, trauma healing and inner-peace practices to sustain facilitators working in high-conflict settings." },
      { num: "04", title: "Institutionalise youth engagement", body: "Empower refugee, displaced and student youth to actively lead community dialogue and social integration." },
      { num: "05", title: "Sustain cross-regional collaboration", body: "Build the permanent “Bridging Our Voices Network” connecting female peacebuilders across Asia, Africa and the Arab region." },
    ],
  },
};

const fr: AboutContent = {
  meta: {
    title: "Qui sommes-nous",
    description:
      "Bridging Our Voices est une initiative transrégionale, interreligieuse et interculturelle portée par des anciens fellows du KAICIID, qui fait des femmes artisanes de paix des facilitatrices et médiatrices reconnues et certifiées.",
  },
  header: {
    eyebrow: "Qui sommes-nous",
    title: "Qui sommes-nous",
    lead: "Notre histoire, notre vision, notre mission et nos objectifs.",
  },
  who: {
    eyebrow: "Qui sommes-nous",
    title: "Les femmes ont toujours été médiatrices. Il est temps de le reconnaître.",
    paragraphs: [
      "« Bridging Our Voices : les femmes au cœur du dialogue et de la consolidation de la paix » est une initiative phare transrégionale, interreligieuse et interculturelle portée par des anciens du Programme international de fellows du KAICIID. Elle renforce les femmes artisanes de paix, les leaders communautaires et les jeunes femmes actrices de changement dans le monde arabe, en Afrique et en Asie du Sud-Est, pour les faire passer d’observatrices informelles à facilitatrices et médiatrices reconnues et certifiées du dialogue interreligieux, de la transformation des conflits et de la cohésion sociale.",
      "Soutenu par le réseau des anciens fellows du KAICIID (KFAN), le projet est mené en partenariat stratégique avec des organisations de trois régions et des consultants internationaux d’Afrique du Sud.",
    ],
    partnersLabel: "Partenaires stratégiques",
    partners: [
      "Réseau des anciens fellows du KAICIID (KFAN)",
      "Dialogue pour la citoyenneté et la lutte contre les discours de haine",
      "Fondation Hayat pour le développement et l’inclusion sociale, Égypte",
      "Fondation Adyan, Liban",
      "Xavier University, Ateneo de Cagayan, Philippines",
      "LEGASI Initiative, Nigeria",
    ],
  },
  vision: {
    eyebrow: "Notre vision",
    text: "Bâtir un écosystème de dialogue régional et international inclusif, où les femmes et les jeunes leaders disposent d’une autorité légitime et reconnue comme facilitatrices et médiatrices principales dans la résolution des conflits communautaires et le maintien de la paix.",
  },
  mission: {
    eyebrow: "Notre mission",
    text: "Doter les femmes et les jeunes de compétences pratiques en analyse des conflits, facilitation du dialogue, médiation communautaire, résilience face au trauma et déconstruction des discours de haine, grâce à des plateformes numériques et de terrain documentées qui leur permettent de conduire la consolidation de la paix et la citoyenneté active.",
  },
  goals: {
    eyebrow: "Objectifs stratégiques",
    title: "Cinq objectifs guident notre action",
    items: [
      { num: "01", title: "Combler le déficit de reconnaissance", body: "Faire passer les actrices de terrain d’observatrices informelles à facilitatrices et médiatrices de paix certifiées et reconnues." },
      { num: "02", title: "Développer les compétences techniques", body: "Offrir des formations spécialisées en analyse des conflits, alerte précoce, facilitation du dialogue interreligieux et lutte contre les discours de haine." },
      { num: "03", title: "Renforcer la résilience et la guérison", body: "Intégrer pleine conscience, guérison des traumatismes et paix intérieure pour soutenir les facilitatrices en contextes de fort conflit." },
      { num: "04", title: "Institutionnaliser l’engagement des jeunes", body: "Permettre aux jeunes réfugiés, déplacés et étudiants de mener activement le dialogue communautaire et l’intégration sociale." },
      { num: "05", title: "Pérenniser la collaboration transrégionale", body: "Créer le réseau permanent « Bridging Our Voices » reliant les artisanes de paix d’Asie, d’Afrique et du monde arabe." },
    ],
  },
};

const ar: AboutContent = {
  meta: {
    title: "من نحن",
    description:
      "«أصواتنا جسور» مبادرة رائدة عابرة للأقاليم بين الأديان والثقافات، يقودها خريجو برنامج الزمالة الدولية لكايسيد، تنقل صانعات السلام إلى ميسِّرات ووسيطات معترف بهن ومعتمدات.",
  },
  header: { eyebrow: "من نحن", title: "تعرّفي علينا", lead: "قصتنا ورؤيتنا ورسالتنا وأهدافنا." },
  who: {
    eyebrow: "من نحن",
    title: "لطالما كانت المرأة وسيطة. حان وقت الاعتراف بذلك.",
    paragraphs: [
      "«أصواتنا جسور: المرأة لقيادة الحوار وبناء السلام» مبادرة رائدة عابرة للأقاليم، بين الأديان والثقافات، يقودها خريجو برنامج الزمالة الدولية لمركز الملك عبدالله العالمي للحوار (كايسيد). تمكّن المبادرة صانعات السلام والقيادات المجتمعية والشابات صانعات التغيير في العالم العربي وأفريقيا وجنوب شرق آسيا، وتنقلهن من موقع المراقِبات غير الرسميات إلى ميسِّرات ووسيطات معترف بهن ومعتمدات في الحوار بين الأديان وتحويل النزاعات والتماسك الاجتماعي.",
      "بدعم من شبكة خريجي زمالة كايسيد (KFAN)، يعمل المشروع بشراكة استراتيجية مع مؤسسات في ثلاثة أقاليم ومع مستشارين دوليين خبراء من جنوب أفريقيا.",
    ],
    partnersLabel: "الشركاء الاستراتيجيون",
    partners: [
      "شبكة خريجي زمالة كايسيد (KFAN)",
      "الحوار من أجل المواطنة ومواجهة خطاب الكراهية",
      "مؤسسة حياة للتنمية والدمج المجتمعي، مصر",
      "مؤسسة أديان، لبنان",
      "جامعة كزافييه، أتينيو دي كاغايان، الفلبين",
      "مبادرة LEGASI، نيجيريا",
    ],
  },
  vision: {
    eyebrow: "رؤيتنا",
    text: "إرساء منظومة حوار إقليمية ودولية شاملة، تمتلك فيها النساء والقيادات الشابة سلطة شرعية ومعترفًا بها بوصفهن الميسِّرات والوسيطات الأساسيات في حل النزاعات المجتمعية واستدامة السلام.",
  },
  mission: {
    eyebrow: "رسالتنا",
    text: "تزويد النساء والشباب بمهارات عملية في تحليل النزاعات وتيسير الحوار والوساطة المجتمعية والصمود أمام الصدمات وتفكيك خطاب الكراهية، وتوفير منصات رقمية وميدانية موثّقة تمكّنهم من قيادة بناء السلام والمواطنة الفاعلة.",
  },
  goals: {
    eyebrow: "الأهداف الاستراتيجية",
    title: "خمسة أهداف توجّه عملنا",
    items: [
      { num: "٠١", title: "سدّ فجوة الاعتراف", body: "الارتقاء بالفاعلات القاعديات من مراقِبات غير رسميات إلى ميسِّرات ووسيطات سلام معتمدات ومعترف بهن." },
      { num: "٠٢", title: "تطوير الكفاءات الفنية", body: "تقديم تدريب متخصص في تحليل النزاعات والإنذار المبكر وتيسير الحوار بين الأديان ومواجهة خطاب الكراهية." },
      { num: "٠٣", title: "تعزيز الصمود والتعافي", body: "دمج ممارسات اليقظة الذهنية والتعافي من الصدمات والسلام الداخلي لدعم الميسِّرات العاملات في بيئات شديدة النزاع." },
      { num: "٠٤", title: "مأسسة مشاركة الشباب", body: "تمكين الشباب من اللاجئين والنازحين والطلاب من قيادة الحوار المجتمعي والاندماج الاجتماعي بفاعلية." },
      { num: "٠٥", title: "استدامة التعاون العابر للأقاليم", body: "بناء «شبكة أصواتنا جسور» الدائمة التي تربط صانعات السلام في آسيا وأفريقيا والمنطقة العربية." },
    ],
  },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, AboutContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getAboutContent(locale: Locale): Promise<AboutContent> {
  return loadContent("about", locale, defaults[locale]);
}
