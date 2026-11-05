# EHFI Mobile Reliability and Polish — Design Spec

## Intent

Make the current EHFI web app dependable to install on supported platforms and comfortable to use on mobile. Preserve the existing Next.js, Base UI, Tailwind, Motion, and Supabase architecture. This work covers the Vercel PWA response path, the professional agenda, activity action sheets and price entry, the home animation, and repeated dark-theme card borders.

## Goals

1. Keep the valid App Router manifest explicit at the root, and diagnose the deployed install failure from Vercel's response and Chrome's report before changing response headers.
2. Provide a mobile agenda rail with five day cards visible at once, horizontal touch/keyboard navigation, no visible scrollbar, and continuous date loading that completes before new dates are appended to the rail.
3. Keep day selection local to already loaded activity data. Load activities in bounded date chunks ahead of the visible edge so scrolling does not reveal an empty/loading gap.
4. Show all five agenda filters on mobile without a horizontal scrollbar.
5. Open activity and participant action sheets from the bottom on mobile and from the right on desktop.
6. Format price input as Brazilian currency while preserving integer cents at the database boundary.
7. Keep every state of the home illustration readable and contained at narrow and short mobile viewport sizes.
8. Replace white-only borders on theme-aware dashboard cards with the existing semantic border token.

## Non-goals

- Do not add a service worker, offline caching, push notifications, or a custom install prompt unless the production installability report proves one is required for an explicitly supported browser flow.
- Do not guarantee a single install UI across every browser. Android Chromium uses its browser installation UI; iPhone users add the web app through Safari's Share menu.
- Do not change the database schema or store decimal prices.
- Do not redesign the EHFI brand, copy, routes, or activity data model.
- Do not add dependencies or automated tests. Project instructions prohibit tests, typecheck, build, lint, and git commands.
- Do not deploy to Vercel as part of this source change.

## Current state

- Next.js is pinned to 16.4.3. `app/manifest.ts` already uses the App Router manifest convention and declares name, id, `start_url`, scope, standalone display, and 192px/512px icons.
- `public/pwa` contains valid 192×192, 512×512, and 180×180 PNG files. The old PWA handoff note that these assets were missing is stale.
- `next.config.ts` currently only contains `allowedDevOrigins`, which affects development origins. Next.js `headers()` can override response headers for a path; it does not create a manifest or service worker. The installed Next metadata-route loader already emits `Cache-Control: public, max-age=0, must-revalidate` for the manifest, so repeating it in `next.config.ts` would not address the observed install failure.
- The production Android screenshot shows Chrome reporting that installation is unavailable. Read-only inspection of the live `/manifest.webmanifest` returns the expected standalone identity and 192px/512px icon declarations; both live PNG URLs render at their declared dimensions. Production response headers and Chrome's Installability details have not been captured, so the cause remains unconfirmed.
- `professional-agenda.tsx` receives one server-loaded week and displays seven equal-width day buttons; selecting a day filters the already-loaded activity array client-side. Its filter row currently uses horizontal overflow.
- Activity creation and participant list use right-side `SheetContent` at every viewport. The project has a Base UI Dialog-backed sheet primitive.
- Activity prices are already parsed to integer cents by the server action and saved through `p_price_cents`; displays divide by 100. The current text field has no currency mask, so typing digit-only values is ambiguous.
- Four professional/student cards share `border-white/55`, which appears too bright in dark mode. The animation's white tap pulse and explicit dark-mode success colors are intentional and are not part of the card-border correction.

## Experience and technical decisions

### PWA response and Next.js configuration

- Keep `app/manifest.ts` as the source of manifest data and explicitly link `/manifest.webmanifest` from root metadata for clear, stable ownership.
- Do not add a `headers()` rule to `next.config.ts` for the current cache policy: the installed Next metadata route already emits `Cache-Control: public, max-age=0, must-revalidate`. Use `next.config.ts` only if production inspection identifies a response header that needs correction. Do not override `Content-Type` without evidence.
- Do not add an empty service worker. Chrome removed its fetch-handler requirement for installation from the browser menu; service workers remain a separate offline/push capability.
- Treat successful installation as a deployment acceptance check. Inspect the exact production manifest URL, icon responses, final redirects, and Chrome DevTools Application → Manifest → Installability report after deployment. Source changes alone cannot prove the production origin is installable.
- Support Android Chrome and Chromium desktop native installation. Document the Safari → Share → Add to Home Screen path for iPhone.

### Agenda rail and data loading

