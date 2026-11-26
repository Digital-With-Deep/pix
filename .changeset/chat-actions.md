---
"@pix-ui/react": minor
"@pix-ui/css": minor
---

Add `MessageActions` and attachments for `PromptInput`.

- `MessageActions` is a compact row for an agent message: Copy (Clipboard API with a fallback, and "Copied" feedback), Regenerate, thumbs up and down, and Branch from here. A thumbs down can open a reason picker with chips and a comment, reported through `onFeedbackReason`. Each action renders only when its handler is passed. Use it in the new `actions` slot of `AIResponse` or on a `Conversation` message.
- `PromptInput` attachments are now a controlled list (`attachments` with `onAttachmentsChange`, or `defaultAttachments`), take drag and drop and pasted files, filter with `accept`, `multiple` and `maxFileSize`, show `uploading` progress and `error` states on each chip, and hold Send while uploads run. `showAttachButton` adds a paperclip button and `onAddScreenshot` a camera button that attaches what your capture function returns. The existing `onAttach` and `onRemoveAttachment` props keep working.
- `@pix-ui/css` adds `pix-attachment*`, `pix-message-action*` and `pix-prompt--dragging` classes.
