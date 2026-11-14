import type { Locale } from "@/i18n/config";

/**
 * Religions and their denominations for the network forms (owner, 2026-11-14): chosen from lists, like
 * the countries, instead of typed. Each religion has its own denominations; "other" lets the person type.
 * Values are stable codes (stored in the database and checked by the API); labels are in EN / FR / AR and
 * part of the page content (editable in the dashboard).
 */
export type Option = { value: string; label: string };
export type Religion = Option & { denominations: Option[] };

type L = [en: string, fr: string, ar: string];
type Def = { value: string; label: L; denominations?: { value: string; label: L }[] };

const OTHER_DENOMINATION = { value: "other", label: ["Other", "Autre", "أخرى"] as L };

const defs: Def[] = [
  {
    value: "islam",
    label: ["Islam", "Islam", "الإسلام"],
    denominations: [
      { value: "sunni", label: ["Sunni", "Sunnite", "سني"] },
      { value: "shia-twelver", label: ["Shia (Twelver)", "Chiite (duodécimain)", "شيعي (اثنا عشري)"] },
      { value: "ismaili", label: ["Ismaili", "Ismaélien", "إسماعيلي"] },
      { value: "zaydi", label: ["Zaydi", "Zaïdite", "زيدي"] },
      { value: "ibadi", label: ["Ibadi", "Ibadite", "إباضي"] },
      { value: "sufi", label: ["Sufi", "Soufi", "صوفي"] },
    ],
  },
  {
    value: "christianity",
    label: ["Christianity", "Christianisme", "المسيحية"],
    denominations: [
      { value: "coptic-orthodox", label: ["Coptic Orthodox", "Copte orthodoxe", "قبطي أرثوذكسي"] },
      { value: "eastern-orthodox", label: ["Eastern (Greek) Orthodox", "Orthodoxe (grec)", "روم أرثوذكس"] },
      { value: "armenian-apostolic", label: ["Armenian Apostolic", "Apostolique arménien", "أرمني رسولي"] },
      { value: "syriac-orthodox", label: ["Syriac Orthodox", "Syriaque orthodoxe", "سرياني أرثوذكسي"] },
      { value: "tewahedo", label: ["Ethiopian / Eritrean Orthodox Tewahedo", "Orthodoxe éthiopien / érythréen (Tewahedo)", "أرثوذكسي إثيوبي / إريتري (تواحدو)"] },
      { value: "catholic", label: ["Roman Catholic", "Catholique romain", "كاثوليكي (لاتيني)"] },
      { value: "maronite", label: ["Maronite", "Maronite", "ماروني"] },
      { value: "melkite", label: ["Melkite Greek Catholic", "Grec-catholique melkite", "روم كاثوليك (ملكي)"] },
      { value: "coptic-catholic", label: ["Coptic Catholic", "Copte catholique", "قبطي كاثوليكي"] },
      { value: "chaldean", label: ["Chaldean Catholic", "Chaldéen catholique", "كلداني كاثوليكي"] },
      { value: "assyrian", label: ["Assyrian Church of the East", "Église assyrienne de l’Orient", "كنيسة المشرق الآشورية"] },
      { value: "evangelical", label: ["Evangelical / Protestant", "Évangélique / protestant", "إنجيلي / بروتستانتي"] },
      { value: "anglican", label: ["Anglican / Episcopal", "Anglican / épiscopalien", "أنجليكاني / أسقفي"] },
      { value: "lutheran", label: ["Lutheran", "Luthérien", "لوثري"] },
      { value: "presbyterian", label: ["Presbyterian / Reformed", "Presbytérien / réformé", "مشيخي / مُصلَح"] },
      { value: "methodist", label: ["Methodist", "Méthodiste", "ميثودي"] },
      { value: "baptist", label: ["Baptist", "Baptiste", "معمداني"] },
      { value: "pentecostal", label: ["Pentecostal", "Pentecôtiste", "خمسيني"] },
      { value: "adventist", label: ["Seventh-day Adventist", "Adventiste du septième jour", "سبتي (الأدفنتست)"] },
    ],
  },
  {
    value: "judaism",
    label: ["Judaism", "Judaïsme", "اليهودية"],
    denominations: [
      { value: "orthodox", label: ["Orthodox", "Orthodoxe", "أرثوذكسي"] },
      { value: "conservative", label: ["Conservative / Masorti", "Massorti (conservateur)", "محافظ (ماسورتي)"] },
      { value: "reform", label: ["Reform / Liberal", "Réformé / libéral", "إصلاحي / ليبرالي"] },
      { value: "karaite", label: ["Karaite", "Karaïte", "قرائي"] },
    ],
  },
  { value: "druze", label: ["Druze faith", "Druze", "الموحدون الدروز"] },
  { value: "bahai", label: ["Baháʼí Faith", "Foi baha’ie", "البهائية"] },
  { value: "yazidi", label: ["Yazidism", "Yézidisme", "الإيزيدية"] },
  { value: "mandaean", label: ["Mandaeism (Sabians)", "Mandéisme (sabéens)", "الصابئة المندائيون"] },
  { value: "zoroastrianism", label: ["Zoroastrianism", "Zoroastrisme", "الزرادشتية"] },
  {
    value: "hinduism",
    label: ["Hinduism", "Hindouisme", "الهندوسية"],
    denominations: [
      { value: "vaishnavism", label: ["Vaishnavism", "Vishnouisme", "الفيشنوية"] },
      { value: "shaivism", label: ["Shaivism", "Shivaïsme", "الشيفية"] },
      { value: "shaktism", label: ["Shaktism", "Shaktisme", "الشاكتية"] },
      { value: "smartism", label: ["Smartism", "Smartisme", "السمارتية"] },
    ],
  },
  {
    value: "buddhism",
    label: ["Buddhism", "Bouddhisme", "البوذية"],
    denominations: [
      { value: "theravada", label: ["Theravada", "Theravada", "ثيرافادا"] },
      { value: "mahayana", label: ["Mahayana", "Mahayana", "ماهايانا"] },
      { value: "vajrayana", label: ["Vajrayana (Tibetan)", "Vajrayana (tibétain)", "فاجرايانا (التبتية)"] },
    ],
  },
  { value: "sikhism", label: ["Sikhism", "Sikhisme", "السيخية"] },
  {
    value: "jainism",
    label: ["Jainism", "Jaïnisme", "الجاينية"],
    denominations: [
      { value: "digambara", label: ["Digambara", "Digambara", "ديغامبارا"] },
      { value: "svetambara", label: ["Svetambara", "Svetambara", "شفيتامبارا"] },
    ],
  },
  { value: "shinto", label: ["Shinto", "Shintoïsme", "الشنتوية"] },
  { value: "taoism", label: ["Taoism", "Taoïsme", "الطاوية"] },
  { value: "confucianism", label: ["Confucianism", "Confucianisme", "الكونفوشيوسية"] },
  { value: "african-traditional", label: ["African traditional religions", "Religions traditionnelles africaines", "الديانات الأفريقية التقليدية"] },
  { value: "indigenous", label: ["Indigenous / traditional beliefs", "Croyances autochtones / traditionnelles", "معتقدات أصلية / تقليدية"] },
  { value: "none", label: ["No religious affiliation", "Sans appartenance religieuse", "بدون انتماء ديني"] },
  { value: "prefer-not", label: ["Prefer not to say", "Je préfère ne pas répondre", "أفضّل عدم الإجابة"] },
  { value: "other", label: ["Other", "Autre", "أخرى"] },
];

const idx: Record<Locale, number> = { en: 0, fr: 1, ar: 2 };

/** The list in one language; every religion with denominations also offers "Other". */
export function religionsFor(locale: Locale): Religion[] {
  const i = idx[locale];
  return defs.map((d) => ({
    value: d.value,
    label: d.label[i],
    denominations: d.denominations ? [...d.denominations, OTHER_DENOMINATION].map((x) => ({ value: x.value, label: x.label[i] })) : [],
  }));
}
