'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AIResponse, Button, Callout, MetricCard, DataTable, PromptInput, Badge,
  ThinkingTrace, BarChart, RateBars, CoverageMatrix, Tabs, Alert, Switch, Select,
  AvatarGroup, UsageMeter, InferenceChain,
} from '@pix-ui/react';

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';

function Card({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div style={{ breakInside: 'avoid', marginBottom: 16, border: `1px solid ${line}`, borderRadius: 12, background: 'var(--surface, #fff)', padding: 16 }}>
      {label ? <div style={{ font: `600 11px ${mono}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: faint, marginBottom: 12 }}>{label}</div> : null}
      {children}
    </div>
  );
}

function AnimatedResponse() {
  const [status, setStatus] = React.useState<'generating' | 'done'>('generating');
  React.useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setStatus('done'), reduce ? 0 : 2400);
    return () => clearTimeout(t);
  }, []);
  if (status === 'generating') {
    return <AIResponse status="generating" model="gpt-5.2" stage="Diffing run traces…" stages={[{ label: 'Loaded run #0042 · 5 calls', done: true }, { label: 'Loaded run #0038 · 4 calls', done: true }, { label: 'Comparing call sequences' }]} onStop={() => {}} />;
  }
  return (
    <AIResponse
      model="gpt-5.2" duration="4.2s" tokens="2,140 tokens" defaultThinkingOpen
      text={'wht-treaty-003 cleared because the agent trusted the vendor master and never verified the certificate. The difference is one tool call, not one number.'}
      thinking={[
        { kind: 'read', system: 'SAP S/4HANA', label: 'BSEG line items', detail: 'invoice 4500112', duration: '1.2s', state: 'done' },
        { kind: 'tool', label: 'get_treaty_certificate', detail: 'vendor: 100238', duration: '210ms', state: 'done' },
        { kind: 'thought', label: 'cert lapsed 73 days before the invoice', state: 'done' },
      ]}
      citations={[{ label: 'run #0042', note: 'execution trace' }]}
      onCopy={() => {}} onFeedback={() => {}}
    />
  );
}

function FormCard() {
  const [on, setOn] = React.useState(true);
  const [model, setModel] = React.useState('gpt-5.2');
  return (
    <Card label="Controls">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Switch checked={on} onChange={setOn} label="Auto-retry on rate limit" />
        <Select searchable={false} value={model} onChange={setModel} options={[{ value: 'gpt-5.2', label: 'gpt-5.2' }, { value: 'claude-4.6', label: 'claude-4.6-sonnet' }]} />
      </div>
    </Card>
  );
}

function TabsCard() {
  const [t, setT] = React.useState('summary');
  return (
    <Card label="Tabs">
      <Tabs tabs={[{ value: 'summary', label: 'Summary' }, { value: 'findings', label: 'Findings', count: 3 }, { value: 'runs', label: 'Runs' }]} value={t} onChange={setT} />
    </Card>
  );
}

export default function HomePage() {
  const router = useRouter();
  return (
    <main style={{ color: ink }}>
      {/* Hero — monochrome */}
      <section className="mx-auto w-full max-w-5xl px-6" style={{ paddingTop: 72, paddingBottom: 48, textAlign: 'center' }}>
        <Link href="/themes" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, border: `1px solid ${line}`, background: 'var(--surface, #fff)', font: '500 13px var(--font-sans, ui-sans-serif, system-ui)', color: muted, textDecoration: 'none', marginBottom: 24 }}>
          New: theme designer <span aria-hidden>→</span>
        </Link>
        <h1 style={{ font: '700 clamp(36px, 6vw, 60px)/1.03 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.03em', margin: '0 auto', maxWidth: 820 }}>
          The foundation for AI product interfaces.
        </h1>
        <p style={{ maxWidth: 580, margin: '20px auto 0', fontSize: 18, lineHeight: 1.6, color: muted }}>
          Primitives for responses, reasoning, sources and the difference between what a model
          claimed and what is true — next to the buttons, tables and forms every product needs.
          Copy, customize, make them yours.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 28 }}>
          <Button variant="primary" size="lg" onClick={() => router.push('/docs')}>Get started</Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/docs/components/button')}>Browse components</Button>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20, padding: '8px 14px', borderRadius: 8, border: `1px solid ${line}`, background: 'var(--surface-alt, #fafaf9)', font: `13px ${mono}`, color: ink }}>
          <span style={{ color: faint }}>$</span> npm i @pix-ui/react
        </div>
      </section>

      {/* Bento — a masonry of live PIX component cards */}
      <section className="mx-auto w-full max-w-6xl px-6" style={{ paddingBottom: 80 }}>
        <div style={{ columnGap: 16 }} className="columns-1 md:columns-2 lg:columns-3">
          <Card label="AI response">
            <AnimatedResponse />
          </Card>

          <Card label="Claim ≠ truth">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Callout tone="claim" title="What the model said" compact>The certificate was read before the rate was applied.</Callout>
              <Callout tone="truth" title="What's true" compact>The certificate was never fetched — the rate came from the vendor master.</Callout>
            </div>
          </Card>

          <Card label="Metrics">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MetricCard label="Runs" value="1,284" delta="+42" deltaType="up" />
              <MetricCard label="Pass rate" value="92.4%" delta="1.8 pts" deltaType="down" valueTone="warning" />
            </div>
          </Card>

          <Card label="Prompt input">
            <PromptInput placeholder="Ask a follow-up…" showPlusMenu={false} showModelSelector={false} tools={['Web search', 'Replay run']} activeTools={['Replay run']} rows={2} />
          </Card>

          <Card label="Thinking trace">
            <ThinkingTrace status="done" defaultOpen steps={[
              { kind: 'read', system: 'SAP S/4HANA', label: 'BSEG line items', detail: 'invoice 4500112', duration: '1.2s', state: 'done' },
              { kind: 'tool', label: 'get_treaty_certificate', detail: 'vendor: 100238', duration: '210ms', state: 'done' },
              { kind: 'write', system: 'ServiceNow', label: 'Raised finding WHT-0042', duration: '340ms', state: 'done' },
            ]} />
          </Card>

          <Card label="Recent runs">
            <DataTable searchable={false} rowCount={false}
              columns={[
                { key: 'run', label: 'Run', strong: true },
                { key: 'verdict', label: 'Verdict', render: (r: { verdict: string }) => (r.verdict === 'Pass' ? <Badge tone="success" dot>Pass</Badge> : <Badge tone="danger" dot>Fail</Badge>) },
                { key: 'amount', label: 'Amount', numeric: true, align: 'right' },
              ]}
              rows={[
                { run: 'wht-treaty-001', verdict: 'Pass', amount: '$4,820.00' },
                { run: 'wht-treaty-003', verdict: 'Fail', amount: '$4,820.00' },
                { run: 'vat-reverse-014', verdict: 'Pass', amount: '$1,190.40' },
              ]} />
          </Card>

          <Card label="Pass rate by invariant">
            <RateBars caption="Across 42 runs" threshold={90} rows={[
              { name: 'cert_before_rate', value: 88, tone: 'danger', note: 'A rate applied without a valid certificate' },
              { name: 'tolerance_checked', value: 96 },
              { name: 'arithmetic_exact', value: 100 },
            ]} />
          </Card>

          <Card label="Execution volume">
            <BarChart caption="Runs by month" summary="1,240 executed · 908 passed"
              series={[{ label: 'Executed', color: 'var(--zinc-300, #d4d4d8)' }, { label: 'Passed', color: 'var(--emerald-500, #10b981)' }]}
              data={[{ label: 'Jul', values: [180, 150] }, { label: 'Aug', values: [240, 182] }, { label: 'Sep', values: [300, 214] }, { label: 'Oct', values: [520, 362] }]} />
          </Card>

          <Card label="Buttons & badges">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <Button variant="primary" size="sm">Run</Button>
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Badge tone="success" dot>Passed</Badge>
              <Badge tone="warning" dot>Review</Badge>
              <Badge tone="danger" dot>Failed</Badge>
              <Badge tone="outline" size="md">run_8f21c3</Badge>
            </div>
          </Card>

          <FormCard />
          <TabsCard />

          <Card label="The reading to leave with">
            <Alert tone="inverse" title="Amount-based testing would have passed this.">3 of the 4 failures reached the correct amount by a path that fails the control objective.</Alert>
          </Card>

          <Card label="Coverage">
            <CoverageMatrix assertions={['EX', 'AC', 'CO', 'VA']} rows={[
              { label: 'O-WHT-01', cells: ['tested', 'tested', 'stale', 'none'] },
              { label: 'O-VAT-02', cells: ['tested', 'tested', 'tested', 'tested'] },
              { label: 'O-REV-07', cells: ['tested', 'stale', 'none', 'na'] },
            ]} />
          </Card>

          <Card label="People & budget">
            <AvatarGroup size="sm" avatars={['Dana Reyes', { name: 'Sam Okafor', tone: 'accent' }, 'Priya N', 'Lee Watts', 'Mara Vos']} max={4} />
            <div style={{ marginTop: 14 }}>
              <UsageMeter label="Tokens this month" used={842000} limit={1000000} />
            </div>
          </Card>

          <Card label="Inference chain">
            <InferenceChain chain={[
              { label: 'Agent', value: 'wht-treaty-agent', meta: 'type = agentic' },
              { label: 'Control', value: 'O-WHT-01' },
              { label: 'Objective', value: 'Rate applied only with a valid certificate' },
            ]} findings={['3 of 42 runs applied the rate with a lapsed certificate']} deficiency="control_deficiency" />
          </Card>
        </div>
      </section>

      {/* Platform CTA */}
      <section className="mx-auto w-full max-w-5xl px-6" style={{ paddingBottom: 80, borderTop: `1px solid ${line}`, paddingTop: 48 }}>
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 style={{ font: '700 26px/1.2 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.01em', margin: '0 0 8px' }}>One token source, every platform.</h2>
            <p style={{ maxWidth: 560, color: muted, lineHeight: 1.6, margin: 0 }}>
              The same tokens generate CSS variables, SCSS, JS/TS, iOS (Swift), Android (Compose),
              Flutter and React Native. Use the React components, the <code>pix-*</code> classes, or
              the raw tokens.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => router.push('/docs')}>Get started</Button>
            <Button variant="outline" onClick={() => router.push('/examples')}>See examples</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
