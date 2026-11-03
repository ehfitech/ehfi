# EHFI Premium Polish — Design Spec

## Intent

Refine the existing EHFI welcome and professional registration experience so it feels composed, responsive, and clear on phone and desktop. The screenshot identifies specific problems: the welcome panel has a bright border in dark mode, the two profile choices feel cramped, and the phone mask formats mobile numbers incorrectly. The form also needs consistent icon input groups and a searchable formation selector. Motion should help people follow the page and understand state changes, not add spectacle for its own sake.

The product reference is interpreted as **RUK** because the named products are RUK SiGN, HiRE, JURi, and TiME. The useful reference is the task-oriented hierarchy and staged workflows visible on its official pages; this is not a request to imitate RUK's brand or market-facing content.

## Product context

- This is a responsive PWA/web interface with mobile-first use and a fully considered desktop layout.
- The professional flow is a local demonstration. It has two registration steps and must not send, upload, or persist personal information.
- A simulated PDF selection remains a demonstration and must not open a device picker or read a real file.
- Existing EHFI colors, typography, Ionicons-family iconography, user-provided PWA icons, and soft pink/lilac gradients remain the visual foundation.
- Existing Next.js, Motion, shadcn components, Base UI, and React Icons are already installed. Do not add dependencies or create/edit/resize image assets.

## Goals

1. Correct dark-mode border contrast and make welcome role cards easier to scan with deliberate interior spacing.
2. Correct Brazilian phone formatting: include the DDD in parentheses; show 11-digit numbers as `(DD) 9XXXX-XXXX` and 10-digit numbers as `(DD) XXXX-XXXX`.
3. Turn “Tipo de formação” into a keyboard- and screen-reader-accessible searchable combobox using the existing shadcn/Base UI component.
4. Use EHFI Ionicons within shadcn `InputGroup` components for the text fields, preserving labels, validation, masks, autocomplete, and keyboard focus behavior.
5. Give meaningful content groups a distinct entrance: welcome hierarchy and role choices on entry; form panels and their field groups as they reach the viewport; short directional motion when changing steps.
6. Make light/dark theme changes visibly travel across the page, centered on the theme control, with support checks and a no-animation fallback.
7. Preserve readable content and a usable flow on narrow phones, tablets, and large desktop viewports.

## Non-goals

- No new pages, registration fields, API, database, account system, real file selection, or browser storage of form values.
- No new brand palette, generated illustrations, custom icon files, or asset resizing.
- No scroll-jacking, parallax, auto-rotating content, or long/bouncy movement.
- Do not insert marketing claims such as “premium”, “high-end”, or similar into interface copy.
- Do not replace the existing PWA icons or Next.js routing.

## Experience and visual decisions

### Welcome

- Keep the current two-column desktop composition and centered mobile sequence.
- Use the existing semantic `border-border` token for the welcome panel so light mode keeps a soft boundary and dark mode uses the existing deep plum border instead of white.
- Increase role-card interior spacing to a stable 20–24px and minimum height around 192px. Keep both cards aligned; distinguish the disabled student option with its “Em breve” status and the professional action with a clear arrow/CTA.
- Reveal the heading, supporting copy, focus-area row, welcome panel, and role choices in a short, intentional order. The header remains a steady anchor.
- Keep copy short and specific. Do not add new explanatory marketing copy.

### Professional registration

- Retain the two-step form, existing field order, validation, conditional academic questions, local-only values, and simulated proof selection.
- Replace plain text inputs with the existing `InputGroup` + `InputGroupInput` composition. Each icon is decorative (`aria-hidden`) and selected from the installed Ionicons set to match the field meaning.
- Use a searchable combobox for formation type. It shows the existing five formation choices, filters locally by the option title and description, supports keyboard selection, exposes the visible label/error state, and continues to conditionally show the “Outro” field.
- Preserve validation copy next to its field and visible focus/invalid states around the complete input group.
- Reveal each semantic form panel when it enters view. Stagger field groups inside a panel only briefly; do not independently animate every icon or character. This gives the form a paced arrival without making repeated fields slow or distracting.
- Keep step transition direction, progress status, and the mobile bottom action. Continue to scroll to the first invalid field when validation fails.

### Motion and theme

- Use Motion already installed. Keep reveal movement small (about 5–10px), ease-out, and brief (roughly 180–280ms for form units). Stagger sibling field groups by about 35–55ms and only once when they first enter the viewport.
- Disable position/scale movement, long delays, and theme reveal animation when `prefers-reduced-motion: reduce` is enabled. Content must begin in a visible state for reduced-motion users. Combobox and dialog open/close animations must also stop under this preference.
- Trigger a same-document View Transition on theme changes when the browser supports it. Reveal the new palette from the control's center using a circular clip; use the viewport center for the existing keyboard shortcut. Keep the transition under half a second. If unsupported or motion is reduced, change the theme normally.
- Do not animate continuously or on every form edit.

