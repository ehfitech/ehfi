# Professional Signup Stepper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the percentage bar with an elegant, animated four-stage stepper that allows direct navigation to every signup stage while preserving ordered validation at submission.

**Architecture:** Add a focused `ProfessionalSignupStepper` component for accessible step navigation and animation. Keep stage state, validation-derived completion, direct navigation, error focus, and submission logic in `ProfessionalSignup`.

**Tech Stack:** Next.js App Router as installed, React, TypeScript, Motion, existing EHFI motion tokens, Tailwind CSS, existing shadcn/Base UI primitives.

**Spec:** `docs/superpowers/specs/2026-11-02-professional-signup-stepper-design.md`

## Global Constraints

- Show all four steps: `Seus dados`, `Sua formação`, `Registro CREF`, and `Termos e confirmações`.
- Every step is clickable, including future steps; navigation preserves all form state and does not validate solely because a step was opened.
- Final submission validates every step in order and directs the user to the earliest invalid step.
- Step completion represents valid form fields only. CREF completion does not imply credential validation or professional approval.
- Fill a connector only after a valid click on Continue from its source step; field validity alone may update the circle but must not fill the line.
- Animate connector fill and circle state smoothly with the existing `ehfiEase`; disable or reduce animation for reduced-motion preference.
- Keep all four steps visible on mobile without horizontal scrolling; provide at least 44 × 44 px hit areas.
- Do not change persistence, CREF policy, eligibility, public profile fields, or backend behavior.
- Do not install dependencies.
- Do not run `git`, `typecheck`, `build`, `lint`, or `test`; do not add or run tests.

## Review Focus

Because the repository forbids tests, inspect these cases manually in source:

- Clicking any of the four steps changes the current content without clearing form values.
- A future stage can be opened directly but cannot bypass required fields at final submission.
- When several stages are invalid at submission, the first invalid stage is selected and its first invalid field receives focus after the stage transition.
- CREF “completed” styling means its selected branch is filled correctly, including `awaiting`/`none`, and never looks like credential approval.
- Connector and circle animations preserve layout, remain legible in light/dark themes, and become immediate with reduced motion.
- Mobile layout shows all four stages at once with full accessible names, visible focus, and adequate touch targets.

---

### Task 1: Build the animated accessible stepper component

**Files:**
- Create: `components/ehfi/professional-signup-stepper.tsx`

**Interfaces:**
- Export `ProfessionalSignupStep = 1 | 2 | 3 | 4`.
- Export `ProfessionalSignupStepper` with props `{ currentStep: ProfessionalSignupStep; completedSteps: ReadonlySet<ProfessionalSignupStep>; continuedSteps: ReadonlySet<ProfessionalSignupStep>; onStepSelect: (step: ProfessionalSignupStep) => void }`.

- [x] Render a four-item ordered navigation list with the full desktop labels and compact visual labels at mobile widths.
- [x] Make every step a button; expose `aria-current="step"` for the active item and accessible names containing step number, name, and completion state.
- [x] Render numbered incomplete circles, an emphasized current circle, and a checkmark for valid non-current steps; never communicate state by color alone.
- [x] Render three connector segments whose fill is triggered only by a valid Continue action from the step before each segment.
- [x] Animate connector `scaleX` from its left edge and circle/checkmark state with a short, consistent ease; honor reduced motion.
- [x] Manually inspect component semantics, 44 px hit areas, focus-visible treatment, and responsive classes.

### Task 2: Replace the progress bar and enable direct navigation

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Consume `ProfessionalSignupStep` and `ProfessionalSignupStepper` from Task 1.
- Derive completed step IDs from `validatePersonal`, `validateAcademic`, `validateCref`, and `validateSignupTerms`.

- [x] Replace the percentage bar and `Etapa X de 4` label with `ProfessionalSignupStepper`; retain the active stage heading as the content title.
- [x] Add a direct-navigation handler that updates direction/current stage and preserves all existing form state.
- [x] Keep existing Back/Continue button behavior and current per-stage validation.
- [x] Allow all four step buttons to open any stage without validating only because of navigation.
- [x] Manually inspect that each step label and active stage heading map to the existing form branches.

### Task 3: Validate the complete sequence before final submission

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Reuse the existing `validatePersonal`, `validateAcademic`, `validateCref`, and `validateSignupTerms` functions and attempted flags.

- [x] On final submission, reveal validation errors for every stage and find the first invalid stage in order: personal, academic, CREF, terms.
- [x] If invalid, move to that stage, keep the form state, and focus/scroll to its first invalid field after the stage transition finishes.
- [x] Navigate to the existing success route only when all four stage validators pass.
- [x] Manually trace direct jumps to step 4 with empty data, invalid early-stage data, and fully valid data; confirm CREF self-declaration is not presented as validation.

## Implementation Record

- Added `components/ehfi/professional-signup-stepper.tsx` and integrated validation-derived circle states, Continue-triggered connector progress, and direct navigation into `components/ehfi/professional-signup.tsx`.
- Source-only review confirmed that step navigation does not clear form state, every step is reachable, and final submission checks validators in order before using the existing success route.
- CREF completion is derived from the selected answer's existing form validator; it does not set or imply credential approval.
- Reduced-motion handling, focus-visible styles, full accessible step names, 44 px minimum button height, and compact four-column mobile labels are present in source.
- A fresh read-only code review found no important issues.
- Per project instructions, no tests or prohibited commands (`git`, `typecheck`, `build`, `lint`) were run.

