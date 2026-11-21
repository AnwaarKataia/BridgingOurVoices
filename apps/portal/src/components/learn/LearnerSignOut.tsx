"use client";

/** Ends the learner session and goes back to the e-learning page. */
export function LearnerSignOut({ label, to }: { label: string; to: string }) {
  async function signOut() {
    await fetch("/learn-api/logout", { method: "POST" }).catch(() => null);
    window.location.href = to;
  }
  return (
    <button type="button" onClick={signOut} className="text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy">
      {label}
    </button>
  );
}
