"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { localizeHref, type SiteContent } from "@/content/site";

type Props = {
  locale: Locale;
  /** Nav key of the current page ("home", "about", ...). */
  current: string;
  site: SiteContent;
};

/** Main sticky header: large logo + name, nav with dropdowns. The language switcher lives in <LanguageBar> above it. */
export function SiteHeader({ locale, current, site }: Props) {
  const [open, setOpen] = useState(false);
  // As in the brand file, "Home" only appears on inner pages.
  const nav = site.nav.filter((item) => !(item.key === "home" && current === "home"));
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-line/50 bg-navy">
      <div className="container-site flex h-20 items-center gap-6 lg:h-24">
        <Link href={`/${locale}`} className="flex flex-none items-center gap-3 text-on-dark">
          <Image
            src="/logo-dark.jpg"
            alt={site.brandName}
            width={461}
            height={429}
            priority
            sizes="88px"
            className="h-[64px] w-[69px] object-cover lg:h-[82px] lg:w-[88px]"
          />
          <span lang="en" dir="ltr" className="font-display text-lg whitespace-nowrap sm:text-xl lg:text-[22px]">{site.brandName}</span>
        </Link>

        <button
          type="button"
          className="ms-auto text-2xl text-on-dark lg:hidden"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={site.a11y.menu}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <nav
          id="main-nav"
          className={`${open ? "block" : "hidden"} absolute inset-x-0 top-full max-h-[calc(100vh-80px)] overflow-y-auto border-b border-navy-line bg-navy px-5 py-6 lg:static lg:ms-auto lg:block lg:max-h-none lg:overflow-visible lg:border-0 lg:p-0`}
        >
          <ul className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
            {nav.map((item, index) => {
              const isCurrent = item.key === current;
              // Dropdowns near the end of the bar open towards the page so they never overflow the viewport
              const dropdownSide = index >= nav.length - 2 ? "end-0" : "start-0";
              return (
                <li key={item.key} className="group relative">
                  <a
                    href={localizeHref(locale, item.href)}
                    onClick={close}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`inline-block border-b py-1.5 text-[15px] font-medium whitespace-nowrap transition hover:border-gold hover:text-on-dark ${
                      isCurrent ? "border-gold text-on-dark" : "border-transparent text-on-dark-soft"
                    }`}
                  >
                    {item.label}
                    {item.children && <span aria-hidden className="ms-1 text-[0.7em] text-gold">▾</span>}
                  </a>

                  {item.children && (
                    <>
                      {/* Desktop dropdown: opens on hover or keyboard focus */}
                      <div className={`invisible absolute ${dropdownSide} top-full hidden pt-2.5 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 lg:block`}>
                        <ul className="w-[230px] rounded-bov border-t-[2.4px] border-gold bg-paper py-2 shadow-[0_12px_32px_rgba(5,14,40,0.25)]">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <a href={localizeHref(locale, child.href)} className="block px-[18px] py-[11px] text-[15px] font-medium text-navy hover:bg-sand">
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Mobile: sub-links listed under the parent */}
                      <ul className="mt-1 flex flex-col gap-2 border-s border-navy-line ps-4 lg:hidden">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <a href={localizeHref(locale, child.href)} onClick={close} className="text-sm text-on-dark-muted hover:text-on-dark">
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
