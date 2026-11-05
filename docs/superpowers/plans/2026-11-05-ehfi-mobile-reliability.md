# EHFI Mobile Reliability and Polish Implementation Plan

> **For agentic workers:** Implement natively in the current workspace. Steps use checkbox (`- [ ]`) syntax for tracking. Automated tests and the project-prohibited commands are intentionally excluded by the user's project instructions.

**Goal:** Improve install response reliability and deliver a clean, continuous mobile agenda, bottom action sheets, correct currency entry, responsive home animation, and theme-aware card borders.

**Architecture:** Keep the Next.js App Router manifest and Supabase cents persistence. Confirm Next's built-in manifest revalidation, use a server action to load authorized seven-day agenda chunks, add a CSS-responsive sheet option with visual viewport keyboard adjustment, and use a small client currency input. Preserve the current route model and brand.

**Tech Stack:** Next.js 16.4.3 App Router, React 19, Tailwind CSS 4, Base UI, Motion, Supabase.

**Spec:** `docs/superpowers/specs/2026-11-05-ehfi-mobile-reliability-design.md`

## Global Constraints

- No dependency additions.
- No automated tests, typecheck, build, lint, or git commands.
- Do not deploy.
- Use `app/manifest.ts` as the manifest source; only change `next.config.ts` if production inspection identifies a response header to correct.
- Do not add a service worker or offline behavior.
- Store and pass price values as integer cents at the persistence boundary.
- Load agenda chunks before adding their date buttons to the rail.

## Review Focus

- Vercel serves the current manifest and its PNG icons at the expected URLs; a correct local manifest alone cannot prove the deployed origin is installable.
- Fast swipes must not outrun agenda prefetch or show unfilled dates as if they had no activities.
- Date chunks must stay bounded to seven days and must only return the current professional's activities.
- Currency editing must handle digit entry, cursor edits, decimal punctuation, pasted `R$` values, zero, and the current maximum amount.
- A focused field and sticky action area must remain usable with the mobile keyboard and safe-area inset.
- Every home animation state must fit on short/narrow devices and remain visible for reduced-motion users.

---

### Task 1: Confirm manifest linking and response behavior

**Files:**
- Modify: `app/layout.tsx`
- Review: `next.config.ts` and the installed Next metadata route behavior

**Interfaces:**
- Produces: one explicit root manifest link at `/manifest.webmanifest` and confirmation that Next's route response is already revalidated.
- Consumes: existing `app/manifest.ts` and the installed Next.js 16 App Router behavior.

- [x] Add `manifest: "/manifest.webmanifest"` to root `Metadata`.
- [x] Inspect the installed Next metadata route loader; it already sets `Cache-Control: public, max-age=0, must-revalidate` for the manifest.
- [x] Leave `next.config.ts` unchanged because repeating Next's default header would not address the install failure.
- [x] Inspect the live manifest and its 192px/512px PNG icon routes; they return the expected data and dimensions.
- [x] Record that live Chrome installation still needs the Installability report after this source change is deployed; do not infer success from the manifest alone.

### Task 2: Replace repeated light-only card borders

**Files:**
- Modify: `components/ehfi/professional-dashboard.tsx`
- Modify: `components/ehfi/student-dashboard.tsx`
- Modify: `components/ehfi/student-activities.tsx`
- Modify: `components/ehfi/student-activity-detail.tsx`

**Interfaces:**
- Consumes: the existing light/dark `--border` theme tokens.
- Produces: consistent subdued borders in both themes.

- [x] Replace `border-white/55` on the four matching cards with the existing semantic border token and a restrained opacity.
- [x] Keep the animation pulse's white ring and success illustration colors unchanged.
- [x] Review each card in its light and dark token context.

### Task 3: Add bottom presentation to the two professional action sheets

**Files:**
- Modify: `components/ui/sheet.tsx`
- Modify: `app/globals.css`
- Modify: `components/ehfi/professional-activity-sheet.tsx`
- Modify: `components/ehfi/professional-participant-list.tsx`

**Interfaces:**
- Produces: optional `mobileSide="bottom"` support on `SheetContent`.
- Consumes: existing Dialog root and mobile breakpoint tokens.

