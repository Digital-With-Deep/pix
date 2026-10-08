'use client';
import { ThemedShell } from '@/components/ThemedShell';

import * as React from 'react';
import {
  AIResponse,
  Badge,
  Button,
  EmptyState,
  FingerprintDiff,
  PromptInput,
  RadioGroup,
  Select,
  Switch,
  Tabs,
  type FingerprintComponent,
  type RadioOption,
  type SelectOption,
} from '@pix-ui/react';

// ---------------------------------------------------------------------------
// Icons (Heroicons outline paths — passed straight to `iconPath` props)
// ---------------------------------------------------------------------------

const ICON = {
  play: 'M5.25 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347a1.5 1.5 0 010 2.286l-11.54 6.347c-1.25.687-2.779-.217-2.779-1.643V5.653z',
  bookmark:
    'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
};

const MONO = 'var(--font-mono, ui-monospace, "SF Mono", monospace)';

// ---------------------------------------------------------------------------
// Static demo data — a support-ticket reply prompt compared across two
// model configs. Every number below is illustrative, not live telemetry.
// ---------------------------------------------------------------------------

const DEFAULT_PROMPT = `Summarize this support ticket and propose a reply.

Ticket #48213 — "Invoice charged twice this month"
Customer: Priya Shah (priya@northwind.io)
Plan: Team, 18 seats

Body: We were charged twice on the 3rd for our Team plan renewal. I can see two charges of $412.00 on the card ending 4482. Can you refund the duplicate and confirm it won't happen again next cycle?`;

const DEFAULT_SYSTEM_PROMPT =
  'You are a support assistant for Northwind. Be concise, confirm the refund amount, and never promise a timeline you cannot guarantee.';

const MODEL_OPTIONS: SelectOption[] = [
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini', meta: 'Fast' },
  { value: 'gpt-4o', label: 'gpt-4o', meta: 'Balanced' },
  { value: 'claude-sonnet', label: 'claude-sonnet', meta: 'Reasoning' },
  { value: 'claude-haiku', label: 'claude-haiku', meta: 'Fast' },
];

const TEMP_PRESETS: RadioOption[] = [
  { value: 'precise', label: 'Precise', description: 'temp 0.1 · deterministic' },
  { value: 'balanced', label: 'Balanced', description: 'temp 0.5 · steady' },
  { value: 'creative', label: 'Creative', description: 'temp 0.9 · exploratory' },
];

const PRESET_TEMP: Record<string, string> = {
  precise: '0.1',
  balanced: '0.5',
  creative: '0.9',
};

const PRESET_MAX_TOKENS: Record<string, string> = {
  precise: '512',
  balanced: '1024',
  creative: '1536',
};

const COMPARE_TABS = [
  { value: 'compare', label: 'Compare' },
  { value: 'history', label: 'History' },
  { value: 'settings', label: 'Settings' },
];

const RESPONSE_A = {
  text:
    "Duplicate charge of $412.00 confirmed on the card ending 4482 — the Team plan renewal posted twice on the 3rd.\n\nProposed reply: Acknowledge the duplicate, confirm a refund of $412.00 to the card on file within 5–7 business days, and note the renewal has been flagged so it won't post twice next cycle.",
  duration: '1.1s',
  tokens: '216 tokens',
};

const RESPONSE_B = {
  text:
    "Priya was billed twice for the Team plan renewal: two $412.00 charges landed on the 3rd instead of one, both against the card ending 4482.\n\nProposed reply:\n\nHi Priya — you're right, the renewal posted twice on the 3rd. I've confirmed the duplicate and I'm refunding $412.00 to the card ending 4482; it should land within 5–7 business days. I've also flagged the billing run for the Team plan so this doesn't recur next cycle, and I'll follow up once the refund clears.",
  duration: '2.4s',
  tokens: '338 tokens',
};

