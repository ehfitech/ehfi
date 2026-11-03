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
- Minors may register and use the product. Guardian name/contact/confirmation remain declaratory and must never be described or stored as verified identity/authorization.
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

- [ ] Add `@supabase/ssr` and `@supabase/supabase-js` to runtime dependencies; do not add test dependencies.
- [ ] Add `.env.example` with variable names only: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, and `CRON_SECRET`.
- [ ] Implement the three typed clients; validate missing environment variables without printing their values; mark `admin.ts` server-only.
- [ ] Implement root `proxy.ts` using the installed Next 16 convention. Refresh the cookie session with `auth.getClaims()` and use a matcher that excludes static assets.
- [ ] Add migration tables: `user_profiles`, `user_roles`, `student_profiles`, `student_health_records`, `professional_profiles`, `companies`, `company_members`, `company_intakes`, `consent_records`, and `registration_drafts`.
- [ ] Use the authenticated user's `auth.uid()` as the profile owner. Keep nested multi-select/schedule data as JSONB where the spec permits it; keep student health data in its own table.
- [ ] Add RLS and least-privilege grants for every Data API table. Prevent direct user insertion/update of `user_roles`; expose role creation only through finalization functions that bind writes to `auth.uid()`.
- [ ] Add idempotent SQL functions `finalize_student_registration(p_profile jsonb, p_health jsonb, p_consents jsonb)`, `finalize_professional_registration(p_profile jsonb, p_documents jsonb, p_consents jsonb)`, and `finalize_company_registration(p_company jsonb, p_intake jsonb, p_consents jsonb)`. Each function must use the current authenticated user and upsert one role profile transactionally.
- [ ] Create a private `professional-documents` Storage bucket. Do not add a public read policy.
- [ ] Static review the migration against all existing form keys and ensure the health table policy allows only the owning user.

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
- `createRegistrationDraft(role: RegistrationRole): Promise<void>` issues a random 256-bit token, stores only its SHA-256 hash, and sets the matching secure `httpOnly`, `sameSite: "lax"`, 30-day cookie.
- `saveRegistrationDraft(role: RegistrationRole, payload: unknown): Promise<void>` validates the cookie/hash/role, strips credential fields, and updates `updated_at`/`expires_at`.
- `uploadDraftPdf(role: "professional", file: File): Promise<DraftFileReference>` validates a 10 MB limit, PDF content type and PDF signature; generates the Storage path on the server.
- `stageDraftFilesForUser(role: "professional", userId: string): Promise<FinalFileReference[]>` reads the HttpOnly draft cookie server-side, moves each temporary PDF to a deterministic private user path, and records that path for idempotent retry.
- `useRegistrationDraft<T>(role, payload, enabled): { status, error }` debounces autosave by 600 ms; `enabled` is false until required consent is recorded for health data.

- [ ] Implement token creation/hash and role-scoped cookies; never accept a draft owner ID or Storage path from the browser as authority.
- [ ] Implement draft create/update/delete handlers. Verify the opaque token on every request and return generic errors for missing/expired drafts.
- [ ] Add sanitizers that always remove `password` and `passwordConfirmation`; omit student health fields until `healthDataConsent === true`.
- [ ] Implement debounced autosave in a hook. A failed autosave must remain visible in the form and must not erase client state.
- [ ] Implement professional PDF upload to the private bucket through the server route. Limit each file to 10 MB, verify the `%PDF-` signature, generate an unguessable draft path, and store only path/name/size metadata in the draft.
- [ ] Implement idempotent staging from draft paths to deterministic owner paths after Auth succeeds. Keep staged paths attached to the draft until profile SQL finalization succeeds; retry must reuse existing paths rather than duplicate objects.
- [ ] On draft replacement/removal, delete the prior temporary Storage object through the admin client after validating it belongs to that draft.
- [ ] Implement the cleanup route guarded by `CRON_SECRET`: list expired drafts, delete their temporary and staged-but-uncommitted Storage objects through the Storage API, then delete draft rows. Preserve only files referenced by finalized professional records. Document the daily Supabase Cron HTTP call and keep secrets out of SQL/source.
- [ ] Static review all draft endpoints for token validation, role matching, credential stripping, consent gating, and private file paths.

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

