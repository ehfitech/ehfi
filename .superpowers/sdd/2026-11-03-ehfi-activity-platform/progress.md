# SDD ledger — plan: docs/superpowers/plans/2026-11-03-ehfi-activity-platform.md

## Setup

- Spec read: `docs/superpowers/specs/2026-11-03-ehfi-activity-platform-design.md` (approved by user).
- Plan read: `docs/superpowers/plans/2026-11-03-ehfi-activity-platform.md` (user chose Native execution).
- Preflight Task 1 -> Tasks 3–5: SQL tables/RPCs and generated-style types define all mutation and read projections. Keep task outputs aligned through `lib/activities/types.ts`.
- Preflight Task 2 -> Tasks 3–5: the shared role shell and route guards must land before profile, agenda, and discovery screens.
- Preflight Task 3 -> Task 5: the student's discovery projection depends on the explicitly editable public professional profile and its visibility state.
- Next.js 16.4.3 installed guides were read for layouts/pages, server actions/forms/security, authentication, and redirects before implementation.

## Rulings

- Ruling: Work in the current workspace without a worktree, Git commands, or Git-backed plan scripts — the repository instructions prohibit `git`, and the user chose Native execution — cost if wrong: changes are not isolated and no Git diff can be used as a review artifact.
- Ruling: Replace TDD and automated verification with static inspection and manual code-path review — the repository instructions prohibit tests and the user said not to work with tests — cost if wrong: runtime behavior has no automated evidence in this pass.
- Ruling: Do not run typecheck, build, lint, or test commands — explicitly prohibited by repository instructions — cost if wrong: compile/runtime issues may remain undiscovered.
- Ruling: Do not connect to or mutate remote Supabase — the approved plan limits this work to a local migration and setup note — cost if wrong: the implementation is not live until the operator applies the migration.
- Ruling: Do not edit `ehfi-expo` — user designated it as a visual reference and the only writable project is `ehfi` — cost if wrong: Expo remains conceptual and unchanged.

## Task status

- Task 1: complete — added RLS-backed profile/activity/booking tables, atomic capacity and overlap RPCs, safe projections, TypeScript contracts, and the second-migration setup note.
- Task 2: complete — added role-protected student/professional layouts, shared responsive shell, role-aware navigation, drawer, pill dock, theme toggle, and sign-out.
- Task 3: complete — added an editable live public-profile preview, publish/hide control, credential-review disclosure, validation, and a session-bound upsert.
- Task 4: complete — added real professional metrics, Sao Paulo weekly agenda, date/time activity editor, safe booked-session edits, cancellation, and a masked active-participant roster.
- Task 5: complete — added real student discovery, public details, a batched booking history projection, atomic reservation/cancellation, capacity states, and hidden-profile booking access.
- Task 6: complete — static security and flow review finished. Fixed two missing identifiers found during source inspection and two agenda/participant-history mismatches found in independent review. Browser sessions and remote Supabase were not used in this pass.

## Verification notes

- No automated tests or test files will be added or run.
- No prohibited Git/typecheck/build/lint/test command will be run.
- Remote Supabase is not configured or modified in this pass.
- Manual review already checked RPC ownership/role gates, capacity and overlap locks, half-open interval comparisons, profile visibility locking, cancellation cutoff, private student-name projection, and that student activity queries never read health or contact fields.
- Final source review confirmed student detail reads only the user's booking row and public activity projection; professional participant history is limited to first name + surname initial and active reservations or reservations ended by professional cancellation.
- Static source inspection caught and fixed the `addCalendarDays` import name and the student activity card's missing BRL formatter.
- Independent review's P2 findings were addressed: draft action is now explicitly cancellation with matching confirmation copy, and the professional can reopen the masked participant list after canceling an activity to see affected reservations.
- No browser/server session was available for authorized student/professional walkthroughs, and no remote Supabase project was connected.
