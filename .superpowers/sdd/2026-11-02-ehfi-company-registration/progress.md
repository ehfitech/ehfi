# SDD ledger — plan: docs/superpowers/plans/2026-11-02-ehfi-company-registration.md

Pre-flight:
- Task 1 produces `CompanyDirectoryData`; Task 2 maps Open CNPJ into it — compatible.
- Task 2 exposes `GET /api/cnpj/{cnpj}` returning `CompanyDirectoryData`; Task 3 consumes this response — compatible.
- Task 3 completes via `/empresa/sucesso`; Task 4 creates that route — compatible.
- Task 3 renders links to the terms and privacy anchors; Task 6 creates them — compatible.
- Task 5 independently updates the home role cards — no shared data interface.

Ruling: Use a demo-specific Terms of Use page limited to verifiable prototype behavior — the user requested a terms acknowledgement, but no production legal text exists in the project; this keeps the demo transparent, at the cost of replacing the text before any live operation.

Workspace: current project folder, explicitly requested for native implementation. Git/worktree commands are prohibited by project instructions.

Verification boundary: do not run `git`, `typecheck`, `build`, `lint`, or test commands. Use source review and an optional local visual preview only.

Implementation complete:
- Added the numeric-only, masked CNPJ lookup with 450 ms debounce, stale-response protection, editable fields, safe upstream error mapping, and manual fallback.
- Added the six-step company flow, success route, homepage card, demo terms, and company privacy disclosure.
- A read-only source review identified company-switch data carryover and missing focus targets for schedule errors; both were fixed. Brazilian DDD validation was tightened, and malformed upstream payloads now map to 502.
- Source-level review completed against the spec and plan. Automated checks and visual browser preview were not run under the project instruction not to test or run prohibited commands.
