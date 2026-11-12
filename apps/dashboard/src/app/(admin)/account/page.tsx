import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const metadata: Metadata = { title: "Account" };

/** My account: name, email, role, and change password. */
export default async function AccountPage() {
  const [{ t }, user] = await Promise.all([getDict(), getCurrentUser()]);
  if (!user) return null; // the (admin) layout already redirects

  return (
    <div className="flex max-w-[640px] flex-col gap-8">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{t.account.nav}</p>
        <h1 className="font-display text-h2 font-normal">{t.account.title}</h1>
        <p className="mt-2 text-ink-soft">{t.account.lead}</p>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-bov border border-line bg-line sm:grid-cols-3">
        {[
          { label: t.account.name, value: user.name },
          { label: t.email, value: user.email, ltr: true },
          { label: t.account.role, value: t.roles[user.role] },
        ].map((row) => (
          <div key={row.label} className="flex min-w-0 flex-col gap-1 bg-white p-4">
            <dt className="text-xs font-semibold text-ink-soft">{row.label}</dt>
            <dd dir={row.ltr ? "ltr" : undefined} className="break-words font-medium rtl:text-end">{row.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="pw-title" className="rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 sm:p-7">
        <h2 id="pw-title" className="mb-5 font-display text-h3 font-normal">{t.account.changeTitle}</h2>
        <ChangePasswordForm t={t.account} />
      </section>
    </div>
  );
}
