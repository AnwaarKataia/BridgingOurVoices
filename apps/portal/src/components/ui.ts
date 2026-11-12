/** Class recipes for design-system elements, so every page uses the same styles. */

const btnBase =
  "inline-flex h-[52px] items-center justify-center gap-2 whitespace-nowrap rounded-bov border px-[26px] text-base font-semibold transition hover:-translate-y-px";

export const btn = {
  gold: `${btnBase} border-transparent bg-gold text-navy hover:bg-gold-hover`,
  navy: `${btnBase} border-transparent bg-navy text-on-dark hover:bg-navy-hover`,
  outlineLight: `${btnBase} border-on-dark text-on-dark hover:bg-on-dark hover:text-navy`,
  outlineDark: `${btnBase} border-navy text-navy hover:bg-navy hover:text-on-dark`,
};

export const btnSm =
  "inline-flex h-[46px] items-center justify-center whitespace-nowrap rounded-bov bg-gold px-[18px] text-sm font-semibold text-navy transition hover:bg-gold-hover";

export const textLink =
  "inline-flex items-center gap-1.5 border-b border-current pb-px text-[15px] font-semibold text-blue transition hover:text-navy";

export const sectionY = "py-16 md:py-[88px]";
