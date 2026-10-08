'use client';
import { ThemedShell } from '@/components/ThemedShell';

import * as React from 'react';
import {
  Alert,
  AlertAction,
  Avatar,
  Badge,
  Button,
  Callout,
  DataTable,
  ExecutionTrace,
  InlineCode,
  InvariantPanel,
  type DataTableColumn,
  type ExecutionTraceStep,
  type Invariant,
} from '@pix-ui/react';

// ---------------------------------------------------------------------------
// Guardrail — a trust-and-safety review queue. A reviewer triages flagged
// model generations against policy. Sample excerpts below are paraphrased
// and redacted on purpose; this is a demo, not a corpus of real content.
// ---------------------------------------------------------------------------

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type Status = 'Queued' | 'Escalated' | 'Approved' | 'Blocked';

interface FlaggedGeneration {
  id: string;
  category: string;
  severity: Severity;
  model: string;
  flaggedAt: string;
  status: Status;
  policyCode: string;
  output: string;
  claim: string;
  truth: string;
  checks: Invariant[];
  steps: ExecutionTraceStep[];
}

const SEVERITY_TONE: Record<Severity, 'danger' | 'warning' | 'info' | 'neutral'> = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'neutral',
};

const STATUS_TONE: Record<Status, 'neutral' | 'warning' | 'success' | 'danger'> = {
  Queued: 'neutral',
  Escalated: 'warning',
  Approved: 'success',
  Blocked: 'danger',
};

const STANDING_CHECKS = {
  pii: 'No personal data about a real, identifiable individual appears in the generation.',
  refusal: 'The model refuses and redirects self-harm, weapons, extremism and hate-speech requests.',
  sources: 'Medical, legal or financial claims cite a reviewable source.',
  budget: 'Response length stays under the 600-token safety-response ceiling.',
};

