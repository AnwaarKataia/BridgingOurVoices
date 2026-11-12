"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavEntry = { href: string; label: string; ready: boolean };

/** Section links. Sections not built yet show a "Soon" tag instead of a link. Wraps on small screens. */
export function AdminNav({ items, soon, label }: { items: NavEntry[]; soon: string; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-x-1 gap-y-1 lg:flex-col">
        {items.map((item) => {
          const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const base = "flex items-center justify-between gap-3 rounded-bov px-3 py-2 text-[15px]";
          return (
            <li key={item.href}>
              {item.ready ? (
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`${base} font-medium ${current ? "bg-navy text-on-dark" : "text-ink hover:bg-sand"}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`${base} text-ink-soft`} aria-disabled="true">
                  {item.label}
                  <span className="rounded-bov bg-sand px-1.5 py-0.5 text-[11px] font-semibold text-gold-deep">{soon}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
