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
**Open to everyone (owner's rule, 2026-11-14):** the message is that **women are capable of leading dialogue and peacebuilding, in different ways**. Participation and membership are open to **women and men**.
- No text on the site may say or suggest that only women can take part, or address women only.
- Keep: the tagline, "women leading…", and topics about women's role, WPS and the UN days.
- Describe audiences as "peacebuilders and community leaders, women and men" (AR «صناع السلام والقيادات المجتمعية، نساءً ورجالًا»).
- In Arabic, buttons and calls to action use the "/ي" form («سجّل/ي»، «انضم/ي»، «تواصل/ي») or a noun («التعلّم»، «القيادة»), never the feminine-only imperative.
- In French, use inclusive forms («artisans et artisanes», «participants et participantes», «facilitateurs et facilitatrices»).

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
| Activities ▾ ✅ | `activities/[slug]/page.tsx` | `training`: current course with modules (`#course`), flagship interfaith programme, 4 other tracks. `seminars`: 3 seminar cards. `conferences`: featured video + 6 sessions. `fellowship`: apply + 4 benefits. `e-learning`: published course and webinar cards, or «انتظرونا قريبًا» / "Coming soon" while nothing is published. News: no tab since 2026-11-21. Items sit on the page they belong to (Training programmes → `#programme-news`), and the home page shows the latest ones briefly |
| E-learning course ✅ | `e-learning/[slug]/page.tsx` | One published course or webinar (dynamic, from the API). Info list like KAICIID's course pages (type, format, fees, number of units, programme area, duration, learning time, start date, deadline, certificate, languages), image, flyer PDF, "About the course", units with lesson titles, and a registration form (`#register`). A draft or unknown course → 404 |
| Agenda ✅ | `agenda/page.tsx` + `agenda/[slug]/page.tsx` | **Since 2026-11-21 the events come from the dashboard (database); the brand file's sample events are drafts, so the public sees the calendar + international days until events are published.** One page (no dropdown in the brand file). 1) Month calendar (`components/agenda/Calendar.tsx`, client): prev/next month, tap a day to list only that day, "Show the whole month". Gold dot = event, sky dot = international day, blue frame = today. The list beside it shows the month's items; date chips are red (deadline), blue (webinar series), navy (event), gold (international day). 2) Featured webinar series card + the full list of upcoming events. 3) "International days": the global UN dates for dialogue and peacebuilding, in two columns (`#international-days`). All dates and copy live in `content/agenda.ts`; international days are stored as month-day and repeat every year on the calendar |
| Network ▾ ✅ | `network/[slug]/page.tsx` | `membership`: 3 cards (who can join / what you gain / what we ask). Under the cards: the **membership application form** (`#apply`, `MembershipForm`, its own title "Membership application form" / «استمارة طلب العضوية»; never the "Add your voice to ours" title). `join`: the "Add your voice to ours" form (statement + optional article), unchanged. `members`: 4 team cards with arched portraits (`public/team/*.jpg`, cropped from the banner at the brand file's positions), then the navy "Our network" band with a mosaic and a "Join the network" button |
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
| GET | `/admin/applications?kind=&status=` | Signed in. `kind`: `member` (default) or `voice`. Newest first, plus counts per status for that kind, and pending per kind |
| GET / PATCH | `/admin/applications/:id` | Signed in. One application · `{ status }` sets the decision, with who and when (`pending` clears it) |
| GET | `/admin/applications/:id/cv` · `/photo` | Signed in. Private files (`?download=1` to save), never cached |
| PATCH | `/admin/applications/:id` | Signed in. `{ status?, note?, published? }`. Statuses: `pending` (new), `review`, `hold` (comment later), `approved`, `rejected`. `published: true` needs the sender's `publishConsent` (otherwise 409 `no_consent`) and also sets `approved`; rejecting removes it from the site; any publish change refreshes the portal |
| GET | `/public/voices` · `/public/members` | Public. Published "Add your voice" statements / members, without email, religion or CV. The photo is at `/public/photo/:id`, only while published (the portal proxies `/public-photo/:id`) |
| GET / PATCH | `/admin/messages` · `/admin/messages/:id` | Signed in. Contact messages by status (`new`, `review`, `hold`, `replied`, `archived`) with counts · `{ status?, note? }` (who and when are saved) |
| GET / DELETE | `/admin/subscribers` · `/admin/subscribers/:id` | Signed in. Active or unsubscribed (`?show=unsubscribed`, `?q=` search) · unsubscribe, or `?remove=1` to delete completely |
| GET | `/admin/subscribers.csv` | Signed in. Active subscribers as a CSV file for Excel (UTF-8 with BOM; cells starting with `= + - @` are neutralised) |
| GET | `/admin/recent` | Signed in. The latest 12 submissions of every kind, for the overview |

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
- Saves to the `applications` table with `status: "pending"`.
- The photo is saved as `apps/api/data/uploads/<id>.jpg|png`, with `kind: "voice"`.
- **Files are private**: they are not under `/media`, and only signed-in users reach them through `/admin/applications/:id/cv|photo`. Local disk for now; production needs private object storage.
- Returns 201 when accepted, or 400 with `{ errors: [field…] }`.

Field rules:
- `name`, `job`: required, 2–120 characters.
- `gender`: `female`, `male` or `na`.
- `org`: optional.
- `country`: an ISO code, e.g. `EG`.
- `email`: a valid email address.
- `religion`: required, a code from `network.join.religions` (in `content/religions.ts`: 20 religions, including "No religious affiliation", "Prefer not to say" and "Other"). With `other`, `religionOther` (2–80 characters) is stored instead.
- `subreligion`: optional, a denomination code of **that** religion, or `other` + `subreligionOther`.
- `fields`: repeated, each value from the 12 fixed fields of work, **at most 3** (`MAX_FIELDS`).
- `publish`: optional, `yes` means the sender agrees to be published on the site (`publishConsent`). The membership form has the same box.
- `quote`: the statement, required, 10–600 characters.
- `article`: optional, up to 10,000 characters.
- `photo`: optional, JPG/PNG up to 3MB. The file type is checked from its contents, not the extension.
- `consent`: must be `yes`.
- `locale`.
- `website`: honeypot, same as in `/contact`.

**`POST /network/membership`** (multipart, Membership page; same personal details, `consent` and optional `photo` as above, then):
- `experience`: required. One paragraph of **at most 150 words** (and 10–2000 characters).
- `cv`: **required**. A real PDF (the `%PDF-` header, then read with `pdf-lib`) of **1–4 pages** and at most 5 MB, saved privately as `<id>-cv.pdf`. Errors: `cv` (missing or not a PDF) and `cv_pages` (more than 4 pages).
- `motivation`: required, 10–2000 characters.
- `activities`: required, 10–2000 characters.
- `connections` (organisations the applicant could connect us with): optional, up to 2000 characters.
- Saved with `kind: "member"`.

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
  - "Dr. Anwaar Kataia" (AR «د. أنوار قطايه», spelling confirmed by the owner 2026-11-21) replaces "Dr. Anwaar Othman (Kataya)".
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


### 2026-11-14: Membership application form (separate from "Add your voice to ours") + applications in the dashboard
- **Owner's correction (same day):** the first version wrongly changed the "Add your voice to ours" form and put it on the Membership page. That was undone. There are now **two separate forms**:
  - **"Add your voice to ours"** (Join page): unchanged, the original form. Personal details + **statement** (message of support) + **optional article**, for publishing on the page. Sent to `POST /network/apply` with `kind: "voice"`.
  - **Membership application** (Membership page, «عناصر الانضمام», under the three cards): the same personal details, but instead of the statement and article it has:
    - **an experience summary** (max 150 words, with a live word counter);
    - **a CV** (PDF, max 4 pages, required);
    - **what motivates you to join**;
    - **which activities you could carry out with us**;
    - **which organisations you could connect us with** (optional);
    - an optional photo.
  - It has its own title ("Membership application form" / "Formulaire de demande d’adhésion" / «استمارة طلب العضوية»). **"Add your voice to ours" is not used as a heading on the Membership page.**
  - Sent to `POST /network/membership` with `kind: "member"`. Components: `MembershipForm.tsx` (new) and `JoinForm.tsx` (restored exactly from the first commit). Labels: `membership.form` in `content/network.ts`.
- **Membership is open to everyone, men and women (owner).** The initiative is women-led, but the network is not limited to women. The wording changed in EN/FR/AR:
  - "Who can join": "Women peacebuilders" → **"Peacebuilders and community leaders"** (AR «صناع السلام والقيادات المجتمعية»).
  - "Young people aged 18+…" → **"Leaders aged 30 and over who have started working in peacebuilding and have experience in it"** (AR «القيادات من سن ٣٠ عامًا فأكثر، ممن بدأوا العمل في بناء السلام ولديهم خبرة فيه»).
  - Network header, Membership description and the "Our network" band: "network of women peacebuilders / women peace leaders" → "peacebuilders and community leaders".
  - The home ticker ("Join the … network of peacebuilders", AR «انضم/ي») and the Training benefit ("membership of the … network of peacebuilders").
  - **Not changed:** the initiative's own description (home hero, About, goals), which describes women leading dialogue. The owner may decide later.
- **Database:**
  - `applications.kind` (`voice` | `member`) and `connections` (migration `0004`).
  - Also from earlier today: `experience`, `motivation`, `activities`, `cv` (migration `0003`).
- **Dashboard → "طلبات الانضمام":** two sections, **«طلبات العضوية»** and **«ضم صوتك لصوتنا»**, each with its pending count and status tabs.
  - A membership request shows the experience (with word count), motivation, activities, organisations, the CV (open or download) and the photo.
  - An "Add your voice" submission shows the statement, the article and the photo, with no CV.
  - Accept, reject, or back to review.
  - The overview counts the two kinds separately.
- **Content sync made field-by-field** (`rebase` in `api/src/content/rules.ts`):
  - When the code's copy changes, each field nobody edited in the dashboard takes the new text, and each edited field keeps the dashboard's text.
  - The owner's edit to Mona Lisa's bio (all 3 languages) was kept.
- **Privacy policy** (last updated 14 November 2026):
  - It describes the two forms separately: "Add your voice to ours" collects the statement and an optional article; the membership application collects the experience, CV, motivation, activities and organisations.
  - "Your CV is only read by our team and is never published."
- **Tested:**
  - The voice form accepts a statement with or without an article and needs no CV; it rejects a missing statement.
  - The membership form accepts a CV of up to 4 pages, with or without organisations. It rejects a 5-page CV, a fake PDF, 151 words, a missing CV, and a statement sent instead of the membership fields.
  - Dashboard: the two kinds don't overlap, the CV appears only on membership requests, and the counts are per kind.
  - The Membership, Join, Privacy and Home pages × 3 languages × 5 widths = 60 checks, all passing. The right fields are on each form, and the "Add your voice" title is not in the membership form.
  - **All test submissions, files and the test account were deleted.**


### 2026-11-14: Whole site reworded so it is open to everyone
- **Owner:** nothing on the site should say participation is for women only, or address women only. The idea is that **women can lead this field in different ways**, not that only women take part.
- **Kept:**
  - The tagline «المرأة لقيادة الحوار وبناء السلام» and "Women have always mediated…".
  - The topics about women's role (seminars, events, the "Women in Peacebuilding" track, WPS) and the UN days.
  - The members' bios, and the fact that the team are KAICIID fellows (زميلات).
- **Changed in EN / FR / AR (60 phrases):**
  - **Home:** the description and hero now say the initiative "shows that women can lead peacebuilding in many ways, and empowers peacemakers and community leaders, women and men". Buttons: «تعرّف/ي على أنشطتنا»، «تواصل/ي معنا». The four steps are nouns: «التعلّم، الممارسة، الاعتماد، القيادة».
  - **About:**
    - The story and the description: "works with peacebuilders, community leaders and young change-makers, women and men" (no more «الشابات صانعات التغيير»).
    - The vision in FR/AR is grammatically inclusive («بوصفهم الميسّرين والوسطاء»).
    - Goal 1: "grassroots actors, especially women". Goal 3: «الميسّرين والميسّرات». Goal 5: "connecting peacebuilders".
    - The header: «تعرّف/ي علينا».
  - **Activities:**
    - Meta: "for peacebuilders and community leaders".
    - Flagship: circles "bring people of different faiths together, with women leading the conversation" (the photo description too).
    - Fellowship: "for women and men already active in their communities". Mentoring: «صناع سلام ذوي خبرة».
    - Conference: «المشاركين والمشاركات».
    - Buttons: «سجّل/ي»، «شاهد/ي التسجيل»، «قدّم/ي على الزمالة».
  - **Agenda:** «سجّل/ي الآن»، «أضف/ي إلى تقويم جوجل».
  - **Contact:** «أرسل/ي رسالتك».
  - **Network:** «تعرّف/ي على…»، «انضم/ي إلى الشبكة».
  - **Privacy:** "a platform for dialogue and peacebuilding that champions women’s leadership" (was "a women’s platform").
- The database updated every page field by field (`rebase`). The owner's edit to Mona Lisa's bio was kept.
- **Checked:**
  - A re-scan finds no women-only target wording and no feminine-only imperative left.
  - 13 pages × 3 languages × 5 widths = 195 checks, all passing.
  - The build passes.


### 2026-11-14: Dashboard inbox (everything people send) + publishing + clearer forms
- **The owner couldn't open submissions, only see numbers.** Now every submission can be opened and acted on:
  - **Overview:** the four numbers are links to their lists, and there is a "Latest submissions" feed of all kinds (message, membership request, "Add your voice", subscriber).
  - **Messages** (`/messages`):
    - Tabs: new / under review / on hold / replied / archived / all. A new message shows in bold with a gold bar.
    - The message page shows the full text, the sender, the subject and the language.
    - **"Reply by email"** opens the mail app with a ready reply.
    - Buttons: under review, on hold (comment later), replied, archive, back to new.
    - An **internal note**.
  - **Membership requests and "Add your voice to ours"** (`/applications`):
    - Each kind has tabs: new / under review / on hold / accepted / rejected / all.
    - Buttons: **"إضافة للموقع" (publish)**, "قيد المراجعة", "تأجيل للتعليق لاحقًا", accept without publishing, reject, remove from the site, back to new.
    - An **internal note**, with a 📝 in the list when there is one, and a "published" badge.
  - **Subscribers** (`/subscribers`):
    - The list, with subscribed / unsubscribed tabs and search.
    - **Download as Excel** (CSV).
    - Unsubscribe, or delete permanently (each after a confirmation).
- **Publishing on the site needs consent:**
  - Both network forms have a new optional box, "I agree that my statement/details may be published on the site".
  - Without it the dashboard can't publish (the button is disabled, with an explanation).
  - Published "Add your voice" statements appear under the form on the Join page ("Voices that joined ours": quote, optional article, name, job, country, photo).
  - Published members appear on "Our members" under the team ("Members of the network").
  - The photo is public only while published. No email, religion or CV ever leaves the dashboard.
- **Database:** migration `0005`.
  - `contact_messages`: `note`, `handled_by`, `updated_at`; statuses `new|review|hold|replied|archived`.
  - `applications`: `note`, `publish_consent`, `published`, `published_at`; statuses `pending|review|hold|approved|rejected`.
- **Forms** (owner): "when something is missing or wrong, show it to the person".
  - All three forms (contact, "Add your voice", membership) now check every field at once.
  - Each problem shows a red message under the field (red border too).
  - A summary near the send button lists the fields to fix by name, and the cursor jumps to the first one.
  - Errors the API returns are shown the same way.
  - Messages are in EN/FR/AR (`site.forms`); the code is in `components/forms/FormHelpers.tsx`.
- **Fields of work: at most 3** (owner). After 3 are chosen the other chips are disabled, and the API rejects more than 3.
- **Religion and denomination as lists** (owner, "like the countries"):
  - 20 religions, each with its own denominations. For example, Christianity: Coptic Orthodox, Greek Orthodox, Armenian, Syriac, Tewahedo, Catholic, Maronite, Melkite… Islam: Sunni, Shia, Ismaili, Zaydi, Ibadi, Sufi. Judaism, Hinduism, Buddhism and Jainism also have denominations.
  - Also on the list: Druze, Baháʼí, Yazidi, Mandaean, Zoroastrian, Sikh, Shinto, Taoist, Confucian, African traditional and indigenous beliefs, "No religious affiliation" and "Prefer not to say".
  - "Other" opens a text box.
  - The labels are part of the site content (editable in the dashboard, the codes are fixed). The API checks the codes against the same list, and the dashboard shows the names in AR/EN.
- **Tested** with temporary example.com data, all deleted afterwards:
  - Every dashboard page and action works. Publishing without consent is refused (409); with consent it appears on the site in all 3 languages within seconds; a submission without consent never appears; the photo route returns 404 when unpublished.
  - CSV export works.
  - Religion rules: valid codes are accepted. An unknown code, a denomination from another religion, "Other" with nothing typed, and 4 fields are all rejected.
  - The forms sent empty in AR show every message, the summary, and the focus on the first field.
  - Responsive: the site's Join, Members, Membership and Contact pages × 3 languages × 5 widths (90 checks). The dashboard pages were checked at 320/768/1280.
  - The owner's own test submission ("Add your voice", 14 November) was **kept**.

### 2026-11-21: Digital training registration closed + news ticker + English proofreading
- **Registration closed** (owner: "very important"). In all 3 languages, the home announcement and the Training page show:
  - the badge "Registration closed";
  - "Registration closed on 12 November 2026";
  - a "Discover e-learning" button instead of "Apply".
  - The AR announcement title no longer says «فتح باب التسجيل».
- **News ticker:** two new items (EN/FR/AR):
  - the launch of the online training programme (opening lecture by Dr Mohamed El-Wardany, Al-Azhar University, 19 November 2026);
  - the closing of registration (Arabic and English cohorts).
  - The UNHCR news item is still waiting for the owner's details.
- **English proofreading rule:** EN text must be grammatically consistent:
  - subject–verb and singular/plural agreement;
  - no comma splices (use "." or ";");
  - one sentence structure across a list.
  - A first pass was done over every page (home, about, activities, agenda, network, contact, privacy, forms). FR got the same fix where it shared the error.
  - Texts the owner has already edited in the dashboard keep her version.
- **E-learning:** see the entry "E-learning phase 1" below.

### 2026-11-21: E-learning phase 1 (courses and webinars built in the dashboard)
- **What the owner asked for** (modelled on the KAICIID e-learning pages):
  - E-courses and e-webinars under «الأنشطة».
  - A course page with image, type, fees, number of units, programme area, duration, learning time, start date, deadline, certificate, an Apply button and a flyer.
  - Units with lessons, where videos are YouTube/Vimeo links.
  - The public sees «انتظرونا قريبًا» until a course is published.
  - Learner accounts, "Mark as done", progress and certificates come in later phases.
- **Database** (migration `0006`): `courses`, `course_modules` (units), `course_lessons`, `course_registrations`. Text fields hold `{ en, fr, ar }`.
- **API** (`apps/api/src/elearning.ts`):
  - **Dashboard routes** (signed-in): list/create/edit/delete courses; add/edit/move/delete units and lessons; registrations and their status.
  - **Checks:**
    - video links must be YouTube or Vimeo;
    - files must be PDFs uploaded to `/media` (PDF up to 15 MB, images still 5 MB);
    - other links must be https;
    - dates must be YYYY-MM-DD;
    - the page address (slug) must be unique (409).
  - Publishing, unpublishing and any edit to a published course refresh the site within seconds.
  - **Public routes:**
    - `GET /public/courses` and `GET /public/courses/:slug`: published only, with lesson titles (no video links: lesson content is for registered learners later).
    - `POST /public/courses/:slug/register`: name, email, country; honeypot; 10 per 10 minutes; 409 when registration is closed.
- **Starting content** (`apps/api/src/elearning-seed.ts`, inserted once when there are no courses), all **drafts**:
  - «المرأة وبناء السلام» / "Women and Peacebuilding": 5 units, 15 lessons in EN/FR/AR. The units are:
    - the WPS agenda and Resolution 1325;
    - the many ways women lead peace;
    - gender-sensitive conflict analysis;
    - dialogue and community mediation;
    - from learning to action, with a certificate.
  - Two suggestions:
    - "Facilitating interreligious and intercultural dialogue" (course);
    - the opening-lecture webinar "How is religious and cultural conflict managed on social media?".
- **Dashboard** «التعليم الإلكتروني» (`/courses`):
  - A list with status (draft/published) and counts, plus "New course" and "New webinar" buttons.
  - Each course has an editor (`/courses/[id]`):
    - an editing-language switch (AR/EN/FR);
    - all the details;
    - an image (upload) and a flyer (PDF upload);
    - "Publish on the site" / "Hide from the site", plus "View the course page";
    - units and lessons: add, edit, move up/down, delete;
    - lesson types: video link, PDF file, text, link (Zoom etc.). A "Content missing" tag shows where a video or file is still needed;
    - the registrations list with status (new/accepted/rejected);
    - "Delete course".
- **Site:**
  - Activities → «التعلم الإلكتروني» (`/activities/e-learning`, tab, dropdown, sitemap) shows the published cards or «انتظرونا قريبًا».
  - The course page is at `/[lang]/e-learning/[slug]`.
  - The "Discover e-learning" buttons (home announcement, Training page) lead here.
  - The privacy policy now covers course registration: what is collected, why, and that it is kept up to 12 months after the course ends.
- **Grammar:** counts use "Units: 3" / «الوحدات: ٣» (never "1 units" or «٢ وحدات»). Lesson lengths use the language's own plural forms («دقيقتان»، «٥ دقائق»، «١٢ دقيقة»).
- **Tested** with a temporary account and a temporary course, all deleted afterwards:
  - login, 401 without a session;
  - the wrong date format, a taken slug, a non-YouTube/Vimeo link and a bad email are refused;
  - unit reordering, PDF flyer upload;
  - registering on a draft → 404;
  - after publishing, the course appears on the site and its title changes there within seconds; the public data doesn't include video links;
  - registration through the site form (and its error messages in AR);
  - unpublishing brings back «انتظرونا قريبًا»;
  - responsive: e-learning, course, news, training and privacy pages × 3 languages × 5 widths. Long buttons now wrap at 320px.
  - `pnpm build` passes.
- **Next phases:**
  - learner accounts, lesson pages with the video player, "Mark as done" and progress, participants;
  - certificates last.

### 2026-11-21: E-learning: real completion, unit quizzes, learner profiles, participants in the dashboard
- **Owner:**
  - Show the learner's name, and give each learner a profile page that others can see.
  - «تم الدرس» must not be a shortcut: texts are read to the end, and videos are watched to the end without skipping ahead.
  - Every unit gets a multiple-choice quiz with a pass mark. **Pass mark 70% (confirmed by the owner)**, editable per unit; a learner below it retries before going on.
  - The dashboard shows who joined, with their details and pages.
- **Order (API `courseState`):** steps run in order.
  - Each lesson opens when the previous one is done (🔒 until then).
  - A unit's quiz opens when its lessons are done.
  - The next unit opens only after the quiz is **passed**.
  - The team's preview has nothing locked.
- **«تم الدرس» rules:**
  - **In the player** (`LessonGate`, `WatchedVideo`):
    - **video:** the YouTube (privacy-enhanced) or Vimeo player tracks the furthest point watched. Jumping ahead of it sends the viewer back (going back is fine). The button turns on only after the video reaches its end.
    - **text:** on when the end of the lesson has been on screen.
    - **file / link:** on once opened.
    - A hint under the button says what is missing.
  - **In the API** (can't be bypassed): the lesson must be unlocked and opened (`/learn/lessons/:id/open`, table `lesson_opens`), and at least **half of the lesson's length in minutes** must have passed since it was opened. Otherwise 409 `too_soon` with the seconds left, and the player shows a countdown.
- **Unit quizzes:**
  - **Tables:** `quiz_questions` (per unit: text, 2–6 options and one correct option, EN/FR/AR), `quiz_attempts`, and `course_modules.pass_mark` (default 70).
  - **Dashboard → course → each unit → "Unit quiz":** the pass mark, then add, edit, reorder and delete questions; the correct answer is chosen with a radio button. No questions means no quiz.
  - **Grading on the server:** the correct options never reach the browser. The learner sees the score, pass or fail, and which questions were wrong (never the right answers), with "Try again" and "Go to the next unit". Every answer is required, and there's a limit of 20 submissions per 10 minutes.
  - **Progress** counts lessons and quizzes ("Completed: x of y steps").
- **Learner profile and participants:**
  - **Profile:** the player header says «مرحبًا، [name]» with links to «ملفي الشخصي» and «المشاركون». `/[lang]/learn/profile` edits the name, country, job, organisation, "about me" (up to 1,500 characters), and whether other participants see the profile (on by default).
  - **Participants:** «المشاركون» lists the people taking the same course, and `/[lang]/learn/people/[id]` is one person's profile.
  - **Who sees it:** only learners who share a course with that person, and never their email. Hidden profiles don't appear. These pages are not indexed.
- **Dashboard participants:**
  - A participant's name (in the course's "Participants" and in "Registrations") opens `/learners/[id]`.
  - That page shows email, country, job, organisation, about, account dates, whether the profile is visible, and each course with its status, progress, and per-unit lessons done plus quiz result (passed or not, best score, attempts).
- **Privacy policy:** now also covers quiz results and the profile visible to co-participants (can be hidden).
- **Tested** with a temporary course and learners, all deleted afterwards:
  - the lesson order;
  - «تم الدرس» before opening → `not_opened`, on a locked lesson → `locked`, too early → `too_soon` with 30 s left (it works after 31 s);
  - quiz: locked before the lessons, an unanswered question rejected, 1 of 2 at a 100% mark fails and only the wrong question is named, the next unit stays locked; 2 of 2 passes and unlocks it; no correct answers in any response;
  - profiles: not visible without a shared course, visible after joining (without email), hidden when switched off;
  - the dashboard learner data;
  - in the browser (Arabic): the greeting and links, 🔒 marks, a short text turns the button on, and the video lesson keeps it off with «شاهد/ي الفيديو حتى نهايته»;
  - responsive: player, profile and My learning × 3 languages × 5 widths;
  - `pnpm build` passes.

### 2026-11-21: Eye button on password fields
- **Owner:** an eye button that shows or hides the password.
- **Where:** every password field:
  - **dashboard:** sign-in, "My account" (current / new / confirm), new password after "forgot password";
  - **site:** learner sign-up, sign-in, new password.
- **How:** `PasswordInput` (`apps/dashboard/src/components/` and `apps/portal/src/components/forms/`).
  - The eye sits at the end of the field (right in English, left in Arabic) and becomes a crossed eye while the password is shown.
  - It is reachable by keyboard, with a spoken label in each language ("Show password" / «إظهار كلمة المرور»…).
  - Autocorrect and spell-check are off.
- **Checked** in Arabic in the browser (the password shows and hides, the label changes, the button is on the left). `pnpm build` passes.

### 2026-11-21: News at the top of its page as cards; clearer menu arrows
- **Owner:** a page's news must be visible at the top, not at the bottom, and laid out neatly when there are several programmes or items.
  - On **Training programmes** and **Seminars**, the news now comes right under the page title, as a grid of cards: photo, date and place, title, first lines.
  - "Read the full story" («اقرأ/ي الخبر كاملًا») opens the card across the full width, with the photo beside the text, every paragraph, the points, the other photos and the Facebook link. "Show less" closes it.
  - Arriving from the home page's "Read more" (`#training-launch`, `#unhcr-alexandria`) opens that card automatically (`OpenFromHash`).
  - The programme card and the rest of the page follow underneath.
- **Menu:** the dropdown marker in the navbar is now a clear gold chevron (it was a tiny ▾ that looked like a dot). It turns over while the menu is open.
- **Checked:** the hash opens the right card across the full width; responsive (home, training, seminars × 3 languages × 5 widths, no header overflow or wrapped menu items); `pnpm build` passes.

### 2026-11-21: Paragraphs use "Justify Low" (no hyphens)
- **Owner:** no marks at the ends of lines. She meant the hyphens that split English and French words. She wants Word's "Justify Low": the text is justified on both sides, the last line of each paragraph starts from the text's own side (left in English and French, right in Arabic), and no word is ever split.
- `apps/portal/src/app/globals.css`: `text-align: justify`, `text-align-last: start`, `hyphens: manual` (no automatic hyphenation), `text-justify: inter-word`. Centred blocks stay centred.
- **Note:** browsers stretch the spaces between words, and don't stretch Arabic letters (kashida) the way Word does. So narrow columns can show slightly wider gaps between words.

### 2026-11-21: Forgot password for every account type + the initiative's description reworded
- **Rule (owner):** anyone who creates an account on the site must be able to recover it by email. This applies to dashboard accounts and learner accounts, and to any future account type.
- **Learners:**
  - The sign-in page has «نسيت كلمة المرور؟». It opens `/[lang]/learn/forgot`, which emails a link to `/[lang]/learn/reset?token=…`. The email is in the language of the page the learner used.
  - The same protections as the dashboard: same answer for every email, the SHA-256 of the token stored (table `learner_password_resets`), one use and 1 hour, 3 requests per 15 minutes, the owner's password rule, and every learner session ends after the reset.
  - A learner link can't reset a dashboard account (and vice versa).
  - The emails go out through the same mail setup (`SMTP_*`; locally saved to `apps/api/data/outbox`).
- **Wording (owner):**
  - Home hero: «مبادرة إقليمية تعمل على تعزيز دور المرأة وقيادتها للحوار وبناء السلام، وتمكّن صناع السلام والقيادات المجتمعية، نساءً ورجالًا، وتنقلهم…» (EN "A regional initiative that strengthens women’s role and leadership in dialogue and peacebuilding, and empowers…", FR the same meaning).
  - «متميزة» / "distinctive" and «بصور مختلفة» / "in many different ways" were removed, including from About → Who we are. The AR meta description no longer says «متميزة».
- **Tested** with a temporary learner, deleted afterwards along with the outbox:
  - unknown email → same answer and no email;
  - the email in French with the right link;
  - a weak password, a reused link, and a learner link on the dashboard are refused;
  - the old session and old password stop working, the new one works;
  - responsive: forgot, reset, sign-in and home × 3 languages × 5 widths;
  - `pnpm build` passes.

### 2026-11-21: Forgot password for the dashboard (reset by email)
- **Owner:** if she forgets her password, she can get back in through her email.
- **How it works:**
  - On the sign-in page, «نسيت كلمة المرور؟» opens `/forgot`. You enter your email and get a link `/reset?token=…`, then choose a new password twice (owner's rule: 12+ characters, with letters, numbers and symbols).
  - After that, every session of the account is signed out, so you sign in again with the new password.
  - The email is in Arabic and English, Arabic first when the dashboard is in Arabic.
- **Security:**
  - The answer is the same whether or not an email has an account.
  - Only the SHA-256 of the token is stored (table `password_resets`). A link works once and for 1 hour, and a new request cancels older links.
  - Limits: 3 requests per 15 minutes per IP+email, and 10 reset tries per 15 minutes.
  - Disabled accounts can't reset. The reset page sends no referrer, so the token doesn't leak to other sites.
- **Email sending** (`apps/api/src/mail.ts`, nodemailer):
  - Through SMTP when `SMTP_HOST` is set: `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, plus `DASHBOARD_URL` for the link (see `apps/api/.env.example`).
  - **Locally without SMTP**, the email is saved to `apps/api/data/outbox/` (not uploaded, never in the logs). In production without SMTP nothing is sent.
- **Owner to do for real emails:** turn on 2-Step Verification for b.our.voices@gmail.com, create an **App password** (Google account → Security → App passwords), and put it in `SMTP_PASS` on the server. It never goes into the code or the chat.
- **Tested** with a temporary account, deleted afterwards along with the outbox:
  - an unknown email gets the same answer and no email;
  - the email has both languages and the link;
  - a weak password, a wrong token, and the same link used twice are all refused;
  - after the reset, the old session and the old password stop working and the new one works;
  - the 4th request in 15 minutes → 429;
  - `pnpm build` passes.

### 2026-11-21: E-learning phase 2 (learner accounts, lesson player, progress) + the lecture moves to Seminars
- **Learner accounts** (tables `learners`, `learner_sessions`, `lesson_progress`; `course_registrations.learner_id`):
  - Separate from dashboard users: a learner can never reach `/admin`, and a dashboard session can't reach `/learn`.
  - Sign-up asks for name, email, country and password. The password follows the owner's rule (12+ characters, with letters, numbers and a symbol) and is stored as a scrypt hash. The form has a honeypot and a limit of 5 attempts per 10 minutes.
  - Sign-in is limited to 5 attempts per minute per email+IP. The session is an httpOnly cookie `bov_learner` that lasts 30 days.
  - The portal reaches the API through its own `/learn-api/*` rewrite, so the cookie belongs to the site.
- **Joining a course:**
  - The «سجّل/ي» section of a published course page now offers "Create an account / Sign in", then "Join this course", then "Go to the course".
  - Joining creates the course registration, so the dashboard sees it as a participant.
  - **Access:** "Rejected" in the dashboard removes the learner's access to the lessons, and they can't re-join.
- **Lesson player** (`/[lang]/learn/course/[slug]`, not indexed):
  - The unit and lesson list shows ✓ next to done lessons. It opens on the first lesson that isn't done.
  - Videos play embedded: YouTube in privacy-enhanced mode (`youtube-nocookie.com`), or Vimeo.
  - PDF lessons open the file. Text lessons show the paragraphs. Link lessons open the link (Zoom etc.). A lesson whose content is missing says it is coming soon.
  - "Mark as done" (it can be undone) moves on to the next lesson. There are also previous/next buttons and a progress bar.
  - When every lesson is done, a completion note appears, plus "Certificates will be available soon" if the course gives a certificate.
  - The team's preview opens the player without an account; the progress buttons are hidden there.
- **«دوراتي» / "My learning"** (`/[lang]/learn`): the learner's courses with progress bars, and "Sign out". The e-learning page links to it.
  - The Arabic labels are neutral: «دوراتي» and «اكتملت كل الدروس», not feminine-only forms.
- **Dashboard → course editor → "Participants"** (renamed from "Registrations"): each participant's lessons done out of the total, with a bar. A note explains that "Rejected" removes access.
- **Privacy policy:** the "Learner account" section lists the data (password stored as a hash, courses joined, lessons done), why it is collected, and that it is kept until the person asks for the account to be deleted.
- **Dr El-Wardany's lecture → Seminars (owner):** it is an online seminar, so it moved to Seminars.
  - The news item's page is now `/activities/seminars`.
  - The Seminars page shows "Seminars held" with the full item even while the section is hidden, then «المزيد من الندوات قريبًا». The sample seminar cards stay hidden.
  - "Read more" on the home page, the "Sessions held" line, and "The programme has started: read the news" on the Training card all link there.
  - The UNHCR workshop stays on Training programmes.
- **Owner's question about the top banner:** advice given to keep the fellows banner until there are 4–5 events with good photos, then turn it into a slider of events. Not changed.
- **Tested** with a temporary course, learner and editor, all deleted afterwards:
  - sign-up: a weak password → 400, a second sign-up with the same email → 409;
  - without joining: player → 401/403, progress → 403;
  - join; the player has the content and the video embed; mark done → 1 of 2; «دوراتي» shows it; the dashboard shows the progress;
  - rejected → player and re-join both 403;
  - the learner and admin cookies are kept apart (401 both ways); logout; wrong login → 401;
  - in Arabic in the browser: mark done, then 2 of 2 and the completion note;
  - responsive: sign-up, sign-in, seminars and training × 3 languages × 5 widths;
  - `pnpm build` passes.
- **Next:** certificates (phase 3), and password reset and emails to learners (both need an email service).

### 2026-11-21: News lives where it belongs; e-learning is for real courses only
- **Owner:** no separate News tab.
  - The home page shows each news item briefly: a good photo, the date, the title, the first lines, and "Read more".
  - "Read more" opens the full item on the page it belongs to.
- **News items** (`activities.news.items`): each has a technical `href` (the page it belongs to) and an `id` (its anchor).
  - Both current items (the online training launch and the UNHCR workshop in Alexandria) belong to **Training programmes**.
  - They are shown there in a "Programme news" section (`#programme-news`) under the course card.
  - The home page "Latest news" links to `/[lang]/activities/training#training-launch` and `#unhcr-alexandria`. "All news" goes to `#programme-news`.
  - The ticker opens the home page's news section.
- **Removed:** the Activities → News tab, its dropdown item and its sitemap entry. `/[lang]/activities/news` redirects to `/activities/training#programme-news`.
- **Training course card:**
  - new "Sessions held" list (the 19 November opening lecture by Dr Mohamed El-Wardany, Al-Azhar University);
  - "The programme has started: read the news →" jumps to the programme news on the same page.
- **E-learning = real self-paced courses, like an LMS.**
  - The two suggested drafts were removed (database and seed): the dialogue-facilitation course, and the opening-lecture webinar, which belongs to the online Zoom programme on Training programmes.
  - «المرأة وبناء السلام» stays as a draft.
- **Checked:**
  - the links in EN/FR/AR;
  - the redirect;
  - the public course list is empty, so the site shows «انتظرونا قريبًا»;
  - responsive: home, training and e-learning × 3 languages × 5 widths;
  - `pnpm build` passes.

### 2026-11-21: Undecided content stays hidden; agenda from the dashboard; registrations; preview; news on the home page
- **Rule (owner):** content that isn't decided yet never shows to the public.
  - It stays in the dashboard, where the team sees and edits it.
  - The public sees «قريبًا» / "Coming soon".
  - Every "Register" opens a registration page whose submissions land in the dashboard database.
- **Sections switch** (dashboard «ظهور الأقسام», table `site_sections`):
  - Seminars, Conferences and Fellowship show a "Coming soon" panel until switched on. They are hidden by default, and also when the API can't be reached.
  - Their sample texts stay editable in «محتوى الموقع ← الأنشطة».
  - Fellowship "Apply" now leads to the membership form. Seminar "Register" leads to the agenda.
- **Preview** («معاينة على الموقع» buttons on Sections, E-learning, each course and each event):
  - The dashboard gets a 2-hour signed link (`/admin/preview-token`), and the portal's `/api/preview` switches Next.js draft mode on for that browser only.
  - Pages then also show hidden sections and draft courses and events, with a gold "Preview… Exit preview" bar.
  - The portal sends the shared `REVALIDATE_SECRET` to the API in `x-preview-secret`. It is required in production, and links can only point to this site.
- **Agenda from the database** (tables `events`, `event_registrations`; dashboard «الأجندة»):
  - **Dashboard:**
    - A month calendar. Click a day to add an event, then fill in the title, type, place and details (EN/FR/AR), the time, one or more dates, the look (event / series / deadline), an image, "registration open" and the page address.
    - "Publish on the site" / "Hide from the site", "Preview" and "Delete", plus a list of all events.
  - **Brand-file sample events:** the webinar series, 5 events and the 12 November deadline were moved into the database as **drafts** (`apps/api/seed/events.json`, inserted once). The public agenda now shows the calendar and the international days only. Published events appear in the calendar and in "All upcoming events".
  - **Event pages** (`/[lang]/agenda/[slug]`) are dynamic: published only, or drafts in preview. Each has a registration form (name, email, country; honeypot; 10 per 10 minutes; 409 when closed).
  - The sitemap lists published events only.
- **Registrations** (dashboard «التسجيلات»):
  - Every course and event registration in one list: All / Courses / Events.
  - Status (new / accepted / rejected), a link to the course or event, and a CSV download (UTF-8, safe against spreadsheet formulas).
  - The e-learning and agenda forms share one component (`components/forms/RegisterForm.tsx`).
- **News:**
  - **Home page:** a "Latest news" section (photo, date, title, first lines, "Read more") right before "Our activities", linking to the item on the News page (`#training-launch`, `#unhcr-alexandria`).
  - **Ticker:** each item opens the News page.
  - **Training link, both ways:**
    - the training-launch news item has a "Programme details" link to the Training page;
    - the Training course card has "The programme has started: read the news →".
- **"Add your voice to ours":**
  - A required choice: message of support, article, or both. Each choice opens its own box.
  - The API checks the choice: message 10–600 characters, article 50–10,000.
  - On the site, an article-only voice shows the opening of the article.
  - The intro and consent texts now say "message or article". The membership form is unchanged.
- **Typesetting:** paragraphs on the site are justified (straight edges on both sides). Centred blocks stay centred. *(Changed the same day: hyphenation removed, see "Justify Low" below.)*
- **Grammar:**
  - Vision: "have … authority as **the** primary facilitators…".
  - Mission: "To equip women and young people with practical skills in …, **and to provide** … platforms…" (it was a dangling "providing").
  - FR: the same fixes, with inclusive wording.
- **Tested** with a temporary account, event and submissions, all deleted afterwards:
  - the sections switch on and off;
  - the 7 sample events are hidden from the public but visible with the preview secret (and not with a wrong one);
  - a draft event page → 404;
  - event creation, bad date → 400, publish, registration, accept, CSV;
  - closed registration → 409;
  - preview: a bad token → 401, a good token shows seminars, draft events and the preview bar, and a link to another site is refused;
  - "Add your voice": no choice, article too short, and "both" without a message are refused; each valid choice is accepted;
  - responsive: 9 pages × 3 languages × 5 widths;
  - `pnpm build` passes.

### 2026-11-21: News page (Activities → News) from the Facebook page
- **How it works (owner):** the owner sends the link of a post on the Bridging Our Voices Facebook page (facebook.com/Bourvoice). We take the text and photos from it and add the item to the site, so she doesn't have to copy anything.
- **New page** `/activities/news` («الأخبار» / "News" / "Actualités"), the 5th tab of Activities and in the dropdown and sitemap.
  - Each item shows:
    - a cover photo and a strip of extra photos;
    - the date and place, then the title;
    - the paragraphs, a bullet list and closing paragraphs;
    - a "See the post on Facebook" link.
  - Newest first. The text comes in EN/FR/AR (content `activities.news`, editable in the dashboard). Photos are in `apps/portal/public/news/`.
- **First items:**
  - Launch of the online training programme (19 November 2026, opening lecture by Dr Mohamed El-Wardany).
  - The 3-day training workshop for refugees at UNHCR in Alexandria (15 November 2026, launch of the "Bridging Our Voices Network for Dialogue and Coexistence"). This item was also added to the news ticker.
- **Responsive:** checked at 320/375/768/1024/1280 in EN/FR/AR, with no horizontal scroll.
- **Later option:** pull posts from the Facebook page automatically. This needs a Meta app and a page access token from the owner.

---

## 9. Open items
- [ ] Agenda:
  - Done 2026-11-21: events are managed in the dashboard and "Register" has a real form (registrations in the dashboard).
  - Add a real event banner photo, plus a description for each event (`body` in `agendaEntry`).
  - Confirm the 2026–27 event dates, times and places ("Regional hub", "To be announced").
- [ ] **Privacy policy (draft): the owner must confirm**
  - the retention periods: contact messages 12 months; rejected or withdrawn applications 6 months; newsletter until unsubscribe; members while they are members.
  - the rule that members are only published after review and with their agreement.
  - "18+" as the age for the forms.
  - A legal review is recommended before launch, and the "HTTPS" sentence must be true at launch.
- [x] Religion now comes from a list that includes "Prefer not to say" and "No religious affiliation" (2026-11-14).
- [ ] Decide how applications get reviewed and published (dashboard approval, then show approved members' messages and photos on the site).
- [ ] The real phone number and address for the Contact page. Also decide how messages from the contact form reach the team (email notification and/or the dashboard).
- [ ] Real photos for the placeholders: the flagship programme arch, the 3 seminar cards, and the conference video + 6 session thumbnails. Also links for "Register", "Apply for the fellowship" and "Watch the recording".
- [ ] Add the About and Activities components (page header with tabs, partner tags, statement, numbered list, course card, flagship panel, track cards, seminar cards, session list, benefit cards, language bar) to the plain-HTML catalogue `design-system/index.html` + `components.css`. Their tokens are already in `tokens.css`.
- [ ] Decide whether `/` should send Arabic-speaking visitors to `/ar` automatically (based on browser language). It currently always goes to `/en`.
- [ ] Link "Register now" to the real registration form (registration endpoint in the API)
- [ ] **Owner:** create a Gmail App password and set the SMTP_* values on the server so "forgot password" emails are really sent (locally they go to apps/api/data/outbox).
- [ ] **Owner:** sign in with the temporary password, change it in "My account", then delete `apps/api/data/b.our.voices@gmail.com.password.local.txt`.
- [ ] Dashboard phase 2:
  - Messages inbox + email alert (which address?).
  - Done on 2026-11-14: messages inbox, applications review and publishing, subscribers with Excel export.
  - Still to do: an email alert to the team for new submissions, and an email to the applicant when their request is accepted.
  - Subscribers list + CSV export.
  - User management (admin).
- [ ] Dashboard phase 3: agenda and announcement editing, and course/event registration.
- [ ] **Owner:** decide the seminars, conferences and fellowship, then switch them on in «ظهور الأقسام»; publish real agenda events.
- [ ] E-learning:
  - The owner fills the videos and files of «المرأة وبناء السلام» and publishes it.
  - Phase 2 done (2026-11-21): learner accounts, lesson player, "Mark as done", progress, participants in the dashboard.
  - Password reset for learners: done 2026-11-21 (real sending needs the SMTP settings).
  - Phase 3: certificates.
  - Email to registrants (needs an email service).
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