## Accessibility and responsive behavior

- Keep explicit field labels, `aria-invalid`, nearby error text, keyboard navigation, visible focus rings, and accessible icon-only button labels.
- The combobox input must have an associated visible label, and its separate trigger button must have a Portuguese accessible name; options remain navigable by keyboard and its no-results state is announced by the component's built-in semantics.
- Respect reduced motion on entry, scroll reveal, step change, theme change, and card press/hover movement.
- Maintain at least 44px touch targets for primary controls; allow the form to stack on phone and use the existing two-column field layout only where space supports it. Reserve enough mobile scroll space for the fixed two-button step-two action bar and safe-area inset so it cannot cover the proof panel. When a text field opens the on-screen keyboard, move the fixed action bar above the visual viewport's covered edge when browser metrics expose it.
- Verify visually at the available mobile and desktop browser sizes; do not hide form content merely to shorten the initial viewport.

## Performance and implementation boundaries

- Use opacity and small transforms for entrance effects; observe sections once rather than continuously tracking scroll progress.
- Use native View Transitions as progressive enhancement, with an immediate `next-themes` update fallback. Keep the existing theme preference mechanism.
- Use `VisualViewport` keyboard metrics when available. Without that API, rely on the browser's normal `position: fixed` behavior when its layout viewport resizes; a keyboard that overlays an unchanged layout viewport cannot be detected by this fallback.
- Keep the current section component and file organization unless a focused reusable helper is needed for the theme transition or icon input.
- No automated tests or prohibited commands are permitted by project instructions. Validation in this task is read-only manual browser inspection.

## Acceptance criteria

- In dark mode, the welcome panel border is a subdued theme-token boundary, not white; the pink/lilac background treatment remains intact in both themes.
- Both role cards have comfortable horizontal and vertical padding and align at desktop and phone widths.
- A mobile number formats to `(11) 91234-5678`; a landline formats to `(11) 2345-6789`; the caret remains editable during typing.
- Formation type is searchable, selected values persist through the current in-memory flow, keyboard selection works, and “Outro” behavior is unchanged.
- Text fields display contextual Ionicons inside shadcn input groups and retain their error/focus semantics.
- Welcome elements and offscreen form panels appear in a restrained sequence as they enter the viewport; reduced-motion preference skips movement and stagger.
- Theme change uses the button's position as its origin where supported and remains functional on browsers without View Transitions.
- The fixed mobile action bar does not cover the end of the academic form, and the combobox's trigger has its own accessible name.
- When the on-screen keyboard covers the visual viewport, the fixed action bar follows above it where `VisualViewport` metrics are available.
- Combobox and document-dialog entrance/exit animations stop when reduced motion is requested.
- Existing local-only demo flow, routes, gradients, fonts, PWA icons, and non-persistence behavior remain intact.

## Reference notes

- RUK official product pages: [RUK home](https://ruk.com.br/), [platform](https://ruk.com.br/plataforma), [HiRE](https://ruk.com.br/produtos/ruk-hire), and [SiGN](https://ruk.com.br/produtos/ruk-sign). Use the visible principles of staged tasks, practical hierarchy, and cross-device workflows as reference; do not reproduce its product messaging or visual identity.
- Motion [useInView](https://motion.dev/docs/react-use-in-view) describes one-time viewport observation and an `amount` threshold.
- MDN's [VisualViewport API](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) describes the visual viewport separately from the layout viewport and how an on-screen keyboard can shrink it.
- shadcn [Combobox](https://ui.shadcn.com/docs/components/base/combobox) and [Input Group](https://ui.shadcn.com/docs/components/base/input-group) document the components already present in this repository. Base UI's [Combobox guidance](https://base-ui.com/react/components/combobox) positions it as a filterable select for predefined choices.
- The installed Next.js App Router [view transition guide](https://nextjs.org/docs/app/02-guides/view-transitions) notes graceful behavior where the browser lacks support and provides reduced-motion guidance. MDN documents [Document.startViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition) as the same-document transition hook.
- Built-in UI/UX search returned a generic health/wellness design system whose teal palette and neumorphism conflict with the established EHFI brand. That palette is rejected. Its relevant guidance—reduced motion, responsive checks, and restraint against animating every element—is retained.

## Decisions made for implementation

- Interpret “RUC” as RUK due to the explicitly named RUK SiGN/HiRE/JURi/TiME products.
- Preserve EHFI's exact current color and gradient tokens rather than using generic health-sector palette recommendations.
- Treat each input field as one animation unit and each panel as a viewport reveal unit; do not animate individual icons or characters.
- Use a circular View Transition as progressive enhancement, with `next-themes` remaining the source of persisted theme preference.
- Apply the same theme-transition helper to the visible control and the existing `D` keyboard shortcut so theme changes stay consistent.
- Keep all implementation native to this repository and record manual review only; tests/build/lint/typecheck/Git are excluded.
