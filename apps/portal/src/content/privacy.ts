import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";
import { contactEmail } from "./contact";

/**
 * Privacy policy. The brand file has no privacy page, so this text was written from what the site's forms
 * actually collect (see apps/api/src/server.ts and network.ts). It is a DRAFT for the owner to review:
 * the retention periods and the publishing rule for members are proposals (see SPEC.md, open items).
 * When a form field or data use changes, update this page and `updated`.
 */

/** A block inside a section: a paragraph, a bullet list, or a small sub-heading. */
export type PrivacyBlock = { p: string } | { list: string[] } | { h: string };
export type PrivacySection = { id: string; title: string; blocks: PrivacyBlock[] };

export type PrivacyContent = {
  meta: { title: string; description: string };
  header: { eyebrow: string; title: string; lead: string };
  updatedLabel: string;
  /** Last update date, already written in the page's language. */
  updated: string;
  tocLabel: string;
  sections: PrivacySection[];
};

/** Section ids are shared by every language, so anchors (#retention, #rights…) work in EN / FR / AR. */
const ids = ["who", "collect", "use", "sensitive", "publish", "share", "retention", "rights", "security", "age", "changes"] as const;
const sections = (list: { title: string; blocks: PrivacyBlock[] }[]): PrivacySection[] =>
  list.map((s, i) => ({ id: ids[i], ...s }));

