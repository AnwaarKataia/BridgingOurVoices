import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { AdminNav, type NavEntry } from "@/components/AdminNav";
import { LangSwitch } from "@/components/LangSwitch";
import { SignOutButton } from "@/components/SignOutButton";

/** Every page in (admin) requires a signed-in user; otherwise → /login. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { lang, t } = await getDict();
  const siteUrl = process.env.PORTAL_URL ?? "http://localhost:3000";

  const nav: NavEntry[] = [
    { href: "/", label: t.nav.overview, ready: true },
    { href: "/content", label: t.content.nav, ready: true },
    { href: "/messages", label: t.nav.messages, ready: false },
    { href: "/applications", label: t.nav.applications, ready: false },
    { href: "/subscribers", label: t.nav.subscribers, ready: false },
    ...(user.role === "admin" ? [{ href: "/users", label: t.nav.users, ready: false }] : []),
    { href: "/account", label: t.account.nav, ready: true },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-navy text-on-dark">
        <div className="container-site flex min-h-16 flex-wrap items-center gap-x-6 gap-y-2 py-2.5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-dark.jpg" alt="" width={48} height={45} className="h-[45px] w-[48px] object-cover" />
            <span className="flex flex-col leading-tight">
              <span lang="en" dir="ltr" className="font-display text-lg whitespace-nowrap">Bridging Our Voices</span>
              <span className="text-xs text-gold">{t.dashboard}</span>
            </span>
          </Link>
          <div className="ms-auto flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/account" className="text-sm text-on-dark-soft hover:text-on-dark">
              {user.name} · <span className="text-gold">{t.roles[user.role]}</span>
            </Link>
            <a href={siteUrl} target="_blank" rel="noopener" className="text-sm font-semibold text-on-dark-soft hover:text-gold">{t.viewSite}</a>
            <LangSwitch current={lang} label={t.langSwitch} className="text-on-dark-soft" />
            <SignOutButton label={t.signOut} />
          </div>
        </div>
      </header>
      <div className="bg-rule h-1" />
      <div className="container-site grid flex-1 grid-cols-1 gap-x-10 gap-y-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-10">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <AdminNav items={nav} soon={t.soon} label={t.menu} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
