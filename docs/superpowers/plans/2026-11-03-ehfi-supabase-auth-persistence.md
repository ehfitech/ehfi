# EHFI Supabase Auth and Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task by task in the current workspace. Respect the repository's explicit prohibition on tests and the listed commands.

**Goal:** Replace the three registration demos with Supabase Auth accounts, persistent role profiles, protected access, private professional document uploads, and expiring server-side drafts.

**Architecture:** Use cookie-backed Supabase SSR clients in Next.js 16, server actions for authentication/finalization, and scoped server routes for pre-account drafts and uploads. Persist role data in Postgres tables protected by RLS; keep sensitive student health data separate. Store pre-account drafts behind random `httpOnly` cookie tokens, create the Auth identity only at final submission, and clean abandoned drafts/files after 30 days without activity.

**Tech Stack:** Next.js 16.4.3 App Router, React 19, `@supabase/ssr`, `@supabase/supabase-js`, Supabase Auth, Postgres/RLS, Supabase Storage, Supabase Cron.

**Spec:** `docs/superpowers/specs/2026-11-03-ehfi-supabase-auth-persistence-design.md`

## Global Constraints

- Use the installed Next.js `16.4.3` guides in `node_modules/next/dist/docs/`; use `proxy.ts` and async request APIs as documented.
- Do not execute `git`, `typecheck`, `build`, `lint`, or `test`; do not create automated tests.
- Email confirmation stays disabled; signup must return an authenticated session.
- Student, professional, and company all use email/password; share the existing student password policy (8+ characters, number, lowercase, uppercase, special character).
- A Supabase identity may have multiple EHFI profiles. Sign in before adding another profile to an existing email; a URL/form role never grants access by itself.
- Create the Auth identity only after final submission. Drafts are server-side, expire after 30 days without activity, and never contain passwords or password confirmations.
- Require health-data consent before the first health question is shown or saved. If declined, do not create the student account or collect health answers.
- Minors may register and use the product without a guardian flow or guardian data collection, per the user's decision. Legal review remains outstanding before real user launch.
- Keep student health data readable by its owner only until an explicit student-professional relationship is implemented.
- Preserve current branch-specific professional document requirements. Store real PDFs in private Supabase Storage; no public document URLs.
- Do not invent controller identity, legal basis, finalized-account retention, vendors, transfer details, or privacy contact in user-facing policy text.
- Never expose `SUPABASE_SECRET_KEY`; never put it in a `NEXT_PUBLIC_` variable. Do not read or print secret values.

## Review Focus

- Existing email selected for a new profile: authenticate before adding the profile and reuse that Auth identity (Task 3); never create a duplicate Auth user.
- Draft abandoned after sensitive answers or PDF upload: exclude credentials and delete the draft plus temporary files after 30 idle days (Task 2).
- Student declines health consent: do not collect/save health questions or finalize Auth (Task 4).
- Auth signup succeeds but a profile write fails: show no success; keep a retryable session/draft and make the SQL finalization idempotent (Tasks 4–6).
- Login selects a profile the identity does not have: deny access or route through authenticated add-profile flow; client/URL role values never override RLS (Tasks 1, 3, and 7).

> Automated tests are excluded by `AGENTS.md`. Each task below ends with a static review condition rather than a test command.

---

### Task 1: Add Supabase dependencies, SSR clients, and database migration

