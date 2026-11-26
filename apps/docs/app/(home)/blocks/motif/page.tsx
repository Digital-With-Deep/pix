'use client';
import { ThemedShell } from '@/components/ThemedShell';

import * as React from 'react';
import {
  Tabs,
  MetricCard,
  Badge,
  AuditLog,
  PatternList,
  PatternDetail,
  PatternRuleEditor,
  PatternAlertSettings,
  ToastProvider,
  useToast,
  patternAlerts,
  type AuditEvent,
  type PatternFinding,
  type PatternActivity,
  type PatternAlertConfig,
  type PatternEvidence,
  type PatternImpactUnit,
  type PatternRule,
  type PatternRun,
} from '@pix-ui/react';

// ---------------------------------------------------------------------------
// Motif: pattern discovery over an agent's traces. A discovery rule reads the
// traces of a fictional support agent, groups recurring problems into named
// patterns with evidence, and alerts the team. Everything below is
// illustrative demo data; nothing is connected to a live system.
// ---------------------------------------------------------------------------

const NOW = '2026-11-24T09:30:00Z';
const DAYS = ['Nov 11', 'Nov 12', 'Nov 13', 'Nov 14', 'Nov 15', 'Nov 16', 'Nov 17', 'Nov 18', 'Nov 19', 'Nov 20', 'Nov 21', 'Nov 22', 'Nov 23', 'Nov 24'];
const CATEGORIES = ['Tool failure', 'Duplicate action', 'Unsupported claim', 'User friction', 'Cost', 'Latency', 'Unmet need'];

function series(matched: number[], userRatio: number) {
  return DAYS.map((label, i) => ({
    label,
    matched: { traces: matched[i], users: Math.round(matched[i] * userRatio), sessions: Math.round(matched[i] * (userRatio + 0.03)) },
    total: { traces: 480 + i * 6, users: 310 + i * 3, sessions: 350 + i * 4 },
  }));
}

const REFUND_TREND = [8, 11, 9, 14, 22, 31, 28, 36, 41, 39, 44, 52, 47, 30];
const POLICY_TREND = [80, 92, 88, 95, 90, 99, 86, 91, 94, 97, 89, 93, 90, 76];
const LOOP_TREND = [20, 18, 25, 22, 19, 27, 24, 21, 26, 23, 28, 22, 25, 18];
const LOOKUP_TREND = [150, 160, 155, 162, 158, 149, 161, 157, 163, 159, 160, 154, 158, 120];

