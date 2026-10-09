'use client';
import { ThemedShell } from '@/components/ThemedShell';
import * as React from 'react';
import {
  AIResponse,
  AuditLog,
  Avatar,
  Badge,
  Button,
  ExecutionTrace,
  InvariantPanel,
  MetricCard,
  Tabs,
  type AuditEvent,
  type BadgeProps,
  type ExecutionTraceStep,
  type Invariant,
} from '@pix-ui/react';

// Relay dogfoods PIX: a human-in-the-loop approval inbox where an autonomous
// support agent ("Operator") drafts outbound actions — refunds, account
// changes, emails, data deletions — that a person must approve before they
// execute. Every surface is a real @pix-ui/react component styled only with
// PIX tokens, so it flips with the theme. The queue is live: wait timers tick,
// decision-latency metrics recompute as you act, and you can simulate new
// requests arriving. Timing is tracked in seconds-since-mount (starting at 0),
// so static export and the client agree on first paint — no Date.now() here.

const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surface = 'var(--surface, #ffffff)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';
const truth = 'var(--truth, #059669)';
const fault = 'var(--fault, #d97706)';
const claim = 'var(--claim, #dc2626)';

const ICON = {
  check: 'M4.5 12.75l6 6 9-13.5',
  x: 'M6 18L18 6M6 6l12 12',
  pencil:
    'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z',
  bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  inbox:
    'M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z',
};

type Risk = 'low' | 'medium' | 'high' | 'critical';
const RISK_TONE: Record<Risk, BadgeProps['tone']> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

interface PendingItem {
  key: string;
  requester: string;
  channel: 'Email' | 'Live chat' | 'API' | 'Phone';
  subject: string;
  snippet: string;
  context: string;
  risk: Risk;
  actionKind: string;
  model: string;
  confidence: number;
  proposal: string;
  reasoning: string;
  steps: ExecutionTraceStep[];
  calls: number;
  duration: string;
  tokens: string;
  cost: string;
  checks: Invariant[];
  slaSec: number;
  baseAge: number; // seconds already waited at t=0
  spawnAt: number; // `now` value when it entered the queue (0 for seeded)
}

type Decision = 'approved' | 'changes' | 'rejected';

interface DecidedItem {
  key: string;
  subject: string;
  requester: string;
  actionKind: string;
  decision: Decision;
  reviewer: string;
  latencySec: number;
  feedback: string;
  ts: number;
}

const REVIEWER = 'Avery Cole';
const BASE_TS = 1_760_900_000_000; // fixed epoch anchor for the activity log

