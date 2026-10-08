'use client';
import * as React from 'react';
import Link from 'next/link';
import {
  Button, Badge, MetricCard, Callout, Switch, Select, AIResponse, Tabs, Alert,
  DataTable, RadioGroup, SearchField, RateBars, AvatarGroup, UsageMeter, BarChart,
} from '@pix-ui/react';
import { palette, NEUTRALS, ACCENTS } from '@/lib/tailwind-palette';
import { computeTheme, previewVars, toCss, radiusCss, RADII, FONTS, type ThemeChoice } from '@/lib/theme-compute';
import { saveTheme } from '@/lib/use-pix-theme';

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';

const PRESETS: { id: string; label: string; note: string; theme: ThemeChoice }[] = [
  { id: 'claude', label: 'Claude', note: 'Warm clay, stone, serif', theme: { accent: 'orange', neutral: 'stone', radius: 8, font: FONTS[2].stack } },
  { id: 'google', label: 'Google', note: 'Blue, slate, rounded', theme: { accent: 'blue', neutral: 'slate', radius: 8, font: FONTS[0].stack } },
  { id: 'pix', label: 'PIX default', note: 'Emerald, zinc', theme: { accent: 'emerald', neutral: 'zinc', radius: 6, font: FONTS[0].stack } },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ font: `600 11px ${mono}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: faint, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function Swatch({ color, selected, title, onClick }: { color: string; selected: boolean; title: string; onClick: () => void }) {
  return (
    <button type="button" title={title} aria-label={title} aria-pressed={selected} onClick={onClick}
      style={{ width: 24, height: 24, borderRadius: 999, background: color, cursor: 'pointer', padding: 0, border: selected ? '2px solid var(--fg1, #1c1917)' : '2px solid transparent', boxShadow: selected ? '0 0 0 2px var(--bg, #fff)' : 'inset 0 0 0 1px rgb(0 0 0 / 0.1)' }} />
  );
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      style={{ font: '500 13px var(--font-sans, ui-sans-serif, system-ui)', padding: '5px 11px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${active ? 'var(--fg1, #1c1917)' : line}`, background: active ? 'var(--fg1, #1c1917)' : 'var(--surface, #fff)', color: active ? 'var(--bg, #fff)' : ink }}>
      {children}
    </button>
  );
}

