'use client';
import { ThemedShell } from '@/components/ThemedShell';
import * as React from 'react';
import {
  ActionHistory,
  ApprovalCard,
  AutonomySetting,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  MetricCard,
  ToastProvider,
  useToast,
  type AgentAction,
  type ApprovalChange,
  type AutonomyLevel,
} from '@pix-ui/react';

// Approvals dogfoods PIX: an approvals desk where several agents queue the
// actions they want to take. A reviewer approves, edits or rejects each one,
// bulk-approves the low-risk ones behind a confirmation dialog, undoes an
// approved action while its window is open, and sets how much one task may
// run on its own. Every surface is a real @pix-ui/react component styled only
// with PIX tokens, so it flips with the theme. Time is a fixed anchor plus
// seconds since mount, so the static export and the client agree on first
// paint — no Date.now() or Math.random() here.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui)';

const ICON = {
  check: 'M4.5 12.75l6 6 9-13.5',
  shield:
    'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
};

const REVIEWER = 'Avery Cole';
const ANCHOR = Date.UTC(2026, 10, 24, 14, 30, 0); // fixed clock anchor: Nov 24, 14:30 UTC
const MIN = 60_000;

type Risk = 'low' | 'medium' | 'high' | 'critical';
type Status = 'pending' | 'approved' | 'rejected';

interface Request {
  key: string;
  title: string;
  action: string;
  agent: string;
  target: string;
  reason: string;
  risk: Risk;
  reversible: boolean;
  changes: ApprovalChange[];
  evidence: string[];
}

interface Decision {
  status: Exclude<Status, 'pending'>;
  at: number;
  reason?: string;
}

const REQUESTS: Request[] = [
  {
    key: 'req_5101',
    title: 'Waive a late fee',
    action: 'billing.waive_fee',
    agent: 'billing-agent',
    target: 'INV-88213 · Calder Freightworks',
    reason: 'First late payment in four years, and the customer paid two days after the due date.',
    risk: 'low',
    reversible: true,
    changes: [{ field: 'Late fee', key: 'fee', before: '$45.00', after: '$0.00' }],
    evidence: ['Payment history', 'Fee policy 2.4'],
  },
  {
    key: 'req_5102',
    title: 'Pay a vendor invoice early',
    action: 'payables.schedule_payment',
    agent: 'vendor-agent',
    target: 'Vendor 2207 · Oakline Packaging',
    reason: 'Paying by Nov 26 earns the 2% early payment discount in the contract, and cash is above the weekly floor.',
    risk: 'medium',
    reversible: false,
    changes: [
      { field: 'Payment date', key: 'date', before: '2026-12-15', after: '2026-11-26' },
      { field: 'Amount', key: 'amount', before: '$12,480.00', after: '$12,230.40', editable: false },
    ],
    evidence: ['Contract OP-2207, clause 7', 'Cash position, Nov 24'],
  },
  {
    key: 'req_5103',
    title: 'Grant admin access',
    action: 'access.set_role',
    agent: 'access-agent',
    target: 'user k.patel · Northbeam workspace',
    reason: 'Requested by the finance lead for the year-end close. Access expires on its own after five days.',
    risk: 'high',
    reversible: true,
    changes: [
      { field: 'Role', key: 'role', before: 'Viewer', after: 'Admin', editable: false },
      { field: 'Expires', key: 'expires', before: 'Never', after: '2026-11-29' },
    ],
    evidence: ['Access request AR-3318'],
  },
  {
    key: 'req_5104',
    title: 'Extend a quote',
    action: 'sales.extend_quote',
    agent: 'billing-agent',
    target: 'Quote Q-7781 · Brightwater Farms',
    reason: 'The customer asked for two more weeks to get budget sign-off. Prices in the quote are unchanged.',
    risk: 'low',
    reversible: true,
    changes: [{ field: 'Valid until', key: 'until', before: '2026-11-25', after: '2026-12-09' }],
    evidence: ['Customer email, Nov 23'],
  },
  {
    key: 'req_5105',
    title: 'Send a service notice',
    action: 'comms.send_notice',
    agent: 'comms-agent',
    target: '312 customers · Pacific region',
    reason: 'Two depots are closed by flooding. Customers with deliveries this week should hear it from us first.',
    risk: 'medium',
    reversible: false,
    changes: [
      { field: 'Audience', before: null, after: '312 customers', editable: false },
      { field: 'Subject', key: 'subject', before: null, after: 'Your delivery this week' },
    ],
    evidence: ['Depot status board', 'Notice template N-12'],
  },
  {
    key: 'req_5106',
    title: 'Close a duplicate account',
    action: 'accounts.close',
    agent: 'billing-agent',
    target: 'ACC-44019 · Calder Freightworks',
    reason: 'Same tax id and billing address as ACC-30122, with no orders in 14 months.',
    risk: 'critical',
    reversible: false,
    changes: [
      { field: 'Status', before: 'Active', after: 'Closed', editable: false },
      { field: 'Open balance', before: '$0.00', after: '$0.00', editable: false },
    ],
    evidence: ['Duplicate check D-118', 'Order history'],
  },
];