**Files:**
- Modify: `package.json`
- Create: `.env.example`
- Create: `lib/supabase/env.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `lib/database.types.ts`
- Create: `proxy.ts`
- Create: `supabase/migrations/202611030001_ehfi_auth_profiles.sql`

**Interfaces:**
- `createBrowserSupabaseClient(): SupabaseClient<Database>` uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `createServerSupabaseClient(): Promise<SupabaseClient<Database>>` reads/writes the request cookie session using Next's async `cookies()` API.
- `createAdminSupabaseClient(): SupabaseClient<Database>` is server-only and reads `SUPABASE_SECRET_KEY`; use it only for draft/file lifecycle operations.
- Database roles: `student | professional | company`.

- [x] Add `@supabase/ssr` and `@supabase/supabase-js` to runtime dependencies; do not add test dependencies.
- [x] Add `.env.example` with names for URL, publishable key, secret key, site URL, and `CRON_SECRET` only.
- [x] Implement the three typed clients; validate missing environment variables without printing their values; mark `admin.ts` server-only.
- [x] Implement root `proxy.ts` using the installed Next 16 convention. Refresh the cookie session with `auth.getClaims()` and use a matcher that excludes static assets.
- [x] Add all profile, role, health, company, consent, and draft tables.
- [x] Use the authenticated user's `auth.uid()` as the profile owner, JSONB for nested data, and a separate owner-only student health table.
- [x] Add RLS and least-privilege grants. Finalization is only available to authenticated users and also requires the hash of a valid server-created draft token.
- [x] Add idempotent SQL finalizers for each role; each uses the authenticated user and upserts role data in one transaction.
- [x] Create the private `professional-documents` Storage bucket without a public read policy.
- [x] Static review form-to-table paths and owner-only health access. Migration application is still an operator step in Supabase.

### Task 2: Build pre-account draft and temporary PDF services

**Files:**
- Create: `lib/registration-drafts/types.ts`
- Create: `lib/registration-drafts/token.ts`
- Create: `lib/registration-drafts/repository.ts`
- Create: `lib/registration-drafts/sanitize.ts`
- Create: `app/api/registration-draft/route.ts`
- Create: `app/api/registration-draft/files/route.ts`
- Create: `app/api/cron/registration-drafts/route.ts`
- Create: `hooks/use-registration-draft.ts`
- Modify: `supabase/migrations/202611030001_ehfi_auth_profiles.sql`

**Interfaces:**
- `type RegistrationRole = "student" | "professional" | "company"`.
- `createRegistrationDraft(role)` issues a random 256-bit token, stores only its SHA-256 hash, and sets the matching secure `httpOnly`, `sameSite: "lax"`, 30-day cookie.
- `saveRegistrationDraft(role, token, payload)` validates the token/hash/role, strips credentials, gates student health fields on server-recorded consent, and refreshes the sliding expiry.
- `uploadDraftPdf(token, file, kind)` validates a 10 MB limit, PDF content type and PDF signature; generates the Storage path on the server.
- `stageDraftFilesForUser(token, userId, allowedSourcePaths?)` moves only selected draft PDFs to deterministic private owner paths and records paths for retry.
- `useRegistrationDraft<T>(role, payload, enabled)` restores drafts, prepares a role-scoped server draft, debounces autosave by 600 ms, and exposes consent/file state.

- [x] Implement opaque role-scoped draft tokens/cookies; verify ownership server-side and do not trust browser-supplied IDs or paths.
- [x] Implement draft create/update/delete handlers with generic errors and same-origin checks on mutations.
- [x] Remove credentials from drafts and omit student health fields until server-recorded consent exists; guardian fields are no longer collected or stored.
- [x] Implement 600 ms autosave/restore and visible save errors without clearing client state.
- [x] Implement private PDF upload with a 10 MB limit, signature check, generated path, and metadata-only draft reference.
- [x] Implement idempotent selected-file staging to deterministic owner paths; failures retain retryable draft/session state.
- [x] Remove replaced temporary files only after draft ownership validation.
- [x] Implement `CRON_SECRET` cleanup for expired temporary and staged-but-uncommitted objects; document daily scheduling.
- [x] Static review token, role, credential, consent, and path checks. The scheduler still needs deployment configuration.

### Task 3: Add role-aware signup, login, recovery, and session authorization

**Files:**
- Create: `lib/auth/password.ts`
- Create: `lib/auth/roles.ts`
- Create: `app/actions/auth.ts`
- Create: `components/ehfi/login-form.tsx`
- Create: `components/ehfi/password-reset-form.tsx`
- Create: `app/aluno/entrar/page.tsx`
- Create: `app/profissional/entrar/page.tsx`
- Create: `app/empresa/entrar/page.tsx`
- Create: `app/auth/callback/route.ts`
- Modify: `components/ehfi/role-card.tsx`
- Modify: `components/ehfi/welcome-screen.tsx`

**Interfaces:**
- `validatePassword(value: string): PasswordValidationResult` applies the existing five student password requirements server-side.
- `signInWithProfile(input: { role: RegistrationRole; email: string; password: string; next?: string }): Promise<AuthActionResult>` signs in, validates stored profile membership, and only accepts same-origin `next` paths.
- `signOut(): Promise<void>` clears the Supabase cookie session.
- `requestPasswordReset(email: string): Promise<AuthActionResult>` requests the reset email and returns a generic result.
- `getAuthorizedProfile(role: RegistrationRole): Promise<AuthorizedProfile | null>` verifies claims and the persisted role association for server components/actions.

- [x] Share the existing student password rules across all three registration flows and validate on the server.
- [x] Route the three role cards to role-specific login and link each login back to registration.
- [x] Implement role-aware login; mismatched roles are denied. A signed-in identity can return to the draft form to add the missing profile without duplicating Auth.
- [x] Implement signout, generic password-reset request, callback, and update-password flows.
- [x] Configure safe reset redirects in code and document email-confirmation, site/redirect, SMTP, and migration setup.
- [x] Use the existing EHFI visual components and accessible field/error patterns.
- [x] Static review role checks and server-side mutations; project Dashboard settings remain operator work.

### Task 4: Connect student registration to drafts, consent, and persistence

**Files:**
- Modify: `lib/student-registration.ts`
- Modify: `components/ehfi/student-signup.tsx`
- Modify: `app/aluno/sucesso/page.tsx`
- Create: `app/actions/registrations.ts`
- Create: `lib/registrations/validation.ts`

**Interfaces:**
- `finalizeStudentRegistration(input: StudentRegistrationForm): Promise<RegistrationActionResult>` validates every step server-side, creates or resumes the matching Auth identity with email confirmation disabled, writes profile/health/consents through the student RPC, completes the draft and returns a success route only after all steps succeed.
- `useRegistrationDraft.recordHealthConsent(accepted: boolean)` records or clears the server-side versioned health consent before health questions are shown.
- `validateStudentRegistration(input: unknown): StudentRegistrationForm` checks the serialized shape, all six current step validators, password policy, consent, age/date and numeric conversions.
- `type RegistrationActionResult = { ok: true; redirectTo: string } | { ok: false; code: string; fieldErrors?: Record<string,string> }`.

- [x] Move health consent before the first health question; save consent server-side before rendering health inputs. Refusal clears health data/draft and never creates Auth.
- [x] Wire autosave/restore, exclude credentials, and clear only after successful finalization.
- [x] Preserve the current student profile/anamnesis fields except the removed guardian flow; normalize dates and numeric values.
- [x] Finalize through Auth plus the student transaction; keep session/draft on failure and let the person sign in before adding a missing role.
- [x] Set `review_pending` only for existing health review rules; age itself does not block signup or set review state.
- [x] Replace the old success page with a redirect to the protected student destination; remove dead demonstration success components.
- [x] Keep session/draft after partial Auth success; static review confirms the RPC also requires the server-recorded consent draft and navigation waits for persistence.

### Task 5: Connect professional registration and private document uploads

**Files:**
- Modify: `lib/professional-registration.ts`
- Modify: `components/ehfi/professional-signup.tsx`
- Modify: `app/profissional/sucesso/page.tsx`
- Modify: `app/actions/registrations.ts`
- Modify: `lib/registrations/validation.ts`
- Create: `components/ehfi/private-pdf-upload.tsx`

**Interfaces:**
- `finalizeProfessionalRegistration(input: ProfessionalRegistrationPayload): Promise<RegistrationActionResult>` validates all five steps, signs up or resumes an existing authenticated identity, calls the professional RPC, moves draft PDFs into owner paths, and returns success only after persistence succeeds.
- `type DraftFileReference = { path: string; originalName: string; size: number; kind: ProofKind }`.
- `type FinalFileReference = { path: string; originalName: string; size: number; kind: ProofKind }`.
- `PrivatePdfUpload` accepts `{ kind: DraftFileReference["kind"]; label: string; hint?: string; value: DraftFileReference | null; error?: string; onChange(value): void }`.

- [x] Add password/confirmation to the existing personal-details step and validate server-side.
- [x] Replace fake document dialogs with PDF upload; retain the current conditional requiredness.
- [x] Autosave professional fields and document references; omit credentials and file bytes.
- [x] Server-validate all five steps, branch requirements, draft ownership, and consent.
- [x] Stage only currently selected PDFs idempotently; persist profile and docs transactionally and retain retry state on failure. All professional profiles start `review_pending` because no manual CREF verification workflow exists yet.
- [x] Replace demo success route and protect `/profissional/plataforma`.
- [x] Static review confirms private bucket paths, token/draft ownership checks, and final document ownership constraints.

### Task 6: Connect company registration and company membership

**Files:**
- Modify: `lib/company-registration.ts`
- Modify: `components/ehfi/company-signup.tsx`
- Modify: `app/empresa/sucesso/page.tsx`
- Modify: `app/actions/registrations.ts`
- Modify: `lib/registrations/validation.ts`
- Create: `app/empresa/plataforma/page.tsx`

**Interfaces:**
- `finalizeCompanyRegistration(input: CompanyRegistrationForm): Promise<RegistrationActionResult>` validates the six current steps, creates/uses the contact email identity, upserts the company and responsible membership, saves intake/consents, and returns success after the transaction.
- `getCompanyMembership(): Promise<CompanyMembership | null>` reads the active company only through the signed-in user's membership.

- [x] Add password/confirmation to the responsible-contact step and use its email for Auth.
- [x] Autosave the company form, preserve nested schedule arrays as validated JSONB, and retain CNPJ lookup behavior.
- [x] Validate all fields, nested schedules, and current consent flags before Auth/RPC.
- [x] Persist company, owner membership, intake, and consents through one transaction.
- [x] Redirect success to a role-protected company area and require company membership for access.
- [x] Static review found no CNPJ logging; direct reads remain RLS/member-scoped and no direct writes are granted.

### Task 7: Protect role destinations and update account/privacy surfaces

**Files:**
- Modify: `app/aluno/sucesso/page.tsx`
- Modify: `app/empresa/sucesso/page.tsx`
- Modify: `app/profissional/sucesso/page.tsx`
- Modify: `app/aluno/plataforma/page.tsx` or create it if absent
- Modify: `app/profissional/plataforma/page.tsx`
- Modify: `app/empresa/plataforma/page.tsx`
- Modify: `app/privacidade/page.tsx`
- Modify: `app/termos-de-uso/page.tsx`
- Modify: `components/ehfi/welcome-screen.tsx`
- Create: `docs/supabase-setup.md`

- [x] Protect all three role destinations with session, persisted role, and company membership checks; redirect to matching login routes otherwise.
- [x] Replace reachable success/demonstration routes with protected destinations; remove dead success components.
- [x] Update privacy/terms for saved profiles, required health consent, minors without a guardian flow, private professional files, 30-day drafts, and Open CNPJ.
- [x] Leave missing controller/contact, legal bases, completed-account retention, SMTP provider, and region visible as setup/legal inputs instead of inventing them.
- [x] Add Supabase environment, Auth, migration, Storage, redirect, SMTP, and cleanup setup instructions.
- [x] Static review all entry points and role destination authorization. Policy/legal and external Supabase setup remain operator tasks before public launch.

## Execution Notes

- Execute tasks 1 through 7 natively in this session, keeping each task scoped to its listed files.
- Do not commit, run automated tests, or invoke the prohibited validation commands.
- `.env.local` is absent and ignored. Create `.env.example` only; the user must place real values locally without pasting secrets into chat. Applying migrations, changing Auth confirmation/SMTP settings, and scheduling Cron require the user's Supabase Dashboard or a locally configured Supabase CLI/session.
- Production privacy copy cannot be completed until the user supplies the controller/contact, approved legal bases, full-record retention period, and SMTP/provider/location information.
