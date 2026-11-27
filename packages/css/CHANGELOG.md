# @pix-ui/css

## 0.2.0

### Minor Changes

- 8f3df37: Add the basics pack: eight everyday components that AI product screens need around the AI-specific ones.

  - `Dialog` — modal panel rendered into `document.body` after mount, with focus trapping, Escape to close, scroll lock, focus returned to the opener, `aria-modal` and a title-labelled `role="dialog"` (or `alertdialog`). Controlled (`open`/`onOpenChange`) or self-managed with a `trigger`.
  - `Popover` — non-modal panel anchored to its child trigger; closes on outside click, Escape or focus leaving, and returns focus to the trigger.
  - `Tooltip` — short `role="tooltip"` label wired with `aria-describedby`, opening after a hover delay or immediately on keyboard focus, in four placements.
  - `Toast`, `ToastProvider` and `useToast()` — a queued stack in a polite live region with auto-dismiss that pauses on hover and focus, an optional action button, and `info`/`truth`/`claim`/`warn` tones.
  - `TextField` and `Textarea` — label, hint, error, required marker and a `maxLength` character count, controlled or uncontrolled.
  - `Checkbox` — checked, indeterminate and disabled states with label, description and error.
  - `Card` — surface with an optional header (title, description, action), body and footer.

  Fields, Checkbox and Card render a skeleton in their footprint with `loading`. `@pix-ui/css` gains matching `pix-card__*`, `pix-field__*` and `pix-checkbox*` classes.

- 60def1d: Add `MessageActions` and attachments for `PromptInput`.

  - `MessageActions` is a compact row for an agent message: Copy (Clipboard API with a fallback, and "Copied" feedback), Regenerate, thumbs up and down, and Branch from here. A thumbs down can open a reason picker with chips and a comment, reported through `onFeedbackReason`. Each action renders only when its handler is passed. Use it in the new `actions` slot of `AIResponse` or on a `Conversation` message.
  - `PromptInput` attachments are now a controlled list (`attachments` with `onAttachmentsChange`, or `defaultAttachments`), take drag and drop and pasted files, filter with `accept`, `multiple` and `maxFileSize`, show `uploading` progress and `error` states on each chip, and hold Send while uploads run. `showAttachButton` adds a paperclip button and `onAddScreenshot` a camera button that attaches what your capture function returns. The existing `onAttach` and `onRemoveAttachment` props keep working.
  - `@pix-ui/css` adds `pix-attachment*`, `pix-message-action*` and `pix-prompt--dragging` classes.

### Patch Changes

- b9420d0: Form field borders now meet 3:1 non-text contrast (WCAG, Web Content Accessibility Guidelines, 2.1 success criterion 1.4.11) on every surface in light and dark. `@pix-ui/tokens` adds `border-field` (3.34:1 or more in light, 3.40:1 or more in dark), `border-field-hover` and `focus-ring`. Text fields, selects, multi-selects, search fields, checkboxes, radios, the off switch track and the prompt input use them in `@pix-ui/react`, `@pix-ui/css` and `@pix-ui/react-native`, and focus borders and outlines move from `accent` (2.54:1 on white) to `focus-ring`. Decorative borders on cards, tables and dividers are unchanged.

  `Switch` without a `label` now passes `aria-label` and `aria-labelledby` to its track, so a bare switch has an accessible name, and each `AuditLog` histogram bar is labelled with its time bucket and event count.

- Updated dependencies [b9420d0]
  - @pix-ui/tokens@0.2.0