const INITIAL_PATTERNS: PatternFinding[] = [
  {
    id: 'pat_0141',
    name: 'Refund tool retried after a timeout, issuing two refunds',
    summary:
      'When issue_refund takes longer than 10 seconds the agent treats the call as failed and calls it again. The first call usually completes, so the customer is refunded twice. It affects refunds over $200, which go through the slower manual-review path.',
    severity: 'high',
    status: 'open',
    categories: ['Tool failure', 'Duplicate action'],
    rule: 'Refund agent failures',
    firstSeen: '2026-11-11T08:12:00Z',
    lastSeen: '2026-11-24T09:02:00Z',
    severityRaised: true,
    impact: { traces: 412, users: 87, sessions: 96, share: 0.061, from: '2026-11-11', to: '2026-11-24' },
    trend: REFUND_TREND,
    suggestedFix:
      'Pass an idempotency key to issue_refund and have the retry reuse it, or check get_refund_status before retrying. The retry wrapper in tools/refunds.py retries on any timeout without either.',
    cause: 'confirmed',
    impactSeries: series(REFUND_TREND, 0.21),
    models: [
      { model: 'atlas-large-2', matchShare: 0.82, trafficShare: 0.44 },
      { model: 'atlas-small-2', matchShare: 0.18, trafficShare: 0.56 },
    ],
    evidence: [
      {
        id: 'ev1',
        traceId: 'tr-9f31c2',
        kind: 'problem',
        title: 'Two refunds of 248.00 on one order',
        at: '2026-11-24T09:02:00Z',
        excerpt:
          'tool issue_refund(order="ORD-77120", amount=248.00) -> timeout after 10.0s\nassistant: The refund did not go through. Let me try again.\ntool issue_refund(order="ORD-77120", amount=248.00) -> ok refund_id="RF-5521"',
        highlight: 'The refund did not go through. Let me try again.',
        reason: 'The agent concludes the first call failed from the timeout alone. The ledger shows RF-5520 posted 14 seconds later for the same order.',
      },
      {
        id: 'ev2',
        traceId: 'tr-a04e77',
        kind: 'contrast',
        title: 'Same timeout, status checked first',
        at: '2026-11-22T16:45:00Z',
        excerpt:
          'tool issue_refund(order="ORD-76902", amount=310.00) -> timeout after 10.0s\ntool get_refund_status(order="ORD-76902") -> pending refund_id="RF-5388"\nassistant: Your refund is being processed.',
        highlight: 'tool get_refund_status(order="ORD-76902") -> pending refund_id="RF-5388"',
        reason: 'On the smaller model the agent checks status before retrying and issues one refund.',
      },
    ],
    code: [
      {
        file: 'tools/refunds.py',
        lines: '118-131',
        revision: '4c1e9ab',
        note: 'The retry wrapper retries issue_refund on any timeout and sends no idempotency key.',
      },
    ],
    activity: [
      { id: 'a2', actor: 'discovery', text: 'raised severity from Medium to High', reason: 'Affected users doubled in seven days.', at: '2026-11-21T06:00:00Z' },
      { id: 'a1', actor: 'discovery', text: 'created this pattern', at: '2026-11-11T08:20:00Z' },
    ],
  },
  {
    id: 'pat_0138',
    name: 'Agent quotes a 60-day return window; policy is 30 days',
    summary: 'Answers about returns cite a 60-day window. The policy document in the knowledge base says 30 days.',
    severity: 'medium',
    status: 'investigating',
    categories: ['Unsupported claim'],
    rule: 'Refund agent failures',
    firstSeen: '2026-11-03T15:40:00Z',
    lastSeen: '2026-11-24T07:31:00Z',
    impact: { traces: 1260, users: 940, share: 0.187, estimated: true, from: '2026-11-11', to: '2026-11-24' },
    trend: POLICY_TREND,
    suggestedFix:
      'No retrieved document contains a 60-day window, so the source is not yet known. Check whether the system prompt or an older cached policy page still states 60 days before changing retrieval.',
    cause: 'hypothesis',
    impactSeries: series(POLICY_TREND, 0.75),
    evidence: [
      {
        id: 'ev1',
        traceId: 'tr-71b0de',
        kind: 'problem',
        at: '2026-11-24T07:31:00Z',
        excerpt: 'user: how long do I have to send it back?\nassistant: You have 60 days from delivery to return any item.',
        highlight: 'You have 60 days from delivery to return any item.',
        reason: 'The only retrieved chunk, returns-policy.md, states 30 days.',
      },
    ],
    activity: [{ id: 'a1', actor: 'priya.nair', text: 'set status to Investigating', reason: 'Checking the cached policy page.', at: '2026-11-23T14:10:00Z' }],
  },
  {
    id: 'pat_0127',
    name: 'Users rephrase the same question three or more times',
    summary: 'Sessions about plan changes loop: the user restates the request and the agent repeats its previous answer.',
    severity: 'medium',
    status: 'open',
    categories: ['User friction'],
    rule: 'Default rule',
    firstSeen: '2026-10-29T11:05:00Z',
    lastSeen: '2026-11-23T22:14:00Z',
    reopened: true,
    impact: { traces: 318, sessions: 104, share: 0.047, from: '2026-11-11', to: '2026-11-24' },
    trend: LOOP_TREND,
    suggestedFix: 'The agent has no tool for mid-cycle plan changes, so it restates the billing-cycle rule. Add the change_plan tool to this agent or hand off to a person after the second rephrase.',
    cause: 'hypothesis',
    impactSeries: series(LOOP_TREND, 0.3),
    evidence: [
      {
        id: 'ev1',
        traceId: 'tr-5c88a1',
        kind: 'problem',
        at: '2026-11-23T22:14:00Z',
        excerpt: 'user: I want to switch to annual now, not at renewal\nassistant: Plan changes take effect at the start of your next billing cycle.\nuser: no. switch NOW\nassistant: Plan changes take effect at the start of your next billing cycle.',
        highlight: 'user: no. switch NOW',
        reason: 'Third restatement in the session; the answer is repeated word for word.',
      },
    ],
  },
  {
    id: 'pat_0119',
    name: 'Order lookups run twice per turn',
    summary: 'get_order is called with identical arguments back to back, doubling latency and cost on order questions.',
    severity: 'low',
    status: 'open',
    categories: ['Cost', 'Latency'],
    rule: 'Default rule',
    firstSeen: '2026-10-18T09:00:00Z',
    lastSeen: '2026-11-24T08:47:00Z',
    impact: { traces: 2210, share: 0.33, from: '2026-11-11', to: '2026-11-24' },
    trend: LOOKUP_TREND,
    suggestedFix: 'Cache get_order results within a turn. The planner re-plans after the first tool result and re-issues the same lookup.',
    cause: 'confirmed',
    impactSeries: series(LOOKUP_TREND, 0.6),
    evidence: [{ id: 'ev1', traceId: 'tr-2d19f0', kind: 'problem', at: '2026-11-24T08:47:00Z', excerpt: 'tool get_order(id="ORD-77098") -> ok 412ms\ntool get_order(id="ORD-77098") -> ok 398ms', highlight: 'tool get_order(id="ORD-77098") -> ok 398ms', reason: 'Identical arguments, 6ms apart from the first result.' }],
  },
  {
    id: 'pat_0102',
    name: 'Customers ask for invoices in a language the agent does not offer',
    summary: 'A steady share of billing sessions request Portuguese invoices. Not a failure: an unmet need.',
    severity: 'info',
    status: 'open',
    categories: ['Unmet need'],
    rule: 'Default rule',
    firstSeen: '2026-10-02T13:30:00Z',
    lastSeen: '2026-11-22T17:20:00Z',
    impact: { traces: 96, users: 71, share: 0.014, from: '2026-11-11', to: '2026-11-24' },
    trend: [6, 7, 5, 8, 7, 6, 9, 7, 8, 6, 7, 8, 6, 5],
    evidence: [{ id: 'ev1', traceId: 'tr-e7730b', kind: 'problem', at: '2026-11-22T17:20:00Z', excerpt: 'user: pode enviar a fatura em portugues?\nassistant: I can send invoices in English, Spanish or French.', highlight: 'user: pode enviar a fatura em portugues?' }],
  },
  {
    id: 'pat_0088',
    name: 'Address validation rejects apartment numbers',
    summary: 'validate_address failed on addresses with a unit number. Fixed on Nov 9; no matching traces since.',
    severity: 'medium',
    status: 'closed',
    categories: ['Tool failure'],
    rule: 'Default rule',
    firstSeen: '2026-09-21T10:00:00Z',
    lastSeen: '2026-11-09T12:00:00Z',
    impact: { traces: 0, from: '2026-11-11', to: '2026-11-24' },
    rating: 'useful',
    activity: [{ id: 'a1', actor: 'discovery', text: 'closed this pattern', reason: 'No matching traces in the last 14 days.', at: '2026-11-23T06:00:00Z' }],
  },
];