// --- seed queue ------------------------------------------------------------
const SEED: PendingItem[] = [
  {
    key: 'req_2041',
    requester: 'Priya Natarajan',
    channel: 'Email',
    subject: 'Refund for duplicate charge',
    snippet: 'I was billed twice for the October plan — order 8841 and 8842.',
    context:
      'Customer reports two identical charges of $214.00 on Oct 3 (orders 8841, 8842). Asks for one to be reversed. Pro plan, customer since 2023, no prior refunds.',
    risk: 'high',
    actionKind: 'Refund',
    model: 'operator-2',
    confidence: 0.94,
    proposal:
      'Issue a $214.00 refund against order 8842 (the duplicate) to the Visa ending 4471. Reply to Priya confirming the reversal, 5–7 business days, and that order 8841 stays active.',
    reasoning:
      'Matched both charges to the same payment method and SKU within a 40s window — consistent with a double-submit.\nVerified 8841 already fulfilled, so 8842 is the safe one to reverse.\nAmount is above the $200 auto-approve ceiling, so routing to a human.',
    steps: [
      { name: 'billing.lookup', args: { customer: 'cus_8841' }, duration: '120ms', result: 'two charges, $214.00 each, 38s apart' },
      { name: 'orders.compare', args: { a: '8841', b: '8842' }, duration: '64ms', result: 'identical line items; 8841 fulfilled' },
      { name: 'policy.check', args: { kind: 'refund', amount: 214 }, duration: '31ms', result: 'over $200 → human approval required' },
      { name: 'draft.reply', duration: '0.9s', result: 'refund confirmation drafted' },
    ],
    calls: 4,
    duration: '1.4s',
    tokens: '2,104 tokens',
    cost: '$0.021',
    checks: [
      { name: 'amount_within_ceiling', state: 'fail', catches: 'Action exceeds the agent auto-approve limit', detail: '$214.00 is above the $200.00 ceiling — human sign-off required.' },
      { name: 'duplicate_confirmed', state: 'pass', catches: 'The charge being reversed is genuinely a duplicate' },
      { name: 'payment_method_on_file', state: 'pass', catches: 'Refund target matches the original payment method' },
      { name: 'no_prior_reversal', state: 'pass', catches: 'No earlier refund on this order' },
    ],
    slaSec: 300,
    baseAge: 192,
    spawnAt: 0,
  },
  {
    key: 'req_2042',
    requester: 'Marcus Webb',
    channel: 'Live chat',
    subject: 'Reset 2FA and change account email',
    snippet: 'Lost my phone, need my email and authenticator reset so I can log in.',
    context:
      'Request to change the account email to a new domain and disable the current 2FA device. Login attempts from a new country in the last hour. Identity answers partially matched (2 of 3).',
    risk: 'critical',
    actionKind: 'Account change',
    model: 'operator-2',
    confidence: 0.58,
    proposal:
      'Update the account email to m.webb@fastmail.example and remove the registered authenticator so the customer can re-enroll.',
    reasoning:
      'Identity verification only partially passed (2 of 3) and the request pairs an email change with a 2FA reset — the classic takeover pattern.\nSignals are mixed, so I am surfacing this rather than acting.',
    steps: [
      { name: 'identity.verify', args: { answers: 3 }, duration: '210ms', result: '2 of 3 matched', note: 'Third answer failed — date of birth mismatch' },
      { name: 'risk.signals', duration: '88ms', result: 'new-country login 42m ago; new device', flagged: true },
      { name: 'policy.check', args: { kind: 'account_change' }, duration: '29ms', result: 'email + 2FA reset together → escalate' },
    ],
    calls: 3,
    duration: '0.9s',
    tokens: '1,460 tokens',
    cost: '$0.015',
    checks: [
      { name: 'identity_verified', state: 'fail', catches: 'Requester proved ownership of the account', detail: 'Only 2 of 3 identity checks passed; date of birth did not match.' },
      { name: 'no_takeover_signals', state: 'fail', catches: 'No concurrent account-takeover indicators', detail: 'New-country login 42 minutes ago on an unrecognized device.' },
      { name: 'change_is_reversible', state: 'pass', catches: 'The change can be rolled back if disputed' },
    ],
    slaSec: 240,
    baseAge: 86,
    spawnAt: 0,
  },
  {
    key: 'req_2043',
    requester: 'Lena Osei',
    channel: 'Email',
    subject: 'Apology and service credit after outage',
    snippet: 'Our workspace was down for most of Tuesday and it cost us a launch.',
    context:
      'Enterprise customer affected by the Oct 7 regional outage (4h12m). Asking for acknowledgement. Agent proposes a goodwill credit within the standard band.',
    risk: 'medium',
    actionKind: 'Outbound email',
    model: 'operator-2',
    confidence: 0.88,
    proposal:
      'Send an apology acknowledging the 4h12m outage, confirm root cause is resolved, and apply a one-month 15% service credit ($340) to the account.',
    reasoning:
      'Outage is confirmed in the incident record and the account was in the affected region.\nCredit of 15% sits inside the goodwill band for a confirmed SLA miss, but outbound enterprise mail needs a human check on tone.',
    steps: [
      { name: 'incident.lookup', args: { id: 'INC-2207' }, duration: '95ms', result: 'confirmed, 4h12m, region us-east-1' },
      { name: 'account.region', duration: '40ms', result: 'affected' },
      { name: 'credit.band', args: { tier: 'enterprise' }, duration: '22ms', result: '10–20% within policy' },
      { name: 'draft.email', duration: '1.1s', result: 'apology + credit drafted' },
    ],
    calls: 4,
    duration: '1.3s',
    tokens: '1,980 tokens',
    cost: '$0.019',
    checks: [
      { name: 'outage_confirmed', state: 'pass', catches: 'The incident being apologized for actually occurred' },
      { name: 'credit_within_band', state: 'pass', catches: 'Goodwill credit sits inside the policy band' },
      { name: 'tone_review', state: 'not_applicable', catches: 'Outbound enterprise mail reviewed for tone' },
    ],
    slaSec: 600,
    baseAge: 410,
    spawnAt: 0,
  },
  {
    key: 'req_2044',
    requester: 'Tomás Rivera',
    channel: 'API',
    subject: 'Erase account data (GDPR)',
    snippet: 'Please delete all my personal data under article 17.',
    context:
      'Verified right-to-erasure request. Agent assembled the deletion plan across 6 systems. Irreversible once executed, so it routes to a human.',
    risk: 'high',
    actionKind: 'Data deletion',
    model: 'operator-2',
    confidence: 0.91,
    proposal:
      'Execute the erasure plan across 6 systems (app DB, warehouse, logs, backups queue, billing, support). Retain the legally required billing record for 7 years in a sealed hold, and email confirmation when complete.',
    reasoning:
      'Erasure request is verified and in scope.\nPlan correctly carves out the billing record under the legal-retention exception.\nDeletion is irreversible, so a human confirms before it runs.',
    steps: [
      { name: 'erasure.verify', duration: '140ms', result: 'request verified, identity confirmed' },
      { name: 'data.map', args: { subject: 'usr_5521' }, duration: '320ms', result: '6 systems, 1 legal-hold exception' },
      { name: 'policy.check', args: { kind: 'deletion' }, duration: '33ms', result: 'irreversible → human approval required' },
    ],
    calls: 3,
    duration: '0.8s',
    tokens: '1,310 tokens',
    cost: '$0.013',
    checks: [
      { name: 'request_verified', state: 'pass', catches: 'The erasure request is genuine and in scope' },
      { name: 'legal_hold_respected', state: 'pass', catches: 'Records under legal retention are excluded' },
      { name: 'irreversible_action', state: 'fail', catches: 'Irreversible actions require explicit human approval', detail: 'Deletion cannot be undone once executed.' },
    ],
    slaSec: 480,
    baseAge: 44,
    spawnAt: 0,
  },
];

