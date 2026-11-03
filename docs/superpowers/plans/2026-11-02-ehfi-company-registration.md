# EHFI Company Registration Implementation Plan

> **For agentic workers:** Implement inline in the current workspace, following the tasks in order. Automated tests are intentionally excluded by the user's project instructions.

**Goal:** Add a six-step demonstrative company registration flow with debounced numeric CNPJ lookup through Open CNPJ.

**Architecture:** Keep company registration types, options, formatting and per-step validation in a new `lib/company-registration.ts`. Use a Next.js App Router Route Handler as a same-origin, read-only proxy for the public Open CNPJ endpoint, and a focused client component for the six-step form. Reuse the existing shared stepper, card, animation and navigation patterns; add dedicated success and demonstration-terms routes and update privacy copy for the external CNPJ lookup.

**Tech Stack:** Next.js 16.4.3 App Router, React 19, TypeScript, Tailwind CSS 4, `motion/react`, `react-icons/io5`, existing shadcn UI components.

**Spec:** `docs/superpowers/specs/2026-11-02-ehfi-company-registration-design.md`

## Global Constraints

- The project instruction prohibits executing `git`, `typecheck`, `build`, `lint`, and test commands.
- Do not add automated tests or install dependencies.
- CNPJ input accepts 14 numeric digits only and is displayed with the Brazilian numeric mask.
- Company data is not submitted to or stored by EHFI; only the CNPJ is sent to Open CNPJ for lookup.
- A lookup failure or missing record must leave manual registration available.
- The registration is a demo and does not create an account, profile, service request, proposal, contract or history.
- Use no more than six registration steps and preserve reduced-motion behavior.

## Review Focus

Review manually that: partial CNPJ values do not trigger lookup; 404, 429, malformed payload, timeout and 5xx states leave the form usable; late results cannot overwrite fields for a newer CNPJ; optional/null lookup fields do not erase entered data; conditional fields stop validating when hidden; multiple custom sectors and shifts can be added and removed; all required confirmations are enforced; desktop has three readable cards while mobile stacks them; and the privacy/success copy distinguishes the CNPJ query from form data not sent to EHFI. These are manual inspection points, not automated tests.

---

### Task 1: Company registration domain model

**Files:**
- Create: `lib/company-registration.ts`

**Interfaces:**
- Produces `CompanySignupStep = 1 | 2 | 3 | 4 | 5 | 6`.
- Produces `CompanyRegistrationForm`, `CompanyRegistrationField`, `CompanyRegistrationErrors`, `CompanySectorEntry`, `CompanySectorSchedule`, `CompanyShift`, `CompanyWeekday`, `CompanyDirectoryData`, `EmployeeBand`, `CompanyActivity`, `CompanyServiceMode`, `CompanyFrequency`, `CompanyDuration`, `CompanyGoal` and `CompanyPriorExperience` types.
- `CompanyRegistrationForm` fields are `legalName`, `tradeName`, `cnpj`, `activity`, `otherActivity`, `mainCnae`, `registrationStatus`, `street`, `number`, `complement`, `district`, `city`, `state`, `postalCode`, `websiteOrSocial`, `contactName`, `contactRole`, `contactDepartment`, `contactEmail`, `contactPhone`, `contactTime`, `employeeBand`, `employeeExact`, `workArrangement`, `spaceAvailability`, `openingTime`, `closingTime`, `operatingDays`, `hasShifts`, `hasNightShift`, `shifts`, `sectors`, `serviceModes`, `collectiveSpace`, `frequency`, `duration`, `contractInterest`, `startWindow`, `budgetStatus`, `budgetAmount`, `goals`, `otherGoal`, `priorExperience`, `specificNeeds`, `termsAccepted`, `privacyAcknowledged`, `contactAuthorized`, and `accuracyConfirmed`.
- Produces `initialCompanyRegistration`, `companySignupSteps`, `formatCnpj(value: string): string`, `getEmployeeBand(exact: string): EmployeeBand | ""`, and `validateCompanyStep(form, step): CompanyRegistrationErrors`.
- `CompanyDirectoryData` contains `cnpj`, `legalName`, optional `tradeName`, optional address fields `street`, `number`, `complement`, `district`, `city`, `state`, `postalCode`, optional `mainCnae`, and optional `registrationStatus`.
- Each `CompanySectorEntry` contains `id`, a fixed sector key or `other`, `customName`, `sameAsCompanyHours`, `days`, and repeatable `{ id, startTime, endTime }` schedule periods. Each `CompanyShift` contains `id`, a first/second/third/other key, optional custom label, `startTime` and `endTime`.

