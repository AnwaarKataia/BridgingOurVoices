"use client";

import { useEffect, useRef } from "react";

/**
 * Embedded YouTube / Vimeo player that reports when the video has really been watched to the end
 * (owner, 2026-11-21): the learner can't jump ahead of the furthest point already watched; going back is
 * fine. `free` (lesson already done, or the team's preview) removes the limit.
 */
type Props = { url: string; title: string; free: boolean; onWatched: () => void };

type YTPlayer = { getCurrentTime(): number; getDuration(): number; seekTo(s: number, allow: boolean): void; getPlayerState(): number; destroy(): void };
type VimeoPlayer = {
  on(ev: string, cb: (d: { seconds: number; duration: number }) => void): void;
  setCurrentTime(s: number): Promise<number>;
  getDuration(): Promise<number>;
  destroy(): Promise<void>;
};
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer; PlayerState: { ENDED: number; PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
    Vimeo?: { Player: new (el: HTMLElement, opts: object) => VimeoPlayer };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(src));
    document.head.appendChild(s);
  });
}

function loadYouTube(): Promise<NonNullable<Window["YT"]>> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    loadScript("https://www.youtube.com/iframe_api").catch(() => undefined);
  });
}

const ytId = (url: string) => /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/.exec(url)?.[1] ?? null;
const vimeoId = (url: string) => /vimeo\.com\/(?:video\/)?(\d+)/.exec(url)?.[1] ?? null;
/** Small allowance for buffering and rounding (seconds). */
const SLACK = 2;

export function WatchedVideo({ url, title, free, onWatched }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const report = useRef(onWatched);
  report.current = onWatched;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cleanup: (() => void) | undefined;
    let maxWatched = 0;
    let reported = false;
    const done = () => {
      if (!reported) {
        reported = true;
        report.current();
      }
    };

    const yt = ytId(url);
    const vm = vimeoId(url);
    if (yt) {
      loadYouTube().then((YT) => {
        if (cancelled) return;
        const mount = document.createElement("div");
        el.appendChild(mount);
        const player = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId: yt,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onStateChange: (e: { data: number }) => {
              if (e.data === YT.PlayerState.ENDED) {
                const d = player.getDuration();
                if (free || maxWatched >= d - SLACK * 2) done();
              }
            },
          },
        });
        timer = setInterval(() => {
          try {
            const t = player.getCurrentTime();
            const d = player.getDuration();
            if (!free && t > maxWatched + SLACK) player.seekTo(maxWatched, true); // no skipping ahead
            else maxWatched = Math.max(maxWatched, t);
            if (d > 0 && maxWatched >= d - SLACK) done();
          } catch {
            /* player not ready yet */
          }
        }, 500);
        cleanup = () => player.destroy();
      });
    } else if (vm) {
      loadScript("https://player.vimeo.com/api/player.js").then(() => {
        if (cancelled || !window.Vimeo) return;
        const player = new window.Vimeo.Player(el, { id: Number(vm), responsive: true, title: false, byline: false, portrait: false });
        player.on("timeupdate", ({ seconds, duration }) => {
          if (!free && seconds > maxWatched + SLACK) {
            player.setCurrentTime(maxWatched).catch(() => undefined);
            return;
          }
          maxWatched = Math.max(maxWatched, seconds);
          if (duration > 0 && maxWatched >= duration - SLACK) done();
        });
        player.on("ended", () => (free || maxWatched > 0) && done());
        cleanup = () => {
          player.destroy().catch(() => undefined);
        };
      });
    }
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      cleanup?.();
      el.innerHTML = "";
    };
  }, [url, free]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-bov bg-navy [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full">
      <div ref={host} className="absolute inset-0" role="region" aria-label={title} />
    </div>
  );
}
