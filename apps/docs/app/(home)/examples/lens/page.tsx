'use client';

import * as React from 'react';
import {
  AIResponse,
  Badge,
  Button,
  Callout,
  CodeEditor,
  FingerprintDiff,
  InlineCode,
  InvariantPanel,
} from '@pix-ui/react';

// Lens — an AI code-review surface. Every panel below is a real
// @pix-ui/react component; only PIX tokens are used for color, so the
// page follows the site's light/dark theme automatically.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)';

interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
  active?: boolean;
}

const changedFiles: ChangedFile[] = [
  { path: 'billing/webhook_retry.ts', additions: 42, deletions: 11, active: true },
  { path: 'billing/webhook_retry.test.ts', additions: 58, deletions: 0 },
  { path: 'billing/config.ts', additions: 4, deletions: 2 },
  { path: 'billing/types.ts', additions: 6, deletions: 1 },
];

const retrySnippet = `import { config } from "./config";

interface RetryOptions {
  attempt: number;
  baseDelayMs: number;
}

function jitter(ms: number): number {
  return ms * (1 + Math.random() * 0.3);
}

export function nextRetryDelay({ attempt, baseDelayMs }: RetryOptions): number {
  const exp = baseDelayMs * Math.pow(2, attempt);
  return jitter(exp);
}

export async function scheduleRetry(job: WebhookJob): Promise<void> {
  if (job.attempt >= config.maxAttempts) {
    await deadLetter(job);
    return;
  }
  const delay = nextRetryDelay({
    attempt: job.attempt,
    baseDelayMs: config.baseDelayMs,
  });
  await sleep(delay);
  await deliver(job);
}`;

function FileRow({ file }: { file: ChangedFile }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 6,
        background: file.active ? 'var(--accent-bg, #ede9fe)' : 'transparent',
        cursor: 'default',
      }}
    >
      <span
        style={{
          minWidth: 0,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          font: `400 12px ${mono}`,
          color: file.active ? 'var(--accent-fg, #4c1d95)' : ink,
        }}
        title={file.path}
      >
        {file.path}
      </span>
      <span style={{ font: `500 11px ${mono}`, color: muted, whiteSpace: 'nowrap' }}>
        +{file.additions}
      </span>
      <span style={{ font: `500 11px ${mono}`, color: faint, whiteSpace: 'nowrap' }}>
        −{file.deletions}
      </span>
    </div>
  );
}

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: `600 11px ${mono}`,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: faint,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

