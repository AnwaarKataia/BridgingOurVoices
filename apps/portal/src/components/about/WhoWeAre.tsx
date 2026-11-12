import type { AboutContent } from "@/content/about";

export function WhoWeAre({ who }: { who: AboutContent["who"] }) {
  return (
    <section id="who" aria-labelledby="who-title">
      <div className="container-site grid gap-x-[72px] gap-y-10 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-3.5">
          <p className="eyebrow text-gold-deep">{who.eyebrow}</p>
          <h2 id="who-title" className="font-display text-h2-lg font-normal text-ink">{who.title}</h2>
        </div>

        <div className="flex flex-col gap-[18px] text-body-lg text-ink-soft">
          {who.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="m-0">{p}</p>
          ))}

          <h3 className="eyebrow mt-1.5 text-tag text-gold-deep">{who.partnersLabel}</h3>
          <ul className="flex flex-wrap gap-2.5">
            {who.partners.map((partner) => (
              <li key={partner} className="rounded-bov border border-line-strong bg-white px-3 py-[7px] text-sm leading-[1.4] text-ink">
                {partner}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
