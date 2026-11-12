import type { Observance } from "@/content/agenda";

const noon = (iso: string) => new Date(`${iso}T12:00:00`);

/** Day number and short month for a date chip, in the page's language and digits. */
export function chipParts(iso: string, loc: string) {
  const d = noon(iso);
  return {
    day: new Intl.NumberFormat(loc).format(d.getDate()),
    month: new Intl.DateTimeFormat(loc, { month: "short" }).format(d),
  };
}

/**
 * Chip text for an international day (any year; a non-leap year is used for display).
 * Weeks inside one month show "1–7"; campaigns that cross months show the first day and both months,
 * and `range` gives the full span ("25 Nov – 10 Dec") for the row's second line.
 */
export function observanceParts(o: Observance, loc: string) {
  const start = noon(`2027-${o.start}`);
  const nf = new Intl.NumberFormat(loc);
  const month = (d: Date) => new Intl.DateTimeFormat(loc, { month: "short" }).format(d);
  if (!o.end) return { day: nf.format(start.getDate()), month: month(start), range: undefined };
  const end = noon(`2027-${o.end}`);
  // Joined by hand: formatRange() spacing differs between Node and browsers, which breaks hydration
  const long = new Intl.DateTimeFormat(loc, { day: "numeric", month: "long" });
  const range = `${long.format(start)} – ${long.format(end)}`;
  if (start.getMonth() === end.getMonth()) {
    return { day: `${nf.format(start.getDate())}–${nf.format(end.getDate())}`, month: month(start), range };
  }
  return { day: nf.format(start.getDate()), month: `${month(start)}–${month(end)}`, range };
}
