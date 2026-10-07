'use client';

import * as React from 'react';
import {
  AIResponse,
  Avatar,
  Badge,
  Button,
  Menu,
  PromptInput,
  SearchField,
} from '@pix-ui/react';
import type { ThinkingStep } from '@pix-ui/react';

// ---------------------------------------------------------------------------
// Icons (Heroicons outline paths — passed straight to `iconPath` props)
// ---------------------------------------------------------------------------

const ICON = {
  plus: 'M12 4.5v15m7.5-7.5h-15',
  rename:
    'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z',
  export:
    'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
  trash:
    'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  dots: 'M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z',
  sparkle:
    'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
};

// ---------------------------------------------------------------------------
// Static demo data
// ---------------------------------------------------------------------------

interface Conversation {
  id: string;
  title: string;
  snippet: string;
  time: string;
  active?: boolean;
}

const conversations: Conversation[] = [
  {
    id: 'c1',
    title: 'Q3 churn cohort analysis',
    snippet: 'Cancellations cluster in the first 30 days after the price change.',
    time: '2m',
    active: true,
  },
  {
    id: 'c2',
    title: 'Renewal email draft',
    snippet: 'Three variants ready for the lifecycle team to review.',
    time: '1h',
  },
  {
    id: 'c3',
    title: 'Pricing page copy',
    snippet: 'Shortened the enterprise tier description to match the others.',
    time: 'Yesterday',
  },
  {
    id: 'c4',
    title: 'Support ticket backlog',
    snippet: 'Grouped the 212 open tickets into five root causes.',
    time: 'Yesterday',
  },
  {
    id: 'c5',
    title: 'Onboarding funnel drop-off',
    snippet: 'Step three loses roughly 40 percent of new workspaces.',
    time: '3d',
  },
];

const thinkingSteps: ThinkingStep[] = [
  {
    kind: 'read',
    system: 'customers.csv',
    label: 'Loaded 8,412 customer rows with plan, signup date and cancellation date',
    duration: '220ms',
    state: 'done',
  },
  {
    kind: 'tool',
    label: 'Grouped customers into monthly signup cohorts',
    detail: 'groupby(signup_month).cancelled_within(days=90)',
    duration: '340ms',
    state: 'done',
  },
  {
    kind: 'thought',
    label:
      'The cohort that signed up right after the April 2 price change churns almost twice as fast as the three cohorts before it',
    state: 'done',
  },
  {
    kind: 'read',
    system: 'ServiceNow',
    label: 'Pulled support tickets filed by customers in that cohort',
    duration: '410ms',
    state: 'done',
  },
  {
    kind: 'thought',
    label:
      'Tickets from that cohort skew heavily toward billing confusion and plan-limit complaints, not product bugs',
    state: 'done',
  },
];

const models = [
  {
    id: 'lumen-2-pro',
    name: 'Lumen 2 Pro',
    meta: 'Best for analysis and long documents',
    badge: 'Default',
  },
  {
    id: 'lumen-2-flash',
    name: 'Lumen 2 Flash',
    meta: 'Fastest responses, lighter reasoning',
  },
  {
    id: 'lumen-2-private',
    name: 'Lumen 2 Private',
    meta: 'Runs without data retention',
    badge: 'Private',
  },
];

const plusItems = [
  { label: 'Upload a file', icon: 'upload' as const, action: 'attach' },
  { label: 'Connect Google Drive', icon: 'drive' as const, meta: 'Not connected' },
  { label: 'Add a dataset', icon: 'data' as const, meta: '3 connected' },
  { label: 'Browse saved prompts', icon: 'spark' as const },
];

// ---------------------------------------------------------------------------
// Small local building blocks
// ---------------------------------------------------------------------------

