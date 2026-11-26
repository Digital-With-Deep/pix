'use client';
import { ThemedShell } from '@/components/ThemedShell';

import * as React from 'react';
import {
  AIResponse,
  Avatar,
  Badge,
  Button,
  ConfidenceBadge,
  Conversation,
  InlineCitation,
  Markdown,
  Menu,
  PromptInput,
  SearchField,
  SourcePanel,
  ToolCall,
  type ConfidenceState,
  type ConversationMessage,
  type PromptModel,
  type PromptPlusItem,
  type Source,
  type ThinkingStep,
} from '@pix-ui/react';

// Lumen dogfoods PIX: an AI chat assistant answering a question over a file
// the user uploaded. The thread is a Conversation. Each assistant turn shows
// its tool calls as ToolCall rows (queued, running, done), then an AIResponse
// whose text streams in token by token as Markdown. The first answer carries
// numbered InlineCitation markers that light up the matching row in the
// SourcePanel beside the thread, and each source is checked once the answer
// lands. Ask a follow-up in the PromptInput (or pick a suggestion) to watch
// another turn stream; Stop and Regenerate work. Every surface is a real
// @pix-ui/react component styled only with PIX tokens, so it flips with the
// theme. The first turn starts from the same state on the server and the
// client, and timers only run after mount. All data is made up.

const ink = 'var(--fg1, #1c1917)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e7e5e4)';

// ---------------------------------------------------------------------------
// Icons (Heroicons outline paths — passed straight to `iconPath` props)
// ---------------------------------------------------------------------------

const ICON = {
  plus: 'M12 4.5v15m7.5-7.5h-15',
  replay: 'M4.5 12a7.5 7.5 0 0113.06-5.06M19.5 4.5v3.75h-3.75M19.5 12a7.5 7.5 0 01-13.06 5.06M4.5 19.5v-3.75h3.75',
  trash:
    'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  dots: 'M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z',
  sources: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
};

// ---------------------------------------------------------------------------
// Static demo data
// ---------------------------------------------------------------------------

interface ChatRow {
  id: string;
  title: string;
  snippet: string;
  time: string;
  active?: boolean;
}

const chats: ChatRow[] = [
  { id: 'c1', title: 'Q3 churn cohort analysis', snippet: 'Cancellations cluster in the first 90 days after the price change.', time: 'now', active: true },
  { id: 'c2', title: 'Renewal email draft', snippet: 'Three variants ready for the lifecycle team to review.', time: '1h' },
  { id: 'c3', title: 'Pricing page copy', snippet: 'Shortened the enterprise tier description to match the others.', time: 'Yesterday' },
  { id: 'c4', title: 'Support ticket backlog', snippet: 'Grouped the 212 open tickets into five root causes.', time: 'Yesterday' },
  { id: 'c5', title: 'Onboarding funnel drop-off', snippet: 'Step three loses roughly 40 percent of new workspaces.', time: '3d' },
];

const models: PromptModel[] = [
  { id: 'lumen-2-pro', name: 'Lumen 2 Pro', meta: 'Best for analysis and long documents', badge: 'Default' },
  { id: 'lumen-2-flash', name: 'Lumen 2 Flash', meta: 'Fastest responses, lighter reasoning' },
  { id: 'lumen-2-private', name: 'Lumen 2 Private', meta: 'Runs without data retention', badge: 'Private' },
];

const plusItems: PromptPlusItem[] = [
  { label: 'Upload a file', icon: 'upload', action: 'attach' },
  { label: 'Connect a shared drive', icon: 'drive', meta: 'Not connected' },
  { label: 'Add a dataset', icon: 'data', meta: '3 connected' },
  { label: 'Browse saved prompts', icon: 'spark' },
];