const SEED_ACTIONS: AgentAction[] = [
  { id: 'act_901', at: ANCHOR - 52 * MIN, agent: 'billing-agent', action: 'Applied a customer payment', target: 'INV-88190', status: 'done', undoUntil: ANCHOR - 22 * MIN, detail: 'Approved by Avery Cole' },
  { id: 'act_902', at: ANCHOR - 38 * MIN, agent: 'comms-agent', action: 'Sent a delivery update', target: '48 customers', status: 'done', detail: 'Ran on its own under the comms policy' },
  { id: 'act_903', at: ANCHOR - 25 * MIN, agent: 'access-agent', action: 'Removed a stale API token', target: 'tok_29ac', status: 'undone', detail: 'Undone by Avery Cole' },
  { id: 'act_904', at: ANCHOR - 6 * MIN, agent: 'vendor-agent', action: 'Placed a payment hold', target: 'Vendor 1180', status: 'done', undoUntil: ANCHOR + 14 * MIN, detail: 'Bank details changed without a signed form' },
  { id: 'act_905', at: ANCHOR - 3 * MIN, agent: 'billing-agent', action: 'Retried a card charge', target: 'INV-88207', status: 'failed', detail: 'The card was declined again' },
];

const utc = (ms: number) => `${new Date(ms).toISOString().slice(11, 16)} UTC`;