// --- seed activity log -----------------------------------------------------
const SEED_HISTORY: DecidedItem[] = [
  { key: 'req_2039', subject: 'Refund for late delivery', requester: 'Aiko Tanaka', actionKind: 'Refund', decision: 'approved', reviewer: REVIEWER, latencySec: 73, feedback: 'Within policy, clean duplicate.', ts: BASE_TS - 180_000 },
  { key: 'req_2038', subject: 'Welcome-back outreach', requester: 'Sven Berg', actionKind: 'Outbound email', decision: 'approved', reviewer: 'Dana Lee', latencySec: 141, feedback: 'Tone good, sent.', ts: BASE_TS - 420_000 },
  { key: 'req_2037', subject: 'Change billing contact', requester: 'Nadia Rahman', actionKind: 'Account change', decision: 'changes', reviewer: REVIEWER, latencySec: 262, feedback: 'Confirm the new contact over a second channel first.', ts: BASE_TS - 900_000 },
  { key: 'req_2036', subject: 'Refund $1,290 — disputed', requester: 'Rafael Cruz', actionKind: 'Refund', decision: 'rejected', reviewer: 'Dana Lee', latencySec: 318, feedback: 'Charge is valid; dispute lacks evidence. Declined.', ts: BASE_TS - 1_500_000 },
  { key: 'req_2035', subject: 'Escalate to tier 2', requester: 'Nia Clarke', actionKind: 'Escalation', decision: 'approved', reviewer: REVIEWER, latencySec: 54, feedback: 'Correct call, routed.', ts: BASE_TS - 2_100_000 },
  { key: 'req_2034', subject: 'Erase account data', requester: 'Omar Haddad', actionKind: 'Data deletion', decision: 'rejected', reviewer: 'Dana Lee', latencySec: 205, feedback: 'Open invoice on the account — resolve before erasure.', ts: BASE_TS - 3_000_000 },
];

