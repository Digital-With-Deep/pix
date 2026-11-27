# @pix-ui/adapters

## 0.1.0

### Minor Changes

- ceaab0d: Add `@pix-ui/adapters`, which turns agent event streams into props for PIX components. A pure reducer, `applyEvent`, folds Vercel AI SDK UI message stream parts, AG-UI (Agent-User Interaction protocol) events or Google ADK (Agent Development Kit) events into a thread: streaming text for `Conversation`, tool calls for `ToolCall` and approval requests for `ApprovalCard`. Includes `readEventStream` for server-sent events, `resolveApproval` and `toConversationMessages`. No runtime dependencies and no React import.
