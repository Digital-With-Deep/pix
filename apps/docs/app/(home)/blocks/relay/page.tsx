'use client';
import { ThemedShell } from '@/components/ThemedShell';
import * as React from 'react';
import {
  ActionHistory,
  AIResponse,
  ApprovalCard,
  AuditLog,
  AutonomySetting,
  Avatar,
  Badge,
  Button,
  ConfidenceBadge,
  ExecutionTrace,
  InvariantPanel,
  MetricCard,
  PlanView,
  ToastProvider,
  ToolCall,
  useToast,
  type AgentAction,
  type ApprovalChange,
  type AuditEvent,
  type AutonomyLevel,
  type BadgeProps,
  type ConfidenceState,
  type ExecutionTraceStep,
  type Invariant,
  type PlanStep,
} from '@pix-ui/react';

// Relay dogfoods PIX: a human-in-the-loop approval inbox, styled like a
// familiar mail client (folder rail · message list · reading pane) so there
// is nothing to learn. An autonomous support agent ("Operator") proposes
// actions (refunds, account changes, emails, data deletions) and holds each
// tool call until a person approves it. The reading pane is the held
// ToolCall with its ApprovalCard inside: approve, edit the values, or reject
// with a reason. An approval starts the tool call, lands in Executed with an
// undo window (ActionHistory), and is logged in the AuditLog. Autonomy sets
// which kinds of action Operator may take without asking. Every surface is a
// real @pix-ui/react component styled only with PIX tokens, so it flips with
// the theme. Time is a fixed anchor plus seconds since mount, so the static
// export and the client agree on first paint — no Date.now() here. All
// people, accounts and orders are made up.

const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui)';
const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surface = 'var(--surface, #ffffff)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';
const truth = 'var(--truth, #059669)';
const fault = 'var(--fault, #d97706)';
const claim = 'var(--claim, #dc2626)';
const accent = 'var(--accent, #2563eb)';

const ICON = {
  check: 'M4.5 12.75l6 6 9-13.5',
  x: 'M6 18L18 6M6 6l12 12',
  bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  inbox:
    'M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  chevronL: 'M15.75 19.5L8.25 12l7.5-7.5',
  chevronR: 'M8.25 4.5l7.5 7.5-7.5 7.5',
  flag: 'M3 3v18m0-13.5h11.25l-1.8 3 1.8 3H3',
  sliders:
    'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
};

type Risk = 'low' | 'medium' | 'high' | 'critical';
type Kind = 'Refund' | 'Account change' | 'Outbound email' | 'Data deletion' | 'Escalation';
type Channel = 'Email' | 'Live chat' | 'API' | 'Phone';

const RISK_TONE: Record<Risk, BadgeProps['tone']> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};
const RISK_BAR: Record<Risk, string> = { low: faint, medium: accent, high: fault, critical: claim };

