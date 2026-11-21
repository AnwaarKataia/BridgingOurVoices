import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";

/**
 * Agenda page copy and dates.
 * Header, calendar, featured series and events are taken from the brand file's Agenda page (EN / FR / AR modes).
 * The "International days" list was added at the owner's request (2026-11-06): the global UN observances
 * for dialogue and peacebuilding. They recur every year, so they are stored as month-day ("MM-DD").
 */

/** Colour of an item on the calendar and in the lists. */
export type AgendaTone = "deadline" | "series" | "event" | "observance";

export type AgendaItem = {
  /** ISO date (YYYY-MM-DD). */
  iso: string;
  kind: string;
  title: string;
  place?: string;
  tone: AgendaTone;
  /** Where the title links: an event page on this site, or the official UN page (external). */
  href?: string;
  external?: boolean;
};

export type Observance = {
  /** Month-day, "MM-DD". */
  start: string;
  /** Last day for weeks and campaigns, "MM-DD". */
  end?: string;
  title: string;
  /** Official page in the page's language (UN / UNESCO / UN Women). */
  url: string;
};

export type AgendaContent = {
  meta: { title: string; description: string };
  header: { eyebrow: string; title: string; lead: string };
  calendar: {
    prev: string;
    next: string;
    legendEvent: string;
    legendObservance: string;
    legendToday: string;
    empty: string;
    showMonth: string;
    monthLabel: string;
    dayLabel: string;
  };
  /** `image`: event banner ("" = striped placeholder). */
  featured: { image: string; kind: string; title: string; dates: string; register: string; body: string };
  /** Labels for the event pages (/agenda/[slug]). */
  eventPage: {
    date: string;
    place: string;
    type: string;
    sessions: string;
    details: string;
    register: string;
    addToCalendar: string;
    back: string;
    others: string;
  };
  upcomingTitle: string;
  deadline: { kind: string; title: string };
  seriesPlace: string;
  events: { kind: string; title: string; place: string }[];
  observances: {
    eyebrow: string;
    title: string;
    lead: string;
    kind: string;
    items: Observance[];
  };
};

/** Dates from the brand file. Change them here, the copy follows by position. */
export const deadlineIso = "2026-11-12";
export const seriesIsos = ["2026-11-26", "2026-12-03", "2026-12-10", "2026-12-17"];
export const eventIsos = ["2026-11-14", "2026-11-20", "2026-11-28", "2026-12-05", "2027-01-18"];
/** Event page slugs (/agenda/[slug]), in the same order as `events`. */
export const eventSlugs = [
  "faith-culture-and-the-role-of-women",
  "conflict-analysis-for-community-leaders",
  "responding-to-hate-speech-online",
  "citizenship-leadership-and-womens-participation",
  "first-cohort-accreditation",
];
/** The webinar series has its own page too. */
export const seriesSlug = "women-faith-and-the-making-of-peace";
export const agendaSlugs = [seriesSlug, ...eventSlugs];

/**
 * Observance dates and official pages, shared by every language; titles follow by position.
 * Dates and links checked against the UN list (un.org/{en,fr,ar}/observances/list-days-weeks) on 2026-11-06.
 * `{lang}` is replaced by en / fr / ar. `ar` overrides the Arabic link where the UN uses a different address.
 * UN Women's 16 Days page only exists in English.
 */
