import type { Metadata } from "next";
import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { AuthCard } from "@/components/AuthCard";
import { ResetForm } from "@/components/ResetForm";

export const metadata: Metadata = { title: "New password", referrer: "no-referrer" };

/** New password from an emailed link (/reset?token=…). The token is checked by the API when saving. */
export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const { lang, t } = await getDict();
  const f = t.forgot;
  const valid = /^[\w-]{20,200}$/.test(token);
  return (
    <AuthCard lang={lang} langLabel={t.langSwitch} dashboard={t.dashboard} title={f.resetTitle} lead={valid ? f.resetLead : f.expired}>
      {valid ? (
        <ResetForm
          token={token}
          t={{
            next: f.next,
            confirm: f.confirm,
            rule: f.rule,
            save: f.save,
            saving: f.saving,
            done: f.done,
            signIn: f.signIn,
            expired: f.expired,
            newLink: f.newLink,
            mismatch: f.mismatch,
            tooMany: f.tooMany,
            error: t.error,
            weak: { length: t.account.errors.weak_length, letter: t.account.errors.weak_letter, number: t.account.errors.weak_number, symbol: t.account.errors.weak_symbol },
          }}
        />
      ) : (
        <Link href="/forgot" className="inline-block text-sm font-semibold text-blue hover:text-navy">
          {f.newLink}
        </Link>
      )}
    </AuthCard>
  );
}
