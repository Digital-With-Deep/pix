'use client';
import * as React from 'react';
import { Button, Badge, MetricCard, Callout, Switch, Select, AIResponse } from '@pix-ui/react';
import { palette, NEUTRALS, ACCENTS } from '@/lib/tailwind-palette';
import { computeTheme, previewVars, toCss, RADII, FONTS, type ThemeChoice } from '@/lib/theme-compute';

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
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={selected}
      onClick={onClick}
      style={{
        width: 24, height: 24, borderRadius: 999, background: color, cursor: 'pointer', padding: 0,
        border: selected ? '2px solid var(--fg1, #1c1917)' : '2px solid transparent',
        boxShadow: selected ? '0 0 0 2px var(--bg, #fff)' : `inset 0 0 0 1px rgb(0 0 0 / 0.1)`,
      }}
    />
  );
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        font: '500 13px var(--font-sans, ui-sans-serif, system-ui)', padding: '5px 11px', borderRadius: 6, cursor: 'pointer',
        border: `1px solid ${active ? 'var(--fg1, #1c1917)' : line}`,
        background: active ? 'var(--fg1, #1c1917)' : 'var(--surface, #fff)',
        color: active ? 'var(--bg, #fff)' : ink,
      }}
    >
      {children}
    </button>
  );
}

// A representative slice of PIX, re-themed by the CSS variables on its wrapper.
function Preview({ vars }: { vars: Record<string, string> }) {
  const [autoRetry, setAutoRetry] = React.useState(true);
  const [model, setModel] = React.useState('gpt-5.2');
  return (
    <div style={{ ...(vars as React.CSSProperties), background: 'var(--bg, #fff)', color: ink, padding: 24, borderRadius: 'var(--radius-lg, 6px)', border: `1px solid ${line}`, fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ font: '700 18px var(--font-sans)', letterSpacing: '-0.01em' }}>Evaluation run</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm">Export</Button>
          <Button variant="outline" size="sm">Share</Button>
          <Button variant="filled" size="sm">Run again</Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <Badge tone="accent" dot>Active</Badge>
        <Badge tone="success" dot>Passed</Badge>
        <Badge tone="warning" dot>Needs review</Badge>
        <Badge tone="danger" dot>Failed</Badge>
        <Badge tone="outline" size="md">run_8f21c3</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Runs" value="1,284" delta="+42" deltaType="up" />
        <MetricCard label="Pass rate" value="92.4%" delta="1.8 pts" deltaType="down" valueTone="warning" />
        <MetricCard label="Open" value="7" hint="Today" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <Callout tone="claim" title="What the model said">The certificate was read before the rate was applied.</Callout>
        <Callout tone="truth" title="What's true">The certificate was never fetched — the rate came from the vendor master.</Callout>
      </div>

      <AIResponse
        model="gpt-5.2"
        duration="4.2s"
        tokens="2,140 tokens"
        text="Both runs skipped the certificate read. The difference is one tool call, not one number."
        thinking={'Loaded run #0042 and run #0038\nDiffed the call sequences'}
        citations={[{ label: 'run #0042', note: 'execution trace' }]}
        onCopy={() => {}}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
        <Switch checked={autoRetry} onChange={setAutoRetry} label="Auto-retry on rate limit" />
        <div style={{ minWidth: 200 }}>
          <Select searchable={false} value={model} onChange={(v) => setModel(v)} options={[{ value: 'gpt-5.2', label: 'gpt-5.2' }, { value: 'claude-4.6', label: 'claude-4.6-sonnet' }]} />
        </div>
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

  const applyPreset = (t: ThemeChoice) => {
    setAccent(t.accent);
    setNeutral(t.neutral);
    setRadius(t.radius);
    setFont(t.font);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6" style={{ color: ink, paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ font: `600 12px ${mono}`, letterSpacing: '0.08em', textTransform: 'uppercase', color: faint }}>Theme designer</div>
      <h1 style={{ font: '700 clamp(28px, 4vw, 40px)/1.1 var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.02em', margin: '12px 0 10px' }}>
        Make PIX yours.
      </h1>
      <p style={{ maxWidth: 640, fontSize: 16, lineHeight: 1.6, color: muted, margin: '0 0 28px' }}>
        Pick an accent and a neutral from Tailwind&apos;s palette, a radius and a font. The preview re-themes
        live; copy the CSS variables into your app to apply it everywhere. Meaning colours — a model&apos;s
        claim in red, the verified truth in emerald — stay fixed on purpose.
      </p>

      {/* Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.theme)}
            style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 8, border: `1px solid ${line}`, background: 'var(--surface, #fff)', cursor: 'pointer', color: 'inherit' }}
          >
            <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: palette[p.theme.accent][500] }} />
              <span style={{ width: 14, height: 14, borderRadius: 999, background: palette[p.theme.neutral][400] }} />
            </div>
            <div style={{ font: '600 14px var(--font-sans, ui-sans-serif, system-ui)' }}>{p.label}</div>
            <div style={{ font: `11px ${mono}`, color: faint }}>{p.note}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]" style={{ alignItems: 'start' }}>
        {/* Controls */}
        <div style={{ border: `1px solid ${line}`, borderRadius: 10, padding: 20, background: 'var(--surface, #fff)' }}>
          <Field label="Accent">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ACCENTS.map((n) => <Swatch key={n} color={palette[n][500]} selected={accent === n} title={n} onClick={() => setAccent(n)} />)}
            </div>
          </Field>
          <Field label="Neutral">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {NEUTRALS.map((n) => <Swatch key={n} color={palette[n][400]} selected={neutral === n} title={n} onClick={() => setNeutral(n)} />)}
            </div>
          </Field>
          <Field label="Radius">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {RADII.map((r) => <Pill key={r.px} active={radius === r.px} onClick={() => setRadius(r.px)}>{r.label}</Pill>)}
            </div>
          </Field>
          <Field label="Font">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FONTS.map((f) => <Pill key={f.id} active={font === f.stack} onClick={() => setFont(f.stack)}>{f.label}</Pill>)}
            </div>
          </Field>
          <Field label="Preview mode">
            <div style={{ display: 'flex', gap: 6 }}>
              <Pill active={mode === 'light'} onClick={() => setMode('light')}>Light</Pill>
              <Pill active={mode === 'dark'} onClick={() => setMode('dark')}>Dark</Pill>
            </div>
          </Field>
          <Button
            variant="filled"
            style={{ width: '100%' }}
            onClick={() => { navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
          >
            {copied ? 'Copied' : 'Copy CSS'}
          </Button>
        </div>

        {/* Preview + CSS */}
        <div>
          <Preview vars={vars} />
          <div style={{ marginTop: 20, border: `1px solid ${line}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${line}`, background: 'var(--surface-alt, #fafaf9)' }}>
              <span style={{ font: `600 11px ${mono}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: faint }}>theme.css</span>
              <button type="button" onClick={() => { navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 1400); }} style={{ font: `500 12px var(--font-sans, ui-sans-serif, system-ui)`, padding: '3px 9px', borderRadius: 4, border: `1px solid ${line}`, background: 'var(--surface, #fff)', color: muted, cursor: 'pointer' }}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            <pre style={{ margin: 0, padding: 16, maxHeight: 320, overflow: 'auto', font: `12px ${mono}`, color: ink, background: 'var(--surface-alt, #fafaf9)' }}>
              <code>{css}</code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