const UN = (slug: string) => `https://www.un.org/{lang}/observances/${slug}`;
const observanceDates: { start: string; end?: string; url: string; ar?: string }[] = [
  { start: "01-28", url: UN("peaceful-coexistence-day") },
  { start: "02-01", end: "02-07", url: UN("interfaith-harmony-week") },
  { start: "02-04", url: UN("human-fraternity") },
  { start: "02-20", url: UN("social-justice-day") },
  { start: "03-08", url: UN("womens-day") },
  { start: "03-15", url: UN("anti-islamophobia-day") },
  { start: "03-21", url: UN("end-racism-day") },
  { start: "04-05", url: UN("conscience-day") },
  { start: "04-24", url: UN("Multilateralism-for-Peace-day") },
  { start: "05-16", url: UN("living-in-peace-day") },
  { start: "05-21", url: UN("cultural-diversity-day") },
  { start: "05-29", url: UN("peacekeepers-day") },
  { start: "06-18", url: UN("countering-hate-speech") },
  { start: "06-19", url: UN("end-sexual-violence-in-conflict-day") },
  { start: "06-24", url: UN("women-in-diplomacy-day") },
  { start: "07-30", url: UN("friendship-day") },
  { start: "08-12", url: UN("youth-day") },
  { start: "08-21", url: UN("terrorism-victims-day") },
  { start: "08-22", url: UN("religious-based-violence-victims-day") },
  { start: "09-21", url: UN("international-day-peace") },
  { start: "10-02", url: UN("non-violence-day") },
  { start: "10-31", url: "https://undocs.org/{lang}/S/RES/1325(2000)" }, // the resolution text itself
  { start: "11-16", url: "https://www.unesco.org/{lang}/days/tolerance" },
  { start: "11-25", url: UN("ending-violence-against-women-day"), ar: "https://www.un.org/ar/observances/ending-violence-against-women" },
  { start: "11-25", end: "12-10", url: "https://www.unwomen.org/en/what-we-do/ending-violence-against-women/unite/16-days-of-activism" },
  { start: "12-10", url: UN("human-rights-day") },
];

const withDates = (lang: Locale, titles: string[]): Observance[] =>
  observanceDates.map(({ start, end, url, ar }, i) => ({
    start,
    end,
    title: titles[i],
    url: lang === "ar" && ar ? ar : url.replace("{lang}", lang),
  }));

const en: AgendaContent = {
  meta: {
    title: "Agenda",
    description:
      "Upcoming Bridging Our Voices events: dialogue circles, workshops, training sessions and ceremonies, plus the international days for dialogue and peace.",
  },
  header: {
    eyebrow: "Agenda",
    title: "Upcoming events",
    lead: "Dialogue circles, workshops, training sessions and ceremonies, online and across the region.",
  },
  calendar: {
    prev: "Previous month",
    next: "Next month",
    legendEvent: "Event",
    legendObservance: "International day",
    legendToday: "Today",
    empty: "No events on this day.",
    showMonth: "Show the whole month",
    monthLabel: "This month",
    dayLabel: "Selected day",
  },
  featured: {
    image: "",
    kind: "Webinar series · Online",
    title: "Women, faith and the making of peace",
    dates: "26 Nov to 17 Dec",
    register: "Register",
    body: "A four-part series on women’s roles in interreligious peace work.",
  },
  eventPage: {
    date: "Date",
    place: "Place",
    type: "Type",
    sessions: "Sessions",
    details: "Times and joining details will be shared with registered participants.",
    register: "Register",
    addToCalendar: "Add to Google Calendar",
    back: "Back to the agenda",
    others: "Other upcoming events",
  },
  upcomingTitle: "All upcoming events",
  deadline: { kind: "Deadline", title: "Last day to register for the digital training course" },
  seriesPlace: "Online",
  events: [
    { kind: "Dialogue circle", title: "Faith, culture and the role of women", place: "Online · Arabic & English" },
    { kind: "Workshop", title: "Conflict analysis for community leaders", place: "Regional hub" },
    { kind: "Training", title: "Responding to hate speech online", place: "Online" },
    { kind: "Round table", title: "Citizenship, leadership and women’s participation", place: "To be announced" },
    { kind: "Ceremony", title: "First cohort accreditation", place: "To be announced" },
  ],
  observances: {
    eyebrow: "International days",
    title: "Global dates for dialogue and peace",
    lead: "The United Nations days that shape our year, from peaceful coexistence in January to Human Rights Day in December. They recur every year.",
    kind: "International day",
    items: withDates("en", [
      "International Day of Peaceful Coexistence",
      "World Interfaith Harmony Week",
      "International Day of Human Fraternity",
      "World Day of Social Justice",
      "International Women’s Day",
      "International Day to Combat Islamophobia",
      "International Day for the Elimination of Racial Discrimination",
      "International Day of Conscience",
      "International Day of Multilateralism and Diplomacy for Peace",
      "International Day of Living Together in Peace",
      "World Day for Cultural Diversity for Dialogue and Development",
      "International Day of UN Peacekeepers",
      "International Day for Countering Hate Speech",
      "International Day for the Elimination of Sexual Violence in Conflict",
      "International Day of Women in Diplomacy",
      "International Day of Friendship",
      "International Youth Day",
      "International Day of Remembrance and Tribute to the Victims of Terrorism",
      "International Day Commemorating the Victims of Acts of Violence Based on Religion or Belief",
      "International Day of Peace",
      "International Day of Non-Violence",
      "Anniversary of Security Council Resolution 1325 on Women, Peace and Security",
      "International Day for Tolerance",
      "International Day for the Elimination of Violence against Women",
      "16 Days of Activism against Gender-Based Violence",
      "Human Rights Day",
    ]),
  },
};

