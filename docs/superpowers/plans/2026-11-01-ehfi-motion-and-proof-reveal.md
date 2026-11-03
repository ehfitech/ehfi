# EHFI Motion and Conditional Proof Reveal Implementation Plan

> **For agentic workers:** Execute inline in this workspace. Tasks use checkbox tracking. Project instructions prohibit Git, tests, build, lint, and typecheck; do not run them.

**Goal:** Add polished, coherent route and scroll motion to EHFI, show the proof panel only when required, and harden first paint and the theme shortcut.

**Architecture:** Use React `ViewTransition` boundaries on each route with Next `transitionTypes` for direction. Keep Motion for semantic page entrances, scroll reveals, and the existing two-step form transition, with shared timing tokens. Use `getRequiredProof` to gate the proof panel and guard the theme keydown payload.

**Tech Stack:** Next.js 16.4.3 App Router, React 19.3.1, Motion 14.9.0, Tailwind CSS 4, next-themes.

**Spec:** `docs/superpowers/specs/2026-11-01-ehfi-motion-and-proof-reveal-design.md`

## Global Constraints

- Preserve the current EHFI colors, gradients, typography, routes, form fields, validation, local-only data, and demonstration-only file selection.
- Add no dependencies or assets.
- Keep the initial page content readable and never make the whole page depend on a Motion hydration animation.
- Respect reduced motion, safe areas, mobile keyboard behavior, and the existing theme preference flow.
- Do not run Git, tests, build, lint, or typecheck. No automated tests are part of this work.
- Use static source inspection and manual browser inspection only if a browser preview is available without violating these constraints.

## Review Focus

- First-paint visibility and page content on a narrow mobile viewport.
- Direction consistency for forward, return, and browser back/forward navigation.
- Stagger pacing and re-entry behavior during long-form form scrolling.
- Proof-panel state after each academic answer path and after changing an answer.
- `keydown` events with absent/non-string `key`, normal `D` key, modifiers, and text-entry targets.
- Interaction between route View Transitions and the existing theme circle reveal.
- Reduced-motion behavior, fixed mobile CTA, VisualViewport keyboard inset, and focused-field visibility.

---

### Task 1: Remove the invisible route shell and harden theme transition handling

**Files:**
- Modify: `app/template.tsx`
- Modify: `components/theme-provider.tsx`
- Modify: `lib/theme-transition.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Keep the root `Template({ children })` default export and theme shortcut behavior.
- Keep `transitionTheme(theme, applyTheme, origin?)` public interface intact.

- [x] Replace the root Motion wrapper's opacity-zero initial state with a plain `min-h-dvh` wrapper.
- [x] Guard `event.key` with a string check before `.toLowerCase()`; retain existing shortcut exclusions.
- [x] Scope the circular `::view-transition-new(root)` theme reveal to a theme-transition attribute set/cleared by `transitionTheme`.
- [x] Preserve neutral behavior for reduced-motion and browsers without `startViewTransition`; catch synchronous API failures and apply the theme directly.
- [x] Keep server-rendered reveal targets visible until the client motion runtime is ready, and confirm the route shell has no hidden initial style.

### Task 2: Add direction-aware route transitions

**Files:**
- Create: `components/ehfi/page-transition.tsx`
- Modify: `app/globals.css`
- Modify: `app/page.tsx`
- Modify: `app/profissional/cadastro/page.tsx`
- Modify: `app/profissional/sucesso/page.tsx`
- Modify: `app/profissional/plataforma/page.tsx`
- Modify: `components/ehfi/role-card.tsx`
- Modify: `components/ehfi/professional-signup.tsx`
- Modify: `components/ehfi/signup-success.tsx`
- Modify: `components/ehfi/platform-placeholder.tsx`

**Interfaces:**
- `PageTransition({ children }: { children: React.ReactNode })` wraps a route's page content with React `ViewTransition` classes.
- `nav-forward` and `nav-back` are the shared transition type strings used by links and `router.push`.

- [x] Add a reusable route transition boundary mapping forward, back, and untyped navigation to CSS classes.
- [x] Wrap all four route pages with that boundary, following the installed Next guide's page-level pattern.
- [x] Mark role-to-signup, signup-to-success, and success-to-platform navigation as forward.
- [x] Mark home/back links as back; tag programmatic success navigation through `router.push` options.
- [x] Add short old/new pseudo-element keyframes with a restrained mobile offset, neutral fallback, non-blocking overlay, and reduced-motion rules.
- [x] Keep theme transition selectors isolated from route transition selectors.

### Task 3: Unify page entrance motion

**Files:**
- Create: `lib/ehfi-motion.ts`
- Modify: `components/ehfi/welcome-screen.tsx`
- Modify: `components/ehfi/role-card.tsx`
- Modify: `components/ehfi/professional-signup.tsx`
- Modify: `components/ehfi/signup-success.tsx`
- Modify: `components/ehfi/platform-placeholder.tsx`
- Modify: `components/theme-provider.tsx`

**Interfaces:**
- Export shared easing, durations, and semantic entrance helpers/variants from `lib/ehfi-motion.ts`.
- Preserve existing public page-component and form-component exports.

- [x] Centralize ease, duration, offsets, and short stagger intervals.
- [x] Sequence the header and primary content on Home, cadastro, success, and platform pages using shared values.
- [x] Reveal semantic groups rather than individual icons, glyphs, or each text fragment.
- [x] Apply a user-level reduced-motion policy centrally and keep the explicit page/form controls consistent with it.
- [x] Preserve initial readability and existing theme, focus, and responsive styling.

### Task 4: Refine form scroll reveal and conditional proof panel

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Keep `getRequiredProof`, academic state, `selectedFile`, validation rules, and existing demo file-selection dialog unchanged.

- [x] Reveal each panel once as it enters the viewport; animate its section title followed by field units with a short, capped stagger.
- [x] Keep label, control, hint, and nearby validation error in one field unit.
- [x] Keep step transitions and dynamic academic-field transitions short and reduced-motion aware.
- [x] Render the proof panel only when `requiredProof` is non-null; remove the empty-state sentence.
- [x] Show the derived proof label immediately as the selected/required document type and keep demo PDF selection separate from document-type selection.
- [x] Preserve stale-file clearing when status/diploma/alternative-document answers change.
- [x] Inspect all proof branches in source; manually inspect the in-progress branch and its rendered required-proof label.

### Task 5: Manual review and record

**Files:**
- Modify: this plan's completion checkboxes.

- [x] Review source and rendered UI for route directions, scroll reveals, conditional proof visibility, and the keydown guard.
- [x] Inspect narrow mobile width and the fixed action bar; a software keyboard/VisualViewport overlay could not be emulated in the browser preview.
- [x] Review reduced-motion and theme-transition rules in source; their system preference/API failure modes were not separately emulated.
- [x] Record explicitly that no tests, build, lint, typecheck, or Git commands were run.

### Follow-up: restore first-load field reveals

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`
- Modify: this spec and plan.

- [x] Trace the missing first-load animation to `AnimatePresence initial={false}`, which suppressed nested initial states.
- [x] Remove that override so visible fields enter in sequence and below-fold fields retain their scroll reveal.
- [x] Manually confirm off-screen fields remain hidden before scrolling and reveal on scroll, including a narrow mobile viewport; restore the browser viewport afterward.
