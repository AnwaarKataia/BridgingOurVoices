import type { Locale } from "@/i18n/config";
import type { PublishedMember } from "@/lib/published";
import { ContentImage } from "../ContentImage";

/** Accepted members the team published from the dashboard (with their consent). Hidden when there are none. */
export function PublishedMembers({ members, title, locale }: { members: PublishedMember[]; title: string; locale: Locale }) {
  if (!members.length) return null;
  const countries = new Intl.DisplayNames([locale], { type: "region" });
  return (
    <section aria-labelledby="network-members-title">
      <div className="container-site flex flex-col gap-8 pb-12 md:pb-20">
        <h2 id="network-members-title" className="font-display text-h2 font-normal text-ink">{title}</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li key={m.id}>
              <article className="flex h-full flex-col gap-3 rounded-bov border border-line bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="relative size-16 flex-none overflow-hidden rounded-full border-[1.6px] border-gold bg-navy">
                    {m.photo ? (
                      <ContentImage src={m.photo} alt="" sizes="64px" />
                    ) : (
                      <span aria-hidden className="flex size-full items-center justify-center font-display text-xl text-on-dark">{m.name.trim().charAt(0)}</span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <h3 dir="auto" className="font-display text-xl leading-snug font-normal text-ink">{m.name}</h3>
                    <span dir="auto" className="text-sm font-semibold text-blue">{m.job}</span>
                    <span className="text-sm text-gold-deep">{countries.of(m.country) ?? m.country}</span>
                  </span>
                </div>
                {m.experience && (
                  <p dir="auto" className="line-clamp-5 text-sm leading-relaxed text-ink-soft">{m.experience}</p>
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
