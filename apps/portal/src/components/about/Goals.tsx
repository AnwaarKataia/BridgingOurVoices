import type { AboutContent } from "@/content/about";

/** Numbered list of the five strategic objectives (the page title carries the heading). */
export function Goals({ goals }: { goals: AboutContent["goals"] }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-site">
        <ol className="max-w-[860px] border-t border-navy">
          {goals.items.map((goal) => (
            <li key={goal.num} className="flex gap-5 border-b border-line py-5 md:gap-8 md:py-6">
              <span aria-hidden className="min-w-10 font-display text-h3 leading-none text-gold">{goal.num}</span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg leading-[1.45] font-semibold text-ink md:text-xl">{goal.title}</h2>
                <p className="m-0 text-base leading-[1.7] text-ink-soft">{goal.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
