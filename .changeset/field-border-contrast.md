---
"@pix-ui/tokens": minor
"@pix-ui/css": patch
"@pix-ui/react": patch
"@pix-ui/react-native": patch
---

Form field borders now meet 3:1 non-text contrast (WCAG, Web Content Accessibility Guidelines, 2.1 success criterion 1.4.11) on every surface in light and dark. `@pix-ui/tokens` adds `border-field` (3.34:1 or more in light, 3.40:1 or more in dark), `border-field-hover` and `focus-ring`. Text fields, selects, multi-selects, search fields, checkboxes, radios, the off switch track and the prompt input use them in `@pix-ui/react`, `@pix-ui/css` and `@pix-ui/react-native`, and focus borders and outlines move from `accent` (2.54:1 on white) to `focus-ring`. Decorative borders on cards, tables and dividers are unchanged.

`Switch` without a `label` now passes `aria-label` and `aria-labelledby` to its track, so a bare switch has an accessible name, and each `AuditLog` histogram bar is labelled with its time bucket and event count.
