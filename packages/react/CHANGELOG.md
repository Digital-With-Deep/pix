# @pix-ui/react

## 0.2.0

### Minor Changes

- 696da89: Render the A2UI (Agent-to-User Interface) 1.0 basic catalog's inputs and containers with PIX. The PIX catalog in `@pix-ui/a2ui` gains `TextField`, `CheckBox`, `ChoicePicker`, `Slider` and `DateTimeInput`, with values two-way bound to the data model and failed `@checks` shown on the field, plus `Image`, `Tabs`, `Modal` and `List`, and the `regex`, `length`, `numeric` and `email` validation functions. `@pix-ui/react` adds `Slider`, a token-styled native range input with a label, value display and min and max labels, and `DateField`, native date, time and date-and-time inputs with label, hint and error. `RadioGroup` gains `hint` and `error`.
- 3d70f12: Add four components for agent interfaces. `ApprovalCard` asks a person to approve, reject or edit an action an agent proposed, with the risk, a before and after table, evidence and an optional countdown. `ToolCall` shows one tool call with its input, output, status and a retry. `Conversation` is a chat thread that follows streaming text and stops when the reader scrolls up. `Markdown` renders model output safely, holding back half-written syntax while it streams. `AIResponse` gains a `streaming` status that renders its text as Markdown with a caret and a Stop button.
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

- de11087: Add the `Sidebar` component — an app navigation rail with icon rows, section headings, active state, badges, and nested groups that expand into **smoothly animated submenus** (grid-template-rows 0fr→1fr, honoring the global reduced-motion rule). `header` and `footer` are free slots for the brand, a search field and the account area; selection is controlled or uncontrolled.
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

- df95706: Add a subtle hover background to interactive rows and options, and keep underline tabs flat under custom radii.

  - `DataTable` rows, `RadioGroup` options, and `MultiSelect` option cards/listbox rows now show a mode-aware `--bg-muted` wash on hover (excluded on disabled items; selected/checked states unchanged).
  - `Tabs` underline buttons carry a `data-pix-tab` marker so consumers that apply a global radius override can exclude them — rounding a tab button curves its underline indicator.

- Updated dependencies [8f3df37]
- Updated dependencies [60def1d]
- Updated dependencies [b9420d0]
  - @pix-ui/css@0.2.0
  - @pix-ui/tokens@0.2.0
