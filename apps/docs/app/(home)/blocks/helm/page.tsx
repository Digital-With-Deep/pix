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
  Conversation,
  MetricCard,
  PlanView,
  PromptInput,
  StageFlow,
  ToastProvider,
  ToolCall,
  useToast,
  type AgentAction,
  type ApprovalChange,
  type AutonomyLevel,
  type ConversationMessage,
  type PlanStep,
} from '@pix-ui/react';

// Helm dogfoods PIX: one executive's working day at a fictional company, run
// as a system of action rather than a system of intelligence. Agents do not
// stop at an insight. They do the work in the background, log every action
// with an undo window, and bring forward only the decisions a person has to
// make. The COO opens the day, clears the decision queue, and each approval
// starts the matching tool call in the Running now panel. Every surface is a
// real @pix-ui/react component styled only with PIX tokens, so it flips with
// the theme. Time is a fixed anchor plus seconds since mount, and every
// background job is derived from that count, so the static export and the
// client agree on first paint — no Date.now() or Math.random() here.
// Halden & Co., its people, customers and suppliers are all made up.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surface = 'var(--surface, #ffffff)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';
const accent = 'var(--accent, #10b981)';
const truth = 'var(--truth, #059669)';
const fault = 'var(--fault, #d97706)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui)';

const ICON = {
  chat: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
  refresh: 'M4.5 12a7.5 7.5 0 0113.06-5.06M19.5 4.5v3.75h-3.75M19.5 12a7.5 7.5 0 01-13.06 5.06M4.5 19.5v-3.75h3.75',
  x: 'M6 18L18 6M6 6l12 12',
};

const EXEC = 'Priya Raman';
const COMPANY = 'Halden & Co.';
const STAFF = 'Chief of staff agent';
const OVERNIGHT = 214; // things the agents did between 18:00 and 07:30
const ANCHOR = Date.UTC(2026, 10, 24, 8, 12, 0); // Tue Nov 24, 08:12 in London (GMT = UTC)
const MIN = 60_000;
const UNDO_MIN = 10; // undo window after an approval, in minutes
const MIN_PER_ACTION = 3.4; // average minutes a person would have spent per action

type Risk = 'low' | 'medium' | 'high' | 'critical';

interface Decision {
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
  stake: number;
  waitingMin: number; // how long it had waited when the page opened
  exec: { seconds: number; input: Record<string, unknown>; output: Record<string, unknown>; done: string };
}

