/* eslint-disable @next/next/no-img-element -- private photos come through the learner API, not Next's optimiser */

/** A participant's round photo, or their initials when there is none (owner, 2026-11-21). */
export function Avatar({ id, name, hasPhoto, size = 56, version }: { id: string; name: string; hasPhoto: boolean; size?: number; version?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="relative inline-flex flex-none items-center justify-center overflow-hidden rounded-full border-[1.6px] border-gold bg-navy font-display text-on-dark"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {hasPhoto ? <img src={`/learn-api/people/${id}/photo${version ? `?v=${version}` : ""}`} alt="" className="absolute inset-0 size-full object-cover" /> : initials}
    </span>
  );
}
