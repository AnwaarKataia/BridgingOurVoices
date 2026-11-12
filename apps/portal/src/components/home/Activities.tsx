import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { HomeContent } from "@/content/home";
import { localizeHref } from "@/content/site";

export function Activities({ locale, activities }: { locale: Locale; activities: HomeContent["activities"] }) {
  return (
    <section id="activities" className="py-16 md:py-[88px]" aria-labelledby="activities-title">
      <div className="container-site">
        <h2 id="activities-title" className="mb-10 font-display text-h2 font-normal">{activities.title}</h2>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.items.map((item, i) => (
            <li key={item.title}>
              <Link
                href={localizeHref(locale, item.href)}
                className="flex h-full flex-col gap-3 rounded-bov border-t-[2.4px] border-gold bg-navy p-7 text-on-dark-muted transition hover:-translate-y-[3px] hover:text-on-dark-muted hover:shadow-bov"
              >
                <span className="font-mono text-tag text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-card font-normal text-on-dark">{item.title}</h3>
                <p className="text-sm leading-relaxed">{item.body}</p>
                <span aria-hidden className="mt-auto pt-3 text-lg text-sky rtl:-scale-x-100">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
