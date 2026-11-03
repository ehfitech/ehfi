# EHFI CREF Registration Implementation Plan

> **For agentic workers:** Execute inline in this workspace. Tasks use checkbox tracking. Project instructions prohibit Git, tests, build, lint, and typecheck; do not run them.

**Goal:** Add a third professional-signup step for CREF details and show practice restrictions only for the selected situations that prevent professional activity, while still allowing signup to finish.

**Architecture:** Extend the existing local registration model with typed CREF answers and branch validation. Expand the existing client form to three steps, reuse its selectable cards and simulated PDF dialog, and keep the completion disclosure limited to this demo's validation and storage behavior.

**Tech Stack:** Next.js 16.4.3 App Router, React 19.3.1, Motion 14.9.0, Tailwind CSS 4, existing shadcn/Base UI components.

**Spec:** `docs/superpowers/specs/2026-11-02-ehfi-cref-registration-design.md`

## Global Constraints

- Keep CREF and academic form data in memory only; do not send or persist it.
- Use demonstration PDF choices only; do not open a device file picker or upload files.
- Let all three CREF answers complete account creation after applicable fields validate.
- Show the practice restriction only for awaiting issuance, no registration, or declared pending issues; allow every branch to finish signup.
- Do not add approval or service/booking systems.
- Do not run Git, tests, build, lint, or typecheck.

## Review Focus

- Switching CREF answers must not discard values entered in another branch; review state updates and branch rendering in Task 1 and Task 2.
- “Sim” must require every field and matching attachment; review the validator and submit guard in Task 1 and Task 2.
- “Aguardando” must require only the request situation and allow an absent proof; review the validator and optional attachment path in Task 1 and Task 2.
- “Ainda não possuo” must remain completable while showing the legal disclosure; review branch rendering and final-step behavior in Task 2.
- A regular self-declaration or selected demo file must not imply approval; review the self-declaration note and make sure practice restrictions display only for the choices defined in the spec.

---

### Task 1: Define CREF form data and validation

**Files:**
- Modify: `lib/professional-registration.ts`

**Interfaces:**
- Export `CrefAnswer = "registered" | "awaiting" | "none"`.
- Export `CrefDeclaredSituation = "regular" | "pending_issues"`.
- Export `CrefForm`, `CrefField`, `CrefErrors`, `initialCref`, `crefCouncilOptions`, and `validateCref(form: CrefForm): CrefErrors`.
- `CrefForm` carries answer, council UF, registration number, declared situation, request situation, professional-card demo filename, and optional request-proof demo filename.

- [x] Add all 26 state and Federal District options, each with UF and full name.
- [x] Add the CREF discriminant and form field types plus an empty initial form.
- [x] Validate that an answer is selected; for `registered`, require council, non-empty registration number, declared situation, and card filename; for `awaiting`, require request-situation text; for `none`, add no branch-field errors.

### Task 2: Add the third signup step and CREF branches

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Preserve the `ProfessionalSignup` export and existing personal/academic state.
- Add local `CrefForm` state and use `validateCref` for final-step validation.
- Reuse the current demonstration document dialog for CREF card and optional protocol PDFs.

- [x] Change the step state and header/progress calculations to three steps with 33%, 67%, and 100% progress.
- [x] Route academic Continue to CREF, add Back from academic to personal and from CREF to academic, and make the submit action context-sensitive.
- [x] Render the required CREF question and three answer cards; retain branch values when changing the selected answer.
- [x] Render the registered branch with state/council native select, registration number, regular/pendências choice, and required professional-card demo PDF.
- [x] Render the awaiting branch with required request-situation text and optional protocol/proof demo PDF.
- [x] Render the no-registration legal-habilitation disclosure and allow the branch to finish without further fields.
- [x] Show the practice-restriction notice only for awaiting issuance, no registration, or declared pending issues; let all answers continue signup.
- [x] Keep the regular status marked as a self-declaration rather than verification, and keep all documents in the demo-only file flow.
- [x] Keep current responsive action bar, first-invalid-field scroll behavior, reduced-motion handling, and demo-only file messaging.

### Task 3: Keep completion disclosure demo-specific

**Files:**
- Modify: `components/ehfi/signup-success.tsx`

**Interfaces:**
- Preserve the `SignupSuccess` export and existing route links.

- [x] Keep a completion notice that this demo does not validate or store CREF information without repeating the conditional service restriction for every answer.
- [x] Keep the existing notice that information and documents were not sent or stored.

### Task 4: Source review

**Files:**
- Modify: `docs/superpowers/plans/2026-11-02-ehfi-cref-registration.md`

- [x] Review the changed model, form branches, navigation, validation, attachments, and success disclosure against the spec; adjust invalid-field scrolling to run after the validation state renders and focus the first invalid control.
- [x] Record that no Git, tests, build, lint, or typecheck commands were run.