const DECISIONS: Decision[] = [
  {
    key: 'ship',
    title: 'Re-route a supplier shipment',
    action: 'logistics.reroute_shipment',
    agent: 'Supply agent',
    target: 'PO 77120 · Brightmoor Components',
    reason: 'A port strike pushes the current routing past the Dec 7 production run on line 3. The new route lands four days earlier for a fixed fee.',
    risk: 'high',
    reversible: true,
    changes: [
      { field: 'Carrier', before: 'Northline Freight', after: 'Tidewell Logistics', editable: false },
      { field: 'Arrival', before: 'Dec 9', after: 'Dec 3', editable: false },
      { field: 'Added cost', key: 'cost', before: '$0', after: '$18,400' },
    ],
    evidence: ['Port strike notice', 'Line 3 build plan', 'Carrier quotes, 3'],
    stake: 2_600_000,
    waitingMin: 41,
    exec: { seconds: 9, input: { po: 'PO 77120', carrier: 'Tidewell Logistics', cost: '$18,400' }, output: { booked: true, eta: '2026-12-03', line_3: 'on plan' }, done: 'Shipment re-routed' },
  },
  {
    key: 'price',
    title: 'Approve a 4% price change for the Midwest region',
    action: 'pricing.publish_price_list',
    agent: 'Pricing agent',
    target: 'Midwest region · 38 SKUs',
    reason: 'Three competitors raised prices 5 to 7% this month and Midwest demand has held for six weeks. Forecast volume loss is under 1%.',
    risk: 'medium',
    reversible: true,
    changes: [
      { field: 'List price change', key: 'change', before: '0%', after: '+4%' },
      { field: 'Effective', key: 'effective', before: null, after: '2026-12-01' },
      { field: 'Projected margin', before: '31.2%', after: '33.0%', editable: false },
    ],
    evidence: ['Competitor scan, 38 SKUs', 'Elasticity run PR-118', 'Midwest demand, 6 weeks'],
    stake: 1_200_000,
    waitingMin: 188,
    exec: { seconds: 11, input: { region: 'Midwest', skus: 38, change: '+4%', effective: '2026-12-01' }, output: { published: 38, channels: ['web', 'distributor feed'] }, done: 'Midwest price list published' },
  },
  {
    key: 'renewal',
    title: 'Extend a renewal discount to a key account',
    action: 'crm.apply_renewal_terms',
    agent: 'Revenue agent',
    target: 'A-1180 · Corvane Health',
    reason: 'The account is evaluating a competitor. Two more points for a two-year term stays inside the discount policy.',
    risk: 'low',
    reversible: true,
    changes: [
      { field: 'Discount', key: 'discount', before: '8%', after: '10%' },
      { field: 'Term', before: '12 months', after: '24 months', editable: false },
    ],
    evidence: ['Usage up 41% this year', 'Competitor demo booked', 'Discount policy 4.2'],
    stake: 340_000,
    waitingMin: 72,
    exec: { seconds: 7, input: { account: 'A-1180', discount: '10%', term_months: 24 }, output: { quote: 'Q-90233', sent_for_signature: true }, done: 'Renewal terms sent for signature' },
  },
  {
    key: 'accrual',
    title: 'Sign off on the Q4 freight accrual',
    action: 'ledger.post_accrual',
    agent: 'Close agent',
    target: 'JE-Q4-0412 · Q4 FY2026',
    reason: 'Carrier surcharges since October are not invoiced yet. The agent matched 1,204 receipts; 17 lines are estimates and are listed in the reconciliation.',
    risk: 'high',
    reversible: false,
    changes: [
      { field: 'Accrued freight', key: 'amount', before: '$2,140,000', after: '$2,385,000' },
      { field: 'Variance to forecast', before: null, after: '+11.4%', editable: false },
    ],
    evidence: ['Unbilled receipts, 1,204 lines', 'Carrier rate cards', 'Reconciliation REC-Q4-07'],
    stake: 245_000,
    waitingMin: 26,
    exec: { seconds: 10, input: { entry: 'JE-Q4-0412', amount: '$2,385,000', period: 'Q4 FY2026' }, output: { posted: true, entities: 4 }, done: 'Freight accrual posted' },
  },
  {
    key: 'offer',
    title: 'Approve the hiring offer within band',
    action: 'hr.send_offer',
    agent: 'Hiring agent',
    target: 'ENG-2291 · Senior data engineer',
    reason: 'Inside the L5 band and below the competing offer the candidate shared. The panel was unanimous and both references are back.',
    risk: 'medium',
    reversible: false,
    changes: [
      { field: 'Base salary', key: 'base', before: null, after: '$168,000' },
      { field: 'Sign-on bonus', key: 'bonus', before: null, after: '$10,000' },
      { field: 'Start date', key: 'start', before: null, after: '2027-01-11' },
    ],
    evidence: ['Band L5: $150k to $175k', 'Panel: 4 of 4 hire', 'References: 2 of 2'],
    stake: 178_000,
    waitingMin: 15,
    exec: { seconds: 6, input: { req: 'ENG-2291', base: '$168,000', bonus: '$10,000' }, output: { offer: 'OF-3381', sent: true }, done: 'Offer sent' },
  },
  {
    key: 'vendor',
    title: 'Pay a vendor early for a 2% discount',
    action: 'payables.schedule_payment',
    agent: 'Vendor agent',
    target: 'INV-55102 · Ostrander Packaging',
    reason: 'Paying by Nov 26 earns the early payment discount in the contract, and cash stays above the weekly floor.',
    risk: 'low',
    reversible: true,
    changes: [
      { field: 'Pay date', key: 'pay_on', before: '2026-12-20', after: '2026-11-26' },
      { field: 'Amount', before: '$245,000', after: '$240,100', editable: false },
    ],
    evidence: ['Contract OP-7, clause 7', 'Cash position, Nov 24'],
    stake: 4_900,
    waitingMin: 9,
    exec: { seconds: 6, input: { invoice: 'INV-55102', pay_on: '2026-11-26', amount: '$240,100' }, output: { scheduled: true, saved: '$4,900' }, done: 'Early payment scheduled' },
  },
];

// ---------------------------------------------------------------------------
// Background work: each agent cycles through its own jobs. Everything is a
// pure function of seconds since mount, so nothing random runs at render.
// ---------------------------------------------------------------------------

interface Job {
  tool: string;
  label: string;
  seconds: number;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  done: string;
  target: string;
}

interface Lane {
  agent: string;
  offset: number; // seconds the first job had already run when the page opened
  jobs: Job[];
}

const GAP = 3; // seconds between one job finishing and the next starting