- Generate one continuous date rail around the selected week. On mobile each item occupies one fifth of the rail viewport; horizontal scroll uses snap points and the existing `scrollbar-none` utility. Desktop can retain the compact seven-day grid if it remains clearer at wide widths.
- Start with a bounded 28-day window: the week before the requested week, the requested week, and two weeks after it. This is enough to begin scrolling immediately without a per-day request.
- Fetch adjacent seven-day chunks when a rail sentinel enters a generous prefetch margin. Append a new chunk only after its activities have arrived. Selecting any loaded day is client-side and does not fetch. Keep a request-key set to prevent duplicate adjacent requests.
- Keep the existing week query parameter as a direct-navigation/accessibility fallback. Week arrows jump to the week containing the selected day; the continuous rail handles touch and trackpad navigation.
- Render filter chips in wrapping rows on narrow screens so all five filters and counts remain visible. Keep a single row when space allows.

### Mobile action sheets and currency

- Extend the shared sheet primitive with an opt-in mobile bottom presentation so unrelated dialogs and the navigation drawer keep their current behavior.
- Opt the professional activity editor and participant list into the bottom presentation below the mobile breakpoint. Use a bounded dynamic viewport height, internal scrolling, and safe-area padding. Keep the desktop right-side sheet layout.
- Add a focused controlled currency input component. Interpret typed digits as cents (`1250` → `12,50`), keep the visible input in `pt-BR` decimal notation, preserve reasonable caret position during editing, and accept pasted values with or without `R$`.
- Continue submitting a decimal string such as `12,50` to the existing server validator. The server remains authoritative and converts it to integer `price_cents`.

### Home composition and theme borders

- Keep the existing desktop two-column hero and the current illustration/animation. Add a deliberate mobile composition with enough vertical room for the scene, a smaller/repositioned device, and screen-state spacing that prevents content from meeting the phone's bottom navigation.
- Inspect every animated state at 320px, 360px, 390px, and 430px CSS widths, plus a short-height viewport. Preserve reduced-motion behavior. This visual acceptance remains pending.
- Change the four matching white-bordered professional/student cards to `border-border` with subtle opacity. Leave intentional white tap feedback and already theme-paired illustration colors unchanged.

## Acceptance criteria

- Root HTML references `/manifest.webmanifest`; the manifest response retains valid install identity and icons and uses Next's existing revalidation header.
- After deployment, Chrome DevTools reports no manifest/icon installability error and Chrome Android's native install action is enabled. The app launches standalone at `/`. This production check remains pending; iPhone guidance names the Safari add-to-home-screen flow.
- Mobile agenda shows five legible days at once, scrolls continuously in both directions, has no visible horizontal scrollbar, and never appends dates before their activity chunk is ready. Tapping a loaded date causes no network request.
- Every agenda filter remains visible on mobile without horizontal scrolling.
- The activity editor and participant panel rise from the bottom on mobile and open from the right on desktop; content and save actions remain reachable above the keyboard and safe area using `visualViewport` adjustment.
- Typing `1250` displays `12,50`; typing or pasting `12,50`, `12.50`, or `R$ 12,50` produces 1,250 cents at the server boundary; saved data remains integer cents and displayed prices remain `12,50`.
- The home illustration stays within its scene across all five states and target widths; its primary CTA and profile entry remain visible and operable.
- The four dashboard cards use theme-aware borders: subdued in dark mode and legible in light mode.

## Verification constraints

- Do not run tests, typecheck, build, lint, or git commands.
- Use source inspection and manual browser/device review only. Production PWA confirmation requires a Vercel deployment and the target browser's Installability report; do not claim that source changes alone prove installation.

## Decisions made

- Treat the user-confirmed agenda behavior as a continuous timeline, loading chunks before appending dates to the visible rail.
- Use a 28-day initial agenda window and seven-day later chunks. This bounds initial query size while giving the user ample loaded space before the first prefetch boundary.
- Wrap filter chips on narrow screens instead of hiding their scrollbar; every filter remains discoverable at a glance.
- Use the shared Dialog sheet with an opt-in responsive bottom presentation, avoiding a duplicated Dialog/Drawer tree and preserving existing action state.
- Use `next.config.ts` only if production inspection finds a manifest response header to correct; Next already emits the revalidation header. Leave MIME handling to Next.js unless the deployed response proves it wrong.
- Do not add a service worker or install CTA without runtime evidence; neither is a reliable substitute for a valid production manifest response.
