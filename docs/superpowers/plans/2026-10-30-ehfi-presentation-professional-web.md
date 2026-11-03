# EHFI Web Presentation and Professional Signup Implementation Plan

> **For agentic workers:** Use this plan task by task. Automated tests and all project-prohibited commands are excluded by the user instructions.

**Goal:** Replace the web starter with a responsive EHFI welcome, a two-step local-only professional signup, a clear demo success screen, and a professional-area placeholder.

**Architecture:** Use Next App Router pages for the welcome, signup, success, and placeholder routes. Keep signup values in one client component for both steps, with pure validation helpers in lib. Use the existing shadcn/ui components and add Motion for React to animate route entry, step changes, progress, and conditional fields.

**Tech Stack:** Next.js App Router 16.4.3, React 19, TypeScript, Tailwind CSS 4, existing shadcn/Base UI components, next-themes, react-icons, Motion for React.

**Spec:** docs/superpowers/specs/2026-10-30-ehfi-presentation-professional-web-design.md

## Global Constraints

- The implementation target is the ehfi Next.js project; ehfi-expo is read-only reference.
- Preserve the Expo light screen gradient #F8F7FF, #FFF3F7, #F2EEFF and dark screen gradient #09090B, #14111C, #1A1023.
- Preserve Outfit headings and Inter body typography.
- Use the already-present PWA icons at public/pwa/icon-192.png, public/pwa/icon-512.png, and public/pwa/apple-touch-icon.png without editing or generating images.
- Keep all signup values and sample-document selection in memory; send no requests and save no form data.
- Keep the student option visible as “Em breve” and inactive. The professional option is the only active entry.
- Keep the success message clearly demonstrative and show a “Profissional em breve” placeholder after its CTA.
- Use existing shadcn/ui components and react-icons/io5; add Motion because it is absent from this project.
- Do not run Git, build, lint, typecheck, or tests.

## Review Focus

- Small viewports and the virtual keyboard must not hide the current step action.
- Changing academic branches must clear a sample document that no longer matches the required proof.
- Returning from academic details to personal details must preserve the in-memory values.
- Invalid or future birth dates, malformed field values, and out-of-range years must show local, adjacent errors.
- Reduced-motion preference must remove positional movement and long stagger delays without hiding state feedback.
- The sample PDF dialog must never invoke the device file picker or imply an upload.
- The dark theme must retain readable contrast over its gradient surfaces.

---

### Task 1: Establish EHFI web theme and motion shell

**Files:**
- Modify: app/globals.css
- Create: app/template.tsx
- Create: components/ehfi/theme-toggle.tsx
- Modify: package.json and pnpm-lock.yaml by adding Motion for React

**Interfaces:**
- Consumes: current next-themes provider, CSS theme variables, existing public PWA icons.
- Produces: reusable light/dark toggle, screen gradient tokens, and a short route-entry transition.

- [x] Align light and dark semantic colors with the Expo tokens; apply the three-stop gradient to the page background.
- [x] Add the motion package with pnpm and import client animation APIs only in client components.
- [x] Add a visible accessible theme toggle that calls next-themes and reflects the resolved theme.
- [x] Add a route template that animates page entry with a short opacity and vertical-offset transition.
- [x] Respect prefers-reduced-motion by removing the offset and shortening the entrance.
- [x] Inspect the resulting CSS and imports manually; do not run automated checks.

### Task 2: Build the welcome and role-entry screen

**Files:**
- Modify: app/page.tsx
- Create: components/ehfi/welcome-screen.tsx
- Create: components/ehfi/role-card.tsx

**Interfaces:**
- Consumes: theme tokens, theme toggle, existing Card and Button components, icon-192.png.
- Produces: a responsive EHFI landing screen; the professional card links to /profissional/cadastro and the student card is disabled with an “Em breve” badge.

- [x] Replace the starter copy with the EHFI presentation, role prompt, and professional entry action.
- [x] Use the existing PWA icon asset for the mark; do not copy, create, or transform raster files.
- [x] Use the Expo Ionicons family through the existing react-icons/io5 package.
- [x] Compose the mobile presentation in one column and the desktop presentation in two columns.
- [x] Add a short stagger for the mark, headline, supporting copy, and role choices; keep all controls usable during it.
- [x] Inspect semantic links, disabled-state communication, keyboard focus, contrast, and responsive class composition manually.

### Task 3: Implement the local two-step professional form

**Files:**
- Create: app/profissional/cadastro/page.tsx
- Create: components/ehfi/professional-signup.tsx
- Create: lib/professional-registration.ts

**Interfaces:**
- Consumes: existing Field, Input, Label, Card, Button, Progress, RadioGroup, Select, Dialog, icon, theme, and Motion components.
- Produces: typed local form state, field and academic validation helpers, and the two-step registration experience.

- [x] Define personal and academic form types, initial state, masks, and pure validation helpers for every specified field.
- [x] Build the step header, back action, accessible progress bar, four personal-information panels, and mobile sticky action.
- [x] Preserve personal and academic values when changing steps; show validation errors beside fields after an attempted advance.
- [x] Build conditional academic choices, year checks, “Outro” description, diploma branches, and correct proof requirements.
- [x] Show a local sample-PDF Dialog with add, replace, and remove actions; never call a system file picker.
- [x] Animate step exits/entries, progress, and newly revealed academic fields with reduced-motion behavior.
- [x] Inspect the JSX and validation state transitions manually; do not run automated checks.

### Task 4: Build demonstrative completion and platform placeholder

**Files:**
- Create: app/profissional/sucesso/page.tsx
- Create: components/ehfi/signup-success.tsx
- Create: app/profissional/plataforma/page.tsx
- Create: components/ehfi/platform-placeholder.tsx

**Interfaces:**
- Consumes: shared brand/theme shell, Button/Card components, and existing success copy intent.
- Produces: explicit demo-success page and an “Em breve” professional-area page with no dashboard controls.

- [x] Animate the confirmation mark, heading, supporting copy, and CTA in a short sequence.
- [x] State that the signup is a demonstration and that no information was sent or saved.
- [x] Link “Acessar a plataforma” to /profissional/plataforma.
- [x] Present a branded, complete placeholder instead of a blank screen.
- [x] Inspect direct-route content and navigation links manually.

### Task 5: Review the finished experience manually

**Files:**
- Review: app routes, shared EHFI components, app/globals.css, and the new validation helper

**Interfaces:**
- Consumes: completed routes and the constraints above.
- Produces: a source review record and, if available, a manual browser view at mobile and desktop widths.

- [x] Review the welcome, both form steps, sample-document dialog, success, and placeholder flows against the spec.
- [x] Review light/dark gradients, keyboard focus, accessible labels/errors, reduced motion, and narrow/wide responsive layout.
- [x] Confirm PWA icon files remain unchanged and their manifest paths still match.
- [x] Do not run build, lint, typecheck, tests, or Git.