const fr: AgendaContent = {
  meta: {
    title: "Agenda",
    description:
      "Les prochains événements de Bridging Our Voices : cercles de dialogue, ateliers, formations et cérémonies, et les journées internationales du dialogue et de la paix.",
  },
  header: {
    eyebrow: "Agenda",
    title: "Événements à venir",
    lead: "Cercles de dialogue, ateliers, formations et cérémonies, en ligne et dans toute la région.",
  },
  calendar: {
    prev: "Mois précédent",
    next: "Mois suivant",
    legendEvent: "Événement",
    legendObservance: "Journée internationale",
    legendToday: "Aujourd’hui",
    empty: "Aucun événement ce jour-là.",
    showMonth: "Afficher tout le mois",
    monthLabel: "Ce mois-ci",
    dayLabel: "Jour sélectionné",
  },
  featured: {
    image: "",
    kind: "Série de webinaires · En ligne",
    title: "Femmes, foi et construction de la paix",
    dates: "26 nov. au 17 déc.",
    register: "S’inscrire",
    body: "Un cycle en quatre séances sur le rôle des femmes dans la paix interreligieuse.",
  },
  eventPage: {
    date: "Date",
    place: "Lieu",
    type: "Format",
    sessions: "Séances",
    details: "Les horaires et les modalités de participation seront communiqués aux personnes inscrites.",
    register: "S’inscrire",
    addToCalendar: "Ajouter à Google Agenda",
    back: "Retour à l’agenda",
    others: "Autres événements à venir",
  },
  upcomingTitle: "Tous les événements à venir",
  deadline: { kind: "Date limite", title: "Dernier jour d’inscription à la formation numérique" },
  seriesPlace: "En ligne",
  events: [
    { kind: "Cercle de dialogue", title: "Religion, culture et rôle des femmes", place: "En ligne · arabe et anglais" },
    { kind: "Atelier", title: "Analyse des conflits pour leaders communautaires", place: "Pôle régional" },
    { kind: "Formation", title: "Répondre aux discours de haine en ligne", place: "En ligne" },
    { kind: "Table ronde", title: "Citoyenneté, leadership et participation des femmes", place: "À confirmer" },
    { kind: "Cérémonie", title: "Certification de la première promotion", place: "À confirmer" },
  ],
  observances: {
    eyebrow: "Journées internationales",
    title: "Les dates mondiales du dialogue et de la paix",
    lead: "Les journées des Nations Unies qui rythment notre année, de la coexistence pacifique en janvier à la Journée des droits de l’homme en décembre. Elles reviennent chaque année.",
    kind: "Journée internationale",
    items: withDates("fr", [
      "Journée internationale de la coexistence pacifique",
      "Semaine mondiale de l’harmonie interconfessionnelle",
      "Journée internationale de la fraternité humaine",
      "Journée mondiale de la justice sociale",
      "Journée internationale des femmes",
      "Journée internationale de lutte contre l’islamophobie",
      "Journée internationale pour l’élimination de la discrimination raciale",
      "Journée internationale de la conscience",
      "Journée internationale du multilatéralisme et de la diplomatie au service de la paix",
      "Journée internationale du vivre-ensemble en paix",
      "Journée mondiale de la diversité culturelle pour le dialogue et le développement",
      "Journée internationale des Casques bleus des Nations Unies",
      "Journée internationale de la lutte contre les discours de haine",
      "Journée internationale pour l’élimination de la violence sexuelle en temps de conflit",
      "Journée internationale des femmes dans la diplomatie",
      "Journée internationale de l’amitié",
      "Journée internationale de la jeunesse",
      "Journée internationale du souvenir, en hommage aux victimes du terrorisme",
      "Journée internationale de commémoration des personnes victimes de violences en raison de leur religion ou de leurs convictions",
      "Journée internationale de la paix",
      "Journée internationale de la non-violence",
      "Anniversaire de la résolution 1325 du Conseil de sécurité sur les femmes, la paix et la sécurité",
      "Journée mondiale de la tolérance",
      "Journée internationale pour l’élimination de la violence à l’égard des femmes",
      "16 jours d’activisme contre la violence basée sur le genre",
      "Journée des droits de l’homme",
    ]),
  },
};