const QUEUE: FlaggedGeneration[] = [
  {
    id: 'gen_7f21ac',
    category: 'Self-harm',
    severity: 'Critical',
    model: 'gpt-5.2',
    flaggedAt: '2026-10-07 09:14',
    status: 'Escalated',
    policyCode: 'POL-SH-02',
    output:
      'Excerpt withheld from this view — the classifier flagged method-specific self-harm detail appearing after an initial refusal.',
    claim:
      'The transcript header claims the model refused the request outright and only offered a crisis-line referral, with no actionable detail anywhere in the reply.',
    truth:
      'Line-by-line review found the refusal was reversed two turns later: method-specific detail appears immediately before the referral line. This violates POL-SH-02 and stays escalated.',
    checks: [
      { name: 'no_pii_in_output', state: 'pass', catches: STANDING_CHECKS.pii },
      {
        name: 'refuses_disallowed_content',
        state: 'fail',
        catches: STANDING_CHECKS.refusal,
        detail: 'Refusal was reversed two turns later — see verified truth.',
      },
      { name: 'cites_sources', state: 'not_applicable', catches: STANDING_CHECKS.sources },
      {
        name: 'within_token_budget',
        state: 'pass',
        catches: STANDING_CHECKS.budget,
        observed: '184 of 600',
      },
    ],
    steps: [
      {
        name: 'classify_content',
        args: { generation_id: 'gen_7f21ac' },
        duration: '41ms',
        result: '{ "topic": "self_harm", "confidence": 0.95 }',
      },
      {
        name: 'match_policy',
        args: { topic: 'self_harm' },
        duration: '12ms',
        result: '{ "policy": "POL-SH-02", "action": "block_and_escalate" }',
      },
      {
        name: 'human_review',
        args: { queue: 'tier-2 safety' },
        duration: '—',
        note: 'Confirmed the delayed method-specific detail. Escalated to the policy lead.',
        flagged: true,
      },
    ],
  },
  {
    id: 'gen_4c18e9',
    category: 'PII leak',
    severity: 'High',
    model: 'claude-4.6-sonnet',
    flaggedAt: '2026-10-07 08:52',
    status: 'Queued',
    policyCode: 'POL-PII-01',
    output:
      'Reply to an unrelated account question echoed back a full billing address and the last four digits of a card on file.',
    claim:
      'The model states it only confirmed the account was found, and never repeated sensitive fields back to the user.',
    truth:
      'The logged transcript shows the full billing address and last four card digits printed verbatim in paragraph two, in response to a question that never asked for either.',
    checks: [
      {
        name: 'no_pii_in_output',
        state: 'fail',
        catches: STANDING_CHECKS.pii,
        detail: 'Billing address and last four card digits appear verbatim in paragraph two.',
      },
      { name: 'refuses_disallowed_content', state: 'pass', catches: STANDING_CHECKS.refusal },
      { name: 'cites_sources', state: 'not_applicable', catches: STANDING_CHECKS.sources },
      { name: 'within_token_budget', state: 'pass', catches: STANDING_CHECKS.budget, observed: '96 of 600' },
    ],
    steps: [
      {
        name: 'classify_content',
        args: { generation_id: 'gen_4c18e9' },
        duration: '38ms',
        result: '{ "topic": "pii_leak", "confidence": 0.88 }',
      },
      {
        name: 'match_policy',
        args: { topic: 'pii_leak' },
        duration: '9ms',
        result: '{ "policy": "POL-PII-01", "action": "block_and_review" }',
      },
      {
        name: 'human_review',
        args: { queue: 'tier-1 safety' },
        duration: '—',
        note: 'Confirmed address and card digits present verbatim. Awaiting disposition.',
      },
    ],
  },
  {
    id: 'gen_93a2f1',
    category: 'Jailbreak',
    severity: 'Medium',
    model: 'gpt-5.1',
    flaggedAt: '2026-10-07 07:30',
    status: 'Approved',
    policyCode: 'POL-JB-04',
    output:
      'User framed the request as a roleplay with "no safety rules". The model stayed in character but declined the embedded request both times it was repeated.',
    claim:
      'The model claims it recognized the jailbreak framing and declined the embedded request while remaining otherwise helpful.',
    truth:
      'Transcript review confirms the embedded request was declined in both turns. No disallowed content was produced.',
    checks: [
      { name: 'no_pii_in_output', state: 'pass', catches: STANDING_CHECKS.pii },
      { name: 'refuses_disallowed_content', state: 'pass', catches: STANDING_CHECKS.refusal },
      { name: 'cites_sources', state: 'not_applicable', catches: STANDING_CHECKS.sources },
      { name: 'within_token_budget', state: 'pass', catches: STANDING_CHECKS.budget, observed: '211 of 600' },
    ],
    steps: [
      {
        name: 'classify_content',
        args: { generation_id: 'gen_93a2f1' },
        duration: '35ms',
        result: '{ "topic": "jailbreak_attempt", "confidence": 0.81 }',
      },
      {
        name: 'match_policy',
        args: { topic: 'jailbreak_attempt' },
        duration: '10ms',
        result: '{ "policy": "POL-JB-04", "action": "monitor" }',
      },
      {
        name: 'human_review',
        args: { queue: 'tier-1 safety' },
        duration: '—',
        note: 'No violation found. Closing with no action.',
      },
    ],
  },
  {
    id: 'gen_1bd6aa',
    category: 'Hate speech',
    severity: 'High',
    model: 'mistral-large-3',
    flaggedAt: '2026-10-06 22:05',
    status: 'Queued',
    policyCode: 'POL-HS-03',
    output:
      'Generation included a derogatory generalization about a protected group, framed in the surrounding text as satire.',
    claim: 'The model states the line was clearly marked as satire and not an endorsed viewpoint.',
    truth:
      'Reviewer found no satire framing anywhere in the surrounding text — the line reads as an unflagged endorsement, not commentary on one.',
    checks: [
      { name: 'no_pii_in_output', state: 'pass', catches: STANDING_CHECKS.pii },
      {
        name: 'refuses_disallowed_content',
        state: 'fail',
        catches: STANDING_CHECKS.refusal,
        detail: 'No satire or commentary framing found; the line reads as an unflagged endorsement.',
      },
      { name: 'cites_sources', state: 'not_applicable', catches: STANDING_CHECKS.sources },
      { name: 'within_token_budget', state: 'pass', catches: STANDING_CHECKS.budget, observed: '142 of 600' },
    ],
    steps: [
      {
        name: 'classify_content',
        args: { generation_id: 'gen_1bd6aa' },
        duration: '44ms',
        result: '{ "topic": "hate_speech", "confidence": 0.84 }',
      },
      {
        name: 'match_policy',
        args: { topic: 'hate_speech' },
        duration: '11ms',
        result: '{ "policy": "POL-HS-03", "action": "block_and_review" }',
      },
      {
        name: 'human_review',
        args: { queue: 'tier-1 safety' },
        duration: '—',
        note: 'No satire framing found in context. Recommending block.',
        flagged: true,
      },
    ],
  },
  {
    id: 'gen_e05c77',
    category: 'Medical misinformation',
    severity: 'Medium',
    model: 'gpt-5.0',
    flaggedAt: '2026-10-06 19:41',
    status: 'Blocked',
    policyCode: 'POL-MED-05',
    output:
      'Response recommended stopping a named prescription medication abruptly, without citing a clinical source for the dosage change.',
    claim: 'The model claims the advice was general wellness information, not a medical directive.',
    truth:
      'The response names a specific drug class and an abrupt dosage change, which is medical guidance that this generation does not cite a source for.',
    checks: [
      { name: 'no_pii_in_output', state: 'pass', catches: STANDING_CHECKS.pii },
      { name: 'refuses_disallowed_content', state: 'pass', catches: STANDING_CHECKS.refusal },
      {
        name: 'cites_sources',
        state: 'fail',
        catches: STANDING_CHECKS.sources,
        detail: 'Names a drug class and dosage change with no clinical source cited.',
      },
      { name: 'within_token_budget', state: 'pass', catches: STANDING_CHECKS.budget, observed: '167 of 600' },
    ],
    steps: [
      {
        name: 'classify_content',
        args: { generation_id: 'gen_e05c77' },
        duration: '37ms',
        result: '{ "topic": "medical_misinformation", "confidence": 0.77 }',
      },
      {
        name: 'match_policy',
        args: { topic: 'medical_misinformation' },
        duration: '9ms',
        result: '{ "policy": "POL-MED-05", "action": "block_and_review" }',
      },
      {
        name: 'human_review',
        args: { queue: 'tier-1 safety' },
        duration: '—',
        note: 'No citation found for the dosage claim. Blocked pending correction.',
      },
    ],
  },
  {
    id: 'gen_2f9b43',
    category: 'Violent extremism',
    severity: 'Critical',
    model: 'claude-4.5-sonnet',
    flaggedAt: '2026-10-06 14:12',
    status: 'Escalated',
    policyCode: 'POL-EXT-01',
    output:
      'Excerpt withheld from this view — the classifier matched language referencing an extremist framing of historical events.',
    claim: 'The model claims it discussed the topic only in an academic, historical frame.',
    truth:
      'Reviewer found the framing endorsed rather than analyzed the ideology. This matches the POL-EXT-01 criteria for mandatory escalation.',
    checks: [
      { name: 'no_pii_in_output', state: 'pass', catches: STANDING_CHECKS.pii },
      {
        name: 'refuses_disallowed_content',
        state: 'fail',
        catches: STANDING_CHECKS.refusal,
        detail: 'Framing endorses rather than analyzes the ideology — see verified truth.',
      },
      { name: 'cites_sources', state: 'not_applicable', catches: STANDING_CHECKS.sources },
      { name: 'within_token_budget', state: 'pass', catches: STANDING_CHECKS.budget, observed: '203 of 600' },
    ],
    steps: [
      {
        name: 'classify_content',
        args: { generation_id: 'gen_2f9b43' },
        duration: '46ms',
        result: '{ "topic": "violent_extremism", "confidence": 0.97 }',
      },
      {
        name: 'match_policy',
        args: { topic: 'violent_extremism' },
        duration: '13ms',
        result: '{ "policy": "POL-EXT-01", "action": "block_and_escalate" }',
      },
      {
        name: 'human_review',
        args: { queue: 'tier-2 safety' },
        duration: '—',
        note: 'Framing endorses the ideology rather than analyzing it. Escalated to the policy lead.',
        flagged: true,
      },
    ],
  },
];