// --- pool used by "Simulate incoming" --------------------------------------
const POOL: Omit<PendingItem, 'key' | 'spawnAt' | 'baseAge'>[] = [
  {
    requester: 'Chen Wu', channel: 'Live chat', subject: 'Refund partial — damaged item',
    snippet: 'One of two monitors arrived cracked.', context: 'Two-unit order, one damaged on arrival with photo attached. Agent proposes a 50% refund on the order.',
    risk: 'medium', actionKind: 'Refund', model: 'operator-2', confidence: 0.86,
    proposal: 'Refund $64.00 (one of two units) to the original card and send a prepaid return label for the damaged monitor.',
    reasoning: 'Damage photo attached and matches the SKU.\nPartial refund keeps the working unit; amount is modest but still over the chat auto-approve limit.',
    steps: [
      { name: 'order.lookup', duration: '88ms', result: '2 units, $128.00' },
      { name: 'attachment.scan', duration: '240ms', result: 'photo: visible crack, matches SKU' },
      { name: 'policy.check', args: { kind: 'refund', amount: 64 }, duration: '20ms', result: 'chat channel → human approval' },
    ],
    calls: 3, duration: '0.7s', tokens: '1,120 tokens', cost: '$0.011',
    checks: [
      { name: 'evidence_attached', state: 'pass', catches: 'Claim is backed by evidence' },
      { name: 'amount_within_ceiling', state: 'fail', catches: 'Within the channel auto-approve limit', detail: 'Chat limit is $25; this is $64.00.' },
    ],
    slaSec: 300,
  },
  {
    requester: 'Isla Grant', channel: 'Email', subject: 'Renewal offer before expiry',
    snippet: '', context: 'Account renews in 9 days. Agent drafts a proactive renewal note with a standard loyalty discount.',
    risk: 'low', actionKind: 'Outbound email', model: 'operator-2', confidence: 0.92,
    proposal: 'Send a renewal reminder offering the standard 10% loyalty discount if renewed before the expiry date.',
    reasoning: 'Discount is the standard loyalty rate and the account is in good standing.\nLow risk, but outbound mail is held for a quick human glance.',
    steps: [
      { name: 'account.status', duration: '46ms', result: 'good standing, renews in 9d' },
      { name: 'discount.band', duration: '18ms', result: '10% standard' },
      { name: 'draft.email', duration: '0.8s', result: 'renewal note drafted' },
    ],
    calls: 3, duration: '0.9s', tokens: '980 tokens', cost: '$0.009',
    checks: [
      { name: 'discount_within_band', state: 'pass', catches: 'Offer sits inside the approved discount band' },
      { name: 'account_in_good_standing', state: 'pass', catches: 'No open disputes or overdue balance' },
    ],
    slaSec: 900,
  },
  {
    requester: 'Victor Alonso', channel: 'API', subject: 'Downgrade plan to Starter',
    snippet: 'Please move us to the Starter plan at the next cycle.', context: 'Self-serve downgrade request via API. Agent proposes scheduling it for the next billing cycle to avoid proration surprises.',
    risk: 'medium', actionKind: 'Account change', model: 'operator-2', confidence: 0.9,
    proposal: 'Schedule a downgrade from Pro to Starter effective at the next billing cycle, and email a summary of the features that will be lost.',
    reasoning: 'Downgrade is reversible and self-requested.\nScheduling at cycle end avoids a mid-cycle proration charge; flagged because it changes entitlements.',
    steps: [
      { name: 'plan.diff', args: { from: 'pro', to: 'starter' }, duration: '72ms', result: '4 features removed' },
      { name: 'billing.preview', duration: '110ms', result: 'no proration if scheduled at cycle end' },
      { name: 'policy.check', args: { kind: 'account_change' }, duration: '24ms', result: 'entitlement change → human approval' },
    ],
    calls: 3, duration: '0.8s', tokens: '1,040 tokens', cost: '$0.010',
    checks: [
      { name: 'change_is_reversible', state: 'pass', catches: 'The customer can re-upgrade freely' },
      { name: 'no_data_loss', state: 'pass', catches: 'No records are deleted by the change' },
    ],
    slaSec: 600,
  },
  {
    requester: 'Hana Kim', channel: 'Phone', subject: 'Escalate billing dispute to tier 2',
    snippet: 'Third time asking about the same wrong invoice.', context: 'Repeat contact on an unresolved invoice dispute. Agent proposes escalation to a tier-2 specialist with the history attached.',
    risk: 'high', actionKind: 'Escalation', model: 'operator-2', confidence: 0.83,
    proposal: 'Escalate to a tier-2 billing specialist, attach the three prior contacts and the disputed invoice, and tell the customer to expect a call within one business day.',
    reasoning: 'Three contacts on the same issue meets the repeat-contact escalation bar.\nAgent cannot resolve a contested invoice directly, so a specialist takes it.',
    steps: [
      { name: 'history.lookup', duration: '96ms', result: '3 contacts, same invoice INV-5521' },
      { name: 'dispute.status', duration: '58ms', result: 'open, unresolved 6 days' },
      { name: 'policy.check', args: { kind: 'escalation' }, duration: '21ms', result: 'repeat contact → escalate' },
    ],
    calls: 3, duration: '0.7s', tokens: '1,200 tokens', cost: '$0.012',
    checks: [
      { name: 'escalation_threshold_met', state: 'pass', catches: 'Repeat-contact bar for escalation is met' },
      { name: 'history_attached', state: 'pass', catches: 'Prior context is attached for the specialist' },
    ],
    slaSec: 360,
  },
];

