# BOV Website — Project Spec

> **ملخص بالعربي:** ده ملف تعليمات المشروع وتفاصيله. أي تعديل أو إضافة بنتفق عليها بتتسجل هنا
> (في الجزء المناسب + في سجل التعديلات آخر الملف). الموقع كله بيتبني على الـ Design System
> الموجود في فولدر `design-system/`، واللي اتعمل من ملف الهوية `reference/bov-brand.html`.

**Status:**
- Design system v1.0 is ready.
- The portal homepage is built in Next.js in English (`/en`), French (`/fr`) and Arabic (`/ar`).
- About (4 pages) and Activities (4 pages) are built in all three languages. Each dropdown item is its own page.
- The Contact page (with a working form) and Network (3 pages, including the membership application form) are built in all three languages.
- The Agenda page (calendar, upcoming events, international days) is built in all three languages.
- The Privacy policy page is built in all three languages (a draft for the owner to review), and is linked from the footer and from the contact and join forms.
- Each agenda event has its own page (6 pages: the webinar series + 5 events). International days link to their official UN pages.
- 63 pages in total (21 × 3 languages). All of them are responsive and were checked at 320, 375, 768, 1024 and 1280px.
- The API has newsletter, contact and network-application endpoints, and stores them in a **Postgres database**.
- **Dashboard phase 1 is done:** sign-in, sessions and roles (admin / editor), a protected area in Arabic and English, and an overview with counts. The Messages, Applications, Subscribers and Users screens come in phase 2.
- **All website content (text + images) is in the database and edited from the dashboard**, under "محتوى الموقع": EN/FR/AR side by side, draft → publish, and history. Page structure stays in code.
**Owner:** Dr. Anwaar Kataia (Lead Fellow & Project Manager)
**Communication:** Egyptian Arabic. **Site content:** English first, then French and Arabic (EN / FR / AR).

---

## 1. Project

**Name:** Bridging Our Voices (BOV): Women's Platform for Dialogue and Peacebuilding
**The project name is never translated.** "Bridging Our Voices" stays in English in every language (header, footer, page titles, Open Graph), as the owner decided on 2026-11-06. The brand file's Arabic name «أصواتنا جسور» only appears where it is part of the Arabic body copy copied from the brand file.
**Tagline:** Women leading dialogue and peacebuilding

A regional, cross-religious and cross-cultural initiative that builds women's capacity to lead dialogue. Dialogue is the core mechanism through which women drive conflict analysis, counter violent extremism, and address shared community and environmental issues. Through partnerships with local leaders and institutions, the platform solidifies women's role as key players in decision-making and conflict resolution.

**Vision:** To establish an inclusive regional and international dialogue ecosystem where women and young leaders possess legitimate, recognised authority as primary facilitators and mediators in resolving community conflicts and sustaining peace.

**Aims**
1. Engage women in dialogue on shared community and environmental issues, demonstrating how their genuine presence changes the solutions proposed.
2. Equip women with practical skills in conflict analysis and dialogue facilitation, enabling them to lead conflict resolution processes in their communities.
3. Strengthen women's ability to recognise early signs of violent extremism and contribute to community-level prevention.
4. Establish a documented, connected network of women leaders across the Arab region and Africa who exchange experience and support one another.

**Period:** September – December
**Target group:** religious, cultural and community leaders, media professionals, and anyone interested in dialogue (men and women).

**Pathway:** 01 Learn → 02 Practise → 03 Accredit → 04 Lead
**Activities:** Training programmes · Seminars · Conferences · Fellowship

**Current announcement:** Registration is open for the first Arabic-language cohort of the digital training course. Deadline: 12 November 2026. The course is free, runs on Zoom for one month, is open to ages 25+, and gives a certificate. It covers dialogue facilitation, community mediation, diversity management and conflict transformation.

**People and partners shown on the banner (`assets/banner-fellows.png`)**
- Fellows:
  - Mona Lisa D. Pangan (KAICIID Fellow, Philippines)
  - Kaltumi Abdulazeez (KAICIID Fellow, Nigeria)
  - Jenny Canau (KAICIID Fellow and Consultant, South Africa)
  - Dr. Anwaar Kataia (Lead Fellow and Project Manager, Egypt)
- Partner logos: KAICIID International Fellows Programme, LEGASI, Life, DCCHS, and a university seal.

---

## 2. Sitemap (from the brand file's navigation)

| Page | File (planned) | Notes |
|---|---|---|
**Rule: every dropdown item is its own page.**
- The parent menu link opens the first child page.
- `/[locale]/about` redirects to `/about/who-we-are`, and `/[locale]/activities` redirects to `/activities/training` (see `next.config.ts`).
- Each sub-page has:
  - tabs to its sibling pages under the page title
  - a "Next →" link at the bottom
  - its own SEO and breadcrumb (JSON-LD).