const LANES: Lane[] = [
  {
    agent: 'Close agent',
    offset: 14,
    jobs: [
      { tool: 'ledger.match_receipts', label: 'Matching unbilled receipts', seconds: 26, input: { lines: 1204, entities: 4 }, output: { matched: 1187, estimated: 17 }, done: 'Matched unbilled receipts', target: 'REC-Q4-07' },
      { tool: 'ledger.reconcile_intercompany', label: 'Reconciling intercompany balances', seconds: 22, input: { pairs: 6 }, output: { cleared: 6, breaks: 0 }, done: 'Reconciled intercompany', target: '6 entity pairs' },
    ],
  },
  {
    agent: 'Pricing agent',
    offset: 6,
    jobs: [
      { tool: 'pricing.scan_competitors', label: 'Scanning competitor prices', seconds: 24, input: { skus: 412, regions: 5 }, output: { changed: 23, flagged: 2 }, done: 'Scanned competitor prices', target: '412 SKUs' },
      { tool: 'pricing.check_floors', label: 'Checking margin floors', seconds: 16, input: { skus: 412 }, output: { below_floor: 0 }, done: 'Checked margin floors', target: '412 SKUs' },
    ],
  },
  {
    agent: 'Supply agent',
    offset: 11,
    jobs: [
      { tool: 'carrier.track_shipments', label: 'Tracking open shipments', seconds: 20, input: { shipments: 312 }, output: { on_time: 305, late: 7, rebooked: 3 }, done: 'Rebooked late shipments', target: '312 shipments' },
      { tool: 'supplier.score_risk', label: 'Scoring supplier risk', seconds: 25, input: { suppliers: 88 }, output: { watch: 4 }, done: 'Scored supplier risk', target: '88 suppliers' },
    ],
  },
  {
    agent: 'Hiring agent',
    offset: 3,
    jobs: [
      { tool: 'calendar.schedule_interviews', label: 'Scheduling interviews', seconds: 18, input: { candidates: 6, panels: 3 }, output: { booked: 6 }, done: 'Scheduled interviews', target: '6 candidates' },
      { tool: 'ats.screen_applicants', label: 'Screening applicants', seconds: 28, input: { req: 'ENG-2304', applicants: 57 }, output: { shortlisted: 9 }, done: 'Screened applicants', target: 'ENG-2304' },
    ],
  },
  {
    agent: 'Revenue agent',
    offset: 17,
    jobs: [
      { tool: 'crm.draft_renewals', label: 'Drafting renewal quotes', seconds: 23, input: { accounts: 18 }, output: { drafted: 18, within_policy: 17 }, done: 'Drafted renewal quotes', target: '18 accounts' },
      { tool: 'usage.watch_signals', label: 'Watching usage signals', seconds: 19, input: { accounts: 240 }, output: { at_risk: 3 }, done: 'Flagged at-risk accounts', target: '240 accounts' },
    ],
  },
  {
    agent: 'Vendor agent',
    offset: 8,
    jobs: [
      { tool: 'payables.match_invoices', label: 'Three-way matching invoices', seconds: 21, input: { invoices: 140 }, output: { matched: 137, held: 3 }, done: 'Matched invoices to orders', target: '140 invoices' },
      { tool: 'payables.find_duplicates', label: 'Checking for duplicate invoices', seconds: 15, input: { invoices: 140 }, output: { duplicates: 1 }, done: 'Blocked a duplicate invoice', target: 'INV-55131' },
    ],
  },
];

interface LaneState {
  current: { k: number; job: Job; start: number; end: number; queued: boolean };
  completed: { k: number; job: Job; end: number }[];
  total: number;
}

function laneAt(lane: Lane, elapsed: number): LaneState {
  const completed: LaneState['completed'] = [];
  let t = -lane.offset;
  let k = 0;
  let total = 0;
  for (;;) {
    const job = lane.jobs[k % lane.jobs.length];
    if (t + job.seconds > elapsed) {
      return { current: { k, job, start: t, end: t + job.seconds, queued: elapsed < t }, completed: completed.slice(-4), total };
    }
    completed.push({ k, job, end: t + job.seconds });
    total += 1;
    t += job.seconds + GAP;
    k += 1;
  }
}

// ---------------------------------------------------------------------------
// The day
// ---------------------------------------------------------------------------

const DAY = [
  { at: '07:30', title: 'Morning brief', note: `${STAFF} wrote it from ${OVERNIGHT} overnight actions` },
  { at: '08:00', title: 'Decision block', note: 'Clear the queue, about 15 minutes' },
  { at: '09:30', title: 'Operations review', note: 'Supply agent attached the pre-read' },
  { at: '11:00', title: 'Board prep', note: 'Close agent is drafting the Q4 pack' },
  { at: '12:30', title: 'Lunch', note: 'Held. Nothing gets booked here' },
  { at: '14:00', title: 'Corvane Health call', note: 'Revenue agent briefs you at 13:45' },
  { at: '15:30', title: 'Decision block', note: 'Whatever the agents escalate' },
  { at: '17:30', title: 'Day wrap', note: `Written by the ${STAFF.toLowerCase()}` },
  { at: '18:00', title: 'Offline', note: 'Agents keep working. Only critical decisions page you' },
];
const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

const SEED_ACTIONS: AgentAction[] = [
  { id: 'n1', at: ANCHOR - 7 * 60 * MIN, agent: 'Vendor agent', action: 'Paid invoices on terms', target: 'Run PAY-1124', status: 'done', detail: '41 invoices, all matched to receipts' },
  { id: 'n2', at: ANCHOR - 6 * 60 * MIN, agent: 'Close agent', action: 'Pulled sub-ledgers', target: '4 entities', status: 'done', undoUntil: ANCHOR - 5 * 60 * MIN },
  { id: 'n3', at: ANCHOR - 5 * 60 * MIN - 12 * MIN, agent: 'Supply agent', action: 'Rebooked delayed containers', target: 'PO 77031', status: 'done', detail: 'Same cost, two days earlier' },
  { id: 'n4', at: ANCHOR - 3 * 60 * MIN, agent: 'Revenue agent', action: 'Applied a renewal discount', target: 'A-1042', status: 'done', undoUntil: ANCHOR + 40 * MIN, detail: '6%, inside its 8% limit' },
  { id: 'n5', at: ANCHOR - 2 * 60 * MIN, agent: 'Pricing agent', action: 'Matched a competitor promotion', target: 'SKU HX-220', status: 'done', undoUntil: ANCHOR + 20 * MIN, detail: 'Ends Nov 30 on its own' },
  { id: 'n6', at: ANCHOR - 90 * MIN, agent: 'Hiring agent', action: 'Scheduled interviews', target: '4 openings', status: 'done', detail: '9 interviews, no clashes' },
  { id: 'n7', at: ANCHOR - 48 * MIN, agent: 'Vendor agent', action: 'Held a payment with changed bank details', target: 'INV-55088', status: 'done', detail: 'A person must clear it with a signed form' },
  { id: 'n8', at: ANCHOR - 25 * MIN, agent: 'Supply agent', action: 'Filed a customs declaration', target: 'CF-2290', status: 'failed', detail: 'The portal rejected it again; retrying at 09:00' },
];

