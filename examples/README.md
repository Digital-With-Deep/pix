# PIX examples

Open any `index.html` after `pnpm build` (they load the local builds from `packages/*/dist`), or serve the repo root: `npx serve .`

| Example | What it shows |
| --- | --- |
| `html-starter/` | Plain HTML with `@pix-ui/css` classes — no framework, no build step. |
| `ai-patterns/` | The three assistant surfaces: dedicated page, sidebar panel, inline entry points (`<script>` build, `window.PIX`). |
| `pact-console/` | A full product console (PACT, an agent-evaluation app) built on PIX — the system's origin and its largest reference app. |
| `agent-starter/` | A working agent screen: a mock agent streams text, runs a tool and asks for approval through `@pix-ui/adapters`, rendered with `Conversation`, `ToolCall`, `ApprovalCard` and `PromptInput`. Vite + React + TypeScript; run `pnpm --filter agent-starter dev` after `pnpm install && pnpm build`. |
