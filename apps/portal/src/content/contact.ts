import type { Locale } from "@/i18n/config";
import { loadContent } from "@/lib/content";

/**
 * Contact page copy, taken from the brand file's Contact page (EN / FR / AR modes).
 * The brand file shows placeholder phone (+00 000 000 0000) and address (City, Country):
 * add `phone` / `address` here once the owner provides real ones — they render automatically.
 */
export type ContactContent = {
  meta: { title: string; description: string };
  header: { eyebrow: string; title: string; lead: string };
  form: {
    name: string;
    email: string;
    topic: string;
    topics: { value: string; label: string }[];
    message: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
  info: {
    emailLabel: string;
    phoneLabel: string;
    phone?: string;
    addressLabel: string;
    address?: string;
    followLabel: string;
  };
};

/** Shared by every language. */
export const contactEmail = "b.our.voices@gmail.com";
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/bridging-our-voices" },
  { label: "Facebook", href: "https://www.facebook.com/Bourvoice" },
];

const topicValues = ["general", "training", "fellowship", "partnerships", "media"] as const;
const topics = (labels: [string, string, string, string, string]) =>
  topicValues.map((value, i) => ({ value, label: labels[i] }));

const en: ContactContent = {
  meta: {
    title: "Contact us",
    description:
      "Questions about the Bridging Our Voices programmes, partnerships or media? Send us a message and we’ll get back to you.",
  },
  header: {
    eyebrow: "Contact us",
    title: "Let’s talk",
    lead: "Questions about the programmes, partnerships or media? Send us a message and we’ll get back to you.",
  },
  form: {
    name: "Full name",
    email: "Email",
    topic: "Subject",
    topics: topics(["General enquiry", "Training programmes", "Fellowship", "Partnerships", "Media"]),
    message: "Message",
    submit: "Send message",
    sending: "Sending…",
    success: "Thank you, your message has been sent. We’ll get back to you soon.",
    error: "Something went wrong, please try again or email us directly.",
  },
  info: { emailLabel: "Email", phoneLabel: "Phone", addressLabel: "Address", followLabel: "Follow us" },
};

const fr: ContactContent = {
  meta: {
    title: "Contact",
    description:
      "Une question sur les programmes de Bridging Our Voices, les partenariats ou la presse ? Écrivez-nous, nous vous répondrons.",
  },
  header: {
    eyebrow: "Contact",
    title: "Parlons-en",
    lead: "Une question sur les programmes, les partenariats ou la presse ? Écrivez-nous, nous vous répondrons.",
  },
  form: {
    name: "Nom complet",
    email: "E-mail",
    topic: "Objet",
    topics: topics(["Demande générale", "Programmes de formation", "Bourse", "Partenariats", "Presse"]),
    message: "Message",
    submit: "Envoyer",
    sending: "Envoi…",
    success: "Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.",
    error: "Une erreur s’est produite, veuillez réessayer ou nous écrire directement.",
  },
  info: { emailLabel: "E-mail", phoneLabel: "Téléphone", addressLabel: "Adresse", followLabel: "Suivez-nous" },
};

const ar: ContactContent = {
  meta: {
    title: "تواصل معنا",
    description: "لديك سؤال عن برامج Bridging Our Voices أو الشراكات أو الإعلام؟ أرسل/ي رسالتك وسنعود إليك.",
  },
  header: {
    eyebrow: "تواصل معنا",
    title: "يسعدنا تواصلك",
    lead: "لديك سؤال عن البرامج أو الشراكات أو الإعلام؟ أرسل/ي رسالتك وسنعود إليك.",
  },
  form: {
    name: "الاسم بالكامل",
    email: "البريد الإلكتروني",
    topic: "الموضوع",
    topics: topics(["استفسار عام", "البرامج التدريبية", "الزمالة", "الشراكات", "الإعلام"]),
    message: "الرسالة",
    submit: "إرسال الرسالة",
    sending: "جارٍ الإرسال…",
    success: "شكرًا لكِ، تم إرسال رسالتك وسنعود إليكِ قريبًا.",
    error: "حدث خطأ، يُرجى المحاولة مرة أخرى أو مراسلتنا مباشرة عبر البريد الإلكتروني.",
  },
  info: { emailLabel: "البريد الإلكتروني", phoneLabel: "الهاتف", addressLabel: "العنوان", followLabel: "تابعونا" },
};

/** Built-in copy: seeds the database and is the fallback when the API can't be reached. */
export const defaults: Record<Locale, ContactContent> = { en, fr, ar };

/** Published content from the dashboard (database), merged over the built-in copy. */
export async function getContactContent(locale: Locale): Promise<ContactContent> {
  return loadContent("contact", locale, defaults[locale]);
}