- [x] Define the six step labels and compact labels: Dados da empresa/Dados, Responsável/Contato, Estrutura e horários/Estrutura, Modelo e frequência/Modelo, Contratação e objetivos/Objetivos, Revisão e confirmações/Final.
- [x] Define typed form state for the fields in spec sections “Etapas e conteúdo” and “Comportamentos condicionais”; repeated sectors and shifts carry stable IDs.
- [x] Define exact company, employee-band, sector, weekday, mode, frequency, duration, start-window, budget-status, goal and prior-experience options from the spec: the experience values are currently offers, previously interrupted, and first experience; the frequency values are one/two/three times weekly, weekdays, one-time actions, and undefined; durations are 5–10, 10–15, 15–20, 20–30 minutes, and professional guidance.
- [x] Implement numeric-only CNPJ formatting that caps at 14 digits and retains cursor-friendly behavior through the existing `formatWithCaret` pattern at the call site.
- [x] Implement exact employee count to band derivation using the spec boundaries; exact count takes precedence over selected estimate.
- [x] Implement per-step validation with conditional requirements limited to currently visible fields; all optional fields remain optional.

**Manual review:** Compare every spec field and exact option against the form type, initial state, options and its owning step validator; confirm site/social, address complement, exact headcount, budget amount and specific needs are optional, while registry-only CNAE/status are never required.

### Task 2: Open CNPJ lookup boundary

**Files:**
- Create: `app/api/cnpj/[cnpj]/route.ts`

**Interfaces:**
- Consumes the dynamic `cnpj` path segment using the Next.js 16 Route Handler context shape `params: Promise<{ cnpj: string }>`.
- Produces `GET /api/cnpj/{cnpj}` returning `{ success: true, data: CompanyDirectoryData }` for success and a bounded error payload for invalid, missing or unavailable records.

- [x] Reject values that are not exactly 14 numeric digits before contacting the upstream service.
- [x] Fetch `https://kitana.opencnpj.com/cnpj/{cnpj}` with `Accept: application/json` and `cache: "no-store"`.
- [x] Bound upstream wait time and map only company identity/address, main CNAE description and registration status; do not map public company email/phone into responsible-person fields.
- [x] Validate the upstream success envelope and required strings; preserve upstream `404`/`429` semantics where useful and return a safe `502` for malformed payload, timeout or upstream failure.
- [x] Do not log the CNPJ or persist the returned payload.

**Manual review:** Confirm route input validation, payload mapping and each error response path in code; confirm no secrets or persistence were added.

### Task 3: Six-step company form and CNPJ experience

**Files:**
- Create: `components/ehfi/company-signup-stepper.tsx`
- Create: `components/ehfi/company-signup.tsx`

**Interfaces:**
- Consumes `CompanySignupStep`, `CompanyRegistrationForm`, `validateCompanyStep`, and the lookup contract from Tasks 1 and 2.
- Produces the six-step responsive company form and its conditional state transitions.