// The pattern a manual discovery run turns up in this demo.
const DISCOVERED: PatternFinding = {
  id: 'pat_0142',
  name: 'Refund confirmations promise 24 hours; settlement takes 3 to 5 days',
  summary: 'After a refund succeeds the agent tells the customer the money arrives within 24 hours. The payment tool reports 3 to 5 business days.',
  severity: 'medium',
  status: 'open',
  categories: ['Unsupported claim'],
  rule: 'Refund agent failures',
  firstSeen: '2026-11-19T10:22:00Z',
  lastSeen: NOW,
  impact: { traces: 58, users: 51, share: 0.009, estimated: true, from: '2026-11-17', to: '2026-11-24' },
  trend: [0, 0, 0, 0, 0, 0, 0, 0, 4, 7, 9, 12, 14, 12],
  suggestedFix: 'Have the confirmation message read settlement_days from the issue_refund result instead of stating a fixed time.',
  cause: 'hypothesis',
  evidence: [{ id: 'ev1', traceId: 'tr-b61d04', kind: 'problem', at: '2026-11-24T08:11:00Z', excerpt: 'tool issue_refund(order="ORD-77054", amount=64.00) -> ok settlement_days="3-5"\nassistant: Done. You will see the refund within 24 hours.', highlight: 'You will see the refund within 24 hours.', reason: 'The tool result in the same turn says 3 to 5 days.' }],
  activity: [{ id: 'a1', actor: 'discovery', text: 'created this pattern', at: NOW }],
};

