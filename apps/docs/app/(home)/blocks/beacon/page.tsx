'use client';
import { ThemedShell } from '@/components/ThemedShell';

import * as React from 'react';
import {
  Tabs,
  MetricCard,
  BarChart,
  RateBars,
  AuditLog,
  DataTable,
  UsageMeter,
  Alert,
  AlertAction,
  Badge,
  Select,
  Avatar,
  type BarChartSeries,
  type BarChartGroup,
  type RateBarsRow,
  type AuditEvent,
  type AuditColumn,
  type DataTableColumn,
  type SelectOption,
} from '@pix-ui/react';

// ---------------------------------------------------------------------------
// Domain data — production monitoring for a deployed model endpoint
// ("Beacon"). Every number below is illustrative demo data, not live
// telemetry.
// ---------------------------------------------------------------------------

const mono: React.CSSProperties = {
  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
};

function Mono({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span style={{ ...mono, ...style }}>{children}</span>;
}

const ENV_OPTIONS: SelectOption[] = [
  { value: 'production', label: 'Production', meta: 'us-east-1' },
  { value: 'staging', label: 'Staging', meta: 'us-east-1' },
  { value: 'canary', label: 'Canary', meta: '5% traffic' },
];

const RANGE_OPTIONS: SelectOption[] = [
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const VOLUME_SERIES: BarChartSeries[] = [
  { label: 'Today', color: 'var(--emerald-600, #059669)' },
  { label: 'Yesterday', color: 'var(--zinc-300, #d4d4d8)' },
];

const VOLUME_DATA: BarChartGroup[] = [
  { label: '00:00', values: [25400, 23100] },
  { label: '03:00', values: [14200, 13800] },
  { label: '06:00', values: [28900, 24700] },
  { label: '09:00', values: [46800, 39200] },
  { label: '12:00', values: [52300, 44100] },
  { label: '15:00', values: [55100, 47800] },
  { label: '18:00', values: [41600, 38900] },
  { label: '21:00', values: [29700, 27300] },
];

const ROUTE_RATES: RateBarsRow[] = [
  {
    name: 'POST /v1/chat/completions',
    value: 97.8,
    tone: 'danger',
    note: 'Down from a 99.6% baseline since 14:12 UTC — see the incident above.',
  },
  {
    name: 'POST /v1/chat',
    value: 92.4,
    note: 'Proxies to the retired gpt-5.0 deployment; 5xx climbs whenever that pool recycles.',
  },
  {
    name: 'POST /v1/embeddings',
    value: 99.6,
    note: 'Occasional 429s when a single caller exceeds its per-key rate limit.',
  },
  {
    name: 'POST /v1/images/generations',
    value: 95.3,
    note: 'Upstream image provider times out on prompts over 1,000 tokens.',
  },
  {
    name: 'POST /v1/moderations',
    value: 99.9,
    note: 'Stable — runs on the smallest model in the fleet.',
  },
  {
    name: 'GET /v1/models',
    value: 100,
    note: 'Static manifest, served from cache.',
  },
];

type RequestStatus = 'ok' | 'error' | 'flagged';

const STATUS_BADGE: Record<RequestStatus, 'success' | 'danger' | 'warning'> = {
  ok: 'success',
  error: 'danger',
  flagged: 'warning',
};

interface RequestRow {
  id: string;
  time: string;
  route: string;
  model: string;
  status: RequestStatus;
  latencyMs: number;
  tokens: number;
  cost: number;
}

const RECENT_REQUESTS: RequestRow[] = [
  { id: 'req_8f2a1c', time: '14:32:41', route: 'POST /v1/chat/completions', model: 'gpt-5.2', status: 'ok', latencyMs: 812, tokens: 1420, cost: 0.0284 },
  { id: 'req_8f2a0b', time: '14:32:38', route: 'POST /v1/chat/completions', model: 'gpt-5.2', status: 'error', latencyMs: 4021, tokens: 0, cost: 0 },
  { id: 'req_8f29f4', time: '14:32:30', route: 'POST /v1/embeddings', model: 'embedding-3-large', status: 'ok', latencyMs: 96, tokens: 512, cost: 0.0007 },
  { id: 'req_8f29e7', time: '14:32:22', route: 'POST /v1/chat', model: 'gpt-5.0', status: 'ok', latencyMs: 1284, tokens: 980, cost: 0.0196 },
  { id: 'req_8f29d1', time: '14:32:11', route: 'POST /v1/images/generations', model: 'image-2', status: 'flagged', latencyMs: 2140, tokens: 0, cost: 0.0400 },
  { id: 'req_8f29c0', time: '14:31:58', route: 'POST /v1/chat/completions', model: 'claude-4.6-sonnet', status: 'ok', latencyMs: 764, tokens: 1108, cost: 0.0221 },
  { id: 'req_8f29ac', time: '14:31:49', route: 'POST /v1/moderations', model: 'moderation-2', status: 'ok', latencyMs: 41, tokens: 64, cost: 0.0001 },
  { id: 'req_8f2996', time: '14:31:36', route: 'POST /v1/chat/completions', model: 'gpt-5.2', status: 'ok', latencyMs: 889, tokens: 1632, cost: 0.0326 },
];

const RECENT_COLUMNS: DataTableColumn<RequestRow>[] = [
  { key: 'time', label: 'Time', render: (row) => <Mono>{row.time}</Mono> },
  { key: 'route', label: 'Route', strong: true, render: (row) => <Mono>{row.route}</Mono> },
  { key: 'model', label: 'Model', render: (row) => <Mono>{row.model}</Mono> },
  {
    key: 'status',
    label: 'Status',
    align: 'center',
    render: (row) => <Badge tone={STATUS_BADGE[row.status]}>{row.status}</Badge>,
  },
  {
    key: 'latencyMs',
    label: 'Latency',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => <Mono>{row.latencyMs.toLocaleString()}ms</Mono>,
  },
  {
    key: 'tokens',
    label: 'Tokens',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => <Mono>{row.tokens.toLocaleString()}</Mono>,
  },
  {
    key: 'cost',
    label: 'Cost',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => <Mono>${row.cost.toFixed(4)}</Mono>,
  },
];

interface ModelCostRow {
  model: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  cost: number;
}

const MODEL_COST_ROWS: ModelCostRow[] = [
  { model: 'gpt-5.2', requests: 168_240, tokensIn: 94_800_000, tokensOut: 58_200_000, cost: 812.4 },
  { model: 'gpt-5.0', requests: 41_860, tokensIn: 22_100_000, tokensOut: 14_600_000, cost: 198.6 },
  { model: 'claude-4.6-sonnet', requests: 52_310, tokensIn: 31_400_000, tokensOut: 19_800_000, cost: 221.9 },
  { model: 'embedding-3-large', requests: 18_900, tokensIn: 9_200_000, tokensOut: 0, cost: 12.8 },
  { model: 'image-2', requests: 3_600, tokensIn: 0, tokensOut: 0, cost: 38.5 },
];

const MODEL_COST_COLUMNS: DataTableColumn<ModelCostRow>[] = [
  { key: 'model', label: 'Model', strong: true, render: (row) => <Mono>{row.model}</Mono> },
  {
    key: 'requests',
    label: 'Requests',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => <Mono>{row.requests.toLocaleString()}</Mono>,
  },
  {
    key: 'tokensIn',
    label: 'Tokens in',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => <Mono>{row.tokensIn.toLocaleString()}</Mono>,
  },
  {
    key: 'tokensOut',
    label: 'Tokens out',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => <Mono>{row.tokensOut.toLocaleString()}</Mono>,
  },
  {
    key: 'cost',
    label: 'Cost',
    numeric: true,
    align: 'right',
    sortable: true,
    render: (row) => <Mono>${row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Mono>,
  },
];

// Audit log — the full searchable request history for the Requests tab.
// Built from a fixed base time plus offsets so the data is static and
// deterministic across renders.

const BASE_TS = Date.parse('2026-10-07T18:00:00Z');

type RawEvent = [
  offsetMin: number,
  route: string,
  model: string,
  status: RequestStatus,
  latencyMs: number,
  tokens: number,
  agent: string,
];

const RAW_EVENTS: RawEvent[] = [
  [2, 'POST /v1/chat/completions', 'gpt-5.2', 'ok', 812, 1420, 'web-app'],
  [5, 'POST /v1/chat/completions', 'gpt-5.2', 'error', 4021, 0, 'web-app'],
  [9, 'POST /v1/embeddings', 'embedding-3-large', 'ok', 96, 512, 'batch-worker'],
  [14, 'POST /v1/chat', 'gpt-5.0', 'ok', 1284, 980, 'mobile-ios'],
  [18, 'POST /v1/images/generations', 'image-2', 'flagged', 2140, 0, 'web-app'],
  [23, 'POST /v1/chat/completions', 'claude-4.6-sonnet', 'ok', 764, 1108, 'web-app'],
  [27, 'POST /v1/moderations', 'moderation-2', 'ok', 41, 64, 'web-app'],
  [31, 'POST /v1/chat/completions', 'gpt-5.2', 'ok', 889, 1632, 'mobile-android'],
  [38, 'POST /v1/chat/completions', 'gpt-5.2', 'ok', 921, 1244, 'web-app'],
  [44, 'POST /v1/embeddings', 'embedding-3-large', 'ok', 88, 480, 'batch-worker'],
  [49, 'POST /v1/chat', 'gpt-5.0', 'error', 6120, 0, 'mobile-ios'],
  [55, 'GET /v1/models', 'n/a', 'ok', 12, 0, 'web-app'],
  [61, 'POST /v1/chat/completions', 'gpt-5.2', 'ok', 798, 1366, 'web-app'],
  [68, 'POST /v1/moderations', 'moderation-2', 'ok', 38, 70, 'web-app'],
  [74, 'POST /v1/images/generations', 'image-2', 'ok', 1890, 0, 'mobile-android'],
  [82, 'POST /v1/chat/completions', 'claude-4.6-sonnet', 'ok', 701, 1042, 'web-app'],
  [89, 'POST /v1/chat/completions', 'gpt-5.2', 'ok', 940, 1510, 'web-app'],
  [97, 'POST /v1/embeddings', 'embedding-3-large', 'ok', 101, 520, 'batch-worker'],
  [104, 'POST /v1/chat', 'gpt-5.0', 'ok', 1198, 912, 'mobile-ios'],
  [112, 'POST /v1/chat/completions', 'gpt-5.2', 'flagged', 3380, 1120, 'web-app'],
  [121, 'POST /v1/chat/completions', 'gpt-5.2', 'ok', 856, 1388, 'web-app'],
  [130, 'POST /v1/moderations', 'moderation-2', 'ok', 44, 58, 'web-app'],
  [140, 'POST /v1/chat/completions', 'claude-4.6-sonnet', 'ok', 742, 1066, 'mobile-android'],
  [150, 'POST /v1/embeddings', 'embedding-3-large', 'ok', 92, 498, 'batch-worker'],
];

const REQUEST_EVENTS: AuditEvent[] = RAW_EVENTS.map(([offsetMin, route, model, status, latencyMs, tokens, agent], i) => ({
  id: `req_${(8_200_000 + i * 173).toString(16)}`,
  ts: BASE_TS - offsetMin * 60_000,
  message:
    route === 'GET /v1/models'
      ? 'Model manifest fetch'
      : status === 'error'
        ? `Request to ${route} failed`
        : status === 'flagged'
          ? `Request to ${route} exceeded the latency budget`
          : `Request to ${route} completed`,
  agent,
  resource: route,
  model,
  outcome: status,
  latency_ms: latencyMs,
  tokens,
  rationale:
    status === 'error'
      ? 'Upstream gpt-5.0/gpt-5.2 pool returned a 503 — retried once, then surfaced the error to the caller.'
      : status === 'flagged'
        ? 'Latency exceeded the 2,500ms budget for this route; response was still returned to the caller.'
        : undefined,
}));

const REQUEST_COLUMNS: AuditColumn[] = [
  { key: 'resource', label: 'Route', width: 220 },
  { key: 'model', label: 'Model', width: 160 },
  {
    key: 'outcome',
    label: 'Status',
    width: 90,
    render: (e) => <Badge tone={STATUS_BADGE[(e.outcome as RequestStatus) || 'ok']}>{String(e.outcome)}</Badge>,
  },
  { key: 'latency_ms', label: 'Latency', width: 84, align: 'right' },
  {
    key: 'tokens',
    label: 'Tokens',
    width: 84,
    align: 'right',
    render: (e) => <Mono>{Number(e.tokens ?? 0).toLocaleString()}</Mono>,
  },
];

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'requests', label: 'Requests', count: REQUEST_EVENTS.length },
  { value: 'cost', label: 'Cost' },
];

const cardStyle: React.CSSProperties = { borderRadius: 4 };

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function BeaconPageInner() {
  const [tab, setTab] = React.useState('overview');
  const [env, setEnv] = React.useState('production');
  const [range, setRange] = React.useState('24h');

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
        <div className="mx-auto flex max-w-330 flex-wrap items-center justify-between gap-3 px-6 pt-5">
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
              B
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--fg1, #18181b)' }}>
              Beacon
            </span>
            <Badge tone="outline" size="md">
              chat-endpoint
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select
              options={ENV_OPTIONS}
              value={env}
              onChange={setEnv}
              searchable={false}
              menuWidth={200}
              style={{ width: 160 }}
            />
            <Select
              options={RANGE_OPTIONS}
              value={range}
              onChange={setRange}
              searchable={false}
              menuWidth={180}
              style={{ width: 150 }}
            />
            <Avatar name="Priya Nair" size="sm" tone="accent" title="Priya Nair — on call" />
          </div>
        </div>
        <div className="mx-auto max-w-330 px-6">
          <Tabs tabs={TABS} value={tab} onChange={setTab} style={{ marginTop: 14 }} />
        </div>
      </div>

      <div className="mx-auto max-w-330 px-6 py-6">
        <Alert
          tone="fault"
          icon="warn"
          title="Elevated latency and errors on POST /v1/chat/completions"
          citation="incident #INC-4471 · opened 2026-10-07 14:12 UTC · owner: on-call"
          actions={
            <>
              <AlertAction onClick={() => {}}>Silence 1h</AlertAction>
              <AlertAction onClick={() => {}}>View incident</AlertAction>
            </>
          }
          style={{ marginBottom: 20 }}
        >
          p95 latency on this route has risen from <Mono>420ms</Mono> to <Mono>847ms</Mono> and
          the error rate has climbed to <Mono>3.8%</Mono> since 14:12 UTC. The{' '}
          <Mono>gpt-5.2</Mono> pool in <Mono>us-east-1</Mono> is running hot — traffic has not
          been shifted to the backup region yet.
        </Alert>

        {tab === 'overview' && <OverviewView />}
        {tab === 'requests' && <RequestsView />}
        {tab === 'cost' && <CostView />}
      </div>
    </div>
  );
}

