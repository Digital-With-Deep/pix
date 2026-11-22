# @pix-ui/adapters

Adapters for **PIX — Primitives for Intelligent eXperiences**. They turn agent event streams into plain data for PIX components: streaming text for `Conversation`, tool calls for `ToolCall` and approval requests for `ApprovalCard`.

```sh
npm i @pix-ui/adapters
```

- Three protocols: Vercel AI SDK UI message stream parts (`"ai-sdk"`), AG-UI (Agent-User Interaction protocol) events (`"ag-ui"`) and Google ADK (Agent Development Kit) events (`"adk"`).
- A pure reducer, so it works with React's `useReducer`, any state library, a server or a test.
- No runtime dependencies and no React import. ESM with hand-written types.

```tsx
import { useReducer } from "react";
import { Conversation, ToolCall, ApprovalCard } from "@pix-ui/react";
import { createThread, applyEvent, toConversationMessages, readEventStream } from "@pix-ui/adapters";

const [thread, dispatch] = useReducer(applyEvent, undefined, () => createThread({ adapter: "ai-sdk" }));

// Feed it events from your agent.
for await (const event of readEventStream(await fetch("/api/chat", { method: "POST", body }))) dispatch(event);

// Render.
const messages = toConversationMessages(thread.messages, (m) =>
  m.kind === "tool"
    ? <ToolCall {...m.props} />
    : <ApprovalCard {...m.props} onApprove={() => dispatch({ type: "pix:approval-decision", approvalId: m.approvalId, approved: true })} />,
);
<Conversation messages={messages} />;
```

A runnable app is in [`examples/agent-starter`](../../examples/agent-starter). See the [root README](../../README.md) for the other packages.
