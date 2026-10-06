'use client';
import { useRouter } from 'next/navigation';
import {
  AIResponse,
  Button,
  Callout,
  MetricCard,
  DataTable,
  PromptInput,
  Badge,
} from '@pix-ui/react';

// The home page dogfoods PIX: every surface below is a real @pix-ui/react
// component, styled only with PIX tokens, so it flips with the theme.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: '600 12px var(--font-mono, ui-monospace, Menlo, monospace)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: faint,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: '600 11px var(--font-mono, ui-monospace, Menlo, monospace)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: faint,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <main style={{ color: ink }}>
      {/* Hero */}
      <section
        className="mx-auto w-full max-w-5xl px-6"
        style={{ paddingTop: 72, paddingBottom: 56 }}
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <Eyebrow>Primitives for Intelligent eXperiences</Eyebrow>
            <h1
              style={{
                font: '700 clamp(34px, 5vw, 52px)/1.05 var(--font-sans, ui-sans-serif, system-ui)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
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
              <Button variant="outline" size="lg" onClick={() => router.push('/docs/components/ai-response')}>
                Browse components
              </Button>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                alignSelf: 'flex-start',
                padding: '8px 12px',
                borderRadius: 6,
                border: `1px solid ${line}`,
                background: 'var(--surface-alt, #fafaf9)',
                font: '13px var(--font-mono, ui-monospace, Menlo, monospace)',
                color: ink,
              }}
            >
              <span style={{ color: faint }}>$</span> npm i @pix-ui/react
            </div>
          </div>

          {/* Hero thesis: the real AIResponse primitive */}
          <div>
            <AIResponse
              model="gpt-5.2"
              duration="4.2s"
              tokens="2,140 tokens"
              text={
                'wht-treaty-003 cleared because the agent trusted the vendor master and never verified the certificate behind it. The arithmetic was correct — $4,820.00 to the cent.\n\nThe passing run called get_treaty_certificate as its second step and escalated. The difference is one tool call, not one number.'
              }
              thinking={
                'Loaded run #0042 (wht-treaty-003) and run #0038 (wht-treaty-001)\nDiffed the call sequences\ncert_valid_to 2026-11-30; invoice date 2027-02-11 — lapsed 73 days\nClassified as the authored path applies_treaty_rate_anyway'
              }
              citations={[
                { label: 'run #0042', note: 'execution trace' },
                { label: 'O-WHT-01', note: 'control objective' },
              ]}
              onCopy={() => {}}
              onFeedback={() => {}}
            />
          </div>
        </div>
      </section>

      {/* Signature: claim ≠ truth */}
      <section
        className="mx-auto w-full max-w-5xl px-6"
        style={{ paddingTop: 40, paddingBottom: 40, borderTop: `1px solid ${line}` }}
      >
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
      <section
        className="mx-auto w-full max-w-5xl px-6"
        style={{ paddingTop: 40, paddingBottom: 40, borderTop: `1px solid ${line}` }}
      >
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
                  r.verdict === 'Pass' ? (
                    <Badge tone="success" dot>
                      Pass
                    </Badge>
                  ) : (
                    <Badge tone="danger" dot>
                      Fail
                    </Badge>
                  ),
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
          <PromptInput
            placeholder="Ask a follow-up…"
            showPlusMenu={false}
            showModelSelector={false}
            tools={['Web search', 'Replay run']}
            activeTools={['Replay run']}
            rows={2}
          />
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

      {/* Platforms + CTA */}
      <section
        className="mx-auto w-full max-w-5xl px-6"
        style={{ paddingTop: 40, paddingBottom: 80, borderTop: `1px solid ${line}` }}
      >
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
            <Button variant="outline" onClick={() => router.push('/docs/installation/nextjs')}>
              Install guides
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