// Trace events for the Traces tab: the spans behind each evidence trace, plus background traffic.
function buildEvents(): AuditEvent[] {
  const out: AuditEvent[] = [];
  let seed = 7;
  const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const base = Date.parse(NOW);
  const push = (e: Omit<AuditEvent, 'id'>) => out.push({ id: 'ev-' + String(1000 + out.length), ...e } as AuditEvent);
  const story: [string, number, [string, string, string, string, number][]][] = [
    ['tr-9f31c2', 28, [['tool_call', 'issue_refund', 'error', 'issue_refund timed out after 10.0s for ORD-77120', 10000], ['decision', 'retry_refund', 'flagged', 'Retried issue_refund without checking refund status', 640], ['tool_call', 'issue_refund', 'ok', 'issue_refund ok for ORD-77120, refund RF-5521', 2210]]],
    ['tr-a04e77', 2445, [['tool_call', 'issue_refund', 'error', 'issue_refund timed out after 10.0s for ORD-76902', 10000], ['tool_call', 'get_refund_status', 'ok', 'get_refund_status pending for ORD-76902, refund RF-5388', 180], ['decision', 'respond', 'ok', 'Told the customer the refund is being processed', 520]]],
    ['tr-71b0de', 119, [['read', 'retrieve', 'ok', 'Retrieved returns-policy.md', 96], ['decision', 'respond', 'flagged', 'Stated a 60-day return window', 710]]],
    ['tr-5c88a1', 676, [['decision', 'respond', 'ok', 'Explained plan changes apply next billing cycle', 560], ['decision', 'respond', 'flagged', 'Repeated the previous answer word for word', 540]]],
    ['tr-2d19f0', 43, [['tool_call', 'get_order', 'ok', 'get_order ok for ORD-77098', 412], ['tool_call', 'get_order', 'flagged', 'get_order repeated with identical arguments for ORD-77098', 398]]],
    ['tr-e7730b', 2410, [['decision', 'respond', 'ok', 'Offered invoices in English, Spanish or French', 480]]],
    ['tr-b61d04', 79, [['tool_call', 'issue_refund', 'ok', 'issue_refund ok for ORD-77054, settlement 3-5 days', 1890], ['decision', 'respond', 'flagged', 'Promised the refund within 24 hours', 600]]],
  ];
  story.forEach(([trace, minsAgo, steps]) => steps.forEach(([kind, action, outcome, message, latency], i) =>
    push({ ts: base - minsAgo * 60000 + i * 4000, trace_id: trace, agent: 'refund-assistant', kind, action, outcome, message, latency_ms: latency, system: kind === 'read' ? 'Knowledge base' : kind === 'decision' ? 'Agent runtime' : 'Payments API', model: trace === 'tr-a04e77' ? 'atlas-small-2' : 'atlas-large-2' })));
  const tools = ['get_order', 'get_customer', 'issue_refund', 'get_refund_status', 'retrieve'];
  for (let i = 0; i < 260; i++) {
    const tool = tools[Math.floor(rand() * tools.length)];
    const ok = rand() < 0.93;
    push({ ts: base - Math.floor(rand() * 14 * 864e5), trace_id: 'tr-' + Math.floor(rand() * 0xffffff).toString(16).padStart(6, '0'), agent: rand() < 0.7 ? 'refund-assistant' : 'billing-assistant', kind: 'tool_call', action: tool, outcome: ok ? 'ok' : 'error', message: tool + (ok ? ' ok' : ' failed'), latency_ms: 40 + Math.floor(rand() * 900), system: tool === 'retrieve' ? 'Knowledge base' : 'Payments API', model: rand() < 0.44 ? 'atlas-large-2' : 'atlas-small-2' });
  }
  return out;
}

