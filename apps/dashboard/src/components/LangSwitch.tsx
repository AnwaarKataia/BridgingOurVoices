"use client";

import { useRouter } from "next/navigation";

/** Toggles the dashboard between Arabic and English (cookie, one year). */
export function LangSwitch({ current, label, className = "" }: { current: "ar" | "en"; label: string; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      lang={current === "ar" ? "en" : "ar"}
      onClick={() => {
        document.cookie = `bov_dash_lang=${current === "ar" ? "en" : "ar"}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className={`text-sm font-semibold hover:text-gold ${className}`}
    >
      {label}
    </button>
  );
}
