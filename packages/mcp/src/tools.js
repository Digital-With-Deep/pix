// The three PIX tools: definitions (name, description, JSON Schema input) and
// handlers. Handlers are pure functions of the bundled data, so they can be
// tested without spawning the server.

export const TOOL_DEFINITIONS = [
  {
    name: "list_components",
    title: "List PIX components",
    description:
      "List every component in the PIX design system (@pix-ui/react) with a one-line description and its docs URL. Call this first to see what exists.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_component",
    title: "Get a PIX component",
    description:
      "Get one PIX component's full reference: the props table from its TypeScript contract, the docs page text and working example source. Use the exact names from list_components (for example Button, AIResponse, DataTable); kebab-case page names such as data-table also work.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name, for example \"Button\" or \"AIResponse\"." },
      },
      required: ["name"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "suggest_component",
    title: "Suggest PIX components",
    description:
      "Given a plain-language description of a piece of UI (for example \"show the model's reasoning steps while it streams an answer\"), return the PIX components that best match, ranked by keyword relevance.",
    inputSchema: {
      type: "object",
      properties: {
        description: { type: "string", description: "What the UI should do or show, in plain language." },
        limit: { type: "integer", minimum: 1, maximum: 10, default: 3, description: "How many matches to return." },
      },
      required: ["description"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

const text = (s) => ({ content: [{ type: "text", text: s }] });
const toolError = (s) => ({ content: [{ type: "text", text: s }], isError: true });

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function findComponent(data, name) {
  const key = norm(String(name));
  return data.components.find((c) => norm(c.name) === key) ?? data.components.find((c) => norm(c.page) === key) ?? null;
}

export function listComponents(data) {
  const lines = data.components.map((c) => `- ${c.name}: ${c.description} ${c.docsUrl}`);
  return text(
    `PIX has ${data.components.length} React components in ${data.package}. ` +
      `Import the stylesheet once with \`import "${data.stylesheet}";\`.\n\n${lines.join("\n")}`,
  );
}

const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

export function propsTable(props) {
  if (!props.length) return "No props.";
  const rows = props.map(
    (p) => `| \`${cell(p.name)}\`${p.required ? "" : "?"} | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : ""} | ${cell(p.description)} |`,
  );
  return ["| Prop | Type | Default | Description |", "| --- | --- | --- | --- |", ...rows].join("\n");
}

export function getComponent(data, args) {
  const name = args?.name;
  if (typeof name !== "string" || !name.trim()) return toolError("`name` is required, for example \"Button\".");
  const c = findComponent(data, name);
  if (!c) {
    const close = suggest(data, name, 3).map((m) => m.component.name);
    return toolError(
      `No PIX component named "${name}".${close.length ? ` Did you mean ${close.join(", ")}?` : ""} Call list_components for the full list.`,
    );
  }
  const examples = c.examples.map(
    (e) =>
      `### ${e.title ? `${e.title} (\`${e.name}\`)` : `\`${e.name}\``}\n\n` +
      `Install into a shadcn project: \`npx shadcn add ${e.registryUrl}\`\n\n\`\`\`tsx\n${e.source.trimEnd()}\n\`\`\``,
  );
  const parts = [
    `# ${c.name}`,
    c.description,
    `Docs: ${c.docsUrl}`,
    `\`\`\`tsx\nimport "${data.stylesheet}"; // once, at your app root\n${c.import}\n\`\`\``,
    `## Props\n\n${propsTable(c.props)}\n\n\`?\` marks an optional prop. Every component also accepts \`loading\` to render a skeleton in its own footprint.`,
    `## Docs page (${c.pageTitle})\n\n${c.docs}`,
    examples.length ? `## Examples\n\n${examples.join("\n\n")}` : "",
  ];
  return text(parts.filter(Boolean).join("\n\n"));
}

const STOPWORDS = new Set(
  "a an and are as at be but by can do for from has have i in into is it its me my of on or our show shows so that the their them then there these this to use used user users want we when where which while with without you your ui component components display page screen".split(
    " ",
  ),
);

// Light stemming so "citations" matches "citation" and "streaming" matches "stream".
export function stem(w) {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && w.endsWith("es") && /(ch|sh|x|ss)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function tokenize(s) {
  return String(s)
    // split camelCase names such as AIResponse or DataTable into words
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

// Everyday words for UI that the docs do not use verbatim. Each query word
// also searches for its related words, at half weight.
const RELATED = {
  dropdown: ["select", "menu"], picker: ["select"], combobox: ["select", "search"],
  toggle: ["switch"], checkbox: ["switch", "multi"],
  several: ["multi"], multiple: ["multi"], many: ["multi"],
  kpi: ["metric"], stat: ["metric"], number: ["metric"],
  picture: ["avatar"], photo: ["avatar"], profile: ["avatar"], person: ["avatar"], people: ["avatar"],
  chat: ["prompt", "response"], message: ["prompt", "response"], composer: ["prompt"], textarea: ["prompt"],
  nav: ["sidebar", "menu"], navigation: ["sidebar", "menu"], rail: ["sidebar"],
  spinner: ["skeleton", "loading"], placeholder: ["skeleton"], shimmer: ["skeleton"],
  history: ["audit", "log"], activity: ["audit", "log"],
  diff: ["fingerprint"], compare: ["diff", "fingerprint"],
  hierarchy: ["taxonomy", "tree"], wizard: ["stepper"], onboarding: ["getting", "started"],
  graph: ["chart"], banner: ["alert", "callout"], toast: ["alert"], notification: ["alert"],
  grid: ["layout"], column: ["layout", "table"], spreadsheet: ["table"],
  reasoning: ["thinking", "trace"], thought: ["thinking"], citation: ["source"],
  pricing: ["plan"], subscription: ["plan", "license"], quota: ["usage"],
};

const indexCache = new WeakMap();

function buildIndex(data) {
  let idx = indexCache.get(data);
  if (idx) return idx;
  const count = (words) => words.reduce((m, w) => m.set(w, (m.get(w) ?? 0) + 1), new Map());
  idx = data.components.map((c) => ({
    component: c,
    name: new Set(tokenize(`${c.name} ${c.page.replace(/-/g, " ")}`)),
    description: new Set(tokenize(`${c.description} ${c.pageTitle}`)),
    props: new Set(c.props.flatMap((p) => tokenize(`${p.name} ${p.description ?? ""}`))),
    examples: new Set(c.examples.flatMap((e) => tokenize(`${e.name} ${e.title ?? ""}`))),
    docs: count(tokenize(c.docs)),
  }));
  // How many components mention each word in their docs: rare words weigh more.
  const df = new Map();
  for (const e of idx) for (const w of e.docs.keys()) df.set(w, (df.get(w) ?? 0) + 1);
  idx.df = df;
  indexCache.set(data, idx);
  return idx;
}

/** Ranks components against a free-text description. Returns [{ component, score, matched }]. */
export function suggest(data, description, limit = 3) {
  const base = [...new Set(tokenize(description))];
  if (!base.length) return [];
  // [word, weight]: the query's own words at full weight, related words at half.
  const weights = new Map(base.map((t) => [t, 1]));
  for (const t of base) for (const r of RELATED[t] ?? []) if (!weights.has(stem(r))) weights.set(stem(r), 0.5);
  const terms = [...weights.keys()];
  const idx = buildIndex(data);
  const n = idx.length;
  const scored = idx.map((e) => {
    let score = 0;
    const matched = new Set();
    for (const t of terms) {
      let s = 0;
      if (e.name.has(t)) s += 8;
      if (e.description.has(t)) s += 4;
      if (e.examples.has(t)) s += 2;
      if (e.props.has(t)) s += 1.5;
      const tf = e.docs.get(t) ?? 0;
      if (tf) s += Math.min(3, 1 + Math.log(tf)) * Math.log(1 + n / (idx.df.get(t) ?? 1));
      if (s) matched.add(t);
      score += s * weights.get(t);
    }
    // Reward covering more of the query, not just repeating one word.
    const covered = base.filter((t) => matched.has(t) || (RELATED[t] ?? []).some((r) => matched.has(stem(r)))).length;
    score *= 1 + covered / base.length;
    return { component: e.component, score: Math.round(score * 100) / 100, matched: [...matched] };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))
    .slice(0, limit);
}

export function suggestComponent(data, args) {
  const description = args?.description;
  if (typeof description !== "string" || !description.trim()) {
    return toolError("`description` is required: describe the UI in plain language.");
  }
  let limit = args.limit ?? 3;
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) return toolError("`limit` must be an integer from 1 to 10.");
  const matches = suggest(data, description, limit);
  if (!matches.length) {
    return text(
      `No PIX component matched "${description}". Available components: ${data.components.map((c) => c.name).join(", ")}.`,
    );
  }
  const lines = matches.map(
    (m, i) =>
      `${i + 1}. ${m.component.name} (score ${m.score}): ${m.component.description}\n` +
      `   Matched: ${m.matched.join(", ")}. Docs: ${m.component.docsUrl}`,
  );
  return text(`Best matches for "${description}":\n\n${lines.join("\n")}\n\nCall get_component with a name for props and examples.`);
}

export function callTool(data, name, args) {
  switch (name) {
    case "list_components":
      return listComponents(data);
    case "get_component":
      return getComponent(data, args ?? {});
    case "suggest_component":
      return suggestComponent(data, args ?? {});
    default:
      return null;
  }
}
