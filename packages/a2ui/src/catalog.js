// The PIX catalog for A2UI (Agent-to-User Interface) protocol version 1.0.
// This object is the catalog definition an agent puts in its prompt and validates against. The build writes it
// to dist/catalog.json. It follows specification/v1_0/json/catalog_definition.json and the catalog schema rules in
// the v1.0 protocol document: components declared flat under `components`, external $ref only into common_types.json,
// `anyComponent` and `anyFunction` under `$defs`, and UAX #31 identifiers throughout.

export const A2UI_VERSION = "1.0";
export const PIX_CATALOG_ID = "https://pixui.digitalwithdeep.com/a2ui/catalogs/pix/v1/catalog.json";

const common = (name) => ({ $ref: `common_types.json#/$defs/${name}` });
const str = (description) => ({ ...common("DynamicString"), description });
const num = (description) => ({ ...common("DynamicNumber"), description });
const bool = (description) => ({ ...common("DynamicBoolean"), description });
const value = (description) => ({ ...common("DynamicValue"), description });
const action = (description) => ({ ...common("Action"), description });
const child = (description) => ({ ...common("ComponentId"), description });
const children = (description) => ({ ...common("ChildList"), description });
const literal = (values, description, dflt) => ({ type: "string", enum: values, description, ...(dflt ? { default: dflt } : {}) });
const flag = (description, dflt) => ({ type: "boolean", description, ...(dflt !== undefined ? { default: dflt } : {}) });
const dynamicEnum = (values, description) => ({
  description,
  oneOf: [{ type: "string", enum: values }, common("DataBinding"), common("FunctionCall")],
});

function component(name, description, properties, required = []) {
  return {
    type: "object",
    description,
    properties: { component: { const: name }, ...properties },
    required: ["component", ...required],
  };
}

