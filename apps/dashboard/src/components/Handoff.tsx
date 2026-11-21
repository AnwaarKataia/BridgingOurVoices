"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/** Exchanges the website's one-time sign-in token for a dashboard session, then opens the overview. */
export function Handoff({ token, t }: { token: string; t: { signingIn: string; expired: string; signIn: string } }) {
  const [failed, setFailed] = useState(!token);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    // Drop the token from the address bar and history right away
    window.history.replaceState(null, "", "/handoff");
    fetch("/api/auth/handoff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then((res) => (res.ok ? window.location.replace("/") : setFailed(true)))
      .catch(() => setFailed(true));
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      {failed ? (
        <div className="flex max-w-[420px] flex-col items-center gap-4 text-center">
          <p className="m-0 text-ink">{t.expired}</p>
          <Link href="/login" className="inline-flex h-11 items-center rounded-bov bg-navy px-5 text-sm font-semibold text-on-dark hover:bg-navy-hover">
            {t.signIn}
          </Link>
        </div>
      ) : (
        <p role="status" className="m-0 text-ink-soft">{t.signingIn}</p>
      )}
    </main>
  );
}
