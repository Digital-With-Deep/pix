# @pix-ui/react-native

## 0.2.0

### Minor Changes

- f1eb565: Add the trust loop components: what an agent plans, what its answer rests on, how far to trust it, and what it did.

  - `PlanView` shows an agent's plan before it acts, with **Proceed**, **Edit plan** and **Do it myself**, then live progress with a pulsing marker on the current step (off under reduced motion) and a summary line when it finishes or fails.
  - `InlineCitation` is a numbered source marker inside answer text; hover or focus shows the source's title, state and snippet in a tooltip.
  - `SourcePanel` lists the sources with each one's state in words: verified in the truth colour, contradicted in the claim colour, unverified neutral. `activeId` highlights the source a citation points to, controlled or uncontrolled.
  - `ConfidenceBadge` states confident, low confidence, needs review or check failed, with an optional score, scope and reason, inline or standalone. Also in `@pix-ui/react-native`.
  - `ActionHistory` lists agent actions with Undo and the time left while each undo window is open, then "Locked", and filters by agent and status.
  - `AutonomySetting` is a per-task radiogroup from "Suggest only" to "Act on its own", with a plain-language summary of the chosen level.

### Patch Changes

- b9420d0: Form field borders now meet 3:1 non-text contrast (WCAG, Web Content Accessibility Guidelines, 2.1 success criterion 1.4.11) on every surface in light and dark. `@pix-ui/tokens` adds `border-field` (3.34:1 or more in light, 3.40:1 or more in dark), `border-field-hover` and `focus-ring`. Text fields, selects, multi-selects, search fields, checkboxes, radios, the off switch track and the prompt input use them in `@pix-ui/react`, `@pix-ui/css` and `@pix-ui/react-native`, and focus borders and outlines move from `accent` (2.54:1 on white) to `focus-ring`. Decorative borders on cards, tables and dividers are unchanged.

  `Switch` without a `label` now passes `aria-label` and `aria-labelledby` to its track, so a bare switch has an accessible name, and each `AuditLog` histogram bar is labelled with its time bucket and event count.

- Updated dependencies [b9420d0]
  - @pix-ui/tokens@0.2.0
