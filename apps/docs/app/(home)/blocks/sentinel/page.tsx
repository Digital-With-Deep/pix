'use client';
import { ThemedShell } from '@/components/ThemedShell';
import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  StageFlow,
  ExecutionTrace,
  AuditLog,
  InvariantPanel,
  TaxonomyTree,
  UsageMeter,
  Page,
  Split,
  Stack,
  type StageFlowStage,
  type ExecutionTraceStep,
  type AuditEvent,
  type Invariant,
  type TaxonomyNode,
} from '@pix-ui/react';

// Sentinel dogfoods PIX: every surface below is a real @pix-ui/react
// component, styled only with PIX tokens, so it flips with the theme.
// Scenario: an accounts-payable reconciliation agent working invoices
// inside SAP S/4HANA, under a finance-controls console.

const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';

type RunStatus = 'completed' | 'running' | 'flagged';

interface RunDef {
  id: string;
  label: string;
  batch: string;
  startedAt: string;
  status: RunStatus;
  statusLabel: string;
  stages: StageFlowStage[];
  steps: ExecutionTraceStep[];
  calls: number;
  duration: string;
  tokens: string;
  cost: string;
  missing?: { name: string; label?: string; note?: string }[];
  invariants: Invariant[];
  taxonomy: TaxonomyNode[];
  usage: { tokensUsed: number; tokensLimit: number; callsUsed: number; callsLimit: number };
}