const en: PrivacyContent = {
  meta: {
    title: "Privacy policy",
    description: "How Bridging Our Voices collects, uses and protects the personal data you share through the newsletter, contact and membership forms.",
  },
  header: {
    eyebrow: "Privacy",
    title: "Privacy policy",
    lead: "What we collect through this website, why we need it, how long we keep it, and how you can see, change or delete it.",
  },
  updatedLabel: "Last updated",
  updated: "21 November 2026",
  tocLabel: "On this page",
  sections: sections([
    {
      title: "Who we are",
      blocks: [
        { p: "Bridging Our Voices, directed by Dr. Anwaar Kataia (Lead Fellow and Project Manager), is a platform for dialogue and peacebuilding that champions women’s leadership. We are responsible for the personal data collected through this website." },
        { p: `For any question about your data, write to ${contactEmail}.` },
      ],
    },
    {
      title: "What we collect",
      blocks: [
        { p: "We only collect what you type into our forms. Each form asks for the following:" },
        { h: "Newsletter" },
        { list: ["Your email address."] },
        { h: "Contact form" },
        { list: ["Your name and email address.", "The subject you choose and your message."] },
        { h: "“Add your voice to ours”" },
        {
          list: [
            "Your name, gender, job title, organisation (optional), country and email address.",
            "Your religion, and your denomination if you choose to give it.",
            "Your fields of work, your statement of support and, if you wish, an article.",
            "A photo, if you choose to upload one.",
            "The language of the page you used.",
          ],
        },
        { h: "Membership application" },
        {
          list: [
            "The same personal details as above (name, gender, job title, organisation, country, email, religion and fields of work).",
            "A summary of your experience (up to 150 words), your CV (PDF), what motivates you to join, the activities you could carry out with us and, if you wish, the organisations you could connect us with.",
            "A photo, if you choose to upload one.",
          ],
        },
        { h: "Learner account (e-learning)" },
        { list: ["Your name, email address and country, and a password (stored only as a secure hash that no one can read).", "The courses you join, the lessons you mark as done and your unit quiz results.", "If you fill in your profile: your job title, organisation and a few lines about you. Other participants of your courses see your name, country and profile unless you hide it in “My profile”."] },
        { h: "When you visit the site" },
        { p: "This website does not use advertising or tracking cookies, and it does not use analytics tools. Like every website, our hosting provider may record technical information (such as your IP address and browser) in server logs, to keep the site secure and working." },
      ],
    },
    {
      title: "Why we use it",
      blocks: [
        {
          list: [
            "Newsletter: to send you news about our programmes and events, because you asked us to.",
            "Contact form: to answer your message.",
            "Learner account: to give you access to the courses you join, keep your progress, and contact you about the course.",
            "Membership application: to review your application, contact you about it and, if you join, keep you connected to the network. You give your consent when you tick the box before sending.",
          ],
        },
        { p: "We never sell your data, and we never use it for advertising." },
      ],
    },
    {
      title: "Religion and other sensitive information",
      blocks: [
        { p: "The membership and “Add your voice to ours” forms ask for your religion and gender. This is sensitive information. We ask for it only because our network is built on interreligious and intercultural dialogue, and we want to keep it diverse and balanced." },
        { p: "Only our team sees this information. We use it to review applications, and we never publish it." },
      ],
    },
    {
      title: "What we may publish",
      blocks: [
        { p: "If your statement or application is accepted, we may show your name, role, country, photo and your statement (or a short summary of your experience) on the site. We will only do this after our team has reviewed it and you have agreed. You can ask us to remove it at any time. Your CV is only read by our team and is never published." },
      ],
    },
    {
      title: "Who can see your data",
      blocks: [
        {
          list: [
            "The Bridging Our Voices team, who need it to answer you or review your application.",
            "The service providers that host our website and email. They process data only on our behalf.",
          ],
        },
        { p: "We do not share your data with our partners or anyone else without your permission, unless the law requires it." },
      ],
    },
    {
      title: "How long we keep it",
      blocks: [
        {
          list: [
            "Newsletter: until you unsubscribe.",
            "Contact messages: up to 12 months after our last reply.",
            "Learner accounts and course progress: until you ask us to delete your account.",
            "Membership applications: for as long as you are a member. If an application is not accepted, or you withdraw it, we delete it, with any photo and CV, within 6 months.",
            "Server logs: for the short period our hosting provider keeps them.",
          ],
        },
      ],
    },
    {
      title: "Your rights",
      blocks: [
        { p: "You can ask us at any time to:" },
        {
          list: [
            "Show you the data we hold about you.",
            "Correct it.",
            "Delete it, or remove your profile from the site.",
            "Withdraw your consent or unsubscribe from the newsletter.",
          ],
        },
        { p: `Write to ${contactEmail}. We will reply within 30 days. You can also complain to the data-protection authority in your country.` },
      ],
    },
    {
      title: "How we protect it",
      blocks: [
        { p: "The site uses an encrypted connection (HTTPS). Only our team can open the data, and photos are checked to make sure they are real images before they are stored." },
      ],
    },
    {
      title: "Age",
      blocks: [{ p: "Our forms are meant for adults aged 18 and over. Some programmes have their own minimum age; the digital training course, for example, is for ages 25 and over." }],
    },
    {
      title: "Changes to this policy",
      blocks: [{ p: "If we change how we use your data, we will update this page and the date at the top." }],
    },
  ]),
};