const AUTONOMY: { agent: string; task: string; level: AutonomyLevel }[] = [
  { agent: 'Pricing agent', task: 'price changes over 2%', level: 'confirm' },
  { agent: 'Close agent', task: 'journal entries over $100k', level: 'confirm' },
  { agent: 'Supply agent', task: 'shipment re-routes with added cost', level: 'confirm' },
  { agent: 'Hiring agent', task: 'offers inside the band', level: 'confirm' },
  { agent: 'Revenue agent', task: 'renewal discounts up to 8%', level: 'autonomous' },
  { agent: 'Vendor agent', task: 'early payment discounts', level: 'propose' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function money(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
const hhmm = (ms: number) => new Date(ms).toISOString().slice(11, 16);
function since(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}
function clock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

interface Execution {
  id: string;
  key: string;
  startedAt: number; // seconds since mount
  input: Record<string, unknown>;
  stopped: boolean;
}

// ---------------------------------------------------------------------------
// Chief of staff: canned answers that read the live state.
// ---------------------------------------------------------------------------

interface Stream {
  id: string;
  text: string;
  shown: number;
}

function useStreams() {
  const [streams, setStreams] = React.useState<Stream[]>([]);
  const active = streams.find((s) => s.shown < s.text.length);

  React.useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      setStreams((all) => all.map((s) => (s.id === active.id ? { ...s, shown: Math.min(s.text.length, s.shown + 6) } : s)));
    }, 24);
    return () => clearTimeout(t);
  }, [active]);

  const start = React.useCallback((id: string, text: string) => {
    setStreams((all) => [...all.filter((s) => s.id !== id), { id, text, shown: 0 }]);
  }, []);
  const clear = React.useCallback(() => setStreams([]), []);

  return { streams, start, clear, busy: Boolean(active) };
}

const BRIEF = [
  `**Morning, Priya.** The agents did ${OVERNIGHT} things overnight and logged each one. Six need you, so I blocked 08:00 to 08:15 for them.`,
  '',
  '- **Re-route the Brightmoor shipment.** Without it the Dec 7 run on line 3 slips. It costs $18,400.',
  '- **Midwest price change.** +4% on 38 SKUs, worth about $1.2M a year.',
  '- **Q4 freight accrual.** $2.385M, cannot be undone once posted.',
  '',
  'The other three are routine and inside policy. I declined two meetings that the agents already answered.',
].join('\n');

