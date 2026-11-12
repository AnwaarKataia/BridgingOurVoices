import type { HomeContent } from "@/content/home";

export function Pathway({ pathway }: { pathway: HomeContent["pathway"] }) {
  return (
    <section className="bg-sand" aria-labelledby="pathway-title">
      <div className="container-site py-16 md:py-[88px]">
        <p className="eyebrow mb-3 text-gold-deep">{pathway.eyebrow}</p>
        <h2 id="pathway-title" className="font-display text-h2 font-normal">{pathway.title}</h2>

        <ol className="mt-10 grid border-t border-navy sm:grid-cols-2 lg:grid-cols-4">
          {pathway.steps.map((step) => (
            <li
              key={step.title}
              className="border-b border-line px-5 pt-6 pb-7 sm:odd:border-e lg:border-b-0 lg:border-e lg:last:border-e-0"
            >
              <span className="mb-6 block font-display text-5xl leading-none text-gold">
                {step.num}
              </span>
              <h3 className="mb-1.5 text-h4 font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