function Panel({ title, children, span }: { title: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined, border: `1px solid ${line}`, borderRadius: 'var(--radius-lg, 6px)', padding: 16, background: 'var(--surface, #fff)' }}>
      <div style={{ font: `600 11px ${mono}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: faint, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

// A broad slice of PIX — re-themed by the CSS variables on the wrapper, with a
// scoped rule that also applies the chosen radius to the inline-radius surfaces.
function Preview({ vars }: { vars: Record<string, string> }) {
  const [tab, setTab] = React.useState('summary');
  const [autoRetry, setAutoRetry] = React.useState(true);
  const [model, setModel] = React.useState('gpt-5.2');
  const [cadence, setCadence] = React.useState('nightly');
  return (
    <div className="pix-theme-preview" style={{ ...(vars as React.CSSProperties), background: 'var(--bg, #fff)', color: ink, padding: 24, borderRadius: 'var(--radius-lg, 6px)', border: `1px solid ${line}`, fontFamily: 'var(--font-sans)' }}>
      <style>{radiusCss('.pix-theme-preview')}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ font: '700 18px var(--font-sans)', letterSpacing: '-0.01em' }}>Evaluation run</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm">Export</Button>
          <Button variant="outline" size="sm">Share</Button>
          <Button variant="filled" size="sm">Run again</Button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs tabs={[{ value: 'summary', label: 'Summary' }, { value: 'findings', label: 'Findings', count: 3 }, { value: 'runs', label: 'Runs' }]} value={tab} onChange={setTab} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <Panel title="Buttons">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Button variant="primary" size="sm">Primary</Button>
            <Button variant="filled" size="sm">Filled</Button>
            <Button variant="outline" size="sm">Outline</Button>
            <Button variant="ghost" size="sm">Ghost</Button>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </Panel>

        <Panel title="Badges">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Badge tone="accent" dot>Active</Badge>
            <Badge tone="success" dot>Passed</Badge>
            <Badge tone="warning" dot>Review</Badge>
            <Badge tone="danger" dot>Failed</Badge>
            <Badge tone="outline" size="md">run_8f21c3</Badge>
          </div>
        </Panel>

        <Panel title="Metrics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MetricCard label="Runs" value="1,284" delta="+42" deltaType="up" />
            <MetricCard label="Pass rate" value="92.4%" delta="1.8 pts" deltaType="down" valueTone="warning" />
          </div>
        </Panel>

        <Panel title="Toggles and selects">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Switch checked={autoRetry} onChange={setAutoRetry} label="Auto-retry on rate limit" />
            <Select searchable={false} value={model} onChange={(v) => setModel(v)} options={[{ value: 'gpt-5.2', label: 'gpt-5.2' }, { value: 'claude-4.6', label: 'claude-4.6-sonnet' }]} />
          </div>
        </Panel>

        <Panel title="Choice">
          <RadioGroup
            value={cadence}
            onChange={setCadence}
            options={[
              { value: 'nightly', label: 'Nightly', description: 'Run the suite every night' },
              { value: 'on-merge', label: 'On merge', description: 'Run on every merge to main' },
            ]}
          />
        </Panel>

        <Panel title="Search">
          <SearchField placeholder="Search runs…" width="100%" />
        </Panel>

        <Panel title="Pass rate by category" span>
          <RateBars
            caption="Pass rate across 42 runs"
            threshold={90}
            rows={[
              { name: 'cert_before_rate', value: 88, tone: 'danger', note: 'A rate applied without a valid certificate' },
              { name: 'tolerance_checked', value: 96 },
              { name: 'arithmetic_exact', value: 100 },
            ]}
          />
        </Panel>

        <Panel title="Execution volume" span>
          <BarChart
            caption="Runs by month"
            summary="1,240 executed · 908 passed"
            series={[{ label: 'Executed', color: 'var(--zinc-300, #d4d4d8)' }, { label: 'Passed', color: 'var(--accent, #10b981)' }]}
            data={[{ label: 'Jul', values: [180, 150] }, { label: 'Aug', values: [240, 182] }, { label: 'Sep', values: [300, 214] }, { label: 'Oct', values: [520, 362] }]}
          />
        </Panel>

        <Panel title="Recent runs" span>
          <DataTable
            searchable={false}
            rowCount={false}
            columns={[
              { key: 'run', label: 'Run', strong: true },
              { key: 'control', label: 'Control' },
              { key: 'verdict', label: 'Verdict', render: (r: { verdict: string }) => (r.verdict === 'Pass' ? <Badge tone="success" dot>Pass</Badge> : <Badge tone="danger" dot>Fail</Badge>) },
              { key: 'amount', label: 'Withholding', numeric: true, align: 'right' },
            ]}
            rows={[
              { run: 'wht-treaty-001', control: 'O-WHT-01', verdict: 'Pass', amount: '$4,820.00' },
              { run: 'wht-treaty-003', control: 'O-WHT-01', verdict: 'Fail', amount: '$4,820.00' },
            ]}
          />
        </Panel>

        <Panel title="Claim vs truth">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Callout tone="claim" title="What the model said" compact>The certificate was read before the rate was applied.</Callout>
            <Callout tone="truth" title="What's true" compact>The certificate was never fetched — the rate came from the vendor master.</Callout>
          </div>
        </Panel>

        <Panel title="Alert and note">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Alert tone="fault" title="Benchmarking not available">Decision logic changed between runs, so prior-year testing cannot be relied upon.</Alert>
            <Callout tone="info" title="Loading" compact>Every component has a skeleton in its own footprint.</Callout>
          </div>
        </Panel>

        <Panel title="People and budget">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <AvatarGroup size="sm" avatars={['Dana Reyes', { name: 'Sam Okafor', tone: 'accent' }, 'Priya N', 'Lee Watts', 'Mara Vos']} max={4} />
            <div style={{ minWidth: 180, flex: 1 }}>
              <UsageMeter label="Tokens this month" used={842000} limit={1000000} />
            </div>
          </div>
        </Panel>

        <Panel title="AI response" span>
          <AIResponse
            model="gpt-5.2" duration="4.2s" tokens="2,140 tokens"
            text="Both runs skipped the certificate read. The difference is one tool call, not one number."
            thinking={'Loaded run #0042 and run #0038\nDiffed the call sequences'}
            citations={[{ label: 'run #0042', note: 'execution trace' }]}
            onCopy={() => {}}
          />
        </Panel>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const [accent, setAccent] = React.useState('emerald');
  const [neutral, setNeutral] = React.useState('zinc');
  const [radius, setRadius] = React.useState(6);
  const [font, setFont] = React.useState(FONTS[0].stack);
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [copied, setCopied] = React.useState(false);

  const theme = React.useMemo(() => computeTheme({ accent, neutral, radius, font }), [accent, neutral, radius, font]);
  const vars = previewVars(theme, mode);
  const css = toCss(theme);

  // Persist so the example app shells can apply the same theme.
  React.useEffect(() => { saveTheme({ accent, neutral, radius, font }); }, [accent, neutral, radius, font]);

  const applyPreset = (t: ThemeChoice) => { setAccent(t.accent); setNeutral(t.neutral); setRadius(t.radius); setFont(t.font); };
  const copy = () => { navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 1400); };

  return (
    <main className="mx-auto w-full px-6" style={{ color: ink, paddingTop: 56, paddingBottom: 80, maxWidth: 1360 }}>
      <div style={{ font: `600 12px ${mono}`, letterSpacing: '0.08em', textTransform: 'uppercase', color: faint }}>Theme designer</div>
      <h1 style={{ font: '700 clamp(28px, 4vw, 40px)/1.1 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.02em', margin: '12px 0 10px' }}>Make PIX yours.</h1>
      <p style={{ maxWidth: 680, fontSize: 16, lineHeight: 1.6, color: muted, margin: '0 0 28px' }}>
        Pick an accent and a neutral from Tailwind&apos;s palette, a radius and a font. The preview re-themes
        live; copy the CSS variables into your app, or see your theme on a real{' '}
        <Link href="/examples/proofbench" style={{ color: 'var(--accent-fg, #047857)', textDecoration: 'underline' }}>example app</Link>.
        Meaning colours — a model&apos;s claim in red, the verified truth in emerald — stay fixed on purpose.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
        {PRESETS.map((p) => (
          <button key={p.id} type="button" onClick={() => applyPreset(p.theme)}
            style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 8, border: `1px solid ${line}`, background: 'var(--surface, #fff)', cursor: 'pointer', color: 'inherit' }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: palette[p.theme.accent][500] }} />
              <span style={{ width: 14, height: 14, borderRadius: 999, background: palette[p.theme.neutral][400] }} />
            </div>
            <div style={{ font: '600 14px var(--font-sans, ui-sans-serif, system-ui)' }}>{p.label}</div>
            <div style={{ font: `11px ${mono}`, color: faint }}>{p.note}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]" style={{ alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 80, border: `1px solid ${line}`, borderRadius: 10, padding: 20, background: 'var(--surface, #fff)' }}>
          <Field label="Accent">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{ACCENTS.map((n) => <Swatch key={n} color={palette[n][500]} selected={accent === n} title={n} onClick={() => setAccent(n)} />)}</div>
          </Field>
          <Field label="Neutral">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{NEUTRALS.map((n) => <Swatch key={n} color={palette[n][400]} selected={neutral === n} title={n} onClick={() => setNeutral(n)} />)}</div>
          </Field>
          <Field label="Radius">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{RADII.map((r) => <Pill key={r.px} active={radius === r.px} onClick={() => setRadius(r.px)}>{r.label}</Pill>)}</div>
          </Field>
          <Field label="Font">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{FONTS.map((f) => <Pill key={f.id} active={font === f.stack} onClick={() => setFont(f.stack)}>{f.label}</Pill>)}</div>
          </Field>
          <Field label="Preview mode">
            <div style={{ display: 'flex', gap: 6 }}><Pill active={mode === 'light'} onClick={() => setMode('light')}>Light</Pill><Pill active={mode === 'dark'} onClick={() => setMode('dark')}>Dark</Pill></div>
          </Field>
          <Button variant="filled" style={{ width: '100%' }} onClick={copy}>{copied ? 'Copied' : 'Copy CSS'}</Button>
        </div>

        <div>
          <Preview vars={vars} />
          <div style={{ marginTop: 20, border: `1px solid ${line}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${line}`, background: 'var(--surface-alt, #fafaf9)' }}>
              <span style={{ font: `600 11px ${mono}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: faint }}>theme.css</span>
              <button type="button" onClick={copy} style={{ font: '500 12px var(--font-sans, ui-sans-serif, system-ui)', padding: '3px 9px', borderRadius: 4, border: `1px solid ${line}`, background: 'var(--surface, #fff)', color: muted, cursor: 'pointer' }}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            <pre style={{ margin: 0, padding: 16, maxHeight: 320, overflow: 'auto', font: `12px ${mono}`, color: ink, background: 'var(--surface-alt, #fafaf9)' }}><code>{css}</code></pre>
          </div>
        </div>
      </div>
    </main>
  );
}
