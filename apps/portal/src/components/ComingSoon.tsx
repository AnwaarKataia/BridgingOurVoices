import Link from "next/link";
import { btn } from "./ui";

/** "Coming soon" panel shown instead of a section that isn't public yet (owner, 2026-11-21). */
export function ComingSoon({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) {
  return (
    <section className="bg-sand">
      <div className="container-site py-12 md:py-20">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white px-6 py-12 text-center md:px-12">
          <h2 className="font-display text-h2 font-normal text-ink">{title}</h2>
          <p className="m-0 text-lead leading-relaxed text-ink-soft">{body}</p>
          <Link href={href} className={`${btn.outlineDark} mt-2`}>
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