const SOURCES: Source[] = [
  {
    id: 'customers',
    title: 'customers.csv',
    type: 'Dataset',
    snippet: 'April 2026 signups: 1,214 accounts, 386 cancelled within 90 days (31.8%). January to March average: 16.4%.',
    state: 'verified',
    note: 'Recomputed from the file; matches to one decimal place.',
  },
  {
    id: 'pricing',
    title: 'Pricing change log',
    type: 'Changelog',
    snippet: 'April 2: Team plan minimum raised from 3 to 5 seats; annual discount cut from 20% to 15%.',
    state: 'verified',
  },
  {
    id: 'tickets',
    title: 'Support tickets, April to June',
    type: 'Ticket export',
    snippet: '212 tickets from April signups. 129 (61%) are tagged billing or plan limits; 18 are tagged bug.',
    state: 'verified',
  },
  {
    id: 'review',
    title: 'Q3 product health review',
    type: 'Doc',
    snippet: 'The churn increase is attributed to the May 14 editor outage.',
    state: 'contradicted',
    note: 'The outage hit every cohort, but churn rose only in the April cohort.',
  },
];
const sourceIndex = (id: string) => SOURCES.findIndex((s) => s.id === id) + 1;

const thinkingSteps: ThinkingStep[] = [
  { kind: 'read', system: 'customers.csv', label: 'Loaded 8,412 customer rows with plan, seats, signup date and cancellation date', duration: '220ms', state: 'done' },
  { kind: 'tool', label: 'Grouped customers into monthly signup cohorts', detail: 'groupby(signup_month).cancelled_within(days=90)', duration: '340ms', state: 'done' },
  { kind: 'thought', label: 'The cohort that signed up right after the April 2 price change churns almost twice as fast as the three before it', state: 'done' },
  { kind: 'read', system: 'ticket desk', label: 'Pulled support tickets filed by customers in that cohort', duration: '410ms', state: 'done' },
  { kind: 'thought', label: 'Tickets from that cohort skew toward billing confusion and plan-limit complaints, not product bugs', state: 'done' },
  { kind: 'thought', label: 'The product health review blames the May outage; checked it against the other cohorts before repeating it', state: 'done' },
];

// ---------------------------------------------------------------------------
// Scripted turns. An answer is either plain Markdown (`text`, streamed
// through AIResponse) or blocks with cited sentences (`blocks`, streamed as
// Markdown and sentences with InlineCitation markers inside AIResponse).
// ---------------------------------------------------------------------------

interface ToolStep {
  name: string;
  description: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  ms: number;
}

interface Segment {
  text: string;
  cite?: string[];
}

type Block = { md: string } | { cited: Segment[] };

interface Script {
  question: string;
  tools: ToolStep[];
  text?: string;
  blocks?: Block[];
  citations?: string[];
  thinking?: ThinkingStep[];
  sources?: boolean;
  confidence?: { state: ConfidenceState; score: number; scope: string; reason: string };
  duration: string;
  tokens: string;
}

const FIRST: Script = {
  question: 'I uploaded customers.csv. Can you figure out why churn jumped in Q3? Pull in support tickets if that helps.',
  tools: [
    { name: 'files.read_csv', description: 'Read the upload', input: { file: 'customers.csv' }, output: { rows: 8412, columns: ['plan', 'seats', 'signup_date', 'cancel_date'] }, ms: 800 },
    { name: 'analytics.cohort_churn', description: 'Churn by signup month', input: { group_by: 'signup_month', window_days: 90 }, output: { '2026-04': '31.8%', jan_to_mar_avg: '16.4%' }, ms: 1000 },
    { name: 'tickets.search', description: 'Tickets from the April cohort', input: { signup_month: '2026-04', from: '2026-04-01', to: '2026-06-30' }, output: { tickets: 212, billing_or_limits: 129, bug: 18 }, ms: 900 },
    { name: 'docs.search', description: 'Workspace documents', input: { query: 'Q3 churn' }, output: { matches: 2, used: ['Pricing change log', 'Q3 product health review'] }, ms: 700 },
  ],
  blocks: [
    {
      cited: [
        { text: 'Churn in the April signup cohort is almost double the three cohorts before it: 31.8% cancelled within 90 days, against a 16.4% average for January to March.', cite: ['customers'] },
        { text: ' The jump starts the week of the April 2 price change, when the Team plan minimum went from 3 to 5 seats.', cite: ['pricing'] },
      ],
    },
    {
      cited: [
        { text: 'Support tickets from that cohort point the same way: 61% are about billing or plan limits, and only 18 of 212 are bugs.', cite: ['tickets'] },
        { text: ' This looks like a pricing and communication problem, not a product one.' },
      ],
    },
    {
      md: "**What I'd do first**\n\n1. Ship a plain-language explainer of the new seat minimum before the next billing run.\n2. Reach out to active April accounts on 3 or 4 seats, the ones the minimum hit.\n3. Hold engineering fixes until the explainer has had a month to work.",
    },
    {
      cited: [
        { text: 'One source disagrees. The Q3 product health review blames the May 14 editor outage.', cite: ['review'] },
        { text: ' That outage hit every cohort and churn rose only in April’s, so it does not explain the jump.', cite: ['customers'] },
      ],
    },
  ],
  thinking: thinkingSteps,
  sources: true,
  confidence: {
    state: 'confident',
    score: 0.86,
    scope: 'checked against 4 sources',
    reason: 'Three sources back the answer. The fourth contradicts it, and the answer says why it does not hold.',
  },
  duration: '6.8s',
  tokens: '1,340 tokens',
};

