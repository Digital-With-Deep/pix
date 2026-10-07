'use client';

import * as React from 'react';
import {
  Tabs,
  MetricCard,
  DataTable,
  BarChart,
  RateBars,
  CoverageMatrix,
  ExecutionTrace,
  FingerprintDiff,
  Badge,
  Button,
  type DataTableColumn,
  type BarChartSeries,
  type BarChartGroup,
  type RateBarsRow,
  type CoverageMatrixRow,
  type ExecutionTraceStep,
  type FingerprintComponent,
} from '@pix-ui/react';

// ---------------------------------------------------------------------------
// Domain data — a support-agent eval suite ("tier-1 triage"). Every number
// below is illustrative and generated for this example, not live telemetry.
// ---------------------------------------------------------------------------

type ExperimentRow = {
  id: string;
  name: string;
  model: string;
  dataset: string;
  score: number;
  status: 'Passing' | 'At risk' | 'Failing';
  pass: number;
  cost: number;
  runs: number;
};

const EXPERIMENTS: ExperimentRow[] = [
  { id: 'exp-014', name: 'triage-agent@gpt-5.2-v14', model: 'gpt-5.2', dataset: 'support-eval-v9', score: 0.93, status: 'Passing', pass: 96, cost: 4.82, runs: 240 },
  { id: 'exp-013', name: 'triage-agent@gpt-5.2-v13', model: 'gpt-5.2', dataset: 'support-eval-v9', score: 0.91, status: 'Passing', pass: 94, cost: 4.71, runs: 240 },
  { id: 'exp-012', name: 'triage-agent@gpt-5.1-v12', model: 'gpt-5.1', dataset: 'support-eval-v9', score: 0.88, status: 'Passing', pass: 90, cost: 4.35, runs: 240 },
  { id: 'exp-011', name: 'triage-agent@claude-4.6-v11', model: 'claude-4.6-sonnet', dataset: 'support-eval-v9', score: 0.86, status: 'At risk', pass: 85, cost: 3.98, runs: 240 },
  { id: 'exp-010', name: 'triage-agent@gpt-5.1-v10', model: 'gpt-5.1', dataset: 'support-eval-v8', score: 0.82, status: 'At risk', pass: 81, cost: 4.10, runs: 180 },
  { id: 'exp-009', name: 'triage-agent@mistral-l3-v9', model: 'mistral-large-3', dataset: 'support-eval-v8', score: 0.74, status: 'Failing', pass: 69, cost: 2.86, runs: 180 },
  { id: 'exp-008', name: 'triage-agent@gpt-5.0-v8', model: 'gpt-5.0', dataset: 'support-eval-v8', score: 0.79, status: 'At risk', pass: 77, cost: 3.52, runs: 180 },
  { id: 'exp-007', name: 'triage-agent@claude-4.5-v7', model: 'claude-4.5-sonnet', dataset: 'support-eval-v7', score: 0.71, status: 'Failing', pass: 65, cost: 3.21, runs: 150 },
];

const STATUS_TONE: Record<ExperimentRow['status'], 'success' | 'warning' | 'danger'> = {
  Passing: 'success',
  'At risk': 'warning',
  Failing: 'danger',
};

const EXPERIMENT_COLUMNS: DataTableColumn<ExperimentRow>[] = [
  { key: 'name', label: 'Experiment', strong: true },
  { key: 'model', label: 'Model' },
  { key: 'dataset', label: 'Dataset' },
  {
    key: 'score',
    label: 'Score',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => row.score.toFixed(2),
  },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
    render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
  },
  { key: 'runs', label: 'Runs', numeric: true, align: 'right', sortable: true },
  {
    key: 'cost',
    label: 'Cost',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => `$${row.cost.toFixed(2)}`,
  },
];

const SCORE_SERIES: BarChartSeries[] = [
  { label: 'gpt-5.2-v14', color: 'var(--emerald-600, #059669)' },
  { label: 'gpt-5.1-v12', color: 'var(--zinc-400, #a1a1aa)' },
];

const SCORE_DATA: BarChartGroup[] = [
  { label: 'Policy', values: [0.97, 0.9] },
  { label: 'Citation', values: [0.94, 0.86] },
  { label: 'Resolution', values: [0.91, 0.87] },
  { label: 'Tone', values: [0.96, 0.93] },
  { label: 'Escalation', values: [0.88, 0.79] },
  { label: 'Refund calc', values: [0.93, 0.88] },
];

