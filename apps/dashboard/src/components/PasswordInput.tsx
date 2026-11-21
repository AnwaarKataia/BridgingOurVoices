"use client";

import { useState, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { showLabel: string; hideLabel: string };

/**
 * Password field with an eye button to show or hide what was typed (owner, 2026-11-21).
 * The button sits at the end of the field (right in English, left in Arabic) and is reachable by keyboard.
 */
export function PasswordInput({ showLabel, hideLabel, className = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input {...props} type={visible ? "text" : "password"} autoCapitalize="off" autoCorrect="off" spellCheck={false} className={`${className} pe-12`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        title={visible ? hideLabel : showLabel}
        className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-bov text-ink-soft hover:text-navy focus-visible:outline-2 focus-visible:outline-sky"
      >
        {visible ? (
          // Eye with a line: hide
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6 0 9.5 7 9.5 7a17.6 17.6 0 0 1-3 3.9M6.6 6.6C4 8.4 2.5 12 2.5 12s3.5 7 9.5 7a9.7 9.7 0 0 0 5.4-1.6" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          </svg>
        ) : (
          // Open eye: show
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </span>
  );
}
