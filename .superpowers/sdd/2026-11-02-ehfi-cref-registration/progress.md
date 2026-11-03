# SDD ledger — plan: docs/superpowers/plans/2026-11-02-ehfi-cref-registration.md

Ruling: Do not add or run automated tests or execute build, lint, typecheck, or Git commands — the workspace AGENTS.md explicitly prohibits those commands and says tests are out of scope — cost if wrong: no automated regression signal is available.

Ruling: Implement in the current workspace without creating an isolated Git worktree — the user asked for inline/native implementation and Git operations are prohibited — cost if wrong: changes are not isolated from other work in this checkout.

Pre-flight: Task 1 exports `CrefForm`, `CrefField`, `CrefErrors`, `initialCref`, `crefCouncilOptions`, and `validateCref`; Task 2 consumes those exact names. Task 3 remains generic because the demo does not persist signup state across routes.

Task 1: complete (model and validator added; source inspected; automated tests prohibited by AGENTS.md).
Task 2: complete (three-step navigation, conditional branches, validation, demo attachments, and pending disclosure added; source inspected).
Task 3: complete (completion notice reflects pending validation and local-only demo behavior; source inspected).
Task 4: complete (whole-change static review completed; invalid-field timing finding fixed; no prohibited commands have been run).

Final review: fresh reviewer found that scroll-to-error ran before React committed `aria-invalid`; fixed by deferring focus/scroll to the next animation frame and adding invalid targets to the academic selection groups and proof button.

Final: minor (deferred): Represent choice cards as native radio groups — existing buttons remain keyboard operable and expose selection with `aria-pressed`; full radio-group arrow-key semantics are outside this step's scope.

Final: Ruling: Visual layout, real screen-reader announcements, animation timing, and runtime integration were not verified — workspace instructions prohibit build/test/lint/typecheck and only static source review was permitted — cost if wrong: a rendered issue could remain undetected.

Follow-up: Removed the universal CREF practice-restriction panel. It now appears only for awaiting issuance, no registration, or declared pending issues; the success screen keeps only the demo/no-validation disclosure.