const fr: PrivacyContent = {
  meta: {
    title: "Politique de confidentialité",
    description: "Comment Bridging Our Voices collecte, utilise et protège les données personnelles que vous partagez via la newsletter, le formulaire de contact et le formulaire d’adhésion.",
  },
  header: {
    eyebrow: "Confidentialité",
    title: "Politique de confidentialité",
    lead: "Ce que nous collectons sur ce site, pourquoi, combien de temps nous le gardons, et comment le consulter, le modifier ou le supprimer.",
  },
  updatedLabel: "Dernière mise à jour",
  updated: "21 novembre 2026",
  tocLabel: "Sur cette page",
  sections: sections([
    {
      title: "Qui sommes-nous",
      blocks: [
        { p: "Bridging Our Voices est une plateforme de dialogue et de consolidation de la paix qui affirme le leadership des femmes, dirigée par la Dr Anwaar Kataia (Lead Fellow et cheffe de projet). Nous sommes responsables des données personnelles collectées sur ce site." },
        { p: `Pour toute question sur vos données, écrivez à ${contactEmail}.` },
      ],
    },
    {
      title: "Ce que nous collectons",
      blocks: [
        { p: "Nous collectons uniquement ce que vous saisissez dans nos formulaires. Chaque formulaire demande les informations suivantes :" },
        { h: "Newsletter" },
        { list: ["Votre adresse e-mail."] },
        { h: "Formulaire de contact" },
        { list: ["Votre nom et votre adresse e-mail.", "L’objet choisi et votre message."] },
        { h: "« Joignez votre voix à la nôtre »" },
        {
          list: [
            "Votre nom, genre, fonction, organisation (facultatif), pays et adresse e-mail.",
            "Votre religion, et votre confession si vous choisissez de l’indiquer.",
            "Vos domaines d’action, votre message de soutien et, si vous le souhaitez, un article.",
            "Une photo, si vous choisissez d’en ajouter une.",
            "La langue de la page utilisée.",
          ],
        },
        { h: "Demande d’adhésion" },
        {
          list: [
            "Les mêmes informations personnelles que ci-dessus (nom, genre, fonction, organisation, pays, e-mail, religion et domaines d’action).",
            "Un résumé de votre expérience (150 mots maximum), votre CV (PDF), ce qui vous motive à nous rejoindre, les activités que vous pourriez mener avec nous et, si vous le souhaitez, les organisations avec lesquelles vous pourriez nous mettre en relation.",
            "Une photo, si vous choisissez d’en ajouter une.",
          ],
        },
        { h: "Compte d’apprenant ou d’apprenante (apprentissage en ligne)" },
        { list: ["Votre nom, votre adresse e-mail, votre pays et un mot de passe (conservé uniquement sous forme d’empreinte sécurisée, illisible par quiconque).", "Les cours que vous rejoignez, les leçons que vous marquez comme terminées et vos résultats aux quiz des modules.", "Si vous complétez votre profil : votre fonction, votre organisation et quelques lignes sur vous. Les autres participants de vos cours voient votre nom, votre pays et votre profil, sauf si vous le masquez dans « Mon profil »."] },
        { h: "Lorsque vous visitez le site" },
        { p: "Ce site n’utilise ni cookies publicitaires ou de suivi, ni outils d’analyse d’audience. Comme pour tout site, notre hébergeur peut enregistrer des informations techniques (adresse IP, navigateur) dans des journaux serveur, pour assurer la sécurité et le bon fonctionnement du site." },
      ],
    },
    {
      title: "Pourquoi nous les utilisons",
      blocks: [
        {
          list: [
            "Newsletter : pour vous envoyer nos actualités sur les programmes et événements, à votre demande.",
            "Formulaire de contact : pour répondre à votre message.",
            "Compte d’apprenant ou d’apprenante : pour vous donner accès aux cours que vous rejoignez, conserver votre progression et vous contacter au sujet du cours.",
            "Demande d’adhésion : pour examiner votre candidature, vous contacter à ce sujet et, si vous nous rejoignez, vous relier au réseau. Vous donnez votre consentement en cochant la case avant l’envoi.",
          ],
        },
        { p: "Nous ne vendons jamais vos données et ne les utilisons jamais à des fins publicitaires." },
      ],
    },
    {
      title: "Religion et autres informations sensibles",
      blocks: [
        { p: "Le formulaire d’adhésion demande votre religion et votre genre. Ce sont des informations sensibles. Nous les demandons uniquement parce que notre réseau repose sur le dialogue interreligieux et interculturel, et que nous voulons qu’il reste divers et équilibré." },
        { p: "Seule notre équipe voit ces informations. Elles servent à examiner les candidatures et ne sont jamais publiées." },
      ],
    },
    {
      title: "Ce que nous pouvons publier",
      blocks: [
        { p: "Si votre message ou votre candidature est accepté, nous pouvons afficher sur le site votre nom, votre fonction, votre pays, votre photo et votre message (ou un court résumé de votre expérience). Nous ne le faisons qu’après examen par notre équipe et avec votre accord. Vous pouvez demander leur retrait à tout moment. Votre CV n’est lu que par notre équipe et n’est jamais publié." },
      ],
    },
    {
      title: "Qui peut voir vos données",
      blocks: [
        {
          list: [
            "L’équipe de Bridging Our Voices, qui en a besoin pour vous répondre ou examiner votre candidature.",
            "Les prestataires qui hébergent notre site et notre messagerie. Ils traitent les données uniquement pour notre compte.",
          ],
        },
        { p: "Nous ne partageons pas vos données avec nos partenaires ni avec quiconque sans votre accord, sauf obligation légale." },
      ],
    },
    {
      title: "Durée de conservation",
      blocks: [
        {
          list: [
            "Newsletter : jusqu’à votre désinscription.",
            "Messages de contact : jusqu’à 12 mois après notre dernière réponse.",
            "Comptes d’apprentissage et progression : jusqu’à ce que vous nous demandiez de supprimer votre compte.",
            "Demandes d’adhésion : tant que vous êtes membre. Si une candidature n’est pas retenue, ou si vous la retirez, nous la supprimons, photo et CV compris, sous 6 mois.",
            "Journaux serveur : pendant la courte durée fixée par notre hébergeur.",
          ],
        },
      ],
    },
    {
      title: "Vos droits",
      blocks: [
        { p: "Vous pouvez à tout moment nous demander de :" },
        {
          list: [
            "Vous montrer les données que nous détenons sur vous.",
            "Les corriger.",
            "Les supprimer, ou retirer votre profil du site.",
            "Retirer votre consentement ou vous désinscrire de la newsletter.",
          ],
        },
        { p: `Écrivez à ${contactEmail}. Nous répondrons sous 30 jours. Vous pouvez aussi déposer une plainte auprès de l’autorité de protection des données de votre pays.` },
      ],
    },
    {
      title: "Comment nous les protégeons",
      blocks: [
        { p: "Le site utilise une connexion chiffrée (HTTPS). Seule notre équipe peut accéder aux données, et les photos sont vérifiées pour s’assurer qu’il s’agit de vraies images avant d’être enregistrées." },
      ],
    },
    {
      title: "Âge",
      blocks: [{ p: "Nos formulaires s’adressent aux adultes de 18 ans et plus. Certains programmes ont leur propre âge minimum ; la formation numérique, par exemple, est ouverte à partir de 25 ans." }],
    },
    {
      title: "Modifications de cette politique",
      blocks: [{ p: "Si nous changeons la façon dont nous utilisons vos données, nous mettrons à jour cette page et la date indiquée en haut." }],
    },
  ]),
};

