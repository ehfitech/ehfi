# EHFI Activity Platform Implementation Plan

> **For agentic workers:** Implement one task at a time in order. Do not add or run automated tests. Do not run `git`, `typecheck`, `build`, or `lint`.

**Goal:** Replace the student and professional platform placeholders with a Supabase-backed activity, agenda, public-professional-profile, and booking experience that follows the approved Expo design.

**Architecture:** Keep the current Next.js app as the product surface and the Expo app as the visual reference. Store public profiles, dated activities, and bookings in relational Supabase tables with RLS; use authenticated server actions for writes and Postgres RPCs for reservation capacity, participant projections, and other operations that need atomic checks. Use protected role layouts, server-rendered initial data, and client components only for interactive navigation, filters, sheets, and actions.

**Tech Stack:** Next.js 16.4.3 App Router, React 19, Supabase SSR/Postgres/RLS, existing shadcn/Base UI components, Tailwind CSS, `date-fns`, `react-icons/io5`.

**Spec:** `docs/superpowers/specs/2026-11-03-ehfi-activity-platform-design.md` (approved by user 2026-11-03)

## Global Constraints

- Build in `ehfi`; use `ehfi-expo` as the visual and interaction reference only.
- Preserve EHFI colors, light/dark themes, pink/lilac gradient, Outfit/Inter, Ionicons family, hero/cards, weekly day chips, filters, timeline, drawer, and pill tab dock.
- Reuse the app's restrained page transitions and reduced-motion behavior; do not add a motion dependency.
- Professionals may publish while `practice_status = 'review_pending'`; students may discover, reserve, and cancel while `student_profiles.review_status = 'review_pending'`.
- A professional's public profile is separate and editable. It exposes only its explicit presentation fields; hiding it removes its activities from discovery and blocks new bookings while preserving existing bookings.
- In a professional's private participant list, show first name and surname initial only; never expose student contact details or health data.
- The student may cancel until the activity starts. Price is informational; do not implement payment processing.
- Activities are one-off sessions in `America/Sao_Paulo`. Prevent overlapping published sessions for one professional and overlapping active bookings for one student.
- Do not migrate any mock activities, bookings, or student recommendations from `ehfi-expo` into Supabase.
- Do not use `service_role` for normal platform actions. Keep every read/write under the authenticated session, RLS, or a narrowly scoped RPC that checks `auth.uid()`.
- Do not add or run automated tests. Do not run `git`, `typecheck`, `build`, or `lint`. No new dependencies.
- Before writing Next.js code, read the relevant installed guides in `node_modules/next/dist/docs/` as required by the repository's `AGENTS.md`.
- Create source migration and setup documentation only; applying a migration to a remote Supabase project is outside this plan.

## Review Focus

Manual behavior review only; automated tests are excluded by project instructions.

- Two students attempt to reserve the last place at once: only one active booking is stored and the other receives a clear full-capacity response.
- A professional hides their public profile: new discovery and reservations stop, while existing reservations remain visible and can still be canceled by the student.
- Professional and student profiles both remain `review_pending`: the approved flows remain available, status values are not changed, and student health data is never returned to the professional.
- Adjacent sessions whose end/start times touch are allowed; sessions that overlap are rejected for the same professional or student.
- A student cancels before the start: the seat reopens and the booking history remains; cancellation after start is rejected.

---

### Task 1: Supabase activity, public-profile, and booking contract

**Files:**
- Create: `supabase/migrations/202611030002_ehfi_activity_platform.sql`
- Create: `lib/activities/types.ts`
- Modify: `lib/database.types.ts`
- Modify: `docs/supabase-setup.md`

