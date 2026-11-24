---
"@pix-ui/react": minor
"@pix-ui/css": minor
---

Add the basics pack: eight everyday components that AI product screens need around the AI-specific ones.

- `Dialog` — modal panel rendered into `document.body` after mount, with focus trapping, Escape to close, scroll lock, focus returned to the opener, `aria-modal` and a title-labelled `role="dialog"` (or `alertdialog`). Controlled (`open`/`onOpenChange`) or self-managed with a `trigger`.
- `Popover` — non-modal panel anchored to its child trigger; closes on outside click, Escape or focus leaving, and returns focus to the trigger.
- `Tooltip` — short `role="tooltip"` label wired with `aria-describedby`, opening after a hover delay or immediately on keyboard focus, in four placements.
- `Toast`, `ToastProvider` and `useToast()` — a queued stack in a polite live region with auto-dismiss that pauses on hover and focus, an optional action button, and `info`/`truth`/`claim`/`warn` tones.
- `TextField` and `Textarea` — label, hint, error, required marker and a `maxLength` character count, controlled or uncontrolled.
- `Checkbox` — checked, indeterminate and disabled states with label, description and error.
- `Card` — surface with an optional header (title, description, action), body and footer.

Fields, Checkbox and Card render a skeleton in their footprint with `loading`. `@pix-ui/css` gains matching `pix-card__*`, `pix-field__*` and `pix-checkbox*` classes.
