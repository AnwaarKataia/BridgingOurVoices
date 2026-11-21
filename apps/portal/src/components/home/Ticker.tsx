import type { HomeContent } from "@/content/home";

/** News ticker; every item opens the News page (owner, 2026-11-21). */
export function Ticker({ ticker, href }: { ticker: HomeContent["ticker"]; href: string }) {
  // Items are rendered twice so the -50% animation loops seamlessly.
  const loop = [...ticker.items, ...ticker.items];

  return (
    <div>
      <div className="bg-rule h-1" />
      <div className="group flex overflow-hidden border-b border-line bg-paper" role="region" aria-label={ticker.label}>
        <span className="eyebrow relative z-10 flex flex-none items-center border-e border-gold bg-paper px-6 font-semibold text-gold-deep">
          {ticker.label}
        </span>
        <ul className="flex animate-tick gap-12 py-3.5 ps-6 whitespace-nowrap group-hover:[animation-play-state:paused] rtl:animate-tick-rtl motion-reduce:animate-none">
          {loop.map((item, i) => (
            <li key={i} aria-hidden={i >= ticker.items.length} className="flex items-center gap-12 text-[15px] text-ink">
              <a href={href} tabIndex={i >= ticker.items.length ? -1 : undefined} className="hover:text-blue hover:underline">
                {item}
              </a>
              <span aria-hidden className="text-[0.7em] text-gold">◆</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