const FOLLOW_UPS: { id: string; label: string; script: Script }[] = [
  {
    id: 'slides',
    label: 'Turn this into slides',
    script: {
      question: 'Turn the April cohort findings into a short slide summary I can send to the lifecycle team.',
      tools: [],
      text: "Here is a three-slide outline:\n\n1. **The problem.** The April cohort churns at nearly 2x the earlier baseline, starting the week of the price change.\n2. **The evidence.** 61% of that cohort's tickets are about billing or plan limits; only 18 of 212 are bugs.\n3. **The ask.** Ship a plain-language explainer of the seat minimum before the next billing run, and reach out to April accounts on 3 or 4 seats now.\n\nSay the word and I'll draft the explainer copy next.",
      citations: ['customers.csv', 'Support tickets, April to June'],
      duration: '3.2s',
      tokens: '486 tokens',
    },
  },
  {
    id: 'accounts',
    label: 'Who should we contact first?',
    script: {
      question: 'Which April accounts should we contact first?',
      tools: [
        { name: 'crm.list_accounts', description: 'Active April accounts on 3 or 4 seats', input: { signup_month: '2026-04', status: 'active', seats: [3, 4] }, output: { accounts: 46, sorted_by: 'renewal_date' }, ms: 1100 },
      ],
      text: "46 active April accounts are on 3 or 4 seats. These four renew first:\n\n| Account | Seats | Renews | Tickets |\n|---|---:|---|---:|\n| `A-2207` Fernhill Studio | 3 | Oct 21 | 4 |\n| `A-2241` Quarry Lane Bakery | 4 | Oct 23 | 2 |\n| `A-2259` Halvorsen Dental | 3 | Oct 26 | 3 |\n| `A-2263` Tidepool Labs | 4 | Oct 28 | 1 |\n\nI'd start with **Fernhill Studio**: four tickets, all about the seat minimum.",
      citations: ['customers.csv', 'Accounts list'],
      duration: '2.9s',
      tokens: '612 tokens',
    },
  },
  {
    id: 'outage',
    label: 'Why not the May outage?',
    script: {
      question: "Why isn't the May outage the cause?",
      tools: [
        { name: 'analytics.compare_cohorts', description: 'Churn before and after May 14', input: { event: 'outage_2026-05-14', cohorts: ['2026-01', '2026-02', '2026-03', '2026-04'] }, output: { max_change: '+0.5 pt', cohorts_affected: 4 }, ms: 1200 },
      ],
      text: 'Because every cohort lived through the outage, and only one churned faster.\n\n| Signup cohort | 90-day churn | Change after May 14 |\n|---|---:|---:|\n| January | 16.1% | +0.3 pt |\n| February | 16.9% | +0.2 pt |\n| March | 16.2% | +0.4 pt |\n| April | 31.8% | +0.5 pt |\n\nThe outage nudged all four by under half a point. April was already far above the others **before** May 14, so the price change explains the gap and the outage does not.',
      citations: ['customers.csv', 'Q3 product health review'],
      duration: '3.6s',
      tokens: '540 tokens',
    },
  },
];

