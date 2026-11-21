import type { Metadata } from "next";
import { getDict } from "@/lib/i18n";
import { Handoff } from "@/components/Handoff";

export const metadata: Metadata = { title: "Signing in", referrer: "no-referrer", robots: { index: false } };

/**
 * Arrival from the website's sign-in (owner, 2026-11-21): the one-time token opens a dashboard session,
 * then the overview opens. An expired or used link leads to the normal sign-in page.
 */
export default async function HandoffPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const { t } = await getDict();
  return <Handoff token={/^[\w-]{20,200}$/.test(token) ? token : ""} t={{ signingIn: t.signingIn, expired: t.forgot.expired, signIn: t.forgot.signIn }} />;
}
