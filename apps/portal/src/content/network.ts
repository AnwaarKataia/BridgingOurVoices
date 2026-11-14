import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";

/**
 * Network section copy, taken word for word from the brand file's Network page (EN / FR / AR modes).
 * Member names follow the fellows banner (owner's decision, 2026-11-06), not the brand file's Members section.
 */
/** `image`: portrait path (editable in the dashboard). */
export type Member = { image: string; name: string; role: string; country: string; bio: string[] };

export type NetworkContent = {
  header: { eyebrow: string; lead: string };
  membership: {
    meta: { title: string; description: string };
    title: string;
    columns: { title: string; items: string[] }[];
  };
  join: {
    meta: { title: string; description: string };
    title: string;
    lead: string;
    legend: string;
    name: string;
    gender: string;
    genders: { value: string; label: string }[];
    job: string;
    org: string;
    country: string;
    countryPlaceholder: string;
    email: string;
    religion: string;
    subreligion: string;
    fields: string;
    fieldOptions: { value: string; label: string }[];
    /** Experience summary (max 150 words, owner 2026-11-14). `wordCount` uses {count} and {max}. */
    experience: string;
    experienceHint: string;
    wordCount: string;
    experienceTooLong: string;
    /** CV upload: PDF, max 4 pages and 5 MB (checked again by the API). */
    cv: string;
    cvButton: string;
    cvHint: string;
    cvError: string;
    motivation: string;
    activities: string;
    photo: string;
    photoButton: string;
    photoHint: string;
    photoTooBig: string;
    consent: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
  members: {
    meta: { title: string; description: string };
    title: string;
    people: Member[];
    networkTitle: string;
    networkLead: string;
    networkCta: string;
  };
};

const genderValues = ["female", "male", "na"] as const;
const fieldValues = [
  "interfaith", "intercultural", "mediation", "conflict-analysis", "hate-speech", "wps",
  "youth", "healing", "citizenship", "education", "research", "media",
] as const;
const zip = <T extends string>(values: readonly T[], labels: string[]) => values.map((value, i) => ({ value, label: labels[i] }));

const photos = {
  anwaar: "/team/anwaar-kataia.jpg",
  monaLisa: "/team/mona-lisa.jpg",
  kaltumi: "/team/kaltumi-abdulazeez.jpg",
  jenny: "/team/jenny-canau.jpg",
};

const en: NetworkContent = {
  header: { eyebrow: "Network", lead: "Our advisory board and a growing network of women peace leaders." },
  membership: {
    meta: {
      title: "Membership",
      description: "Who can join the Bridging Our Voices network of women peacebuilders, what members gain and what we ask of them.",
    },
    title: "Who can join, and what membership means",
    columns: [
      {
        title: "Who can join",
        items: [
          "Women peacebuilders and community leaders",
          "Religious leaders and interfaith dialogue practitioners",
          "Young people aged 18+, including refugee, displaced and student youth",
          "Trainers, researchers and partner organisations",
        ],
      },
      {
        title: "What you gain",
        items: [
          "Priority access to training programmes and seminars",
          "Certification pathways in dialogue and mediation",
          "A regional and international peer network",
          "Opportunities to co-lead community initiatives",
        ],
      },
      {
        title: "What we ask",
        items: [
          "Commit to the network’s code of conduct",
          "Take part in at least one activity each year",
          "Share your practice and learning with peers",
          "Champion dialogue and reject hate speech",
        ],
      },
    ],
  },
  join: {
    meta: {
      title: "Add your voice to ours",
      description: "Membership of the Bridging Our Voices network is free. Share your details, a summary of your experience and your CV, and our team will contact you.",
    },
    title: "Add your voice to ours",
    lead: "Membership is free. Share your details, a summary of your experience and your CV, and our team will review your application and contact you.",
    legend: "Your details",
    name: "Full name",
    gender: "Gender",
    genders: zip(genderValues, ["Female", "Male", "Prefer not to say"]),
    job: "Job title",
    org: "Affiliated organisation",
    country: "Country",
    countryPlaceholder: "Select…",
    email: "Email",
    religion: "Official religion",
    subreligion: "Denomination / sub-religion",
    fields: "Fields of work",
    fieldOptions: zip(fieldValues, [
      "Interfaith dialogue", "Intercultural dialogue", "Community mediation", "Conflict analysis", "Countering hate speech",
      "Women, Peace & Security", "Youth engagement", "Trauma healing & resilience", "Citizenship & leadership",
      "Education & training", "Research", "Media",
    ]),
    experience: "Summary of your experience",
    experienceHint: "One paragraph, up to 150 words.",
    wordCount: "{count} / {max} words",
    experienceTooLong: "Please keep the summary to 150 words or fewer.",
    cv: "Your CV",
    cvButton: "Upload CV",
    cvHint: "PDF only, up to 4 pages and 5 MB.",
    cvError: "Please choose a PDF of up to 4 pages and 5 MB.",
    motivation: "What motivates you to join us?",
    activities: "Which activities could you carry out with us?",
    photo: "Your photo (optional)",
    photoButton: "Upload photo",
    photoHint: "JPG or PNG, up to 3 MB.",
    photoTooBig: "Please choose a JPG or PNG under 3 MB.",
    consent: "I agree to the network’s code of conduct and to my data being used to process my application.",
    submit: "Submit application",
    sending: "Sending…",
    success: "Thank you, your application has been received. Our team will review it and contact you.",
    error: "Something went wrong, please check the form and try again.",
  },
  members: {
    meta: {
      title: "Our members",
      description: "Meet the leadership and core team of Bridging Our Voices: KAICIID Fellows from Egypt, the Philippines, Nigeria and South Africa.",
    },
    title: "Project leadership & core team",
    people: [
      {
        image: photos.anwaar,
        name: "Dr. Anwaar Kataia",
        role: "General Project Coordinator & Lead Fellow",
        country: "Egypt",
        bio: [
          "KAICIID International Fellow and faculty member at Al-Azhar University.",
          "PhD researcher in Political & Strategic Studies and National Security; Diploma in Political Communication (Cairo University); National Defense College Fellow.",
          "15+ years as expert trainer and consultant; trained ~4,000 religious and community leaders; led regional UNESCO / Arab League projects reaching 500k+ beneficiaries.",
        ],
      },
      {
        image: photos.monaLisa,
        name: "Mona Lisa D. Pangan",
        role: "Co-Founder & Partner Representative",
        country: "Philippines",
        bio: [
          "KAICIID Fellow (2023) and Assistant to the Director, Campus Ministries Office, Xavier University, Ateneo de Cagayan.",
          "MA in Religious Education; certified retreat director, interreligious dialogue practitioner and intercultural peace facilitator in Southeast Asia.",
        ],
      },
      {
        image: photos.kaltumi,
        name: "Kaltumi Abdulazeez",
        role: "Co-Founder & Partner Representative",
        country: "Nigeria",
        bio: [
          "KAICIID Fellow; Founder and Executive Director of LEGASI Initiative (Ladies Empowerment Goals and Support Initiative).",
          "International expert in countering violent extremism, community mediation, gender inclusion and grassroots peacebuilding in West Africa.",
        ],
      },
      {
        image: photos.jenny,
        name: "Jenny Canau",
        role: "Project Consultant & Healing Specialist",
        country: "South Africa",
        bio: [
          "KAICIID Fellow; co-founder of Mindfulness Africa and Peace & Healing Circles South Africa.",
          "Former human-rights lawyer with 20+ years training magistrates and prosecutors in compassion, resilience and values-based decision-making.",
          "Certified trainer (Stanford Applied Compassion Academy, UN UPEACE); Tibetan Buddhist representative, Cape Town Interfaith Initiative.",
        ],
      },
    ],
    networkTitle: "Our network",
    networkLead: "Women peacemakers and community leaders across the region and beyond, learning, practising and leading together.",
    networkCta: "Join the network",
  },
};

const fr: NetworkContent = {
  header: { eyebrow: "Réseau", lead: "Notre comité consultatif et un réseau grandissant de femmes leaders de la paix." },
  membership: {
    meta: {
      title: "Adhésion",
      description: "Qui peut rejoindre le réseau des artisanes de paix Bridging Our Voices, ce que l’adhésion apporte et ce que nous demandons.",
    },
    title: "Qui peut adhérer, et ce que l’adhésion implique",
    columns: [
      {
        title: "Qui peut adhérer",
        items: [
          "Femmes artisanes de paix et leaders communautaires",
          "Responsables religieux et praticiens du dialogue interreligieux",
          "Jeunes de 18 ans et plus, y compris réfugiés, déplacés et étudiants",
          "Formateurs, chercheurs et organisations partenaires",
        ],
      },
      {
        title: "Ce que vous y gagnez",
        items: [
          "Accès prioritaire aux formations et séminaires",
          "Parcours de certification en dialogue et médiation",
          "Un réseau de pairs régional et international",
          "La possibilité de co-porter des initiatives communautaires",
        ],
      },
      {
        title: "Ce que nous demandons",
        items: [
          "Respecter le code de conduite du réseau",
          "Participer à au moins une activité par an",
          "Partager vos pratiques et apprentissages",
          "Promouvoir le dialogue et rejeter les discours de haine",
        ],
      },
    ],
  },
  join: {
    meta: {
      title: "Joignez votre voix à la nôtre",
      description: "L’adhésion au réseau Bridging Our Voices est gratuite. Partagez vos informations, un résumé de votre expérience et votre CV : notre équipe vous recontactera.",
    },
    title: "Joignez votre voix à la nôtre",
    lead: "L’adhésion est gratuite. Partagez vos informations, un résumé de votre expérience et votre CV : notre équipe examinera votre candidature et vous recontactera.",
    legend: "Vos informations",
    name: "Nom complet",
    gender: "Genre",
    genders: zip(genderValues, ["Femme", "Homme", "Je préfère ne pas répondre"]),
    job: "Fonction",
    org: "Organisation d’appartenance",
    country: "Pays",
    countryPlaceholder: "Choisir…",
    email: "E-mail",
    religion: "Religion officielle",
    subreligion: "Confession / courant",
    fields: "Domaines d’activité",
    fieldOptions: zip(fieldValues, [
      "Dialogue interreligieux", "Dialogue interculturel", "Médiation communautaire", "Analyse des conflits", "Discours de haine",
      "Femmes, paix et sécurité", "Engagement des jeunes", "Guérison et résilience", "Citoyenneté et leadership",
      "Éducation et formation", "Recherche", "Médias",
    ]),
    experience: "Résumé de votre expérience",
    experienceHint: "Un paragraphe de 150 mots maximum.",
    wordCount: "{count} / {max} mots",
    experienceTooLong: "Merci de limiter le résumé à 150 mots.",
    cv: "Votre CV",
    cvButton: "Ajouter votre CV",
    cvHint: "PDF uniquement, 4 pages et 5 Mo maximum.",
    cvError: "Veuillez choisir un PDF de 4 pages et 5 Mo maximum.",
    motivation: "Qu’est-ce qui vous motive à nous rejoindre ?",
    activities: "Quelles activités pourriez-vous mener avec nous ?",
    photo: "Votre photo (facultatif)",
    photoButton: "Ajouter une photo",
    photoHint: "JPG ou PNG, 3 Mo maximum.",
    photoTooBig: "Veuillez choisir un JPG ou PNG de moins de 3 Mo.",
    consent: "J’accepte le code de conduite du réseau et l’utilisation de mes données pour traiter ma candidature.",
    submit: "Envoyer ma candidature",
    sending: "Envoi…",
    success: "Merci, votre candidature a bien été reçue. Notre équipe l’examinera et vous recontactera.",
    error: "Une erreur s’est produite, veuillez vérifier le formulaire et réessayer.",
  },
  members: {
    meta: {
      title: "Nos membres",
      description: "La direction et l’équipe principale de Bridging Our Voices : des fellows du KAICIID d’Égypte, des Philippines, du Nigeria et d’Afrique du Sud.",
    },
    title: "Direction du projet et équipe principale",
    people: [
      {
        image: photos.anwaar,
        name: "Dr. Anwaar Kataia",
        role: "Coordinatrice générale du projet et fellow principale",
        country: "Égypte",
        bio: [
          "Fellow internationale du KAICIID et membre du corps enseignant de l’Université Al-Azhar.",
          "Doctorante en études politiques et stratégiques et sécurité nationale ; diplôme en communication politique (Université du Caire) ; fellow du Collège de défense nationale.",
          "Plus de 15 ans de formation et de conseil ; environ 4 000 leaders religieux et communautaires formés ; projets régionaux UNESCO / Ligue arabe touchant plus de 500 000 bénéficiaires.",
        ],
      },
      {
        image: photos.monaLisa,
        name: "Mona Lisa D. Pangan",
        role: "Cofondatrice et représentante partenaire",
        country: "Philippines",
        bio: [
          "Fellow du KAICIID (2023) et assistante du directeur, Campus Ministries Office, Xavier University, Ateneo de Cagayan.",
          "Master en éducation religieuse ; directrice de retraites certifiée, praticienne du dialogue interreligieux et facilitatrice de paix interculturelle en Asie du Sud-Est.",
        ],
      },
      {
        image: photos.kaltumi,
        name: "Kaltumi Abdulazeez",
        role: "Cofondatrice et représentante partenaire",
        country: "Nigeria",
        bio: [
          "Fellow du KAICIID ; fondatrice et directrice exécutive de LEGASI Initiative.",
          "Experte internationale en prévention de l’extrémisme violent, médiation communautaire, inclusion du genre et consolidation de la paix en Afrique de l’Ouest.",
        ],
      },
      {
        image: photos.jenny,
        name: "Jenny Canau",
        role: "Consultante du projet et spécialiste de la guérison",
        country: "Afrique du Sud",
        bio: [
          "Fellow du KAICIID ; cofondatrice de Mindfulness Africa et des Peace & Healing Circles South Africa.",
          "Ancienne avocate des droits humains ; plus de 20 ans de formation des magistrats et procureurs à la compassion, la résilience et la décision fondée sur les valeurs.",
          "Formatrice certifiée (Stanford Applied Compassion Academy, UPEACE) ; représentante bouddhiste tibétaine, Cape Town Interfaith Initiative.",
        ],
      },
    ],
    networkTitle: "Notre réseau",
    networkLead: "Des femmes artisanes de paix et leaders communautaires de la région et d’ailleurs, qui apprennent, pratiquent et dirigent ensemble.",
    networkCta: "Rejoindre le réseau",
  },
};

const ar: NetworkContent = {
  header: { eyebrow: "الشبكة", lead: "مجلسنا الاستشاري وشبكة متنامية من قيادات السلام النسائية." },
  membership: {
    meta: {
      title: "عناصر الانضمام",
      description: "من يمكنه الانضمام إلى شبكة Bridging Our Voices لصانعات السلام، وماذا تكسب العضوات، وماذا نطلب منهن.",
    },
    title: "من يمكنه الانضمام، وماذا تعني العضوية",
    columns: [
      {
        title: "من يمكنه الانضمام",
        items: [
          "صانعات السلام والقيادات المجتمعية",
          "القيادات الدينية وممارسو الحوار بين الأديان",
          "الشباب من سن ١٨ عامًا، بمن فيهم اللاجئون والنازحون والطلاب",
          "المدربون والباحثون والمؤسسات الشريكة",
        ],
      },
      {
        title: "ماذا تكسب",
        items: [
          "أولوية الالتحاق بالبرامج التدريبية والندوات",
          "مسارات للاعتماد في الحوار والوساطة",
          "شبكة نظراء إقليمية ودولية",
          "فرص للمشاركة في قيادة مبادرات مجتمعية",
        ],
      },
      {
        title: "ماذا نطلب منك",
        items: [
          "الالتزام بميثاق سلوك الشبكة",
          "المشاركة في نشاط واحد على الأقل سنويًا",
          "تبادل خبراتك وتجاربك مع الزملاء",
          "مناصرة الحوار ونبذ خطاب الكراهية",
        ],
      },
    ],
  },
  join: {
    meta: {
      title: "ضم صوتك لصوتنا",
      description: "العضوية في شبكة Bridging Our Voices مجانية. شاركنا بياناتك وملخص خبرتك وسيرتك الذاتية، وسيتواصل معك فريقنا.",
    },
    title: "ضم صوتك لصوتنا",
    lead: "العضوية مجانية. شاركنا بياناتك وملخص خبرتك وسيرتك الذاتية، وسيراجع فريقنا طلبك ويتواصل معك.",
    legend: "بياناتك",
    name: "الاسم بالكامل",
    gender: "النوع",
    genders: zip(genderValues, ["أنثى", "ذكر", "أفضّل عدم الإجابة"]),
    job: "الوظيفة",
    org: "المؤسسة التي تنتمي إليها",
    country: "الدولة",
    countryPlaceholder: "اختر/ي…",
    email: "البريد الإلكتروني",
    religion: "الديانة الرسمية",
    subreligion: "المذهب / الطائفة",
    fields: "مجالات العمل",
    fieldOptions: zip(fieldValues, [
      "الحوار بين الأديان", "الحوار بين الثقافات", "الوساطة المجتمعية", "تحليل النزاعات", "مواجهة خطاب الكراهية",
      "المرأة والسلام والأمن", "إشراك الشباب", "التعافي والصمود", "المواطنة والقيادة",
      "التعليم والتدريب", "البحث العلمي", "الإعلام",
    ]),
    experience: "ملخص خبرتك",
    experienceHint: "فقرة واحدة لا تزيد على ١٥٠ كلمة.",
    wordCount: "{count} / {max} كلمة",
    experienceTooLong: "يرجى ألا يزيد الملخص على ١٥٠ كلمة.",
    cv: "السيرة الذاتية",
    cvButton: "رفع السيرة الذاتية",
    cvHint: "ملف PDF فقط، لا يزيد على ٤ صفحات و٥ ميجابايت.",
    cvError: "يرجى اختيار ملف PDF لا يزيد على ٤ صفحات و٥ ميجابايت.",
    motivation: "ما الذي يدفعك للانضمام إلينا؟",
    activities: "ما الأنشطة التي يمكنك تنفيذها معنا؟",
    photo: "صورتك (اختياري)",
    photoButton: "رفع صورة",
    photoHint: "JPG أو PNG، حتى ٣ ميجابايت.",
    photoTooBig: "يُرجى اختيار صورة JPG أو PNG أقل من ٣ ميجابايت.",
    consent: "أوافق على ميثاق سلوك الشبكة وعلى استخدام بياناتي لمعالجة طلب الانضمام.",
    submit: "إرسال طلب الانضمام",
    sending: "جارٍ الإرسال…",
    success: "شكرًا لك، تم استلام طلب انضمامك وسيراجعه فريقنا ويتواصل معك.",
    error: "حدث خطأ، يُرجى مراجعة البيانات والمحاولة مرة أخرى.",
  },
  members: {
    meta: {
      title: "أعضاؤنا",
      description: "تعرّفي على قيادة مشروع Bridging Our Voices وفريقه: زميلات كايسيد من مصر والفلبين ونيجيريا وجنوب أفريقيا.",
    },
    title: "قيادة المشروع وفريق الإدارة",
    people: [
      {
        image: photos.anwaar,
        name: "د. أنوار قطايا",
        role: "المنسقة العامة للمشروع والزميلة الرئيسية",
        country: "مصر",
        bio: [
          "زميلة دولية في كايسيد وعضو هيئة تدريس بجامعة الأزهر.",
          "باحثة دكتوراه في الدراسات السياسية والاستراتيجية والأمن القومي؛ دبلوم الاتصال السياسي (جامعة القاهرة)؛ زميلة كلية الدفاع الوطني.",
          "أكثر من ١٥ عامًا مدربة ومستشارة؛ درّبت نحو ٤٠٠٠ من القيادات الدينية والمجتمعية؛ قادت مشروعات إقليمية مع اليونسكو وجامعة الدول العربية وصلت لأكثر من ٥٠٠ ألف مستفيد.",
        ],
      },
      {
        image: photos.monaLisa,
        name: "منى ليزا د. بانجان",
        role: "شريكة مؤسسة وممثلة الشريك",
        country: "الفلبين",
        bio: [
          "زميلة كايسيد (٢٠٢٣) ومساعدة المدير بمكتب الخدمات الروحية بجامعة كزافييه، أتينيو دي كاغايان.",
          "ماجستير في التربية الدينية؛ مديرة خلوات معتمدة وممارسة للحوار بين الأديان وميسّرة للسلام بين الثقافات في جنوب شرق آسيا.",
        ],
      },
      {
        image: photos.kaltumi,
        name: "كلثومي عبدالعزيز",
        role: "شريكة مؤسسة وممثلة الشريك",
        country: "نيجيريا",
        bio: [
          "زميلة كايسيد ومؤسِّسة ومديرة تنفيذية لمبادرة LEGASI لتمكين المرأة ودعمها.",
          "خبيرة دولية في مكافحة التطرف العنيف والوساطة المجتمعية وإدماج النوع الاجتماعي وبناء السلام القاعدي في غرب أفريقيا.",
        ],
      },
      {
        image: photos.jenny,
        name: "جيني كاناو",
        role: "مستشارة المشروع وأخصائية التعافي",
        country: "جنوب أفريقيا",
        bio: [
          "زميلة كايسيد وشريكة مؤسِّسة لـ Mindfulness Africa ودوائر السلام والتعافي بجنوب أفريقيا.",
          "محامية سابقة في حقوق الإنسان بخبرة تتجاوز ٢٠ عامًا في تدريب القضاة ووكلاء النيابة على التعاطف والصمود واتخاذ القرار القائم على القيم.",
          "مدربة معتمدة (أكاديمية التعاطف التطبيقي بستانفورد، جامعة السلام الأممية)؛ ممثلة البوذية التبتية في مبادرة كيب تاون بين الأديان.",
        ],
      },
    ],
    networkTitle: "شبكتنا",
    networkLead: "صانعات سلام وقيادات مجتمعية من المنطقة وخارجها، يتعلّمن ويمارسن ويقدن معًا.",
    networkCta: "انضمي إلى الشبكة",
  },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, NetworkContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getNetworkContent(locale: Locale): Promise<NetworkContent> {
  return loadContent("network", locale, defaults[locale]);
}
