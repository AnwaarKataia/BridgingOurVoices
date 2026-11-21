"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "./learn/Avatar";

type Me = { id: string; name: string; email: string; hasPhoto: boolean };

/**
 * Top-bar account link (owner, 2026-11-21). Signed out: «تسجيل الدخول» (one sign-in: the team goes on to the
 * dashboard, participants to their page). Signed in as a participant: their photo and email, opening their
 * own page. Checked in the browser, so pages stay cached for everyone else.
 */
export function AccountLink({ locale, signIn }: { locale: string; signIn: string }) {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    fetch("/learn-api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { learner?: Me } | null) => setMe(d?.learner ?? null))
      .catch(() => undefined);
  }, []);

  if (me) {
    return (
      <Link href={`/${locale}/learn/people/${me.id}`} className="inline-flex min-w-0 items-center gap-2 rounded-bov px-1 text-label font-semibold text-on-dark-soft hover:text-gold" title={me.name}>
        <Avatar id={me.id} name={me.name} hasPhoto={me.hasPhoto} size={26} />
        <span dir="ltr" className="max-w-[46vw] truncate sm:max-w-[260px]">{me.email}</span>
      </Link>
    );
  }
  return (
    <Link href={`/${locale}/learn/login`} className="inline-flex h-7 items-center gap-1.5 rounded-bov px-2 text-label font-semibold text-on-dark-soft hover:text-gold">
      <svg aria-hidden viewBox="0 0 24 24" className="size-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
      </svg>
      {signIn}
    </Link>
  );
}