- [ ] Add password validation shared by the three registration flows, reusing the existing student rules.
- [ ] Change the initial role cards to lead to `/aluno/entrar`, `/profissional/entrar`, and `/empresa/entrar`; each login page links back to its existing `/.../cadastro` route.
- [ ] Implement role-aware login. After Supabase Auth succeeds, query `user_roles`; deny mismatched roles. If the email already exists but the requested role is absent and a valid draft cookie exists, authenticate first, then finalize that draft for the signed-in identity.
- [ ] Implement signout and password-reset request/callback screens; generic responses must not reveal whether an email exists.
- [ ] Configure authorized redirects for reset-password flow in code. Add `docs/supabase-setup.md` instructions to disable email confirmation, configure the site/redirect URLs, configure SMTP for password recovery, and apply the SQL migration.
- [ ] Keep login and error UI aligned with existing EHFI components and keyboard/focus patterns.
- [ ] Static review that the route/query role is always checked against the persisted role and every mutation gets a verified server session.

### Task 4: Connect student registration to drafts, consent, and persistence

**Files:**
- Modify: `lib/student-registration.ts`
- Modify: `components/ehfi/student-signup.tsx`
- Modify: `components/ehfi/student-signup-success.tsx`
- Create: `app/actions/registrations.ts`
- Create: `lib/registrations/validation.ts`

**Interfaces:**
- `finalizeStudentRegistration(input: StudentRegistrationForm): Promise<RegistrationActionResult>` validates every step server-side, creates or resumes the matching Auth identity with email confirmation disabled, writes profile/health/consents through the student RPC, completes the draft and returns a success route only after all steps succeed.
- `recordStudentHealthConsent(version: string): Promise<RegistrationActionResult>` stores the versioned acceptance in the server-side draft before health questions are shown.
- `validateStudentRegistration(input: unknown): StudentRegistrationForm` checks the serialized shape, all six current step validators, password policy, consent, age/date and numeric conversions.
- `type RegistrationActionResult = { ok: true; redirectTo: string } | { ok: false; code: string; fieldErrors?: Record<string,string> }`.

- [ ] Move `healthDataConsent` from the final step to the start of the health-history step. On accept, call `recordStudentHealthConsent` and render questions only after the server confirms the versioned draft consent; do not autosave health values before then. On refusal, clear health keys from the draft and end signup without Auth creation.
- [ ] Wire student state changes to `useRegistrationDraft`; exclude both password fields, preserve the draft while navigating, and clear it only after finalization.
- [ ] Preserve all current student fields. Convert date/number values into stable database representations and keep the guardian confirmation explicitly declaratory for minors.
- [ ] Wire `finishSignup` to `finalizeStudentRegistration`; use the current matching session if signup already succeeded, otherwise create Auth with confirmation disabled. On duplicate email, preserve the draft and offer sign-in to add this profile.
- [ ] Set registration status to `review_pending` when existing health-review rules apply; age alone does not block account creation or mark the profile pending.
- [ ] Replace the demo success copy with account-created copy and a protected student destination.
- [ ] Keep the session/draft after Auth succeeds but the RPC fails; allow a retry to reuse the same identity. Static review that no health key is sent before consent and no success navigation happens before Auth plus RPC persistence returns success.

### Task 5: Connect professional registration and private document uploads

**Files:**
- Modify: `lib/professional-registration.ts`
- Modify: `components/ehfi/professional-signup.tsx`
- Modify: `components/ehfi/signup-success.tsx`
- Modify: `app/actions/registrations.ts`
- Modify: `lib/registrations/validation.ts`
- Create: `components/ehfi/private-pdf-upload.tsx`

**Interfaces:**
- `finalizeProfessionalRegistration(input: ProfessionalRegistrationPayload): Promise<RegistrationActionResult>` validates all five steps, signs up or resumes an existing authenticated identity, calls the professional RPC, moves draft PDFs into owner paths, and returns success only after persistence succeeds.
- `type DraftFileReference = { path: string; originalName: string; size: number; kind: ProofKind }`.
- `type FinalFileReference = { path: string; originalName: string; size: number; kind: ProofKind }`.
- `PrivatePdfUpload` accepts `{ role: "professional"; kind: ProofKind; value: DraftFileReference | null; onChange(value): void }`.

