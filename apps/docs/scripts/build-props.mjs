#!/usr/bin/env node
// Parses each component's hand-written .d.ts into prop rows using the
// TypeScript compiler API (ts.createSourceFile, ts.forEachChild, …).
import ts from "typescript";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "..", "..", "packages", "react", "src", "components");
const outDir = join(here, "..", "registry", "__generated__");

// Each entry is a prop-table key. A bare string uses `<Name>/<Name>.d.ts` and
// `<Name>Props`; an object spells out the file/interface for the dirs that
// export more than one component (Avatar, CodeEditor, Layout).
const COMPONENTS = [
  // Curated set
  "Button", "Badge", "Callout", "Alert", "Tabs", "Select", "DataTable", "MetricCard", "AIResponse", "PromptInput",
  // AI, trace and evaluation
  "ThinkingTrace", "ExecutionTrace", "InferenceChain", "FingerprintDiff", "InvariantPanel", "CoverageMatrix", "StageFlow", "TaxonomyTree",
  // Data and charts
  "BarChart", "RateBars", "UsageMeter", "AuditLog",
  // Inputs
  "MultiSelect", "RadioGroup", "Switch", "SearchField", "SavedSearch", "FormActions", "ProviderConfig", "Menu",
  // Feedback, content and onboarding
  "EmptyState", "Skeleton", "Disclosure", "LicenseBanner", "GettingStarted", "NextSteps", "PlanCard", "Stepper", "Page",
  // Multi-export directories
  { name: "Avatar", file: "Avatar/Avatar.d.ts", iface: "AvatarProps" },
  { name: "AvatarGroup", file: "Avatar/Avatar.d.ts", iface: "AvatarGroupProps" },
  { name: "CodeEditor", file: "CodeEditor/CodeEditor.d.ts", iface: "CodeEditorProps" },
  { name: "InlineCode", file: "CodeEditor/CodeEditor.d.ts", iface: "InlineCodeProps" },
  { name: "Grid", file: "Layout/Grid.d.ts", iface: "GridProps" },
  { name: "Stack", file: "Layout/Stack.d.ts", iface: "StackProps" },
  { name: "Split", file: "Layout/Grid.d.ts", iface: "SplitProps" },
];

export function parsePropsFromDts(file, interfaceName) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  let rows = null;
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      rows = node.members.filter(ts.isPropertySignature).map((m) => {
        const name = m.name.getText(source);
        const required = !m.questionToken;
        const type = m.type ? m.type.getText(source) : "unknown";
        const jsdoc = ts.getJSDocCommentsAndTags(m)[0];
        const description = jsdoc && typeof jsdoc.comment === "string" ? jsdoc.comment.trim() : null;
        const defTag = ts.getAllJSDocTags(m, (t) => t.tagName?.getText(source) === "default")[0];
        const def = defTag && typeof defTag.comment === "string" ? defTag.comment.trim() : null;
        return { name, type, required, default: def, description };
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!rows) throw new Error(`interface ${interfaceName} not found in ${file}`);
  return rows;
}

function entry(e) {
  if (typeof e === "string") return { name: e, file: `${e}/${e}.d.ts`, iface: `${e}Props` };
  return e;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = {};
  for (const e of COMPONENTS) {
    const { name, file, iface } = entry(e);
    const dts = join(componentsDir, file);
    if (!existsSync(dts)) throw new Error(`missing .d.ts for ${name}: ${dts}`);
    out[name] = parsePropsFromDts(dts, iface);
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "props.json"), JSON.stringify(out, null, 2));
  console.log(`@pix-ui/docs: props → ${Object.keys(out).length} prop tables`);
}
