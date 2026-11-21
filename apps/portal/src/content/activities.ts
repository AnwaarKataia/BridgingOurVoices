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
    /** Link to the news about this programme. */
    newsLink: string;
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
  /** Shown instead of a section the team hasn't switched on yet (owner, 2026-11-21). */
  soon: { title: string; body: string; cta: string };
  /** E-learning (owner, 2026-11-21): courses and webinars built in the dashboard; "coming soon" until one is published. */
  elearning: {
    index: string;
    eyebrow: string;
    title: string;
    lead: string;
    soonTitle: string;
    soonBody: string;
    soonCta: string;
    kinds: { course: string; webinar: string };
    formats: { "self-paced": string; "instructor-led": string; live: string };
    units: string;
    certificate: string;
    view: string;
    /** Course page */
    back: string;
    info: {
      type: string;
      format: string;
      fees: string;
      units: string;
      programmeArea: string;
      duration: string;
      learningTime: string;
      startDate: string;
      deadline: string;
      certificate: string;
      languages: string;
      yes: string;
      no: string;
    };
    flyer: string;
    aboutTitle: string;
    contentTitle: string;
    unit: string;
    lessonTypes: { video: string; file: string; text: string; link: string };
    register: {
      title: string;
      lead: string;
      name: string;
      email: string;
      country: string;
      countryPlaceholder: string;
      submit: string;
      sending: string;
      success: string;
      closed: string;
      error: string;
    };
  };
  /** News from our activities (owner, 2026-11-21): taken from the Bridging Our Voices Facebook page posts. Newest first. */
  news: {
    index: string;
    eyebrow: string;
    title: string;
    lead: string;
    /** Label of the link to the original post. */
    source: string;
    photosLabel: string;
    items: {
      date: string;
      place: string;
      title: string;
      /** Anchor on the News page (#id), used by the home page and the ticker. */
      id: string;
      paragraphs: string[];
      points: string[];
      /** Paragraphs shown after the points. */
      after: string[];
      /** Site images; the first one is the cover. */
      images: string[];
      imageAlt: string;
      link: string;
      /** Optional link to a page of this site (path without language) and its label. */
      more: { label: string; href: string };
    }[];
  };
};

