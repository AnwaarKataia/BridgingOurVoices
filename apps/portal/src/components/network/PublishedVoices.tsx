import type { Locale } from "@/i18n/config";
import type { PublishedVoice } from "@/lib/published";
import { ContentImage } from "../ContentImage";

/**
 * "Add your voice to ours" statements the team published from the dashboard (with the sender's consent).
 * Hidden when there are none.
 */
export function PublishedVoices({ voices, title, readArticle, locale }: { voices: PublishedVoice[]; title: string; readArticle: string; locale: Locale }) {
  if (!voices.length) return null;
  const countries = new Intl.DisplayNames([locale], { type: "region" });
  return (
    <section aria-labelledby="voices-title" className="bg-sand">
      <div className="container-site flex flex-col gap-8 py-12 md:py-20">
        <h2 id="voices-title" className="font-display text-h2 font-normal text-ink">{title}</h2>
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {voices.map((v) => (
            <li key={v.id}>
              <figure className="flex h-full flex-col gap-4 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-6">
                <blockquote dir="auto" className="m-0 font-display text-[19px] leading-relaxed text-ink">
                  “{v.quote}”
                </blockquote>
                {v.article && (
                  <details className="text-sm text-ink-soft">
                    <summary className="cursor-pointer font-semibold text-blue hover:text-navy">{readArticle}</summary>
                    <p dir="auto" className="mt-2 whitespace-pre-line leading-relaxed">{v.article}</p>
                  </details>
                )}
                <figcaption className="mt-auto flex items-center gap-3 border-t border-line pt-4">
                  <span className="relative size-12 flex-none overflow-hidden rounded-full border-[1.6px] border-gold bg-navy">
                    {v.photo ? (
                      <ContentImage src={v.photo} alt="" sizes="48px" />
                    ) : (
                      <span aria-hidden className="flex size-full items-center justify-center font-display text-lg text-on-dark">{v.name.trim().charAt(0)}</span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span dir="auto" className="font-semibold text-ink">{v.name}</span>
                    <span dir="auto" className="text-sm text-ink-soft">
                      {[v.job, countries.of(v.country) ?? v.country].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
