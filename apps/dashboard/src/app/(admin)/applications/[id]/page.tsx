import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { ApplicationDecision } from "@/components/ApplicationDecision";

export const metadata: Metadata = { title: "Application" };

type Status = "pending" | "approved" | "rejected";
type Application = {
  id: string;
  name: string;
  gender: string;
  job: string;
  org: string;
  country: string;
  email: string;
  religion: string;
  subreligion: string;
  fields: string[];
  quote: string;
  article: string;
  experience: string;
  motivation: string;
  activities: string;
  locale: string;
  status: Status;
  reviewedAt: string | null;
  reviewerName: string | null;
  createdAt: string;
  hasPhoto: boolean;
  hasCv: boolean;
};
type Option = { value: string; label: string };

const statusTone: Record<Status, string> = {
  pending: "bg-gold/20 text-gold-deep",
  approved: "bg-sky-tint text-blue-deep",
  rejected: "bg-danger/10 text-danger",
};
const langNames: Record<string, string> = { en: "English", fr: "Français", ar: "العربية" };

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, t } = await getDict();
  const [{ data, status }, { data: network }] = await Promise.all([
    apiGet<{ application: Application }>(`/admin/applications/${encodeURIComponent(id)}`),
    // Labels for gender and fields of work, in the dashboard's language, from the site content
    apiGet<{ data: { join: { genders: Option[]; fieldOptions: Option[] } } }>(`/content/network/${lang}`),
  ]);
  if (status === 404) notFound();
  const a = t.apps;
  if (!data) return <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>;

  const app = data.application;
  const loc = lang === "ar" ? "ar-EG" : "en-GB";
  const nf = new Intl.NumberFormat(loc);
  const fmt = new Intl.DateTimeFormat(loc, { dateStyle: "long", timeStyle: "short" });
  const country = new Intl.DisplayNames([lang], { type: "region" }).of(app.country) ?? app.country;
  const label = (opts: Option[] | undefined, v: string) => opts?.find((o) => o.value === v)?.label ?? v;
  const words = app.experience.trim() ? app.experience.trim().split(/\s+/).length : 0;

  const facts: { k: string; v: string; ltr?: boolean }[] = [
    { k: a.labels.email, v: app.email, ltr: true },
    { k: a.labels.gender, v: label(network?.data.join.genders, app.gender) },
    { k: a.labels.job, v: app.job },
    { k: a.labels.org, v: app.org || a.none },
    { k: a.labels.country, v: country },
    { k: a.labels.religion, v: app.religion },
    { k: a.labels.subreligion, v: app.subreligion || a.none },
    { k: a.labels.locale, v: langNames[app.locale] ?? app.locale },
    { k: a.labels.date, v: fmt.format(new Date(app.createdAt)) },
  ];
  // Long answers; the two old-form fields only show for applications sent before 2026-11-14
  const texts = [
    { k: a.labels.experience, v: app.experience, extra: app.experience ? `${nf.format(words)} ${a.words}` : "" },
    { k: a.labels.motivation, v: app.motivation },
    { k: a.labels.activities, v: app.activities },
    { k: a.labels.quote, v: app.quote },
    { k: a.labels.article, v: app.article },
  ].filter((x) => x.v);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/applications" className="self-start text-sm font-semibold text-blue hover:text-navy">
        <span aria-hidden className="me-1 inline-block rtl:-scale-x-100">←</span>
        {a.back}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-h2 font-normal">{app.name}</h1>
        <span className={`rounded-bov px-2 py-1 text-xs font-semibold ${statusTone[app.status]}`}>{a.status[app.status]}</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <dl className="grid gap-px overflow-hidden rounded-bov border border-line bg-line sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.k} className="flex min-w-0 flex-col gap-1 bg-white p-4">
                <dt className="text-xs font-semibold text-ink-soft">{f.k}</dt>
                <dd dir={f.ltr ? "ltr" : undefined} className="break-words font-medium text-ink rtl:text-end">{f.v}</dd>
              </div>
            ))}
            <div className="flex flex-col gap-2 bg-white p-4 sm:col-span-2">
              <dt className="text-xs font-semibold text-ink-soft">{a.labels.fields}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {app.fields.length
                  ? app.fields.map((f) => (
                      <span key={f} className="rounded-full bg-sky-tint px-2.5 py-1 text-xs font-medium text-blue-deep">
                        {label(network?.data.join.fieldOptions, f)}
                      </span>
                    ))
                  : a.none}
              </dd>
            </div>
          </dl>

          {texts.map((x) => (
            <section key={x.k} className="rounded-bov border border-line bg-white p-5">
              <h2 className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm font-semibold text-ink">
                {x.k}
                {x.extra && <span className="text-xs font-normal text-ink-soft">{x.extra}</span>}
              </h2>
              {/* The applicant may write in any language */}
              <p dir="auto" className="whitespace-pre-line leading-relaxed text-ink-soft">{x.v}</p>
            </section>
          ))}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className="flex flex-col gap-3 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">{a.decision}</h2>
            <ApplicationDecision id={app.id} status={app.status} t={a} />
            {app.reviewerName && app.reviewedAt && (
              <p className="text-xs text-ink-soft">
                {a.reviewedBy} {app.reviewerName} · {fmt.format(new Date(app.reviewedAt))}
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-bov border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">{a.cv}</h2>
            {app.hasCv ? (
              <div className="flex flex-wrap gap-2">
                <a href={`/api/admin/applications/${app.id}/cv`} target="_blank" rel="noopener" className="flex h-10 items-center rounded-bov bg-navy px-4 text-sm font-semibold text-on-dark hover:bg-navy-hover">
                  {a.openCv}
                </a>
                <a href={`/api/admin/applications/${app.id}/cv?download=1`} className="flex h-10 items-center rounded-bov border border-line px-4 text-sm font-semibold text-ink hover:border-navy">
                  {a.downloadCv}
                </a>
              </div>
            ) : (
              <p className="text-sm text-ink-soft">{a.noCv}</p>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-bov border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">{a.photo}</h2>
            {app.hasPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element -- private image behind the session cookie
              <img src={`/api/admin/applications/${app.id}/photo`} alt={app.name} className="aspect-square w-full max-w-[240px] rounded-bov object-cover" />
            ) : (
              <p className="text-sm text-ink-soft">{a.noPhoto}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