interface PendingItem {
  key: string;
  requester: string;
  channel: Channel;
  subject: string;
  snippet: string;
  context: string;
  risk: Risk;
  actionKind: Kind;
  // The held tool call and the approval it waits on.
  tool: string;
  title: string;
  target: string;
  proposal: string;
  why: string;
  changes: ApprovalChange[];
  evidence: string[];
  reversible: boolean;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  execSec: number;
  doneLabel: string;
  plan?: { label: string; detail?: string }[];
  // What the agent drafted and how it got there.
  model: string;
  confidence: number;
  reply: string;
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

type Decision = 'approved' | 'rejected';

interface DecidedItem {
  key: string;
  subject: string;
  requester: string;
  actionKind: Kind;
  decision: Decision;
  reviewer: string;
  latencySec: number;
  note: string;
  ts: number;
  proposal: string;
  risk: Risk;
  channel: Channel;
  edited?: boolean;
  execAt?: number; // `now` value when the tool call started
  input?: Record<string, unknown>;
  changes?: ApprovalChange[];
  snapshot?: PendingItem;
}

interface AutoRun {
  id: string;
  at: number; // clock ms
  tpl: Template;
}

const REVIEWER = 'Avery Cole';
const AGENT = 'Operator';
const ANCHOR = Date.UTC(2026, 9, 14, 14, 5, 0); // Wed Oct 14, 14:05 UTC
const MIN = 60_000;
const UNDO_MIN = 10;

// --- seed queue ------------------------------------------------------------
const SEED: PendingItem[] = [
  {
    key: 'req_2041',
    requester: 'Priya Natarajan',
    channel: 'Email',
    subject: 'Refund for duplicate charge',
    snippet: 'I was billed twice for the October plan, order 8841 and 8842.',
    context:
      'Customer reports two identical charges of $214.00 on Oct 3 (orders 8841, 8842) and asks for one to be reversed. Pro plan, customer since 2023, no prior refunds.',
    risk: 'high',
    actionKind: 'Refund',
    tool: 'billing.issue_refund',
    title: 'Refund a duplicate charge',
    target: 'order 8842',
    proposal: 'Refund $214.00 on order 8842, the duplicate, to the card ending 4471. Order 8841 stays active.',
    why: 'Both charges hit the same card for the same plan 38 seconds apart, and 8841 is already fulfilled. $214.00 is above the $200.00 auto-approve ceiling.',
    changes: [
      { field: 'Refund amount', key: 'amount', before: '$0.00', after: '$214.00' },
      { field: 'Refund to', before: null, after: 'Card ending 4471', editable: false },
      { field: 'Order 8842', before: 'Paid', after: 'Refunded', editable: false },
    ],
    evidence: ['Charges 8841 and 8842', 'Fulfillment record 8841', 'Policy 4.2, approval ceilings'],
    reversible: false,
    input: { order: '8842', amount: '$214.00', method: 'card_4471' },
    output: { refund_id: 'rf_55120', status: 'submitted', arrives: '5 to 7 business days' },
    execSec: 5,
    doneLabel: 'Refunded a duplicate charge',
    model: 'operator-2',
    confidence: 0.94,
    reply:
      "Hi Priya,\n\nYou're right: order **8842** duplicated **8841**. I've refunded **$214.00** to the card ending 4471, and it should arrive in 5 to 7 business days.\n\nOrder 8841 stays active, so nothing changes with your plan.",
    reasoning:
      'Matched both charges to the same payment method and plan within a 40s window, consistent with a double submit.\nVerified 8841 already fulfilled, so 8842 is the safe one to reverse.\nAmount is above the $200 auto-approve ceiling, so routing to a human.',
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
      { name: 'amount_within_ceiling', state: 'fail', catches: 'Action exceeds the agent auto-approve limit', detail: '$214.00 is above the $200.00 ceiling, so a person signs off.' },
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
    snippet: 'Lost my phone, need my email and authenticator reset so I can sign in.',
    context:
      'Request to change the account email to a new domain and remove the current two-factor device. Sign-in attempts from a new country in the last hour. Identity answers partly matched (2 of 3).',
    risk: 'critical',
    actionKind: 'Account change',
    tool: 'accounts.update_identity',
    title: 'Change the account email and reset two-factor',
    target: 'usr_3307',
    proposal: 'Change the account email to m.webb@post.example and remove the registered authenticator so the customer can enroll again.',
    why: 'Identity checks only partly passed, and an email change paired with a two-factor reset is the classic takeover pattern. Signals are mixed, so Operator is asking rather than acting.',
    changes: [
      { field: 'Account email', key: 'email', before: 'm.webb@corvid.example', after: 'm.webb@post.example' },
      { field: 'Authenticator', before: 'Phone app, enrolled 2025', after: 'Removed', editable: false },
    ],
    evidence: ['Identity check, 2 of 3', 'New-country sign-in, 42m ago'],
    reversible: true,
    input: { user: 'usr_3307', email: 'm.webb@post.example', remove_authenticator: true },
    output: { updated: true, reenroll_link_sent: true },
    execSec: 4,
    doneLabel: 'Changed account email and reset two-factor',
    model: 'operator-2',
    confidence: 0.58,
    reply:
      "Hi Marcus,\n\nI've changed the email on your account to **m.webb@post.example** and removed the old authenticator. Sign in with the new address and you'll be asked to set up two-factor again.",
    reasoning:
      'Identity verification only partly passed (2 of 3) and the request pairs an email change with a two-factor reset, the classic takeover pattern.\nSignals are mixed, so I am surfacing this rather than acting.',
    steps: [
      { name: 'identity.verify', args: { answers: 3 }, duration: '210ms', result: '2 of 3 matched', note: 'Third answer failed: date of birth mismatch' },
      { name: 'risk.signals', duration: '88ms', result: 'new-country sign-in 42m ago; new device', flagged: true },
      { name: 'policy.check', args: { kind: 'account_change' }, duration: '29ms', result: 'email + 2FA reset together → escalate' },
    ],
    calls: 3,
    duration: '0.9s',
    tokens: '1,460 tokens',
    cost: '$0.015',
    checks: [
      { name: 'identity_verified', state: 'fail', catches: 'Requester proved ownership of the account', detail: 'Only 2 of 3 identity checks passed; date of birth did not match.' },
      { name: 'no_takeover_signals', state: 'fail', catches: 'No concurrent account-takeover indicators', detail: 'New-country sign-in 42 minutes ago on an unrecognized device.' },
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
      'Enterprise customer affected by the Oct 7 regional outage (4h 12m), asking for acknowledgement. Operator proposes a goodwill credit inside the standard band.',
    risk: 'medium',
    actionKind: 'Outbound email',
    tool: 'accounts.apply_credit',
    title: 'Apologize and apply a service credit',
    target: 'acct_7710',
    proposal: 'Send an apology for the 4h 12m outage, confirm the root cause is fixed, and apply a one-month 15% service credit.',
    why: 'The outage is confirmed and the account was in the affected region. 15% sits inside the goodwill band, but outbound enterprise mail gets a human check on tone.',
    changes: [
      { field: 'Service credit', key: 'credit', before: '0%', after: '15%' },
      { field: 'Credit amount', before: '$0', after: '$340', editable: false },
      { field: 'Apology email', before: null, after: 'Queued to send', editable: false },
    ],
    evidence: ['Incident INC-2207', 'Credit band, enterprise', 'Account region: affected'],
    reversible: true,
    input: { account: 'acct_7710', credit: '15%', months: 1, email: 'apology_inc_2207' },
    output: { credit_id: 'cr_9014', amount: '$340', email: 'queued, sends in 10m' },
    execSec: 6,
    doneLabel: 'Applied a service credit and queued an apology',
    model: 'operator-2',
    confidence: 0.88,
    reply:
      "Hi Lena,\n\nI'm sorry. Your workspace was unavailable for **4 hours 12 minutes** on Tuesday, and I know that landed on your launch.\n\n- The cause was a failed storage node in your region. It has been replaced and the failover fixed.\n- I've applied a **15% service credit** to next month's invoice.\n\nIf it would help, I can set up a call with our reliability lead this week.",
    reasoning:
      'Outage is confirmed in the incident record and the account was in the affected region.\nCredit of 15% sits inside the goodwill band for a confirmed availability miss, but outbound enterprise mail needs a human check on tone.',
    steps: [
      { name: 'incident.lookup', args: { id: 'INC-2207' }, duration: '95ms', result: 'confirmed, 4h12m, region east-1' },
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
    subject: 'Erase account data (right to erasure)',
    snippet: 'Please delete all my personal data under article 17.',
    context:
      'Verified right-to-erasure request. Operator assembled the deletion plan across 6 systems. It cannot be undone once it runs, so it routes to a human.',
    risk: 'high',
    actionKind: 'Data deletion',
    tool: 'privacy.execute_erasure',
    title: 'Erase personal data across 6 systems',
    target: 'usr_5521',
    proposal: 'Run the erasure plan across 6 systems, keep the billing record the law requires in a sealed hold for 7 years, and email confirmation when done.',
    why: 'The request is verified and in scope, and the plan carves out the billing record under the legal retention exception. Deletion cannot be undone.',
    changes: [
      { field: 'Systems erased', before: '0 of 6', after: '6 of 6', editable: false },
      { field: 'Billing record', before: 'Active', after: 'Sealed hold, 7 years', editable: false },
    ],
    evidence: ['Erasure request ER-0911', 'Data map, 6 systems', 'Retention policy 9.1'],
    reversible: false,
    input: { subject: 'usr_5521', systems: 6, legal_hold: ['billing'] },
    output: { erased: 6, sealed: 1, confirmation: 'sent' },
    execSec: 8,
    doneLabel: 'Erased personal data across 6 systems',
    plan: [
      { label: 'Erase the app database profile', detail: 'users, sessions, preferences' },
      { label: 'Purge warehouse rows', detail: '3 tables keyed on usr_5521' },
      { label: 'Redact application logs', detail: '90-day window' },
      { label: 'Queue backup expiry', detail: 'rolls off in 35 days' },
      { label: 'Seal the billing record', detail: 'legal hold, 7 years' },
      { label: 'Close support history and send confirmation' },
    ],
    model: 'operator-2',
    confidence: 0.91,
    reply:
      "Hi Tomás,\n\nWe've erased your personal data from all six of our systems. The one exception is your billing record, which the law requires us to keep for seven years. It is sealed and used for nothing else.\n\nBackups roll off within 35 days.",
    reasoning:
      'Erasure request is verified and in scope.\nPlan carves out the billing record under the legal-retention exception.\nDeletion is irreversible, so a human confirms before it runs.',
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

// --- seed decisions (before the page opened) -------------------------------
const SEED_HISTORY: DecidedItem[] = [
  { key: 'req_2039', subject: 'Refund for late delivery', requester: 'Aiko Tanaka', actionKind: 'Refund', decision: 'approved', reviewer: REVIEWER, latencySec: 73, note: 'Within policy, clean case.', ts: ANCHOR - 3 * MIN, proposal: 'Refund $89.00 for the late delivery and send an apology.', risk: 'medium', channel: 'Email' },
  { key: 'req_2038', subject: 'Welcome-back outreach', requester: 'Sven Berg', actionKind: 'Outbound email', decision: 'approved', reviewer: 'Dana Lee', latencySec: 141, note: 'Tone good, sent.', ts: ANCHOR - 7 * MIN, proposal: 'Send a welcome-back note with a 10% returning-customer offer.', risk: 'low', channel: 'Email' },
  { key: 'req_2037', subject: 'Change billing contact', requester: 'Nadia Rahman', actionKind: 'Account change', decision: 'rejected', reviewer: REVIEWER, latencySec: 262, note: 'Confirm the new contact over a second channel first.', ts: ANCHOR - 15 * MIN, proposal: 'Update the billing contact to the newly supplied address.', risk: 'medium', channel: 'API' },
  { key: 'req_2036', subject: 'Refund $1,290, disputed', requester: 'Rafael Cruz', actionKind: 'Refund', decision: 'rejected', reviewer: 'Dana Lee', latencySec: 318, note: 'Charge is valid; the dispute lacks evidence.', ts: ANCHOR - 25 * MIN, proposal: 'Refund the disputed $1,290.00 annual charge in full.', risk: 'high', channel: 'Email' },
  { key: 'req_2035', subject: 'Escalate to tier 2', requester: 'Nia Clarke', actionKind: 'Escalation', decision: 'approved', reviewer: REVIEWER, latencySec: 54, note: 'Correct call, routed.', ts: ANCHOR - 35 * MIN, proposal: 'Escalate the unresolved integration issue to a tier-2 engineer.', risk: 'medium', channel: 'Live chat' },
  { key: 'req_2034', subject: 'Erase account data', requester: 'Omar Haddad', actionKind: 'Data deletion', decision: 'rejected', reviewer: 'Dana Lee', latencySec: 205, note: 'Open invoice on the account. Resolve it before erasure.', ts: ANCHOR - 50 * MIN, proposal: 'Run the erasure plan across 6 systems.', risk: 'high', channel: 'API' },
];

// What Operator already did today: the executions of seeded approvals plus
// work inside its own limits.
const SEED_ACTIONS: AgentAction[] = [
  { id: 'req_2039', at: ANCHOR - 3 * MIN, agent: AGENT, action: 'Refunded a late delivery', target: 'order 8790', status: 'done', undoUntil: ANCHOR + 7 * MIN, detail: `Approved by ${REVIEWER}` },
  { id: 'auto_31', at: ANCHOR - 5 * MIN, agent: AGENT, action: 'Sent an order status reply', target: 'tkt_6620', status: 'done', undoUntil: ANCHOR + 2 * MIN, detail: 'Inside its limits, so it ran on its own' },
  { id: 'req_2038', at: ANCHOR - 7 * MIN, agent: AGENT, action: 'Sent welcome-back outreach', target: 'cus_4410', status: 'done', detail: 'Approved by Dana Lee' },
  { id: 'auto_30', at: ANCHOR - 12 * MIN, agent: AGENT, action: 'Applied a shipping credit', target: 'order 8771', status: 'failed', detail: 'The billing service timed out; retry queued for 14:30' },
  { id: 'auto_29', at: ANCHOR - 22 * MIN, agent: AGENT, action: 'Tagged and routed 14 tickets', target: 'queue: billing', status: 'done', detail: 'Inside its limits, so it ran on its own' },
  { id: 'req_2035', at: ANCHOR - 35 * MIN, agent: AGENT, action: 'Escalated to tier 2', target: 'tkt_6588', status: 'done', detail: `Approved by ${REVIEWER}` },
];

// --- pool used by "Simulate incoming" --------------------------------------
type Template = Omit<PendingItem, 'key' | 'spawnAt' | 'baseAge'>;

const POOL: Template[] = [
  {
    requester: 'Chen Wu', channel: 'Live chat', subject: 'Partial refund, damaged item',
    snippet: 'One of two monitors arrived cracked.', context: 'Two-unit order, one damaged on arrival with a photo attached. Operator proposes refunding one unit.',
    risk: 'medium', actionKind: 'Refund', tool: 'billing.issue_refund', title: 'Refund one damaged unit', target: 'order 8903',
    proposal: 'Refund $64.00 for one of two units to the original card and send a prepaid return label for the damaged monitor.',
    why: 'The damage photo matches the item. The amount is modest but over the $25.00 live chat auto-approve limit.',
    changes: [
      { field: 'Refund amount', key: 'amount', before: '$0.00', after: '$64.00' },
      { field: 'Return label', before: null, after: 'Prepaid, emailed', editable: false },
    ],
    evidence: ['Damage photo', 'Order 8903, 2 units'],
    reversible: false,
    input: { order: '8903', amount: '$64.00', return_label: true }, output: { refund_id: 'rf_55188', label: 'sent' }, execSec: 4,
    doneLabel: 'Refunded one damaged unit',
    model: 'operator-2', confidence: 0.86,
    reply: "Hi Chen,\n\nSorry about the cracked monitor. I've refunded **$64.00** for that unit and emailed a prepaid return label. Keep the working one.",
    reasoning: 'Damage photo attached and matches the item.\nPartial refund keeps the working unit; amount is modest but over the chat auto-approve limit.',
    steps: [
      { name: 'order.lookup', duration: '88ms', result: '2 units, $128.00' },
      { name: 'attachment.scan', duration: '240ms', result: 'photo: visible crack, matches item' },
      { name: 'policy.check', args: { kind: 'refund', amount: 64 }, duration: '20ms', result: 'chat channel → human approval' },
    ],
    calls: 3, duration: '0.7s', tokens: '1,120 tokens', cost: '$0.011',
    checks: [
      { name: 'evidence_attached', state: 'pass', catches: 'Claim is backed by evidence' },
      { name: 'amount_within_ceiling', state: 'fail', catches: 'Within the channel auto-approve limit', detail: 'Chat limit is $25.00; this is $64.00.' },
    ],
    slaSec: 300,
  },
  {
    requester: 'Hana Kim', channel: 'Phone', subject: 'Escalate billing dispute to tier 2',
    snippet: 'Third time asking about the same wrong invoice.', context: 'Repeat contact on an unresolved invoice dispute. Operator proposes escalation to a tier-2 specialist with the history attached.',
    risk: 'medium', actionKind: 'Escalation', tool: 'support.escalate', title: 'Escalate to a tier-2 billing specialist', target: 'tkt_6702',
    proposal: 'Escalate to a tier-2 billing specialist, attach the three prior contacts and the disputed invoice, and promise a call within one business day.',
    why: 'Three contacts on the same invoice meets the repeat-contact bar, and Operator cannot settle a contested invoice itself.',
    changes: [
      { field: 'Assignee', before: 'Operator', after: 'Tier 2 billing', editable: false },
      { field: 'Callback by', key: 'callback', before: null, after: 'Next business day' },
    ],
    evidence: ['3 contacts, INV-5521', 'Dispute open 6 days'],
    reversible: true,
    input: { ticket: 'tkt_6702', to: 'tier2_billing', attach: ['INV-5521', 3] }, output: { assigned: 'tier2_billing', callback: 'booked' }, execSec: 4,
    doneLabel: 'Escalated a billing dispute to tier 2',
    model: 'operator-2', confidence: 0.9,
    reply: "Hi Hana,\n\nI'm sorry you've had to ask three times. A billing specialist now has your invoice and our earlier notes, and will call you by the end of the next business day.",
    reasoning: 'Three contacts on the same issue meets the repeat-contact escalation bar.\nOperator cannot resolve a contested invoice directly, so a specialist takes it.',
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
  {
    requester: 'Isla Grant', channel: 'Email', subject: 'Renewal offer before expiry',
    snippet: 'Account renews in 9 days, proactive note.', context: 'Account renews in 9 days. Operator drafted a proactive renewal note with the standard loyalty discount.',
    risk: 'low', actionKind: 'Outbound email', tool: 'mail.send', title: 'Send a renewal reminder with a loyalty discount', target: 'acct_6185',
    proposal: 'Send a renewal reminder offering the standard 10% loyalty discount if renewed before the expiry date.',
    why: 'The discount is the standard loyalty rate and the account is in good standing. Outbound mail still gets a quick look.',
    changes: [
      { field: 'Loyalty discount', key: 'discount', before: '0%', after: '10%' },
      { field: 'Email', before: null, after: 'Queued to send', editable: false },
    ],
    evidence: ['Account in good standing', 'Discount band, standard'],
    reversible: true,
    input: { account: 'acct_6185', template: 'renewal_reminder', discount: '10%' }, output: { email: 'queued, sends in 10m' }, execSec: 3,
    doneLabel: 'Queued a renewal reminder',
    model: 'operator-2', confidence: 0.92,
    reply: "Hi Isla,\n\nYour plan renews in 9 days. Renew before then and we'll take **10%** off the next year as a thank-you for staying with us.",
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
    snippet: 'Please move us to the Starter plan at the next cycle.', context: 'Self-serve downgrade request through the API. Operator proposes scheduling it for the next billing cycle to avoid a proration charge.',
    risk: 'medium', actionKind: 'Account change', tool: 'billing.schedule_plan_change', title: 'Schedule a downgrade to Starter', target: 'acct_5033',
    proposal: 'Schedule a downgrade from Pro to Starter at the next billing cycle, and email a summary of the features that will go.',
    why: 'The customer asked for it and it can be reversed. Scheduling at cycle end avoids a proration charge; flagged because it changes entitlements.',
    changes: [
      { field: 'Plan', before: 'Pro', after: 'Starter', editable: false },
      { field: 'Effective', key: 'effective', before: null, after: '2026-11-01' },
    ],
    evidence: ['Plan diff, 4 features', 'Billing preview'],
    reversible: true,
    input: { account: 'acct_5033', from: 'pro', to: 'starter', effective: '2026-11-01' }, output: { scheduled: true, proration: '$0.00' }, execSec: 4,
    doneLabel: 'Scheduled a downgrade to Starter',
    model: 'operator-2', confidence: 0.9,
    reply: "Hi Victor,\n\nYour move to **Starter** is scheduled for **Nov 1**, your next billing date, so there's no partial charge. You'll keep Pro features until then.",
    reasoning: 'Downgrade is reversible and self-requested.\nScheduling at cycle end avoids a mid-cycle proration charge; flagged because it changes entitlements.',
    steps: [
      { name: 'plan.diff', args: { from: 'pro', to: 'starter' }, duration: '72ms', result: '4 features removed' },
      { name: 'billing.preview', duration: '110ms', result: 'no proration if scheduled at cycle end' },
      { name: 'policy.check', args: { kind: 'account_change' }, duration: '24ms', result: 'entitlement change → human approval' },
    ],
    calls: 3, duration: '0.8s', tokens: '1,040 tokens', cost: '$0.010',
    checks: [
      { name: 'change_is_reversible', state: 'pass', catches: 'The customer can upgrade again freely' },
      { name: 'no_data_loss', state: 'pass', catches: 'No records are deleted by the change' },
    ],
    slaSec: 600,
  },
];

// --- autonomy: which kinds Operator may run without asking ------------------
const AUTONOMY: { kind: Kind; task: string; level: AutonomyLevel; locked?: boolean }[] = [
  { kind: 'Refund', task: 'refunds over $200, or over $25 in live chat', level: 'confirm' },
  { kind: 'Account change', task: 'email, sign-in and plan changes', level: 'confirm' },
  { kind: 'Outbound email', task: 'customer email with an offer or credit', level: 'confirm' },
  { kind: 'Escalation', task: 'escalations to tier 2', level: 'autonomous' },
  { kind: 'Data deletion', task: 'erasure requests', level: 'confirm', locked: true },
];
const initialAutonomy = () => Object.fromEntries(AUTONOMY.map((a) => [a.kind, a.level])) as Record<Kind, AutonomyLevel>;

// --- helpers ---------------------------------------------------------------
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

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const hhmm = (ms: number) => new Date(ms).toISOString().slice(11, 16);
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function confidenceOf(it: PendingItem): { state: ConfidenceState; reason: string } {
  const failed = it.checks.filter((c) => c.state === 'fail').length;
  if (it.confidence >= 0.85) return { state: 'confident', reason: `${failed ? `${failed} check${failed === 1 ? '' : 's'} held it for review, ` : ''}but the facts it acts on are verified.` };
  if (it.confidence >= 0.7) return { state: 'low', reason: 'Some of the facts behind this action are inferred, not verified.' };
  return { state: 'review', reason: `${failed} guardrail checks failed. Operator is surfacing this rather than acting.` };
}

function applyEdits(changes: ApprovalChange[], edits?: Record<string, string>): ApprovalChange[] {
  if (!edits) return changes;
  return changes.map((c) => {
    const k = c.key ?? c.field;
    return k in edits ? { ...c, after: edits[k] } : c;
  });
}

const DECISION_META: Record<Decision, { label: string; tone: BadgeProps['tone']; verb: string; outcome: string; color: string }> = {
  approved: { label: 'Approved', tone: 'success', verb: 'approved', outcome: 'ok', color: truth },
  rejected: { label: 'Rejected', tone: 'danger', verb: 'rejected', outcome: 'denied', color: claim },
};

type Folder = 'inbox' | 'approved' | 'rejected' | 'executed' | 'activity' | 'autonomy';
const FOLDERS: { id: Folder; label: string; icon: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: ICON.inbox },
  { id: 'approved', label: 'Approved', icon: ICON.check },
  { id: 'rejected', label: 'Rejected', icon: ICON.x },
  { id: 'executed', label: 'Executed', icon: ICON.bolt },
  { id: 'activity', label: 'Activity log', icon: ICON.clock },
  { id: 'autonomy', label: 'Autonomy', icon: ICON.sliders },
];

function Glyph({ d, size = 16, stroke = 'currentColor', width = 1.8 }: { d: string; size?: number; stroke?: string; width?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

const CLIENT_H = 620;

// Where an approved action's tool call stands, derived from the clock.
type ExecState = 'running' | 'done' | 'undone';
function execOf(d: DecidedItem, now: number, undone: Record<string, number>): { state: ExecState; p: number } | null {
  if (d.decision !== 'approved' || d.execAt === undefined || !d.snapshot) return null;
  const p = Math.min(1, (now - d.execAt) / d.snapshot.execSec);
  if (undone[d.key] !== undefined) return { state: 'undone', p };
  return { state: p >= 1 ? 'done' : 'running', p };
}

function RelayInner() {
  const { toast } = useToast();
  const [items, setItems] = React.useState<PendingItem[]>(SEED);
  const [history, setHistory] = React.useState<DecidedItem[]>(SEED_HISTORY);
  const [autoRuns, setAutoRuns] = React.useState<AutoRun[]>([]);
  const [undone, setUndone] = React.useState<Record<string, number>>({});
  const [autonomy, setAutonomy] = React.useState<Record<Kind, AutonomyLevel>>(initialAutonomy);
  const [folder, setFolder] = React.useState<Folder>('inbox');
  const [selectedKey, setSelectedKey] = React.useState<string>(SEED[0].key);
  const [now, setNow] = React.useState(0);
  const [railOpen, setRailOpen] = React.useState(true);
  const spawn = React.useRef(0);
  // A toast's Undo outlives the render that queued it, so it calls the latest undo.
  const undoRef = React.useRef<(id: string) => void>(() => {});

  // Live clock: advance one second at a time. Starts at 0 on server and
  // client, so first paint matches and there is no hydration mismatch.
  React.useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = ANCHOR + now * 1000;
  const liveWait = (it: PendingItem) => it.baseAge + (now - it.spawnAt);

  const decidedBy = (d: Decision) => history.filter((h) => h.decision === d);

  // Everything Operator executed: seeded actions, approvals and autonomous runs.
  const actions: AgentAction[] = [
    ...SEED_ACTIONS,
    ...history.flatMap((d) => {
      const x = execOf(d, now, undone);
      if (!x || !d.snapshot) return [];
      return [{
        id: d.key,
        at: d.ts,
        agent: AGENT,
        action: d.snapshot.doneLabel,
        target: d.snapshot.target,
        status: x.state === 'running' ? ('pending' as const) : ('done' as const),
        undoUntil: d.snapshot.reversible ? d.ts + UNDO_MIN * MIN : undefined,
        detail: `${d.edited ? 'Approved with edits' : 'Approved'} by ${d.reviewer}${x.state === 'running' ? ' · running now' : ''}`,
      }];
    }),
    ...autoRuns.map((r) => ({
      id: r.id,
      at: r.at,
      agent: AGENT,
      action: r.tpl.doneLabel,
      target: r.tpl.target,
      status: 'done' as const,
      undoUntil: r.tpl.reversible ? r.at + UNDO_MIN * MIN : undefined,
      detail: 'Inside its autonomy, so it ran on its own',
    })),
  ].map((a) => (undone[a.id] !== undefined ? { ...a, status: 'undone' as const, detail: `Undone by ${REVIEWER} at ${hhmm(undone[a.id])}` } : a));

  const openUndo = actions.filter((a) => a.status === 'done' && a.undoUntil !== undefined && Number(a.undoUntil) > clock).length;

  const counts: Record<Folder, number> = {
    inbox: items.length,
    approved: decidedBy('approved').length,
    rejected: decidedBy('rejected').length,
    executed: openUndo,
    activity: 0,
    autonomy: 0,
  };

  const atRisk = items.filter((i) => liveWait(i) > i.slaSec).length;
  const approvals = counts.approved;
  const approvalRate = history.length ? Math.round((approvals / history.length) * 100) : 0;
  const medianLatency = median(history.map((h) => h.latencySec));

  const pendingSelected = folder === 'inbox' ? items.find((i) => i.key === selectedKey) ?? null : null;
  const decidedList = folder === 'approved' || folder === 'rejected' ? decidedBy(folder) : [];
  const decidedSelected = decidedList.find((d) => d.key === selectedKey) ?? null;

  function openFolder(f: Folder) {
    setFolder(f);
    if (f === 'inbox') setSelectedKey(items[0]?.key ?? '');
    else if (f === 'approved' || f === 'rejected') setSelectedKey(decidedBy(f)[0]?.key ?? '');
  }

  function undo(id: string) {
    if (undone[id] !== undefined) return;
    setUndone((u) => ({ ...u, [id]: clock }));
    const a = actions.find((x) => x.id === id);
    toast({ tone: 'info', title: 'Action undone', description: a ? `${AGENT} reversed “${lower(a.action)}” and logged the undo.` : `${AGENT} reversed it and logged the undo.` });
  }

  React.useEffect(() => {
    undoRef.current = undo;
  });

  function decide(it: PendingItem, decision: Decision, opts: { reason?: string; edits?: Record<string, string> } = {}) {
    const latency = liveWait(it);
    const edited = Boolean(opts.edits && Object.keys(opts.edits).length);
    const decided: DecidedItem = {
      key: it.key,
      subject: it.subject,
      requester: it.requester,
      actionKind: it.actionKind,
      decision,
      reviewer: REVIEWER,
      latencySec: latency,
      note: decision === 'approved' ? (edited ? `Approved with edits: ${Object.entries(opts.edits!).map(([k, v]) => `${k} → ${v}`).join(', ')}.` : 'Approved as proposed.') : opts.reason?.trim() || 'No reason given.',
      ts: clock,
      proposal: it.proposal,
      risk: it.risk,
      channel: it.channel,
      edited,
      execAt: decision === 'approved' ? now : undefined,
      input: { ...it.input, ...(opts.edits ?? {}) },
      changes: applyEdits(it.changes, opts.edits),
      snapshot: it,
    };
    const rest = items.filter((i) => i.key !== it.key);
    setItems(rest);
    setHistory((h) => [decided, ...h]);
    setSelectedKey(rest[0]?.key ?? '');
    if (decision === 'approved') {
      toast({
        tone: 'truth',
        title: `Approved: ${lower(it.title)}`,
        description: `${AGENT} is running ${it.tool} now. Decided in ${waitLabel(latency)}.${it.reversible ? ` You can undo it for ${UNDO_MIN} minutes.` : ''}`,
        action: it.reversible ? { label: 'Undo', onClick: () => undoRef.current(it.key) } : undefined,
        duration: 6000,
      });
    } else {
      toast({ tone: 'warn', title: `Rejected: ${lower(it.title)}`, description: `${AGENT} has your reason and will not retry it as proposed.` });
    }
  }

  function simulateIncoming() {
    const tpl = POOL[spawn.current % POOL.length];
    spawn.current += 1;
    const key = `req_${2045 + spawn.current}`;
    if (autonomy[tpl.actionKind] === 'autonomous') {
      setAutoRuns((all) => [...all, { id: key, at: clock, tpl }]);
      toast({
        tone: 'info',
        title: `${AGENT} handled it: ${lower(tpl.title)}`,
        description: `${tpl.actionKind} is set to act on its own, so it skipped your inbox. It is in Executed${tpl.reversible ? ' with an undo window' : ''}.`,
      });
      return;
    }
    const item: PendingItem = { ...tpl, key, baseAge: 0, spawnAt: now };
    setItems((prev) => [item, ...prev]);
    if (folder === 'inbox' && !pendingSelected) setSelectedKey(key);
    toast({ tone: 'info', title: `New request from ${tpl.requester}`, description: `${tpl.actionKind}: ${lower(tpl.title)}.` });
  }

  function changeAutonomy(kind: Kind, task: string, level: AutonomyLevel) {
    setAutonomy((all) => ({ ...all, [kind]: level }));
    const words: Record<AutonomyLevel, string> = {
      suggest: `${AGENT} will only suggest ${task}.`,
      propose: `${AGENT} will plan ${task} and wait for you to start them.`,
      confirm: `${AGENT} will hold ${task} in your inbox for approval.`,
      autonomous: `${AGENT} will run ${task} on its own and log each one under Executed.`,
    };
    toast({ tone: level === 'autonomous' ? 'warn' : 'info', title: 'Autonomy updated', description: words[level] });
  }

  const auditEvents = React.useMemo<AuditEvent[]>(() => {
    const decisions: AuditEvent[] = history.map((h) => ({
      id: `${h.key}-${h.ts}`,
      ts: h.ts,
      message: `${h.actionKind} ${DECISION_META[h.decision].verb}${h.edited ? ' with edits' : ''}: ${h.subject}`,
      agent: AGENT,
      identity: 'svc-operator',
      kind: 'decision',
      action: h.actionKind,
      outcome: DECISION_META[h.decision].outcome,
      entity: h.requester,
      reviewer: h.reviewer,
      latency_ms: h.latencySec * 1000,
      rationale: h.note,
    }));
    const runs: AuditEvent[] = autoRuns.map((r) => ({
      id: `${r.id}-auto`,
      ts: r.at,
      message: `${r.tpl.actionKind} ran on its own: ${r.tpl.subject}`,
      agent: AGENT,
      identity: 'svc-operator',
      kind: 'tool_call',
      action: r.tpl.tool,
      outcome: 'ok',
      entity: r.tpl.requester,
      reviewer: 'none, autonomous',
      rationale: r.tpl.why,
    }));
    const undos: AuditEvent[] = Object.entries(undone).map(([id, ts]) => ({
      id: `${id}-undo`,
      ts,
      message: `Undo: ${id}`,
      agent: AGENT,
      identity: 'svc-operator',
      kind: 'write',
      action: 'undo',
      outcome: 'flagged',
      reviewer: REVIEWER,
      rationale: `${REVIEWER} undid the action inside its undo window.`,
    }));
    return [...decisions, ...runs, ...undos];
  }, [history, autoRuns, undone]);
  const auditNow = auditEvents.reduce((m, e) => Math.max(m, Number(e.ts)), ANCHOR);

  const activeFolderMeta = FOLDERS.find((f) => f.id === folder)!;

  // --- message rows --------------------------------------------------------
  function PendingRow(it: PendingItem) {
    const sel = it.key === selectedKey;
    const wait = liveWait(it);
    const over = wait > it.slaSec;
    return (
      <button
        key={it.key}
        type="button"
        onClick={() => setSelectedKey(it.key)}
        aria-pressed={sel}
        style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 10, padding: '11px 14px 11px 12px', border: 0, borderBottom: `1px solid ${line}`, borderLeft: `3px solid ${sel ? accent : 'transparent'}`, background: sel ? 'color-mix(in srgb, var(--accent, #2563eb) 8%, var(--surface, #fff))' : 'transparent', cursor: 'pointer', color: 'inherit' }}
      >
        <span style={{ width: 3, flex: '0 0 auto', alignSelf: 'stretch', borderRadius: 2, background: RISK_BAR[it.risk] }} />
        <Avatar name={it.requester} initials={initials(it.requester)} size="sm" tone="neutral" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 650, fontSize: 13.5, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.requester}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: `11px ${mono}`, color: over ? fault : faint, fontWeight: over ? 650 : 400, flex: '0 0 auto' }}>
              <span className="relay-pulse" style={{ width: 6, height: 6, borderRadius: 999, background: over ? fault : truth }} />
              {waitLabel(wait)}
            </span>
          </span>
          <span style={{ display: 'block', fontWeight: 600, fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.subject}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.snippet}</span>
            <Badge tone={RISK_TONE[it.risk]} size="sm">{it.risk}</Badge>
            {over ? <span title="Over SLA" aria-label="Over SLA" style={{ color: fault, display: 'inline-flex' }}><Glyph d={ICON.flag} size={13} /></span> : null}
          </span>
        </span>
      </button>
    );
  }

  function DecidedRow(d: DecidedItem) {
    const sel = d.key === selectedKey;
    const meta = DECISION_META[d.decision];
    const x = execOf(d, now, undone);
    return (
      <button
        key={d.key}
        type="button"
        onClick={() => setSelectedKey(d.key)}
        aria-pressed={sel}
        style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 10, padding: '11px 14px 11px 12px', border: 0, borderBottom: `1px solid ${line}`, borderLeft: `3px solid ${sel ? accent : 'transparent'}`, background: sel ? 'color-mix(in srgb, var(--accent, #2563eb) 8%, var(--surface, #fff))' : 'transparent', cursor: 'pointer', color: 'inherit' }}
      >
        <span style={{ width: 3, flex: '0 0 auto', alignSelf: 'stretch', borderRadius: 2, background: x?.state === 'undone' ? faint : meta.color }} />
        <Avatar name={d.requester} initials={initials(d.requester)} size="sm" tone="neutral" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 650, fontSize: 13.5, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.requester}</span>
            <span style={{ font: `11px ${mono}`, color: faint, flex: '0 0 auto' }}>{waitLabel(d.latencySec)}</span>
          </span>
          <span style={{ display: 'block', fontWeight: 600, fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.subject}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.actionKind} · {d.channel}</span>
            {x?.state === 'undone' ? <Badge tone="neutral" size="sm" dot>Undone</Badge> : x?.state === 'running' ? <Badge tone="info" size="sm" dot>Running</Badge> : <Badge tone={meta.tone} size="sm" dot>{d.edited ? 'Edited' : meta.label}</Badge>}
          </span>
        </span>
      </button>
    );
  }

  const listRows =
    folder === 'inbox'
      ? items.length
        ? items.map(PendingRow)
        : <EmptyList label="All caught up" sub="No requests awaiting review. Simulate one to watch the queue fill." />
      : decidedList.length
        ? decidedList.map(DecidedRow)
        : <EmptyList label="Nothing here yet" sub="Decisions you make land in this folder." />;

  const fullWidth = folder === 'activity' || folder === 'executed' || folder === 'autonomy';

  return (
    <div style={{ background: 'var(--bg, #ffffff)', color: ink, minHeight: '100%', font: `14px ${sans}` }}>
      <style>{`@keyframes relay-pulse{0%,100%{opacity:1}50%{opacity:.35}}.relay-pulse{animation:relay-pulse 1.6s ease-in-out infinite}@media (prefers-reduced-motion: reduce){.relay-pulse{animation:none}}`}</style>

      {/* Command bar */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: `1px solid ${line}`, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: ink }}>
            <Glyph d={ICON.inbox} size={17} stroke="var(--bg, #fff)" />
          </span>
          <div>
            <div style={{ fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.1 }}>Relay</div>
            <div style={{ fontSize: 11.5, color: faint }}>Human-in-the-loop approvals</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4, padding: '3px 9px', borderRadius: 999, border: `1px solid ${line}`, background: surfaceAlt, fontSize: 12, color: muted }}>
            <span className="relay-pulse" style={{ width: 7, height: 7, borderRadius: 999, background: truth }} />Live
          </span>
        </div>
        <label style={{ flex: 1, minWidth: 180, maxWidth: 420, display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, border: `1px solid ${line}`, background: surfaceAlt, color: faint }}>
          <Glyph d={ICON.search} size={15} />
          <input disabled placeholder="Search requests (demo)" aria-label="Search" style={{ border: 0, outline: 0, background: 'transparent', color: muted, font: `13px ${sans}`, width: '100%' }} />
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <span style={{ font: `12px ${mono}`, color: muted }}>{hhmm(clock)} UTC</span>
          <Button variant="filled" iconPath={ICON.bolt} onClick={simulateIncoming}>Simulate incoming</Button>
          <Avatar name={REVIEWER} initials={initials(REVIEWER)} size="sm" tone="accent" status="online" title={`${REVIEWER} · reviewer`} />
        </div>
      </header>

      {/* Metrics ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10, padding: '14px 20px' }} className="relay-metrics">
        <MetricCard label="Awaiting review" value={items.length} hint="now" delta={atRisk ? `${atRisk} over SLA` : 'all within SLA'} deltaType={atRisk ? 'down' : 'neutral'} valueTone={items.length ? 'default' : 'success'} />
        <MetricCard label="Median decision time" value={waitLabel(medianLatency)} hint="24h" delta="target under 3m" deltaType="neutral" />
        <MetricCard label="Approval rate" value={`${approvalRate}%`} hint="24h" delta={`${approvals} of ${history.length} approved`} deltaType="up" valueTone="success" />
        <MetricCard label="Undo window open" value={openUndo} hint="executed" delta={`${UNDO_MIN} min after each reversible action`} deltaType="neutral" />
      </div>

      {/* Mail client */}
      <div style={{ margin: '0 20px 24px', border: `1px solid ${line}`, borderRadius: 12, overflow: 'hidden', background: surface, display: 'flex', height: CLIENT_H }} className="relay-mail">
        {/* Folder rail */}
        <nav style={{ width: railOpen ? 210 : 56, flex: '0 0 auto', borderRight: `1px solid ${line}`, background: surfaceAlt, display: 'flex', flexDirection: 'column', transition: 'width 0.18s ease' }} className="relay-rail" aria-label="Folders">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: railOpen ? 'space-between' : 'center', padding: '12px 10px 10px', gap: 6 }}>
            {railOpen ? <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: faint, paddingLeft: 4 }}>Folders</span> : null}
            <button type="button" onClick={() => setRailOpen((o) => !o)} aria-label={railOpen ? 'Collapse folders' : 'Expand folders'} aria-expanded={railOpen} title={railOpen ? 'Collapse' : 'Expand'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: 0, background: 'transparent', color: muted, cursor: 'pointer' }}>
              <Glyph d={railOpen ? ICON.chevronL : ICON.chevronR} size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: railOpen ? '0 8px' : '0 6px', overflowY: 'auto' }}>
            {FOLDERS.map((f) => {
              const active = folder === f.id;
              const count = counts[f.id];
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => openFolder(f.id)}
                  aria-current={active ? 'page' : undefined}
                  aria-label={!railOpen ? `${f.label}${count ? ` (${count})` : ''}` : undefined}
                  title={!railOpen ? `${f.label}${count ? ` (${count})` : ''}` : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: railOpen ? 'flex-start' : 'center', padding: railOpen ? '8px 10px' : '8px 0', borderRadius: 7, border: 0, background: active ? surface : 'transparent', boxShadow: active ? 'inset 0 0 0 1px var(--border, #e4e4e7)' : 'none', color: active ? ink : muted, cursor: 'pointer', font: `500 13px ${sans}`, position: 'relative' }}
                >
                  <span style={{ display: 'inline-flex', color: active ? (f.id === 'inbox' ? accent : ink) : faint }}><Glyph d={f.icon} size={17} /></span>
                  {railOpen ? <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</span> : null}
                  {count > 0 ? (
                    railOpen
                      ? <span style={{ font: `11px ${mono}`, fontWeight: 600, color: f.id === 'inbox' ? accent : faint }}>{count}</span>
                      : <span style={{ position: 'absolute', top: 3, right: 6, minWidth: 15, height: 15, padding: '0 3px', borderRadius: 999, background: f.id === 'inbox' ? accent : faint, color: 'var(--bg, #fff)', font: `9px ${mono}`, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {railOpen ? (
            <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: `1px solid ${line}`, fontSize: 11.5, color: faint, lineHeight: 1.5 }}>
              Signed in as<br /><span style={{ color: muted, fontWeight: 600 }}>{REVIEWER}</span>
            </div>
          ) : null}
        </nav>

        {fullWidth ? (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {folder === 'activity' ? (
              <>
                <ListHeader title="Activity log" meta={`${auditEvents.length} events`} />
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <AuditLog title="" events={auditEvents} now={auditNow} defaultRange="all" defaultSort="desc" height={CLIENT_H - 46} />
                </div>
              </>
            ) : folder === 'executed' ? (
              <>
                <ListHeader title="Executed" meta={`${actions.length} actions · ${openUndo} can be undone`} />
                <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 16, display: 'grid', gap: 10, alignContent: 'start' }}>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: muted, maxWidth: 680 }}>
                    What {AGENT} carried out, after your approval or inside its own autonomy. Reversible actions keep an Undo button for {UNDO_MIN} minutes, then lock.
                  </p>
                  <ActionHistory title="Done by Operator" actions={actions} now={clock} onUndo={undo} />
                </div>
              </>
            ) : (
              <>
                <ListHeader title="Autonomy" meta={`${Object.values(autonomy).filter((l) => l === 'autonomous').length} kinds run on their own`} />
                <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 16, display: 'grid', gap: 20, alignContent: 'start' }}>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: muted, maxWidth: 680 }}>
                    How far {AGENT} may go before it asks. Set a kind to act on its own and new requests of that kind skip your inbox and land in Executed. Try it with Escalation, then use Simulate incoming.
                  </p>
                  {AUTONOMY.map((a) => (
                    <AutonomySetting
                      key={a.kind}
                      label={a.kind}
                      task={a.task}
                      value={autonomy[a.kind]}
                      disabled={a.locked}
                      descriptions={a.locked ? { confirm: 'Erasure cannot be undone, so it always waits for a person. This is set by policy.' } : undefined}
                      onChange={(level) => changeAutonomy(a.kind, a.task, level)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Message list */}
            <div style={{ width: 340, flex: '0 0 auto', borderRight: `1px solid ${line}`, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="relay-list">
              <ListHeader
                title={activeFolderMeta.label}
                meta={folder === 'inbox' ? (items.length ? `${items.length} waiting` : 'Inbox zero') : `${decidedList.length}`}
                tone={folder === 'inbox' && items.length ? 'warning' : undefined}
              />
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '7px 14px 4px', font: `11px ${mono}`, color: faint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{folder === 'inbox' ? 'Awaiting review' : 'Reviewed'}</div>
                {listRows}
              </div>
            </div>

            {/* Reading pane */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {pendingSelected ? (
                <PendingReader
                  key={pendingSelected.key}
                  it={pendingSelected}
                  wait={liveWait(pendingSelected)}
                  onDecide={(decision, opts) => decide(pendingSelected, decision, opts)}
                  note={(t) => toast({ tone: 'info', title: t })}
                />
              ) : decidedSelected ? (
                <DecidedReader key={decidedSelected.key} d={decidedSelected} now={now} clock={clock} undone={undone} actions={actions} onUndo={undo} />
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: faint, padding: 24, textAlign: 'center' }}>
                  <span style={{ color: truth, marginBottom: 12 }}><Glyph d={ICON.check} size={34} width={1.4} /></span>
                  <div style={{ fontWeight: 650, color: muted, fontSize: 15 }}>{folder === 'inbox' ? 'Inbox zero' : 'Nothing selected'}</div>
                  <div style={{ fontSize: 13.5, marginTop: 6, maxWidth: 340, lineHeight: 1.6 }}>
                    {folder === 'inbox' ? <>Every request has been reviewed. Use <span style={{ color: ink, fontWeight: 600 }}>Simulate incoming</span> to watch a new approval land.</> : 'Pick a request from the list to read it.'}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (min-width: 720px){ .relay-metrics{ grid-template-columns: repeat(4, minmax(0,1fr)); } }
        @media (max-width: 920px){
          .relay-mail{ flex-direction: column; height: auto !important; }
          .relay-rail{ width: 100% !important; flex-direction: row !important; overflow-x: auto; align-items: center; }
          .relay-rail > div{ flex-direction: row !important; }
          .relay-list{ width: 100% !important; max-height: 320px; }
        }
      `}</style>
    </div>
  );
}

function ListHeader({ title, meta, tone }: { title: string; meta: string; tone?: BadgeProps['tone'] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', borderBottom: `1px solid ${line}`, background: surface }}>
      <span style={{ fontWeight: 650, fontSize: 14 }}>{title}</span>
      {tone ? <Badge tone={tone} dot>{meta}</Badge> : <span style={{ font: `12px ${mono}`, color: faint }}>{meta}</span>}
    </div>
  );
}

function EmptyList({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: faint }}>
      <span style={{ color: truth, display: 'inline-flex', marginBottom: 10 }}><Glyph d={ICON.check} size={26} width={1.5} /></span>
      <div style={{ fontWeight: 650, color: muted }}>{label}</div>
      <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function ReaderHeader({ subject, requester, channel, actionKind, risk, right, extra }: { subject: string; requester: string; channel: string; actionKind: string; risk: Risk; right: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${line}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ font: `650 17px ${sans}`, margin: 0, letterSpacing: '-0.01em' }}>{subject}</h2>
        {right}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        <Avatar name={requester} initials={initials(requester)} size="md" tone="neutral" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{requester}</div>
          <div style={{ font: `12px ${mono}`, color: faint }}>{channel} · {actionKind} · to <span style={{ color: muted }}>Relay approvals</span></div>
        </div>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {extra}
          <Badge tone={RISK_TONE[risk]} size="md">{risk} risk</Badge>
        </span>
      </div>
    </div>
  );
}

function PendingReader({ it, wait, onDecide, note }: { it: PendingItem; wait: number; onDecide: (d: Decision, opts?: { reason?: string; edits?: Record<string, string> }) => void; note: (t: string) => void }) {
  const over = wait > it.slaSec;
  const conf = confidenceOf(it);
  const passed = it.checks.filter((c) => c.state === 'pass').length;
  const counted = it.checks.filter((c) => c.state !== 'not_applicable').length;
  return (
    <>
      <ReaderHeader
        subject={it.subject}
        requester={it.requester}
        channel={it.channel}
        actionKind={it.actionKind}
        risk={it.risk}
        extra={<ConfidenceBadge state={conf.state} score={it.confidence} scope={`${passed} of ${counted} checks passed`} reason={conf.reason} />}
        right={
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: `650 18px ${mono}`, color: over ? fault : ink }}>{waitLabel(wait)}</div>
            <div style={{ fontSize: 11, color: faint }}>waiting · SLA {waitLabel(it.slaSec)}</div>
          </div>
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>{it.context}</p>
        <ToolCall name={it.tool} status="approval" description={`Held for ${REVIEWER}`} input={it.input}>
          <ApprovalCard
            title={it.title}
            action={it.proposal}
            agent={AGENT}
            target={it.target}
            reason={it.why}
            risk={it.risk}
            reversible={it.reversible}
            changes={it.changes}
            evidence={it.evidence}
            approveLabel="Approve and run"
            requireRejectReason={it.risk === 'high' || it.risk === 'critical'}
            onApprove={() => onDecide('approved')}
            onEdit={(edits) => onDecide('approved', { edits })}
            onReject={(reason) => onDecide('rejected', { reason })}
          />
        </ToolCall>
        <AIResponse
          model={it.model}
          duration={it.duration}
          tokens={it.tokens}
          text={it.reply}
          thinking={it.reasoning}
          thinkingLabel="Show agent reasoning"
          citations={[{ label: 'policy 4.2, approval ceilings', note: 'Actions above the ceiling require human sign-off' }, { label: it.key }]}
          onFeedback={(v) => v && note(v === 'up' ? 'Thumbs up noted on the draft reply' : 'Thumbs down noted on the draft reply')}
          onCopy={() => note('Draft reply copied')}
        />
        <p style={{ margin: '-8px 0 0', fontSize: 12, color: faint }}>Draft reply. It goes to {it.requester} only if you approve.</p>
        <ExecutionTrace title="Agent trace" steps={it.steps} calls={it.calls} duration={it.duration} tokens={it.tokens} cost={it.cost} />
        <InvariantPanel title="Guardrail checks" invariants={it.checks} scope={it.key} compact />
      </div>
    </>
  );
}

function DecidedReader({ d, now, clock, undone, actions, onUndo }: { d: DecidedItem; now: number; clock: number; undone: Record<string, number>; actions: AgentAction[]; onUndo: (id: string) => void }) {
  const meta = DECISION_META[d.decision];
  const snap = d.snapshot;
  const x = execOf(d, now, undone);
  const action = actions.find((a) => a.id === d.key);
  const elapsed = x && snap ? Math.min(snap.execSec, now - d.execAt!) : 0;

  // An erasure runs as a plan: each step completes as the tool call progresses.
  const planSteps: PlanStep[] | null = snap?.plan && x
    ? snap.plan.map((s, i) => {
        const doneAt = (i + 1) / snap.plan!.length;
        const startAt = i / snap.plan!.length;
        const status = x.p >= doneAt ? 'done' : x.p >= startAt ? 'running' : 'pending';
        return { id: `s${i}`, label: s.label, detail: s.detail, status };
      })
    : null;

  return (
    <>
      <ReaderHeader
        subject={d.subject}
        requester={d.requester}
        channel={d.channel}
        actionKind={d.actionKind}
        risk={d.risk}
        right={x?.state === 'undone' ? <Badge tone="neutral" size="md" dot>Undone</Badge> : <Badge tone={meta.tone} size="md" dot>{d.edited ? 'Approved with edits' : meta.label}</Badge>}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ApprovalCard
          title={snap?.title ?? d.subject}
          action={d.proposal}
          agent={AGENT}
          target={snap?.target}
          reason={snap?.why}
          risk={d.risk}
          reversible={snap?.reversible}
          changes={d.changes ?? []}
          evidence={snap?.evidence ?? []}
          status={d.decision}
          decidedBy={d.reviewer}
          decidedAt={`${hhmm(d.ts)} UTC · after ${waitLabel(d.latencySec)}`}
          rejectReason={d.decision === 'rejected' ? d.note : undefined}
        />
        {x && snap ? (
          <ToolCall
            name={snap.tool}
            status={x.state === 'running' ? 'running' : x.state === 'done' ? 'done' : 'failed'}
            description={x.state === 'running' ? `Running your approval · ${Math.round(x.p * 100)}%` : x.state === 'done' ? snap.doneLabel : 'Undone'}
            input={d.input}
            output={x.state === 'done' ? snap.output : undefined}
            error={x.state === 'undone' ? `Undone by ${REVIEWER} at ${hhmm(undone[d.key])} UTC. ${AGENT} reversed what it had changed.` : undefined}
            duration={waitLabel(elapsed)}
            defaultOpen={x.state !== 'done'}
          />
        ) : null}
        {planSteps && x ? (
          <PlanView
            title="Erasure plan"
            status={x.state === 'undone' ? 'failed' : x.state === 'done' ? 'done' : 'running'}
            steps={planSteps}
            elapsed={waitLabel(elapsed)}
          />
        ) : null}
        {action && d.decision === 'approved' ? <ActionHistory title="Undo window" actions={[action]} now={clock} onUndo={onUndo} /> : null}
        {d.decision === 'approved' ? (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: faint, marginBottom: 6 }}>Reviewer note</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>{d.note}</p>
          </div>
        ) : null}
        {snap ? (
          <>
            <ExecutionTrace title="Agent trace" steps={snap.steps} calls={snap.calls} duration={snap.duration} tokens={snap.tokens} cost={snap.cost} />
            <InvariantPanel title="Guardrail checks" invariants={snap.checks} scope={snap.key} compact />
          </>
        ) : null}
      </div>
    </>
  );
}

export default function RelayExample() {
  return (
    <ThemedShell>
      <ToastProvider placement="bottom">
        <RelayInner />
      </ToastProvider>
    </ThemedShell>
  );
}