const RUNS: RunDef[] = [
  {
    id: 'run_4417',
    label: 'Run #4417',
    batch: 'Invoice batch · 214 lines',
    startedAt: '09:12',
    status: 'completed',
    statusLabel: 'Completed',
    stages: [
      { label: 'PLAN', value: '1 objective', note: 'Classify batch, select three-way match strategy', progress: 1 },
      { label: 'RETRIEVE', value: '14 docs', note: 'Invoice, PO, goods receipt, vendor master', progress: 1 },
      { label: 'ACT', value: '6 calls', note: 'Three-way match, hold release, payment post', progress: 1 },
      { label: 'VERIFY', value: '5 of 5', note: 'All invariants held before close', progress: 1 },
    ],
    steps: [
      { name: 'sap.fetch_invoice', args: { invoice: 'INV-88213', vendor: 'Meridian Supply Co' }, duration: '184ms', result: '$42,318.00 · net 30 · received 2026-10-04' },
      { name: 'sap.fetch_purchase_order', args: { po: '4500-19231' }, duration: '96ms', result: 'PO total $42,318.00 · 3 line items' },
      { name: 'sap.fetch_goods_receipt', args: { po: '4500-19231' }, duration: '112ms', result: 'Receipt GR-77142 · quantities match PO' },
      { name: 'erp.match_three_way', args: { invoice: 'INV-88213', po: '4500-19231', receipt: 'GR-77142' }, duration: '241ms', result: 'Within tolerance · variance $0.00' },
      { name: 'sap.release_hold', args: { invoice: 'INV-88213' }, duration: '88ms', result: 'Payment block cleared' },
      { name: 'sap.post_payment', args: { invoice: 'INV-88213', amount: '$42,318.00' }, duration: '301ms', result: 'Scheduled for 2026-10-09 · run AP-batch-0917' },
    ],
    calls: 6,
    duration: '1.02s',
    tokens: '9,840 tokens',
    cost: '$0.041',
    missing: [
      { name: 'sap.auto_approve', note: 'Auto-approval path withheld above $25,000 per policy AP-07 — this invoice required the full match.' },
    ],
    invariants: [
      { name: 'arithmetic_delegated', state: 'pass', catches: 'The agent computing settlement totals itself instead of delegating to the ledger’s tolerance check.', step: 'step 4' },
      { name: 'dual_control', state: 'pass', catches: 'A single identity both proposing and approving a payment release.', observed: '2 of 2' },
      { name: 'scope_boundary', state: 'pass', catches: 'The agent touching vendors or amounts outside the batch it was scoped to.' },
      { name: 'replay_consistency', state: 'pass', catches: 'The same inputs producing a different match decision on rerun.', observed: '3 of 3' },
      { name: 'escalation_latency', state: 'pass', catches: 'A flagged exception sitting unrouted past the 15-minute SLA.', observed: 'n/a' },
    ],
    taxonomy: [
      { label: 'Procure-to-pay', depth: 0, code: 'P2P' },
      { label: 'Invoice processing', depth: 1, code: 'P2P-04' },
      { label: 'Three-way match, clean', depth: 2, objective: 'O-FIN-07' },
    ],
    usage: { tokensUsed: 9840, tokensLimit: 50000, callsUsed: 6, callsLimit: 12 },
  },
  {
    id: 'run_4418',
    label: 'Run #4418',
    batch: 'Invoice batch · 189 lines',
    startedAt: '10:03',
    status: 'running',
    statusLabel: 'In progress',
    stages: [
      { label: 'PLAN', value: '1 objective', note: 'Classify batch, select three-way match strategy', progress: 1 },
      { label: 'RETRIEVE', value: '9 docs', note: 'Invoice, PO, goods receipt, vendor master', progress: 1 },
      { label: 'ACT', value: '3 calls', note: 'Three-way match in progress', progress: 0.5, tone: 'alert' },
      { label: 'VERIFY', value: 'pending', note: 'Awaiting ACT completion', progress: 0, tone: 'idle' },
    ],
    steps: [
      { name: 'sap.fetch_invoice', args: { invoice: 'INV-88344', vendor: 'Atlas Freight' }, duration: '171ms', result: '$18,902.50 · net 45 · received 2026-10-07' },
      { name: 'sap.fetch_purchase_order', args: { po: '4500-19355' }, duration: '103ms', result: 'PO total $17,640.00 · 2 line items' },
      { name: 'sap.fetch_goods_receipt', args: { po: '4500-19355' }, duration: '118ms', result: 'Receipt GR-77209 · quantities match PO' },
      { name: 'erp.match_three_way', args: { invoice: 'INV-88344', po: '4500-19355', receipt: 'GR-77209' } },
    ],
    calls: 3,
    duration: '392ms so far',
    tokens: '4,110 tokens',
    cost: '$0.018',
    invariants: [
      { name: 'arithmetic_delegated', state: 'pass', catches: 'The agent computing settlement totals itself instead of delegating to the ledger’s tolerance check.', step: 'step 4' },
      { name: 'dual_control', state: 'not_applicable', catches: 'A single identity both proposing and approving a payment release.' },
      { name: 'scope_boundary', state: 'pass', catches: 'The agent touching vendors or amounts outside the batch it was scoped to.' },
      { name: 'replay_consistency', state: 'not_applicable', catches: 'The same inputs producing a different match decision on rerun.' },
      { name: 'escalation_latency', state: 'not_applicable', catches: 'A flagged exception sitting unrouted past the 15-minute SLA.' },
    ],
    taxonomy: [
      { label: 'Procure-to-pay', depth: 0, code: 'P2P' },
      { label: 'Invoice processing', depth: 1, code: 'P2P-04' },
      { label: 'Three-way match, pending', depth: 2, objective: 'O-FIN-07' },
    ],
    usage: { tokensUsed: 4110, tokensLimit: 50000, callsUsed: 3, callsLimit: 12 },
  },
  {
    id: 'run_4402',
    label: 'Run #4402',
    batch: 'Invoice batch · 231 lines',
    startedAt: 'Yesterday · 16:47',
    status: 'flagged',
    statusLabel: 'Needs review',
    stages: [
      { label: 'PLAN', value: '1 objective', note: 'Classify batch, select three-way match strategy', progress: 1 },
      { label: 'RETRIEVE', value: '11 docs', note: 'Invoice, PO, goods receipt, vendor master', progress: 1 },
      { label: 'ACT', value: '7 calls', note: 'Price variance exceeded tolerance', progress: 1, tone: 'alert' },
      { label: 'VERIFY', value: '4 of 5', note: 'Escalation routed outside SLA', progress: 1, tone: 'alert' },
    ],
    steps: [
      { name: 'sap.fetch_invoice', args: { invoice: 'INV-87990', vendor: 'Nordlight Components' }, duration: '166ms', result: '$61,204.00 · net 30 · received 2026-10-06' },
      { name: 'sap.fetch_purchase_order', args: { po: '4500-19104' }, duration: '94ms', result: 'PO total $58,310.00 · 4 line items' },
      { name: 'sap.fetch_goods_receipt', args: { po: '4500-19104' }, duration: '121ms', result: 'Receipt GR-76988 · quantities match PO' },
      {
        name: 'ledger.compute_variance',
        args: { invoice: 'INV-87990', po: '4500-19104' },
        duration: '58ms',
        result: 'Variance computed in-process: $2,894.00',
        note: 'Agent computed the variance itself instead of calling erp.match_three_way — bypasses the ledger’s tolerance check.',
        flagged: true,
      },
      { name: 'sap.post_hold', args: { invoice: 'INV-87990', reason: 'price_variance_exceeds_tolerance' }, duration: '79ms', result: 'Hold posted 09:41:02' },
      {
        name: 'slack.notify_ap_lead',
        args: { channel: '#ap-exceptions', invoice: 'INV-87990' },
        duration: '140ms',
        result: 'Delivered 10:18:47',
        note: '37 minutes after the hold was posted — past the 15-minute escalation SLA.',
        flagged: true,
      },
      { name: 'sap.fetch_vendor_master', args: { vendor: 'Nordlight Components' }, duration: '101ms', result: 'Price list last updated 2026-08-12' },
    ],
    calls: 7,
    duration: '1.14s',
    tokens: '12,960 tokens',
    cost: '$0.057',
    missing: [
      { name: 'erp.match_three_way', note: 'Never called this run — the agent substituted its own variance math instead.' },
    ],
    invariants: [
      {
        name: 'arithmetic_delegated',
        state: 'fail',
        catches: 'The agent computing settlement totals itself instead of delegating to the ledger’s tolerance check.',
        detail: 'ledger.compute_variance ran in-process at step 4 instead of calling erp.match_three_way.',
        step: 'step 4',
      },
      { name: 'dual_control', state: 'pass', catches: 'A single identity both proposing and approving a payment release.', observed: '2 of 2' },
      { name: 'scope_boundary', state: 'pass', catches: 'The agent touching vendors or amounts outside the batch it was scoped to.' },
      { name: 'replay_consistency', state: 'pass', catches: 'The same inputs producing a different match decision on rerun.', observed: '3 of 3' },
      {
        name: 'escalation_latency',
        state: 'fail',
        catches: 'A flagged exception sitting unrouted past the 15-minute SLA.',
        detail: 'Hold posted at 09:41:02; AP lead notified at 10:18:47 — 37 minutes above the 15-minute SLA.',
        step: 'step 6',
      },
    ],
    taxonomy: [
      { label: 'Procure-to-pay', depth: 0, code: 'P2P' },
      { label: 'Invoice processing', depth: 1, code: 'P2P-04' },
      { label: 'Three-way match exception', depth: 2, objective: 'O-FIN-07' },
      { label: 'Price variance > tolerance', depth: 3, ext: 'ext · US01', objective: 'O-FIN-07.2' },
    ],
    usage: { tokensUsed: 12960, tokensLimit: 50000, callsUsed: 7, callsLimit: 12 },
  },
];

