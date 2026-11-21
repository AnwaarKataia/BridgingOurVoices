import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { AuthCard } from "@/components/AuthCard";
import { ForgotForm } from "@/components/ForgotForm";

export const metadata: Metadata = { title: "Forgot password" };

/** Forgot password (owner, 2026-11-21): emails a one-time link valid for one hour. */
export default async function ForgotPage() {
  if (await getCurrentUser()) redirect("/");
  const { lang, t } = await getDict();
  return (
    <AuthCard lang={lang} langLabel={t.langSwitch} dashboard={t.dashboard} title={t.forgot.title} lead={t.forgot.lead}>
      <ForgotForm lang={lang} t={{ email: t.email, submit: t.forgot.submit, sending: t.forgot.sending, sent: t.forgot.sent, tooMany: t.forgot.tooMany, error: t.error }} />
      <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-blue hover:text-navy">
        {t.forgot.back}
      </Link>
    </AuthCard>
  );
}