- [x] Wrap the existing generic `SignupStepper` with company step labels and aria-label.
- [x] Match existing signup shell, branded fields, cards, animated transitions, reduced-motion settings, focus management, sticky mobile navigation and success routing.
- [x] Implement the six step panels and fields exactly as scoped in the spec; keep the company registration address editable and distinguish it from the registered address source.
- [x] Implement conditional shifts, night shift, per-sector schedules, selected “Outro” text, collective capacity, employee exact count, frequency/duration guidance, and clear hidden conditional values/validation as appropriate.
- [x] Apply the numeric CNPJ mask; debounce lookup for 450 ms after 14 digits; abort or ignore stale requests; show loading, found, not found and unavailable feedback without blocking manual entry.
- [x] Populate legal name, trade name and address from valid lookup data; show CNAE and registration status for review; preserve manual editability and never fill responsible-person email/phone from registry contacts.
- [x] Track fields populated by the lookup and fields edited by the person; when a different complete CNPJ is entered, clear the prior company identity and directory values, including manual edits, to avoid mixing companies. During partial CNPJ editing, clear only untouched lookup values and never let a delayed response update fields for the current CNPJ.
- [x] Complete only after all six step validators and required final confirmations pass; do not submit or persist the form.

**Manual review:** Inspect every panel for mobile/desktop readability, visible error targeting, conditional behavior, stale lookup protection, editable fetched values and reduced-motion branches.

### Task 4: Registration routes and success page

**Files:**
- Create: `app/empresa/cadastro/page.tsx`
- Create: `app/empresa/sucesso/page.tsx`
- Create: `components/ehfi/company-signup-success.tsx`

**Interfaces:**
- The cadastro page wraps `CompanySignup` in the existing `PageTransition` pattern.
- The success page states the demo limits and that only CNPJ was queried externally.

- [x] Add route metadata in the same pattern as the existing student/professional pages.
- [x] Add an accessible success screen with links back to the home page and copy that does not imply data was submitted or saved by EHFI.

**Manual review:** Confirm route paths, metadata labels, page-transition wrapper and accurate completion copy.

### Task 5: Home page role-card layout

**Files:**
- Modify: `components/ehfi/welcome-screen.tsx`
- Modify: `components/ehfi/role-card.tsx`

**Interfaces:**
- The role card links to `/aluno/cadastro`, `/profissional/cadastro`, and `/empresa/cadastro`.

- [x] Place the introductory copy before a full-width role-card section so the existing narrow right panel does not squeeze three cards.
- [x] Keep one card per row on mobile, two on intermediate widths and three across on desktop.
- [x] Add the company icon, concise copy, focus ring, press/hover motion and navigation transition using the existing EHFI patterns.

**Manual review:** Inspect the card composition at mobile, tablet and desktop widths and confirm all three roles remain accessible.

### Task 6: Terms and privacy copy

**Files:**
- Create: `app/termos-de-uso/page.tsx`
- Modify: `app/privacidade/page.tsx`
- Modify: `components/ehfi/company-signup.tsx`

**Interfaces:**
- The final step links to `/termos-de-uso` and `/privacidade#cadastro-empresa`.
- The privacy page exposes an element with `id="cadastro-empresa"`.

- [x] Add demo-only terms containing only verifiable prototype behavior and restrictions described in the spec.
- [x] Add the company privacy section covering registration fields, the public CNPJ lookup, the external recipient Open CNPJ, non-persistence and manual review of returned data.
- [x] Correct the privacy-page demo notice so it does not claim that no company data leaves the browser: the CNPJ is sent to Open CNPJ; the other company answers are not sent to EHFI or saved.
- [x] Add separate required controls for terms/policy acknowledgement, contact authorization and information accuracy; each has its own accessible error.

**Manual review:** Compare checkbox wording, links and demo claims against the actual implementation; confirm they never imply an operational account or service.

### Final manual review

- [x] Re-read the spec and map every goal, field, condition, route, responsive behavior and privacy statement to Tasks 1–6.
- [x] Confirm each plan interface uses the same names and types produced by Task 1 and consumed by Tasks 2–6.
- [x] Record any manual-review limitation caused by the project's command prohibition; do not run `git`, `typecheck`, `build`, `lint`, or test commands.
