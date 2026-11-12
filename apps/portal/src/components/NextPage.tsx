import Link from "next/link";

type Tab = { label: string; href: string; current: boolean };

/** "Next: <page> →" link at the bottom of a section sub-page. Renders nothing on the last page. */
export function NextPage({ tabs, label }: { tabs: Tab[]; label: string }) {
  const i = tabs.findIndex((t) => t.current);
  const next = i >= 0 ? tabs[i + 1] : undefined;
  if (!next) return null;

  return (
    <div className="border-t border-line">
      <div className="container-site flex justify-end py-8">
        <Link href={next.href} className="group flex flex-col items-end gap-1 text-end">
          <span className="eyebrow text-gold-deep">{label}</span>
          <span className="flex items-center gap-2 font-display text-card text-ink transition group-hover:text-blue">
            {next.label}
            <span aria-hidden className="text-sky rtl:-scale-x-100">→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