| Page | Route (`apps/portal/src/app/[locale]/…`) | Content |
|---|---|---|
| Home ✅ | `page.tsx` | hero → ticker → banner + announcement → vision → pathway → activities → footer |
| About ▾ ✅ | `about/[slug]/page.tsx` | `who-we-are` (story + strategic partners) · `vision` (statement) · `mission` (statement) · `goals` (5 strategic objectives) |
| Activities ▾ ✅ | `activities/[slug]/page.tsx` | `training`: current course with modules (`#course`), flagship interfaith programme, 4 other tracks. `seminars`: 3 seminar cards. `conferences`: featured video + 6 sessions. `fellowship`: apply + 4 benefits |
| Agenda ✅ | `agenda/page.tsx` | One page (no dropdown in the brand file). 1) Month calendar (`components/agenda/Calendar.tsx`, client): prev/next month, tap a day to list only that day, "Show the whole month". Gold dot = event, sky dot = international day, blue frame = today. The list beside it shows the month's items; date chips are red (deadline), blue (webinar series), navy (event), gold (international day). 2) Featured webinar series card + the full list of upcoming events. 3) "International days": the global UN dates for dialogue and peacebuilding, in two columns (`#international-days`). All dates and copy live in `content/agenda.ts`; international days are stored as month-day and repeat every year on the calendar |
| Network ▾ ✅ | `network/[slug]/page.tsx` | `membership`: 3 cards (who can join / what you gain / what we ask). `join`: the "Add your voice to ours" application form (see the API section). `members`: 4 team cards with arched portraits (`public/team/*.jpg`, cropped from the banner at the brand file's positions), then the navy "Our network" band with a mosaic and a "Join the network" button |
| Privacy ✅ (footer link) | `privacy/page.tsx` | Privacy policy, a draft: what each form collects, why, retention, rights. Sticky table of contents + 11 sections. Linked from the footer and from the contact and join forms |
| Contact us ✅ | `contact/page.tsx` | Two columns: the form on the left, contact info on the right. The form has name, email, subject (5 options) and message, and posts to the API's `/contact`. The info column has the email `b.our.voices@gmail.com` and LinkedIn + Facebook. Phone and address only appear once real values are added to `content/contact.ts` (the brand file has placeholders) |

The language switcher (EN / FR / AR) is in the thin language bar at the top of every page and keeps you on the same page. Arabic uses `dir="rtl" lang="ar"`.

---

## 3. Tech stack

| Part | Technology | Where |
|---|---|---|
| Monorepo | **pnpm workspaces** (pnpm 10, Node.js 26 LTS) | root `package.json`, `pnpm-workspace.yaml` |
| Portal (public website) | **Next.js 16** (App Router, TypeScript, Turbopack), React 19 | `apps/portal` → port 3000 |
| Dashboard (admin) | **Next.js 16** (TypeScript). Calls the API through its own `/api/*` rewrite | `apps/dashboard` → port 3002 |
| Backend | **Node.js + Fastify 5** (TypeScript, run with tsx) + `@fastify/cookie`, `@fastify/rate-limit` | `apps/api` → port 4000 |
| Database | **Postgres** via **Drizzle ORM**. Locally: embedded Postgres (**PGlite**) in `apps/api/data/db`, no install needed. Production: `DATABASE_URL` (e.g. Neon) | `apps/api/src/db/`, migrations in `apps/api/drizzle/` |
| Styles | **Tailwind CSS v4**. The theme is shared from `packages/ui/src/theme.css` (`@bov/ui`) | imported in each app's `globals.css` |
| SEO | Next Metadata API: title and description, canonical link, hreflang, Open Graph and Twitter; `sitemap.xml`, `robots.txt`, JSON-LD (NGO + WebSite); static pre-rendering | `apps/portal/src/app` |

**Conventions**
- **Colours and fonts:** use only the Tailwind tokens from `@bov/ui`:
  - Colours: `bg-navy`, `text-gold-deep`, `bg-sand`, `text-on-dark`, and so on.
  - Text sizes: `text-display`, `text-h2`, `text-card`, `text-lead`, and so on.
  - Utilities: `container-site`, `eyebrow`, `bg-rule`, `rounded-bov`, `shadow-bov`.
  - Never hard-code hex values.
- **Button and link recipes:** `apps/portal/src/components/ui.ts` (`btn.gold`, `btn.navy`, `btn.outlineLight`, `textLink`, and so on).
- **Fonts:** loaded with `next/font/google` in `apps/portal/src/app/fonts.ts`, exposed as CSS variables (`--font-newsreader` and the others).
- **i18n:**
  - Routes are `/[locale]`. Settings are in `src/i18n/config.ts`.
  - Only locales listed in `publishedLocales` get built. FR and AR show as "Coming soon" in the switcher until their content exists.
  - `/` redirects to `/en`.
- **Content is edited in the dashboard (since 2026-11-12):**
  - The portal reads each page's text and images from the API (database), merged over the built-in copy in `apps/portal/src/content/*.ts`.
  - The getters are **async**: `await getHomeContent(locale)`, and so on.
  - The built-in copy is the `defaults` export of each file. It seeds the database and is the fallback when the API is down.
  - **After adding or renaming a field in a content file:**
    1. Run `pnpm --filter @bov/portal content:export` (it writes `apps/api/seed/content.json`).
    2. Restart the API. New fields are added to the database without touching edited text.
  - Images are `image` fields: `""` means a striped placeholder.
- **Content files:** the built-in page text lives in `apps/portal/src/content/*.ts`, typed, with one object per locale:
  - `site.ts`: shared text (brand name, nav and dropdowns, footer, accessibility labels, "Next"), plus `localizeHref()` and `sectionTabs()`.
  - `home.ts`, `about.ts`, `activities.ts`, `network.ts`, `contact.ts`: text for each page. `contact.ts` also holds the shared `contactEmail` and `socialLinks`.
- **Nav:**
  - Items in `site.ts` have a `key` and a locale-relative `href` (`/`, `/about/vision`, `/activities/training`, `#contact`). `children` become a dropdown.
  - **Each child is its own page**, and the parent `href` is its first child.
  - Following the brand file, "Home" is hidden on the homepage and shown on inner pages.
- **Section sub-pages:** one dynamic route per section, `about/[slug]` and `activities/[slug]`. Each has a `slugs` list (which sets the tab order) and a `page()` switch that returns the title, lead, description and body for each slug.
  - To add a sub-page:
    1. Add its slug to `slugs` and add a `case` for it.
    2. Add the dropdown child in `site.ts` for all 3 languages.
    3. Add the page to `app/sitemap.ts`.
- **Top of every page (`<PageShell locale path current>`):**
  1. Skip link.
  2. **`<LanguageBar>`:** a thin navy-deep bar that scrolls away. At its end: 🌐 icon + EN · FR · AR.
  3. **`<SiteHeader>`:** sticky. The large logo (64px mobile, 82px desktop) + "Bridging Our Voices" + the nav with dropdowns.
  4. `<main>`, then the footer.
- **Inner pages:**
  - They start with `<PageHeader eyebrow title lead tabs>`: the navy title band with sibling-page tabs (current tab in gold), then the gradient rule.
  - They end with `<NextPage>`.
  - In-page anchors stop below the sticky header thanks to `scroll-padding-top` on `<html>` (in `theme.css`).
- **SEO per page:**
  - Each page's `generateMetadata` returns `pageMetadata(locale, path, meta)` from `lib/seo.ts`. This sets the title, description, canonical link, hreflang, Open Graph and Twitter.
  - Every page is listed in `app/sitemap.ts`.
  - Sub-pages output a JSON-LD `BreadcrumbList` (Home › Section › Page). About pages also output `AboutPage`, and the training page also outputs `Course`.
- **Responsive (required on every page, as the owner asked):**
  - Design mobile-first.
  - Before calling a page done, check it at **320, 375, 768, 1024 and 1280px** in **EN, FR and AR**. Check for:
    - no horizontal scroll
    - no header overflow
    - no nav item or site name wrapping onto two lines.
  - Grids collapse to 1 column on mobile and 2 on tablet. Padding shrinks on small screens (`py-12 md:py-20`).
  - The mobile menu lists dropdown children under their parent.
  - The quickest way to run the check: load each page in an off-screen `<iframe>` at each width from the browser console and compare `scrollWidth` with `innerWidth`. Run it again whenever the menu changes. Hidden dropdowns still count toward the page width, so the last two menu items open their dropdown toward the page (`end-0`).
- **Photo / video placeholders:** where the brand file has no image yet, use the striped `bg-stripes-light` or `bg-stripes-dark` blocks (`aria-hidden`, or `role="img"` with an `aria-label`). Replace them with real photos when the owner sends them.
- **RTL:** Arabic pages get `dir="rtl"`. Use logical utilities (`ms-`, `me-`, `ps-`, `border-s`, `border-e`).
- **French copy:** taken word for word from the brand file in FR mode. The brand name stays "Bridging Our Voices" in French. French typography is the same as English. The longest French nav ("Qui sommes-nous") still fits the header at 1024px.
- **Arabic copy:** taken word for word from the brand file in AR mode (`reference/bov-brand.html`, click AR). The brand file also has Arabic copy for the About page (who we are, mission, partners, 5 strategic goals). Use it when that page is built.
- **Arabic typography** (from the brand file; the rules are in `packages/ui/src/theme.css`, unlayered so they override the utilities):
  - Headings use Noto Naskh Arabic. The hero title is 600 weight, about 42px, line-height 1.45. Announcement titles (`text-h3`) are 600. The vision quote, section titles and card titles are 400, line-height 1.5.
  - Labels (`eyebrow`, badge) use IBM Plex Sans Arabic with no caps and no letter spacing, because Plex Mono has no Arabic letters.
  - The pathway steps use Arabic-Indic numerals (٠١…٠٤). The activity cards keep 01…04, as in the brand file.
  - Text links use ←. The card arrows are flipped with `rtl:-scale-x-100`.
  - The ticker scrolls with `rtl:animate-tick-rtl`.
- **The English project name inside Arabic pages:** it carries `lang="en"`, so it keeps the Newsreader font and is not switched to the Arabic heading font.
- **Text that changes per locale:** brand name, accessibility labels (skip link, menu, language, footer nav) and newsletter status messages all live in the content file (`brandName`, `a11y`, `footer.subscribed` / `footer.error`), never in components.
- **Keeping the two token files in sync:** when a token changes, update **both** `packages/ui/src/theme.css` (for Tailwind) and `design-system/tokens.css` (for the HTML catalogue).

**API endpoints**
| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ ok: true }` |
| POST | `/newsletter` | body `{ email }`, validated. Saves to the `subscribers` table (re-subscribing clears `unsubscribed_at`). Returns 201 for a new subscriber, 200 if already subscribed, 400 for an invalid email |
| POST | `/contact` | See the field rules below. Saves to `contact_messages` with `status: "new"`. Returns 201 when accepted and 400 when validation fails |
| POST | `/auth/login` | body `{ email, password }`. 200 + an httpOnly `bov_session` cookie (7 days); 401 for a wrong email or password (same answer and timing for both); 429 after 5 tries per minute per email + IP |
| POST | `/auth/logout` | Deletes the session and clears the cookie. Send `Content-Type: application/json` with `{}` |
| GET | `/auth/me` | The signed-in user `{ id, email, name, role }`, or 401 |
| GET | `/admin/stats` | **Signed in only.** `{ newMessages, pendingApplications, subscribers }` |
| GET | `/content/:key/:locale` | Public. Published content of one page (`site, home, about, activities, agenda, network, contact, privacy` × `en, fr, ar`). The portal caches it under the `content` tag |
| GET | `/admin/content` · `/admin/content/:key` | Signed in. The pages with their draft/published status · one page in all 3 languages (published + draft) |
| PUT | `/admin/content/:key` | Signed in. `{ drafts: { en?, fr?, ar? } }` saves drafts. **400 `structure`** (with the path) if anything other than text or `image` changed (see `content/rules.ts`) |
| POST | `/admin/content/:key/publish` | Signed in. Draft → published, kept as a revision, then calls the portal's `/api/revalidate` |
| DELETE | `/admin/content/:key/draft` | Signed in. Discards the drafts |
| GET / POST | `/admin/content/:key/revisions` · `…/revisions/:id/restore` | Signed in. The last 30 versions; restore copies one into the draft (409 if it no longer fits the page) |
| POST / GET | `/admin/media` | Signed in. Upload one JPG/PNG/WebP up to 5 MB (type checked from the bytes) → `{ path: "/media/<uuid>.<ext>" }` · the latest uploads |
| GET | `/media/:file` | Public. Uploaded images, cached forever (random file names). The portal and dashboard proxy `/media/*` to it |

**Database tables** (`apps/api/src/db/schema.ts`):
- `users`: email, name, role `admin|editor`, scrypt password hash, disabled, last_login_at.
- `sessions`: stores only the SHA-256 of the cookie token, with an expiry.
- `subscribers`, `contact_messages` (status `new|read|replied|archived`), `applications` (status `pending|approved|rejected`, reviewed_by, reviewed_at; `fields` as jsonb).
- `content`: key + locale, `published` and `draft` (as **json, not jsonb**, so the key order is kept and the editor shows fields in page order), who and when.
- `content_revisions`: each published version, plus the seed (`note: "seed"`).
- `media`: uploaded images.

**Changing the schema:**
1. Edit `schema.ts`.
2. Run `pnpm --filter @bov/api db:generate`.
3. The new migration in `apps/api/drizzle/` is applied automatically when the API starts.

**Dashboard accounts:** created from the terminal, never through the website. Locally, **stop the API first**, because the embedded database allows one process at a time; the script refuses to run otherwise.
```bash
pnpm --filter @bov/api user:create -- --email you@example.org --name "Your Name" --role admin
```
- The password is typed, hidden, twice. Add `--random` to generate a temporary password instead: it is saved to `apps/api/data/<email>.password.local.txt` and never printed.
- **Password rule (owner, 2026-11-12):** at least **12 characters, with letters, numbers and symbols**. It is enforced in the script, the API (`passwordProblem()` in `auth/password.ts`) and the dashboard form.
- **Changing your password:** dashboard → "My account" (`/account`), or `POST /auth/password {currentPassword, newPassword}`. It is limited to 5 tries a minute. After a change, this device stays signed in and every other device is signed out.
- Running it again for an existing email resets the password and signs that account out everywhere.
- Roles:
  - `admin`: everything, including managing users.
  - `editor`: review and reply.

**`/contact` field rules:**
- `name`: 2–120 characters.
- `email`: a valid email address.
- `topic`: one of `general`, `training`, `fellowship`, `partnerships`, `media`.
- `message`: 10–5000 characters.
- `locale`: `en`, `fr` or `ar`.
- `website` (honeypot): a hidden field that only bots fill in. When it is filled, the API replies 201 but stores nothing.

**`POST /network/apply`** (multipart form data, code in `apps/api/src/network.ts`):
- Saves to the `applications` table with `status: "pending"`. The photo is saved in `apps/api/data/uploads/<id>.jpg|png` (local disk; production needs object storage).
- Returns 201 when accepted, or 400 with `{ errors: [field…] }`.

Field rules:
- `name`, `job`: required, 2–120 characters.
- `gender`: `female`, `male` or `na`.
- `org`: optional.
- `country`: an ISO code, e.g. `EG`.
- `email`: a valid email address.
- `religion`: required.
- `subreligion`: optional.
- `fields`: repeated, each value from the 12 fixed fields of work.
- `quote`: required, 10–600 characters.
- `article`: optional, up to 10,000 characters.
- `photo`: optional, JPG/PNG up to 3MB. The file type is checked from its contents, not the extension.
- `consent`: must be `yes`.
- `locale`.
- `website`: honeypot, same as in `/contact`.

**The country list** is generated in the page's language with `Intl.DisplayNames` from ISO codes (`content/countries.ts`), with the same 244 countries as the brand file.

**Environment variables** (see the `.env.example` files)
- Portal:
  - `NEXT_PUBLIC_SITE_URL`: **must be the real domain in production**, because canonical links, the sitemap and Open Graph use it.
  - `NEXT_PUBLIC_API_URL`
- API:
  - `PORT`
  - `CORS_ORIGINS`

**Commands** (run from the project root)
```bash
pnpm install
pnpm dev:portal      # http://localhost:3000
pnpm dev:dashboard   # http://localhost:3002
pnpm dev:api         # http://localhost:4000
pnpm dev             # all three
pnpm build           # production build of all apps
```

---

## 4. Files

```
desiging/
├── SPEC.md                  ← this file (project instructions — read first)
├── CLAUDE.md                ← short pointer to SPEC.md (auto-loaded by Claude)
├── package.json, pnpm-workspace.yaml, tsconfig.base.json
├── apps/
│   ├── portal/              ← public website (Next.js)
│   │   ├── public/          ← logo.png, logo-dark.jpg, banner-fellows.png
│   │   └── src/
│   │       ├── app/[locale]/layout.tsx, page.tsx   ← root layout + homepage, SEO metadata
│   │       ├── app/sitemap.ts, robots.ts, fonts.ts, globals.css
│   │       ├── components/  ← SiteHeader, SiteFooter, NewsletterForm, ui.ts, home/*
│   │       ├── content/home.ts  ← homepage copy (per locale)
│   │       ├── i18n/config.ts
│   │       └── lib/site.ts
│   ├── dashboard/           ← admin (Next.js): app/login, app/(admin)/ (protected), lib/api.ts, lib/i18n.ts (AR/EN)
│   └── api/                 ← Fastify API: src/server.ts, store.ts, network.ts, db/ (schema, client),
│                               auth/ (password, session, routes), scripts/create-user.ts; drizzle/ = migrations
├── packages/
│   └── ui/src/theme.css     ← Tailwind v4 theme = design system tokens (@bov/ui)
├── design-system/
│   ├── tokens.css           ← colours, fonts, sizes, spacing (plain CSS version)
│   ├── components.css       ← all .bov- components (plain CSS)
│   └── index.html           ← live catalogue of every component
├── reference/
│   └── bov-brand.html       ← brand identity file (copy of "الموقع الاليكتروني/الويب سايت/BOV Website.html")
├── assets/                  ← logo.png, logo-dark.jpg, banner-fellows.png (master copies)
├── index.html, styles.css   ← homepage v1 (old static prototype, superseded by apps/portal)
└── .claude/launch.json      ← previews: site (5500), portal (3000), dashboard (3002), api (4000)
```

Preview the design system catalogue at `http://localhost:5500/design-system/`.

---

## 5. Design system (summary — full values in `design-system/tokens.css` / `packages/ui/src/theme.css`)

The **brand file `reference/bov-brand.html` is the authority**. If anything here conflicts with it, the brand file wins. Update this spec to match it.

### Colour
| Token | Hex | Use |
|---|---|---|
| `--bov-navy` | #08163A | header, hero, cards, primary text |
| `--bov-navy-deep` | #050E28 | footer |
| `--bov-gold` | #C9A25A | primary CTA, numbers, eyebrows on navy, card top rule |
| `--bov-gold-deep` | #8A6A22 | gold text on light backgrounds |
| `--bov-sky` | #4DB6DD | arrows/accents on navy |
| `--bov-blue` | #1C64A8 | links on light |
| `--bov-blue-deep` | #154F87 | chip text |
| `--bov-paper` | #FAF7F0 | page background |
| `--bov-sand` | #F1EBDD | alternate section |
| `--bov-sky-tint` | #E3F3FA | chip background |
| `--bov-line` | #E2DACB | hairlines |
| gradient | #1C64A8 → #4DB6DD → #C9A25A | 4px rule above ticker and footer |

### Type
| Role | Font | Size / weight |
|---|---|---|
| Display / headings | Newsreader | 48 / 35 / 31 / 26px, **always 400** |
| Body | IBM Plex Sans Arabic | 15px body, 18px lead, 19px/600 subheads |
| Labels / eyebrows / badges | IBM Plex Mono | 12–13px, caps, 0.08em tracking |
| Arabic headings | Noto Naskh Arabic | auto via `[dir="rtl"]` |

### Shape and layout
- Radius is **2px** on buttons, cards, inputs and badges. Chips are the only rounded pills.
- Container is 1280px with a 32px gutter (20px on mobile). Sections have 64–104px of vertical padding.
- Buttons are 52px tall (46px for the small size) with 26px side padding.

### Components (`.bov-` classes)
- **Layout:** container, section, section--sand/navy/white
- **Text:** display, h2, h3, card-title, h4, lead, small, eyebrow, link, quote
- **Buttons:** btn--gold, btn--navy, btn--outline-light, btn--outline-dark, btn--sm
- **Labels:** badge, meta, chips/chip
- **Header:** header, brand, lang, nav, nav-toggle
- **Home blocks:** hero, rule, ticker, banner, announce, steps/step
- **Cards:** cards/card, card--light
- **Forms:** field, input, input--dark, inline-form
- **Footer:** footer and its parts
- **Surface helper:** `.bov-on-dark`. Put it on any navy container so the text colours switch automatically.

### Design rules
1. **Logo:** use `logo-dark.jpg` on navy and `logo.png` on light backgrounds. Never stretch or recolour it.
2. **Headings:** one colour per heading, regular weight, with no highlighted, italic or gold words inside.
3. **Gold is an accent**, not a background fill, except for buttons and badges. Gold text on light backgrounds uses `--bov-gold-deep`.
4. **Surfaces:** navy for the header, hero, activity cards and footer. Paper and sand for content.
5. **New values:** add a token to `packages/ui/src/theme.css` and `design-system/tokens.css` first, then use it. No hard-coded hex values in pages.
6. **Responsive and RTL:** every page must work at 375px wide and in Arabic RTL.

---

## 6. How to build a new portal page

1. **Content:** create `apps/portal/src/content/<page>.ts`. Give it a typed object per locale, in the same style as `home.ts`.
2. **Route:** create `apps/portal/src/app/[locale]/<page>/page.tsx`. It should:
   - Await `params`, then call `notFound()` if `isPublishedLocale` is false.
   - Export `generateMetadata` with the page's title, description and `alternates` (canonical link + hreflang).
   - Render `<SiteHeader>` then `<main id="main">` with the sections, then `<SiteFooter>`.
3. **Sections:** put the page's sections in `apps/portal/src/components/<page>/`, styled with Tailwind tokens and the recipes in `components/ui.ts`.
4. **Sitemap:** add the page to `app/sitemap.ts`.
5. **Check:**
   - Run `pnpm --filter @bov/portal build` with no errors.
   - Preview it at desktop and at 375px wide.
   - Check RTL once Arabic is published.

Section skeleton:
```tsx
<section className="py-16 md:py-[88px]" aria-labelledby="x-title">
  <div className="container-site">
    <p className="eyebrow mb-3 text-gold-deep">Section label</p>
    <h2 id="x-title" className="font-display text-h2 font-normal">Section title</h2>
    <p className="text-lead text-ink-soft">Intro…</p>
  </div>
</section>
```

The plain-HTML catalogue (`design-system/index.html`) is the visual reference for every component. The Next.js components must look the same.

---

## 7. Working rules for Claude
- Read this file at the start of every session. `CLAUDE.md` points here.
- For every agreed change:
  - Update the relevant section of this spec.
  - Add a line to the change log below with the date, what changed and why.
  - Keep `tokens.css`, `components.css` and `design-system/index.html` in sync.
- If the owner updates the brand file, copy it again into `reference/bov-brand.html` and re-extract the values. Report any differences before changing tokens.
- After any visual change:
  - Run the portal (`portal` in `.claude/launch.json`).
  - Check desktop, mobile and RTL.
  - Run `pnpm build` before calling the work done.
- `.claude/launch.json` calls `C:\Program Files\nodejs\node.exe` directly, because the desktop app may not see Node on PATH until it is restarted.

---

## 8. Change log

### 2026-10-31: Homepage v1
- The first homepage was built with a navy/teal + gold palette and the Cormorant Garamond + Manrope fonts.
- The owner gave feedback:
  - The colours overpowered the logo, so the page was changed to light backgrounds.
  - Font and size variables were added.
  - The hero title became one colour and one weight.

### 2026-11-06: Design system v1.0 from the brand file
- The owner added the brand identity file `BOV Website.html`. It was copied to `reference/bov-brand.html`.
- Tokens, components and a catalogue page were extracted from it into `design-system/`.
- The logo on navy and the fellows/partners banner were extracted to `assets/`.
- Fonts were replaced with Newsreader, IBM Plex Sans Arabic, IBM Plex Mono and Noto Naskh Arabic.
- The palette was replaced with navy #08163A, gold #C9A25A and sky #4DB6DD.
- **Superseded:** the 2026-10-31 rule "no dark backgrounds near the logo" no longer applies. The brand file uses navy surfaces together with the navy-background logo, `logo-dark.jpg`, which keeps the logo clear. The rule "one colour, one weight for headings" is kept.
- This spec file was created as the project's single reference.

### 2026-11-06: Tech stack + homepage in Next.js
- The owner chose the stack: a pnpm monorepo, a dashboard and portal in Next.js (TypeScript), a Node backend, Tailwind, and SEO.
- Node.js 26 LTS (via winget) and pnpm 10 were installed on the machine.
- The monorepo was created with `apps/portal`, `apps/dashboard`, `apps/api` and `packages/ui` (the design system as a Tailwind v4 theme).
- The homepage was built in `apps/portal`, following the brand file's homepage:
  - header with EN/FR/AR switcher
  - hero
  - "Latest" ticker
  - fellows banner + registration announcement
  - vision
  - pathway
  - activities
  - footer with newsletter
- SEO is in place: metadata, canonical link and hreflang, Open Graph and Twitter, sitemap, robots, JSON-LD, and a statically pre-rendered `/en`.
- The API has `/health` and `/newsletter`. The newsletter form posts to it. Tested: valid email returns 201, invalid email returns 400.
- Checked at desktop (1280px) and mobile (375px, no horizontal scroll, mobile menu works). All three apps build without errors.
- The root `index.html` and `styles.css` are now an old prototype. `apps/portal` replaces them.

### 2026-11-06: Arabic version of the homepage (`/ar`)
- The full Arabic copy was taken from the brand file's AR mode and added to `content/home.ts`. `ar` was added to `publishedLocales`.
- The brand name in Arabic is «أصواتنا جسور». It is used in the header, footer, page title and Open Graph site name.
- Arabic typography rules were added to match the brand file: Naskh headings, a 600-weight hero title, body-font labels and Arabic-Indic step numbers.
- Fixed a bug: in RTL the "Latest" ticker scrolled out of view. It now has its own `bov-tick-rtl` animation.
- SEO for Arabic: `lang="ar"`, `dir="rtl"`, a canonical link to `/ar`, hreflang for en, ar and x-default, `og:locale` set to ar_AR, and the sitemap lists both languages.
- Checked at desktop and at 375px wide (no horizontal scroll). The build pre-renders both `/en` and `/ar`.
- FR still shows "قريبًا" (Coming soon) in the switcher.

### 2026-11-06: About page (EN / FR / AR)
- Built from the brand file's About page, using its exact layout, sizes and copy in all three languages.
- It has four parts:
  1. A navy page header ("Who we are" / "Qui sommes-nous" / "تعرّفي علينا").
  2. A two-column "Who we are" section with the 6 strategic partners shown as tags.
  3. Vision and mission side by side on navy, separated by a vertical divider.
  4. The 5 strategic objectives as a numbered list.
- The nav now has a Home link on inner pages and an About dropdown (Who we are / Vision / Mission / Goals). The dropdown matches the brand file: paper background, gold top rule, 230px wide, soft shadow. On mobile the sub-links are listed under the parent.
- Refactor:
  - Shared text moved to `content/site.ts`.
  - The new `PageShell`, `PageHeader` and `lib/seo.ts` (`pageMetadata`) are used by every page.
  - The homepage's "More about us →" link now goes to `/[locale]/about`.
- New tokens, added to both `theme.css` and `tokens.css`:
  - Sizes: `text-page` (56px), `text-h2-lg` (42px), `text-statement` (32px), `text-num` (22px), `text-body-lg` (17px).
  - Colours: `line-strong` #D9CFB9 and `navy-divider` #2A3D68.
  - Arabic overrides: page title and large section titles are 600 weight; line-height 1.45–1.5.
- Fixed the French header wrapping at 1024px. Links no longer wrap, the menu spacing is tighter between lg and xl, and the site name is hidden in that range.
- The sitemap now lists all 6 URLs (3 languages × 2 pages).
- Checked:
  - Desktop 1280px in EN, FR and AR.
  - 1024px in FR and AR.
  - Mobile 375px in AR: no horizontal scroll, menu and sub-links work.
  - The dropdown opens on hover.
  - The build pre-renders all 6 pages.

### 2026-11-06: French version of the homepage (`/fr`)
- The full French copy was taken from the brand file's FR mode and added to `content/home.ts`. `fr` was added to `publishedLocales`, so all three languages are now live and the switcher has no "Coming soon" entries.
- Newsletter status messages, accessibility labels and the meta description were written in French.
- SEO: `lang="fr"`, a canonical link to `/fr`, hreflang for en, fr, ar and x-default, and `og:locale` set to fr_FR (with en_GB and ar_AR as alternates). The sitemap lists all three languages.
- Checked at 1024px (the header fits with no overflow) and at 375px (no horizontal scroll). The build pre-renders `/en`, `/fr` and `/ar`.

### 2026-11-06: Activities page, language bar, one page per dropdown item, responsive rule
- **Activities:**
  - Built from the brand file's Activities page, with its exact layout and EN/FR/AR copy.
  - Parts:
    - The current course card: badge, why take part, register button, 7 core modules.
    - The flagship interfaith programme, on a raised navy panel with an arched photo placeholder and a quote card.
    - 4 training tracks.
    - Seminars (3 cards), the conference (featured video + 6 sessions), and the fellowship (apply button + 4 benefits).
  - New tokens, added to both `theme.css` and `tokens.css`:
    - Colours: `navy-raised` #12254D and `gold-pale` #E8D3A0.
    - Sizes: `text-h2-xl` (46px) and `text-feature` (36px).
    - The utilities `bg-stripes-light` and `bg-stripes-dark`.
- **The owner asked for a language bar and a bigger logo.** A thin bar was added above the header with 🌐 + EN · FR · AR at its end. The language switcher moved out of the main header. The logo grew from 60px to 82px on desktop (64px on mobile), and the header height is now 80/96px.
- **The owner asked not to translate the project name.** "Bridging Our Voices" is now used in all languages: the Arabic header, footer, page titles and Open Graph site name. The translated name was removed from the language bar.
- **The owner asked for each dropdown item to be its own page.** About was split into 4 pages and Activities into 4 pages, using dynamic `[slug]` routes. The changes:
  - New tabs under the page title link the sibling pages, and a "Next →" link sits at the bottom.
  - `/about` and `/activities` redirect to their first page.
  - Homepage links now point to the new pages.
  - The sitemap lists 27 URLs.
  - The old anchor-based single pages and the `VisionMission` and `SectionHeading` components were removed.
- **The owner made responsive design a required rule for every page.** All 27 pages were checked at 320, 375, 768, 1024 and 1280px (135 checks). None has horizontal scroll, header overflow, or a nav item or site name wrapping. The mobile header now shows the site name next to the logo.
- In-page anchors now use a global `scroll-padding-top` on `<html>` instead of a `scroll-mt` class on each section.

### 2026-11-06: Contact page (EN / FR / AR)
- Built from the brand file's Contact page, using its layout and copy:
  - A navy header ("Let's talk" / "Parlons-en" / "يسعدنا تواصلك").
  - A white form card with a gold top rule.
  - An info column with the email and the LinkedIn and Facebook buttons.
- **Not published:** the brand file's placeholder phone (+00 000 000 0000) and address (City, Country). They will appear automatically once real values are added to `content/contact.ts`.
- The form:
  - Uses native validation (required fields, email format, minimum lengths). The email field is LTR in Arabic.
  - Includes a honeypot field against spam.
  - Shows "Sending…" while sending, then a success or error message in the page's language, and clears itself after a successful send.
- API: a new `POST /contact` endpoint with schema validation. Storage was refactored so the JSON files share read/write helpers.
- "Contact us" in the menu and the homepage hero button now go to `/[locale]/contact`. The page was added to the sitemap. It outputs JSON-LD for `ContactPage` + the organisation's `contactPoint`/`sameAs` + `BreadcrumbList`.
- New token `line-input` #C9C2B2 (form field borders), added to both token files.
- Tested:
  - Direct API calls: a valid message returns 201. A bad email, an unknown topic and a too-short message each return 400. The honeypot returns 201 and stores nothing.
  - A real submission from the Arabic form was saved with `locale: "ar"`, and the Arabic success message appeared. The test data was deleted afterwards.
  - Responsive: 30 pages × 5 widths = 150 checks, all passing.

### 2026-11-06: Network section (3 pages, EN / FR / AR)
- Built from the brand file's Network page. Its 3 dropdown items are each a page:
  - `/network/membership`
  - `/network/join`
  - `/network/members`
- `/[locale]/network` redirects to the first page.
- Membership: 3 white cards with a navy top rule and ◆ lists.
- **Application form ("Add your voice to ours"):**
  - It has all the fields from the brand file, with required fields marked by a red asterisk.
  - Gender is a set of radio buttons. The country is a select list in the page's language.
  - The 12 fields of work are accessible checkboxes styled as chips that turn navy when selected.
  - The photo shows a round preview and is checked on the browser side (JPG/PNG under 3MB).
  - A consent checkbox is required. There is a honeypot against spam.
- API: `POST /network/apply` (multipart) with `@fastify/multipart`. It validates every field, and stores the application in `data/applications.json` and the photo in `data/uploads`.
- Members:
  - Four people, each with an arched gold-framed portrait, role, country and a bio as bullet points.
  - The portraits were cropped from `banner-fellows.png` into `public/team/*.jpg` (440×440 each).
  - The page outputs JSON-LD `Person` entries.
  - Below them, the navy "Our network" band with a decorative mosaic and a button to the form.
- New token `danger` #B3412F, added to both token files. The Contact form error colour now uses it.
- **Bug fixed:** the Network dropdown, which is hidden but sits near the edge of the header, pushed the Arabic page 33px wider than the window. The last two menu items now open their dropdown toward the page.
- Tested:
  - The API: valid with a photo and valid without one return 201. Missing consent, a non-ISO country, an unknown field of work, a fake image and a photo over 3MB each return 400. The honeypot returns 201 and stores nothing.
  - A real submission from the French form arrived with the right gender, country, fields and locale. All test data was deleted afterwards.
  - Responsive: 39 pages × 5 widths = 195 checks, all passing.
- **To confirm with the owner:** the application form collects sensitive data (religion, gender, photo). A privacy notice is needed before going live.

### 2026-11-06: Member names follow the banner
- **The owner decided that member names use the banner spelling**, not the brand file's Members section:
  - "Dr. Anwaar Kataia" (AR «د. أنوار قطايا») replaces "Dr. Anwaar Othman (Kataya)".
  - "Mona Lisa D. Pangan" (AR «منى ليزا د. بانجان») replaces "Mona Lisa P. Diller".
- Updated in `content/network.ts` for EN/FR/AR. The photo descriptions and the JSON-LD `Person` entries use the same names.
- **Rule:** when a name differs between the brand file's sections, the banner (`assets/banner-fellows.png`) wins.

### 2026-11-06: Agenda page (EN / FR / AR) + international days
- `/[locale]/agenda`: the header, calendar, featured series, events and their dates come word for word from the brand file's Agenda page. The nav link changed from `#agenda` to `/agenda`, and the page is in the sitemap (14 paths × 3 = 42 URLs).
- **At the owner's request, the global dates for dialogue and peacebuilding were added.** There are 25 UN observances, using the official UN names in EN, FR and AR:
  - Interfaith Harmony Week (1–7 Feb), Human Fraternity (4 Feb), Social Justice (20 Feb).
  - Women's Day (8 Mar), Combat Islamophobia (15 Mar), Elimination of Racial Discrimination (21 Mar).
  - Conscience (5 Apr), Multilateralism and Diplomacy for Peace (24 Apr).
  - Living Together in Peace (16 May), Cultural Diversity for Dialogue and Development (21 May), UN Peacekeepers (29 May).
  - Countering Hate Speech (18 Jun), Elimination of Sexual Violence in Conflict (19 Jun), Women in Diplomacy (24 Jun).
  - Friendship (30 Jul), Youth (12 Aug), Victims of Terrorism (21 Aug), Victims of Violence Based on Religion or Belief (22 Aug).
  - Peace (21 Sep), Non-Violence (2 Oct), Anniversary of UNSCR 1325 on Women, Peace and Security (31 Oct).
  - Tolerance (16 Nov), Elimination of Violence against Women (25 Nov), 16 Days of Activism (25 Nov – 10 Dec), Human Rights Day (10 Dec).
  - They appear on the calendar every year (sky dot) and in their own section at the bottom of the page. To add or remove one, edit `observanceDates` and the three title lists in `content/agenda.ts` (they follow by position).
- The calendar opens on the current month, using the visitor's real date once the page loads. Arabic uses Egyptian digits, as in the brand file. On phones under 640px, weekday names become single letters so Arabic names don't run together.
- JSON-LD: an `Event` for each event + a `BreadcrumbList`.
- Fixed a hydration error: `Intl.formatRange()` spaces the range differently in Node and in browsers, so the range text ("25 November – 10 December") is now joined by hand.
- Responsive: 3 pages × 5 widths, all passing (no horizontal scroll, and no weekday name wider than its cell).

### 2026-11-06: Privacy policy page (EN / FR / AR)
- `/[locale]/privacy` (`app/[locale]/privacy/page.tsx`, copy in `content/privacy.ts`). It is not in the brand file, so the text was written from what the API actually stores. It is a **draft for the owner to review**.
- 11 sections with shared anchors (`#who`, `#collect`, `#use`, `#sensitive`, `#publish`, `#share`, `#retention`, `#rights`, `#security`, `#age`, `#changes`):
  - what each form collects (newsletter, contact, membership application)
  - no tracking cookies and no analytics
  - why religion and gender are asked, and that they are never published
  - what may be published about members
  - who sees the data
  - retention periods
  - rights (reply within 30 days at b.our.voices@gmail.com)
  - security, age (18+), and changes.
- Layout: a sticky table of contents in a side column (on top on mobile), and sections with one-colour headings. The email address becomes a `mailto:` link.
- Links:
  - "Privacy policy" in the footer's bottom row, next to the copyright.
  - `components/PrivacyNote.tsx` ("How we use and protect your data: privacy policy") under the contact form and under the join form's consent box. It opens in a new tab so the form isn't lost.
- `SiteContent.privacy {label, formNote, formLink}` was added. The sitemap now has 15 paths × 3 = 45 URLs.
- Responsive: the privacy, contact and join pages × 3 languages × 5 widths = 45 checks, all passing.

### 2026-11-06: Clickable agenda titles + one page per event
- **The owner asked that clicking a title opens its page:**
  - **Events:** each one has its own page, `/[locale]/agenda/[slug]` (`app/[locale]/agenda/[slug]/page.tsx`). There are 6 slugs (`agendaSlugs` in `content/agenda.ts`): `women-faith-and-the-making-of-peace` (the webinar series, showing its 4 sessions), `faith-culture-and-the-role-of-women`, `conflict-analysis-for-community-leaders`, `responding-to-hate-speech-online`, `citizenship-leadership-and-womens-participation`, `first-cohort-accreditation`.
  - Each page has:
    - a header (type, title, the series description)
    - a details card (date or sessions, place, type)
    - "Times and joining details will be shared with registered participants"
    - a "Register" button to `/contact`
    - "Add to Google Calendar" (an all-day event)
    - "Back to the agenda"
    - "Other upcoming events", every one of them linked.
  - JSON-LD: `Event` (or `EventSeries`) + a 3-level `BreadcrumbList`.
  - **The registration deadline** links to the course on the Training page (`/activities/training#course`).
  - **International days** open the official page in the visitor's language, in a new tab with a ↗ mark:
    - un.org/{en,fr,ar}/observances/…
    - UNESCO for Tolerance
    - the resolution text on undocs.org for 1325
    - UN Women's 16 Days page, which exists in English only.
    - The Arabic page for violence against women has a different address (`ending-violence-against-women`).
- Titles are linked everywhere they appear: the calendar list, the featured series card (title and Register button), the upcoming list, the international days section, and the event pages.
- **Checked against the UN list** (un.org/{en,fr,ar}/observances/list-days-weeks, 2026-11-06): all dates match.
  - Added the **International Day of Peaceful Coexistence (28 Jan)**. There are now 26 international days.
  - Switched to the exact UN names where ours differed: FR "Journée internationale des femmes", "…de lutte contre l'islamophobie", "Journée mondiale de la tolérance"; AR «اليوم الدولي لحفظة السلام», «للمرأة في العمل الدبلوماسي», «يوم الشباب الدولي», «…ضحايا الإرهاب وإجلالهم».
- Fixed: at 320px the event pages overflowed (a long button that doesn't wrap, in a grid without `grid-cols-1`). The button label is now short ("Register" / "S'inscrire" / «سجّلي الآن»).
- The sitemap now has 21 paths × 3 = 63 URLs.
- Responsive: 7 pages × 3 languages × 5 widths = 105 checks, all passing.

### 2026-11-12: Dashboard phase 1 (database + sign-in)
- **The owner agreed the dashboard plan:**
  - Phase 1: database + sign-in and roles (done here).
  - Phase 2: messages inbox (with an email alert), membership applications (approve/reject, publish to "Our members"), subscribers (export), and the overview.
  - Phase 3: editing the agenda and announcements, and real registration for courses and events.
- **Database:**
  - The JSON files were replaced by Postgres through Drizzle ORM, in `apps/api/src/db/`.
  - Locally it runs as embedded PGlite in `apps/api/data/db` (nothing to install). In production, set `DATABASE_URL`.
  - Migrations are generated with `db:generate` and applied when the API starts.
  - Only the API opens the database; the dashboard and portal talk to the API.
- **Sign-in:**
  - Passwords are hashed with scrypt (built into Node).
  - Sessions are random 32-byte tokens in an httpOnly, SameSite=Lax cookie (Secure in production), lasting 7 days. Only the token's SHA-256 is stored.
  - Logout deletes the session on the server.
  - A wrong email and a wrong password get the same answer and take the same time.
  - Login is limited to 5 tries per minute per email + IP. The limit runs after the body is read, so it is per email, not per machine.
  - `requireUser` / `requireRole(...)` are preHandlers for protected routes.
- **Dashboard:**
  - Pages:
    - `/login`: logo, the untranslated name, a form.
    - `(admin)` layout: redirects to `/login` when signed out. It has a navy header (logo, name, the user's name and role, "View site", the language switch, sign-out) and a side menu that wraps on mobile. Sections not built yet show "Soon".
    - The overview shows 3 counts.
  - Language:
    - **Arabic by default, with English**, switched by a cookie (`bov_dash_lang`). Text lives in `lib/i18n.ts`.
    - "Bridging Our Voices" stays in English.
  - Calls go through the `/api/*` rewrite, so the cookie is first-party.
  - Security headers: `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`.
  - The port moved from 3001 to **3002** so it doesn't clash with the portal.
- **Accounts:** made with `pnpm --filter @bov/api user:create` (the password is typed hidden in the terminal). It refuses to run while the local API is running.
- **Tested** with a local test account (example.com):
  - The API returns 401 when signed out; a wrong password, an unknown email and expired sessions are rejected; the 6th try within a minute gets 429 while other emails are unaffected.
  - Login and logout work through the dashboard proxy, and the cookie can't be read from JavaScript.
  - The newsletter, contact and join forms all save to the database.
  - The dashboard works in AR and EN at 320/375/768/1024/1280 with no horizontal scroll.
  - **All test data and the test account were deleted afterwards**: the database is empty, with no users.
- Note for checks: the dashboard can't be framed (X-Frame-Options), so the responsive check resizes the window instead of using iframes.

### 2026-11-12: Owner's admin account + password rule + "My account"
- **The owner's admin account was created:** `b.our.voices@gmail.com` (Dr. Anwaar Kataia, admin).
  - It has a random 12-character temporary password with upper and lower case letters, numbers and a symbol.
  - The password is saved only in `apps/api/data/b.our.voices@gmail.com.password.local.txt`, which is gitignored and was never shown in chat.
  - The owner will sign in, change it, then delete that file.
- **Password rule:** 12+ characters with letters, numbers and symbols, enforced in the script, the API and the dashboard. The `--random` option of `user:create` uses `crypto.randomInt`.
- **New: "My account" page (`/account`):**
  - It shows the name, email and role, and has a change-password form: current, new and confirm, the rule shown under it, and a clear message for each problem in AR and EN.
  - It is linked from the side menu and from the user's name in the header.
- **API:** `POST /auth/password`.
  - It needs the current password and rejects weak passwords with a reason (`weak_length|weak_letter|weak_number|weak_symbol`), plus `wrong_current` and `same`.
  - It is rate-limited to 5 a minute.
  - After a change, other sessions are signed out and this one stays.
- **Tested with a temporary example.com account, which was deleted afterwards:**
  - The script rejects weak passwords.
  - The endpoint returns every error case, then succeeds.
  - The second device is signed out, the old password stops working and the new one works.
  - The UI message shows in Arabic, and the page passes at 320/768/1280.
- The database now holds only the owner's account.

### 2026-11-12: Website content moved to the database + content editor in the dashboard
- **Owner's decisions:**
  - All page content moves to the database.
  - The dashboard edits **the content of pages, not the pages themselves**: text and images only. Page structure, links and layout stay in code.
  - Colours and logo will come later.
- **Database:** `content`, `content_revisions`, `media` (see the API section).
  - On first start the API seeds all 8 pages × 3 languages from `apps/api/seed/content.json`, which is exported from the portal's content files with `content:export`.
  - On every start it adds any new fields from the seed and never overwrites edited text.
- **Rules (`apps/api/src/content/rules.ts`, mirrored in the portal and the dashboard):**
  - A draft must keep the exact shape of the published page: same keys, list lengths and types.
  - Technical fields can't change: `key, href, id, slug, value, url, iso, start, end, tone, code, num`, and **`brandName`** (the name is never translated).
  - `image` fields take `""` or a site image path.
- **Images:** new `image` fields where the site has photos:
  - the home banner (`announcement.image`, `/banner-fellows.png`)
  - the member portraits (`members.people[].image`, renamed from `photo`)
  - the flagship programme arch, the 3 seminar cards, the featured conference + 6 sessions, and the agenda's featured event. These four start as `""`, which shows the striped placeholder.
  - `components/ContentImage.tsx` shows them. Uploads (`/media/…`) are `unoptimized`, because Next 16 doesn't optimise images from local IPs.
- **Portal:**
  - `lib/content.ts` `loadContent()` fetches with `revalidate: 300` and the tag `content`.
  - It merges the database over the defaults: the code decides the shape and technical values, the database supplies text and images.
  - It falls back to the defaults on any error.
  - `app/api/revalidate` (protected by the `REVALIDATE_SECRET` header) expires the tag when content is published.
  - A `/media/:file` rewrite points to the API.
  - `PageShell` is async. `sectionTabs(site, …)` now takes the site content. `pageMetadata` uses `siteName`.
- **Dashboard → "محتوى الموقع" (`/content`):**
  - It lists the 8 pages with their status (published / unpublished draft) and last publish date.
  - The editor (`/content/[key]`):
    - Sections follow page order and can be collapsed, with field labels in Arabic.
    - **EN · FR · AR side by side** (stacked on phones). Arabic fields are right-to-left. Long text becomes a text area.
    - Changed fields are marked "معدّل". A search box searches labels and text in all languages.
    - Each image has a preview, upload, change and remove, and is shared by all 3 languages.
    - A sticky bar has **Save draft / Publish / Discard draft**, with a warning before leaving with unsaved changes.
    - **History:** the last 30 versions, each with "restore as draft".
    - "View page on site" opens the page.
- **Tested** with temporary example.com accounts, all deleted afterwards:
  - All 51 portal pages load from the database.
  - A saved draft did not appear on the site; after publishing it appeared within seconds, in that language only.
  - An uploaded image was published, shown in all 3 languages, and served through the portal's `/media`.
  - The API rejected: changing `brandName`, changing a link, adding a field, removing a list item, a fake image, an upload while signed out, and a bad file name. A plain text edit passed.
  - History: restoring the original version and publishing put the site back.
  - The dashboard content pages pass at 320/375/768/1024/1280 in AR and EN.
  - **Afterwards:** the content equals the original, with 24 seed revisions and no uploads; only the owner's account remains.
- New environment variables: `REVALIDATE_SECRET` (API + portal, required in production), `PORTAL_URL` (API + dashboard) and `API_URL` (portal + dashboard).

### 2026-11-12: Code on GitHub
- **The owner asked to upload the code to `https://github.com/AnwaarKataia/BridgingOurVoices` without the sensitive files.** Git 2.56 was installed with winget, and the repo uses the `main` branch.
- **`.gitignore` never uploads:**
  - `apps/api/data/`: the local database, uploaded photos and images, and the temporary password file.
  - `.env` / `.env.*` (only `.env.example` is kept), `*.pem`, `*.key`, `*.local.txt`, `*.local.json`.
  - Office documents (`*.docx`, `*.xlsx`, `*.pptx`).
  - `node_modules`, build output, and editor/OS files.
- **Checked before the first push:**
  - The excluded paths really are ignored.
  - No staged file contains a private key, a GitHub/OpenAI/AWS token, a Postgres URL with a password, the owner's temporary password, or any test password used in this session.
  - The only email address in the code is the public contact one.
- **`REVALIDATE_SECRET`:** since the code is public, the development default (`dev-revalidate-secret`) is no longer used in production. Without the variable, the portal's `/api/revalidate` rejects every call, and the API skips the refresh (pages update on the 5-minute timer).
- `.env.example` for the API, portal and dashboard lists every setting, with no values for secrets.

---

## 9. Open items
- [ ] Agenda:
  - "Register" goes to the contact page for now. Replace it with a real registration form or link.
  - Add a real event banner photo, plus a description for each event (`body` in `agendaEntry`).
  - Confirm the 2026–27 event dates, times and places ("Regional hub", "To be announced").
- [ ] **Privacy policy (draft): the owner must confirm**
  - the retention periods: contact messages 12 months; rejected or withdrawn applications 6 months; newsletter until unsubscribe; members while they are members.
  - the rule that members are only published after review and with their agreement.
  - "18+" as the age for the forms.
  - A legal review is recommended before launch, and the "HTTPS" sentence must be true at launch.
- [ ] Consider making religion optional (or adding "Prefer not to say") in the join form. It is sensitive data and is currently required.
- [ ] Decide how applications get reviewed and published (dashboard approval, then show approved members' messages and photos on the site).
- [ ] The real phone number and address for the Contact page. Also decide how messages from the contact form reach the team (email notification and/or the dashboard).
- [ ] Real photos for the placeholders: the flagship programme arch, the 3 seminar cards, and the conference video + 6 session thumbnails. Also links for "Register", "Apply for the fellowship" and "Watch the recording".
- [ ] Add the About and Activities components (page header with tabs, partner tags, statement, numbered list, course card, flagship panel, track cards, seminar cards, session list, benefit cards, language bar) to the plain-HTML catalogue `design-system/index.html` + `components.css`. Their tokens are already in `tokens.css`.
- [ ] Decide whether `/` should send Arabic-speaking visitors to `/ar` automatically (based on browser language). It currently always goes to `/en`.
- [ ] Link "Register now" to the real registration form (registration endpoint in the API)
- [ ] **Owner:** sign in with the temporary password, change it in "My account", then delete `apps/api/data/b.our.voices@gmail.com.password.local.txt`.
- [ ] Dashboard phase 2:
  - Messages inbox + email alert (which address?).
  - Applications review + publishing to "Our members".
  - Subscribers list + CSV export.
  - User management (admin).
- [ ] Dashboard phase 3: agenda and announcement editing, and course/event registration.
- [ ] Dashboard: **colours and logo** (agreed for later: admin only, brand colours with a contrast check and "restore brand colours").
- [ ] Content editor, later:
  - Agenda dates and event slugs are still in code (`eventIsos`, `seriesIsos`), so only the agenda's text is editable now.
  - Adding or removing list items (cards, events) would be a "structure" change, so it is not allowed yet.
  - Pick an image from the library (today an image is uploaded where it is used).
- [ ] Production: object storage for `/media` uploads and member photos; `REVALIDATE_SECRET` set on the API and the portal.
- [ ] Hosting/domain:
  - Choose a host and a Postgres provider (`DATABASE_URL`), and set `NEXT_PUBLIC_SITE_URL`, `API_URL` (dashboard), `PORTAL_URL`, `CORS_ORIGINS` and `TRUST_PROXY`.
  - Photo uploads need object storage in production (they are on local disk now).
- [ ] A dedicated 1200×630 Open Graph image (currently the 2400×1580 banner)
- [ ] Get separate logo files for the partners, instead of cropping them from the banner
- [ ] Decide whether to delete the old root `index.html` / `styles.css`
- [x] Install Git and put the project under version control (GitHub: AnwaarKataia/BridgingOurVoices, 2026-11-12)
