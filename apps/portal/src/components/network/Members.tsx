import type { ReactNode } from "react";
import Link from "next/link";
import { ContentImage } from "../ContentImage";
import type { NetworkContent } from "@/content/network";
import { btn } from "../ui";

/** Decorative mosaic tiles (as in the brand file) until member photos are collected. */
const tileShades = ["bg-navy-raised", "bg-navy-deep", "bg-navy-divider/60", "bg-navy-divider", "bg-navy-line/60"];

/** Our members page body: team cards with arched portraits, then the "Our network" band. */
export function Members({ members, joinHref, published }: { members: NetworkContent["members"]; joinHref: string; published?: ReactNode }) {
  return (
    <>
      <section>
        <div className="container-site py-12 md:py-20">
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
            {members.people.map((p) => (
              <li key={p.name}>
                <article className="flex flex-col gap-3">
                  <div className="relative aspect-square w-full max-w-[420px] overflow-hidden rounded-t-[160px] rounded-b-bov border-[2.4px] border-gold bg-navy">
                    {p.image ? (
                      <ContentImage src={p.image} alt={p.name} sizes="(min-width: 640px) 420px, 100vw" />
                    ) : (
                      <div aria-hidden className="bg-stripes-dark absolute inset-0" />
                    )}
                  </div>
                  <h2 className="font-display text-[22px] leading-snug font-normal text-ink">{p.name}</h2>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold text-blue">{p.role}</span>
                    <span className="text-sm font-semibold text-gold-deep">{p.country}</span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {p.bio.map((line) => (
                      <li key={line.slice(0, 30)} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
                        <span aria-hidden className="text-gold">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Accepted members published from the dashboard (hidden when none) */}
      {published}

      <section className="bg-navy" aria-labelledby="network-band-title">
        <div className="container-site flex flex-col gap-8 py-14 md:py-[88px]">
          <div className="flex max-w-[680px] flex-col gap-2.5">
            <h2 id="network-band-title" className="font-display text-h3 font-normal text-on-dark">{members.networkTitle}</h2>
            <p className="m-0 text-body-lg text-on-dark-muted">{members.networkLead}</p>
          </div>
          <div aria-hidden className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className={`aspect-square rounded-bov ${tileShades[i % tileShades.length]} ${i >= 18 ? "hidden sm:block" : ""}`} />
            ))}
          </div>
          <Link href={joinHref} className={`${btn.gold} self-start text-[15px]`}>{members.networkCta}</Link>
        </div>
      </section>
    </>
  );
}