- [ ] Add password/confirmation fields to the existing professional personal-details step and apply the shared password policy server-side.
- [ ] Replace fake academic/CREF sample-PDF selection dialogs with actual PDF file input and `PrivatePdfUpload`; preserve current branch-specific required/optional behavior.
- [ ] Connect personal, academic, CREF, labor-interest and consent fields to draft autosave. Exclude credentials and save only document references, not raw file bytes.
- [ ] Server-validate the complete five-step payload, including field dependencies, file ownership, PDF size/type, current requiredness and consent records.
- [ ] After Auth succeeds, idempotently stage draft PDFs to private owner paths, then persist those final paths with profile, CREF, availability and consent through the professional RPC. Keep the draft/session on failure; mark CREF-dependent service state `review_pending` when current responses do not establish regular registration.
- [ ] Replace demo success text with real account status; protect `/profissional/plataforma`.
- [ ] Static review that no document path can be read or moved unless it belongs to the active draft/user and bucket stays private.

### Task 6: Connect company registration and company membership

**Files:**
- Modify: `lib/company-registration.ts`
- Modify: `components/ehfi/company-signup.tsx`
- Modify: `components/ehfi/company-signup-success.tsx`
- Modify: `app/actions/registrations.ts`
- Modify: `lib/registrations/validation.ts`
- Create: `app/empresa/plataforma/page.tsx`

**Interfaces:**
- `finalizeCompanyRegistration(input: CompanyRegistrationPayload): Promise<RegistrationActionResult>` validates the six current steps, creates/uses the contact email identity, upserts the company and responsible membership, saves intake/consents, and returns success after the transaction.
- `getCompanyMembership(): Promise<CompanyMembership | null>` reads the active company only through the signed-in user's membership.

- [ ] Add password/confirmation fields to the existing responsible-contact step. Use `contactEmail` as the Auth email and preserve the current contact email in the company profile payload only as required for contact operations.
- [ ] Connect company fields to draft autosave; preserve arrays/nested sector schedules/shifts as validated JSONB; keep CNPJ lookup behavior unchanged.
- [ ] Server-validate every field and nested schedule before Auth/RPC submission. Create/reuse the matching Auth session, then preserve current terms, privacy, contact-authorization and accuracy flags as versioned consent records.
- [ ] Persist the company, the creator's owner membership and the complete intake payload in one Postgres function transaction.
- [ ] Replace demo success copy, add protected company landing placeholder, and authorize all reads by `company_members`.
- [ ] Static review that CNPJ data is not logged and a user cannot query/update another company's intake without membership.

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

- [ ] Protect each role landing page with a verified server session and stored role membership; redirect to the matching login route otherwise.
- [ ] Replace all demonstration-only success, no-storage, and fake-account language with truthful account/session status.
- [ ] Keep the privacy notice accurate about persisted categories, required health consent, minor declaration status, private professional documents, draft TTL and the external Open CNPJ lookup.
- [ ] Leave controller identity/contact, approved legal bases, completed-account retention, SMTP vendor and transfer copy as explicit setup inputs; do not fabricate missing values.
- [ ] Add dashboard setup instructions for environment variables, hosted Auth confirmation setting, site/redirect URLs, SMTP, migration application, bucket setup and daily cron schedule.
- [ ] Static review every entry point for stale “demonstração/não salva” copy and confirm every protected destination checks server-side authorization.

## Execution Notes

- Execute tasks 1 through 7 natively in this session, keeping each task scoped to its listed files.
- Do not commit, run automated tests, or invoke the prohibited validation commands.
- `.env.local` is absent and ignored. Create `.env.example` only; the user must place real values locally without pasting secrets into chat. Applying migrations, changing Auth confirmation/SMTP settings, and scheduling Cron require the user's Supabase Dashboard or a locally configured Supabase CLI/session.
- Production privacy copy cannot be completed until the user supplies the controller/contact, approved legal bases, full-record retention period, and SMTP/provider/location information.
