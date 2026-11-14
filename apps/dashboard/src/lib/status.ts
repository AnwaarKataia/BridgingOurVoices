/** Badge colours for message and submission statuses (shared by the list and detail pages). */
export type MsgStatus = "new" | "review" | "hold" | "replied" | "archived";
export type AppStatus = "pending" | "review" | "hold" | "approved" | "rejected";

export const msgTone: Record<MsgStatus, string> = {
  new: "bg-gold/20 text-gold-deep",
  review: "bg-sky-tint text-blue-deep",
  hold: "bg-sand text-ink",
  replied: "bg-navy/10 text-navy",
  archived: "bg-line/60 text-ink-soft",
};

export const appTone: Record<AppStatus, string> = {
  pending: "bg-gold/20 text-gold-deep",
  review: "bg-sky-tint text-blue-deep",
  hold: "bg-sand text-ink",
  approved: "bg-navy/10 text-navy",
  rejected: "bg-danger/10 text-danger",
};
