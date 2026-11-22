# @pix-ui/mcp

An MCP (Model Context Protocol) server for **PIX — Primitives for Intelligent eXperiences**. It lets AI coding tools such as Claude Code and Cursor look up PIX components instead of guessing their props.

```sh
npx @pix-ui/mcp
```

The server speaks JSON-RPC 2.0 over stdio. It has no runtime dependencies and makes no network requests: the component data is bundled into the package at build time.

## Set up

**Claude Code**

```sh
claude mcp add pix -- npx -y @pix-ui/mcp
```

**Cursor and other clients** — add to `.cursor/mcp.json` (or your client's `mcpServers` config):

```json
{
  "mcpServers": {
    "pix": { "command": "npx", "args": ["-y", "@pix-ui/mcp"] }
  }
}
```

## Tools

| Tool | Input | Returns |
| --- | --- | --- |
| `list_components` | none | Every component with a one-line description and its docs URL. |
| `get_component` | `name` (string, required), such as `Button` or `data-table` | The props table from the component's hand-written `.d.ts`, the docs page text and the example source, each example with its `npx shadcn add` command. |
| `suggest_component` | `description` (string, required), `limit` (integer 1 to 10, default 3) | The best matching components for a plain-language description of a UI, ranked by keyword relevance. |

## How the data is built

`pnpm build` runs `scripts/build-data.mjs`, which writes `dist/data.json` from:

- `packages/react/src/components/**/*.d.ts`, parsed with the same parser and component list as the docs prop tables (`apps/docs/scripts/build-props.mjs`)
- the component pages in `apps/docs/content/docs/components`, with MDX tags removed
- the examples in `apps/docs/registry/examples`

See [Use PIX with AI coding tools](https://pixui.digitalwithdeep.com/docs/ai-tools/) for the shadcn registry and `llms.txt` as well. Released under the MIT License.