function OverviewView() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Requests (24h)"
          value="284,910"
          delta="+8% vs yesterday"
          deltaType="up"
          style={cardStyle}
        />
        <MetricCard
          label="p95 latency"
          value="847ms"
          delta="+96ms vs 7-day avg"
          deltaType="down"
          valueTone="warning"
          style={cardStyle}
        />
        <MetricCard
          label="Cost (24h)"
          value="$1,284"
          delta="+$186 vs yesterday"
          deltaType="down"
          style={cardStyle}
        />
        <MetricCard
          label="Error rate"
          value="2.9%"
          delta="+1.4 pts vs yesterday"
          deltaType="down"
          valueTone="danger"
          style={cardStyle}
        />
      </div>

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[3_1_480px]">
          <BarChart
            caption="Request volume — last 24 hours"
            hint="UTC, 3-hour buckets"
            summary="284,910 requests · 8,262 errors"
            series={VOLUME_SERIES}
            data={VOLUME_DATA}
          />
        </div>
        <div className="min-w-0 flex-[2_1_380px]">
          <RateBars
            caption="Success rate by route"
            hint="trailing 24h"
            threshold={95}
            rows={ROUTE_RATES}
          />
        </div>
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
          Most recent requests
        </div>
        <DataTable
          caption="Last 8 requests"
          columns={RECENT_COLUMNS}
          rows={RECENT_REQUESTS}
          filters={[{ key: 'status', options: ['ok', 'error', 'flagged'] }]}
          rowCount={false}
          style={cardStyle}
        />
      </div>
    </>
  );
}