const ar: PrivacyContent = {
  meta: {
    title: "سياسة الخصوصية",
    description: "كيف تجمع Bridging Our Voices البيانات الشخصية التي تشاركها عبر النشرة البريدية ونموذج التواصل ونموذج الانضمام، وكيف تستخدمها وتحميها.",
  },
  header: {
    eyebrow: "الخصوصية",
    title: "سياسة الخصوصية",
    lead: "ما نجمعه عبر هذا الموقع، ولماذا نحتاجه، وإلى متى نحتفظ به، وكيف يمكنك الاطلاع عليه أو تعديله أو حذفه.",
  },
  updatedLabel: "آخر تحديث",
  updated: "٢١ نوفمبر ٢٠٢٦",
  tocLabel: "في هذه الصفحة",
  sections: sections([
    {
      title: "من نحن",
      blocks: [
        { p: "Bridging Our Voices منصة للحوار وبناء السلام تؤكد قدرة المرأة على القيادة، تديرها د. أنوار قطايه (الزميلة الرئيسية ومديرة المشروع). نحن المسؤولون عن البيانات الشخصية التي تُجمع عبر هذا الموقع." },
        { p: `لأي سؤال عن بياناتك، راسلنا على ${contactEmail}.` },
      ],
    },
    {
      title: "ما الذي نجمعه",
      blocks: [
        { p: "نجمع فقط ما تكتبه في نماذجنا. ويطلب كل نموذج ما يلي:" },
        { h: "النشرة البريدية" },
        { list: ["بريدك الإلكتروني."] },
        { h: "نموذج التواصل" },
        { list: ["اسمك وبريدك الإلكتروني.", "الموضوع الذي تختاره ورسالتك."] },
        { h: "«ضم صوتك لصوتنا»" },
        {
          list: [
            "اسمك، والنوع، والمسمى الوظيفي، والمؤسسة (اختياري)، والدولة، والبريد الإلكتروني.",
            "ديانتك، والمذهب إذا اخترت ذكره.",
            "مجالات عملك، ومقولتك الداعمة، ومقالًا إذا رغبت.",
            "صورة، إذا اخترت رفعها.",
            "لغة الصفحة التي استخدمتها.",
          ],
        },
        { h: "طلب العضوية" },
        {
          list: [
            "نفس البيانات الشخصية المذكورة أعلاه (الاسم، والنوع، والمسمى الوظيفي، والمؤسسة، والدولة، والبريد الإلكتروني، والديانة، ومجالات العمل).",
            "ملخص خبرتك (حتى ١٥٠ كلمة)، وسيرتك الذاتية (PDF)، وما يدفعك للانضمام إلينا، والأنشطة التي يمكنك تنفيذها معنا، والجهات التي يمكنك أن توصلنا بها إذا رغبت.",
            "صورة، إذا اخترت رفعها.",
          ],
        },
        { h: "حساب المتعلّم (التعلم الإلكتروني)" },
        { list: ["اسمك وبريدك الإلكتروني ودولتك، وكلمة مرور (تُحفظ فقط بصيغة مشفّرة لا يمكن لأحد قراءتها).", "الدورات التي تنضم/ين إليها، والدروس التي تحدّد/ين أنها اكتملت، ونتائج اختبارات الوحدات.", "إذا أكملت ملفك الشخصي: وظيفتك وجهتك وبضعة أسطر عنك. يرى باقي المشاركين في دوراتك اسمك ودولتك وملفك، إلا إذا أخفيته من «ملفي الشخصي»."] },
        { h: "عند زيارتك للموقع" },
        { p: "لا يستخدم هذا الموقع ملفات تعريف ارتباط (كوكيز) إعلانية أو للتتبع، ولا أدوات لتحليل الزيارات. وكأي موقع، قد تسجّل جهة الاستضافة معلومات تقنية (مثل عنوان IP ونوع المتصفح) في سجلات الخادم، لحماية الموقع وضمان عمله." },
      ],
    },
    {
      title: "لماذا نستخدمه",
      blocks: [
        {
          list: [
            "النشرة البريدية: لنرسل إليك أخبار برامجنا وفعالياتنا، بناءً على طلبك.",
            "نموذج التواصل: للرد على رسالتك.",
            "حساب المتعلّم: لإتاحة الدورات التي تنضم/ين إليها، وحفظ تقدّمك، والتواصل معك بشأن الدورة.",
            "طلب الانضمام: لمراجعة طلبك والتواصل معك بشأنه، وإذا انضممت، لربطك بالشبكة. وتعطي موافقتك عندما تضع علامة في المربع قبل الإرسال.",
          ],
        },
        { p: "لا نبيع بياناتك أبدًا، ولا نستخدمها للإعلانات." },
      ],
    },
    {
      title: "الديانة والمعلومات الحساسة",
      blocks: [
        { p: "يطلب نموذج الانضمام ديانتك ونوعك، وهي معلومات حساسة. نطلبها فقط لأن شبكتنا قائمة على الحوار بين الأديان والثقافات، ونريدها متنوعة ومتوازنة." },
        { p: "لا يطّلع على هذه المعلومات إلا فريقنا. نستخدمها لمراجعة الطلبات، ولا ننشرها أبدًا." },
      ],
    },
    {
      title: "ما قد ننشره",
      blocks: [
        { p: "إذا قُبلت مقولتك أو طلبك، قد نعرض على الموقع اسمك ودورك ودولتك وصورتك ومقولتك (أو ملخصًا قصيرًا لخبرتك). ولا نفعل ذلك إلا بعد مراجعة فريقنا وبموافقتك، ويمكنك أن تطلب حذفها في أي وقت. أما سيرتك الذاتية فلا يطّلع عليها إلا فريقنا، ولا تُنشر أبدًا." },
      ],
    },
    {
      title: "من يمكنه رؤية بياناتك",
      blocks: [
        {
          list: [
            "فريق Bridging Our Voices، لأنه يحتاجها للرد عليك أو لمراجعة طلبك.",
            "مقدمو الخدمة الذين يستضيفون موقعنا وبريدنا الإلكتروني، ويعالجون البيانات نيابةً عنا فقط.",
          ],
        },
        { p: "لا نشارك بياناتك مع شركائنا أو مع أي جهة أخرى دون إذنك، إلا إذا ألزمنا القانون بذلك." },
      ],
    },
    {
      title: "مدة الاحتفاظ بالبيانات",
      blocks: [
        {
          list: [
            "النشرة البريدية: حتى تلغي اشتراكك.",
            "رسائل التواصل: حتى ١٢ شهرًا بعد آخر رد منا.",
            "حسابات المتعلّمين والتقدّم في الدورات: حتى تطلب/ين منا حذف حسابك.",
            "طلبات الانضمام: طوال مدة عضويتك. وإذا لم يُقبل الطلب أو سحبته، نحذفه هو والصورة والسيرة الذاتية خلال ٦ أشهر.",
            "سجلات الخادم: للمدة القصيرة التي تحددها جهة الاستضافة.",
          ],
        },
      ],
    },
    {
      title: "حقوقك",
      blocks: [
        { p: "يمكنك في أي وقت أن تطلب منا:" },
        {
          list: [
            "أن نعرض عليك البيانات التي نحتفظ بها عنك.",
            "أن نصححها.",
            "أن نحذفها، أو نحذف ملفك من الموقع.",
            "سحب موافقتك أو إلغاء الاشتراك في النشرة البريدية.",
          ],
        },
        { p: `راسلنا على ${contactEmail}، وسنرد خلال ٣٠ يومًا. ويمكنك أيضًا تقديم شكوى إلى جهة حماية البيانات في بلدك.` },
      ],
    },
    {
      title: "كيف نحميها",
      blocks: [
        { p: "يستخدم الموقع اتصالًا مشفرًا (HTTPS). ولا يصل إلى البيانات إلا فريقنا، ونتحقق من أن الصور المرفوعة صور حقيقية قبل حفظها." },
      ],
    },
    {
      title: "السن",
      blocks: [{ p: "نماذجنا موجهة للبالغين من سن ١٨ عامًا فأكثر. ولبعض البرامج حد أدنى خاص للسن؛ فالدورة التدريبية الرقمية مثلًا لمن هم في سن ٢٥ عامًا فأكثر." }],
    },
    {
      title: "التغييرات على هذه السياسة",
      blocks: [{ p: "إذا غيّرنا طريقة استخدامنا لبياناتك، سنحدّث هذه الصفحة والتاريخ المكتوب في أعلاها." }],
    },
  ]),
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, PrivacyContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getPrivacyContent(locale: Locale): Promise<PrivacyContent> {
  return loadContent("privacy", locale, defaults[locale]);
}