function ApprovalsInner() {
  const { toast } = useToast();
  const [elapsed, setElapsed] = React.useState(0);
  const [decisions, setDecisions] = React.useState<Record<string, Decision>>({});
  const [actions, setActions] = React.useState<AgentAction[]>(SEED_ACTIONS);
  const [showDecided, setShowDecided] = React.useState(true);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [autonomy, setAutonomy] = React.useState<AutonomyLevel>('confirm');

  React.useEffect(() => {
    const t = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const now = ANCHOR + elapsed * 1000;

  const statusOf = (key: string): Status => decisions[key]?.status ?? 'pending';
  const pending = REQUESTS.filter((r) => statusOf(r.key) === 'pending');
  const lowRisk = pending.filter((r) => r.risk === 'low' && r.reversible);
  const approvedN = Object.values(decisions).filter((d) => d.status === 'approved').length;
  const rejectedN = Object.values(decisions).filter((d) => d.status === 'rejected').length;

  const undo = React.useCallback(
    (id: string) => {
      setActions((all) => all.map((a) => (a.id === id ? { ...a, status: 'undone', detail: `Undone by ${REVIEWER}` } : a)));
      toast({ tone: 'info', title: 'Action undone', description: 'The agent reversed it and logged the undo.' });
    },
    [toast],
  );

  const record = (req: Request, edited: boolean) => {
    const id = `act_${req.key.slice(4)}`;
    setActions((all) => [
      ...all,
      {
        id,
        at: now,
        agent: req.agent,
        action: req.title,
        target: req.target.split(' · ')[0],
        status: 'done',
        undoUntil: req.reversible ? now + 10 * MIN : undefined,
        detail: `Approved${edited ? ' with edits' : ''} by ${REVIEWER}`,
      },
    ]);
    return id;
  };

  const approve = (req: Request, edits?: Record<string, string>) => {
    setDecisions((d) => ({ ...d, [req.key]: { status: 'approved', at: now } }));
    const id = record(req, Boolean(edits));
    const changed = edits ? Object.keys(edits).length : 0;
    toast({
      tone: 'truth',
      title: `Approved: ${req.title.toLowerCase()}`,
      description: changed ? `${req.agent} ran it with ${changed} edited ${changed === 1 ? 'value' : 'values'}.` : `${req.agent} ran it as proposed.`,
      action: req.reversible ? { label: 'Undo', onClick: () => undo(id) } : undefined,
      duration: 6000,
    });
  };

  const reject = (req: Request, reason?: string) => {
    setDecisions((d) => ({ ...d, [req.key]: { status: 'rejected', at: now, reason } }));
    toast({ tone: 'warn', title: `Rejected: ${req.title.toLowerCase()}`, description: reason ? `Sent back to ${req.agent} with your reason.` : `${req.agent} will not retry it.` });
  };

  const bulkApprove = () => {
    const batch = lowRisk;
    setDecisions((d) => {
      const next = { ...d };
      for (const r of batch) next[r.key] = { status: 'approved', at: now };
      return next;
    });
    for (const r of batch) record(r, false);
    setBulkOpen(false);
    toast({ tone: 'truth', title: `Approved ${batch.length} low-risk ${batch.length === 1 ? 'request' : 'requests'}`, description: 'Each one can be undone from the action history for 10 minutes.' });
  };

  const changeAutonomy = (level: AutonomyLevel) => {
    setAutonomy(level);
    const words: Record<AutonomyLevel, string> = {
      suggest: 'billing-agent will only suggest fee waivers.',
      propose: 'billing-agent will plan fee waivers and wait for you to start them.',
      confirm: 'billing-agent will ask before each fee waiver.',
      autonomous: 'billing-agent will waive fees under $100 on its own and log each one here.',
    };
    toast({ tone: level === 'autonomous' ? 'warn' : 'info', title: 'Autonomy updated', description: words[level] });
  };

  const queue = REQUESTS.filter((r) => showDecided || statusOf(r.key) === 'pending');

  return (
    <div style={{ background: 'var(--bg, #ffffff)', color: ink, minHeight: 'calc(100dvh - 3.5rem)', font: `14px ${sans}` }}>
      {/* Command bar */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderBottom: `1px solid ${line}`, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Approvals</div>
          <div style={{ fontSize: 12, color: faint }}>Northbeam Logistics · four agents</div>
        </div>
        <Badge tone={pending.length ? 'warning' : 'success'} dot>
          {pending.length ? `${pending.length} waiting` : 'All caught up'}
        </Badge>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Checkbox label="Show decided" checked={showDecided} onChange={setShowDecided} />
          <Dialog
            open={bulkOpen}
            onOpenChange={setBulkOpen}
            size="sm"
            title={`Approve ${lowRisk.length} low-risk ${lowRisk.length === 1 ? 'request' : 'requests'}?`}
            description="Each one runs right away as proposed. You can undo them from the action history for 10 minutes."
            footer={
              <>
                <Button variant="outline" size="sm" onClick={() => setBulkOpen(false)}>Review one by one</Button>
                <Button variant="filled" size="sm" iconPath={ICON.check} onClick={bulkApprove}>Approve {lowRisk.length}</Button>
              </>
            }
          >
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
              {lowRisk.map((r) => (
                <li key={r.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 10px', borderRadius: 6, border: `1px solid ${line}`, background: surfaceAlt }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</span>
                  <span style={{ font: `12px ${mono}`, color: muted }}>{r.target.split(' · ')[0]}</span>
                </li>
              ))}
            </ul>
          </Dialog>
          <Button variant="filled" iconPath={ICON.check} disabled={!lowRisk.length} onClick={() => setBulkOpen(true)}>
            Approve low risk ({lowRisk.length})
          </Button>
        </div>
      </header>

      {/* Metrics */}
      <div className="approvals-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, padding: '16px 24px 4px' }}>
        <MetricCard label="Waiting" value={pending.length} hint="now" delta={pending.some((r) => r.risk === 'critical') ? 'includes a critical request' : 'none critical'} deltaType={pending.some((r) => r.risk === 'critical') ? 'down' : 'neutral'} valueTone={pending.length ? 'warning' : 'success'} />
        <MetricCard label="Approved" value={approvedN} hint="this session" delta={`${rejectedN} rejected`} deltaType="neutral" valueTone={approvedN ? 'success' : 'default'} />
        <MetricCard label="Undo windows open" value={actions.filter((a) => a.status === 'done' && typeof a.undoUntil === 'number' && a.undoUntil > now).length} hint="10 min each" />
        <MetricCard label="Clock" value={utc(now)} hint="Nov 24" delta="all times in UTC" deltaType="neutral" />
      </div>

      <div className="approvals-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20, padding: '16px 24px 32px', alignItems: 'start' }}>
        {/* Queue */}
        <section aria-label="Approval queue" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, font: `650 15px ${sans}` }}>Queue</h2>
            <span style={{ font: `12px ${mono}`, color: faint }}>{queue.length} shown</span>
          </div>
          {queue.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: faint, border: `1px dashed ${line}`, borderRadius: 10 }}>
              Nothing waiting. Decided requests are hidden.
            </div>
          ) : null}
          {queue.map((r) => {
            const d = decisions[r.key];
            return (
              <ApprovalCard
                key={r.key}
                title={r.title}
                action={r.action}
                agent={r.agent}
                target={r.target}
                reason={r.reason}
                risk={r.risk}
                reversible={r.reversible}
                changes={r.changes}
                evidence={r.evidence}
                status={d?.status ?? 'pending'}
                decidedBy={d ? REVIEWER : undefined}
                decidedAt={d ? utc(d.at) : undefined}
                rejectReason={d?.reason}
                requireRejectReason={r.risk === 'high' || r.risk === 'critical'}
                onApprove={() => approve(r)}
                onEdit={(edits) => approve(r, edits)}
                onReject={(reason) => reject(r, reason)}
              />
            );
          })}
        </section>

        {/* Side rail */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Card title="Autonomy" description="How much billing-agent may do without asking you." padding="md">
            <AutonomySetting task="late fee waivers under $100" value={autonomy} onChange={changeAutonomy} />
          </Card>
          <ActionHistory actions={actions} now={now} onUndo={undo} />
          <p style={{ margin: 0, display: 'flex', gap: 8, fontSize: 12.5, lineHeight: 1.55, color: muted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d={ICON.shield} />
            </svg>
            High and critical requests need a written reason to reject. Actions that cannot be undone never show in bulk approve.
          </p>
        </aside>
      </div>

      <style>{`
        @media (min-width: 760px){ .approvals-metrics{ grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (min-width: 1100px){ .approvals-grid{ grid-template-columns: minmax(0, 1fr) 400px !important; } }
      `}</style>
    </div>
  );
}

export default function ApprovalsExample() {
  return (
    <ThemedShell>
      <ToastProvider placement="bottom-right">
        <ApprovalsInner />
      </ToastProvider>
    </ThemedShell>
  );
}