const STATUS_TONE: Record<RunStatus, 'success' | 'accent' | 'danger'> = {
  completed: 'success',
  running: 'accent',
  flagged: 'danger',
};

// Console-wide event feed, independent of which run is selected. Defined
// once at module scope so AuditLog always receives the same array identity.
const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'evt_1', ts: '2026-10-07T09:12:04Z', message: 'Run #4417 started', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'decision', system: 'SAP S/4HANA', outcome: 'ok', run_id: 'run_4417', trace_id: 'tr-4417-00', rationale: 'Scheduled batch window opened for AP invoice queue.' },
  { id: 'evt_2', ts: '2026-10-07T09:12:19Z', message: 'Read invoice INV-88213', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'read', system: 'SAP S/4HANA', resource: 'INV-88213', outcome: 'ok', entity: 'Meridian Supply Co', run_id: 'run_4417', trace_id: 'tr-4417-01', latency_ms: 184 },
  { id: 'evt_3', ts: '2026-10-07T09:12:21Z', message: 'Three-way match passed for INV-88213', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'decision', system: 'SAP S/4HANA', resource: 'INV-88213', outcome: 'ok', entity: 'Meridian Supply Co', control: 'O-FIN-07', run_id: 'run_4417', trace_id: 'tr-4417-04', rationale: 'Variance $0.00, within tolerance; cleared for payment.' },
  { id: 'evt_4', ts: '2026-10-07T09:12:24Z', message: 'Posted payment for INV-88213', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'write', system: 'SAP S/4HANA', resource: 'INV-88213', action: 'post_payment', outcome: 'ok', entity: 'Meridian Supply Co', run_id: 'run_4417', trace_id: 'tr-4417-06', latency_ms: 301 },
  { id: 'evt_5', ts: '2026-10-07T09:13:01Z', message: 'Run #4417 completed', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'decision', outcome: 'ok', run_id: 'run_4417', trace_id: 'tr-4417-07' },
  { id: 'evt_6', ts: '2026-10-07T10:03:12Z', message: 'Run #4418 started', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'decision', system: 'SAP S/4HANA', outcome: 'ok', run_id: 'run_4418', trace_id: 'tr-4418-00' },
  { id: 'evt_7', ts: '2026-10-07T10:03:31Z', message: 'Read invoice INV-88344', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'read', system: 'SAP S/4HANA', resource: 'INV-88344', outcome: 'ok', entity: 'Atlas Freight', run_id: 'run_4418', trace_id: 'tr-4418-01', latency_ms: 171 },
  { id: 'evt_8', ts: '2026-10-07T10:03:44Z', message: 'Three-way match in progress for INV-88344', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'tool_call', system: 'SAP S/4HANA', resource: 'INV-88344', outcome: 'ok', entity: 'Atlas Freight', run_id: 'run_4418', trace_id: 'tr-4418-04' },
  { id: 'evt_9', ts: '2026-10-06T16:47:08Z', message: 'Run #4402 started', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'decision', system: 'SAP S/4HANA', outcome: 'ok', run_id: 'run_4402', trace_id: 'tr-4402-00' },
  { id: 'evt_10', ts: '2026-10-06T16:47:46Z', message: 'Read invoice INV-87990', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'read', system: 'SAP S/4HANA', resource: 'INV-87990', outcome: 'ok', entity: 'Nordlight Components', run_id: 'run_4402', trace_id: 'tr-4402-01', latency_ms: 166 },
  { id: 'evt_11', ts: '2026-10-06T16:47:58Z', message: 'Computed variance in-process for INV-87990', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'tool_call', system: 'ledger', resource: 'INV-87990', outcome: 'flagged', entity: 'Nordlight Components', control: 'arithmetic_delegated', run_id: 'run_4402', trace_id: 'tr-4402-04', rationale: 'Called ledger.compute_variance directly rather than erp.match_three_way.' },
  { id: 'evt_12', ts: '2026-10-06T16:48:21Z', message: 'Posted payment hold on INV-87990', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'write', system: 'SAP S/4HANA', resource: 'INV-87990', action: 'post_hold', outcome: 'flagged', entity: 'Nordlight Components', control: 'O-FIN-07.2', run_id: 'run_4402', trace_id: 'tr-4402-05' },
  { id: 'evt_13', ts: '2026-10-06T17:24:47Z', message: 'Escalation notified AP lead on INV-87990, 37 min after hold', agent: 'ap-reconciliation-agent', identity: 'svc-ap-agent@finance', kind: 'escalation', system: 'Slack', resource: 'INV-87990', outcome: 'flagged', entity: 'Nordlight Components', control: 'escalation_latency', run_id: 'run_4402', trace_id: 'tr-4402-06', rationale: 'SLA for routing a flagged exception is 15 minutes.' },
  { id: 'evt_14', ts: '2026-10-07T08:02:15Z', message: 'AP lead opened run #4402 for review', agent: 'dana.reyes@finance', identity: 'dana.reyes@finance', kind: 'auth', outcome: 'ok', run_id: 'run_4402' },
];

