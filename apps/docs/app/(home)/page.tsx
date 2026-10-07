'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AIResponse,
  Button,
  Callout,
  MetricCard,
  DataTable,
  PromptInput,
  Badge,
  ThinkingTrace,
  BarChart,
  RateBars,
  InferenceChain,
  CoverageMatrix,
  UsageMeter,
} from '@pix-ui/react';

// The home page dogfoods PIX: every surface below is a real @pix-ui/react
// component, styled only with PIX tokens, so it flips with the theme.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ font: '600 12px var(--font-mono, ui-monospace, Menlo, monospace)', letterSpacing: '0.08em', textTransform: 'uppercase', color: faint }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ font: '600 11px var(--font-mono, ui-monospace, Menlo, monospace)', letterSpacing: '0.1em', textTransform: 'uppercase', color: faint, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ font: '600 11px var(--font-mono, ui-monospace, Menlo, monospace)', letterSpacing: '0.06em', textTransform: 'uppercase', color: faint, marginBottom: 10 }}>
      {children}
    </div>
  );
}

const doneThinking = [
  { kind: 'read' as const, system: 'SAP S/4HANA', label: 'BSEG line items', detail: 'invoice 4500112 · vendor 100238', duration: '1.2s', state: 'done' as const },
  { kind: 'tool' as const, label: 'get_treaty_certificate', detail: 'vendor: 100238', duration: '210ms', state: 'done' as const },
  { kind: 'thought' as const, label: 'Diffed the call sequences', lines: ['003: get_invoice → lookup_vendor → read_tolerance → calculate → answer', '001: get_invoice → get_treaty_certificate → calculate → answer'], state: 'done' as const },
  { kind: 'thought' as const, label: 'cert_valid_to 2026-11-30; invoice date 2027-02-11 — lapsed 73 days prior', state: 'done' as const },
];

