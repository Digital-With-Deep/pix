---
"@pix-ui/react": minor
---

Add four components for agent interfaces. `ApprovalCard` asks a person to approve, reject or edit an action an agent proposed, with the risk, a before and after table, evidence and an optional countdown. `ToolCall` shows one tool call with its input, output, status and a retry. `Conversation` is a chat thread that follows streaming text and stops when the reader scrolls up. `Markdown` renders model output safely, holding back half-written syntax while it streams. `AIResponse` gains a `streaming` status that renders its text as Markdown with a caret and a Stop button.
