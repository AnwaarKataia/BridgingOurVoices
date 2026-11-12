import type { NetworkContent } from "@/content/network";

/** Membership page body: who can join / what you gain / what we ask. */
export function Membership({ membership }: { membership: NetworkContent["membership"] }) {
  return (
    <section>
      <div className="container-site py-12 md:py-20">
        <ul className="grid gap-4 md:grid-cols-3">
          {membership.columns.map((col) => (
            <li key={col.title} className="flex flex-col gap-3.5 rounded-bov border border-t-[2.4px] border-line border-t-navy bg-white p-6 sm:p-7">
              <h2 className="font-display text-2xl font-normal text-ink">{col.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-soft">
                    <span aria-hidden className="text-gold">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