function UserTurn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={{
          backgroundColor: 'var(--accent-bg, #ecfdf5)',
          color: 'var(--fg1, #1c1917)',
          border: '1px solid var(--border, #e7e5e4)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const { title, snippet, time, active } = conversation;
  return (
    <button
      type="button"
      className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
      style={{
        backgroundColor: active ? 'var(--accent-bg, #ecfdf5)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-muted, #f5f5f4)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Avatar name={title} size="sm" tone={active ? 'accent' : 'neutral'} ring={active} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className="truncate text-sm font-medium"
            style={{ color: 'var(--fg1, #1c1917)' }}
          >
            {title}
          </span>
          <span className="shrink-0 text-[11px]" style={{ color: 'var(--fg3, #78716c)' }}>
            {time}
          </span>
        </span>
        <span
          className="block truncate text-xs"
          style={{ color: 'var(--fg3, #78716c)' }}
        >
          {snippet}
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LumenExample() {
  return (
    <div
      className="flex w-full flex-col md:flex-row"
      style={{
        height: 'calc(100dvh - 3.5rem)',
        minHeight: '560px',
        backgroundColor: 'var(--bg, #ffffff)',
        color: 'var(--fg1, #1c1917)',
      }}
    >
      {/* Sidebar — hidden below md to keep the thread usable on narrow widths */}
      <aside
        className="hidden w-[272px] shrink-0 flex-col gap-3 overflow-y-auto p-3 md:flex"
        style={{
          backgroundColor: 'var(--surface-alt, #fafaf9)',
          borderRight: '1px solid var(--border, #e7e5e4)',
        }}
      >
        <Button variant="filled" iconPath={ICON.plus} style={{ width: '100%' }}>
          New chat
        </Button>
        <SearchField placeholder="Search chats" shortcut="⌘K" width="100%" />
        <nav className="flex flex-1 flex-col gap-0.5">
          {conversations.map((c) => (
            <ConversationRow key={c.id} conversation={c} />
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header
          className="flex shrink-0 items-center justify-between gap-3 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border, #e7e5e4)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold" style={{ color: 'var(--fg1, #1c1917)' }}>
              Lumen
            </span>
            <Badge tone="accent" size="md">
              Lumen 2 Pro
            </Badge>
          </div>
          <Menu
            align="end"
            trigger={<Button variant="ghost" iconPath={ICON.dots} />}
            items={[
              { heading: 'This chat' },
              { label: 'Rename chat', iconPath: ICON.rename, onSelect: () => {} },
              { label: 'Export transcript', iconPath: ICON.export, onSelect: () => {} },
              { separator: true },
              {
                label: 'Delete chat',
                iconPath: ICON.trash,
                tone: 'danger',
                onSelect: () => {},
              },
            ]}
          />
        </header>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-4 py-6">
            <UserTurn>
              I uploaded customers.csv — can you figure out why churn jumped in Q3? Pull in
              support tickets if that helps.
            </UserTurn>

            <AIResponse
              status="done"
              model="lumen-2-pro"
              duration="6.8s"
              tokens="1,340 tokens"
              text={
                'Churn for the April signup cohort is almost double the three cohorts before it, and it tracks the April 2 price change rather than anything product-related.\n\nSupport tickets from that cohort skew toward billing confusion and plan-limit complaints, not bugs — the increase looks like a pricing and communication problem, not a product one. I\'d prioritize a clearer upgrade-path explainer over engineering fixes.'
              }
              thinking={thinkingSteps}
              defaultThinkingOpen
              citations={[
                { label: 'customers.csv', note: '8,412 rows, signup and cancellation dates', href: '#' },
                { label: 'Support tickets export', note: '212 tickets, April–June', href: '#' },
                { label: 'Pricing change log', note: 'Effective April 2', href: '#' },
              ]}
              onCopy={() => {}}
              onFeedback={() => {}}
            />

            <UserTurn>
              Turn the April cohort findings into a short slide summary I can send to the
              lifecycle team.
            </UserTurn>

            <AIResponse
              status="done"
              model="lumen-2-pro"
              duration="3.2s"
              tokens="486 tokens"
              text={
                'Here is a three-slide outline:\n\n1. The problem — April cohort churns at nearly 2x the prior baseline, starting the week of the price change.\n2. The evidence — ticket volume from that cohort is 3x the account average, concentrated in billing and plan limits.\n3. The ask — ship a plain-language upgrade explainer before the next price change, and flag at-risk accounts from this cohort for outreach now.\n\nSay the word and I\'ll draft the explainer copy next.'
              }
              citations={['customers.csv', 'Support tickets export']}
              onCopy={() => {}}
              onFeedback={() => {}}
            />
          </div>
        </div>

        {/* Composer */}
        <div
          className="shrink-0 px-4 py-3"
          style={{ borderTop: '1px solid var(--border, #e7e5e4)' }}
        >
          <div className="mx-auto max-w-[760px]">
            <PromptInput
              placeholder="Message Lumen…"
              tools={['Deep research', 'Code interpreter']}
              activeTools={['Code interpreter']}
              models={models}
              defaultModel="lumen-2-pro"
              plusItems={plusItems}
              hint="Enter to send · Shift+Enter for a new line"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
