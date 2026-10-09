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
  { slug: "atlas", title: "Atlas", kind: "RAG knowledge assistant", blurb: "Ask a question over a knowledge base: a cited answer, the retrieved source chunks, the collection tree and the retrieval-to-answer chain.", parts: ["AIResponse", "InferenceChain", "TaxonomyTree", "Disclosure", "Callout", "SearchField", "Badge"] },
  { slug: "forge", title: "Forge", kind: "Prompt playground", blurb: "Iterate a prompt across two models side by side — params, streamed completions, a config diff and run metadata.", parts: ["PromptInput", "AIResponse", "Select", "Switch", "RadioGroup", "FingerprintDiff", "Tabs"] },
  { slug: "beacon", title: "Beacon", kind: "LLM observability", blurb: "Production monitoring for a deployed model: request volume, latency and cost metrics, per-route success, a request log and a drift alert.", parts: ["MetricCard", "BarChart", "RateBars", "AuditLog", "UsageMeter", "Alert", "Tabs"] },
  { slug: "guardrail", title: "Guardrail", kind: "Safety review queue", blurb: "Triage flagged generations: a review queue, the model output under policy, pass/fail invariant checks and a claim-against-truth verdict.", parts: ["DataTable", "InvariantPanel", "Callout", "Alert", "ExecutionTrace", "Badge", "Avatar"] },
  { slug: "relay", title: "Relay", kind: "Human-in-the-loop inbox", blurb: "An approval inbox for an agent's proposed actions — live wait timers, decision-latency metrics, the agent trace and guardrail checks, approve/reject with feedback, and an activity log. Fully interactive.", parts: ["MetricCard", "AIResponse", "ExecutionTrace", "InvariantPanel", "AuditLog", "Tabs", "Avatar", "Button"] },
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