const en: ActivitiesContent = {
  meta: {
    title: "Activities",
    description:
      "Training programmes, seminars, conferences and a fellowship: four ways for peacebuilders and community leaders to learn, connect and lead with Bridging Our Voices.",
  },
  header: {
    eyebrow: "Activities",
    title: "How we build peace leaders",
    lead: "Training programmes, seminars, conferences and a fellowship: four ways to learn, connect and lead.",  },
  training: { index: "01", eyebrow: "Training programmes", title: "Accredited training in dialogue and peacebuilding" },
  course: {
    badge: "Registration closed",
    deadline: "Registration closed on 12 November 2026",
    title: "Bridging Our Voices: Women Leading Dialogue and Peacebuilding",
    body: "A complete digital training programme delivered entirely in Arabic over Zoom for one full month, giving participants core skills and practical tools in dialogue facilitation, community mediation, diversity management and conflict transformation.",
    eligibility: "Open to everyone aged 25 and over; no previous peacebuilding experience is required.",
    whyTitle: "Why take part",
    why: [
      "Completely free online training",
      "Certificate of participation from the initiative on meeting the attendance requirement",
      "Regional and international networking, and membership of the Bridging Our Voices network of peacebuilders",
    ],
    cta: "Discover e-learning",
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
    newsLink: "The programme has started: read the news →",
  },
  flagship: {
    eyebrow: "Flagship programme · Interfaith dialogue",
    title: "Many faiths, many cultures, one shared table.",
    body: "Women are often the first bridges between families of different faiths and backgrounds. Our interfaith and intercultural dialogue programme gives that everyday bridging structure, skills and recognition.",
    steps: [
      { num: "01", title: "Encounter", body: "Facilitated dialogue circles that bring people of different faiths and cultures together, with women leading the conversation." },
      { num: "02", title: "Understanding", body: "Religious and cultural literacy to replace stereotypes with knowledge." },
      { num: "03", title: "Joint action", body: "Shared community initiatives that turn dialogue into everyday cooperation." },
    ],
    tags: ["#InterfaithDialogue", "#InterculturalDialogue"],
    image: "",
    photoAlt: "People of different faiths in dialogue",
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
    lead: "A year-long fellowship for women and men already active in their communities: mentoring, accreditation and the support to lead their own dialogue initiative.",
    cta: "Apply for the fellowship",
    status: "Applications are now open",
    benefits: [
      { title: "Mentoring", body: "One-to-one guidance from experienced peacebuilders." },
      { title: "Accreditation", body: "A recognised certificate in dialogue and peacebuilding." },
      { title: "Community project", body: "Support to design and run your own dialogue initiative." },
      { title: "Network", body: "Lasting ties with fellows across the region and beyond." },
    ],
  },
  soon: { title: "Coming soon", body: "We are preparing this programme. Follow our news or subscribe to the newsletter to hear when it opens.", cta: "See our latest news" },
  elearning: {
    "index": "05",
    "eyebrow": "E-learning",
    "title": "E-learning",
    "lead": "Online courses and webinars: self-paced courses and live sessions on dialogue and peacebuilding, open to everyone, women and men.",
    "soonTitle": "Coming soon",
    "soonBody": "Our first online courses, starting with “Women and Peacebuilding”, are being prepared. Follow our news or subscribe to the newsletter to hear when registration opens.",
    "soonCta": "See our latest news",
    "kinds": {
      "course": "Online course",
      "webinar": "Webinar"
    },
    "formats": {
      "self-paced": "Self-paced",
      "instructor-led": "Instructor-led",
      "live": "Live online"
    },
    "units": "Units: {n}",
    "certificate": "Certificate",
    "view": "View the course →",
    "back": "All courses",
    "info": {
      "type": "Type",
      "format": "Format",
      "fees": "Fees",
      "units": "Number of units",
      "programmeArea": "Programme area",
      "duration": "Duration",
      "learningTime": "Learning time",
      "startDate": "Start date",
      "deadline": "Registration deadline",
      "certificate": "Certificate",
      "languages": "Languages",
      "yes": "Yes",
      "no": "No"
    },
    "flyer": "Download the course flyer (PDF)",
    "aboutTitle": "About the course",
    "contentTitle": "Course content",
    "unit": "Unit {n}",
    "lessonTypes": {
      "video": "Video",
      "file": "Reading",
      "text": "Text",
      "link": "Live session / link"
    },
    "register": {
      "title": "Register for this course",
      "lead": "Leave your details and our team will contact you with the next steps.",
      "name": "Full name",
      "email": "Email",
      "country": "Country",
      "countryPlaceholder": "Select…",
      "submit": "Register",
      "sending": "Sending…",
      "success": "Thank you. Your registration has been received; our team will contact you.",
      "closed": "Registration for this course is closed.",
      "error": "Something went wrong. Please check the form and try again."
    }
  },
  news: {
    "index": "06",
    "eyebrow": "News",
    "title": "News from our activities",
    "lead": "What has happened recently at Bridging Our Voices, from workshops in the field to our online training programme.",
    "source": "See the post on Facebook",
    "photosLabel": "Photos",
    "items": [
      {
        "date": "19 November 2026",
        "place": "Online",
        "title": "Our online training programme has launched",
        "id": "training-launch",
        "paragraphs": [
          "On Thursday 19 November 2026, Bridging Our Voices held the opening session of its online training programme, bringing together trainees, women and men, from several Arab countries.",
          "Dr Mohamed El-Wardany, a media academic at Al-Azhar University, gave the opening lecture: “How is religious and cultural conflict managed on social media?”",
          "The lecture examined digital narratives, the use of religion in conflict, and the role of algorithms and echo chambers in increasing polarisation. Participants discussed how to assess content and its aims critically, the responsibilities of religious and media institutions, and strategies for moving from managing conflict to building awareness.",
          "This session begins a shared learning journey to strengthen dialogue, build peace, counter hate speech and prepare participants to create positive content that respects diversity."
        ],
        "points": [],
        "after": [],
        "images": [
          "/news/training-launch-1.jpg",
          "/news/training-launch-2.jpg"
        ],
        "imageAlt": "Opening session of the Bridging Our Voices online training programme",
        "link": "https://www.facebook.com/Bourvoice/posts/pfbid04qTkNdGkicyqkrUiipE2sn5MCVh57qcFCMSJdJz8H71PFvHfVLTT5GpdYSqRctEhl",
        "more": { "label": "Programme details", "href": "/activities/training#course" }
      },
      {
        "date": "15 November 2026",
        "place": "UNHCR, Alexandria, Egypt",
        "title": "Training workshop for refugees in Alexandria",
        "id": "unhcr-alexandria",
        "paragraphs": [
          "As part of its work to strengthen peaceful coexistence and build bridges between communities, Bridging Our Voices held an intensive training workshop at the office of the United Nations High Commissioner for Refugees (UNHCR) in Alexandria.",
          "Over three days of active exchange and deep listening, Dr. Anwaar Kataia (initiative coordinator and dialogue and peacebuilding consultant) led training sessions on:"
        ],
        "points": [
          "Concepts of dialogue, accepting others, and building safe spaces for trust",
          "Understanding differences and transforming community conflicts",
          "Strengthening the role of young women and women leaders in peacebuilding",
          "Preventing hate speech and violent extremism in diverse communities"
        ],
        "after": [
          "Mr Sameh Nassim (development, training and community peace consultant) also led a workshop on “Designing and developing community initiatives”, to turn dialogue ideas into practical initiatives with lasting impact.",
          "Participants gave lively, outstanding presentations, and the workshop saw the launch of the “Bridging Our Voices Network for Dialogue and Coexistence”. The Sudanese Al-Tahaddi Educational Foundation in Alexandria presented the trainers with a shield of appreciation.",
          "Our thanks go to our partners at UNHCR and to every participant."
        ],
        "images": [
          "/news/unhcr-alexandria-1.jpg",
          "/news/unhcr-alexandria-2.jpg",
          "/news/unhcr-alexandria-3.jpg",
          "/news/unhcr-alexandria-4.jpg",
          "/news/unhcr-alexandria-5.jpg"
        ],
        "imageAlt": "Participants in the Bridging Our Voices training workshop at UNHCR in Alexandria",
        "link": "https://www.facebook.com/Bourvoice/posts/pfbid02UhbAa1tDSfvV5VLyvdgcVLWi65sWY8s94jkdDUhjqkgwHGLocHmK4xuGErSXdxG2l",
        "more": { "label": "", "href": "" }
      }
    ]
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
    lead: "Programmes de formation, séminaires, congrès et bourse : quatre manières d’apprendre, de se relier et de diriger.",  },
  training: { index: "01", eyebrow: "Programmes de formation", title: "Formations certifiantes en dialogue et consolidation de la paix" },
  course: {
    badge: "Inscriptions closes",
    deadline: "Inscriptions closes le 12 novembre 2026",
    title: "Bridging Our Voices : les femmes au cœur du dialogue et de la consolidation de la paix",
    body: "Un programme de formation numérique complet, entièrement en arabe sur Zoom pendant un mois, qui donne aux participants les compétences de base et des outils pratiques en facilitation du dialogue, médiation communautaire, gestion de la diversité et transformation des conflits.",
    eligibility: "Ouvert à toutes et tous à partir de 25 ans, aucune expérience préalable en consolidation de la paix requise.",
    whyTitle: "Pourquoi participer",
    why: [
      "Formation en ligne entièrement gratuite",
      "Certificat de participation délivré par l’initiative selon le taux de présence requis",
      "Mise en réseau régionale et internationale et adhésion au réseau d’artisans de la paix Bridging Our Voices",
    ],
    cta: "Découvrir l’apprentissage en ligne",
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
    newsLink: "Le programme a commencé : lire l’actualité →",
  },
  flagship: {
    eyebrow: "Programme phare · Dialogue interreligieux",
    title: "Plusieurs religions, plusieurs cultures, une même table.",
    body: "Les femmes sont souvent les premiers ponts entre des familles de religions et d’horizons différents. Notre programme de dialogue interreligieux et interculturel donne à ce rôle quotidien une méthode, des compétences et une reconnaissance.",
    steps: [
      { num: "01", title: "Rencontre", body: "Des cercles de dialogue animés réunissant des personnes de religions et de cultures différentes, où les femmes mènent la conversation." },
      { num: "02", title: "Compréhension", body: "Une culture religieuse et interculturelle pour remplacer les stéréotypes par la connaissance." },
      { num: "03", title: "Action commune", body: "Des initiatives communautaires partagées qui font du dialogue une coopération quotidienne." },
    ],
    tags: ["#InterfaithDialogue", "#InterculturalDialogue"],
    image: "",
    photoAlt: "Personnes de différentes religions en dialogue",
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
    lead: "Notre congrès régional et international réunit participants et participantes, partenaires et experts pour partager les pratiques et fixer les priorités.",
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
    lead: "Une bourse d’un an pour les femmes et les hommes déjà engagés dans leurs communautés : mentorat, certification et accompagnement pour mener leur propre initiative de dialogue.",
    cta: "Candidater à la bourse",
    status: "Candidatures ouvertes",
    benefits: [
      { title: "Mentorat", body: "Un accompagnement individuel par des artisans de la paix expérimentés." },
      { title: "Certification", body: "Un certificat reconnu en dialogue et consolidation de la paix." },
      { title: "Projet communautaire", body: "Un soutien pour concevoir et mener votre propre initiative de dialogue." },
      { title: "Réseau", body: "Des liens durables avec des boursières de la région et d’ailleurs." },
    ],
  },
  soon: { title: "Bientôt disponible", body: "Nous préparons ce programme. Suivez nos actualités ou abonnez-vous à la newsletter pour savoir quand il ouvrira.", cta: "Voir nos actualités" },
  elearning: {
    "index": "05",
    "eyebrow": "Apprentissage en ligne",
    "title": "Apprentissage en ligne",
    "lead": "Cours en ligne et webinaires : des cours à suivre à son rythme et des séances en direct sur le dialogue et la consolidation de la paix, ouverts à toutes et tous.",
    "soonTitle": "Bientôt disponible",
    "soonBody": "Nos premiers cours en ligne, à commencer par « Les femmes et la consolidation de la paix », sont en préparation. Suivez nos actualités ou abonnez-vous à la newsletter pour savoir quand les inscriptions ouvriront.",
    "soonCta": "Voir nos actualités",
    "kinds": {
      "course": "Cours en ligne",
      "webinar": "Webinaire"
    },
    "formats": {
      "self-paced": "À votre rythme",
      "instructor-led": "Avec formateur ou formatrice",
      "live": "En direct en ligne"
    },
    "units": "Modules : {n}",
    "certificate": "Certificat",
    "view": "Voir le cours →",
    "back": "Tous les cours",
    "info": {
      "type": "Type",
      "format": "Format",
      "fees": "Frais",
      "units": "Nombre de modules",
      "programmeArea": "Domaine du programme",
      "duration": "Durée",
      "learningTime": "Temps d’apprentissage",
      "startDate": "Date de début",
      "deadline": "Date limite d’inscription",
      "certificate": "Certificat",
      "languages": "Langues",
      "yes": "Oui",
      "no": "Non"
    },
    "flyer": "Télécharger la brochure du cours (PDF)",
    "aboutTitle": "À propos du cours",
    "contentTitle": "Contenu du cours",
    "unit": "Module {n}",
    "lessonTypes": {
      "video": "Vidéo",
      "file": "Lecture",
      "text": "Texte",
      "link": "Séance en direct / lien"
    },
    "register": {
      "title": "S’inscrire à ce cours",
      "lead": "Laissez vos coordonnées : notre équipe vous contactera pour la suite.",
      "name": "Nom complet",
      "email": "E-mail",
      "country": "Pays",
      "countryPlaceholder": "Sélectionner…",
      "submit": "S’inscrire",
      "sending": "Envoi…",
      "success": "Merci. Votre inscription a bien été reçue ; notre équipe vous contactera.",
      "closed": "Les inscriptions à ce cours sont closes.",
      "error": "Une erreur s’est produite. Vérifiez le formulaire et réessayez."
    }
  },
  news: {
    "index": "06",
    "eyebrow": "Actualités",
    "title": "Actualités de nos activités",
    "lead": "Ce qui s’est passé récemment à Bridging Our Voices, des ateliers sur le terrain à notre programme de formation en ligne.",
    "source": "Voir la publication sur Facebook",
    "photosLabel": "Photos",
    "items": [
      {
        "date": "19 novembre 2026",
        "place": "En ligne",
        "title": "Lancement de notre programme de formation en ligne",
        "id": "training-launch",
        "paragraphs": [
          "Le jeudi 19 novembre 2026, Bridging Our Voices a tenu la séance d’ouverture de son programme de formation en ligne, réunissant des participantes et participants de plusieurs pays arabes.",
          "Le Dr Mohamed El-Wardany, enseignant en médias à l’Université Al-Azhar, a donné la conférence inaugurale : « Comment les conflits religieux et culturels sont-ils gérés sur les réseaux sociaux ? »",
          "La conférence a abordé les récits numériques, l’instrumentalisation de la religion dans les conflits, et le rôle des algorithmes et des chambres d’écho dans la polarisation. Les échanges ont porté sur la lecture critique des contenus et de leurs objectifs, la responsabilité des institutions religieuses et médiatiques, et les stratégies pour passer de la gestion des conflits à la construction de la conscience.",
          "Cette séance ouvre un parcours d’apprentissage commun pour renforcer le dialogue, construire la paix, lutter contre les discours de haine et préparer les participants et participantes à créer des contenus positifs qui respectent la diversité."
        ],
        "points": [],
        "after": [],
        "images": [
          "/news/training-launch-1.jpg",
          "/news/training-launch-2.jpg"
        ],
        "imageAlt": "Séance d’ouverture du programme de formation en ligne de Bridging Our Voices",
        "link": "https://www.facebook.com/Bourvoice/posts/pfbid04qTkNdGkicyqkrUiipE2sn5MCVh57qcFCMSJdJz8H71PFvHfVLTT5GpdYSqRctEhl",
        "more": { "label": "Détails du programme", "href": "/activities/training#course" }
      },
      {
        "date": "15 novembre 2026",
        "place": "HCR, Alexandrie, Égypte",
        "title": "Atelier de formation pour les personnes réfugiées à Alexandrie",
        "id": "unhcr-alexandria",
        "paragraphs": [
          "Pour renforcer la coexistence pacifique et bâtir des ponts entre les communautés, Bridging Our Voices a organisé un atelier de formation intensif dans les locaux du Haut-Commissariat des Nations unies pour les réfugiés (HCR) à Alexandrie.",
          "Pendant trois jours d’échanges et d’écoute profonde, la Dre Anwaar Kataia (coordinatrice de l’initiative et consultante en dialogue et consolidation de la paix) a animé des séances sur :"
        ],
        "points": [
          "Les notions de dialogue, l’acceptation de l’autre et la création d’espaces sûrs de confiance",
          "La compréhension des différences et la transformation des conflits communautaires",
          "Le rôle des jeunes femmes et des femmes leaders dans la consolidation de la paix",
          "La prévention des discours de haine et de l’extrémisme violent dans les sociétés diverses"
        ],
        "after": [
          "M. Sameh Nassim (consultant en développement, formation et paix communautaire) a également animé un atelier « Concevoir et développer des initiatives communautaires », pour transformer les idées de dialogue en initiatives concrètes à l’impact durable.",
          "Les participants et participantes ont présenté des travaux remarquables, et l’atelier a vu le lancement du « Réseau Bridging Our Voices pour le dialogue et la coexistence ». La Fondation éducative soudanaise Al-Tahaddi d’Alexandrie a remis aux formateurs un trophée de reconnaissance.",
          "Merci à nos partenaires du HCR et à toutes les personnes participantes."
        ],
        "images": [
          "/news/unhcr-alexandria-1.jpg",
          "/news/unhcr-alexandria-2.jpg",
          "/news/unhcr-alexandria-3.jpg",
          "/news/unhcr-alexandria-4.jpg",
          "/news/unhcr-alexandria-5.jpg"
        ],
        "imageAlt": "Participants et participantes de l’atelier de Bridging Our Voices au HCR à Alexandrie",
        "link": "https://www.facebook.com/Bourvoice/posts/pfbid02UhbAa1tDSfvV5VLyvdgcVLWi65sWY8s94jkdDUhjqkgwHGLocHmK4xuGErSXdxG2l",
        "more": { "label": "", "href": "" }
      }
    ]
  },
};