const STATUS_FILTERS: Array<Status | 'All'> = ['All', 'Queued', 'Escalated', 'Blocked', 'Approved'];

const COLUMNS: DataTableColumn<FlaggedGeneration>[] = [
  {
    key: 'id',
    label: 'ID',
    render: (row) => (
      <span style={{ fontFamily: 'var(--font-mono, ui-monospace, Menlo, monospace)', fontWeight: 600 }}>
        {row.id}
      </span>
    ),
  },
  { key: 'category', label: 'Category' },
  {
    key: 'severity',
    label: 'Severity',
    align: 'center',
    sortable: true,
    render: (row) => <Badge tone={SEVERITY_TONE[row.severity]}>{row.severity}</Badge>,
  },
  {
    key: 'model',
    label: 'Model',
    render: (row) => (
      <span style={{ fontFamily: 'var(--font-mono, ui-monospace, Menlo, monospace)' }}>{row.model}</span>
    ),
  },
  { key: 'flaggedAt', label: 'Flagged at', sortable: true },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
    render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
  },
];

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)';

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

function GuardrailPageInner() {
  const [statusFilter, setStatusFilter] = React.useState<Status | 'All'>('All');
  const [selectedId, setSelectedId] = React.useState(QUEUE[0].id);

  const filteredRows = React.useMemo(
    () => (statusFilter === 'All' ? QUEUE : QUEUE.filter((g) => g.status === statusFilter)),
    [statusFilter],
  );

  const selected =
    filteredRows.find((g) => g.id === selectedId) ?? filteredRows[0] ?? QUEUE[0];

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
      {/* Top bar */}
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
        <span style={{ font: `700 15px ${sans}`, color: ink }}>Guardrail</span>
        <Badge tone="outline" size="md">
          {QUEUE.length} flagged
        </Badge>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter queue by status">
          {STATUS_FILTERS.map((option) => (
            <Button
              key={option}
              variant={statusFilter === option ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ font: `400 12px ${sans}`, color: muted }}>Dana Osei</span>
          <Avatar name="Dana Osei" tone="info" status="online" size="sm" />
        </div>
      </div>

      {/* Body: queue · detail */}
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" style={{ alignItems: 'stretch' }}>
        {/* Left: queue */}
        <div style={{ borderRight: `1px solid ${line}`, padding: 16, minWidth: 0 }}>
          <RailLabel>Review queue · {filteredRows.length}</RailLabel>
          <DataTable
            caption="Flagged generations"
            columns={COLUMNS}
            rows={filteredRows}
            filters={[{ key: 'severity', options: ['Critical', 'High', 'Medium', 'Low'] }]}
            initialSort={{ key: 'flaggedAt', dir: 'desc' }}
            onRowClick={(row) => setSelectedId(row.id)}
            emptyMessage="No generations match this status filter."
            style={{ borderRadius: 6 }}
          />
        </div>

        {/* Right: detail */}
        <div
          style={{
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            minWidth: 0,
            background: 'var(--surface-alt, #fafaf9)',
          }}
        >
          {/* Header for selected item */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ font: `700 14px ${mono}`, color: ink }}>{selected.id}</span>
              <Badge tone={SEVERITY_TONE[selected.severity]}>{selected.severity}</Badge>
              <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
              <span style={{ font: `400 12px ${sans}`, color: muted }}>{selected.category}</span>
            </div>
            <div style={{ marginTop: 4, font: `400 12px ${sans}`, color: faint }}>
              <span style={{ fontFamily: mono }}>{selected.model}</span> · flagged {selected.flaggedAt} ·
              policy <span style={{ fontFamily: mono }}>{selected.policyCode}</span>
            </div>
          </div>

          {selected.severity === 'Critical' && (
            <Alert
              tone="claim"
              title="Critical policy violation — do not close without escalation"
              citation={selected.policyCode}
              actions={
                <AlertAction onClick={() => {}}>Jump to human review</AlertAction>
              }
            >
              This generation matched a critical-severity category. It must stay escalated until a
              policy lead signs off, even if the model&apos;s own claim reads as compliant.
            </Alert>
          )}

          {/* Model output under review */}
          <div>
            <RailLabel>Model output under review</RailLabel>
            <div
              style={{
                border: `1px solid ${line}`,
                borderRadius: 6,
                padding: '10px 12px',
                background: 'var(--surface, #fff)',
                font: `400 13px ${sans}`,
                lineHeight: 1.6,
                color: ink,
              }}
            >
              {selected.output}
            </div>
          </div>

          {/* Claim vs. verified truth */}
          <div>
            <RailLabel>Claim vs. verified truth</RailLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Callout tone="claim" title="Model's self-assessment" compact>
                {selected.claim}
              </Callout>
              <Callout tone="truth" title="Verified policy verdict" compact>
                {selected.truth} Matched policy <InlineCode tone="neutral">{selected.policyCode}</InlineCode>.
              </Callout>
            </div>
          </div>

          {/* Policy checks */}
          <div>
            <RailLabel>Policy checks</RailLabel>
            <InvariantPanel
              title="Policy invariants"
              scope={`${selected.id} · policy pipeline`}
              compact
              invariants={selected.checks}
            />
          </div>

          {/* Moderation pipeline */}
          <div>
            <RailLabel>Moderation pipeline</RailLabel>
            <ExecutionTrace
              title={`Moderation pipeline — ${selected.id}`}
              steps={selected.steps}
            />
          </div>

          {/* Reviewer actions */}
          <div>
            <RailLabel>Reviewer actions</RailLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="filled" size="sm">
                Approve
              </Button>
              <Button variant="outline" size="sm">
                Escalate
              </Button>
              <Button variant="destructive" size="sm">
                Block
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuardrailExample() {
  return (
    <ThemedShell>
      <GuardrailPageInner />
    </ThemedShell>
  );
}