**Interfaces:**
- Tables: `professional_public_profiles`, `activities`, `activity_bookings`.
- `professional_public_profiles`: `user_id`, `display_name`, `bio`, `specialties`, `city`, `state`, `is_published`, `created_at`, `updated_at`.
- `activities`: `id`, `professional_id`, `title`, `description`, `starts_at`, `ends_at`, `location`, `price_cents`, `capacity`, `status`, `created_at`, `updated_at`.
- `activity_bookings`: `id`, `activity_id`, `student_id`, `status`, `booked_at`, `updated_at`, `cancelled_at`.
- Activity states: `draft`, `published`, `cancelled`, `completed`. Booking states: `reserved`, `cancelled_by_student`, `cancelled_by_professional`, `attended`, `no_show`.
- RPCs: `save_professional_activity`, `reserve_activity`, `cancel_student_booking`, `cancel_professional_activity`, `list_discoverable_activities`, `get_student_booking_activity`, `list_professional_activity_participants`, `get_professional_activity_summary`.
- RPC signatures: `save_professional_activity(p_activity_id uuid, p_title text, p_description text, p_starts_at timestamptz, p_ends_at timestamptz, p_location text, p_price_cents integer, p_capacity integer, p_status text) returns uuid`; `reserve_activity(p_activity_id uuid) returns uuid`; `cancel_student_booking(p_booking_id uuid) returns void`; `cancel_professional_activity(p_activity_id uuid) returns void`.
- `list_discoverable_activities` returns `{ activity_id, title, description, starts_at, ends_at, location, price_cents, capacity, status, professional_display_name, professional_bio, professional_specialties, professional_city, professional_state, credentials_in_review, reserved_count, places_remaining }` for published activities/profile rows in range.
- `get_student_booking_activity(p_activity_id uuid)` returns the same projection as the discovery feed only to a user who owns a booking for that activity, including when the profile is hidden.
- `get_professional_activity_summary(p_from timestamptz, p_to timestamptz)` returns `{ activity_id, title, starts_at, ends_at, location, price_cents, capacity, status, reserved_count }` for the authenticated professional's activities in range.
- `list_professional_activity_participants` returns only `{ booking_id, first_name, surname_initial, status, booked_at }` for the owner of the activity; it never returns `student_id`, email, phone, or health data.
- `list_discoverable_activities` returns only public activity fields, explicit public-profile fields, and derived available capacity. It excludes hidden profiles.
- `get_student_booking_activity` returns the same activity/profile projection to the owner of an existing booking even if the professional later hides their public profile.
- `lib/activities/types.ts` exports `DateRange`, `PlatformActionResult<T>`, and the types `ProfessionalPublicProfile`, `ProfessionalPublicProfileInput`, `ActivityInput`, `ProfessionalActivity`, `DiscoverableActivity`, `StudentBooking`, `StudentDashboardData`, `ProfessionalDashboardSummary`, and `ProfessionalParticipant`.
- `DateRange` is `{ from: string; to: string }`; `ActivityInput` is `{ activityId?: string; title: string; description: string; startsAt: string; endsAt: string; location: string; priceCents: number; capacity: number; status: "draft" | "published" }`.
- `ProfessionalPublicProfileInput` is `{ displayName: string; bio: string; specialties: string[]; city: string; state: string; isPublished: boolean }`; `ProfessionalParticipant` is `{ bookingId: string; firstName: string; surnameInitial: string; status: "reserved"; bookedAt: string }`.
- `PlatformActionResult<T>` is `{ ok: true; data: T } | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> }`.

- [ ] Read the relevant local Next.js App Router/server-action guides in `node_modules/next/dist/docs/` and review the existing migration, database types, and Supabase SSR clients before implementation.
- [ ] Create the three relational tables with foreign keys, status checks, positive capacity, nonnegative price, one-off timestamps, and indexes for owner/date, public discovery, and student bookings.
- [ ] Add a partial unique index allowing at most one `reserved` row for a student/activity pair while retaining canceled booking history.
- [ ] Enable RLS and grant only the columns/operations needed by authenticated roles: professional owns their profile and activities; student reads their own bookings; public profile/activity discovery is mediated by explicit public fields and a scoped feed RPC; professionals do not receive direct table access to student booking identities.
- [ ] Implement `save_professional_activity(p_activity_id uuid, p_title text, p_description text, p_starts_at timestamptz, p_ends_at timestamptz, p_location text, p_price_cents integer, p_capacity integer, p_status text) returns uuid`; require the professional role, preserve `practice_status`, serialize saves per professional with a transaction-scoped advisory lock, validate ownership/capacity, and reject overlapping published sessions using half-open intervals.
- [ ] Implement `reserve_activity(p_activity_id uuid) returns uuid`; require the student role, take a transaction-scoped advisory lock per student, lock the activity row and professional public-profile row, recheck visibility/activity state, verify capacity/uniqueness, reject overlapping active bookings, and create one `reserved` row atomically. The profile row lock makes hide-vs-booking outcomes commit in a defined order.
- [ ] Implement `cancel_student_booking(p_booking_id uuid) returns void` with the activity start-time cutoff, ownership check, and retained history.
- [ ] Implement `cancel_professional_activity(p_activity_id uuid) returns void` to lock the activity row, verify professional ownership, preserve booking history, and mark active reservations canceled by the professional.
- [ ] Implement `list_discoverable_activities(p_from timestamptz, p_to timestamptz)`, returning activity/public-profile fields and spots remaining only for published activities with a published professional profile.
- [ ] Implement `get_student_booking_activity(p_activity_id uuid)`, returning minimal details only when `auth.uid()` owns an existing booking, including when the profile is hidden.
- [ ] Implement `list_professional_activity_participants(p_activity_id uuid)` with an owner check and the masked name projection only.
- [ ] Implement `get_professional_activity_summary(p_from timestamptz, p_to timestamptz)` with an owner check and activity fields plus reserved counts only.
- [ ] Update `lib/database.types.ts` with exact table row/insert/update types and RPC argument/return types.
- [ ] Extend `docs/supabase-setup.md` with the new migration, activity/booking RLS behavior, and the fact that no payment provider or extra environment variable is required.
- [ ] Review the SQL definitions manually for ownership checks, lock scope, half-open overlap semantics (`[start, end)`), hidden-profile behavior, and preservation of historical rows. Do not apply it to a remote project here.