export default function LensExamplePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg, #fff)',
        color: ink,
        fontFamily: sans,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          padding: '14px 20px',
          borderBottom: `1px solid ${line}`,
          background: 'var(--surface, #fff)',
        }}
      >
        <span style={{ font: `700 15px ${sans}`, color: ink }}>Lens</span>
        <Badge tone="warning" dot>
          Changes requested
        </Badge>
        <span style={{ font: `400 13px ${sans}`, color: muted }}>
          PR #482 · Add exponential backoff for webhook retries
        </span>
        <span style={{ font: `400 12px ${mono}`, color: faint }}>opened by cost-guard-bot</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm">
            View full diff
          </Button>
          <Button variant="primary" size="sm">
            Re-run checks
          </Button>
        </div>
      </div>

      {/* Body: file list · code pane · review rail */}
      <div className="grid gap-0 lg:grid-cols-[220px_1fr_360px]" style={{ alignItems: 'stretch' }}>
        {/* Left: changed files */}
        <div
          style={{
            borderRight: `1px solid ${line}`,
            padding: 12,
            minWidth: 0,
          }}
        >
          <RailLabel>Changed files · 4</RailLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {changedFiles.map((f) => (
              <FileRow key={f.path} file={f} />
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: `1px solid ${line}`,
              font: `400 11px ${mono}`,
              color: faint,
            }}
          >
            110 additions · 14 deletions
          </div>
        </div>

        {/* Main: code pane */}
        <div style={{ padding: 20, minWidth: 0 }}>
          <RailLabel>Reviewing</RailLabel>
          <CodeEditor
            value={retrySnippet}
            readOnly
            language="ts"
            title="billing/webhook_retry.ts"
            lineNumbers
            highlightLines={[9, 13, 14]}
            status="+42 −11 · flagged by Lens on lines 9 and 13–14"
          />
        </div>

        {/* Right: AI review rail */}
        <div
          style={{
            borderLeft: `1px solid ${line}`,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            minWidth: 0,
            background: 'var(--surface-alt, #fafaf9)',
          }}
        >
          <div>
            <RailLabel>AI review</RailLabel>
            <AIResponse
              model="lens-review-1"
              duration="6.1s"
              tokens="2,310 tokens"
              status="done"
              text={
                'This change replaces the fixed 5-second retry delay with exponential backoff plus jitter, and raises the retry ceiling from 3 attempts to 7. The backoff curve itself is correct, but nextRetryDelay (webhook_retry.ts:12) never applies config.maxDelayMs, so jitter (webhook_retry.ts:9) can return delays well past the 30-second ceiling the config file still declares. By attempt 7 the computed delay is close to two minutes. Tests cover the happy path and the dead-letter path, but not the ceiling.'
              }
              thinking={
                'Diffed webhook_retry.ts against main\nTraced nextRetryDelay through scheduleRetry\nCompared the growth curve against config.maxDelayMs\nChecked webhook_retry.test.ts for ceiling coverage'
              }
              thinkingLabel="Show reasoning"
              citations={[
                'webhook_retry.ts:9',
                'webhook_retry.ts:12-14',
                {
                  label: 'config.ts:4',
                  note: 'maxDelayMs is declared but unused after this diff',
                },
              ]}
              onCopy={() => {}}
              onRetry={() => {}}
              onFeedback={() => {}}
            />
          </div>

          <div>
            <RailLabel>Automated checks</RailLabel>
            <InvariantPanel
              scope="PR #482 · billing-service · run #1184"
              compact
              invariants={[
                {
                  name: 'unit_tests',
                  state: 'pass',
                  catches: 'Core retry and dead-letter paths must have passing unit coverage.',
                  observed: '41 of 41',
                },
                {
                  name: 'type_check',
                  state: 'pass',
                  catches: 'Strict TypeScript compilation with no implicit any.',
                },
                {
                  name: 'retry_ceiling_enforced',
                  state: 'fail',
                  catches: 'Computed retry delay must never exceed config.maxDelayMs.',
                  detail:
                    'nextRetryDelay (webhook_retry.ts:12-14) ignores config.maxDelayMs; by attempt 7 the delay is roughly 118s against a 30s ceiling.',
                },
                {
                  name: 'secrets_scan',
                  state: 'pass',
                  catches: 'No credentials or tokens committed in the diff.',
                },
                {
                  name: 'dependency_audit',
                  state: 'not_applicable',
                  catches: 'Flags new third-party packages for license and CVE review.',
                },
              ]}
            />
          </div>

          <div>
            <RailLabel>Claim vs. verified truth</RailLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Callout tone="claim" title="Model claim" compact>
                <InlineCode tone="neutral">nextRetryDelay</InlineCode> respects the 30-second
                ceiling configured in <InlineCode tone="neutral">config.maxDelayMs</InlineCode>,
                so retries stay within the documented SLA.
              </Callout>
              <Callout
                tone="truth"
                title="Verified truth"
                compact
                action={
                  <Button variant="ghost" size="sm">
                    Open config.ts
                  </Button>
                }
              >
                <InlineCode tone="neutral">config.maxDelayMs</InlineCode> is declared but never
                referenced in <InlineCode tone="neutral">nextRetryDelay</InlineCode>. Stepping
                through the function with the current config, the attempt-7 delay reaches
                roughly 118s — about 4x past the ceiling.
              </Callout>
            </div>
          </div>

          <div>
            <RailLabel>Structural diff</RailLabel>
            <FingerprintDiff
              title="Retry logic fingerprint"
              periodLabels={['main', 'PR #482']}
              components={[
                {
                  name: 'retry_strategy',
                  from: 'fixed_delay(5s)',
                  to: 'exponential_backoff(base=1s, factor=2, jitter=0.3)',
                },
                { name: 'max_attempts', from: '3', to: '7' },
                { name: 'ceiling_enforced', from: 'true', to: 'false' },
                { name: 'dead_letter_path', from: 'present', to: 'present' },
              ]}
              verdictNote="ceiling_enforced moved from true to false — resolve before merge."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
