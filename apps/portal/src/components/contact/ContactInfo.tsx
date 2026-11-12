import { contactEmail, socialLinks, type ContactContent } from "@/content/contact";

/** Contact details column: email, phone and address (only when provided), social links. */
export function ContactInfo({ info }: { info: ContactContent["info"] }) {
  const rows = [
    { label: info.emailLabel, value: <a href={`mailto:${contactEmail}`} dir="ltr" className="break-all text-ink hover:text-blue">{contactEmail}</a> },
    info.phone ? { label: info.phoneLabel, value: <a href={`tel:${info.phone.replace(/\s/g, "")}`} dir="ltr" className="text-ink hover:text-blue">{info.phone}</a> } : null,
    info.address ? { label: info.addressLabel, value: <span>{info.address}</span> } : null,
  ].filter((r): r is { label: string; value: React.ReactElement } => r !== null);

  return (
    <div className="border-t border-navy">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-1.5 border-b border-line py-[22px]">
          <span className="eyebrow text-tag text-gold-deep">{r.label}</span>
          <span className="text-lg font-medium text-ink">{r.value}</span>
        </div>
      ))}
      <div className="flex flex-col gap-3 py-[22px]">
        <span className="eyebrow text-tag text-gold-deep">{info.followLabel}</span>
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center rounded-bov border border-navy px-[18px] text-sm font-semibold text-navy transition hover:bg-navy hover:text-on-dark"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
