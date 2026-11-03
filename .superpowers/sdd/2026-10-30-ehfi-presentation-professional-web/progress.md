# SDD ledger — plan: docs/superpowers/plans/2026-10-30-ehfi-presentation-professional-web.md

## Setup

- User authorized native implementation in the current ehfi web project.
- Expo project is reference only; no Figma file exists.
- No automated tests or prohibited validation/version-control commands.
- Plan/spec consistency reviewed: all requirements map to Tasks 1–5; task interfaces agree on Motion, theme, icons, form state, and routes.

## Rulings

- Ruling: Keep the student card visible but disabled as “Em breve” — avoids presenting a broken action while retaining Expo's two-profile context.
- Ruling: Replace the blank platform route with an explicit coming-soon placeholder — keeps the demonstrated navigation understandable without inventing dashboard functionality.
- Ruling: Use Motion in the web project — Expo uses Reanimated, and the Next package did not include Motion; adding it supports step exit/entry and short staggered presentation.

## Task Status

- Task 1: complete — Expo color tokens/gradients, Motion route shell, visible theme toggle, reduced-motion handling.
- Task 2: complete — responsive EHFI welcome, staggered entry, student “Em breve”, active professional route.
- Task 3: complete — local two-step form, masks/validation, academic branches, demo PDF dialog, mobile fixed action.
- Task 4: complete — demo confirmation and professional platform placeholder.
- Task 5: complete — manually inspected mobile and desktop layouts, light/dark themes, step progression, academic sample selection, success and placeholder; independent source review complete and its two findings resolved.

## Manual Review Notes

- Development server on port 3001 rendered the new welcome and all professional routes.
- Reviewed welcome and personal form at desktop width, and signup, academic selection, PDF dialog, success, and placeholder at 390×844.
- Confirmed the mobile CTA remains anchored to the viewport after moving it outside the blurred card; values stay in component memory only and no file picker or request is used.
- The initial Chrome development review showed the theme toggle's server/client label mismatch and the browser extension's injected `cz-shortcut-listen` attribute. The stable pre-mount label fixed the app mismatch; after reload, the remaining hydration warning was only the extension's body attribute.
- No images were generated, edited, or resized; existing PWA icon files are referenced as-is.
- No build, lint, typecheck, tests, or Git commands were run.
- Independent review found two concrete polish issues: the three input masks did not restore caret position after formatting, and the role card still moved under reduced-motion preference.
- Ruling: preserve selection by mapping the pre-format digit count to the formatted value, then restore the input selection on the next frame — this keeps masks editable without changing their format rules.
- Ruling: consult Motion's reduced-motion preference for role-card press/hover transforms and remove the CSS active translation — the remaining color/shadow feedback does not move content.
- Both findings were corrected and rechecked independently. No automated verification was run, per project instruction.
- Independent reviewer rechecked both corrections and found no remaining issue in those areas. The current desktop cadastro route was reloaded after the corrections and rendered with the expected headings and layout.
