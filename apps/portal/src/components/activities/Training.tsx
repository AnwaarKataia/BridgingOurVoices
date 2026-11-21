import type { ActivitiesContent } from "@/content/activities";
import { btn } from "../ui";
import { ContentImage } from "../ContentImage";

type Props = Pick<ActivitiesContent, "course" | "flagship" | "tracks">;

/** Training programmes page body: current course card, flagship interfaith programme, other tracks. */
export function Training({ course, flagship, tracks, ctaHref, newsHref }: Props & { ctaHref: string; newsHref: string }) {
  return (
    <section>
      <div className="container-site flex flex-col gap-8 py-12 md:gap-10 md:py-20">

        {/* Current programme */}
        <article
          id="course"
          aria-labelledby="course-title"
          className="grid gap-x-16 gap-y-10 rounded-bov border border-t-4 border-line border-t-gold bg-white p-6 sm:p-10 lg:grid-cols-2 lg:px-[51px] lg:py-12"
        >
          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-bov bg-navy px-2.5 py-1 font-mono text-tag tracking-label text-on-dark uppercase rtl:font-sans rtl:tracking-normal">
                {course.badge}
              </span>
              <span className="text-sm font-semibold text-gold-deep">{course.deadline}</span>
            </div>
            <h2 id="course-title" className="font-display text-feature font-normal text-ink">{course.title}</h2>
            <p className="m-0 text-body-lg text-ink-soft">{course.body}</p>
            <p className="m-0 text-[15px] font-medium text-ink">{course.eligibility}</p>

            <div className="flex flex-col gap-2.5 rounded-bov bg-paper p-5">
              <h4 className="text-[15px] font-semibold text-ink">{course.whyTitle}</h4>
              <ul className="flex flex-col gap-2.5">
                {course.why.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-soft">
                    <span aria-hidden className="text-gold">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href={ctaHref} className={`${btn.gold.replace("whitespace-nowrap", "")} h-auto min-h-[52px] max-w-full py-2.5 text-center`}>{course.cta}</a>
              {course.newsLink && (
                <a href={newsHref} className="text-[15px] font-semibold text-blue underline underline-offset-4 hover:text-navy">
                  {course.newsLink}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <h4 className="eyebrow text-tag text-gold-deep">{course.modulesLabel}</h4>
            <ol className="border-t border-navy">
              {course.modules.map((m) => (
                <li key={m.num} className="flex gap-4 border-b border-line py-3.5">
                  <span aria-hidden className="min-w-5 font-display text-xl leading-snug text-gold">{m.num}</span>
                  <span className="text-base leading-relaxed text-ink">{m.text}</span>
                </li>
              ))}
            </ol>
            <p className="m-0 flex gap-2.5 text-[15px] font-medium text-blue">
              <span aria-hidden>+</span>
              <span>{course.extra}</span>
            </p>
          </div>
        </article>

        {/* Flagship programme: interfaith dialogue */}
        <article
          aria-labelledby="flagship-title"
          className="grid gap-x-16 gap-y-10 rounded-bov bg-navy-raised p-6 sm:p-10 lg:grid-cols-2 lg:px-[51px] lg:py-14"
        >
          <div className="flex flex-col gap-5">
            <p className="eyebrow flex items-center gap-3 text-gold">
              <span aria-hidden className="h-px w-7 bg-gold" />
              {flagship.eyebrow}
            </p>
            <h2 id="flagship-title" className="font-display text-h2-lg font-normal text-on-dark">{flagship.title}</h2>
            <p className="m-0 text-body-lg text-on-dark-muted">{flagship.body}</p>

            <ol className="border-t border-navy-divider">
              {flagship.steps.map((s) => (
                <li key={s.num} className="flex gap-5 border-b border-navy-divider py-4">
                  <span aria-hidden className="min-w-8 font-display text-num leading-tight text-gold">{s.num}</span>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[17px] font-semibold text-on-dark">{s.title}</h4>
                    <p className="m-0 text-[15px] leading-relaxed text-on-dark-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="flex flex-wrap gap-2">
              {flagship.tags.map((tag) => (
                <li key={tag} dir="ltr" className="rounded-full border border-gold px-3 py-1.5 text-label text-gold-pale">{tag}</li>
              ))}
            </ul>
          </div>

          {/* Arched photo (striped placeholder until one is set in the dashboard) with the quote card over it */}
          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
            {flagship.image ? (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[200px] rounded-b-bov border border-navy-divider">
                <ContentImage src={flagship.image} alt={flagship.photoAlt} sizes="(min-width: 1024px) 560px, 420px" />
              </div>
            ) : (
              <div
                role="img"
                aria-label={flagship.photoAlt}
                className="bg-stripes-dark aspect-[4/5] w-full rounded-t-[200px] rounded-b-bov border border-navy-divider"
              />
            )}
            <blockquote className="absolute inset-x-4 bottom-6 m-0 rounded-bov border-t-[2.4px] border-sky bg-paper px-[22px] py-[18px] sm:inset-x-auto sm:start-[-24px] sm:max-w-[320px]">
              <p className="m-0 font-display text-[19px] leading-snug text-ink">{flagship.quote}</p>
            </blockquote>
          </div>
        </article>

        {/* Other training tracks */}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t) => (
            <li key={t.num}>
              <article className="flex h-full flex-col gap-3.5 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-7 lg:min-h-[250px]">
                <span className="font-mono text-tag text-gold-deep">{t.num}</span>
                <h3 className="font-display text-[1.4375rem] leading-tight font-normal text-ink">{t.title}</h3>
                <p className="m-0 text-[15px] leading-relaxed text-ink-soft">{t.body}</p>
                <span dir="ltr" className="mt-auto self-start rounded-full bg-sky-tint px-3 py-[5px] text-label text-blue-deep">{t.tag}</span>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