const ar: AgendaContent = {
  meta: {
    title: "الأجندة",
    description:
      "فعاليات Bridging Our Voices القادمة: حلقات حوار وورش وتدريبات واحتفالات، والأيام الدولية للحوار والسلام.",
  },
  header: {
    eyebrow: "الأجندة",
    title: "الفعاليات القادمة",
    lead: "حلقات حوار وورش وتدريبات واحتفالات، أونلاين وفي أنحاء المنطقة.",
  },
  calendar: {
    prev: "الشهر السابق",
    next: "الشهر التالي",
    legendEvent: "فعالية",
    legendObservance: "يوم دولي",
    legendToday: "اليوم",
    empty: "لا توجد فعاليات في هذا اليوم.",
    showMonth: "عرض الشهر كاملًا",
    monthLabel: "هذا الشهر",
    dayLabel: "اليوم المحدد",
  },
  featured: {
    image: "",
    kind: "سلسلة ندوات · أونلاين",
    title: "المرأة والإيمان وصناعة السلام",
    dates: "من ٢٦ نوفمبر إلى ١٧ ديسمبر",
    register: "سجّل/ي الآن",
    body: "سلسلة من أربع حلقات عن دور المرأة في العمل السلمي بين الأديان.",
  },
  eventPage: {
    date: "التاريخ",
    place: "المكان",
    type: "النوع",
    sessions: "الحلقات",
    details: "سيتم إرسال المواعيد وتفاصيل الانضمام للمسجّلين.",
    register: "سجّل/ي الآن",
    addToCalendar: "أضف/ي إلى تقويم جوجل",
    back: "العودة إلى الأجندة",
    others: "فعاليات قادمة أخرى",
  },
  upcomingTitle: "كل الفعاليات القادمة",
  deadline: { kind: "آخر موعد", title: "آخر يوم للتسجيل في الدورة التدريبية الرقمية" },
  seriesPlace: "أونلاين",
  events: [
    { kind: "حلقة حوار", title: "الدين والثقافة ودور المرأة", place: "أونلاين · عربي وإنجليزي" },
    { kind: "ورشة", title: "تحليل النزاعات للقيادات المجتمعية", place: "المركز الإقليمي" },
    { kind: "تدريب", title: "الرد على خطاب الكراهية رقميًا", place: "أونلاين" },
    { kind: "طاولة مستديرة", title: "المواطنة والقيادة ومشاركة المرأة", place: "يُعلن لاحقًا" },
    { kind: "حفل", title: "اعتماد الدفعة الأولى", place: "يُعلن لاحقًا" },
  ],
  observances: {
    eyebrow: "الأيام الدولية",
    title: "المواعيد العالمية للحوار والسلام",
    lead: "أيام الأمم المتحدة التي ترسم عامنا، من التعايش السلمي في يناير إلى يوم حقوق الإنسان في ديسمبر. تتكرر كل عام.",
    kind: "يوم دولي",
    items: withDates("ar", [
      "اليوم الدولي للتعايش السلمي",
      "أسبوع الوئام العالمي بين الأديان",
      "اليوم الدولي للأخوة الإنسانية",
      "اليوم العالمي للعدالة الاجتماعية",
      "اليوم الدولي للمرأة",
      "اليوم الدولي لمكافحة كراهية الإسلام",
      "اليوم الدولي للقضاء على التمييز العنصري",
      "اليوم الدولي للضمير",
      "اليوم الدولي لتعددية الأطراف والدبلوماسية من أجل السلام",
      "اليوم الدولي للعيش معاً في سلام",
      "اليوم العالمي للتنوع الثقافي من أجل الحوار والتنمية",
      "اليوم الدولي لحفظة السلام",
      "اليوم الدولي لمكافحة خطاب الكراهية",
      "اليوم الدولي للقضاء على العنف الجنسي في حالات النزاع",
      "اليوم الدولي للمرأة في العمل الدبلوماسي",
      "اليوم الدولي للصداقة",
      "يوم الشباب الدولي",
      "اليوم الدولي لإحياء ذكرى ضحايا الإرهاب وإجلالهم",
      "اليوم الدولي لإحياء ذكرى ضحايا أعمال العنف القائمة على أساس الدين أو المعتقد",
      "اليوم الدولي للسلام",
      "اليوم الدولي للاعنف",
      "ذكرى قرار مجلس الأمن ١٣٢٥ بشأن المرأة والسلام والأمن",
      "اليوم الدولي للتسامح",
      "اليوم الدولي للقضاء على العنف ضد المرأة",
      "حملة الـ١٦ يومًا لمناهضة العنف القائم على النوع الاجتماعي",
      "يوم حقوق الإنسان",
    ]),
  },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, AgendaContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getAgendaContent(locale: Locale): Promise<AgendaContent> {
  return loadContent("agenda", locale, defaults[locale]);
}

/** URL of an event page. */
export const eventHref = (locale: Locale, slug: string) => `/${locale}/agenda/${slug}`;

/**
 * The page's own dated items (deadline, series sessions, events), sorted by date, each linked to its page:
 * the deadline goes to the course on the Training page, the series and events to /agenda/[slug].
 */
export function agendaItems(a: AgendaContent, locale: Locale): AgendaItem[] {
  return [
    { iso: deadlineIso, kind: a.deadline.kind, title: a.deadline.title, tone: "deadline" as const, href: `/${locale}/activities/training#course` },
    ...seriesIsos.map((iso) => ({
      iso,
      kind: a.featured.kind,
      title: a.featured.title,
      place: a.seriesPlace,
      tone: "series" as const,
      href: eventHref(locale, seriesSlug),
    })),
    ...a.events.map((e, i) => ({
      iso: eventIsos[i],
      kind: e.kind,
      title: e.title,
      place: e.place,
      tone: "event" as const,
      href: eventHref(locale, eventSlugs[i]),
    })),
  ].sort((x, y) => x.iso.localeCompare(y.iso));
}

/** Everything an event page needs, or null for an unknown slug. The series lists its four sessions. */
export function agendaEntry(a: AgendaContent, slug: string) {
  if (slug === seriesSlug) {
    return { kind: a.featured.kind, title: a.featured.title, place: a.seriesPlace, body: a.featured.body, isos: seriesIsos, tone: "series" as const };
  }
  const i = eventSlugs.indexOf(slug);
  if (i < 0) return null;
  const e = a.events[i];
  return { kind: e.kind, title: e.title, place: e.place, body: undefined, isos: [eventIsos[i]], tone: "event" as const };
}

/** Date-formatting locale: Arabic uses Egyptian digits, as in the brand file. */
export function dateLocale(locale: Locale): string {
  return locale === "ar" ? "ar-EG" : locale === "fr" ? "fr-FR" : "en-GB";
}