const CATEGORY_RATES: RateBarsRow[] = [
  { name: 'billing_dispute', value: 95, note: 'Agent reverses or credits without checking the dispute window' },
  { name: 'subscription_cancel', value: 98, note: 'Cancels immediately instead of offering the required retention step' },
  { name: 'refund_eligibility', value: 89, note: 'Approves a refund outside the stated policy window' },
  { name: 'escalation_required', value: 76, note: 'Resolves a case that should have been handed to a human', tone: 'danger' },
  { name: 'account_access', value: 99, note: 'Shares or resets access without completing identity verification' },
];

const ASSERTIONS = ['POL', 'CIT', 'TON', 'ESC', 'ACC'];

const COVERAGE_ROWS: CoverageMatrixRow[] = [
  { label: 'O-SUP-01', description: 'Refunds are approved only within the stated policy window', cells: ['tested', 'tested', 'na', 'stale', 'tested'] },
  { label: 'O-SUP-02', description: 'Billing disputes cite the originating charge before any reversal', cells: ['tested', 'tested', 'na', 'na', 'na'] },
  { label: 'O-SUP-03', description: 'Cases past the retention script escalate instead of resolving', cells: ['na', 'na', 'tested', 'stale', 'na'] },
  { label: 'O-SUP-04', description: 'Tone stays within brand voice under an angry or churning customer', cells: ['na', 'na', 'tested', 'na', 'na'] },
  { label: 'O-SUP-05', description: 'Account access changes require a completed identity check', cells: ['none', 'na', 'na', 'na', 'tested'] },
  { label: 'O-SUP-06', description: 'Subscription cancellation always clears the save offer first', cells: ['na', 'none', 'tested', 'na', 'na'] },
];

const TRACE_STEPS: ExecutionTraceStep[] = [
  { name: 'get_ticket', args: { ticket_id: 'ZD-88214' }, duration: '96ms', result: '{ "subject": "Refund for duplicate charge", "customer_id": "c_4471", "opened": "2026-09-30" }' },
  { name: 'lookup_order', args: { customer_id: 'c_4471' }, duration: '72ms', result: '{ "order_id": "o_91823", "charged_at": "2026-07-02", "amount": 128.0, "refund_window_days": 60 }' },
  { name: 'read_policy', args: { topic: 'refund_eligibility' }, duration: '54ms', result: '{ "window_days": 60, "requires_manager_approval_over": 100 }' },
  { name: 'calculate', args: { expression: 'days_between(2026-07-02, 2026-09-30)' }, duration: '8ms', result: '90' },
  {
    name: 'answer',
    args: { resolution: 'approve_refund', amount: 128.0 },
    duration: '—',
    note: 'The charge is 90 days old against a 60-day window, and the amount exceeds the manager-approval threshold. The agent approved it directly without escalating or citing the window.',
  },
];

const MISSING_TOOLS = [
  { name: 'request_manager_approval', note: 'Available for refunds over $100 and never called, despite this refund being outside the policy window entirely.' },
];

const FINGERPRINT_COMPONENTS: FingerprintComponent[] = [
  { name: 'model_id', from: 'gpt-5.1', to: 'gpt-5.2' },
  { name: 'model_version', from: '2026-07-11', to: '2026-09-22' },
  { name: 'H(system_prompt)', from: '9c21af04', to: '9c21af04' },
  { name: 'H(tool_manifest)', from: 'e04b7a31', to: 'f81c3e9d' },
  { name: 'sampling', from: 'temp 0.2 · top_p 1', to: 'temp 0.2 · top_p 1' },
  { name: 'policy_corpus_version', from: 'pv-2026.07', to: 'pv-2026.09' },
];

const TABS = [
  { value: 'experiments', label: 'Experiments' },
  { value: 'scores', label: 'Scores' },
  { value: 'coverage', label: 'Coverage', count: COVERAGE_ROWS.length },
];

const cardStyle: React.CSSProperties = { borderRadius: 4 };

