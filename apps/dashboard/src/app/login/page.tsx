import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { LoginForm } from "@/components/LoginForm";
import { LangSwitch } from "@/components/LangSwitch";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  const { lang, t } = await getDict();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-navy-deep">
        <div className="container-site flex h-10 items-center justify-end">
          <LangSwitch current={lang} label={t.langSwitch} className="text-on-dark-soft" />
        </div>
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <Image src="/logo-dark.jpg" alt="Bridging Our Voices" width={96} height={89} priority className="h-[89px] w-[96px] rounded-bov object-cover" />
            <p lang="en" dir="ltr" className="font-display text-2xl text-ink">Bridging Our Voices</p>
            <p className="eyebrow text-gold-deep">{t.dashboard}</p>
          </div>
          <div className="rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-6 sm:p-8">
            <h1 className="mb-1.5 font-display text-h3 font-normal">{t.signInTitle}</h1>
            <p className="mb-6 text-sm text-ink-soft">{t.signInLead}</p>
            <LoginForm t={t} />
            <Link href="/forgot" className="mt-4 inline-block text-sm font-semibold text-blue hover:text-navy">
              {t.forgot.link}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