const SAVED_RULE: PatternRule = {
  id: 'rule_refunds',
  name: 'Refund agent failures',
  scope: 'metadata.agent = "refund-assistant" AND metadata.env = "prod"',
  watchFor: ['Tool failures', 'Duplicate actions', 'Answers that contradict policy'],
  instructions: 'Find or update patterns. Ignore traces from the load-test tenant.',
  lookBack: '7d',
};
const LAST_RUN: PatternRun = {
  state: 'done',
  checkedAt: '2026-11-24T09:18:00Z',
  finishedAt: '2026-11-24T06:00:00Z',
  tracesRead: 1840,
  searches: 23,
  created: 1,
  updated: 4,
  closed: 1,
  gaps: ['37 traces were too large to read in full; only their first 200 spans were checked.'],
};
const INITIAL_ALERTS: PatternAlertConfig = {
  destinations: [
    { id: 'd1', type: 'slack', target: '#agent-alerts' },
    { id: 'd2', type: 'webhook', target: 'https://hooks.example.com/patterns' },
  ],
  minSeverity: 'medium',
  informational: true,
  mention: { enabled: true, who: 'triage-agent', prompt: 'Please investigate this pattern: {{pattern}}. Review the evidence, identify the root cause, and suggest a fix.' },
};

const sans = 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)';
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)' };
const lede: React.CSSProperties = { margin: '0 0 14px', maxWidth: '76ch', fontSize: 13, lineHeight: 1.6, color: 'var(--fg2, #57534e)' };

function alertsSummary(config: PatternAlertConfig) {
  if (!config.destinations.length) return '';
  const slack = config.destinations.find((d) => d.type === 'slack');
  const others = config.destinations.length - (slack ? 1 : 0);
  return [slack ? slack.target : null, others ? others + (others === 1 ? ' other destination' : ' other destinations') : null].filter(Boolean).join(' and ');
}