- [x] Add an opt-in `mobileSide` prop and `data-mobile-side` attribute; leave default and non-opted-in sheets unchanged.
- [x] Style the opted-in mobile popup to anchor at the bottom, occupy at most 92dvh, use a rounded top edge, and animate vertically.
- [x] Preserve an internal scroll region, keep the fixed footer above the keyboard through `visualViewport`, and apply bottom safe-area padding.
- [x] Opt the activity editor and participant list into the mobile bottom presentation while retaining their desktop right-side presentation.
- [x] Review mobile and desktop markup for duplicate content and accessible close/title semantics.

### Task 4: Format activity price input as BRL cents

**Files:**
- Create: `components/ehfi/currency-input.tsx`
- Modify: `components/ehfi/professional-activity-sheet.tsx`

**Interfaces:**
- Produces: a controlled BRL input with `initialCents`, form `name`, and native input attributes.
- Consumes: the existing server field `price`, which accepts Brazilian decimal notation and converts it to integer cents.

- [x] Implement digit-to-cents parsing and `pt-BR` two-decimal formatting; preserve cursor position by the count of digits before the caret and keep end-of-input typing at the end.
- [x] Accept numeric paste strings with dots, commas, spaces, and an optional `R$` prefix.
- [x] Render `R$` as a decorative prefix and submit the decimal string (for example `12,50`) through `name="price"`.
- [x] Replace the uncontrolled price input and initialize from `activity.price_cents` or zero.
- [x] Review examples: digits `1250` → display `12,50`; paste `R$ 1.250,00` → display `1.250,00`; persisted amount remains integer cents.

### Task 5: Make the agenda a continuous, preloaded date rail

**Files:**
- Modify: `app/profissional/plataforma/agenda/page.tsx`
- Modify: `app/actions/activities.ts`
- Modify: `components/ehfi/professional-agenda.tsx`
- Modify: `lib/activities/dates.ts` only if a shared seven-day date-range helper is needed.

**Interfaces:**
- Produces: `loadProfessionalAgendaChunk(startDate: string): Promise<PlatformActionResult<ProfessionalActivity[]>>`, restricted to one valid seven-day date interval and the authorized professional.
- Consumes: server-loaded 28-day initial range, date helpers, and existing `listProfessionalActivities(range)`.

- [x] Expand the server-rendered agenda's initial date/activity window to the previous week, selected week, and next two weeks.
- [x] Implement the authorized server action for adjacent seven-day chunks; reject invalid date keys and any request outside the seven-day contract.
- [x] Replace the seven-column mobile grid with a continuous flex rail whose five equal-width cards fit the rail viewport; use `scroll-snap`, `overscroll-x-contain`, and `scrollbar-none`.
- [x] Add previous/next sentinels with a generous prefetch margin; deduplicate requests and append days and their activities atomically after a successful response.
- [x] Keep day selection local. Update counts, selected-day headings, and week arrows from the loaded activity map.
- [x] Wrap all five filter chips on narrow screens; keep a single row at larger widths.
- [x] Preserve a sensible selected-day position when prepending earlier dates and retain the existing `?week=` direct navigation.
- [ ] Manually review left/right scrolling across chunk boundaries, a loaded day with zero activities, date selection without fetching, and the empty/error state if an adjacent chunk request fails.

### Task 6: Recompose the home animation for mobile

**Files:**
- Modify: `components/ehfi/activity-discovery-visual.tsx`
- Modify: `components/ehfi/welcome-screen.tsx` only if the containing mobile spacing needs adjustment.

**Interfaces:**
- Consumes: the existing five animation states and `prefers-reduced-motion` behavior.
- Produces: a contained mobile scene with readable mock-device screens.

- [x] Add mobile scene dimensions and positioning that give the illustration and phone enough vertical space without widening the page.
- [x] Adjust the phone mockup's responsive width/spacing and each screen's internal flex layout to keep content inside its screen area.
- [x] Retain the desktop composition and reduced-motion behavior.
- [ ] Manually inspect all five states at 320px, 360px, 390px, and 430px widths and one short viewport; confirm the home CTA and profile entry remain visible and operable.

## Completion Record

- Source files received an independent read-only review; concrete issues found were corrected.
- The local desktop home composition was reviewed in a browser. Mobile viewport, keyboard, and chunk-boundary acceptance remain pending.
- Automated tests, typecheck, build, lint, git, and deployment were not run, per project instructions.
- Production PWA installability remains a manual Vercel/Chrome acceptance check after the code is deployed.
