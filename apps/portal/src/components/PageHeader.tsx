import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Tabs to the sibling pages of this section (About, Activities); the current one is highlighted. */
  tabs?: { label: string; href: string; current: boolean }[];
  tabsLabel?: string;
};

/** Navy title band at the top of inner pages. */
export function PageHeader({ eyebrow, title, lead, tabs, tabsLabel }: Props) {
  return (
    <>
      <section className="bg-navy" aria-labelledby="page-title">
        <div className="container-site flex flex-col gap-[18px] pt-12 pb-10 md:pt-[72px] md:pb-16">
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 id="page-title" className="max-w-[860px] font-display text-page font-normal text-on-dark">{title}</h1>
          {lead && <p className="max-w-[680px] text-lead text-on-dark-muted">{lead}</p>}
          {tabs && tabs.length > 0 && (
            <nav aria-label={tabsLabel} className="mt-1.5">
              <ul className="flex flex-wrap gap-2.5">
                {tabs.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      aria-current={t.current ? "page" : undefined}
                      className={`flex h-10 items-center rounded-bov border px-[18px] text-[15px] font-medium transition ${
                        t.current
                          ? "border-gold bg-gold text-navy"
                          : "border-navy-line text-on-dark hover:border-gold hover:text-gold"
                      }`}
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>
      <div className="bg-rule h-1" />
    </>
  );
}
