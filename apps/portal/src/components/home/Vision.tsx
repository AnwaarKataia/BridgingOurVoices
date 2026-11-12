import Link from "next/link";
import type { HomeContent } from "@/content/home";
import { textLink } from "../ui";

export function Vision({ vision, aboutHref }: { vision: HomeContent["vision"]; aboutHref: string }) {
  return (
    <section id="about" className="py-20 text-center md:py-[104px]" aria-labelledby="vision-title">
      <div className="container-site">
        <h2 id="vision-title" className="eyebrow mb-4 text-gold-deep">{vision.eyebrow}</h2>
        <p className="mx-auto mb-6 max-w-[960px] font-display text-h2 font-normal text-ink">{vision.quote}</p>
        <Link href={aboutHref} className={textLink}>{vision.link}</Link>
      </div>
    </section>
  );
}
