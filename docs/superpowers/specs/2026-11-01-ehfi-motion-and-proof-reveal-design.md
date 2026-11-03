# EHFI Navigation Motion and Conditional Proof Reveal — Design Spec

## Intent

Give EHFI's four current routes a coordinated, polished motion system, make form content reveal in a useful sequence as it enters view, prevent the mobile page from appearing empty, and show the proof-upload area only after the registration answers determine which proof is required. Also guard the global theme shortcut against the reported runtime error.

This is a responsive web/PWA experience in the existing Next.js App Router, not a native mobile application. “Native” here means executing the plan in this session without delegating implementation.

## Current-state evidence

- `app/template.tsx` wraps every route in a Motion element whose server-rendered initial state is `opacity: 0`; it has only an enter animation. If client hydration or its animation does not complete, the whole route can remain invisible. This is the strongest code-based explanation for the submitted mobile screenshot, but the screenshot alone does not prove the cause.
- Entry animation definitions and timings are repeated across the welcome, role cards, registration, success, and platform placeholder components.
- The registration already uses `whileInView` on panels, staggered field variants, and a directional `AnimatePresence` transition between its two steps. These behaviors should be refined and made consistent rather than replaced unnecessarily.
- The proof panel always renders. When `getRequiredProof` returns `null`, it shows “Escolha sua situação acadêmica para ver o comprovante solicitado.”
- The global theme shortcut assumes `event.key` is a string and calls `.toLowerCase()` directly. The runtime report proves an event reached the handler with `key` undefined; repository search found no local code that manually dispatches a `keydown`, so the external origin remains unknown.
- `Document.startViewTransition()` can also throw synchronously in hidden/unsupported document states. If it throws before the callback, the theme setter must still run and temporary transition state must be cleared.
- Theme changes already use `Document.startViewTransition()` and a circular reveal on `::view-transition-new(root)`. Route-transition styles must not accidentally reuse that theme-only effect.

## Goals

1. Animate client-side navigation between all current routes with a restrained direction cue and an accessible fallback.
2. Create one shared timing and easing system for page entrances, card sequences, form panels, fields, and step changes.
3. Reveal form sections and fields as they enter the viewport, once, in short semantic groups.
4. Keep meaningful page content available in the initial server-rendered state; animation must not gate the whole page becoming visible.
5. Hide the proof panel until the selected answers resolve a `requiredProof`, then display that required proof type immediately with the existing demonstration-file action.
6. Prevent malformed or synthetic keyboard events from crashing the theme shortcut.
7. Preserve EHFI's current routes, visual language, demo-only form behavior, and reduced-motion support.

## Non-goals

- No new routes, form fields, APIs, databases, browser storage, real file picker, or real upload.
- No dependency additions, image changes, new palette, or replacement of Next.js routing.
- No scroll-jacking, parallax, blur-heavy transitions, or long/bouncy motion.
- Do not claim a PDF is attached until the user chooses one of the existing demo files.
- Do not run automated tests, build, lint, typecheck, or Git commands. Use read-only review and manual browser inspection only if available.

## Design decisions

### Route transitions

- Use React's `ViewTransition` component through the existing Next.js App Router integration and `transitionTypes` on forward/back links and programmatic navigation.
- Apply the transition boundary to each participating page, not the persistent root layout. Keep `app/template.tsx` as a plain route wrapper so its remount behavior remains while its page-wide hidden initial state is removed.
- Forward navigation moves the old page slightly left and the new page in from the right. Back navigation reverses direction. Untyped browser back/forward and other transitions use a neutral crossfade.
- Target short motion: approximately 130–150ms exit, 240–280ms entry, and 16–24px of movement depending on viewport. Keep the transition overlay non-blocking.
- Scope the existing circular theme reveal to theme changes only. Route transitions use their own class-based selectors.
- Browsers without View Transition support keep normal navigation and readable content.

### Page and section entrances

