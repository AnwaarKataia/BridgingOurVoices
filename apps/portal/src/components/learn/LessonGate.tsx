"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WatchedVideo } from "./WatchedVideo";

/**
 * A lesson's content and its "Mark as done" button (owner, 2026-11-21): the button turns on only when the
 * learner has actually gone through the lesson:
 *   video → watched to the end without skipping; text → scrolled to the end; file / link → opened.
 * The API also requires enough time on the lesson (half its length) and the previous steps finished.
 */
type Labels = {
  markDone: string;
  done: string;
  undo: string;
  error: string;
  watchToEnd: string;
  readToEnd: string;
  openFirst: string;
  openLinkFirst: string;
  waitFor: string;
  openFile: string;
  openLink: string;
  noVideo: string;
  noContent: string;
};

type Props = {
  lessonId: string;
  type: "video" | "file" | "text" | "link";
  title: string;
  videoUrl: string;
  fileUrl: string;
  linkUrl: string;
  paragraphs: string[];
  done: boolean;
  waitSeconds: number;
  /** false in the team's preview (no learner account): content only, no progress. */
  signedIn: boolean;
  nextHref: string | null;
  locale: string;
  t: Labels;
};

export function LessonGate({ lessonId, type, title, videoUrl, fileUrl, linkUrl, paragraphs, done, waitSeconds, signedIn, nextHref, locale, t }: Props) {
  const router = useRouter();
  const tracked = signedIn && !done;
  // Requirement for this kind of lesson (already met when done, in preview, or when there is nothing to go through)
  const nothingToDo = (type === "video" && !videoUrl) || (type === "file" && !fileUrl) || (type === "link" && !linkUrl) || (type === "text" && !paragraphs.length);
  const [met, setMet] = useState(!tracked || nothingToDo);
  const [wait, setWait] = useState(waitSeconds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  // First visit starts the lesson's clock on the server
  useEffect(() => {
    if (tracked) fetch(`/learn-api/lessons/${lessonId}/open`, { method: "POST" }).catch(() => undefined);
  }, [lessonId, tracked]);

  // Countdown of the time still needed on the lesson
  useEffect(() => {
    if (!tracked || wait <= 0) return;
    const id = setInterval(() => setWait((w) => Math.max(0, w - 1)), 1000);
    return () => clearInterval(id);
  }, [tracked, wait]);

  // Text lessons: met when the end of the text has been on screen
  useEffect(() => {
    if (!tracked || type !== "text" || met || !end.current) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setMet(true), { threshold: 1 });
    io.observe(end.current);
    return () => io.disconnect();
  }, [tracked, type, met]);

  async function setDone(value: boolean) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/learn-api/lessons/${lessonId}/progress`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ done: value }) });
      const body = (await res.json().catch(() => ({}))) as { error?: string; waitSeconds?: number };
      if (!res.ok) {
        if (body.error === "too_soon" && body.waitSeconds) setWait(body.waitSeconds);
        throw new Error();
      }
      if (value && nextHref) router.push(nextHref);
      router.refresh();
    } catch {
      setError(t.error);
    }
    setBusy(false);
  }

  const fmtWait = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale, { minimumIntegerDigits: 2 });
    return `${new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale).format(m)}:${nf.format(sec)}`;
  };
  const hint = !met
    ? type === "video"
      ? t.watchToEnd
      : type === "text"
        ? t.readToEnd
        : type === "file"
          ? t.openFirst
          : t.openLinkFirst
    : wait > 0
      ? t.waitFor.replace("{time}", fmtWait(wait))
      : "";
  const ready = met && wait <= 0;
  const box = "m-0 rounded-bov border border-dashed border-line-input bg-paper p-5 text-ink-soft";

  return (
    <>
      {type === "video" && (videoUrl ? <WatchedVideo url={videoUrl} title={title} free={!tracked} onWatched={() => setMet(true)} /> : <p className={box}>{t.noVideo}</p>)}
      {paragraphs.map((p, i) => (
        <p key={i} className="m-0 leading-relaxed text-ink">{p}</p>
      ))}
      {type === "text" && !paragraphs.length && <p className={box}>{t.noContent}</p>}
      {type === "file" &&
        (fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noopener" onClick={() => setMet(true)} className="self-start rounded-bov border border-navy px-5 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark">
            📄 {t.openFile}
          </a>
        ) : (
          <p className={box}>{t.noContent}</p>
        ))}
      {type === "link" &&
        (linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMet(true)} className="self-start rounded-bov border border-navy px-5 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark">
            🔗 {t.openLink}
          </a>
        ) : (
          <p className={box}>{t.noContent}</p>
        ))}
      {/* End of the lesson text: reaching it counts as reading to the end */}
      <div ref={end} aria-hidden className="h-px" />

      {signedIn && (
        <div className="flex flex-col gap-2 border-t border-line pt-5">
          {done ? (
            <span className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-bov bg-gold px-3 py-2 text-sm font-semibold text-navy">✓ {t.done}</span>
              <button type="button" disabled={busy} onClick={() => setDone(false)} className="text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy disabled:opacity-50">
                {t.undo}
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={busy || !ready}
              onClick={() => setDone(true)}
              className="self-start rounded-bov bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✓ {t.markDone}
            </button>
          )}
          {!done && hint && (
            <p role="status" className="m-0 text-sm text-ink-soft">
              {hint}
            </p>
          )}
          <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
        </div>
      )}
    </>
  );
}