const components = {
  Column: component("Column", "Arranges its children vertically. Renders the PIX Stack component.", {
    children: children("The children, as an array of component ids or a template { componentId, path } that repeats one component for every item of a data model list."),
    gap: { type: "number", description: "Space between children in pixels.", default: 12 },
    align: literal(["start", "center", "end", "stretch"], "Cross-axis alignment.", "stretch"),
    justify: literal(["start", "center", "end", "spaceBetween", "spaceAround"], "Main-axis arrangement.", "start"),
  }, ["children"]),
  Row: component("Row", "Arranges its children horizontally and wraps them on narrow screens. Renders the PIX Stack component.", {
    children: children("The children, as an array of component ids or a template { componentId, path }."),
    gap: { type: "number", description: "Space between children in pixels.", default: 12 },
    align: literal(["start", "center", "end", "stretch", "baseline"], "Cross-axis alignment.", "center"),
    justify: literal(["start", "center", "end", "spaceBetween", "spaceAround"], "Main-axis arrangement.", "start"),
    wrap: flag("Let children wrap onto new lines.", true),
  }, ["children"]),
  Grid: component("Grid", "A responsive grid. Columns reflow below the minimum column width. Renders the PIX Grid component.", {
    children: children("The grid cells, as an array of component ids or a template { componentId, path }."),
    min: { type: "number", description: "Minimum column width in pixels before columns reflow. Ignored when cols is set.", default: 240 },
    cols: { type: "integer", minimum: 1, description: "Fixed column count, for layouts that must not reflow." },
    gap: { type: "number", description: "Space between cells in pixels.", default: 12 },
  }, ["children"]),
  Card: component("Card", "A bordered surface around one child. To show several elements, pass the id of a Column or Row.", {
    child: child("The id of the single child component."),
  }, ["child"]),
  Divider: component("Divider", "A thin horizontal rule between sections.", {}),
  Text: component("Text", "A short piece of plain text. Use Markdown for formatted, multi-paragraph text.", {
    text: str("The text to show."),
    variant: literal(["body", "caption", "heading", "label", "code"], "body is regular copy, caption is small secondary text, heading is a section title, label is a small uppercase field label, code is monospace for identifiers, IDs and amounts.", "body"),
  }, ["text"]),
  Markdown: component("Markdown", "Formatted text: headings, paragraphs, emphasis, lists, tables, code and links. Raw HTML is never rendered.", {
    text: str("Markdown source."),
    streaming: bool("Set while the text is still arriving, so half-written syntax is held back."),
  }, ["text"]),
  Badge: component("Badge", "A small status pill.", {
    text: str("The label."),
    tone: literal(["neutral", "accent", "success", "warning", "danger", "info", "outline"], "Semantic tone. Keep neutral unless the badge reports real state.", "neutral"),
    dot: flag("Show a leading status dot.", false),
    size: literal(["sm", "md"], "sm is a status pill, md an entity chip.", "sm"),
  }, ["text"]),
  Callout: component("Callout", "An inline note that teaches, adds context, or flags something that needs attention.", {
    title: str("Optional headline."),
    body: str("The note."),
    tone: literal(["info", "note", "warn", "truth", "claim"], "info teaches, note is neutral context, warn needs attention, truth confirms a verified result, claim marks an unverified claim.", "info"),
    compact: flag("Tighter padding.", false),
  }),
  Alert: component("Alert", "A prominent finding with optional actions. Write the title as a finding, not a label.", {
    title: str("Headline, written as a finding."),
    body: str("Body copy."),
    tone: literal(["neutral", "inverse", "fault", "claim", "truth"], "neutral is plain, inverse is the dark bar for the main takeaway, fault is an authored fault or scope limit, claim is a failed check, truth is an objective met.", "neutral"),
    citation: str("Monospace reference line under the body."),
    actions: children("Optional buttons, as an array of Button component ids."),
  }),
  MetricCard: component("MetricCard", "One headline number with a label and an optional change.", {
    label: str("Short label."),
    value: value("The number, preformatted as a string (for example \"$42,318\") or a number."),
    delta: str("Secondary line under the value, for example \"+4.1% vs last week\"."),
    deltaType: dynamicEnum(["up", "down", "neutral"], "Colors the delta and adds an arrow."),
    hint: str("Small qualifier in the header row, for example \"Today\"."),
    valueTone: literal(["default", "danger", "warning", "success"], "Colors the value. Reserve for real state.", "default"),
    progress: num("Adds a completion rule under the value, from 0 to 1."),
  }, ["label", "value"]),
  DataTable: component("DataTable", "A sortable, filterable table of rows. Bind rows to a data model list.", {
    columns: { type: "array", description: "Column definitions.", items: { $ref: "#/$defs/TableColumn" } },
    rows: value("The rows: an array of objects keyed by column key. Usually a binding such as { \"@path\": \"/orders\" }."),
    caption: str("Title shown in the toolbar."),
    searchable: flag("Show the free-text filter.", true),
    emptyMessage: str("Shown when no rows match."),
    rowAction: action("Dispatched when a row is clicked. The renderer adds the clicked row to the event context as \"row\"."),
  }, ["columns", "rows"]),
  AIResponse: component("AIResponse", "An answer from an agent: generating, streaming, done or failed, with optional reasoning, sources and feedback.", {
    text: str("The answer, rendered as Markdown. Update it with updateDataModel while it streams."),
    status: { $ref: "#/$defs/DynamicResponseStatus" },
    model: str("Model or agent name shown in the header, in monospace."),
    duration: str("Elapsed time, for example \"4.2s\"."),
    tokens: str("Token readout, for example \"1,284 tokens\"."),
    stage: str("Header line while generating."),
    error: str("Failure message when status is error."),
    thinking: str("Reasoning trace. One step per line."),
    citations: value("Sources: an array of strings or { label, note, href } objects."),
    stopAction: action("Adds a Stop button while generating or streaming."),
    retryAction: action("Adds Regenerate when done and Retry on error."),
    feedbackAction: action("Adds thumbs up and down. The renderer adds \"vote\" (\"up\", \"down\" or null) to the event context."),
  }),
  ToolCall: component("ToolCall", "One tool call an agent made: the tool, its status, its input and what came back.", {
    name: str("Tool name, shown in monospace, for example \"orders.lookup\"."),
    status: { $ref: "#/$defs/DynamicToolStatus" },
    description: str("One-line summary next to the name."),
    input: value("Arguments the agent sent. Objects are pretty-printed."),
    output: value("What the tool returned. Objects are pretty-printed."),
    error: str("Failure message when status is failed."),
    duration: str("Elapsed time, for example \"420ms\"."),
    child: child("Optional component shown inside the expanded body, usually an ApprovalCard when status is approval."),
    retryAction: action("Adds a Retry button when the call failed."),
  }, ["name"]),
  ApprovalCard: component("ApprovalCard", "A proposed action waiting on a person: what changes, the risk, whether it can be undone, and Approve, Edit or Reject. Use it before any action that spends money, contacts someone or cannot be undone.", {
    title: str("Short headline, for example \"Issue a refund\"."),
    summary: str("The proposed action in plain words."),
    agent: str("The agent that proposed it, shown in monospace."),
    target: str("What the action touches, for example an order id, shown in monospace."),
    reason: str("The agent's reason."),
    changes: value("Before and after values: an array of { field, key, before, after, editable } objects."),
    risk: dynamicEnum(["low", "medium", "high", "critical"], "Risk level. Sets the left rule and the risk pill."),
    reversible: bool("Whether the action can be undone. Omit to hide."),
    evidence: value("Evidence chips: an array of strings or { label, href } objects."),
    expiresAt: str("ISO 8601 time after which the request lapses. Shows a countdown."),
    status: { $ref: "#/$defs/DynamicApprovalStatus" },
    decidedBy: str("Who decided, for a resolved card."),
    decidedAt: str("When they decided, for a resolved card."),
    rejectReason: str("The reason given on a rejected card."),
    requireRejectReason: flag("Make the rejection reason required.", false),
    approveLabel: str("Label of the approve button. Defaults to \"Approve\"."),
    approveAction: action("Dispatched when the reviewer approves the proposal as it stands."),
    rejectAction: action("Dispatched when the reviewer confirms a rejection. The renderer adds \"reason\" (a string, or null) to the event context."),
    editAction: action("Enables Edit. Dispatched when the reviewer approves with edits. The renderer adds \"edits\" (an object of key to new value) to the event context."),
  }),
  Conversation: component("Conversation", "A chat thread that keeps the newest turn in view.", {
    messages: value("The turns, oldest first: an array of { id, role, content, author, time, streaming } objects, where role is user, assistant or system and content is a string (Markdown for assistant turns)."),
    children: children("Optional components shown after the last turn, for example a ToolCall or a pending ApprovalCard."),
    label: str("Accessible name of the thread. Defaults to \"Conversation\"."),
    height: { type: "number", description: "Fixed height in pixels. The thread scrolls inside it." },
  }),
  Button: {
    type: "object",
    description: "A button that dispatches an action. Give it a label, or a child component id for richer content.",
    allOf: [
      common("Checkable"),
      {
        type: "object",
        properties: {
          component: { const: "Button" },
          label: str("The button label."),
          child: child("Optional child component used as the label instead of label."),
          variant: literal(["primary", "filled", "secondary", "outline", "destructive", "ghost", "default", "borderless"], "primary is the main call to action, filled is an emerald action, destructive deletes or rejects, ghost is a quiet text button. default and borderless are accepted for basic catalog parity and render as secondary and ghost.", "primary"),
          size: literal(["sm", "md", "lg"], "Size.", "md"),
          disabled: bool("Disable the button."),
          action: common("Action"),
        },
        required: ["component", "action"],
      },
    ],
  },
};

