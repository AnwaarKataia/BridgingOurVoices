"use client";

import { useState, type FormEvent } from "react";
import { apiUrl } from "@/lib/site";
import { btnSm } from "./ui";

type Status = "idle" | "sending" | "done" | "error";

type Props = { placeholder: string; label: string; messages: { done: string; error: string } };

export function NewsletterForm({ placeholder, label, messages }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setStatus("sending");
    try {
      const res = await fetch(`${apiUrl}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <label htmlFor="newsletter-email" className="sr-only">{placeholder}</label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder={placeholder}
        className="h-[46px] min-w-0 flex-1 rounded-bov border border-navy-line bg-navy px-3.5 text-sm text-on-dark placeholder:text-on-dark-faint focus:border-sky focus:outline-2 focus:outline-sky"
      />
      <button type="submit" disabled={status === "sending"} className={btnSm}>
        {label}
      </button>
      <p role="status" className="basis-full text-sm text-sky empty:hidden">
        {status === "done" ? messages.done : status === "error" ? messages.error : ""}
      </p>
    </form>
  );
}
