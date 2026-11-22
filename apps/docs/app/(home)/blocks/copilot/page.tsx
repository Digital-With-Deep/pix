'use client';
import { ThemedShell } from '@/components/ThemedShell';
import * as React from 'react';
import {
  ApprovalCard,
  Badge,
  Button,
  Card,
  Conversation,
  Markdown,
  PlanView,
  PromptInput,
  ToolCall,
  type BadgeProps,
  type ConversationMessage,
  type PlanStep,
} from '@pix-ui/react';

// Copilot dogfoods PIX: an agent chat app where the assistant ("Operator")
// works a support task in the open. Its tool calls sit inline in the thread,
// the one risky step (a refund) stops on an ApprovalCard inside its ToolCall,
// the plan runs in a side panel, and the answer streams in as Markdown once a
// person decides. Every surface is a real @pix-ui/react component styled only
// with PIX tokens, so it flips with the theme. Streaming and the elapsed clock
// start after mount (seconds since mount, from 0), so the static export and
// the client agree on first paint — no Date.now() or Math.random() here.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surface = 'var(--surface, #ffffff)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui)';

const ICON = {
  plus: 'M12 4.5v15m7.5-7.5h-15',
  refresh: 'M4.5 12a7.5 7.5 0 0113.06-5.06M19.5 4.5v3.75h-3.75M19.5 12a7.5 7.5 0 01-13.06 5.06M4.5 19.5v-3.75h3.75',
};

const USER = 'Jordan Reyes';
const AGENT = 'Operator';
const BASE_ELAPSED = 64; // seconds the run had already taken before the page opened

type Phase = 'awaiting' | 'approved' | 'rejected';

interface Refund {
  order: string;
  customer: string;
  amount: number;
}

const REFUNDS: Refund[] = [
  { order: 'FH-30411', customer: 'Maya Lindqvist', amount: 42.0 },
  { order: 'FH-30418', customer: 'Tomas Okafor', amount: 36.5 },
  { order: 'FH-30422', customer: 'Lena Brandt', amount: 42.0 },
  { order: 'FH-30436', customer: 'Ravi Menon', amount: 29.9 },
  { order: 'FH-30440', customer: 'Ines Duarte', amount: 37.0 },
];
const REFUND_TOTAL = REFUNDS.reduce((sum, r) => sum + r.amount, 0);
const usd = (n: number) => `$${n.toFixed(2)}`;

const INTRO =
  'I found the held orders and a reroute that costs nothing extra. Rerouting is done. Refunding express shipping moves money, so it needs your approval first.';

function finalAnswer(total: string) {
  return [
    `All **12 orders** now route through **Salt Lake City** with Ridgeline Freight and arrive by **Nov 24**, three days later than promised.`,
    '',
    `I refunded express shipping on the five orders that paid for it, ${total} in total:`,
    '',
    '| Order | Customer | Refund |',
    '|:--|:--|--:|',
    ...REFUNDS.map((r) => `| \`${r.order}\` | ${r.customer} | ${usd(r.amount)} |`),
    '',
    'Each customer got the new delivery date and a note about the refund. Want me to watch the Reno hub and flag the next closure before orders are held?',
  ].join('\n');
}

const DECLINED =
  'Understood. I left shipping charges as they are. The 12 orders are still rerouted through **Salt Lake City** and arrive by **Nov 24**.\n\nI emailed each customer the new delivery date without a refund note. If you change your mind, ask me to refund express shipping and I will bring the approval back.';

function followUp(question: string) {
  const q = question.trim().replace(/\s+/g, ' ');
  const short = q.length > 90 ? `${q.slice(0, 87)}…` : q;
  return `On it. I will look into “${short}” and post a plan here before I change anything.\n\n- I read orders and carrier quotes on my own.\n- I ask you before anything that moves money or emails customers.`;
}

// ---------------------------------------------------------------------------
// Streaming: reveal a Markdown string a few characters at a time.
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
      setStreams((all) => all.map((s) => (s.id === active.id ? { ...s, shown: Math.min(s.text.length, s.shown + 5) } : s)));
    }, 28);
    return () => clearTimeout(t);
  }, [active]);

  const start = React.useCallback((id: string, text: string) => {
    setStreams((all) => [...all.filter((s) => s.id !== id), { id, text, shown: 0 }]);
  }, []);

  return { streams, start, busy: Boolean(active) };
}

function clock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface Turn {
  id: string;
  question: string;
}

