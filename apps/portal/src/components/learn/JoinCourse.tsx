"use client";

import Link from "next/link";
import { useState } from "react";
import type { ActivitiesContent } from "@/content/activities";
import { btn } from "../ui";

type State = { signedIn: boolean; joined: boolean; removed: boolean; open: boolean };

/**
 * Joining a course with a learner account (e-learning phase 2, 2026-11-21). Shown in the #register
 * section of a published course page; the join also appears in the dashboard's registrations.
 */
export function JoinCourse({
  slug,
  locale,
  state,
  t,
  closed,
}: {
  slug: string;
  locale: string;
  state: State;
  t: ActivitiesContent["elearning"]["learn"];
  closed: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const player = `/${locale}/learn/course/${slug}`;
  const back = `/${locale}/e-learning/${slug}#register`;

  async function join() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/learn-api/courses/${slug}/join`, { method: "POST" });
      if (res.ok) {
        window.location.href = player;
        return;
      }
      setError(res.status === 409 ? closed : res.status === 403 ? t.removed : t.errors.generic);
    } catch {
      setError(t.errors.generic);
    }
    setBusy(false);
  }

  if (state.removed) return <p className="m-0 rounded-bov border border-line bg-sand p-5 text-ink">{t.removed}</p>;
  if (state.joined) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-6">
        <p className="m-0 font-semibold text-ink">✓ {t.joined}</p>
        <Link href={player} className={btn.navy}>{t.goToCourse}</Link>
      </div>
    );
  }
  if (!state.open) return <p className="m-0 rounded-bov border border-line bg-sand p-5 text-ink">{closed}</p>;
  if (!state.signedIn) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-6">
        <p className="m-0 text-ink-soft">{t.joinLead}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/learn/signup?next=${encodeURIComponent(back)}`} className={btn.gold}>{t.joinSignup}</Link>
          <Link href={`/${locale}/learn/login?next=${encodeURIComponent(back)}`} className={btn.outlineDark}>{t.joinLogin}</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-3 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-6">
      <button type="button" disabled={busy} onClick={join} className={`${btn.navy} disabled:opacity-60`}>
        {busy ? t.joining : t.join}
      </button>
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </div>
  );
}
