# Atuação em Ginástica Laboral Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional, memory-only Ginástica Laboral stage to the professional signup flow.

**Architecture:** Keep the current client-side signup architecture. Add a typed optional form model and paired-time validation in `lib/professional-registration.ts`, expand the existing stepper to five steps, and render the new controlled form branch in the current signup component. Update only the privacy data-category list; do not add matching, sharing, or persistence behavior.

**Tech Stack:** Next.js 16.4.3 App Router, React 19.3.1, TypeScript, existing shadcn-style controls, Tailwind CSS, Motion.

**Spec:** `docs/superpowers/specs/2026-11-02-professional-ginastica-laboral-design.md`

## Global Constraints

- Keep the new answers in in-memory client state; do not send or persist them.
- The Ginástica Laboral step is optional and cannot block signup when left blank.
- A blank interest answer is distinct from an explicit “Não”.
- Keep “Termos e confirmações” as step 5 and the final step.
- Do not add dependencies or tests.
- Do not run `git`, `typecheck`, `build`, `lint` or `test`.
- Follow the existing form styles, accessibility patterns, reduced-motion handling, and navigation behavior.

## Review Focus

- Interest state: an untouched step remains distinct from explicit “Não” and does not block submission; “Não” hides dependent fields, and switching back to “Sim” restores in-memory answers.
- Modalities: “Todas” maps to all three concrete selections, and toggling it does not create a fourth stored mode.
- Exact time: neither endpoint is required when both are empty; filling one endpoint requires the other; a complete pair passes.
- Service areas: empty/whitespace input is ignored, duplicates are prevented, keyboard addition works, and each chip can be removed.
- Navigation: all five step labels, forward/back controls, direct jumps, final required-step validation, and first-invalid focus remain coherent.

---

### Task 1: Define the optional labor availability model and five-step navigation

**Files:**
- Modify: `lib/professional-registration.ts`
- Modify: `components/ehfi/professional-signup-stepper.tsx`
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Produce `ProfessionalLaborForm`, its option unions, `initialProfessionalLabor`, and `validateProfessionalLabor(form: ProfessionalLaborForm): ProfessionalLaborErrors` in `lib/professional-registration.ts`.
- `ProfessionalSignupStep` becomes `1 | 2 | 3 | 4 | 5`; step 4 is Ginástica Laboral and step 5 is Terms.
- The validator returns an error only for an incomplete custom start/end pair. All other labor fields remain optional.

- [x] Add the typed model and initial values. Store modalities as the three concrete keys `collective`, `sector`, and `shift`; store the all-modalities shortcut only by selecting all three.
- [x] Implement paired-time validation with field-specific messages; both empty is valid, exactly one filled is invalid, both filled is valid.
- [x] Expand the stepper labels and its five-column layout while retaining current state labels, `continuedSteps` connectors, focus styles, and reduced-motion behavior.
- [x] Add the new form state, derive its completion from an explicit yes/no interest response, and keep untouched optional state out of final required-step validation.
- [x] Manually trace the model defaults, step labels, direct navigation, and optional-step completion semantics before moving to Task 2.

### Task 2: Render the Ginástica Laboral form and connect navigation

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Consume `ProfessionalLaborForm`, `initialProfessionalLabor`, and `validateProfessionalLabor` from Task 1.
- Keep the Terms branch at step 5; the new controlled form branch is step 4.

- [x] Add all specified fields with fieldsets/legends, explicit labels, keyboard-operable controls, and existing reveal/motion patterns.
- [x] Show dependent questions only for interest `yes`; preserve their in-memory values when the answer changes to `no` and back to `yes`.
- [x] Implement the “Todas as modalidades” shortcut as select-all/clear-all over the three concrete modes.
- [x] Implement the optional start/end inputs and the custom service-area chips. Ignore blank chip input, prevent duplicate entries case-insensitively, support Enter and an Add button, and expose labeled remove buttons.
- [x] Update submit branching, Continue/Back mapping, the Terms heading/icon, final button label, scroll anchoring, and final validation to use step 5 for Terms.
- [x] Manually trace skipped, “Não”, “Sim”, partial-time, complete-time, city addition/removal, direct-jump, and invalid-required-field flows.

### Task 3: Update privacy categories and review the finished change

**Files:**
- Modify: `app/privacidade/page.tsx`
- Review: `components/ehfi/professional-signup.tsx`
- Review: `components/ehfi/professional-signup-stepper.tsx`
- Review: `lib/professional-registration.ts`

- [x] Add a neutral category for the new interest, experience, modality, schedule, frequency, service-area, and travel answers. State that the current demonstration keeps responses only in page memory and does not send or save them; leave future operational use and sharing of these answers undefined.
- [x] Re-read the spec and manually check every field, optionality, field dependencies, responsive layout classes, accessible labels, and reduced-motion behavior.
- [x] Confirm by source inspection that no API, server action, storage mechanism, dependency, or later-edit screen was added.
- [x] Record that no tests or prohibited commands were run, as required by the repository instructions.
