#!/usr/bin/env node
// Reads each block composition's page.tsx and emits a manifest with its source
// and Shiki-highlighted HTML (for the Code tab in the block viewer).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighter } from "shiki";

const here = dirname(fileURLToPath(import.meta.url));
const blocksDir = join(here, "..", "app", "(home)", "blocks");
const outDir = join(here, "..", "registry", "__generated__");

const BLOCKS = [
  { slug: "lumen", title: "Lumen", kind: "AI chat assistant", blurb: "A streaming assistant with a thinking trace, sources, a model selector and tools — the chat surface, end to end.", parts: ["AIResponse", "ThinkingTrace", "PromptInput", "Avatar", "SearchField", "Menu"] },
  { slug: "proofbench", title: "Proofbench", kind: "LLM eval console", blurb: "Experiments, scores and coverage for an eval suite — tables, charts, a coverage grid and a run diff.", parts: ["DataTable", "BarChart", "RateBars", "CoverageMatrix", "ExecutionTrace", "FingerprintDiff", "Tabs"] },
  { slug: "sentinel", title: "Sentinel", kind: "Agent run console", blurb: "Watch an agent run: the pipeline stages, a step-by-step execution trace, guardrail checks and a usage budget.", parts: ["StageFlow", "ExecutionTrace", "InvariantPanel", "AuditLog", "TaxonomyTree", "UsageMeter"] },
  { slug: "lens", title: "Lens", kind: "AI code review", blurb: "An AI review of a change: the diff, a summary with its reasoning, automated checks, and a claim set against the truth.", parts: ["CodeEditor", "FingerprintDiff", "InvariantPanel", "AIResponse", "Callout", "InlineCode"] },
];

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(outDir, { recursive: true });
  const highlighter = await createHighlighter({ themes: ["github-light", "github-dark"], langs: ["tsx"] });
  const out = BLOCKS.map((b) => {
    const source = readFileSync(join(blocksDir, b.slug, "page.tsx"), "utf8");
    const highlighted = highlighter.codeToHtml(source, {
      lang: "tsx",
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
    return { ...b, source, highlighted };
  });
  highlighter.dispose();
  writeFileSync(join(outDir, "blocks.json"), JSON.stringify(out));
  console.log(`@pix-ui/docs: blocks → ${out.length} compositions (highlighted)`);
}