function fallback(question: string): Script {
  return {
    question,
    tools: [],
    text: "I can answer that from what this chat has: **customers.csv**, the support ticket export and the pricing change log.\n\n- On churn by cohort, the April cohort is the outlier at 31.8%.\n- On tickets, billing and plan limits make up 61% of that cohort's volume.\n\nAsk me something more specific, or try one of the suggested questions.",
    citations: ['customers.csv'],
    duration: '1.9s',
    tokens: '310 tokens',
  };
}

const RESEARCH_STEP = (q: string): ToolStep => ({
  name: 'research.search_workspace',
  description: 'Deep research',
  input: { query: q.length > 60 ? `${q.slice(0, 57)}...` : q },
  output: { documents_read: 6, used: 2 },
  ms: 1300,
});

// ---------------------------------------------------------------------------
// Streaming
// ---------------------------------------------------------------------------

type Phase = 'tools' | 'generating' | 'streaming' | 'done' | 'stopped';

interface Turn {
  id: string;
  script: Script;
  tools: ToolStep[];
  model: string;
  phase: Phase;
  tool: number; // index of the running tool call while phase is 'tools'
  shown: number; // characters revealed
  time?: string;
}

const CHUNK = 5; // characters per tick
const TICK = 30; // ms between ticks

const lengthOf = (s: Script) =>
  s.text !== undefined
    ? s.text.length
    : (s.blocks ?? []).reduce((n, b) => n + ('md' in b ? b.md.length : b.cited.reduce((m, seg) => m + seg.text.length, 0)), 0);

const plainOf = (s: Script) =>
  s.text ?? (s.blocks ?? []).map((b) => ('md' in b ? b.md : b.cited.map((seg) => seg.text).join(''))).join('\n\n');

function newTurn(id: string, script: Script, model: string, deep: boolean, time?: string): Turn {
  const tools = deep ? [RESEARCH_STEP(script.question), ...script.tools] : script.tools;
  return { id, script, tools, model, phase: tools.length ? 'tools' : 'generating', tool: 0, shown: 0, time };
}

const firstTurn = () => newTurn('t1', FIRST, 'lumen-2-pro', false, '09:41');

// The cited answer: blocks revealed up to `shown` characters. Markdown blocks
// stream through Markdown; cited sentences get their markers once complete.
function CitedAnswer({ blocks, shown, streaming, active, onSelect }: { blocks: Block[]; shown: number; streaming: boolean; active: string | null; onSelect: (id: string) => void }) {
  let left = shown;
  const out: React.ReactNode[] = [];
  blocks.forEach((b, i) => {
    if (left <= 0) return;
    if ('md' in b) {
      const visible = b.md.slice(0, left);
      left -= b.md.length;
      out.push(<Markdown key={i} text={visible} streaming={streaming && left < 0} />);
      return;
    }
    const parts: React.ReactNode[] = [];
    b.cited.forEach((seg, j) => {
      if (left <= 0) return;
      const visible = seg.text.slice(0, left);
      const complete = left >= seg.text.length;
      left -= seg.text.length;
      parts.push(
        <React.Fragment key={j}>
          {visible}
          {complete
            ? seg.cite?.map((id) => {
                const src = SOURCES.find((s) => s.id === id)!;
                return <InlineCitation key={id} index={sourceIndex(id)} source={src} active={active === id} onSelect={onSelect} />;
              })
            : null}
        </React.Fragment>,
      );
    });
    out.push(<p key={i} style={{ margin: 0 }}>{parts}</p>);
  });
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{out}</div>;
}

// ---------------------------------------------------------------------------
// Small local building blocks
// ---------------------------------------------------------------------------

