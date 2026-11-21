import { count } from "drizzle-orm";
import { db, schema } from "./db/client.js";
import type { I18n } from "./db/schema.js";

/**
 * Starting e-learning content (owner, 2026-11-21), inserted once when there are no courses yet.
 * Everything is a DRAFT: the team fills in videos, files and texts in the dashboard, then publishes.
 *  - "Women and Peacebuilding" (requested by the owner): 5 units, 15 lessons.
 * (Owner, 2026-11-21: e-learning is for real self-paced courses, like an LMS. The online Zoom programme and
 * its lectures belong on the Training programmes page, so no other suggestions are seeded here.)
 */
type L = [en: string, fr: string, ar: string];
const t = ([en, fr, ar]: L): I18n => ({ en, fr, ar });
const empty = (): I18n => ({ en: "", fr: "", ar: "" });

type Lesson = { type: "video" | "file" | "text" | "link"; title: L; minutes?: number };
type Unit = { title: L; summary?: L; lessons: Lesson[] };
type Seed = {
  slug: string;
  kind: "course" | "webinar";
  format: "self-paced" | "instructor-led" | "live";
  title: L;
  summary: L;
  description: L;
  programmeArea: L;
  duration: L;
  learningTime: L;
  languages: string[];
  units: Unit[];
};

const FREE: L = ["Free", "Gratuit", "مجاني"];

const seeds: Seed[] = [
  {
    slug: "women-and-peacebuilding",
    kind: "course",
    format: "self-paced",
    title: ["Women and Peacebuilding", "Les femmes et la consolidation de la paix", "المرأة وبناء السلام"],
    summary: [
      "An online course on the many ways women lead dialogue, mediation and peacebuilding, from the Women, Peace and Security agenda to practical tools.",
      "Un cours en ligne sur les multiples façons dont les femmes mènent le dialogue, la médiation et la consolidation de la paix, de l’agenda Femmes, paix et sécurité aux outils pratiques.",
      "دورة إلكترونية عن الطرق المختلفة التي تقود بها المرأة الحوار والوساطة وبناء السلام، من أجندة المرأة والسلام والأمن إلى الأدوات العملية.",
    ],
    description: [
      "Women have always mediated within families and communities. This course shows the many ways women lead peacebuilding and gives participants, women and men, knowledge and practical tools: the Women, Peace and Security agenda, gender-sensitive conflict analysis, dialogue facilitation and community mediation, and designing a local peace initiative. Each unit combines short videos, readings and a practical exercise.",
      "Les femmes ont toujours été médiatrices au sein des familles et des communautés. Ce cours montre les multiples façons dont les femmes mènent la consolidation de la paix et donne aux participants et participantes des connaissances et des outils pratiques : l’agenda Femmes, paix et sécurité, l’analyse des conflits sensible au genre, l’animation du dialogue et la médiation communautaire, et la conception d’une initiative de paix locale. Chaque module associe de courtes vidéos, des lectures et un exercice pratique.",
      "لطالما كانت المرأة وسيطة داخل الأسرة والمجتمع. تعرض هذه الدورة الطرق المختلفة التي تقود بها المرأة بناء السلام، وتزوّد المشاركين والمشاركات بالمعرفة والأدوات العملية: أجندة المرأة والسلام والأمن، وتحليل النزاعات من منظور النوع الاجتماعي، وتيسير الحوار والوساطة المجتمعية، وتصميم مبادرة سلام محلية. تجمع كل وحدة بين مقاطع فيديو قصيرة وقراءات وتمرين عملي.",
    ],
    programmeArea: ["Women, Peace and Security", "Femmes, paix et sécurité", "المرأة والسلام والأمن"],
    duration: ["4 weeks", "4 semaines", "٤ أسابيع"],
    learningTime: ["About 10 hours", "Environ 10 heures", "حوالي ١٠ ساعات"],
    languages: ["ar", "en"],
    units: [
      {
        title: ["Introduction: the Women, Peace and Security agenda", "Introduction : l’agenda Femmes, paix et sécurité", "مدخل: أجندة المرأة والسلام والأمن"],
        lessons: [
          { type: "video", title: ["Welcome and course overview", "Bienvenue et présentation du cours", "ترحيب وتعريف بالدورة"], minutes: 10 },
          {
            type: "video",
            title: [
              "Security Council Resolution 1325 and the resolutions that followed",
              "La résolution 1325 du Conseil de sécurité et les suivantes",
              "قرار مجلس الأمن ١٣٢٥ والقرارات التي تلته",
            ],
            minutes: 20,
          },
          {
            type: "file",
            title: [
              "Reading: the WPS agenda in the Arab region and Africa",
              "Lecture : l’agenda FPS dans le monde arabe et en Afrique",
              "قراءة: أجندة المرأة والسلام والأمن في المنطقة العربية وأفريقيا",
            ],
            minutes: 30,
          },
        ],
      },
      {
        title: ["The many ways women lead peace", "Les multiples façons dont les femmes mènent la paix", "الطرق المختلفة التي تقود بها المرأة السلام"],
        lessons: [
          {
            type: "video",
            title: [
              "Women as informal mediators in families and communities",
              "Les femmes, médiatrices informelles dans les familles et les communautés",
              "المرأة وسيطةً غير رسمية في الأسرة والمجتمع",
            ],
            minutes: 20,
          },
          {
            type: "video",
            title: ["Women in religious and community leadership", "Les femmes dans le leadership religieux et communautaire", "المرأة في القيادة الدينية والمجتمعية"],
            minutes: 20,
          },
          { type: "text", title: ["Case studies from the region", "Études de cas de la région", "دراسات حالة من المنطقة"], minutes: 30 },
        ],
      },
      {
        title: ["Gender-sensitive conflict analysis", "Analyse des conflits sensible au genre", "تحليل النزاعات من منظور النوع الاجتماعي"],
        lessons: [
          {
            type: "video",
            title: [
              "Tools for analysing conflict: actors, causes, dynamics",
              "Outils d’analyse des conflits : acteurs, causes, dynamiques",
              "أدوات تحليل النزاع: الأطراف والأسباب والديناميكيات",
            ],
            minutes: 25,
          },
          {
            type: "video",
            title: [
              "How conflict affects women and men differently",
              "Comment les conflits touchent différemment les femmes et les hommes",
              "كيف يؤثر النزاع على النساء والرجال بشكل مختلف",
            ],
            minutes: 20,
          },
          {
            type: "file",
            title: ["Exercise: map a conflict in your community", "Exercice : cartographier un conflit dans votre communauté", "تمرين: ارسم/ي خريطة لنزاع في مجتمعك"],
            minutes: 40,
          },
        ],
      },
      {
        title: ["Dialogue and community mediation skills", "Compétences en dialogue et médiation communautaire", "مهارات الحوار والوساطة المجتمعية"],
        lessons: [
          { type: "video", title: ["Deep listening and effective communication", "Écoute profonde et communication efficace", "الإصغاء العميق والتواصل الفعّال"], minutes: 20 },
          { type: "video", title: ["Facilitating a dialogue circle step by step", "Animer un cercle de dialogue, étape par étape", "تيسير حلقة حوار خطوة بخطوة"], minutes: 25 },
          {
            type: "link",
            title: [
              "Live session: practice with a facilitator (Zoom)",
              "Séance en direct : pratique avec un facilitateur ou une facilitatrice (Zoom)",
              "جلسة مباشرة: تدريب عملي مع ميسّر/ة (Zoom)",
            ],
            minutes: 60,
          },
        ],
      },
      {
        title: ["From learning to action", "De l’apprentissage à l’action", "من التعلّم إلى العمل"],
        lessons: [
          { type: "video", title: ["Designing a local peace initiative", "Concevoir une initiative de paix locale", "تصميم مبادرة سلام محلية"], minutes: 20 },
          {
            type: "file",
            title: ["Template: your community initiative plan", "Modèle : le plan de votre initiative communautaire", "نموذج: خطة مبادرتك المجتمعية"],
            minutes: 30,
          },
          { type: "text", title: ["Final reflection and certificate", "Réflexion finale et certificat", "تأمل ختامي والحصول على الشهادة"], minutes: 15 },
        ],
      },
    ],
  },
];

