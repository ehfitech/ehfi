# SDD ledger — plan: docs/superpowers/plans/2026-11-03-ehfi-supabase-auth-persistence.md

## Setup

- Spec read: `docs/superpowers/specs/2026-11-03-ehfi-supabase-auth-persistence-design.md`.
- Plan read: `docs/superpowers/plans/2026-11-03-ehfi-supabase-auth-persistence.md`.
- Preflight Task 1 -> Task 2: Task 1 creates `registration_drafts` and the private document bucket; Task 2 consumes both. Interfaces align.
- Preflight Task 1 -> Task 3: Task 1 creates typed Supabase clients and `user_roles`; Task 3 consumes them for Auth and profile authorization. Interfaces align.
- Preflight Task 1 -> Tasks 4–6: Task 1 RPC names and JSONB payload shapes are the persistence boundary consumed by each role finalizer. Interfaces align.
- Preflight Task 2 -> Tasks 4–6: Task 2 draft hook/sanitizers and draft routes support role-scoped autosave and PDF uploads. Interfaces align.
- Preflight Task 3 -> Tasks 4–7: Task 3 session/auth interfaces support registration finalization and protected destinations. Interfaces align.

## Rulings

- Ruling: Work in the current workspace without creating a git worktree or running git scripts — the user explicitly prohibits every `git` command — cost if wrong: this work is not isolated from other workspace changes.
- Ruling: Replace the plan's test/TDD gates with static inspection and manual code-path review — the user explicitly prohibits tests and test commands — cost if wrong: runtime behavior will not have automated evidence in this pass.
- Ruling: Do not commit — committing requires a prohibited git command — cost if wrong: completed work remains uncommitted in the workspace.

## Task status

- Task 1: complete — typed clients, environment template, Next 16 proxy, RLS schema, private bucket, and draft-token-bound SQL finalizers are written.
- Task 2: complete — role-scoped HTTP-only drafts, credential/health sanitization, consent record, private PDF lifecycle, sliding expiry, and cron cleanup are wired.
- Task 3: complete — role login, account creation links, password reset, callback, update-password, signout, and role authorization are wired.
- Task 4: complete — student consent gates anamnesis, all current student profile/health fields persist, minors can proceed without collecting guardian data, and protected student access is in place.
- Task 5: complete — professional credentials, server validation, real private PDF uploads, selected-file staging, retryable persistence, and protected access are wired.
- Task 6: complete — company credentials, autosave, nested schedule validation, atomic company/membership/intake/consent persistence, and protected access are wired.
- Task 7: complete — success routes are protected redirects, dead demonstration pages were removed, privacy/terms and setup documentation reflect actual behavior and remaining inputs.

## Static review notes

- Final pass corrected two source issues found by inspection: a stale company terms error message and a duplicate validation import. It also added a consent-state compare-and-retry for student draft autosaves, prevents stale POSTs from recreating a deleted draft, disables autosave after consent refusal, and enforces mandatory confirmations inside the transactional SQL finalizers.
- No automated tests or test files were added, and no prohibited `git`, `typecheck`, `build`, `lint`, or `test` command was run, per `AGENTS.md`.
- The Supabase project was not configured or modified remotely: no project URL/keys are present in the workspace. The owner must set local/deployment environment values, disable Auth email confirmation, apply the migration, configure SMTP/redirect URLs, and schedule cleanup.
- Controller/contact identity, approved legal bases, completed-account retention, Supabase region/email provider, and legal review for health data and minors remain outstanding before public onboarding.
- Final review is static only; runtime behavior has not been executed because project credentials are unavailable and the repository explicitly forbids build/type/lint/test commands.
