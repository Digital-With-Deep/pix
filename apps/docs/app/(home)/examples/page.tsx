import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Examples — PIX',
  description:
    'Full product UIs built entirely from PIX components: an AI chat assistant, an LLM eval console, an agent run console, and an AI code-review surface.',
};

const faint = 'var(--fg3, #78716c)';
const muted = 'var(--fg2, #52525b)';
const ink = 'var(--fg1, #1c1917)';
const line = 'var(--border, #e4e4e7)';

type Example = {
  slug: string;
  name: string;
  kind: string;
  blurb: string;
  parts: string[];
};

const examples: Example[] = [
  {
    slug: 'lumen',
    name: 'Lumen',
    kind: 'AI chat assistant',
    blurb: 'A streaming assistant with a thinking trace, sources, a model selector and tools — the chat surface, end to end.',
    parts: ['AIResponse', 'ThinkingTrace', 'PromptInput', 'Avatar', 'SearchField'],
  },
  {
    slug: 'proofbench',
    name: 'Proofbench',
    kind: 'LLM eval console',
    blurb: 'Experiments, scores and coverage for an eval suite — tables, charts, a coverage grid and a run diff.',
    parts: ['DataTable', 'BarChart', 'RateBars', 'CoverageMatrix', 'FingerprintDiff'],
  },
  {
    slug: 'sentinel',
    name: 'Sentinel',
    kind: 'Agent run console',
    blurb: 'Watch an agent run: the pipeline stages, a step-by-step execution trace, guardrail checks and a usage budget.',
    parts: ['StageFlow', 'ExecutionTrace', 'InvariantPanel', 'AuditLog', 'UsageMeter'],
  },
  {
    slug: 'lens',
    name: 'Lens',
    kind: 'AI code review',
    blurb: 'An AI review of a change: the diff, a summary with its reasoning, automated checks, and a claim set against the truth.',
    parts: ['CodeEditor', 'FingerprintDiff', 'InvariantPanel', 'AIResponse', 'Callout'],
  },
];

export default function ExamplesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6" style={{ color: ink, paddingTop: 64, paddingBottom: 80 }}>
      <div style={{ font: '600 12px var(--font-mono, ui-monospace, Menlo, monospace)', letterSpacing: '0.08em', textTransform: 'uppercase', color: faint }}>
        Examples
      </div>
      <h1 style={{ font: '700 clamp(30px, 4vw, 42px)/1.1 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.02em', margin: '12px 0 10px' }}>
        Real products, built from the primitives.
      </h1>
      <p style={{ maxWidth: 620, fontSize: 17, lineHeight: 1.6, color: muted, margin: '0 0 36px' }}>
        Each of these is a full UI assembled entirely from PIX components — no custom one-offs. Open
        one to see how the parts compose, then read the component pages for the details.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {examples.map((ex) => (
          <Link
            key={ex.slug}
            href={`/examples/${ex.slug}`}
            style={{ display: 'block', borderRadius: 10, border: `1px solid ${line}`, overflow: 'hidden', textDecoration: 'none', color: 'inherit', background: 'var(--surface, #fff)' }}
          >
            <div style={{ position: 'relative', aspectRatio: '16 / 10', borderBottom: `1px solid ${line}`, background: 'var(--surface-alt, #fafaf9)', overflow: 'hidden' }}>
              {/* Live scaled preview of the real example — always current, no stale screenshot. */}
              <iframe
                src={`/examples/${ex.slug}`}
                title={`${ex.name} preview`}
                aria-hidden="true"
                tabIndex={-1}
                loading="lazy"
                style={{ position: 'absolute', top: 0, left: 0, width: 1320, height: 900, border: 0, transform: 'scale(0.36)', transformOrigin: 'top left', pointerEvents: 'none' }}
              />
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <span style={{ font: '700 17px var(--font-sans, ui-sans-serif, system-ui)' }}>{ex.name}</span>
                <span style={{ font: '12px var(--font-mono, ui-monospace, Menlo, monospace)', color: faint }}>{ex.kind}</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: muted, margin: '0 0 12px' }}>{ex.blurb}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ex.parts.map((p) => (
                  <span key={p} style={{ font: '11px var(--font-mono, ui-monospace, Menlo, monospace)', color: muted, padding: '2px 7px', borderRadius: 4, border: `1px solid ${line}`, background: 'var(--surface-alt, #fafaf9)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