// Streams generating → done on load so the hero shows the skeleton, the stage
// checklist and the thinking trace. Reduced-motion jumps straight to the answer.
function AnimatedResponse() {
  const [status, setStatus] = React.useState<'generating' | 'done'>('generating');
  React.useEffect(() => {
    // Reduced motion flips to the answer on the next tick (delay 0); otherwise
    // the skeleton + stage checklist show first. setState stays inside the timer
    // callback (never synchronous in the effect body).
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setStatus('done'), reduce ? 0 : 2600);
    return () => clearTimeout(t);
  }, []);

  if (status === 'generating') {
    return (
      <AIResponse
        status="generating"
        model="gpt-5.2"
        stage="Diffing run traces…"
        stages={[
          { label: 'Loaded run #0042 · 5 calls', done: true },
          { label: 'Loaded run #0038 · 4 calls', done: true },
          { label: 'Comparing call sequences against O-WHT-01' },
          { label: 'Classifying the divergence' },
        ]}
        onStop={() => {}}
      />
    );
  }
  return (
    <AIResponse
      model="gpt-5.2"
      duration="4.2s"
      tokens="2,140 tokens"
      defaultThinkingOpen
      text={
        'wht-treaty-003 cleared because the agent trusted the vendor master and never verified the certificate behind it. The arithmetic was correct — $4,820.00 to the cent.\n\nThe passing run called get_treaty_certificate as its second step and escalated. The difference is one tool call, not one number.'
      }
      thinking={doneThinking}
      citations={[
        { label: 'run #0042', note: 'execution trace' },
        { label: 'O-WHT-01', note: 'control objective' },
      ]}
      onCopy={() => {}}
      onFeedback={() => {}}
    />
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{ color: ink }}>
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-6" style={{ paddingTop: 72, paddingBottom: 56 }}>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <Eyebrow>Primitives for Intelligent eXperiences</Eyebrow>
            <h1 style={{ font: '700 clamp(34px, 5vw, 52px)/1.05 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.02em', margin: 0 }}>
              An AI answer must
              <br />
              be checkable.
            </h1>
            <p style={{ maxWidth: 460, fontSize: 17, lineHeight: 1.6, color: muted, margin: 0 }}>
              PIX gives AI interfaces their own primitives — a response that streams, the reasoning
              behind it, the sources it rests on, and the difference between what a model{' '}
              <em>claimed</em> and what is <em>true</em> — next to the buttons, tables and forms
              every product needs.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="filled" size="lg" onClick={() => router.push('/docs')}>
                Get started
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/examples')}>
                See examples
              </Button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', padding: '8px 12px', borderRadius: 6, border: `1px solid ${line}`, background: 'var(--surface-alt, #fafaf9)', font: '13px var(--font-mono, ui-monospace, Menlo, monospace)', color: ink }}>
              <span style={{ color: faint }}>$</span> npm i @pix-ui/react
            </div>
          </div>

          {/* Hero thesis: the real AIResponse primitive, streaming on load */}
          <div>
            <AnimatedResponse />
          </div>
        </div>
      </section>

      {/* Signature: claim ≠ truth */}
      <section className="mx-auto w-full max-w-5xl px-6" style={{ paddingTop: 40, paddingBottom: 40, borderTop: `1px solid ${line}` }}>
        <SectionLabel>The rule that governs everything</SectionLabel>
        <h2 style={{ font: '700 26px/1.2 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.01em', margin: '0 0 8px' }}>
          A claim and the truth never share a colour.
        </h2>
        <p style={{ maxWidth: 560, color: muted, lineHeight: 1.6, margin: '0 0 24px' }}>
          People act on what these screens say. So what a model asserted and what was verified are
          kept visibly apart — red for the claim, emerald for the ground truth, amber for an
          authored fault.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Callout tone="claim" title="What the model said">
            get_treaty_certificate was available and never called. The 0.10 treaty rate was applied
            anyway.
          </Callout>
          <Callout tone="truth" title="What's true">
            The rate came from tax_treaty.tax_treaty_rate, not a valid certificate. The certificate
            had lapsed 73 days before the invoice.
          </Callout>
        </div>
      </section>

      {/* Showcase */}
      <section className="mx-auto w-full max-w-5xl px-6" style={{ paddingTop: 40, paddingBottom: 40, borderTop: `1px solid ${line}` }}>
        <SectionLabel>Built from the same parts you ship</SectionLabel>
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard label="Runs" value="1,284" delta="+42 today" deltaType="up" />
          <MetricCard label="Pass rate" value="92.4%" delta="1.8 pts" deltaType="down" valueTone="warning" />
          <MetricCard label="Open findings" value="7" hint="Today" />
        </div>

        <div style={{ marginTop: 16 }}>
          <DataTable
            caption="Recent runs"
            searchable={false}
            rowCount={false}
            columns={[
              { key: 'run', label: 'Run', strong: true },
              { key: 'control', label: 'Control' },
              {
                key: 'verdict',
                label: 'Verdict',
                render: (r: { verdict: string }) =>
                  r.verdict === 'Pass' ? <Badge tone="success" dot>Pass</Badge> : <Badge tone="danger" dot>Fail</Badge>,
              },
              { key: 'amount', label: 'Withholding', numeric: true, align: 'right' },
            ]}
            rows={[
              { run: 'wht-treaty-001', control: 'O-WHT-01', verdict: 'Pass', amount: '$4,820.00' },
              { run: 'wht-treaty-003', control: 'O-WHT-01', verdict: 'Fail', amount: '$4,820.00' },
              { run: 'vat-reverse-014', control: 'O-VAT-02', verdict: 'Pass', amount: '$1,190.40' },
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
          <PromptInput placeholder="Ask a follow-up…" showPlusMenu={false} showModelSelector={false} tools={['Web search', 'Replay run']} activeTools={['Replay run']} rows={2} />
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="success" dot>Passed</Badge>
              <Badge tone="warning" dot>Needs review</Badge>
              <Badge tone="danger" dot>Fault</Badge>
              <Badge tone="outline" size="md">run_8f21c3</Badge>
            </div>
            <Callout tone="info" title="Every component has a loading state">
              Pass <code>loading</code> and a component renders a skeleton in its own footprint — no
              layout shift when the real data arrives.
            </Callout>
          </div>
        </div>
      </section>

      {/* The full toolkit */}
      <section className="mx-auto w-full max-w-5xl px-6" style={{ paddingTop: 40, paddingBottom: 40, borderTop: `1px solid ${line}` }}>
        <SectionLabel>The full toolkit</SectionLabel>
        <h2 style={{ font: '700 26px/1.2 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.01em', margin: '0 0 8px' }}>
          Reasoning, evidence and coverage — as components.
        </h2>
        <p style={{ maxWidth: 560, color: muted, lineHeight: 1.6, margin: '0 0 24px' }}>
          Beyond the chat surface, PIX ships the parts that let someone check the work: a streaming
          thinking trace, charts that read as evidence, the chain from an agent to the control it
          touched, and a coverage grid.
        </p>

        <div className="grid gap-4 lg:grid-cols-2" style={{ alignItems: 'start' }}>
          <div>
            <CardLabel>Thinking trace</CardLabel>
            <ThinkingTrace
              status="done"
              defaultOpen
              steps={[
                { kind: 'read', system: 'SAP S/4HANA', label: 'BSEG line items', detail: 'invoice 4500112 · vendor 100238', duration: '1.2s', state: 'done' },
                { kind: 'tool', label: 'get_treaty_certificate', detail: 'vendor: 100238', duration: '210ms', state: 'done' },
                { kind: 'thought', label: 'Certificate lapsed 73 days before the invoice', state: 'done' },
                { kind: 'write', system: 'ServiceNow', label: 'Raised finding WHT-0042', duration: '340ms', state: 'done' },
              ]}
            />
          </div>

          <div>
            <CardLabel>Pass rate by invariant</CardLabel>
            <RateBars
              caption="Pass rate across 42 runs"
              threshold={90}
              rows={[
                { name: 'cert_before_rate', value: 88, note: 'A treaty rate applied without a valid certificate', tone: 'danger' },
                { name: 'tolerance_checked', value: 96 },
                { name: 'vendor_resolved', value: 99 },
                { name: 'arithmetic_exact', value: 100 },
              ]}
            />
          </div>

          <div>
            <CardLabel>Execution volume</CardLabel>
            <BarChart
              caption="Runs by month"
              summary="1,240 executed · 908 passed"
              series={[
                { label: 'Executed', color: 'var(--zinc-300, #d4d4d8)' },
                { label: 'Passed', color: 'var(--accent, #10b981)' },
              ]}
              data={[
                { label: 'Jul', values: [180, 150] },
                { label: 'Aug', values: [240, 182] },
                { label: 'Sep', values: [300, 214] },
                { label: 'Oct', values: [520, 362] },
              ]}
            />
          </div>

          <div>
            <CardLabel>Coverage</CardLabel>
            <CoverageMatrix
              assertions={['EX', 'AC', 'CO', 'VA']}
              rows={[
                { label: 'O-WHT-01', description: 'Treaty rate needs a valid certificate', cells: ['tested', 'tested', 'stale', 'none'] },
                { label: 'O-VAT-02', description: 'Reverse charge on cross-border', cells: ['tested', 'tested', 'tested', 'tested'] },
                { label: 'O-REV-07', description: 'Revenue cut-off at period end', cells: ['tested', 'stale', 'none', 'na'] },
              ]}
            />
          </div>

          <div className="lg:col-span-2">
            <CardLabel>Inference chain</CardLabel>
            <InferenceChain
              chain={[
                { label: 'Agent', value: 'wht-treaty-agent', meta: 'type = agentic' },
                { label: 'Control', value: 'O-WHT-01' },
                { label: 'Objective', value: 'Treaty rate applied only with a valid certificate' },
              ]}
              findings={['3 of 42 runs applied the rate with a lapsed certificate']}
              assertions={['accuracy_valuation', 'completeness']}
              exceptions="1,240 exceptions / yr"
              materiality="Above the 0.5% tolerance for the account"
              compensating="No compensating control was identified"
              deficiency="control_deficiency"
            />
          </div>

          <div className="lg:col-span-2">
            <CardLabel>Budget</CardLabel>
            <div style={{ border: `1px solid ${line}`, borderRadius: 8, padding: 16, background: 'var(--surface, #fff)' }}>
              <UsageMeter label="Entities in scope" used={1284} limit={2000} />
              <UsageMeter label="Tokens this month" used={842000} limit={1000000} divider />
              <UsageMeter label="Seats" used={6} limit={null} divider />
            </div>
          </div>
        </div>
      </section>

      {/* Platforms + CTA */}
      <section className="mx-auto w-full max-w-5xl px-6" style={{ paddingTop: 40, paddingBottom: 80, borderTop: `1px solid ${line}` }}>
        <SectionLabel>One token source, every platform</SectionLabel>
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <p style={{ maxWidth: 560, color: muted, lineHeight: 1.6, margin: 0 }}>
            The same colour, type, spacing and motion tokens generate CSS variables, SCSS, JS/TS,
            iOS (Swift), Android (Compose), Flutter and React Native. Use the React components, the
            framework-agnostic <code>pix-*</code> classes, or the raw tokens.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="filled" onClick={() => router.push('/docs')}>
              Get started
            </Button>
            <Button variant="outline" onClick={() => router.push('/examples')}>
              See examples
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
