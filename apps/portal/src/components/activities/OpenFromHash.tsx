"use client";

import { useEffect } from "react";

/** Opens the news card named in the address (#training-launch…) when arriving from the home page. */
export function OpenFromHash() {
  useEffect(() => {
    function open() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!/^[\w-]+$/.test(id)) return;
      const details = document.getElementById(id)?.querySelector("details");
      if (!details) return;
      details.open = true;
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    }
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