function MotifInner() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState('patterns');
  const [patterns, setPatterns] = React.useState(INITIAL_PATTERNS);
  const [selected, setSelected] = React.useState('pat_0141');
  const [unit, setUnit] = React.useState<PatternImpactUnit>('traces');
  const [rule, setRule] = React.useState(SAVED_RULE);
  const [run, setRun] = React.useState(LAST_RUN);
  const [alerts, setAlerts] = React.useState(INITIAL_ALERTS);
  const [traceQuery, setTraceQuery] = React.useState('outcome:flagged');
  const events = React.useMemo(() => buildEvents(), []);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const current = patterns.find((p) => p.id === selected);
  const open = patterns.filter((p) => (p.status || 'open') === 'open' || p.status === 'investigating');
  const usersAffected = open.reduce((n, p) => n + ((p.impact && p.impact.users) || 0), 0);

  const update = (id: string, patch: Partial<PatternFinding>, text?: string, reason?: string, actor = 'you') =>
    setPatterns((list) => list.map((p) => {
      if (p.id !== id) return p;
      const entry: PatternActivity | null = text ? { id: 'a' + (p.activity || []).length + '-' + text.length, actor, text, reason, at: NOW } : null;
      return { ...p, ...patch, activity: entry ? [entry, ...(p.activity || [])] : p.activity };
    }));

  // Stand-in for an agent investigation: it re-checks the traces and reports back.
  const investigate = (p: PatternFinding) => {
    update(p.id, { status: 'investigating' }, 'started an investigation');
    toast({ title: 'Investigation started', description: 'Comparing affected traces with similar successful ones.' });
    later(() => {
      update(p.id, { status: 'open' }, 'set status to Open', 'The behaviour still occurs in traces from the last hour.', 'discovery');
      toast({ tone: 'warn', title: 'Still occurring', description: p.name });
    }, 3200);
  };

  const openTrace = (e: PatternEvidence) => { setTraceQuery('trace_id:' + e.traceId); setTab('traces'); };

  // Stand-in for a discovery run: it finishes after a few seconds and reports one new pattern.
  const runNow = () => {
    setRun({ state: 'running', checkedAt: NOW });
    later(() => {
      const isNew = !patterns.some((p) => p.id === DISCOVERED.id);
      setRun({ state: 'done', checkedAt: NOW, finishedAt: NOW, tracesRead: 1902, searches: 26, created: isNew ? 1 : 0, updated: isNew ? 4 : 5, closed: 0 });
      if (isNew) {
        setPatterns((list) => [DISCOVERED, ...list]);
        const sent = patternAlerts(DISCOVERED.severity, alerts);
        toast({
          tone: sent ? 'warn' : 'info',
          title: sent ? 'New pattern, alert sent to ' + alertsSummary(alerts) : 'New pattern, no alert sent',
          description: DISCOVERED.name,
          action: { label: 'Open pattern', onClick: () => { setSelected(DISCOVERED.id); setTab('patterns'); } },
        });
      } else {
        toast({ title: 'Run finished', description: 'No new patterns. Five existing patterns were refreshed.' });
      }
    }, 2600);
  };

  const tabs = [
    { value: 'patterns', label: 'Patterns', count: open.length },
    { value: 'traces', label: 'Traces' },
    { value: 'discovery', label: 'Discovery', dot: run.state === 'running' },
    { value: 'alerts', label: 'Alerts', count: alerts.destinations.length },
  ];

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg, #fafaf9)', fontFamily: sans, color: 'var(--fg1, #1c1917)' }}>
      <div style={{ borderBottom: '1px solid var(--border, #e7e5e4)', background: 'var(--surface, #fff)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <div aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--accent-bg, #ecfdf5)', color: 'var(--accent-fg, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>M</div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Motif</h1>
            <Badge tone="outline" size="md">refund-assistant</Badge>
            <span style={{ flex: 1 }} />
            <span style={{ ...mono, fontSize: 11, color: 'var(--fg2, #57534e)' }}>demo data · 14 days of traces</span>
          </div>
          <Tabs tabs={tabs} value={tab} onChange={setTab} style={{ marginTop: 14 }} />
        </div>
      </div>

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: 24 }}>
        {tab === 'patterns' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <MetricCard label="Open patterns" value={open.length} delta={patterns.filter((p) => p.status === 'investigating').length + ' being investigated'} />
              <MetricCard label="High severity" value={open.filter((p) => p.severity === 'high').length} valueTone={open.some((p) => p.severity === 'high') ? 'danger' : 'default'} delta="Open or investigating" />
              <MetricCard label="Users affected" value={usersAffected.toLocaleString('en-US')} hint="14 days" delta="Across open patterns with a user count" />
              <MetricCard label="Last full investigation" value={run.state === 'running' ? 'Running' : run.finishedAt === NOW ? 'Just now' : '3h ago'} delta={(run.tracesRead ?? 0).toLocaleString('en-US') + ' traces read'} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <p style={{ ...lede, margin: 0, flex: '1 1 320px' }}>Recurring problems found in this agent&apos;s traces. Start with what is severe, widespread and recent, then check the evidence before acting.</p>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg2, #57534e)' }}>
                Count impact by
                <select value={unit} onChange={(e) => setUnit(e.target.value as PatternImpactUnit)} style={{ height: 28, padding: '0 8px', border: '1px solid var(--border-strong, #d6d3d1)', borderRadius: 3, background: 'var(--surface, #fff)', color: 'var(--fg1, #1c1917)', font: `500 12px ${sans}` }}>
                  <option value="traces">Traces</option>
                  <option value="users">Users</option>
                  <option value="sessions">Sessions</option>
                </select>
              </label>
            </div>
            <PatternList patterns={patterns} selectedId={selected} onSelect={setSelected} impactUnit={unit} now={NOW} />
            <PatternDetail
              pattern={current}
              impactUnit={unit}
              href={current ? 'https://motif.example.com/patterns/' + current.id : undefined}
              traceCommand="traces get {{trace}} --format json"
              categoryOptions={CATEGORIES}
              onInvestigate={investigate}
              onCopyPrompt={() => toast({ title: 'Prompt copied', description: 'Paste it into your coding agent to start on a fix.' })}
              onCopyLink={() => toast({ title: 'Link copied' })}
              onStatusChange={(status, reason) => current && update(current.id, { status, reopened: false }, 'set status to ' + status[0].toUpperCase() + status.slice(1), reason)}
              onSeverityChange={(severity, reason) => current && update(current.id, { severity, severityRaised: false }, 'corrected severity to ' + severity, reason)}
              onCategoriesChange={(categories) => current && update(current.id, { categories })}
              onRate={(rating, comment) => current && update(current.id, { rating, ...(rating === 'not_useful' ? { status: 'closed' as const } : {}) }, 'rated this pattern ' + (rating === 'useful' ? 'useful' : 'not useful'), comment)}
              onOpenTrace={openTrace}
              onOpenPeriod={(point) => { setTraceQuery('outcome:flagged'); setTab('traces'); toast({ title: 'Showing flagged events', description: 'A real console would open the logs for ' + point.label + '.' }); }}
              style={{ marginTop: 16 }}
            />
          </>
        )}

        {tab === 'traces' && (
          <>
            <p style={lede}>The events behind the patterns. Evidence links land here filtered to one trace, such as <span style={mono}>trace_id:tr-9f31c2</span>. A pattern is a conclusion; this is the record it was drawn from.</p>
            <AuditLog
              key={traceQuery}
              title="Trace events"
              events={events}
              now={NOW}
              defaultRange="all"
              defaultQuery={traceQuery}
              defaultSort="asc"
              facets={[{ key: 'agent', label: 'Agent' }, { key: 'kind', label: 'Kind' }, { key: 'outcome', label: 'Outcome' }, { key: 'action', label: 'Tool or step' }, { key: 'model', label: 'Model' }]}
              columns={[
                { key: 'trace_id', label: 'Trace', width: 96 },
                { key: 'action', label: 'Step', width: 140 },
                { key: 'message', label: 'Event', flex: true },
                { key: 'outcome', label: 'Outcome', width: 84 },
                { key: 'latency_ms', label: 'Latency', width: 70, align: 'right' },
              ]}
              height={560}
            />
          </>
        )}

        {tab === 'discovery' && (
          <div style={{ maxWidth: 760 }}>
            <p style={lede}>A rule decides which traces are investigated and what to watch for. Press Run now to start an investigation; in this demo it finishes in a few seconds and turns up one new pattern.</p>
            <PatternRuleEditor
              rule={rule}
              onSave={(next) => { setRule(next); toast({ tone: 'truth', title: 'Rule saved', description: next.name }); }}
              onRunNow={runNow}
              run={run}
              now={NOW}
              scopeMatches={6412}
              watchSuggestions={['User complaints', 'Unusually high cost', 'Unusually high latency']}
              alerts={alertsSummary(alerts)}
              onConfigureAlerts={() => setTab('alerts')}
            />
          </div>
        )}

        {tab === 'alerts' && (
          <div style={{ maxWidth: 760 }}>
            <p style={lede}>One alert per pattern when it is created, reopened, or raised to the alert severity. Remove every destination and the next discovery run reports its findings without telling anyone.</p>
            <PatternAlertSettings
              value={alerts}
              onChange={setAlerts}
              channels={['#agent-alerts', '#support-eng', '#incidents']}
              members={['triage-agent', 'priya.nair', 'sam.okafor']}
              previewPattern={current || patterns[0]}
              patternUrl={'motif.example.com/patterns/' + (current || patterns[0]).id}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function MotifExample() {
  return (
    <ThemedShell>
      <ToastProvider placement="bottom-right">
        <MotifInner />
      </ToastProvider>
    </ThemedShell>
  );
}