function RequestsView() {
  return (
    <div className="flex flex-col gap-4">
      <p style={{ maxWidth: '70ch', fontSize: 13, lineHeight: 1.6, color: 'var(--fg2, #52525b)' }}>
        Every request to the chat endpoint, searchable by route, model, agent or status. Try{' '}
        <Mono>outcome:error</Mono> or <Mono>latency_ms&gt;2000</Mono>.
      </p>
      <AuditLog
        title="Requests"
        events={REQUEST_EVENTS}
        columns={REQUEST_COLUMNS}
        facets={[
          { key: 'resource', label: 'Route' },
          { key: 'model', label: 'Model' },
          { key: 'outcome', label: 'Status' },
          { key: 'agent', label: 'Caller' },
        ]}
        height={460}
        style={cardStyle}
      />
    </div>
  );
}

function CostView() {
  return (
    <div className="flex flex-col gap-5">
      <div style={{ ...cardStyle, background: 'var(--surface, #fff)', border: '1px solid var(--border, #e4e4e7)' }}>
        <div
          style={{
            padding: '12px 18px 0',
            font: '600 11px var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--fg3, #71717a)',
          }}
        >
          Monthly budget
        </div>
        <UsageMeter
          label="Monthly tokens"
          used={214_000_000}
          limit={250_000_000}
          note="Resets in 23 days."
        />
        <UsageMeter
          label="Monthly spend"
          used={38412}
          limit={50000}
          divider
          note="On pace for about $49,900 by month end."
        />
      </div>

      <div>
        <div
          style={{
            font: '600 11px var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--fg3, #71717a)',
            marginBottom: 10,
          }}
        >
          Cost by model — last 30 days
        </div>
        <DataTable
          caption="Models"
          columns={MODEL_COST_COLUMNS}
          rows={MODEL_COST_ROWS}
          initialSort={{ key: 'cost', dir: 'desc' }}
          style={cardStyle}
        />
      </div>
    </div>
  );
}

export default function BeaconExample() {
  return (
    <ThemedShell>
      <BeaconPageInner />
    </ThemedShell>
  );
}