**Deliverable:** a locally reviewable schema/migration and TypeScript contract that contains the whole authorization and booking boundary.

---

### Task 2: Authenticated platform shell and role-specific navigation

**Files:**
- Create: `app/profissional/plataforma/layout.tsx`
- Create: `app/aluno/plataforma/layout.tsx`
- Create: `components/ehfi/platform-shell.tsx`
- Modify: `lib/auth/roles.ts`
- Modify: `app/profissional/plataforma/page.tsx`
- Modify: `app/aluno/plataforma/page.tsx`

**Interfaces:**
- `AuthorizedProfile` includes `availableRoles: RegistrationRole[]`; `getAuthorizedProfile(role)` loads the current user's roles under RLS while validating the requested role.
- `PlatformShell({ role, availableRoles, children }: { role: "professional" | "student"; availableRoles: RegistrationRole[]; children: React.ReactNode })` renders the EHFI header, drawer, role-specific pill dock, theme control, and sign-out action.
- Each role layout calls `getAuthorizedProfile(role)` once and redirects to the role login route with the requested path when authorization is missing.
- Professional dock destinations: `/profissional/plataforma` (Início) and `/profissional/plataforma/agenda` (Agenda).
- Student dock destinations: `/aluno/plataforma` (Início) and `/aluno/plataforma/aulas` (Aulas).

- [ ] Create each role layout with the existing `getAuthorizedProfile` guard and preserve the user's intended route in the login redirect.
- [ ] Implement the shared shell with existing EHFI semantic tokens, Outfit/Inter, `react-icons/io5`, `ThemeToggle`, and existing Base UI drawer primitives; keep mobile dock labels and active icon states from Expo.
- [ ] Keep `PageTransition` and reduced-motion behavior on the student/professional platform entry routes.
- [ ] Add role-specific drawer items, including the professional public-profile editor, theme control, and sign-out; show cross-role links only for student/professional roles present in `availableRoles`.
- [ ] Remove duplicated auth checks from the two index page components after the layouts own protection; leave the company route and shared `PlatformPlaceholder` behavior intact.
- [ ] Manually inspect the shell at narrow and wide browser widths in light/dark themes for safe-area spacing, navigation focus, accessible names, and content clearance above the pill dock.

**Deliverable:** protected, shared navigation that mirrors the Expo's drawer + tab structure without weakening existing role authorization.

---

### Task 3: Public professional profile editor

**Files:**
- Create: `app/profissional/plataforma/perfil/page.tsx`
- Create: `components/ehfi/professional-public-profile-form.tsx`
- Create: `app/actions/professional-profile.ts`
- Create: `lib/activities/profile-validation.ts`
- Create: `lib/activities/profile-queries.ts`
- Modify: `components/ehfi/platform-shell.tsx`