const fn = (name, description, returnType, args, required) => ({
  type: "object",
  description,
  returnType,
  properties: {
    "@call": { const: name },
    args: { type: "object", properties: args, required, unevaluatedProperties: false },
  },
  required: ["@call", "args"],
});

const functions = {
  formatString: fn("formatString", "Interpolates ${expression} placeholders: data model paths (${/order/id} or ${relative/path}) and calls to the other functions in this catalog with named arguments. Escape a literal ${ as \\${.", "string",
    { value: common("DynamicString") }, ["value"]),
  formatNumber: fn("formatNumber", "Formats a number with grouping separators and a fixed number of decimals.", "string",
    { value: common("DynamicNumber"), decimals: common("DynamicNumber"), grouping: common("DynamicBoolean") }, ["value"]),
  formatCurrency: fn("formatCurrency", "Formats a number as an amount in an ISO 4217 currency, for example USD.", "string",
    { value: common("DynamicNumber"), currency: common("DynamicString"), decimals: common("DynamicNumber") }, ["value", "currency"]),
  required: fn("required", "Checks that a value is not null, undefined, an empty string or an empty array.", "validationResult",
    { value: common("DynamicValue") }, ["value"]),
  and: fn("and", "True when every value is true. Validation results count as their valid flag.", "boolean",
    { values: { type: "array", items: common("DynamicBoolean"), minItems: 2 } }, ["values"]),
  or: fn("or", "True when at least one value is true.", "boolean",
    { values: { type: "array", items: common("DynamicBoolean"), minItems: 2 } }, ["values"]),
  not: fn("not", "Negates a boolean or a validation result.", "boolean",
    { value: common("DynamicBoolean") }, ["value"]),
};

