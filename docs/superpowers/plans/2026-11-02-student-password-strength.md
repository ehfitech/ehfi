# Student Password Strength Implementation Plan

> **For agentic workers:** Execute this plan inline with `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax for tracking. Project instructions prohibit tests and Git commands, so completion uses formatting and manual source inspection.

**Goal:** Add a live five-criterion password meter and accessible reveal controls to both student password fields.

**Architecture:** Keep password policy in `lib/student-registration.ts` as a typed derived helper reused by account validation and the new UI. Extend the existing student input group with an optional trailing action and render the meter under the main password field without changing the account grid.

**Tech Stack:** Existing Next.js App Router, React, TypeScript, React Icons, Tailwind tokens, and shadcn InputGroup/Button primitives.

**Spec:** `docs/superpowers/specs/2026-11-02-student-password-strength-design.md`

## Global Constraints

- Require all five criteria in the spec and keep exact password confirmation.
- Preserve the leading shield icon and use independent reveal state for password and confirmation.
- Do not add dependencies or change other fields, steps, routes, storage, or authentication.
- Do not run `git`, `typecheck`, `build`, `lint`, or `test`; do not create or run tests.
- Verify with Prettier and manual/static source inspection only.

## Review Focus

- A partially satisfied password must display the matching count, fill that many meter segments from left to right, show each checklist state independently, and fail account validation.
- All five criteria must pass; accented letters count as letters, and whitespace does not satisfy the special-character rule.
- Password confirmation continues to match the exact password regardless of visibility.
- Toggling either reveal button changes only its own field, preserves its value, and exposes a clear accessible name and state.
- Both leading shield icons remain; reveal controls meet the 44 × 44 px target, and the meter does not cause dynamic layout shifts.

---

### Task 1: Define and enforce the five password requirements

**Files:**

- Modify: `lib/student-registration.ts`

**Interfaces:**

- Add `getStudentPasswordRequirements(password: string)` returning five named boolean checks: `minLength`, `number`, `lowercase`, `uppercase`, and `special`.
- Use Unicode letter/number categories so accented letters remain letters; count eight Unicode code points and do not count whitespace as a special character.
- `validateAccount` requires all five booleans and preserves the exact confirmation match rule.

- [x] Add the pure requirement helper and use it in account validation.
- [x] Manually trace empty, partial, all-valid, accented-letter, whitespace-only-special, and mismatched-confirmation inputs against the rules.

### Task 2: Add the compact meter and reveal controls

**Files:**

- Modify: `components/ehfi/student-signup-fields.tsx`
- Modify: `components/ehfi/student-signup.tsx`

**Interfaces:**

- `StudentIconInput` accepts an optional trailing action while preserving its required leading icon.
- `StudentPasswordStrength` consumes the password and the typed requirement helper; it displays a five-segment meter, `n/5 requisitos atendidos`, and all five criteria.
- `StudentSignup` holds independent visibility booleans for `password` and `passwordConfirmation`.

- [x] Add the trailing action slot using the existing input-group primitive and an icon button with visible keyboard focus and a 44 × 44 px target.
- [x] Add the always-visible compact meter/checklist beneath Senha, with accessible criterion states and a polite count announcement.
- [x] Add independent show/hide buttons to Senha and Confirme sua senha; preserve both leading shield icons and exact values.
- [x] Manually inspect the account form's mobile/desktop structure, initial `0/5` state, all-pass state, validation copy, and focus/reader labels.

### Task 3: Format and verify the scoped change

**Files:**

- Modify: `docs/superpowers/specs/2026-11-02-student-signup-anamnesis-design.md`
- Modify: `docs/superpowers/plans/2026-11-02-student-signup-anamnesis.md`

- [x] Run Prettier on the changed TypeScript and Markdown files.
- [x] Confirm no other fields or routes changed and record that prohibited checks were not run.

## Execution Record

- Spec builder check: no material unanswered questions.
- Task 1 complete: one typed helper returns the five requirement states and the account validator requires all five alongside an exact password confirmation.
- Task 2 complete: the account form shows a stable 0/5 meter and checklist, accessible criterion states, and separate reveal controls for both password fields; both shield icons remain.
- Task 3 complete: existing signup design docs now reflect the stricter policy. Prettier formatted the changed TypeScript and Markdown sources. Source inspection confirmed the change is limited to account password behavior and its documentation.
- No automated checks were run because the project instructions prohibit `typecheck`, `build`, `lint`, and `test`; `git` commands were also not used.
- Ruling: treat special characters as Unicode punctuation or symbols (excluding whitespace) and count Unicode code points for the 8-character minimum — supports accented text and avoids counting a supplementary symbol twice — cost if wrong: a production identity policy may define length and allowed symbols differently.
- Final review: independent read-only source review found no critical or important issues; one minor deferred item is an unused `InputGroupButton` import in `components/ehfi/student-signup-fields.tsx`. The reviewer did not execute browser or screen-reader interaction checks.
- Follow-up fix: make meter segments fill sequentially from the left based on the count; keep checklist states tied to their individual criteria. Manual source review confirms the meter and checklist now serve separate meanings.