function ChatListRow({ chat }: { chat: ChatRow }) {
  const { title, snippet, time, active } = chat;
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className="lumen-row flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
      style={{ backgroundColor: active ? 'var(--accent-bg, #ecfdf5)' : undefined }}
    >
      <Avatar name={title} size="sm" tone={active ? 'accent' : 'neutral'} ring={active} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium" style={{ color: ink }}>{title}</span>
          <span className="shrink-0 text-[11px]" style={{ color: faint }}>{time}</span>
        </span>
        <span className="block truncate text-xs" style={{ color: faint }}>{snippet}</span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function LumenExampleInner() {
  const [turns, setTurns] = React.useState<Turn[]>(() => [firstTurn()]);
  const [draft, setDraft] = React.useState('');
  const [model, setModel] = React.useState('lumen-2-pro');
  const [activeTools, setActiveTools] = React.useState<string[]>(['Code interpreter']);
  const [activeSource, setActiveSource] = React.useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = React.useState(true);
  const seq = React.useRef(1);
  const reduceMotion = React.useRef(false);

  React.useEffect(() => {
    reduceMotion.current = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const live = turns.find((t) => t.phase === 'tools' || t.phase === 'generating' || t.phase === 'streaming');
  const busy = Boolean(live);

  // One timer drives the live turn: each tool call runs in order, then a short
  // generating beat, then the answer streams a few characters at a time.
  React.useEffect(() => {
    if (!live) return;
    const update = (patch: Partial<Turn>) => setTurns((all) => all.map((t) => (t.id === live.id ? { ...t, ...patch } : t)));
    let timer: ReturnType<typeof setTimeout>;
    if (live.phase === 'tools') {
      timer = setTimeout(() => {
        const next = live.tool + 1;
        update(next >= live.tools.length ? { tool: next, phase: 'generating' } : { tool: next });
      }, live.tools[live.tool]?.ms ?? 600);
    } else if (live.phase === 'generating') {
      timer = setTimeout(() => update({ phase: 'streaming' }), 700);
    } else {
      const total = lengthOf(live.script);
      timer = setTimeout(() => {
        const shown = reduceMotion.current ? total : Math.min(total, live.shown + CHUNK);
        update(shown >= total ? { shown, phase: 'done' } : { shown });
      }, TICK);
    }
    return () => clearTimeout(timer);
  }, [live]);

  const ask = (script: Script) => {
    if (busy) return;
    seq.current += 1;
    setTurns((all) => [...all, newTurn(`t${seq.current}`, script, model, activeTools.includes('Deep research'))]);
    setDraft('');
  };

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const known = FOLLOW_UPS.find((f) => f.script.question.toLowerCase() === q.toLowerCase());
    ask(known ? known.script : fallback(q));
  };

  const stop = (id: string) => setTurns((all) => all.map((t) => (t.id === id ? { ...t, phase: 'stopped' } : t)));
  const regenerate = (id: string) => {
    if (busy) return;
    setTurns((all) => all.map((t) => (t.id === id ? { ...t, phase: 'generating', shown: 0 } : t)));
  };
  const replay = () => {
    seq.current = 1;
    setActiveSource(null);
    setTurns([firstTurn()]);
  };
  const clearChat = () => {
    setActiveSource(null);
    setTurns([]);
  };
  const copy = (t: Turn) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(plainOf(t.script).slice(0, t.shown)).catch(() => {});
  };

  // The source panel follows the cited turn. Sources are listed once the tool
  // calls return and checked against the answer once it has landed.
  const cited = turns.find((t) => t.script.sources);
  const sourcesState: 'none' | 'loading' | 'checking' | 'checked' = !cited
    ? 'none'
    : cited.phase === 'tools'
      ? 'loading'
      : cited.phase === 'done'
        ? 'checked'
        : 'checking';
  const panelSources: Source[] =
    sourcesState === 'checked'
      ? SOURCES
      : SOURCES.map((s) => ({ ...s, state: 'unverified' as const, note: sourcesState === 'checking' ? 'Checked once the answer is complete.' : undefined }));

  const used = new Set(turns.map((t) => t.script.question));
  const suggestions = cited && cited.phase === 'done' ? FOLLOW_UPS.filter((f) => !used.has(f.script.question)) : [];
  const modelName = models.find((m) => m.id === model)?.name ?? model;

  const messages: ConversationMessage[] = turns.flatMap((t) => {
    const s = t.script;
    const streaming = t.phase === 'streaming';
    const finished = t.phase === 'done' || t.phase === 'stopped';
    const status = t.phase === 'tools' || t.phase === 'generating' ? 'generating' : streaming ? 'streaming' : 'done';
    const out: ConversationMessage[] = [
      { id: `${t.id}-q`, role: 'user', author: 'You', time: t.time, content: s.question },
      {
        id: `${t.id}-a`,
        role: 'assistant',
        author: 'Lumen',
        time: t.time,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {t.tools.map((tool, i) => {
              const state = t.phase !== 'tools' || i < t.tool ? 'done' : i === t.tool ? 'running' : 'queued';
              return (
                <ToolCall
                  key={tool.name}
                  name={tool.name}
                  status={state}
                  description={tool.description}
                  input={tool.input}
                  output={state === 'done' ? tool.output : undefined}
                  duration={state === 'done' ? `${tool.ms}ms` : undefined}
                  defaultOpen={false}
                />
              );
            })}
            {t.phase === 'tools' ? null : (
              <AIResponse
                status={status}
                stage={t.phase === 'generating' ? 'Writing the answer…' : undefined}
                stages={t.phase === 'generating' && t.tools.length ? [{ label: `Read ${t.tools.length} tool result${t.tools.length === 1 ? '' : 's'}`, done: true }, { label: 'Draft the answer' }] : []}
                model={t.model}
                duration={finished ? s.duration : undefined}
                tokens={finished ? s.tokens : undefined}
                text={s.text !== undefined ? s.text.slice(0, t.shown) : undefined}
                thinking={finished ? s.thinking : undefined}
                citations={finished ? s.citations ?? [] : []}
                onStop={() => stop(t.id)}
                onRetry={busy ? undefined : () => regenerate(t.id)}
                onCopy={() => copy(t)}
                onFeedback={() => {}}
              >
                {s.blocks ? (
                  <CitedAnswer blocks={s.blocks} shown={t.shown} streaming={streaming} active={activeSource} onSelect={(id) => { setActiveSource(id); setSourcesOpen(true); }} />
                ) : undefined}
              </AIResponse>
            )}
            {t.phase === 'done' && s.confidence ? (
              <div>
                <ConfidenceBadge state={s.confidence.state} score={s.confidence.score} scope={s.confidence.scope} reason={s.confidence.reason} />
              </div>
            ) : null}
          </div>
        ),
      },
    ];
    if (t.phase === 'stopped') out.push({ id: `${t.id}-stopped`, role: 'system', content: 'You stopped this response. Regenerate it to see the whole answer.' });
    return out;
  });

  return (
    <div
      className="flex w-full flex-col md:flex-row"
      style={{ height: 'calc(100dvh - 3.5rem)', minHeight: '560px', backgroundColor: 'var(--bg, #ffffff)', color: ink }}
    >
      {/* Sidebar — hidden below md to keep the thread usable on narrow widths */}
      <aside
        className="hidden w-[272px] shrink-0 flex-col gap-3 overflow-y-auto p-3 md:flex"
        style={{ backgroundColor: 'var(--surface-alt, #fafaf9)', borderRight: `1px solid ${line}` }}
      >
        <Button variant="filled" iconPath={ICON.plus} style={{ width: '100%' }} onClick={clearChat} disabled={busy}>
          New chat
        </Button>
        <SearchField placeholder="Search chats" shortcut="⌘K" width="100%" />
        <nav aria-label="Chats" className="flex flex-1 flex-col gap-0.5">
          {chats.map((c) => (
            <ChatListRow key={c.id} chat={c} />
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${line}` }}>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="text-sm font-semibold" style={{ color: ink }}>Lumen</span>
            <Badge tone="accent" size="md">{modelName}</Badge>
            {busy ? <Badge tone="info" dot>Writing</Badge> : null}
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden xl:inline-flex">
              <Button variant="ghost" size="sm" iconPath={ICON.sources} onClick={() => setSourcesOpen((o) => !o)} aria-pressed={sourcesOpen}>
                {sourcesOpen ? 'Hide sources' : 'Show sources'}
              </Button>
            </span>
            <Menu
              align="end"
              trigger={<Button variant="ghost" iconPath={ICON.dots} aria-label="Chat options" />}
              items={[
                { heading: 'This chat' },
                { label: 'Replay from the start', iconPath: ICON.replay, onSelect: replay },
                { separator: true },
                { label: 'Clear chat', iconPath: ICON.trash, tone: 'danger', onSelect: clearChat },
              ]}
            />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Thread and composer */}
          <div className="mx-auto flex h-full min-w-0 w-full max-w-[820px] flex-1 flex-col">
            <Conversation
              label="Conversation with Lumen"
              height="100%"
              messages={messages}
              empty={
                <div style={{ padding: '48px 16px', textAlign: 'center', color: faint, display: 'grid', gap: 12, justifyItems: 'center' }}>
                  <span style={{ font: '600 15px var(--font-sans, ui-sans-serif, system-ui)', color: ink }}>New chat</span>
                  <span style={{ fontSize: 13.5, maxWidth: 380, lineHeight: 1.6 }}>Ask about customers.csv, or replay the churn analysis to watch Lumen work through it again.</span>
                  <Button variant="outline" size="sm" iconPath={ICON.replay} onClick={replay}>Replay the churn analysis</Button>
                </div>
              }
              footer={
                <div style={{ display: 'grid', gap: 8 }}>
                  {suggestions.length ? (
                    <div role="group" aria-label="Suggested questions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {suggestions.map((f) => (
                        <Button key={f.id} variant="outline" size="sm" disabled={busy} onClick={() => ask(f.script)}>
                          {f.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  <PromptInput
                    value={draft}
                    onChange={setDraft}
                    onSubmit={(s) => submit(s.text)}
                    placeholder="Message Lumen…"
                    tools={['Deep research', 'Code interpreter']}
                    activeTools={activeTools}
                    onToggleTool={(tool) => setActiveTools((all) => (all.includes(tool) ? all.filter((x) => x !== tool) : [...all, tool]))}
                    models={models}
                    model={model}
                    onModelChange={setModel}
                    plusItems={plusItems}
                    rows={2}
                    disabled={busy}
                    hint={busy ? 'Lumen is writing. Use Stop on the answer to interrupt it.' : 'Enter to send · Shift+Enter for a new line'}
                  />
                </div>
              }
            />
          </div>

          {/* Sources */}
          {sourcesOpen && sourcesState !== 'none' ? (
            <aside
              aria-label="Sources for this chat"
              className="hidden w-[330px] shrink-0 flex-col gap-3 overflow-y-auto p-4 xl:flex"
              style={{ borderLeft: `1px solid ${line}`, backgroundColor: 'var(--surface-alt, #fafaf9)' }}
            >
              <SourcePanel
                loading={sourcesState === 'loading'}
                title={sourcesState === 'checked' ? 'Sources · checked' : 'Sources'}
                sources={panelSources}
                activeId={activeSource}
                onSelect={(id) => setActiveSource(id)}
              />
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: faint }}>
                {sourcesState === 'checked'
                  ? 'Select a number in the answer to find its source here. A contradicted source disagrees with the answer, and the answer says why.'
                  : sourcesState === 'checking'
                    ? 'Each source is checked against the answer once it has landed.'
                    : 'Lumen is gathering sources.'}
              </p>
            </aside>
          ) : null}
        </div>
      </div>

      <style>{`.lumen-row:not([aria-current="page"]):hover{background-color:var(--bg-muted, #f5f5f4)}`}</style>
    </div>
  );
}

export default function LumenExample() {
  return (
    <ThemedShell>
      <LumenExampleInner />
    </ThemedShell>
  );
}
