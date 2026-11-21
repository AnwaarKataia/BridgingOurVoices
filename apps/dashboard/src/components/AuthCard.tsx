import Image from "next/image";
import type { Lang } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";

/** The sign-in page frame (logo + card), shared by sign-in, forgot password and new password. */
export function AuthCard({
  lang,
  langLabel,
  dashboard,
  title,
  lead,
  children,
}: {
  lang: Lang;
  langLabel: string;
  dashboard: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-navy-deep">
        <div className="container-site flex h-10 items-center justify-end">
          <LangSwitch current={lang} label={langLabel} className="text-on-dark-soft" />
        </div>
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <Image src="/logo-dark.jpg" alt="Bridging Our Voices" width={96} height={89} priority className="h-[89px] w-[96px] rounded-bov object-cover" />
            <p lang="en" dir="ltr" className="font-display text-2xl text-ink">Bridging Our Voices</p>
            <p className="eyebrow text-gold-deep">{dashboard}</p>
          </div>
          <div className="rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-6 sm:p-8">
            <h1 className="mb-1.5 font-display text-h3 font-normal">{title}</h1>
            <p className="mb-6 text-sm text-ink-soft">{lead}</p>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
