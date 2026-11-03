# Student Signup and Anamnesis Implementation Plan

> **For agentic workers:** Execute this plan inline in the current workspace. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a six-step student registration and health anamnesis demonstration connected to the EHFI home screen.

**Architecture:** Keep student data and validation isolated in `lib/student-registration.ts` and render the journey in a dedicated client component. Extract the existing stepper's presentation into a configurable component used by both the five-step professional flow and the six-step student flow.

**Tech Stack:** Installed Next.js 16.4.3 App Router, React 19, TypeScript, Motion, React Icons, existing Tailwind/shadcn primitives and EHFI motion tokens.

**Spec:** `docs/superpowers/specs/2026-11-02-student-signup-anamnesis-design.md`

## Global Constraints

- Student signup has exactly six stages: Conta, Perfil físico, Movimento e rotina, Histórico de saúde, Cuidados e limitações, Objetivos e confirmações.
- Every step is reachable through the stepper; navigation preserves state and does not validate by itself; final submission checks all stages in order.
- Health-data consent is required to complete; guardian name/contact/confirmation are required when birth date indicates a minor.
- Any affirmative or uncertain health/safety response that needs professional review blocks completion; the demo displays why and does not send the answers for review.
- This is a demonstration: no auth, persistence, API, email, real review notification, or guardian verification.
- Reuse the EHFI visual/motion system and preserve professional signup behavior.
- Do not install packages or run `git`, `typecheck`, `build`, `lint`, or `test`; do not add or run tests.
- Verify with source inspection and manual requirement checklist only.

## Review Focus

- “Nenhuma” must not coexist with positive selections in health, symptoms, or current limitations.
- Conditional fields and validation must agree for medication, symptoms, limitations, past injury/surgery, exercise restrictions, pregnancy/postpartum, and “other” choices.
- Turning off a conditional branch must clear its hidden follow-up values; changing from minor to adult must clear guardian details.
- Consent and guardian confirmation must prevent final completion when absent; professional-review flags must also block completion.
- Direct step jumps must preserve state, while final submission must return to the earliest invalid stage and focus its first invalid field.
- Password, health answers, and guardian details must not be persisted, sent, or placed in navigation URLs.
- The student path must work on mobile and honor reduced-motion preference while the professional flow retains five steps.

---

### Task 1: Generalize the accessible signup stepper

**Files:**

- Create: `components/ehfi/signup-stepper.tsx`
- Modify: `components/ehfi/professional-signup-stepper.tsx`

**Interfaces:**

- `SignupStepDefinition<Step extends number>` contains `id`, `label`, and `compactLabel`.
- `SignupStepper<Step extends number>` accepts `ariaLabel`, ordered `steps`, `currentStep`, `completedSteps`, `continuedSteps`, and `onStepSelect`.
- Preserve `ProfessionalSignupStep` and `ProfessionalSignupStepper` exports as a typed five-step adapter.

- [x] Render dynamic equal-width steps, accessible labels/current state, focus rings, completed marks, connector motion and reduced-motion behavior.
- [x] Adapt the professional stepper to pass its current five labels through the generic component without changing its props or behavior.
- [x] Manually inspect the five-step and six-step definitions in source, including compact mobile labels and 44 px hit targets.

### Task 2: Define student registration data and validation

**Files:**

- Create: `lib/student-registration.ts`

**Interfaces:**

- Export `StudentSignupStep = 1 | 2 | 3 | 4 | 5 | 6`, `StudentRegistrationForm`, its initial value, field-error type, `validateStudentStep`, `getStudentAge`, and `requiresProfessionalReview`.
- Use typed string unions for single-choice values and arrays for modalities, diagnoses, symptoms, limitations, and goals.

- [x] Encode all supplied questions and conditional responses, including separate controlled-status, medication name/purpose, and guardian contact/confirmation fields.
- [x] Validate the six stages, optional weight/free text, exclusivity of “none”, conditional descriptions, consent, and under-18 guardian fields.
- [x] Derive professional-review need from affirmative/uncertain health/safety responses and block final completion when review is needed.
- [x] Manually trace validation rules against the design spec and ensure date parsing rejects invalid/future dates.

