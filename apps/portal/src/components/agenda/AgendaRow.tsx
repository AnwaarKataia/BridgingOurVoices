import type { AgendaTone } from "@/content/agenda";

/** Date-chip colour per kind of item (brand file: deadline red, series blue, events navy; international days gold). */
const chipTone: Record<AgendaTone, string> = {
  deadline: "bg-danger text-on-dark",
  series: "bg-blue text-on-dark",
  event: "bg-navy text-on-dark",
  observance: "bg-gold text-navy",
};
const monthTone: Record<AgendaTone, string> = {
  deadline: "text-gold-pale",
  series: "text-gold-pale",
  event: "text-gold",
  observance: "text-navy",
};

type Props = {
  day: string;
  month: string;
  kind: string;
  title: string;
  place?: string;
  tone: AgendaTone;
  /** "lg" is the full upcoming list, "md" the list beside the calendar. */
  size?: "md" | "lg";
  /** Machine-readable date for <time>. */
  dateTime?: string;
  /** Title link: an event page, or (external) the official UN page, opened in a new tab. */
  href?: string;
  external?: boolean;
};

/** One row of an agenda list: date chip + kind, title and place. */
export function AgendaRow({ day, month, kind, title, place, tone, size = "md", dateTime, href, external }: Props) {
  const lg = size === "lg";
  const titleClass = `leading-[1.45] font-semibold text-ink ${lg ? "text-[17px]" : "text-base"}`;
  return (
    <div className={`grid items-center border-b border-line ${lg ? "grid-cols-[76px_minmax(0,1fr)] gap-5 py-5" : "grid-cols-[64px_minmax(0,1fr)] gap-4 py-4"}`}>
      <time
        dateTime={dateTime}
        className={`flex flex-col items-center rounded-bov px-1 text-center leading-[1.15] ${lg ? "py-2.5" : "py-2"} ${chipTone[tone]}`}
      >
        {/* Ranges ("1–7") use a smaller size so they fit the chip */}
        <span className={`font-display whitespace-nowrap ${day.length > 3 ? "text-[17px]" : lg ? "text-[26px]" : "text-[22px]"}`}>{day}</span>
        <span className={`text-[11px] uppercase ${monthTone[tone]}`}>{month}</span>
      </time>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">{kind}</span>
        {href ? (
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`${titleClass} underline decoration-line decoration-1 underline-offset-4 transition hover:text-blue hover:decoration-blue`}
          >
            {title}
            {external && <span aria-hidden className="ms-1 inline-block text-[0.8em] text-gold-deep rtl:-scale-x-100">↗</span>}
          </a>
        ) : (
          <span className={titleClass}>{title}</span>
        )}
        {place && <span className="text-[13px] text-ink-soft">{place}</span>}
      </div>
    </div>
  );
}