const instructions = `PIX (Primitives for Intelligent eXperiences) is a design system for agent interfaces. Build every surface from these components only.

## Guidelines

1. Lay out with Column and Row. Use Grid for a set of MetricCard components.
2. Use Text for short plain strings and Markdown for formatted or multi-paragraph text.
3. Before any action that spends money, contacts someone or cannot be undone, show an ApprovalCard and wait for its approveAction, rejectAction or editAction event. Never treat the card as approved until that event arrives.
4. Show each tool call as a ToolCall. Nest the ApprovalCard as the ToolCall child when the call waits on a person.
5. Bind values that change (streamed answer text, statuses, table rows) to the data model with {"@path": "/..."} and update them with updateDataModel instead of resending components.
6. To combine text with data, use formatString, for example {"@call": "formatString", "args": {"value": "Order \${/order/id}"}}.
7. Write in sentence case, without exclamation marks or emoji.`;

export const pixCatalog = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: PIX_CATALOG_ID,
  protocolVersion: A2UI_VERSION,
  title: "PIX catalog",
  description: "PIX components for agent interfaces: answers, tool calls, approvals, conversations, metrics, tables and layout.",
  catalogId: PIX_CATALOG_ID,
  instructions,
  components,
  functions,
  $defs: {
    anyComponent: {
      oneOf: Object.keys(components).map((name) => ({ $ref: `#/components/${name}` })),
      discriminator: { propertyName: "component" },
    },
    anyFunction: {
      oneOf: Object.keys(functions).map((name) => ({ $ref: `#/functions/${name}` })),
    },
    TableColumn: {
      type: "object",
      description: "One DataTable column.",
      properties: {
        key: { type: "string", description: "Row property this column reads." },
        label: { type: "string", description: "Column heading." },
        align: { type: "string", enum: ["left", "right", "center"] },
        sortable: { type: "boolean" },
        numeric: { type: "boolean", description: "Sort numerically and use tabular figures." },
        strong: { type: "boolean", description: "Emphasize the cell, for identity columns." },
      },
      required: ["key", "label"],
      additionalProperties: false,
    },
    DynamicResponseStatus: dynamicEnum(["generating", "streaming", "done", "error"], "generating shows a skeleton before the first token, streaming shows text as it arrives, done the answer, error the failure."),
    DynamicToolStatus: dynamicEnum(["queued", "running", "done", "failed", "approval"], "approval means the call is held until a person approves it."),
    DynamicApprovalStatus: dynamicEnum(["pending", "approved", "rejected", "expired"], "pending shows the actions; the others show the outcome. Bind it to the data model so the card can record the decision."),
  },
};