const ar: ActivitiesContent = {
  meta: {
    title: "الأنشطة",
    description:
      "برامج تدريبية وندوات ومؤتمرات وزمالة: أربعة طرق للتعلّم والتواصل والقيادة مع مبادرة «أصواتنا جسور» لصناع السلام والقيادات المجتمعية.",
  },
  header: {
    eyebrow: "الأنشطة",
    title: "كيف نصنع قيادات السلام",
    lead: "برامج تدريبية وندوات ومؤتمرات وزمالة، أربعة طرق للتعلّم والتواصل والقيادة.",  },
  training: { index: "01", eyebrow: "برامج تدريبية", title: "تدريب معتمد في الحوار وبناء السلام" },
  course: {
    badge: "التسجيل مغلق",
    deadline: "أُغلق باب التسجيل في ١٢ نوفمبر ٢٠٢٦",
    title: "«أصواتنا جسور: نساء لقيادة الحوار وبناء السلام»",
    body: "برنامج تدريبي رقمي متكامل يُقدَّم بالكامل باللغة العربية عبر منصة Zoom على مدار شهر كامل، يهدف إلى تزويد المشاركين بالمهارات الأساسية والأدوات العملية في التيسير الحواري، والوساطة المجتمعية، وإدارة التنوع، وتفكيك النزاعات.",
    eligibility: "الدورة مفتوحة لجميع المهتمين (من سن ٢٥ عامًا فأكثر) دون اشتراط خبرة سابقة في بناء السلام.",
    whyTitle: "مميزات المشاركة",
    why: [
      "تدريب إلكتروني مجاني بالكامل",
      "شهادة مشاركة معتمدة من المبادرة عند استكمال نسبة الحضور المطلوبة",
      "فرصة للتشبيك الإقليمي والدولي والانضمام لشبكة «أصواتنا جسور» لصناع السلام",
    ],
    cta: "اكتشف/ي التعلم الإلكتروني",
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
    newsLink: "انطلق البرنامج: اقرأ/ي الخبر ←",
  },
  flagship: {
    eyebrow: "البرنامج الرئيسي · الحوار بين الأديان",
    title: "أديان كثيرة، وثقافات متعددة، ومائدة واحدة.",
    body: "كثيرًا ما تكون المرأة الجسر الأول بين أسر من أديان وخلفيات مختلفة. يمنح برنامج الحوار بين الأديان والثقافات هذا الدور اليومي منهجيةً ومهاراتٍ واعترافًا.",
    steps: [
      { num: "٠١", title: "اللقاء", body: "حلقات حوار مُيسَّرة تجمع أشخاصًا من أديان وثقافات مختلفة، وتقود فيها النساء الحوار." },
      { num: "٠٢", title: "الفهم", body: "معرفة دينية وثقافية تستبدل الصور النمطية بالمعرفة." },
      { num: "٠٣", title: "العمل المشترك", body: "مبادرات مجتمعية مشتركة تحوّل الحوار إلى تعاون يومي." },
    ],
    tags: ["#InterfaithDialogue", "#InterculturalDialogue"],
    image: "",
    photoAlt: "أشخاص من أديان مختلفة في حوار",
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
      { image: "", meta: "سلسلة ندوات · أونلاين", title: "المرأة والإيمان وصناعة السلام", body: "سلسلة من أربع حلقات عن دور المرأة في العمل السلمي بين الأديان.", cta: "سجّل/ي ←" },
      { image: "", meta: "ندوة · حضوري", title: "خطاب الكراهية: من الرصد إلى الرد", body: "دراسات حالة وأدوات للقيادات المجتمعية والمربّين.", cta: "سجّل/ي ←" },
      { image: "", meta: "ندوة · أونلاين", title: "المواطنة وصوت المرأة في الشأن العام", body: "كيف تفتح المشاركة المدنية طرقًا نحو القيادة.", cta: "شاهد/ي التسجيل ←" },
    ],
  },
  conferences: {
    index: "03",
    eyebrow: "مؤتمرات",
    title: "مؤتمر الإطلاق",
    lead: "يجمع مؤتمرنا الإقليمي والدولي المشاركين والمشاركات والشركاء والخبراء لتبادل الممارسات ورسم الأولويات.",
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
    lead: "زمالة لمدة عام للنساء والرجال الفاعلين في مجتمعاتهم: إرشاد واعتماد ودعم لقيادة مبادرة حوار خاصة بهم.",
    cta: "قدّم/ي على الزمالة",
    status: "باب التقديم مفتوح الآن",
    benefits: [
      { title: "الإرشاد", body: "توجيه فردي من صناع سلام ذوي خبرة." },
      { title: "الاعتماد", body: "شهادة معترف بها في الحوار وبناء السلام." },
      { title: "مشروع مجتمعي", body: "دعم لتصميم وتنفيذ مبادرة حوار خاصة بك." },
      { title: "الشبكة", body: "روابط دائمة مع زميلات من المنطقة وخارجها." },
    ],
  },
  soon: { title: "قريبًا", body: "نُعدّ هذا البرنامج الآن. تابع/ي أخبارنا أو اشترك/ي في النشرة البريدية لتعرف/ي موعد إطلاقه.", cta: "شاهد/ي آخر أخبارنا" },
  elearning: {
    "index": "05",
    "eyebrow": "التعلم الإلكتروني",
    "title": "التعلم الإلكتروني",
    "lead": "دورات وندوات إلكترونية: دورات ذاتية التعلّم وجلسات مباشرة في الحوار وبناء السلام، مفتوحة للجميع، نساءً ورجالًا.",
    "soonTitle": "انتظرونا قريبًا",
    "soonBody": "نُعدّ الآن أولى دوراتنا الإلكترونية، وفي مقدمتها دورة «المرأة وبناء السلام». تابع/ي أخبارنا أو اشترك/ي في النشرة البريدية لتعرف/ي موعد فتح باب التسجيل.",
    "soonCta": "شاهد/ي آخر أخبارنا",
    "kinds": {
      "course": "دورة إلكترونية",
      "webinar": "ندوة إلكترونية"
    },
    "formats": {
      "self-paced": "ذاتية التعلّم",
      "instructor-led": "بإشراف مدرب/ة",
      "live": "مباشرة عبر الإنترنت"
    },
    "units": "الوحدات: {n}",
    "certificate": "شهادة",
    "view": "عرض الدورة ←",
    "back": "كل الدورات",
    "info": {
      "type": "النوع",
      "format": "الشكل",
      "fees": "الرسوم",
      "units": "عدد الوحدات",
      "programmeArea": "مجال البرنامج",
      "duration": "المدة",
      "learningTime": "وقت التعلّم",
      "startDate": "تاريخ البدء",
      "deadline": "آخر موعد للتسجيل",
      "certificate": "شهادة",
      "languages": "اللغات",
      "yes": "نعم",
      "no": "لا"
    },
    "flyer": "تحميل إعلان الدورة (PDF)",
    "aboutTitle": "عن الدورة",
    "contentTitle": "محتوى الدورة",
    "unit": "الوحدة {n}",
    "lessonTypes": {
      "video": "فيديو",
      "file": "قراءة",
      "text": "نص",
      "link": "جلسة مباشرة / رابط"
    },
    "register": {
      "title": "التسجيل في الدورة",
      "lead": "اترك/ي بياناتك وسيتواصل معك فريقنا بالخطوات التالية.",
      "name": "الاسم الكامل",
      "email": "البريد الإلكتروني",
      "country": "الدولة",
      "countryPlaceholder": "اختر/ي…",
      "submit": "سجّل/ي الآن",
      "sending": "جارٍ الإرسال…",
      "success": "شكرًا لك. وصلنا تسجيلك، وسيتواصل معك فريقنا.",
      "closed": "التسجيل في هذه الدورة مغلق.",
      "error": "حدث خطأ. يرجى مراجعة النموذج والمحاولة مرة أخرى."
    }
  },
  news: {
    "index": "06",
    "eyebrow": "الأخبار",
    "title": "أخبار أنشطتنا",
    "lead": "آخر ما جرى في «أصواتنا جسور»، من الورش الميدانية إلى برنامجنا التدريبي الإلكتروني.",
    "source": "شاهد/ي المنشور على فيسبوك",
    "photosLabel": "الصور",
    "items": [
      {
        "date": "١٩ نوفمبر ٢٠٢٦",
        "place": "أونلاين",
        "title": "انطلاق البرنامج التدريبي الإلكتروني",
        "id": "training-launch",
        "paragraphs": [
          "انطلقت يوم الخميس ١٩ نوفمبر ٢٠٢٦ أولى جلسات البرنامج التدريبي الإلكتروني لمبادرة «أصواتنا جسور»، بمشاركة متدربين ومتدربات من عدة دول عربية.",
          "قدّم المحاضرة الافتتاحية د. محمد الورداني، أستاذ الإعلام بجامعة الأزهر، بعنوان «كيف يُدار الصراع الديني والثقافي على وسائل التواصل الاجتماعي؟».",
          "تناولت المحاضرة صناعة الروايات في البيئة الرقمية، وتوظيف الدين في الصراع، ودور الخوارزميات وغرف الصدى في زيادة الاستقطاب. كما ناقش المشاركون والمشاركات كيفية قراءة المحتوى وكشف أهدافه، ومسؤولية المؤسسات الدينية والإعلامية، واستراتيجيات الانتقال من إدارة الصراع إلى صناعة الوعي.",
          "بهذه الجلسة نبدأ رحلة تعلّم مشتركة لتعزيز الحوار وبناء السلام ومواجهة خطاب الكراهية، وإعداد كوادر قادرة على صناعة محتوى إيجابي يحترم التنوع."
        ],
        "points": [],
        "after": [],
        "images": [
          "/news/training-launch-1.jpg",
          "/news/training-launch-2.jpg"
        ],
        "imageAlt": "الجلسة الافتتاحية للبرنامج التدريبي الإلكتروني لمبادرة «أصواتنا جسور»",
        "link": "https://www.facebook.com/Bourvoice/posts/pfbid04qTkNdGkicyqkrUiipE2sn5MCVh57qcFCMSJdJz8H71PFvHfVLTT5GpdYSqRctEhl",
        "more": { "label": "تفاصيل البرنامج", "href": "/activities/training#course" }
      },
      {
        "date": "١٥ نوفمبر ٢٠٢٦",
        "place": "المفوضية السامية لشؤون اللاجئين، الإسكندرية، مصر",
        "title": "ورشة تدريبية للوافدين بمحافظة الإسكندرية",
        "id": "unhcr-alexandria",
        "paragraphs": [
          "في إطار تعزيز مهارات التعايش السلمي وبناء الجسور المجتمعية، أقامت مبادرة «أصواتنا جسور: نساء لقيادة الحوار وبناء السلام» ورشة تدريبية مكثفة بمقر المفوضية السامية للأمم المتحدة لشؤون اللاجئين (UNHCR) بالإسكندرية.",
          "على مدار ٣ أيام من التفاعل المثمر والإنصات العميق، قدّمت د. أنوار قطايه (منسقة المبادرة واستشارية الحوار وبناء السلام) جلسات تدريبية تناولت:"
        ],
        "points": [
          "مفاهيم الحوار، وقبول الآخر، وبناء المساحات الآمنة للثقة",
          "مهارات فهم الاختلافات وتفكيك الصراعات المجتمعية",
          "تفعيل دور الشابات والرائدات في بناء السلام",
          "الوقاية من خطاب الكراهية والتطرف العنيف في المجتمعات المتنوعة"
        ],
        "after": [
          "وشارك في التدريب الأستاذ سامح نسيم (استشاري التنمية والتدريب وأنشطة السلام المجتمعي) بورشة عمل «تصميم وتطوير المبادرات المجتمعية»، لتحويل الأفكار والرؤى الحوارية إلى مبادرات ميدانية تطبيقية ذات أثر مستدام.",
          "شهدت الورشة تفاعلًا رائعًا وعروضًا متميزة قدّمها المشاركون والمشاركات، إلى جانب تدشين «شبكة أصواتنا جسور للحوار والتعايش». وقدّمت مؤسسة التحدي التعليمية التربوية السودانية بالإسكندرية درع شكر وتقدير للمحاضرين.",
          "كل الشكر لشركائنا في المفوضية السامية لشؤون اللاجئين، ولجميع المشاركين والمشاركات."
        ],
        "images": [
          "/news/unhcr-alexandria-1.jpg",
          "/news/unhcr-alexandria-2.jpg",
          "/news/unhcr-alexandria-3.jpg",
          "/news/unhcr-alexandria-4.jpg",
          "/news/unhcr-alexandria-5.jpg"
        ],
        "imageAlt": "المشاركون والمشاركات في ورشة «أصواتنا جسور» بمقر المفوضية في الإسكندرية",
        "link": "https://www.facebook.com/Bourvoice/posts/pfbid02UhbAa1tDSfvV5VLyvdgcVLWi65sWY8s94jkdDUhjqkgwHGLocHmK4xuGErSXdxG2l",
        "more": { "label": "", "href": "" }
      }
    ]
  },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, ActivitiesContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getActivitiesContent(locale: Locale): Promise<ActivitiesContent> {
  return loadContent("activities", locale, defaults[locale]);
}