function answer(question: string, pending: Decision[], actions: number) {
  const q = question.toLowerCase();
  const left = pending.length
    ? pending.map((d) => `- ${d.title} · ${d.agent} · ${money(d.stake)} at stake`).join('\n')
    : '- Nothing. The queue is clear.';
  if (/urgent|first|priority|left|queue|need/.test(q)) {
    return pending.length
      ? `Here is what still needs you, largest stake first:\n\n${left}\n\nIf you only have two minutes, do the first one. Everything else can wait until the 15:30 block.`
      : 'Nothing needs you right now. The agents keep working, and new decisions will appear in the queue. I will page you only for critical ones.';
  }
  if (/overnight|did|done|happen/.test(q)) {
    return `Since 18:00 yesterday the agents have taken **${actions} actions**. The highlights:\n\n- Vendor agent paid 41 invoices on terms and held one with changed bank details.\n- Supply agent rebooked delayed containers at no extra cost.\n- Revenue agent applied a 6% renewal discount, inside its limit.\n\nEvery action is in **Done without you**, with Undo while its window is open.`;
  }
  if (/price|pricing|midwest/.test(q)) {
    return 'Pricing agent wants **+4% on 38 Midwest SKUs** from Dec 1. Three competitors moved 5 to 7% this month and demand held for six weeks, so the forecast volume loss is under 1%. It can be undone, and you can edit the percentage before you approve.';
  }
  if (/accrual|close|freight|ledger/.test(q)) {
    return 'Close agent matched **1,204 unbilled receipts** and estimates the Q4 freight accrual at **$2,385,000**, 11.4% over forecast because of carrier surcharges. 17 lines are estimates, all listed in REC-Q4-07. Posting cannot be undone, which is why it waits for you.';
  }
  if (/offer|hire|hiring|salary|candidate/.test(q)) {
    return 'Hiring agent proposes **$168,000 base** and a $10,000 sign-on bonus for ENG-2291. That is inside the L5 band, the panel was 4 of 4 hire, and both references are back.';
  }
  if (/ship|supply|route|strike|brightmoor/.test(q)) {
    return 'A port strike delays PO 77120 past the **Dec 7** production run. Supply agent has a quote from Tidewell Logistics that lands **Dec 3** for **$18,400**. It can be undone until the booking is confirmed.';
  }
  return `I will route that to the right agent and bring it back only if it needs a decision from you.\n\n- Agents act on their own inside the limits you set under **Autonomy**.\n- Anything above a limit lands in your decision queue.`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function HelmInner() {
  const { toast } = useToast();
  const [elapsed, setElapsed] = React.useState(0);
  const [decided, setDecided] = React.useState<Record<string, 'approved' | 'rejected'>>({});
  const [executions, setExecutions] = React.useState<Execution[]>([]);
  const [logged, setLogged] = React.useState<AgentAction[]>([]);
  const [undone, setUndone] = React.useState<Record<string, true>>({});
  const [autonomy, setAutonomy] = React.useState<Record<string, AutonomyLevel>>(() => Object.fromEntries(AUTONOMY.map((a) => [a.agent, a.level])));
  const [drawer, setDrawer] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [turns, setTurns] = React.useState<{ id: string; question: string }[]>([]);
  const { streams, start, clear, busy } = useStreams();

  React.useEffect(() => {
    const t = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer]);

  const now = ANCHOR + elapsed * 1000;
  const nowMin = toMin(hhmm(now));
  const pending = DECISIONS.filter((d) => !decided[d.key]);
  const decidedN = Object.keys(decided).length;
  const stake = pending.reduce((sum, d) => sum + d.stake, 0);

  // Background lanes, derived from the clock.
  const lanes = LANES.map((lane) => ({ lane, state: laneAt(lane, elapsed) }));
  const backgroundDone = lanes.reduce((sum, l) => sum + l.state.total, 0);

  // Executions started by approvals.
  const execStatus = (x: Execution) => {
    const d = DECISIONS.find((dd) => dd.key === x.key)!;
    const p = Math.min(1, (elapsed - x.startedAt) / d.exec.seconds);
    return { d, p, state: x.stopped ? ('failed' as const) : p >= 1 ? ('done' as const) : ('running' as const) };
  };
  const executedN = executions.filter((x) => execStatus(x).state === 'done').length;
  const actionsToday = OVERNIGHT + backgroundDone + executedN;
  const hoursSaved = ((actionsToday * MIN_PER_ACTION) / 60).toFixed(1);
  const working = lanes.filter((l) => !l.state.current.queued).length + executions.filter((x) => execStatus(x).state === 'running').length;

  const history: AgentAction[] = [
    ...SEED_ACTIONS,
    ...lanes.flatMap(({ lane, state }) =>
      state.completed.map((c) => ({
        id: `${lane.agent}-${c.k}`,
        at: ANCHOR + c.end * 1000,
        agent: lane.agent,
        action: c.job.done,
        target: c.job.target,
        status: 'done' as const,
        undoUntil: ANCHOR + c.end * 1000 + 15 * MIN,
        detail: 'Inside its limits, so it ran on its own',
      })),
    ),
    ...logged,
  ].map((a) => (undone[a.id] ? { ...a, status: 'undone' as const, detail: `Undone by ${EXEC}` } : a));

  const undo = (id: string) => {
    setUndone((u) => ({ ...u, [id]: true }));
    setExecutions((all) => all.map((x) => (x.id === id ? { ...x, stopped: true } : x)));
    toast({ tone: 'info', title: 'Action undone', description: 'The agent reversed it and logged the undo.' });
  };

  const approve = (d: Decision, edits?: Record<string, string>) => {
    const id = `exec-${d.key}`;
    const input = { ...d.exec.input, ...(edits ?? {}) };
    setDecided((all) => ({ ...all, [d.key]: 'approved' }));
    setExecutions((all) => [{ id, key: d.key, startedAt: elapsed, input, stopped: false }, ...all]);
    setLogged((all) => [
      ...all,
      {
        id,
        at: now,
        agent: d.agent,
        action: d.exec.done,
        target: d.target.split(' · ')[0],
        status: 'done',
        undoUntil: d.reversible ? now + UNDO_MIN * MIN : undefined,
        detail: `Approved${edits && Object.keys(edits).length ? ' with edits' : ''} by ${EXEC}`,
      },
    ]);
    toast({
      tone: 'truth',
      title: `Approved: ${d.title.charAt(0).toLowerCase()}${d.title.slice(1)}`,
      description: `${d.agent} is carrying it out now.${d.reversible ? ` You can undo it for ${UNDO_MIN} minutes.` : ''}`,
      action: d.reversible ? { label: 'Undo', onClick: () => undo(id) } : undefined,
      duration: 6000,
    });
  };

  const reject = (d: Decision, reason?: string) => {
    setDecided((all) => ({ ...all, [d.key]: 'rejected' }));
    toast({ tone: 'warn', title: `Sent back: ${d.title.charAt(0).toLowerCase()}${d.title.slice(1)}`, description: reason ? `${d.agent} has your reason and will not retry as proposed.` : `${d.agent} will not retry it.` });
  };

  const changeAutonomy = (agent: string, task: string, level: AutonomyLevel) => {
    setAutonomy((all) => ({ ...all, [agent]: level }));
    const words: Record<AutonomyLevel, string> = {
      suggest: `${agent} will only suggest ${task}.`,
      propose: `${agent} will plan ${task} and wait for you to start them.`,
      confirm: `${agent} will bring ${task} to your decision queue.`,
      autonomous: `${agent} will handle ${task} on its own and log each one under Done without you.`,
    };
    toast({ tone: level === 'autonomous' ? 'warn' : 'info', title: 'Autonomy updated', description: words[level] });
  };

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    const id = `turn-${turns.length + 1}`;
    setTurns((t) => [...t, { id, question: text }]);
    setDraft('');
    start(id, answer(text, pending, actionsToday));
  };

  const replay = () => {
    setElapsed(0);
    setDecided({});
    setExecutions([]);
    setLogged([]);
    setUndone({});
    setAutonomy(Object.fromEntries(AUTONOMY.map((a) => [a.agent, a.level])));
    setTurns([]);
    setDraft('');
    clear();
  };

  // Close agent's plan follows the accrual decision.
  const matchLane = lanes.find((l) => l.lane.agent === 'Close agent')!.state;
  const matched = matchLane.total > 0;
  const accrual = decided.accrual;
  const accrualExec = executions.find((x) => x.key === 'accrual');
  const posted = accrualExec ? execStatus(accrualExec).state === 'done' : false;
  const planSteps: PlanStep[] = [
    { id: 'pull', label: 'Pull sub-ledgers from 4 entities', detail: 'Done overnight', status: 'done' },
    { id: 'match', label: 'Match unbilled receipts', detail: '1,204 lines · REC-Q4-07', status: matched ? 'done' : 'running' },
    {
      id: 'signoff',
      label: 'Get sign-off on the freight accrual',
      detail: accrual === 'approved' ? `Signed off by ${EXEC}` : accrual === 'rejected' ? `Sent back by ${EXEC}` : `Waiting on ${EXEC}`,
      status: accrual === 'approved' ? 'done' : accrual === 'rejected' ? 'failed' : matched ? 'running' : 'pending',
    },
    { id: 'post', label: 'Post journal entries', detail: 'JE-Q4-0412', status: accrual === 'rejected' ? 'skipped' : posted ? 'done' : accrual === 'approved' ? 'running' : 'pending' },
    { id: 'pack', label: 'Draft the Q4 board pack', detail: 'For the 11:00 board prep', status: accrual === 'rejected' ? 'skipped' : posted ? 'done' : 'pending' },
  ];
  const planStatus = accrual === 'rejected' ? 'failed' : posted ? 'done' : 'running';

  // Conversation in the chief of staff drawer.
  const messages: ConversationMessage[] = [{ id: 'brief', role: 'assistant', author: STAFF, time: '07:30', content: BRIEF }];
  for (const turn of turns) {
    const s = streams.find((x) => x.id === turn.id);
    messages.push({ id: `${turn.id}-q`, role: 'user', author: EXEC, content: turn.question });
    if (s) messages.push({ id: `${turn.id}-a`, role: 'assistant', author: STAFF, content: s.text.slice(0, s.shown), streaming: s.shown < s.text.length });
  }

  const headline = pending.length
    ? `${pending.length} ${pending.length === 1 ? 'needs' : 'need'} you.`
    : 'Nothing needs you right now.';

  return (
    <div style={{ background: 'var(--bg, #ffffff)', color: ink, minHeight: 'calc(100dvh - 3.5rem)', font: `14px ${sans}` }}>
      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderBottom: `1px solid ${line}`, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontWeight: 650, letterSpacing: '-0.01em' }}>Helm</span>
          <span style={{ fontSize: 12.5, color: faint }}>{COMPANY} · {EXEC}, COO (Chief Operating Officer)</span>
        </div>
        <Badge tone="accent" dot>System of action</Badge>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ font: `12.5px ${mono}`, color: muted }} aria-label={`Time in London ${hhmm(now)}`}>Tue Nov 24 · {hhmm(now)} GMT</span>
          <Button variant="outline" size="sm" iconPath={ICON.refresh} onClick={replay}>Replay day</Button>
          <Button variant="filled" size="sm" iconPath={ICON.chat} onClick={() => setDrawer((o) => !o)}>
            Ask the chief of staff
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '22px 24px 6px', display: 'grid', gap: 8 }}>
        <h1 style={{ margin: 0, font: `700 clamp(22px, 2.6vw, 30px)/1.2 ${sans}`, letterSpacing: '-0.02em' }}>
          Good morning, Priya. Agents did {OVERNIGHT} things overnight. <span style={{ color: pending.length ? fault : truth }}>{headline}</span>
        </h1>
        <p style={{ margin: 0, maxWidth: 820, fontSize: 14.5, lineHeight: 1.6, color: muted }}>
          A system of action, not just a system of intelligence. The agents do not stop at an insight or a dashboard: they do the work, log every
          step with an undo window, and bring forward only the decisions a person has to make. Your job today is to decide.
        </p>
      </section>

      {/* Metrics */}
      <div className="helm-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, padding: '14px 24px 4px' }}>
        <MetricCard
          label="Decisions waiting"
          value={pending.length}
          hint="need you"
          delta={`${pending.filter((d) => d.risk === 'high' || d.risk === 'critical').length} high risk · ${decidedN} decided`}
          deltaType="neutral"
          valueTone={pending.length ? 'warning' : 'success'}
        />
        <MetricCard label="Actions taken today" value={actionsToday.toLocaleString('en-US')} hint="by agents" delta={`+${actionsToday - OVERNIGHT} since you opened Helm`} deltaType="up" />
        <MetricCard label="Hours saved" value={`${hoursSaved} h`} hint="today" delta={`at ${MIN_PER_ACTION} min per action`} deltaType="neutral" />
        <MetricCard label="Value at stake" value={money(stake)} hint="in the queue" delta={pending.length ? `largest: ${pending[0].title.toLowerCase()}` : 'nothing waiting'} deltaType="neutral" valueTone={stake ? 'warning' : 'default'} />
      </div>

      <div className="helm-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20, padding: '16px 24px', alignItems: 'start' }}>
        {/* Day timeline */}
        <nav aria-label="Today" className="helm-rail" style={{ minWidth: 0 }}>
          <h2 style={{ margin: '0 0 10px', font: `600 11px ${sans}`, textTransform: 'uppercase', letterSpacing: '0.06em', color: muted }}>Today</h2>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid' }}>
            {DAY.map((slot, i) => {
              const next = DAY[i + 1];
              const startMin = toMin(slot.at);
              const state = nowMin >= startMin && (!next || nowMin < toMin(next.at)) ? 'now' : nowMin >= startMin ? 'past' : 'later';
              return (
                <li key={`${slot.at}-${slot.title}`} aria-current={state === 'now' ? 'time' : undefined} style={{ display: 'grid', gridTemplateColumns: '44px 14px 1fr', gap: 8, minHeight: 54 }}>
                  <span style={{ font: `12px ${mono}`, color: state === 'later' ? faint : ink, paddingTop: 1 }}>{slot.at}</span>
                  <span aria-hidden="true" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    {next ? <span style={{ position: 'absolute', top: 12, bottom: -2, width: 1, background: line }} /> : null}
                    <span
                      style={{
                        position: 'relative',
                        marginTop: 3,
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: state === 'now' ? accent : state === 'past' ? 'var(--fg3, #78716c)' : surface,
                        border: `1px solid ${state === 'later' ? 'var(--border-strong, #d4d4d8)' : 'transparent'}`,
                        boxShadow: state === 'now' ? '0 0 0 3px var(--accent-bg, #d1fae5)' : 'none',
                      }}
                    />
                  </span>
                  <span style={{ paddingBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: state === 'now' ? 650 : 550, fontSize: 13, color: state === 'later' ? muted : ink }}>
                      {slot.title}
                      {state === 'now' ? <Badge tone="accent">Now</Badge> : null}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, lineHeight: 1.45, color: faint }}>{slot.note}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.5, color: muted, padding: '10px 12px', borderRadius: 8, border: `1px solid ${line}`, background: surfaceAlt }}>
            The chief of staff agent declined two meetings the agents had already answered and moved one to tomorrow.
          </p>
        </nav>

        {/* Decision queue */}
        <section aria-label="Decision queue" style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, font: `650 15px ${sans}` }}>Decision queue</h2>
            <span style={{ font: `12px ${mono}`, color: faint }}>{pending.length} waiting · largest stake first</span>
          </div>
          {pending.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: muted, border: `1px dashed ${line}`, borderRadius: 10, display: 'grid', gap: 12, justifyItems: 'center' }}>
              <span>The queue is clear. The agents keep working, and anything new that needs you will land here.</span>
              <Button variant="outline" size="sm" iconPath={ICON.refresh} onClick={replay}>Replay the morning</Button>
            </div>
          ) : null}
          {pending.map((d) => (
            <div key={d.key} style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', font: `12px ${mono}`, color: faint }}>
                <span>
                  At stake <span style={{ color: ink }}>{money(d.stake)}</span>
                </span>
                <span>Waiting {since(d.waitingMin + Math.floor(elapsed / 60))}</span>
              </div>
              <ApprovalCard
                title={d.title}
                action={d.action}
                agent={d.agent}
                target={d.target}
                reason={d.reason}
                risk={d.risk}
                reversible={d.reversible}
                changes={d.changes}
                evidence={d.evidence}
                requireRejectReason={d.risk === 'high' || d.risk === 'critical'}
                onApprove={() => approve(d)}
                onEdit={(edits) => approve(d, edits)}
                onReject={(reason) => reject(d, reason)}
              />
            </div>
          ))}
        </section>

        {/* Running now */}
        <aside aria-label="Running now" className="helm-running" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ margin: 0, font: `650 15px ${sans}` }}>Running now</h2>
            <Badge tone="info" dot>{working} working</Badge>
          </div>
          <StageFlow
            compact
            caption="Signal to done, today"
            hint={`${hhmm(now)} GMT`}
            stages={[
              { label: 'Sensed', value: (1_906 + backgroundDone * 9).toLocaleString('en-US'), note: 'signals read', progress: 1 },
              { label: 'Acted', value: actionsToday, note: 'on their own', progress: actionsToday / (actionsToday + pending.length) },
              { label: 'Escalated', value: DECISIONS.length, note: 'to you', progress: DECISIONS.length / 10, tone: pending.length ? 'alert' : 'neutral' },
              { label: 'Decided', value: decidedN, note: 'by you', progress: decidedN / DECISIONS.length, tone: decidedN ? 'neutral' : 'idle' },
            ]}
          />
          {executions.map((x) => {
            const { d, p, state } = execStatus(x);
            return (
              <ToolCall
                key={x.id}
                name={d.action}
                status={state}
                description={state === 'running' ? `Carrying out your approval · ${Math.round(p * 100)}%` : state === 'done' ? d.exec.done : 'Stopped'}
                input={x.input}
                output={state === 'done' ? d.exec.output : undefined}
                error={state === 'failed' ? `Undone by ${EXEC}. The agent reversed what it had changed.` : undefined}
                duration={state === 'running' ? clock(Math.max(0, elapsed - x.startedAt)) : state === 'done' ? clock(d.exec.seconds) : undefined}
                defaultOpen={false}
              />
            );
          })}
          {lanes.map(({ lane, state }) => {
            const c = state.current;
            const p = Math.max(0, Math.min(1, (elapsed - c.start) / c.job.seconds));
            return (
              <ToolCall
                key={`${lane.agent}-${c.k}`}
                name={c.job.tool}
                status={c.queued ? 'queued' : 'running'}
                description={`${lane.agent} · ${c.job.label}${c.queued ? '' : ` · ${Math.round(p * 100)}%`}`}
                input={c.job.input}
                duration={c.queued ? undefined : clock(Math.max(0, elapsed - c.start))}
                defaultOpen={false}
              />
            );
          })}
          <PlanView
            title="Close agent · Q4 close"
            status={planStatus}
            elapsed={clock(3 * 60 * 60 + 41 * 60 + elapsed)}
            steps={planSteps}
            summary={
              planStatus === 'done'
                ? 'Accrual posted and the board pack is drafted for 11:00.'
                : planStatus === 'failed'
                  ? 'You sent the accrual back. Close agent is re-estimating it and will bring it back today.'
                  : undefined
            }
          />
        </aside>
      </div>

      {/* Done without you and autonomy */}
      <div className="helm-lower" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 20, padding: '4px 24px 32px', alignItems: 'start' }}>
        <section aria-label="Done without you" style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <ActionHistory title="Done without you" actions={history} now={now} onUndo={undo} />
          <p style={{ margin: 0, fontSize: 12, color: faint }}>
            Showing the latest. All {actionsToday.toLocaleString('en-US')} actions today are in the audit log.
          </p>
        </section>
        <Card title="Autonomy" description="How far each agent may go before it asks you. Raise it and its decisions stop reaching your queue." padding="md">
          <div style={{ display: 'grid', gap: 18 }}>
            {AUTONOMY.map((a) => (
              <AutonomySetting key={a.agent} label={a.agent} task={a.task} value={autonomy[a.agent]} onChange={(level) => changeAutonomy(a.agent, a.task, level)} />
            ))}
          </div>
        </Card>
      </div>

      {/* Chief of staff drawer */}
      {drawer ? (
        <aside
          id="helm-staff"
          aria-label={STAFF}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 40,
            width: 'min(440px, calc(100vw - 32px))',
            height: 'min(640px, calc(100dvh - 6rem))',
            display: 'flex',
            flexDirection: 'column',
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 12,
            boxShadow: 'var(--shadow-xl, 0 20px 40px rgba(0, 0, 0, 0.18))',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px 10px 16px', borderBottom: `1px solid ${line}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650 }}>Ask the chief of staff</div>
              <div style={{ fontSize: 12, color: faint }}>Knows every agent, decision and action today</div>
            </div>
            <Button variant="ghost" size="sm" iconPath={ICON.x} onClick={() => setDrawer(false)}>
              Close
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 12px 0' }}>
            {['What is most urgent?', 'What happened overnight?', 'Why the price change?'].map((s) => (
              <Button key={s} variant="outline" size="sm" disabled={busy} onClick={() => ask(s)}>
                {s}
              </Button>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Conversation
              label="Chief of staff conversation"
              height="100%"
              messages={messages}
              footer={
                <PromptInput
                  value={draft}
                  onChange={setDraft}
                  onSubmit={(s) => ask(s.text)}
                  placeholder="Ask about a decision, an agent or your day…"
                  showModelSelector={false}
                  showPlusMenu={false}
                  allowFiles={false}
                  rows={2}
                  disabled={busy}
                  hint={busy ? 'Answering…' : 'Enter to send · Esc to close'}
                />
              }
            />
          </div>
        </aside>
      ) : null}

      <style>{`
        @media (min-width: 760px){ .helm-metrics{ grid-template-columns: repeat(4, minmax(0, 1fr)) !important; } }
        @media (min-width: 960px){
          .helm-grid{ grid-template-columns: 200px minmax(0, 1fr) !important; }
          .helm-running{ grid-column: 1 / -1; }
        }
        @media (min-width: 1320px){
          .helm-grid{ grid-template-columns: 210px minmax(0, 1fr) 400px !important; }
          .helm-running{ grid-column: auto; }
        }
        @media (min-width: 1100px){ .helm-lower{ grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important; } }
      `}</style>
    </div>
  );
}

export default function HelmExample() {
  return (
    <ThemedShell>
      <ToastProvider placement="bottom-left">
        <HelmInner />
      </ToastProvider>
    </ThemedShell>
  );
}
