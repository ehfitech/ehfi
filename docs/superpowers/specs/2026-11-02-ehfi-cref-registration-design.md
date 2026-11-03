# EHFI CREF Registration — Design Spec

## Intent

Add a third step to the professional signup flow to collect the applicant's CREF status and the relevant registration details. Applicants can complete the account creation journey whether they already hold a CREF, are waiting for one, or do not yet have one.

## Product decisions

- CREF is step 3 after personal information and academic formation.
- The question is: “Você possui registro no Conselho Regional de Educação Física - CREF?”
- The choices are “Sim, já possuo registro profissional”, “Estou aguardando a emissão do meu registro”, and “Ainda não possuo registro profissional”.
- “Sim” shows council/state, registration number, self-declared status (“Regular” or “Possuo pendências”), and a required professional-card attachment.
- “Aguardando” shows a required description of the request situation and an optional protocol or proof attachment.
- “Ainda não possuo” shows that completing the degree does not replace the professional registration required for regulated work.
- Selecting “Ainda não possuo” does not stop account creation. Each choice can continue after completing only its applicable required fields.
- Declared regular status and submitted proof are not validation. “Regular” remains a self-declaration; the demo performs no CREF verification.
- Show the practice-restriction notice only for applicants awaiting issuance, without a registration, or declaring pending issues. Registered applicants declaring a regular status do not see that conditional notice.
- When the notice applies, the applicant may still finish account creation and use internal functions, but cannot offer professional services or attend clients until regularization and validation.
- Approval, review queue, back office, and enforcement in service/booking flows are future work. This change adds no such system.

## Goals

1. Add conditional CREF fields and branch-specific validation to the existing signup form.
2. Communicate the practice restriction only when the selected CREF situation prevents professional activity, without blocking signup.
3. Keep the CREF response and attachments in the same in-memory demo flow as the existing academic form.
4. Keep the completion screen clear that this demo does not validate or save CREF information, without repeating the conditional practice restriction for every answer.

## Non-goals

- No CREF verification, approval workflow, administration page, account backend, database, API, browser storage, or service/booking permissions.
- No real file picker or upload. Attachments use the existing PDF demonstration pattern and are never sent or saved.
- No changes to personal or academic fields, their validation, routes, theme, or visual identity beyond what is necessary to add the third step.
- No automated tests or prohibited commands.

## Experience and behavior

### Step progression

- Update signup progress from two steps to three: personal (1/3), academic (2/3), CREF (3/3).
- Step 1 continues to the academic step; step 2 supports Back and Continue to CREF; step 3 supports Back to academic and Finish signup.
- Existing step transition direction, reduced-motion handling, scrolling, fixed mobile action bar, keyboard inset, and safe-area behavior remain in place.

### CREF branches

- Always require one of the three CREF answers.
- For “Sim”: require a Brazilian state/Federal District council selection, a non-empty registration number, one declared situation, and the professional-card demo PDF.
- For “Aguardando”: require a non-empty request-situation description. Offer an optional protocol/proof demo PDF.
- For “Ainda não possuo”: show the degree-versus-registration explanation and require no additional branch fields.
- Changing between choices hides irrelevant fields without discarding the values already entered in other branches.
- Show branch-specific validation messages beside the relevant field and scroll to the first invalid field when finishing.

### Disclosure and completion

- State that the registration details and documents remain in this local demonstration and are not transmitted or stored.
- State that “Regular” is a self-declaration, not a CREF verification.
- State that the conditional restriction notice does not block account creation or internal functions, but service offers and client attendance remain unavailable for the affected CREF situations.
- The completion screen must not imply that this demo reviewed, verified, or saved a CREF registration, or repeat the conditional service restriction for every answer.

## Implementation calls

- Reuse the current `SelectableCard`, `FormField`, input styling, and simulated PDF dialog in `professional-signup.tsx`.
- Store CREF answers in a typed form object alongside the existing in-memory academic and personal state.
- Use a native select for the 26 Brazilian states and Federal District, labeled with UF and state name.
- Keep the success notice generic because the demonstration intentionally does not persist form answers across route navigation.

## Acceptance criteria

- The progress header reads “Etapa 1 de 3”, “Etapa 2 de 3”, and “Etapa 3 de 3” at the corresponding steps, with progress 33%, 67%, and 100%.
- Applicants can move between all three steps without losing completed branch values.
- Each CREF choice reveals exactly its applicable fields and copy.
- “Sim” cannot finish without council, registration number, declared situation, and the professional-card demo attachment.
- “Aguardando” cannot finish without a request-situation description; its proof remains optional.
- “Ainda não possuo” can finish and displays the required legal-habilitation disclosure.
- All branches can complete account creation; the practice-restriction notice appears for awaiting issuance, no registration, or declared pending issues, and is absent for registered applicants declaring regular status.
- The completion screen does not repeat the conditional practice restriction for every answer.
- The existing demonstration-only, local-in-memory behavior remains explicit; no files or personal information are transmitted or persisted.