function CopilotInner() {
  const [phase, setPhase] = React.useState<Phase>('awaiting');
  const [refundTotal, setRefundTotal] = React.useState(usd(REFUND_TOTAL));
  const [rejectReason, setRejectReason] = React.useState<string | undefined>();
  const [draft, setDraft] = React.useState('');
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [elapsed, setElapsed] = React.useState(0);
  const { streams, start, busy } = useStreams();

  const answer = streams.find((s) => s.id === 'answer');
  const finished = phase !== 'awaiting' && answer !== undefined && answer.shown >= answer.text.length;

  // Elapsed clock for the plan — runs from mount until the plan finishes.
  React.useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const approve = (total = usd(REFUND_TOTAL)) => {
    setRefundTotal(total);
    setPhase('approved');
    start('answer', finalAnswer(total));
  };
  const reject = (reason?: string) => {
    setRejectReason(reason);
    setPhase('rejected');
    start('answer', DECLINED);
  };
  const reset = () => {
    setPhase('awaiting');
    setRejectReason(undefined);
    setRefundTotal(usd(REFUND_TOTAL));
    setTurns([]);
    setElapsed(0);
    start('answer', '');
  };

  const ask = (text: string) => {
    if (!text.trim()) return;
    const id = `turn-${turns.length + 1}`;
    setTurns((t) => [...t, { id, question: text }]);
    setDraft('');
    start(id, followUp(text));
  };

  const refundStatus = phase === 'awaiting' ? 'approval' : phase === 'approved' ? 'done' : 'failed';

  const agentTurn = (
    <div style={{ display: 'grid', gap: 10 }}>
      <Markdown text={INTRO} />
      <ToolCall
        name="orders.search"
        status="done"
        duration="310ms"
        description="Orders held at the Reno hub"
        input={{ hub: 'RNO-2', destination: 'Denver, CO', status: 'held' }}
        output={{ count: 12, paid_express: 5, oldest: '2026-11-19' }}
      />
      <ToolCall
        name="carrier.quote_reroute"
        status="done"
        duration="1.1s"
        description="Reroute through Salt Lake City"
        input={{ orders: 12, via: 'SLC-1' }}
        output={{ carrier: 'Ridgeline Freight', eta: '2026-11-24', added_cost: '$0.00' }}
      />
      <ToolCall
        name="shipments.reroute"
        status="done"
        duration="2.4s"
        input={{ orders: 12, via: 'SLC-1' }}
        output={{ rerouted: 12, new_eta: '2026-11-24' }}
      />
      <ToolCall
        name="payments.refund_shipping"
        status={refundStatus}
        description={phase === 'awaiting' ? 'Waiting for your approval' : phase === 'approved' ? `Refunded ${refundTotal}` : 'Not run'}
        input={{ orders: REFUNDS.map((r) => r.order), total: refundTotal }}
        output={phase === 'approved' ? { refunded: REFUNDS.length, total: refundTotal } : undefined}
        error={phase === 'rejected' ? `Rejected by ${USER}${rejectReason ? `: ${rejectReason}` : '.'}` : undefined}
        duration={phase === 'approved' ? '860ms' : undefined}
      >
        {phase === 'awaiting' ? (
          <ApprovalCard
            title="Refund express shipping"
            action="payments.refund_shipping"
            agent={AGENT}
            target="5 orders · Fernhill Outfitters"
            reason="These customers paid for two-day express and will now arrive three days late. The shipping policy allows a shipping refund for delays over 48 hours."
            risk="high"
            reversible={false}
            changes={[
              { field: 'Orders refunded', before: '0', after: String(REFUNDS.length), editable: false },
              { field: 'Total refund', key: 'total', before: '$0.00', after: usd(REFUND_TOTAL) },
              { field: 'Customer email', before: 'Delay notice', after: 'Delay notice with refund note', editable: false },
            ]}
            evidence={['Shipping policy 3.1', 'Carrier notice RNO-2', 'orders.search']}
            requireRejectReason
            approveLabel="Approve refund"
            onApprove={() => approve()}
            onEdit={(edits) => approve(edits.total || usd(REFUND_TOTAL))}
            onReject={reject}
          />
        ) : null}
      </ToolCall>
    </div>
  );

  const messages: ConversationMessage[] = [
    {
      id: 'q1',
      role: 'user',
      author: USER,
      time: '09:12',
      content:
        'Twelve orders bound for Denver are stuck at the Reno hub after the storm closure. Reroute them, and refund shipping to anyone who paid for express.',
    },
    { id: 'a1', role: 'assistant', author: AGENT, time: '09:12', content: agentTurn },
  ];
  if (phase === 'rejected') {
    messages.push({ id: 'sys', role: 'system', content: `${USER} rejected the refund. The agent will not retry it.` });
  }
  if (answer && answer.text) {
    messages.push({
      id: 'a2',
      role: 'assistant',
      author: AGENT,
      time: '09:14',
      content: answer.text.slice(0, answer.shown),
      streaming: answer.shown < answer.text.length,
    });
  }
  for (const turn of turns) {
    const s = streams.find((x) => x.id === turn.id);
    messages.push({ id: `${turn.id}-q`, role: 'user', author: USER, content: turn.question });
    if (s) {
      messages.push({ id: `${turn.id}-a`, role: 'assistant', author: AGENT, content: s.text.slice(0, s.shown), streaming: s.shown < s.text.length });
    }
  }

  const refundStep: PlanStep['status'] = phase === 'awaiting' ? 'running' : phase === 'approved' ? 'done' : 'skipped';
  const emailStep: PlanStep['status'] = phase === 'awaiting' ? 'pending' : finished ? 'done' : 'running';
  const steps: PlanStep[] = [
    { id: 'find', label: 'Find orders held at Reno', detail: 'orders.search · 12 found, 5 paid express', status: 'done' },
    { id: 'quote', label: 'Quote a reroute', detail: 'Salt Lake City · no added cost', status: 'done' },
    { id: 'reroute', label: 'Reroute 12 shipments', detail: 'New arrival Nov 24', status: 'done' },
    {
      id: 'refund',
      label: 'Refund express shipping',
      detail: phase === 'awaiting' ? `Waiting for your approval · ${usd(REFUND_TOTAL)}` : phase === 'approved' ? `${refundTotal} to 5 customers` : 'Rejected by reviewer',
      status: refundStep,
    },
    { id: 'email', label: 'Email affected customers', detail: 'New date, plus a refund note where one was issued', status: emailStep },
  ];

  const state: { label: string; tone: BadgeProps['tone'] } =
    phase === 'awaiting' ? { label: 'Waiting on you', tone: 'warning' } : finished ? { label: 'Done', tone: 'success' } : { label: 'Working', tone: 'info' };

  return (
    <div
      className="copilot-root"
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 3.5rem)', minHeight: 640, background: 'var(--bg, #ffffff)', color: ink, font: `14px ${sans}` }}
    >
      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: `1px solid ${line}`, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontWeight: 650, letterSpacing: '-0.01em' }}>Copilot</span>
          <span style={{ fontSize: 12.5, color: faint }}>Fernhill Outfitters · Support operations</span>
        </div>
        <Badge tone={state.tone} dot>{state.label}</Badge>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" iconPath={ICON.refresh} onClick={reset}>Replay</Button>
          <Button variant="filled" size="sm" iconPath={ICON.plus} onClick={reset}>New task</Button>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* Thread */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            <Conversation
              label="Copilot conversation"
              height="100%"
              messages={messages}
              footer={
                <PromptInput
                  value={draft}
                  onChange={setDraft}
                  onSubmit={(s) => ask(s.text)}
                  placeholder="Ask Operator to do something…"
                  showModelSelector={false}
                  showPlusMenu={false}
                  allowFiles={false}
                  rows={2}
                  disabled={busy}
                  hint={busy ? 'Operator is answering…' : 'Enter to send · Shift+Enter for a new line'}
                />
              }
            />
          </div>
        </main>

        {/* Plan panel */}
        <aside
          className="copilot-aside"
          aria-label="Plan"
          style={{ width: 360, flex: '0 0 auto', borderLeft: `1px solid ${line}`, background: surfaceAlt, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <PlanView
            title="Recover the Reno hub orders"
            status={finished ? 'done' : 'running'}
            elapsed={clock(BASE_ELAPSED + elapsed)}
            steps={steps}
            summary={
              finished
                ? phase === 'approved'
                  ? `Rerouted 12 orders and refunded ${refundTotal} in ${clock(BASE_ELAPSED + elapsed)}.`
                  : `Rerouted 12 orders in ${clock(BASE_ELAPSED + elapsed)}. The refund was rejected, so it was skipped.`
                : undefined
            }
          />
          <Card title="Run details" description="What Operator is allowed to touch for this task." padding="sm">
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: 13 }}>
              {[
                ['Run', 'run_7f21c4'],
                ['Hub', 'RNO-2 → SLC-1'],
                ['Orders', '12 held, 5 express'],
                ['Spend limit', '$0.00 without approval'],
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt style={{ color: faint }}>{k}</dt>
                  <dd style={{ margin: 0, font: `12.5px ${mono}`, color: ink, textAlign: 'right' }}>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          </Card>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: muted, padding: '10px 12px', borderRadius: 8, border: `1px solid ${line}`, background: surface }}>
            Operator reads orders and carrier quotes on its own. Anything that moves money or contacts a customer waits for a person.
          </p>
        </aside>
      </div>

      <style>{`
        @media (max-width: 960px){ .copilot-aside{ display: none !important; } }
      `}</style>
    </div>
  );
}

export default function CopilotExample() {
  return (
    <ThemedShell>
      <CopilotInner />
    </ThemedShell>
  );
}
