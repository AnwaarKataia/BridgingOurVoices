import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { isPublishedLocale } from "@/i18n/config";
import { contactEmail } from "@/content/contact";
import { getPrivacyContent, type PrivacyBlock } from "@/content/privacy";
import { getSiteContent } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  return pageMetadata(locale, "/privacy", (await getPrivacyContent(locale)).meta);
}

/** Turns the contact email inside a sentence into a mailto link. */
function withEmailLink(text: string): ReactNode {
  const parts = text.split(contactEmail);
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a key={i} href={`mailto:${contactEmail}`} dir="ltr" className="font-semibold text-blue underline-offset-4 hover:text-navy hover:underline">
            {contactEmail}
          </a>,
          part,
        ],
  );
}

function Block({ block }: { block: PrivacyBlock }) {
  if ("h" in block) return <h3 className="mt-2 text-base font-semibold text-ink">{block.h}</h3>;
  if ("list" in block)
    return (
      <ul className="flex list-disc flex-col gap-2 ps-5 marker:text-gold">
        {block.list.map((item) => (
          <li key={item}>{withEmailLink(item)}</li>
        ))}
      </ul>
    );
  return <p>{withEmailLink(block.p)}</p>;
}

export default async function PrivacyPage({ params }: Params) {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) notFound();
  const c = await getPrivacyContent(locale);
  const site = await getSiteContent(locale);
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;
  const pageUrl = `${siteUrl}/${locale}/privacy`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", url: pageUrl, name: c.meta.title, inLanguage: locale, dateModified: "2026-11-06", about: { "@id": `${siteUrl}/#organization` } },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
          { "@type": "ListItem", position: 2, name: c.meta.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <PageShell locale={locale} path="/privacy" current="privacy">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} lead={c.header.lead} />
      <section>
        <div className="container-site grid gap-x-16 gap-y-10 pt-12 pb-16 md:pt-[72px] md:pb-24 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav aria-labelledby="toc-title" className="lg:sticky lg:top-36 lg:self-start">
            <p id="toc-title" className="eyebrow mb-3 text-gold-deep">{c.tocLabel}</p>
            <ol className="flex flex-col border-s border-line">
              {c.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 text-sm text-ink-soft hover:border-gold hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="flex max-w-[760px] flex-col gap-10">
            <p className="text-sm text-ink-soft">
              {c.updatedLabel}: <time dateTime="2026-11-06">{c.updated}</time>
            </p>
            {c.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="flex flex-col gap-4 border-t border-line pt-8 text-body leading-relaxed text-ink-soft">
                <h2 id={`${s.id}-title`} className="font-display text-h2 font-normal text-ink">{s.title}</h2>
                {s.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </section>
            ))}
          </article>
        </div>
      </section>
    </PageShell>
  );
}
