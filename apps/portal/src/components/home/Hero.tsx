import Link from "next/link";
import type { HomeContent } from "@/content/home";
import { btn } from "../ui";

type Props = { hero: HomeContent["hero"]; activitiesHref: string; contactHref: string };

export function Hero({ hero, activitiesHref, contactHref }: Props) {
  return (
    <section className="bg-navy pt-14 pb-16 md:pt-20 md:pb-24" aria-labelledby="hero-title">
      <div className="container-site">
        <p className="eyebrow mb-3 text-gold">{hero.eyebrow}</p>
        <h1 id="hero-title" className="mb-6 font-display text-display font-normal text-on-dark">
          {hero.title}
        </h1>
        <p className="mb-8 max-w-[760px] text-lead text-on-dark-muted">{hero.lead}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={activitiesHref} className={btn.gold}>{hero.primary}</Link>
          <Link href={contactHref} className={btn.outlineLight}>{hero.secondary}</Link>
        </div>
      </div>
    </section>
  );
}
