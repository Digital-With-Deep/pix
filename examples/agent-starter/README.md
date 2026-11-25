# PIX agent starter

A working agent screen in Vite + React + TypeScript. A mock agent (no network, no API keys) streams a fictional accounts payable scenario: the assistant explains why an invoice is blocked, runs a lookup tool, then asks you to approve releasing the payment. Approving or rejecting continues the stream.

It shows the whole path from an agent event stream to PIX components:

- `src/mockAgent.ts` emits Vercel AI SDK UI message stream parts, the same objects a real `/api/chat` route sends.
- `@pix-ui/adapters` folds those events into thread state with `applyEvent`, used directly as a `useReducer` reducer.
- `src/renderPart.tsx` renders tool calls with `ToolCall` and approval requests with `ApprovalCard`. Copy it into your app.
- `src/App.tsx` puts it together in a `Conversation` with a `PromptInput` footer.

## Run it in the monorepo

From the repo root, once:

```bash
pnpm install && pnpm build
```

Then:

```bash
pnpm --filter agent-starter dev
```

Open the URL printed in the terminal (defaults to [http://localhost:5173](http://localhost:5173)). `pnpm --filter agent-starter build` type-checks and builds it.

## Start your own app from it

```bash
npx degit Digital-With-Deep/pix/examples/agent-starter my-agent-app
cd my-agent-app
```

Outside the monorepo, the `workspace:*` versions in `package.json` do not resolve. Replace them with published versions before you install:

```bash
npm pkg set "dependencies.@pix-ui/react=latest" "dependencies.@pix-ui/adapters=latest"
npm install
npm run dev
```

## Connect a real agent

Replace the mock with your agent's stream and pick the matching adapter:

```ts
import { createThread, readEventStream } from "@pix-ui/adapters";

const init = () => createThread({ adapter: "ai-sdk" }); // or "ag-ui" or "adk"

const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages }) });
for await (const event of readEventStream(res)) dispatch(event);
```

Sending the reviewer's decision back to the agent depends on the protocol. See the "Connect an agent" guide in the PIX docs.