function ExampleInner() {
  const [selectedId, setSelectedId] = useState<string>(RUNS[0].id);
  const run = useMemo(() => RUNS.find((r) => r.id === selectedId) ?? RUNS[0], [selectedId]);

  return (
    <Page
      title="Sentinel"
      secondary="Agent run observability — accounts-payable reconciliation"
      maxWidth={1440}
      meta={
        <Stack direction="row" gap={8} wrap>
          <Badge tone={STATUS_TONE[run.status]} dot>
            {run.statusLabel}
          </Badge>
          <Badge tone="outline">Finance · AP automation</Badge>
          <Badge tone="outline">{run.label}</Badge>
        </Stack>
      }
      actions={
        <Stack direction="row" gap={8}>
          <Button variant="outline">Replay run</Button>
          <Button variant="primary">Export report</Button>
        </Stack>
      }
    >
      <Split
        side={260}
        sideFirst
        gap={24}
        aside={
          <div
            style={{
              background: 'var(--surface, #fff)',
              border: '1px solid var(--border, #e7e5e4)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border, #e7e5e4)',
                font: `600 10px ${mono}`,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--fg3, #78716c)',
              }}
            >
              Recent runs
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {RUNS.map((r, i) => {
                const active = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      padding: '11px 14px',
                      border: 'none',
                      borderTop: i === 0 ? 'none' : '1px solid var(--border, #e7e5e4)',
                      background: active ? 'var(--accent-bg, #ecfdf5)' : 'var(--surface, #fff)',
                      borderLeft: active ? '2px solid var(--accent, #10b981)' : '2px solid transparent',
                      cursor: 'pointer',
                      font: 'inherit',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <span style={{ font: `600 12px ${mono}`, color: 'var(--fg1, #1c1917)' }}>{r.label}</span>
                      <span style={{ marginLeft: 'auto' }}>
                        <Badge tone={STATUS_TONE[r.status]} size="sm" dot>
                          {r.statusLabel}
                        </Badge>
                      </span>
                    </span>
                    <span style={{ font: '400 12px var(--font-sans, ui-sans-serif, system-ui, sans-serif)', color: 'var(--fg2, #57534e)' }}>
                      {r.batch}
                    </span>
                    <span style={{ font: `400 11px ${mono}`, color: 'var(--fg3, #78716c)' }}>{r.startedAt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        }
        main={
          <Stack direction="col" gap={24}>
            <StageFlow
              caption="Agent pipeline"
              hint={`${run.label} · ${run.batch}`}
              stages={run.stages}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 320px',
                gap: 24,
                alignItems: 'start',
              }}
            >
              <ExecutionTrace
                title="Execution trace"
                steps={run.steps}
                calls={run.calls}
                duration={run.duration}
                tokens={run.tokens}
                cost={run.cost}
                missing={run.missing}
              />

              <Stack direction="col" gap={24}>
                <InvariantPanel
                  title="Process invariants"
                  invariants={run.invariants}
                  scope={`${run.label} · O-FIN-07`}
                  compact
                />

                <div
                  style={{
                    background: 'var(--surface, #fff)',
                    border: '1px solid var(--border, #e7e5e4)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border, #e7e5e4)',
                      font: `600 10px ${mono}`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--fg3, #78716c)',
                    }}
                  >
                    Run budget
                  </div>
                  <UsageMeter label="Tokens used" used={run.usage.tokensUsed} limit={run.usage.tokensLimit} />
                  <UsageMeter label="Tool calls" used={run.usage.callsUsed} limit={run.usage.callsLimit} divider />
                </div>

                <TaxonomyTree caption="Classification" hint={run.label} nodes={run.taxonomy} />
              </Stack>
            </div>

            <AuditLog
              title="Audit log"
              events={AUDIT_EVENTS}
              defaultRange="7d"
              height={520}
            />
          </Stack>
        }
      />
    </Page>
  );
}

export default function Example() {
  return (
    <ThemedShell>
      <ExampleInner />
    </ThemedShell>
  );
}
