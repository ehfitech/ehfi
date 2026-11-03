# Professional Registration Terms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth terms-and-confirmations step, an honest draft privacy notice, and a searchable CREF state selector to professional signup.

**Architecture:** Keep registration and validation state in the existing signup client component and `lib/professional-registration.ts`. Add `/privacidade` as a server-rendered informational page. Reuse existing shadcn Checkbox, Combobox, Card, Label, and Link patterns.

**Tech Stack:** Next.js App Router as installed in this repository, React client state, TypeScript, existing shadcn/Base UI components, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-02-professional-registration-terms-design.md`

## Global Constraints

- The signup is a prototype: registration and consent values remain in memory and are not sent or persisted.
- The first two confirmations are required; promotional communications are optional and default to unchecked.
- CREF state uses the existing Combobox and includes the 26 states plus DF.
- CREF status does not prevent account creation; professional offering/attendance remains unavailable pending regularization and future validation.
- The privacy notice must distinguish current prototype behavior from planned future persistence and must not invent unresolved legal/operational facts.
- Do not run `git`, `typecheck`, `build`, `lint`, or `test`; do not add or run tests.
- Do not install dependencies.

## Review Focus

Because this repository forbids tests, review these behavior classes manually in the code and rendered UI where possible:

- Either required confirmation is absent: final submission must remain on step 4 and identify the missing item accessibly.
- Promotional opt-in is left unchecked: final submission must still proceed.
- CREF answer is awaiting or absent: the user can continue registration, while the existing conditional eligibility disclosure remains accurate.
- Privacy notice is opened: the signup session remains in its original tab, and the notice separates public profile data from private records and documents.
- State selector is searched by acronym or accented name: matching state remains selectable through the shadcn Combobox.

---

### Task 1: Add the fourth terms and confirmations step

**Files:**
- Modify: `lib/professional-registration.ts`
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Add `SignupTerms` with `privacyAcknowledged`, `authenticityDeclared`, and `marketingOptIn` booleans.
- Add `initialSignupTerms` with all values `false`.
- Add `validateSignupTerms(terms: SignupTerms)` returning errors only for the two required fields.

- [x] Add the consent type, initial state, and required-field validation to `lib/professional-registration.ts`.
- [x] Extend the wizard step type and progress UI to four steps: personal, academic, CREF, and terms.
- [x] Make the CREF step's successful continue action open terms; keep CREF branch validation and disclosures unchanged.
- [x] Render three accessible Checkbox controls with the exact approved copy; link the privacy acknowledgement to `/privacidade` in a new tab.
- [x] Keep promotional consent unchecked by default and outside required-field validation.
- [x] Make final submission validate the two required confirmations and otherwise continue to the existing success route.
- [x] Route Back from step 4 to CREF, preserving all in-memory form values.
- [x] Manually inspect the exact copy, four-step progress values, error associations, and handler branches.

### Task 2: Use the shadcn Combobox for CREF council state

**Files:**
- Modify: `components/ehfi/professional-signup.tsx`

**Interfaces:**
- Reuse the existing `crefCouncilOptions`, `Combobox*` components, `normalizeFormationSearch`, and `fieldProps` patterns.

- [x] Replace the native state `<select>` with a searchable Combobox showing state names while storing the two-letter UF.
- [x] Preserve required validation, accessible error text, and the existing searchable Combobox styling.
- [x] Manually inspect that all 26 states and DF remain available and that both state name and acronym match search.

### Task 3: Publish the draft privacy notice route

**Files:**
- Create: `app/privacidade/page.tsx`

**Interfaces:**
- Export a default App Router page component at `/privacidade`.

- [x] Write the privacy notice according to the specification, marking it as a prototype draft and separating live behavior from future processing.
- [x] Cover purposes, data categories, public/private profile fields, CREF verification, optional marketing, holder rights, and unresolved items required before real persistence.
- [x] Use existing application typography, semantic theme tokens, responsive structure, and a return link to the signup route.
- [x] Manually compare the page against every required privacy-notice bullet in the spec and confirm that no unresolved controller, vendor, retention, legal basis, or security details are invented.

## Execution Record

- The independent specification check reported no important open questions.
- The independent static code review reported no important findings.
- Ruling: keep acceptance state in the existing client-side session and do not add persistence — the current flow has no backend and the scope is the signup experience; cost if wrong: acceptances are lost when the page is left or refreshed.
- Ruling: use static source review only and make no commit — repository instructions prohibit Git and all automated test/build/lint/typecheck commands; cost if wrong: a runtime or compile issue may remain undetected.