export async function seedCourses(log: (m: string) => void) {
  const [{ n }] = await db.select({ n: count() }).from(schema.courses);
  if (n > 0) return;
  for (const [i, c] of seeds.entries()) {
    const [course] = await db
      .insert(schema.courses)
      .values({
        slug: c.slug,
        kind: c.kind,
        status: "draft",
        format: c.format,
        title: t(c.title),
        summary: t(c.summary),
        description: c.description.every((x) => !x) ? empty() : t(c.description),
        programmeArea: t(c.programmeArea),
        duration: t(c.duration),
        learningTime: t(c.learningTime),
        fees: t(FREE),
        languages: c.languages,
        certificate: c.kind === "course",
        sort: i,
      })
      .returning({ id: schema.courses.id });
    for (const [mi, u] of c.units.entries()) {
      const [mod] = await db
        .insert(schema.courseModules)
        .values({ courseId: course.id, sort: mi, title: t(u.title), summary: u.summary ? t(u.summary) : empty() })
        .returning({ id: schema.courseModules.id });
      for (const [li, l] of u.lessons.entries()) {
        await db.insert(schema.courseLessons).values({ moduleId: mod.id, sort: li, type: l.type, title: t(l.title), body: empty(), minutes: l.minutes ?? 0 });
      }
    }
    log(`e-learning: seeded draft "${c.title[0]}"`);
  }
}
