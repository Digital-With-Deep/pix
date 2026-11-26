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
  { slug: "lumen", title: "Lumen", kind: "AI chat assistant", blurb: "A chat over an uploaded file: each turn runs its tool calls, then streams a Markdown answer token by token, with numbered citations tied to a source panel that checks every source once the answer lands. Ask follow-ups, stop or regenerate.", parts: ["Conversation", "AIResponse", "Markdown", "ToolCall", "InlineCitation", "SourcePanel", "ConfidenceBadge", "PromptInput"] },
  { slug: "proofbench", title: "Proofbench", kind: "LLM eval console", blurb: "Experiments, scores and coverage for an eval suite — tables, charts, a coverage grid and a run diff.", parts: ["DataTable", "BarChart", "RateBars", "CoverageMatrix", "ExecutionTrace", "FingerprintDiff", "Tabs"] },
  { slug: "sentinel", title: "Sentinel", kind: "Agent run console", blurb: "Watch an agent run: the pipeline stages, a step-by-step execution trace, guardrail checks, a usage budget, the actions it took with undo, and how much it may do on its own.", parts: ["StageFlow", "ExecutionTrace", "InvariantPanel", "ActionHistory", "AutonomySetting", "AuditLog", "TaxonomyTree", "UsageMeter"] },
  { slug: "lens", title: "Lens", kind: "AI code review", blurb: "An AI review of a change: the diff, a summary with its reasoning, automated checks, and a claim set against the truth.", parts: ["CodeEditor", "FingerprintDiff", "InvariantPanel", "AIResponse", "Callout", "InlineCode"] },
  { slug: "atlas", title: "Atlas", kind: "RAG knowledge assistant", blurb: "Ask a question over a knowledge base: a cited answer, the retrieved source chunks, the collection tree and the retrieval-to-answer chain.", parts: ["AIResponse", "InferenceChain", "TaxonomyTree", "Disclosure", "Callout", "SearchField", "Badge"] },
  { slug: "forge", title: "Forge", kind: "Prompt playground", blurb: "Iterate a prompt across two models side by side — params, streamed completions, a config diff and run metadata.", parts: ["PromptInput", "AIResponse", "Select", "Switch", "RadioGroup", "FingerprintDiff", "Tabs"] },
  { slug: "beacon", title: "Beacon", kind: "LLM observability", blurb: "Production monitoring for a deployed model: request volume, latency and cost metrics, per-route success, a request log and a drift alert.", parts: ["MetricCard", "BarChart", "RateBars", "AuditLog", "UsageMeter", "Alert", "Tabs"] },
  { slug: "guardrail", title: "Guardrail", kind: "Safety review queue", blurb: "Triage flagged generations: a review queue, the model output under policy, pass/fail invariant checks and a claim-against-truth verdict.", parts: ["DataTable", "InvariantPanel", "Callout", "Alert", "ExecutionTrace", "Badge", "Avatar"] },
  { slug: "relay", title: "Relay", kind: "Human-in-the-loop inbox", blurb: "An approval inbox for an agent's held tool calls: approve, edit or reject each one, watch the approved call run, undo inside its window, and set which kinds of action the agent may take on its own. Live wait timers, decision metrics and an activity log. Fully interactive.", parts: ["ApprovalCard", "ToolCall", "ActionHistory", "AutonomySetting", "ConfidenceBadge", "PlanView", "AuditLog", "ExecutionTrace", "InvariantPanel", "MetricCard"] },
  { slug: "helm", title: "Helm", kind: "Executive command center", blurb: "A system of action, not just a system of intelligence: a COO's working day at a fictional company where agents do the work in the background and bring forward only the decisions a person must make. Clear the decision queue, watch each approval start its tool call, undo what the agents did on their own, set each agent's autonomy and ask the chief of staff agent.", parts: ["ApprovalCard", "ToolCall", "PlanView", "StageFlow", "ActionHistory", "AutonomySetting", "MetricCard", "Conversation", "PromptInput", "ToastProvider"] },
  { slug: "copilot", title: "Copilot", kind: "Agent chat app", blurb: "An agent works a support task in the open: tool calls inline in the thread, an approval card before the one risky step, a live plan beside it, and the answer streaming in as Markdown once you decide.", parts: ["Conversation", "Markdown", "ToolCall", "ApprovalCard", "PlanView", "PromptInput", "Card", "Badge"] },
  { slug: "approvals", title: "Approvals", kind: "Agent approvals desk", blurb: "A queue of actions several agents want to take. Approve, edit or reject each one, bulk-approve the low-risk ones behind a confirmation, undo inside the window, and set how much one task may run on its own.", parts: ["ApprovalCard", "ActionHistory", "AutonomySetting", "Dialog", "ToastProvider", "MetricCard", "Checkbox", "Card"] },
  { slug: "research", title: "Research", kind: "Cited research assistant", blurb: "An answer broken into claims, each with numbered citations and its own confidence, beside a source panel that says which sources back it and which contradict it.", parts: ["InlineCitation", "SourcePanel", "ConfidenceBadge", "Tooltip", "Markdown", "Checkbox", "PromptInput"] },
  { slug: "workspace", title: "Workspace", kind: "Agent settings", blurb: "The page where a team sets up an agent: profile and instructions, permissions, per-task autonomy, notifications, connected tools and a pause switch, with validation and toasts on save.", parts: ["Card", "TextField", "Textarea", "Checkbox", "AutonomySetting", "Popover", "Dialog", "Tooltip", "ToastProvider"] },
  { slug: "lynx", title: "Lynx", kind: "Supply chain command center", blurb: "An app shell built around the Sidebar primitive — icon nav with Supply and Sales expanding into smoothly animated submenus, an AI ask bar, a quick summary, critical alerts, and orders/fulfillment charts.", parts: ["Sidebar", "SearchField", "Avatar", "Badge", "BarChart", "Button"] },
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
