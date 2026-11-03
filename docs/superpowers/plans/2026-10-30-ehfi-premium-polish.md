# EHFI Premium Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the responsive EHFI welcome and professional registration experience, fixing the reported form/card issues while adding restrained scroll and theme transitions.

**Architecture:** Keep the existing route and form state model. Add small focused helpers for icon input composition and theme transition, use the installed shadcn/Base UI Combobox, and tune existing welcome/form components and global theme CSS.

**Tech Stack:** Next.js 16.4.3 App Router, React 19.3.1, Tailwind CSS 4, shadcn/Base UI, Motion 14.9.0, next-themes, react-icons/io5.

**Spec:** `docs/superpowers/specs/2026-10-30-ehfi-premium-polish-design.md`

## Global Constraints

- Keep the EHFI pink/lilac light and dark gradients, current typography, routes, and user-provided PWA icon files.
- Do not create, edit, or resize image assets, add dependencies, add API/database/persistence, or use a real file picker.
- Keep all user-entered registration values in component memory and preserve the demo-only PDF choice.
- Use existing shadcn/Base UI components and Ionicons from `react-icons/io5`.
- Honor `prefers-reduced-motion` and keep page layouts responsive from narrow mobile through desktop.
- Do not run tests, build, lint, typecheck, or any Git command. Use manual visual browser review only.

## Review Focus

- 11-digit mobile versus 10-digit landline formatting and caret usability — manually inspect both formatted examples in the rendered field.
- Keyboard and screen-reader labeling for searchable formation selection — inspect visible label, invalid state, selection, and no-results UI.
- Light/dark boundary and theme animation origin — inspect both themes and reduced-motion/fallback behavior.
- Offscreen and reduced-motion content visibility — inspect the mobile scroll sequence and desktop form layout.
- Touch spacing and narrow-width overflow — visually inspect mobile and desktop browser sizes.

---

### Task 1: Refine welcome layout and intentional entrance hierarchy

**Files:**
- Modify: `components/ehfi/welcome-screen.tsx`
- Modify: `components/ehfi/role-card.tsx`

**Interfaces:**
- Consume the existing `ThemeToggle` and `RoleCard` interfaces.
- Keep the existing public component exports and route links.

- [x] Replace the welcome panel's white border with the semantic `border-border` treatment and keep the current EHFI gradients.
- [x] Add short, reduced-motion-aware entry timing for the heading, support copy, focus-area row, welcome panel, and role choices.
- [x] Increase both role-card content areas to explicit 20px+ padding and a shared minimum height near 192px; keep status/action labels clear and aligned.
- [x] Preserve the student disabled state and professional navigation while keeping press/hover movement subtle.
- [x] Manually inspect the welcome route in light/dark mode at desktop width and in dark mode at a 390px mobile viewport.

### Task 2: Correct phone mask and add contextual input groups

**Files:**
- Modify: `lib/professional-registration.ts`
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Keep `formatPhone(value: string): string` and `formatWithCaret(...)` interfaces.
- Keep `PersonalForm`, `AcademicForm`, validation functions, and `ProfessionalSignup` export intact.
- Use installed `InputGroup`, `InputGroupAddon`, and `InputGroupInput`; no dependency changes.

- [x] Change the formatter to use a 5+4 local split for 11 digits and 4+4 for 10 digits, with DDD parentheses.
- [x] Add a focused `IconInput` helper in the signup component or a local colocated file that keeps the input before the addon in DOM order.
- [x] Replace each plain textual `Input` with an input group and contextual Ionicons; retain ids, values, mask callbacks, autocomplete, validation props, and labels.
- [x] Ensure the full group indicates focus and invalid states and the decorative icon stays hidden from assistive technology.
- [x] Manually inspect phone formatting/caret and the personal/academic form fields at desktop and mobile widths.

### Task 3: Make formation type searchable and reveal form sections on scroll

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`
- Modify: `components/ui/combobox.tsx`

**Interfaces:**
- Use existing `formationOptions`, `FormationType`, academic state/update flow, and installed Combobox exports.
- Keep conditional `Outro`, academic status, year, proof selection, and validation semantics unchanged.

- [x] Replace the shadcn `Select` with a controlled Combobox containing the existing five formation values; make its filter match the option title and description.
- [x] Connect the visible `Label`, error `aria-describedby`, `aria-invalid`, selected value, and existing “Outro” state reset.
- [x] Add a concise empty-results message and keep options keyboard navigable through Base UI.
- [x] Make each form panel reveal once upon entering view and briefly stagger field groups within that panel; preserve reduced-motion visibility with no movement or delay.
- [x] Preserve directional step transitions and existing smooth scroll-to-error behavior.
- [x] Manually inspect scrolling, keyboard selection, empty results, conditional academic choices, desktop/mobile form layouts, and mobile step-two footer clearance.

### Task 4: Animate theme changes progressively and keep accessible fallback

**Files:**
- Create: `lib/theme-transition.ts`
- Modify: `components/ehfi/theme-toggle.tsx`
- Modify: `components/theme-provider.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Export `transitionTheme(theme: "light" | "dark", applyTheme: () => void, origin?: { x: number; y: number }): void` from `lib/theme-transition.ts`.
- Keep `ThemeToggle` and `ThemeProvider` public interfaces unchanged.

- [x] Implement a feature-detected `Document.startViewTransition` path that updates the root theme synchronously within the transition callback and calls `next-themes` to persist preference.
- [x] Fall back to the normal `next-themes` update for unsupported browsers and reduced-motion preference.
- [x] Set the circular reveal origin from the clicked theme button; use viewport center for the keyboard shortcut.
- [x] Add root view-transition keyframes and reduce their duration to zero under reduced-motion preference.
- [x] Animate the theme icon swap with a short opacity-only transition or no movement for reduced motion.
- [x] Manually inspect theme changes from the button and `D` keyboard shortcut. Reduced-motion and unsupported-browser paths were reviewed in code, not emulated.

### Task 5: Review and record the result

**Files:**
- Create: `.superpowers/sdd/2026-10-30-ehfi-premium-polish/progress.md`
- Modify: spec/plan progress markers as review completes.

- [x] Re-read the spec and inspect the modified code for unchanged local-only data behavior, accessibility semantics, and theme tokens.
- [x] Review welcome in both themes at desktop width and dark mode at mobile width; inspect registration at desktop/mobile widths in the available theme. Reduced motion was not emulated.
- [x] Record what was visually inspected and explicitly state that automated tests and prohibited commands were not run.
- [x] Collect unresolved low-risk decisions and describe them in the final handoff; no blocking question remains.
