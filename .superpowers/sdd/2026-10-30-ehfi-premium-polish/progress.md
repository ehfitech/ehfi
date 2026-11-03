# SDD ledger — plan: docs/superpowers/plans/2026-10-30-ehfi-premium-polish.md

## Setup

- User authorized implementation in the current EHFI workspace and explicitly said not to pause for questions.
- Screenshot treated as visual reference only. No image files will be generated, edited, or resized.
- Existing EHFI PWA icons, routes, local-only form state, simulated PDF choice, type, and light/dark gradients are preserved.
- Installed Next.js 16.4.3 App Router template and view-transition guides were read before editing code.
- UI references reviewed: official RUK SiGN/HiRE/JURi/platform pages, shadcn/Base UI Combobox and Input Group docs, Motion viewport reveal guidance, and MDN View Transitions.
- Design-system search returned a generic teal/neumorphic direction inconsistent with EHFI; that direction was rejected while retaining its useful restraint and reduced-motion notes.
- Fresh builder check reviewed the design spec: no blockers. It left icon/spacing/reveal thresholds, phone caret editing, rapid theme toggles, and focus/error visibility as implementer decisions; these were resolved in the spec and plan.
- No automated tests, build, lint, typecheck, or Git commands are allowed or planned.

## Rulings

- Ruling: Keep the existing EHFI palette and gradient instead of adopting the generic teal healthcare palette returned by design search — the task is a refinement of an established product identity — cost if wrong: a fresh visual direction would require revisiting design tokens.
- Ruling: Reveal semantic field groups with a short stagger rather than animating each glyph/icon independently — preserves legibility and keeps frequent form interaction calm — cost if wrong: the entrance can feel less theatrical than the user's broad wording suggests.
- Ruling: Use the native document View Transition API only as an enhancement and fall back to the current `next-themes` update — theme selection remains usable in older browsers and reduced-motion settings — cost if wrong: unsupported environments will have an immediate theme change.
- Ruling: Keep the theme toggle and existing `D` hotkey on one shared transition helper — avoids two different theme-change experiences — cost if wrong: the hotkey gains a short reveal animation when motion is allowed.
- Ruling: Render Base UI Combobox rows through its item render function — the installed list applies filtering to its item model, and static mapped children remained visible after search — cost if wrong: the option renderer depends on the list's render-function contract.
- Ruling: Use `overflow-clip` on the registration page wrapper — the previous overflow behavior created a nested scroll offset that left the header displaced during step navigation — cost if wrong: page-level decorative overflow could become visible.
- Ruling: Offset the fixed mobile action bar from the visual viewport's covered edge only while an editable field is focused — this handles keyboards that shrink the visual viewport without forcing an offset in browsers that resize the layout viewport — cost if wrong: unusual browser keyboard metrics could shift the action bar slightly until the field loses focus.

## Task Status

- Task 1: complete — welcome border now uses the semantic surface token; card padding/height and staggered reveals are refined.
- Task 2: complete — phone masks use parenthesized DDD and 4+4/5+4 local splits; personal and academic inputs use icon groups.
- Task 3: complete — searchable formation combobox filters title/description, supports keyboard selection and empty results, and conditionally reveals fields; panel/field reveals honor reduced motion.
- Task 4: complete — button and `D` shortcut share a circular native view transition with feature detection, fallback, and reduced-motion rules.
- Task 5: complete — manual browser review recorded below; no automated verification commands were run.

## Manual Review

- Welcome screen: desktop in light and dark; 390px mobile viewport in dark. The border follows the theme surface token and both EHFI pink/lilac gradients remain visible.
- Registration: desktop and mobile layouts inspected. Both phone examples were manually entered and rendered as `(11) 2345-6789` and `(11) 91234-5678`; caret movement was inspected.
- Formation selection: accent-insensitive search, keyboard selection, empty results, `Outro` conditional field, and the year field for an in-progress course were inspected. A scroll/step-transition issue was corrected and rechecked at document scroll position 0.
- Theme controls: visible button and `D` shortcut both switched themes. Reduced motion and the unsupported-browser fallback were reviewed in code but not emulated in this browser.
- Final code review follow-ups: step two now reserves additional mobile space for its two-button fixed action bar; the combobox trigger has a Portuguese accessible name; combobox and document-dialog popup animations are disabled by the reduced-motion media query. The mobile step-two footer and trigger name were checked again in the browser.
- Mobile keyboard follow-up: the fixed action bar reads `VisualViewport` resize/scroll metrics while an editable field is focused and rises by the covered edge when needed. The desktop/mobile layouts were checked manually; no physical mobile keyboard was available to emulate this interaction.
- Compatibility limit: MDN marks `VisualViewport` as widely available, but browsers without it cannot expose an overlay keyboard's covered height; in those browsers, `position: fixed` follows normal layout-viewport resizing when the browser provides it, otherwise the bar stays at the viewport's bottom.
- Demo values were entered only into the isolated local browser page. No network submission, real file picker, persistence, or image generation/editing/resizing was used.
- Automated tests, build, lint, typecheck, and Git commands were not run, per the workspace instructions.