**Interfaces:**
- `getProfessionalPublicProfile(): Promise<ProfessionalPublicProfile | null>` in `lib/activities/profile-queries.ts` loads the authenticated professional's editable row.
- `validateProfessionalPublicProfile(input: unknown): ProfessionalPublicProfileInput` validates `displayName`, `bio`, `specialties`, `city`, `state`, and `isPublished` without adding dependencies.
- `saveProfessionalPublicProfile(input: unknown): Promise<PlatformActionResult<null>>` validates, verifies the professional role from the session, writes through the session client/RLS, and revalidates the profile, agenda, and student discovery paths.
- `ProfessionalPublicProfileInput` contains only `displayName`, `bio`, `specialties: string[]`, `city`, `state`, and `isPublished`; no avatar upload, contacts, or registration JSONB.

- [ ] Add `getProfessionalPublicProfile()` to load only the current professional's editable public-profile row.
- [ ] Add `validateProfessionalPublicProfile()` with trimmed text, bounded field lengths, valid Brazilian UF, and a bounded specialties list; do not copy fields automatically from private registration JSON.
- [ ] Add the server action to upsert only the signed-in professional's profile row and return field/form errors in the existing EHFI action-result style.
- [ ] Build the editor using current cards/input groups and Io5 icons, with explicit public/hidden state and the “Credenciais em análise” disclosure when the existing practice status is `review_pending`.
- [ ] Add the editor link to the professional drawer and show an unpublished-profile empty state in the dashboard.
- [ ] Manually inspect public/hidden states and confirm the form never renders CPF, contact, date of birth, documents, or health fields.

**Deliverable:** a professional can edit and explicitly publish/hide a safe public presentation independently of credential review status.

---

### Task 4: Professional dashboard, agenda, activity form, and participant list

**Files:**
- Modify: `app/profissional/plataforma/page.tsx`
- Create: `app/profissional/plataforma/agenda/page.tsx`
- Create: `components/ehfi/professional-dashboard.tsx`
- Create: `components/ehfi/professional-agenda.tsx`
- Create: `components/ehfi/professional-activity-sheet.tsx`
- Create: `components/ehfi/professional-participant-list.tsx`
- Create: `app/actions/activities.ts`
- Create: `lib/activities/professional-queries.ts`
- Create: `lib/activities/activity-validation.ts`

**Interfaces:**
- `getProfessionalDashboardSummary(range: DateRange): Promise<ProfessionalDashboardSummary>` returns today's activity count, reserved-participant count, and upcoming owner activities.
- `listProfessionalActivities(range: DateRange): Promise<ProfessionalActivity[]>` returns only the session user's activities with derived reservation counts/capacity from `get_professional_activity_summary`.
- `listProfessionalActivityParticipants(activityId: string): Promise<ProfessionalParticipant[]>` calls the masked roster RPC.
- `validateActivityInput(input: unknown): ActivityInput` validates title, description, local start/end, location, nonnegative `priceCents`, positive capacity, and `draft | published` status.
- `saveProfessionalActivity(input: unknown): Promise<PlatformActionResult<{ activityId: string }>>` invokes `save_professional_activity`; `cancelProfessionalActivity(activityId: string): Promise<PlatformActionResult<null>>` invokes `cancel_professional_activity`.

