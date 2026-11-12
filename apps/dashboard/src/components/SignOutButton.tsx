"use client";

import { useRouter } from "next/navigation";

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => undefined);
        router.replace("/login");
        router.refresh();
      }}
      className="text-sm font-semibold text-on-dark-soft hover:text-gold"
    >
      {label}
    </button>
  );
}