export default function ProofbenchPage() {
  const [tab, setTab] = React.useState('experiments');
  const [selectedId, setSelectedId] = React.useState(EXPERIMENTS[0].id);
  const selected = EXPERIMENTS.find((e) => e.id === selectedId) ?? EXPERIMENTS[0];

  return (
    <div
      style={{
        background: 'var(--bg, #fafafa)',
        minHeight: '100%',
        fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--border, #e4e4e7)',
          background: 'var(--surface, #fff)',
        }}
      >
        <div
          className="mx-auto flex max-w-330 flex-wrap items-center justify-between gap-3 px-6 pt-5"
        >
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
              P
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg1, #18181b)' }}>
              Proofbench
            </span>
            <Badge tone="outline" size="md">
              tier-1 triage
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export report
            </Button>
            <Button variant="filled" size="sm">
              New experiment
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-330 px-6">
          <Tabs tabs={TABS} value={tab} onChange={setTab} style={{ marginTop: 14 }} />
        </div>
      </div>

      <div className="mx-auto max-w-330 px-6 py-6">
        {tab === 'experiments' && (
          <ExperimentsView
            selected={selected}
            onSelect={setSelectedId}
          />
        )}
        {tab === 'scores' && <ScoresView />}
        {tab === 'coverage' && <CoverageView />}
      </div>
    </div>
  );
}

function ExperimentsView({
  selected,
  onSelect,
}: {
  selected: ExperimentRow;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <MetricCard label="Runs today" value="1,860" delta="+420 vs yesterday" deltaType="up" style={cardStyle} />
        <MetricCard
          label="Pass rate"
          value="93%"
          delta="+2 pts vs last week"
          deltaType="up"
          progress={0.93}
          style={cardStyle}
        />
        <MetricCard label="Avg score" value="0.91" delta="best model: gpt-5.2-v14" deltaType="neutral" style={cardStyle} />
        <MetricCard
          label="Cost per run"
          value="$0.020"
          delta="+$0.002 vs v13"
          deltaType="down"
          valueTone="warning"
          style={cardStyle}
        />
      </div>

      <div className="mt-5">
        <DataTable
          caption="Experiments"
          columns={EXPERIMENT_COLUMNS}
          rows={EXPERIMENTS}
          filters={[{ key: 'status', options: ['Passing', 'At risk', 'Failing'] }]}
          initialSort={{ key: 'score', dir: 'desc' }}
          onRowClick={(row) => onSelect(row.id)}
          style={cardStyle}
        />
      </div>

      <div className="mt-6">
        <div
          style={{
            font: '600 11px var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--fg3, #71717a)',
            marginBottom: 10,
          }}
        >
          Selected run — <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', textTransform: 'none' }}>{selected.name}</span>
        </div>
        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-0 flex-[2_1_520px]">
            <ExecutionTrace
              title="Execution trace — refund_eligibility #2281"
              calls={5}
              duration="230ms"
              tokens="1,860 tokens"
              cost="$0.027"
              steps={TRACE_STEPS}
              missing={MISSING_TOOLS}
            />
          </div>
          <div className="min-w-0 flex-[1_1_420px]">
            <FingerprintDiff
              title="Decision logic fingerprint — v13 to v14"
              components={FINGERPRINT_COMPONENTS}
              periodLabels={['v13', 'v14']}
              verdictNote="The tool manifest changed between versions, so v13 coverage does not carry over to v14. The policy corpus also moved — rerun refund_eligibility in full before promoting v14."
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ScoresView() {
  return (
    <div className="flex flex-col gap-5">
      <BarChart
        caption="Score by scorer — current vs previous experiment"
        hint="support-eval-v9"
        summary="1,860 executed · 1,730 passed"
        series={SCORE_SERIES}
        data={SCORE_DATA}
      />
      <RateBars
        caption="Pass rate by ticket category"
        hint="trailing 240 runs"
        threshold={90}
        rows={CATEGORY_RATES}
      />
    </div>
  );
}

function CoverageView() {
  return (
    <div className="flex flex-col gap-4">
      <p style={{ maxWidth: '70ch', fontSize: 13, lineHeight: 1.6, color: 'var(--fg2, #52525b)' }}>
        Assertion coverage for every support-agent control objective. A cell reads{' '}
        <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>stale</span> when the
        objective last passed against a model or policy version that has since moved.
      </p>
      <CoverageMatrix assertions={ASSERTIONS} rows={COVERAGE_ROWS} />
    </div>
  );
}