- [ ] Add professional query functions using the session-bound server client and RPC summary; do not query booking identities directly.
- [ ] Add `validateActivityInput()` for session dates, end-after-start, title/location lengths, price, capacity, and publish/draft status; convert BRL text input to integer cents and format stored cents with `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
- [ ] Add server actions for save and professional cancellation. Reject malformed IDs/fields and map capacity/overlap/ownership failures to actionable Portuguese messages.
- [ ] Replace the placeholder with the Expo hierarchy: greeting hero, two live metric cards, quick agenda action, and next activities. Use empty/loading/error states instead of fabricated counts.
- [ ] Add the weekly agenda route with week navigation, seven day chips, filters for all/available/last spots/full/canceled, a chronological timeline, and an empty state.
- [ ] Use `date-fns` `pt-BR` formatting and `America/Sao_Paulo`; store real absolute start/end timestamps instead of weekday offsets.
- [ ] Build the activity create/edit sheet with the Expo field order: date, time, title, location, duration, price, capacity, notes. Provide draft and publish actions using the existing Base UI sheet and keep its footer reachable with the mobile keyboard.
- [ ] Show open/last-spots/full from capacity and active bookings, never from a manually entered “confirmed” activity status.
- [ ] Add the private participant list using only the masked RPC response. Preserve first name + surname initial and exclude student contact and health data.
- [ ] Allow safe edits only when there are no active bookings; for booked sessions, permit cancellation and prevent changes to time, location, or capacity. Confirm before professional cancellation.
- [ ] Manually inspect week boundaries, filters, empty/loading/error states, review-pending banner, sheet keyboard behavior, and cancellation messaging in both themes.

**Deliverable:** a professional can maintain dated activities and see accurate capacity, upcoming counts, and privacy-limited participant names.

---

### Task 5: Student discovery, details, bookings, and cancellation

**Files:**
- Modify: `app/aluno/plataforma/page.tsx`
- Create: `app/aluno/plataforma/aulas/page.tsx`
- Create: `app/aluno/plataforma/aulas/[activityId]/page.tsx`
- Create: `components/ehfi/student-dashboard.tsx`
- Create: `components/ehfi/student-activities.tsx`
- Create: `components/ehfi/student-bookings.tsx`
- Create: `components/ehfi/student-activity-detail.tsx`
- Create: `app/actions/bookings.ts`
- Create: `lib/activities/student-queries.ts`

**Interfaces:**
- `listDiscoverableActivities(range: DateRange): Promise<DiscoverableActivity[]>` calls the student feed RPC and returns only public presentation/activity fields plus available places.
- `getStudentDashboard(range: DateRange): Promise<StudentDashboardData>` returns upcoming own bookings and the next discoverable sessions.
- `getStudentBookings(range: DateRange): Promise<StudentBooking[]>` returns only the signed-in student's bookings, including existing bookings when the professional hides their profile.
- `getStudentActivityDetails(activityId: string): Promise<DiscoverableActivity | null>` returns a discoverable activity or, for its existing booking owner, the minimum details needed to manage that booking.
- `reserveActivity(activityId: string): Promise<PlatformActionResult<{ bookingId: string }>>` invokes `reserve_activity`; `cancelStudentBooking(bookingId: string): Promise<PlatformActionResult<null>>` invokes `cancel_student_booking`.

- [ ] Implement student query functions with the session-bound server client/RPC; do not query health records or private professional registration data.
- [ ] Implement the reserve action with role validation, `revalidatePath` for dashboard/aulas/detail, and clear errors for full, hidden, overlapping, or already-reserved activities.
- [ ] Implement the cancel action with role validation, `revalidatePath` for dashboard/aulas/detail, and a clear error after an activity has started.
- [ ] Replace the student placeholder with an EHFI hero and a real upcoming-bookings summary; wire “Explorar atividades” and “Minha jornada” to the aulas/booking areas.
- [ ] Build `/aluno/plataforma/aulas` with upcoming reservations and published activities; use objective date ordering instead of mock “recommended” professionals.
- [ ] Build the activity detail route with editable public-professional fields, credential-review disclosure, date/time/location/duration/price, live remaining places, and a reserve or cancel action according to the student's state.
- [ ] Keep existing bookings visible and cancellable if the public profile is hidden; hide those activities from new discovery and block new reservations.
- [ ] Allow students with `review_pending` to discover, reserve, and cancel without reading or sharing their health questionnaire.
- [ ] Manually inspect open/full activities, current/past bookings, cancellation before/after start, profile hiding, and review-pending states in both themes.

**Deliverable:** students can find real published activities, understand remaining capacity, reserve, and cancel their own reservation under the approved rules.

---

### Task 6: Integrated manual review and operator handoff

**Files:**
- Review: all files listed in Tasks 1–5.
- Modify if needed: `docs/supabase-setup.md`

- [ ] Read the completed implementation against the approved design, focusing on Review Focus scenarios and role/privacy boundaries.
- [ ] Manually walk through professional profile publish/hide, activity draft/publish, agenda, participant roster, student discovery/reserve/cancel, and hidden-profile existing bookings using authorized student/professional sessions.
- [ ] Review the migration and setup note to confirm remote application is still an explicit operator action; do not connect to or mutate a remote Supabase project in this work.
- [ ] Summarize manual review coverage and any operational prerequisite. Do not run or add automated tests or the prohibited commands.

**Deliverable:** a complete browser-reviewed student/professional flow and updated Supabase operator instructions.