### Task 3: Implement the six-step student journey

**Files:**

- Create: `components/ehfi/student-signup.tsx`
- Create: `components/ehfi/student-signup-fields.tsx`
- Create: `app/aluno/cadastro/page.tsx`
- Consume: `components/ehfi/signup-stepper.tsx`, `lib/student-registration.ts`

**Interfaces:**

- Export `StudentSignup`; the page wraps it with the existing `PageTransition`.
- Keep all entered data in component state only. Route completion to `/aluno/sucesso` with no form data in the URL.

- [x] Build account, physical profile, activity/routine, health history, safety, and goals/confirmation sections with the field types and icons from the spec.
- [x] Add conditional fields and animations, the minor guardian section, demo-only privacy notice, and local professional-review indicator.
- [x] Add direct step navigation, valid-Continue connector state, ordered final validation, first-invalid focus, back/continue controls, keyboard inset handling, and reduced-motion support.
- [x] Clear all in-memory answers, including credentials and health data, before success navigation; ensure the form makes no network or browser-storage calls.
- [x] Manually inspect all six branches and the guardian/review conditional states in source.

### Task 4: Connect entry, confirmation, and privacy copy

**Files:**

- Modify: `components/ehfi/role-card.tsx`
- Modify: `components/ehfi/welcome-screen.tsx`
- Create: `components/ehfi/student-signup-success.tsx`
- Create: `app/aluno/sucesso/page.tsx`
- Modify: `app/privacidade/page.tsx`

- [x] Enable the student card and make the home demo note apply to both profiles.
- [x] Add a student-specific success page that clearly states no real account/data was created or sent.
- [x] Add student data categories, future purpose, minor guardian role, and demo-only storage statement to the privacy notice; link the consent to the student section.
- [x] Manually confirm route links, disclosure copy, and separation between the professional and student information.

## Execution Record

- Task 1 complete: generic SignupStepper and typed professional adapter added. Read-only source inspection confirmed the adapter retains all five labels, dynamic column count, accessible current/complete state, reduced-motion handling, and the existing 44 px minimum target. No prohibited commands or tests were run.
- Task 2 complete: student data types, initial state, conditional validators, age calculation, and review blocker added. Read-only source inspection matched required/optional rules to the spec, including consent/guardian gates and exclusive “none” choices.
- Task 3 complete: six-step student flow added with conditional fields, icons, motion, direct navigation, ordered validation/focus, guardian flow, privacy notice, and review blocker. Static scans found no `fetch`, `localStorage`, or `sessionStorage` calls in student form files; completion clears component state before routing.
- Task 4 complete: home entry, demo success route, and student privacy disclosure connected. Read-only route and copy checks confirmed the student success message is separate from professional signup and carries no form data.
- Ruling: the original eight-character minimum was expanded by the approved five-criterion student password spec — this gives immediate feedback and a clear demo policy — cost if too strict: people with an otherwise long password may need to create a different one before continuing.
- Ruling: clear conditional answers when their parent selection no longer applies — avoids retaining hidden health details that could be submitted out of context — cost if wrong: a person who changes an answer back must re-enter the follow-up.
- Ruling: clear the complete in-memory form before opening success — releases password, health, and guardian details after the demo flow ends — cost if wrong: the user cannot go back and revise those responses after completion.
- Ruling: use the same broad health/safety review rule to block final completion, including medication, any reported condition, symptoms, current limitation, past injury/surgery, restrictions, pregnancy/postpartum, or additional health information — follows the user's decision to prevent creation when review is needed — cost if wrong: people whose answers do not actually require review may be unable to finish; the demo has no handoff for blocked cases.
- Use read-only source checks and a manual requirement review. Project instructions prohibit automated tests and the commands listed above.