function waitLabel(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${(s % 60).toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`;
}

function median(ns: number[]): number {
  if (!ns.length) return 0;
  const s = [...ns].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

const TOAST_COLOR: Record<string, string> = {
  success: truth,
  warning: fault,
  danger: claim,
  info: 'var(--accent, #2563eb)',
  neutral: 'var(--fg3, #78716c)',
};

const DECISION_META: Record<Decision, { label: string; tone: BadgeProps['tone']; verb: string; outcome: string }> = {
  approved: { label: 'Approved', tone: 'success', verb: 'approved', outcome: 'ok' },
  changes: { label: 'Changes requested', tone: 'warning', verb: 'sent back for changes', outcome: 'flagged' },
  rejected: { label: 'Rejected', tone: 'danger', verb: 'rejected', outcome: 'denied' },
};

function RelayInner() {
  const [items, setItems] = React.useState<PendingItem[]>(SEED);
  const [history, setHistory] = React.useState<DecidedItem[]>(SEED_HISTORY);
  const [selectedKey, setSelectedKey] = React.useState<string>(SEED[0].key);
  const [now, setNow] = React.useState(0);
  const [feedback, setFeedback] = React.useState('');
  const [toast, setToast] = React.useState<{ text: string; tone: BadgeProps['tone'] } | null>(null);
  const [tab, setTab] = React.useState('queue');
  const seq = React.useRef(1);
  const spawn = React.useRef(0);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live clock: advance one second at a time. Starts at 0 on both server and
  // client, so the first paint matches and there is no hydration mismatch.
  React.useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const flash = React.useCallback((text: string, tone: BadgeProps['tone']) => {
    setToast({ text, tone });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const liveWait = React.useCallback((it: PendingItem) => it.baseAge + (now - it.spawnAt), [now]);

  const selected = items.find((i) => i.key === selectedKey) ?? null;
  const atRisk = items.filter((i) => liveWait(i) > i.slaSec).length;
  const approvals = history.filter((h) => h.decision === 'approved').length;
  const approvalRate = history.length ? Math.round((approvals / history.length) * 100) : 0;
  const medianLatency = median(history.map((h) => h.latencySec));

  function decide(decision: Decision) {
    if (!selected) return;
    const latency = liveWait(selected);
    const meta = DECISION_META[decision];
    const decided: DecidedItem = {
      key: selected.key,
      subject: selected.subject,
      requester: selected.requester,
      actionKind: selected.actionKind,
      decision,
      reviewer: REVIEWER,
      latencySec: latency,
      feedback: feedback.trim() || (decision === 'approved' ? 'Approved as drafted.' : 'No note provided.'),
      ts: BASE_TS + seq.current * 60_000,
    };
    seq.current += 1;
    const rest = items.filter((i) => i.key !== selected.key);
    setItems(rest);
    setHistory((h) => [decided, ...h]);
    setFeedback('');
    setSelectedKey(rest[0]?.key ?? '');
    flash(`${selected.actionKind} ${meta.verb} · decided in ${waitLabel(latency)}`, meta.tone);
  }

  function simulateIncoming() {
    const tpl = POOL[spawn.current % POOL.length];
    spawn.current += 1;
    const key = `req_${2045 + spawn.current}`;
    const item: PendingItem = { ...tpl, key, baseAge: 0, spawnAt: now };
    setItems((prev) => [item, ...prev]);
    if (!selected) setSelectedKey(key);
    flash(`New request from ${tpl.requester} · ${tpl.actionKind.toLowerCase()}`, 'info');
  }

  const auditEvents = React.useMemo<AuditEvent[]>(
    () =>
      history.map((h) => ({
        id: `${h.key}-${h.ts}`,
        ts: h.ts,
        message: `${h.actionKind} ${DECISION_META[h.decision].verb} — ${h.subject}`,
        agent: 'Operator',
        identity: 'svc-operator',
        kind: 'decision',
        action: h.actionKind,
        outcome: DECISION_META[h.decision].outcome,
        entity: h.requester,
        reviewer: h.reviewer,
        latency_ms: h.latencySec * 1000,
        rationale: h.feedback,
      })),
    [history],
  );
  const auditNow = React.useMemo(() => auditEvents.reduce((m, e) => Math.max(m, Number(e.ts)), BASE_TS), [auditEvents]);

  return (
    <div style={{ background: 'var(--bg, #ffffff)', color: ink, minHeight: '100%', font: '14px var(--font-sans, ui-sans-serif, system-ui)' }}>
      <style>{`@keyframes relay-pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>

      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 22px', borderBottom: `1px solid ${line}`, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: ink }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="var(--bg, #fff)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={ICON.inbox} /></svg>
          </span>
          <div>
            <div style={{ fontWeight: 650, letterSpacing: '-0.01em' }}>Relay</div>
            <div style={{ fontSize: 12, color: faint }}>Human-in-the-loop approvals</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 6, padding: '3px 9px', borderRadius: 999, border: `1px solid ${line}`, background: surfaceAlt, fontSize: 12, color: muted }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: truth, animation: 'relay-pulse 1.6s ease-in-out infinite' }} />
            Live
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="filled" iconPath={ICON.bolt} onClick={simulateIncoming}>Simulate incoming</Button>
          <Avatar name={REVIEWER} size="sm" tone="accent" status="online" title={`${REVIEWER} · reviewer`} />
        </div>
      </header>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12, padding: '18px 22px 6px' }} className="relay-metrics">
        <MetricCard label="Awaiting review" value={items.length} hint="now" delta={atRisk ? `${atRisk} over SLA` : 'all within SLA'} deltaType={atRisk ? 'down' : 'neutral'} valueTone={items.length ? 'default' : 'success'} />
        <MetricCard label="Median decision time" value={waitLabel(medianLatency)} hint="last 24h" delta="target under 3m" deltaType="neutral" />
        <MetricCard label="Approval rate" value={`${approvalRate}%`} hint="last 24h" delta={`${approvals} of ${history.length} approved`} deltaType="up" valueTone="success" />
        <MetricCard label="SLA at risk" value={atRisk} hint="pending" delta={atRisk ? 'needs attention' : 'clear'} deltaType={atRisk ? 'down' : 'neutral'} valueTone={atRisk ? 'warning' : 'default'} />
      </div>

      <div style={{ padding: '6px 22px 28px' }}>
        <div style={{ marginBottom: 16 }}>
          <Tabs
            variant="segmented"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'queue', label: 'Review queue', count: items.length },
              { value: 'log', label: 'Activity log', count: history.length },
            ]}
          />
        </div>

        {tab === 'queue' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 340px) minmax(0, 1fr)', gap: 16, alignItems: 'start' }} className="relay-queue">
            {/* Inbox list */}
            <div style={{ border: `1px solid ${line}`, borderRadius: 12, overflow: 'hidden', background: surface }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${line}`, background: surfaceAlt }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: faint }}>Inbox</span>
                <Badge tone={items.length ? 'warning' : 'success'} dot>{items.length ? `${items.length} waiting` : 'Inbox zero'}</Badge>
              </div>
              {items.length === 0 ? (
                <div style={{ padding: '44px 20px', textAlign: 'center', color: faint }}>
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={truth} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px' }}><path d={ICON.check} /></svg>
                  <div style={{ fontWeight: 600, color: muted }}>All caught up</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>No requests awaiting review. Simulate one to see the queue fill.</div>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 520, overflow: 'auto' }}>
                  {items.map((it) => {
                    const sel = it.key === selectedKey;
                    const wait = liveWait(it);
                    const over = wait > it.slaSec;
                    return (
                      <li key={it.key}>
                        <button
                          type="button"
                          onClick={() => setSelectedKey(it.key)}
                          aria-pressed={sel}
                          style={{ width: '100%', textAlign: 'left', display: 'block', padding: '12px 14px', border: 0, borderBottom: `1px solid ${line}`, borderLeft: `2px solid ${sel ? ink : 'transparent'}`, background: sel ? surfaceAlt : 'transparent', cursor: 'pointer', color: 'inherit' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <Avatar name={it.requester} size="xs" tone="neutral" />
                            <span style={{ fontWeight: 600, fontSize: 13.5, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.requester}</span>
                            <Badge tone={RISK_TONE[it.risk]} size="sm">{it.risk}</Badge>
                          </div>
                          <div style={{ fontSize: 13, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.subject}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
                            <span style={{ font: `11px ${mono}`, color: faint }}>{it.actionKind} · {it.channel}</span>
                            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, font: `11px ${mono}`, color: over ? fault : faint, fontWeight: over ? 600 : 400 }}>
                              <span style={{ width: 6, height: 6, borderRadius: 999, background: over ? fault : truth, animation: 'relay-pulse 1.6s ease-in-out infinite' }} />
                              {waitLabel(wait)}{over ? ' · SLA' : ''}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Detail */}
            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                <div style={{ border: `1px solid ${line}`, borderRadius: 12, background: surface, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h2 style={{ font: '650 17px var(--font-sans, ui-sans-serif, system-ui)', margin: 0 }}>{selected.subject}</h2>
                        <Badge tone={RISK_TONE[selected.risk]} size="md">{selected.risk} risk</Badge>
                      </div>
                      <div style={{ font: `12px ${mono}`, color: faint, marginTop: 6 }}>
                        <span style={{ color: muted }}>{selected.key}</span> · {selected.requester} · {selected.channel} · {selected.actionKind}
                      </div>
                    </div>
                    {(() => {
                      const wait = liveWait(selected);
                      const over = wait > selected.slaSec;
                      return (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ font: `650 19px ${mono}`, color: over ? fault : ink }}>{waitLabel(wait)}</div>
                          <div style={{ fontSize: 11, color: faint }}>waiting · SLA {waitLabel(selected.slaSec)}</div>
                        </div>
                      );
                    })()}
                  </div>
                  <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.6, color: muted }}>{selected.context}</p>
                </div>

                <AIResponse
                  model={selected.model}
                  duration={selected.duration}
                  tokens={selected.tokens}
                  text={selected.proposal}
                  thinking={selected.reasoning}
                  thinkingLabel="Show agent reasoning"
                  citations={[{ label: 'policy §4.2 — approval ceilings', note: 'Actions above the ceiling require human sign-off' }, { label: `confidence ${Math.round(selected.confidence * 100)}%` }]}
                  onFeedback={(v) => v && flash(v === 'up' ? 'Thumbs up noted on the draft' : 'Thumbs down noted on the draft', v === 'up' ? 'success' : 'warning')}
                  onCopy={() => flash('Proposed action copied', 'neutral')}
                />

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }} className="relay-detail-grid">
                  <ExecutionTrace title="Agent trace" steps={selected.steps} calls={selected.calls} duration={selected.duration} tokens={selected.tokens} cost={selected.cost} />
                  <InvariantPanel title="Guardrail checks" invariants={selected.checks} scope={selected.key} compact />
                </div>

                {/* Decision controls */}
                <div style={{ border: `1px solid ${line}`, borderRadius: 12, background: surfaceAlt, padding: 16 }}>
                  <label htmlFor="relay-feedback" style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: faint, marginBottom: 8 }}>Reviewer feedback to the agent</label>
                  <textarea
                    id="relay-feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Optional — attached to the decision and used to tune the agent. e.g. 'Approved; confirm the refund target next time.'"
                    rows={2}
                    style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: `1px solid ${line}`, background: surface, color: ink, font: '13px var(--font-sans, ui-sans-serif, system-ui)', lineHeight: 1.5 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    <Button variant="filled" iconPath={ICON.check} onClick={() => decide('approved')}>Approve &amp; execute</Button>
                    <Button variant="outline" iconPath={ICON.pencil} onClick={() => decide('changes')}>Request changes</Button>
                    <Button variant="destructive" iconPath={ICON.x} onClick={() => decide('rejected')}>Reject</Button>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: faint }}>Decision is logged with the wait time and your note.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ border: `1px dashed ${line}`, borderRadius: 12, background: surface, padding: '60px 24px', textAlign: 'center', color: faint }}>
                <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={truth} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}><path d={ICON.check} /></svg>
                <div style={{ fontWeight: 600, color: muted, fontSize: 15 }}>Inbox zero</div>
                <div style={{ fontSize: 13.5, marginTop: 6, maxWidth: 360, marginInline: 'auto', lineHeight: 1.6 }}>Every request has been reviewed. Use <span style={{ color: ink, fontWeight: 600 }}>Simulate incoming</span> to watch a new approval land in the queue.</div>
              </div>
            )}
          </div>
        ) : (
          <AuditLog title="Decision history" events={auditEvents} now={auditNow} defaultRange="all" defaultSort="desc" height={520} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 50, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, border: `1px solid ${line}`, background: ink, color: 'var(--bg, #fff)', boxShadow: '0 8px 30px rgb(0 0 0 / 0.18)', font: '13px var(--font-sans, ui-sans-serif, system-ui)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: TOAST_COLOR[toast.tone ?? 'neutral'] ?? truth }} />
          {toast.text}
        </div>
      )}

      <style>{`
        @media (min-width: 720px){ .relay-metrics{ grid-template-columns: repeat(4, minmax(0,1fr)); } }
        @media (max-width: 1040px){ .relay-queue{ grid-template-columns: 1fr !important; } .relay-detail-grid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

export default function RelayExample() {
  return (
    <ThemedShell>
      <RelayInner />
    </ThemedShell>
  );
}