// ---------------------------------------------------------------------------
// Small local building blocks
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: '600 11px var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--fg3, #78716c)',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function ParamsPanel({
  run,
  model,
  onModelChange,
  temp,
  onTempChange,
  stream,
  onStreamChange,
  jsonMode,
  onJsonModeChange,
}: {
  run: string;
  model: string;
  onModelChange: (value: string) => void;
  temp: string;
  onTempChange: (value: string) => void;
  stream: boolean;
  onStreamChange: (checked: boolean) => void;
  jsonMode: boolean;
  onJsonModeChange: (checked: boolean) => void;
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-3.5"
      style={{
        backgroundColor: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e7e5e4)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--fg1, #1c1917)' }}>
          {run}
        </span>
        <Badge tone="outline" size="sm">
          <span style={{ fontFamily: MONO }}>{model}</span>
        </Badge>
      </div>

      <Select
        label="Model"
        options={MODEL_OPTIONS}
        value={model}
        onChange={(value) => onModelChange(value)}
        searchable={false}
      />

      <RadioGroup
        label="Temperature"
        options={TEMP_PRESETS}
        value={temp}
        onChange={(value) => onTempChange(value)}
        name={`${run}-temperature`}
      />

      <div className="flex flex-col">
        <Switch
          label="Stream response"
          checked={stream}
          onChange={onStreamChange}
        />
        <Switch
          label="JSON mode"
          description="Force a structured reply"
          checked={jsonMode}
          onChange={onJsonModeChange}
          divider
        />
      </div>
    </div>
  );
}

function ComparisonColumn({
  run,
  model,
  temp,
  response,
}: {
  run: string;
  model: string;
  temp: string;
  response: { text: string; duration: string; tokens: string };
}) {
  return (
    <div
      className="flex min-w-0 flex-col gap-2.5 rounded-lg p-3.5"
      style={{
        backgroundColor: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #e7e5e4)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-baseline gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--fg3, #78716c)' }}>
            {run}
          </span>
          <span className="text-sm font-semibold" style={{ fontFamily: MONO, color: 'var(--fg1, #1c1917)' }}>
            {model}
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <Badge tone="outline" size="sm" title="Preset temperature">
            <span style={{ fontFamily: MONO }}>temp {PRESET_TEMP[temp]}</span>
          </Badge>
          <Badge tone="outline" size="sm" title="Latency">
            <span style={{ fontFamily: MONO }}>{response.duration}</span>
          </Badge>
          <Badge tone="outline" size="sm" title="Token count">
            <span style={{ fontFamily: MONO }}>{response.tokens}</span>
          </Badge>
        </div>
      </div>

      <AIResponse status="done" text={response.text} onCopy={() => {}} onFeedback={() => {}} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function ForgePageInner() {
  const [view, setView] = React.useState('compare');
  const [prompt, setPrompt] = React.useState(DEFAULT_PROMPT);
  const [systemPrompt, setSystemPrompt] = React.useState(DEFAULT_SYSTEM_PROMPT);

  const [modelA, setModelA] = React.useState('gpt-4o-mini');
  const [tempA, setTempA] = React.useState('balanced');
  const [streamA, setStreamA] = React.useState(true);
  const [jsonModeA, setJsonModeA] = React.useState(false);

  const [modelB, setModelB] = React.useState('claude-sonnet');
  const [tempB, setTempB] = React.useState('precise');
  const [streamB, setStreamB] = React.useState(true);
  const [jsonModeB, setJsonModeB] = React.useState(false);

  const fingerprint: FingerprintComponent[] = [
    { name: 'model_id', from: modelA, to: modelB },
    { name: 'temperature', from: PRESET_TEMP[tempA], to: PRESET_TEMP[tempB] },
    { name: 'max_tokens', from: PRESET_MAX_TOKENS[tempA], to: PRESET_MAX_TOKENS[tempB] },
    { name: 'stream', from: String(streamA), to: String(streamB) },
    { name: 'json_mode', from: String(jsonModeA), to: String(jsonModeB) },
    { name: 'H(system_prompt)', from: '7f1e2a9c', to: '7f1e2a9c' },
  ];

  return (
    <div
      className="flex w-full flex-col"
      style={{
        height: 'calc(100dvh - 3.5rem)',
        minHeight: '560px',
        backgroundColor: 'var(--bg, #fafaf9)',
        color: 'var(--fg1, #1c1917)',
      }}
    >
      {/* Top bar */}
      <header
        className="shrink-0"
        style={{
          borderBottom: '1px solid var(--border, #e7e5e4)',
          backgroundColor: 'var(--surface, #ffffff)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: 'var(--accent-bg, #d1fae5)',
                color: 'var(--accent, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              F
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--fg1, #1c1917)' }}>
              Forge
            </span>
            <Badge tone="outline" size="md">
              prompt playground
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" iconPath={ICON.bookmark} onClick={() => {}}>
              Save variant
            </Button>
            <Button variant="filled" size="sm" iconPath={ICON.play} onClick={() => {}}>
              Run
            </Button>
          </div>
        </div>
        <div className="px-4">
          <Tabs tabs={COMPARE_TABS} value={view} onChange={setView} style={{ marginTop: 10 }} />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {view === 'compare' && (
          <div className="mx-auto flex max-w-295 flex-col gap-5 p-4 lg:p-6">
            {/* Prompt + system prompt */}
            <div
              className="flex flex-col gap-3 rounded-lg p-3.5"
              style={{
                backgroundColor: 'var(--surface, #ffffff)',
                border: '1px solid var(--border, #e7e5e4)',
              }}
            >
              <FieldLabel>Prompt</FieldLabel>
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                placeholder="Describe the task for both models…"
                showPlusMenu={false}
                showModelSelector={false}
                allowFiles={false}
                rows={6}
                sendLabel="Run"
                hint="Shared across both runs below · Shift+Enter for a new line"
                onSubmit={() => {}}
              />
              <div>
                <FieldLabel>System prompt</FieldLabel>
                <textarea
                  aria-label="System prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-md px-3 py-2 text-sm leading-relaxed outline-none"
                  style={{
                    backgroundColor: 'var(--bg-muted, #f5f5f4)',
                    border: '1px solid var(--border, #e7e5e4)',
                    color: 'var(--fg1, #1c1917)',
                  }}
                />
              </div>
            </div>

            {/* Params + comparison */}
            <div className="flex flex-col gap-5 lg:flex-row">
              <aside className="hidden w-70 shrink-0 flex-col gap-4 lg:flex">
                <ParamsPanel
                  run="Run A"
                  model={modelA}
                  onModelChange={setModelA}
                  temp={tempA}
                  onTempChange={setTempA}
                  stream={streamA}
                  onStreamChange={setStreamA}
                  jsonMode={jsonModeA}
                  onJsonModeChange={setJsonModeA}
                />
                <ParamsPanel
                  run="Run B"
                  model={modelB}
                  onModelChange={setModelB}
                  temp={tempB}
                  onTempChange={setTempB}
                  stream={streamB}
                  onStreamChange={setStreamB}
                  jsonMode={jsonModeB}
                  onJsonModeChange={setJsonModeB}
                />
              </aside>

              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ComparisonColumn run="Run A" model={modelA} temp={tempA} response={RESPONSE_A} />
                  <ComparisonColumn run="Run B" model={modelB} temp={tempB} response={RESPONSE_B} />
                </div>

                <FingerprintDiff
                  title="Run configuration fingerprint — A to B"
                  components={fingerprint}
                  periodLabels={['Run A', 'Run B']}
                  verdictNote="Model and sampling differ between the two runs, so any difference in the reply reflects the config change, not noise — rerun with matching params before trusting a head-to-head score."
                />
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="mx-auto max-w-190 p-6">
            <EmptyState
              icon="inbox"
              title="No saved runs yet"
              body="Run a comparison and save the variant you like to build a history here."
              bordered
            />
          </div>
        )}

        {view === 'settings' && (
          <div className="mx-auto max-w-190 p-6">
            <EmptyState
              icon="plug"
              title="Workspace settings"
              body="Connect billing, manage API keys, and set default models from here."
              bordered
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForgeExample() {
  return (
    <ThemedShell>
      <ForgePageInner />
    </ThemedShell>
  );
}