- Share an ease-out curve close to `[0.22, 1, 0.36, 1]` and short durations around 300–380ms.
- Use small vertical travel (about 8–12px) and short stagger intervals (about 40–60ms). Keep the full first-screen sequence below roughly 700ms.
- Animate semantic groups: the page header, heading/copy, role cards, confirmation/summary, and each form field as one label-control-help unit. Do not animate individual glyphs or icons.
- Keep primary controls usable while motion runs. Do not use animation to delay focus, validation, or form submission.
- Keep initial content readable if client animation code is unavailable; avoid opacity-zero server markup. The progressive-enhancement fallback keeps reveal targets visible until the client motion runtime is ready.

### Registration scroll reveal

- Keep each existing `Panel` as a one-time viewport reveal unit, with its section title first and its field groups following in a brief stagger.
- Preserve the first-mount `initial` states inside the step's `AnimatePresence`; disabling initial animations there also disables the nested field reveals.
- Retain the existing directional animation between steps. Do not replay a field entrance for validation messages or every keystroke.
- Dynamic academic fields reveal only when their controlling answer makes them relevant.
- Keep the fixed mobile action bar, safe-area padding, visual-viewport keyboard handling, and space at the bottom of the form.

### Conditional proof panel

- Do not render the “Comprovante” panel or its empty-state sentence while `getRequiredProof(academic)` is `null`.
- Reveal the panel after the answers determine a type: `in_progress` → transcript; `completed` plus diploma available → diploma; `completed` plus diploma pending → the selected alternative document.
- Show the derived proof label as the already-selected/required type. Keep the existing demo PDF selection action; the file itself remains unattached until selected.
- Existing status-change handlers clear a stale selected file; preserve that behavior.

### Theme shortcut error

- Check that `event.key` is a string before normalizing or comparing it. Keep the current `D` shortcut behavior, modifier exclusions, repeat/default-prevented checks, and text-entry protection.
- The handler should ignore an event with no string key without throwing. Do not claim the originating browser/tool is identified unless it is reproduced.
- Catch synchronous `startViewTransition()` failures, clear the temporary theme marker/origin, and apply the selected theme directly.

### Reduced motion and visual consistency

- Honor `prefers-reduced-motion` centrally and in the existing local animation helpers. Remove translations and stagger delays for users who request reduced motion; keep content visible and state changes understandable.
- Preserve theme gradients, colors, fonts, components, and existing page copy apart from removing the obsolete empty proof prompt.
- Keep the page transition pointer-events pass-through rule and avoid collisions with the theme transition.

## Acceptance criteria

- A direct load of every route visibly renders its header and useful page content without waiting for a page-wide Motion opacity animation.
- Navigation `/` → `/profissional/cadastro` and the rest of the in-app journey has clear, short, direction-aware movement. Return links reverse it; browser back/forward remains usable with a neutral fallback.
- Home, cadastro, success, and platform pages use shared motion timing and a deliberate semantic reveal order.
- Registration panels reveal once on scroll; labels and their controls stay together; the mobile action bar and keyboard behavior remain usable.
- Before a proof type is determinable, the proof section and empty-state sentence are absent. Once determinable, the exact required type is shown and selected before the demo-file action.
- A keydown event without a string `key` does not throw; pressing `D` outside text entry still toggles theme.
- Server-rendered reveal content stays visible until the client motion runtime is ready; a synchronous view-transition API failure still applies the theme and leaves no stale marker.
- Theme circle reveal remains exclusive to theme changes. Reduced-motion settings skip translation and long stagger sequences.
- No automated test/build/lint/typecheck/Git command is run.

## Implementation decisions

- Use the installed React 19.3.1, Next.js 16.4.3 App Router, Motion 14.9.0, and CSS; add no packages.
- Use a shared page-transition boundary with typed route direction, shared Motion tokens, existing form state, and `getRequiredProof` as the source of truth.
- Validate the event payload defensively, while documenting that the source of the malformed event is not yet known.
- Keep this implementation in the current workspace and perform it inline; the user selected the Native execution approach.
