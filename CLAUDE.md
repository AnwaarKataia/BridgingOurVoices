# Bridging Our Voices (BOV) — Website

**Read `SPEC.md` first.** It is the project's instructions, stack, details and change log.

- **Stack:** a pnpm monorepo with these parts:
  - `apps/portal`: the public site, Next.js.
  - `apps/dashboard`: the admin, Next.js.
  - `apps/api`: the backend, Node + Fastify.
  - `packages/ui`: the Tailwind v4 theme, which is the design system.
- **Design authority:** `reference/bov-brand.html`. Take each page's layout and EN/FR/AR copy from it. The plain-CSS catalogue is `design-system/index.html`.
- **Rules the owner has set (apply them to every page):**
  1. **Every page must be responsive.** Check it at 320, 375, 768, 1024 and 1280px in EN, FR and AR before calling it done: no horizontal scroll, no header overflow, no wrapped nav items. See "Responsive" in SPEC.md.
  2. **Every dropdown item is its own page.** Use a section `[slug]` route with tabs and a "Next" link.
  3. **The project name "Bridging Our Voices" is never translated**, in any language.
  4. **Logo:** large and clear. The language switcher lives in the thin top bar.
  5. **Headings:** one colour and one weight. The logo must stay clearly visible.
- **Logging changes:** every agreed change or addition goes into `SPEC.md`, both in the relevant section and as a dated change-log entry.
- **Language:** talk to the owner in Egyptian Arabic. Site content is English first, then FR and AR.
- **Running and checking:**
  - Run the apps with the `portal`, `dashboard` and `api` entries in `.claude/launch.json`. The static catalogue runs from `site` on port 5500.
  - Check the work with `pnpm build`.
