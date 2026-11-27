# @pix-ui/a2ui

Render A2UI (Agent-to-User Interface) protocol version 1.0 surfaces with **PIX — Primitives for Intelligent eXperiences**. An agent generates UI against the PIX catalog; `A2UISurface` renders it with `@pix-ui/react` components and reports what people do back to the agent as A2UI action messages.

```sh
npm i @pix-ui/a2ui @pix-ui/react
```

```jsx
import "@pix-ui/react/styles.css";
import { A2UISurface, rendererCapabilities } from "@pix-ui/a2ui";

// Advertise the PIX catalog to the agent in your transport's metadata.
const capabilities = rendererCapabilities();

<A2UISurface messages={messages} onAction={(message, metadata) => sendToAgent(message, metadata)} onError={reportToAgent} />;
```

- Catalog id: `https://pixui.digitalwithdeep.com/a2ui/catalogs/pix/v1/catalog.json`. The definition ships as `@pix-ui/a2ui/catalog.json` for the agent's prompt and for validation.
- Components (26): Text, Markdown, Button, Badge, Callout, Alert, MetricCard, DataTable, AIResponse, ToolCall, ApprovalCard and Conversation; the A2UI basic catalog's inputs TextField, CheckBox, ChoicePicker, Slider and DateTimeInput; Image, Tabs, Modal and List; and Column, Row, Grid, Card and Divider for layout.
- Inputs are two-way bound: what a person types, ticks, picks or drags is written to the data model path the value is bound to, and a Button's action context reads it from there. Failed `@checks` show their message on the field.
- Handles `createSurface`, `updateComponents`, `updateDataModel` and `deleteSurface`; resolves `@path` bindings, list templates, `@index` and the catalog functions (`formatString`, `formatNumber`, `formatCurrency`, `required`, `regex`, `length`, `numeric`, `email`, `and`, `or`, `not`).
- ESM with hand-written types. Peer dependencies: `react` 18 or later and `@pix-ui/react` 0.2 or later. No other runtime dependencies.

See the [A2UI guide](https://pixui.digitalwithdeep.com/docs/a2ui) for the property mapping, a minimal message stream and how to wire `onAction`.
