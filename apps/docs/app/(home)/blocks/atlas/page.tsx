'use client';
import { ThemedShell } from '@/components/ThemedShell';

import * as React from 'react';
import {
  AIResponse,
  Avatar,
  Badge,
  Button,
  Callout,
  Disclosure,
  InferenceChain,
  Menu,
  SearchField,
  TaxonomyTree,
} from '@pix-ui/react';
import type { TaxonomyNode, ChainRung } from '@pix-ui/react';

// ---------------------------------------------------------------------------
// Icons (Heroicons outline paths — passed straight to `iconPath` props)
// ---------------------------------------------------------------------------

const ICON = {
  dots: 'M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z',
  export:
    'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
  flag: 'M3 3v18M3 4.5h15l-2.25 4.5L18 13.5H3',
  refresh:
    'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
};

// ---------------------------------------------------------------------------
// Static demo data
// ---------------------------------------------------------------------------

const COLLECTIONS: TaxonomyNode[] = [
  { label: 'Knowledge base', depth: 0, code: 'all', objective: '2,148 docs' },
  { label: 'Product docs', depth: 1, code: 'kb-prod', objective: '612' },
  { label: 'Data handling', depth: 2, code: 'kb-prod-data', objective: '84' },
  { label: 'Billing and plans', depth: 2, code: 'kb-prod-bill', objective: '71' },
  { label: 'Engineering', depth: 1, code: 'kb-eng', objective: '940' },
  { label: 'Runbooks', depth: 2, code: 'kb-eng-run', objective: '203' },
  { label: 'Architecture decisions', depth: 2, code: 'kb-eng-adr', objective: '158' },
  { label: 'Policies', depth: 1, code: 'kb-pol', objective: '318', ext: 'ext · legal-01' },
  { label: 'Retention and privacy', depth: 2, code: 'kb-pol-ret', objective: '46' },
  { label: 'Changelog', depth: 1, code: 'kb-chg', objective: '278' },
];

interface SourceChunk {
  id: string;
  doc: string;
  collection: string;
  score: number;
  passage: string;
}

const SOURCE_CHUNKS: SourceChunk[] = [
  {
    id: 'chunk-4471',
    doc: 'data-retention-policy.md#customer-uploads',
    collection: 'Policies · Retention and privacy',
    score: 0.94,
    passage:
      'Customer-uploaded files are retained for 30 days after the owning workspace is deleted, then purged from primary storage and from backups within the following 7-day backup cycle. Uploads tied to an active workspace are retained indefinitely unless the customer requests deletion.',
  },
  {
    id: 'chunk-2098',
    doc: 'trust-center-faq.md#storage',
    collection: 'Product docs · Data handling',
    score: 0.89,
    passage:
      'Files are stored in the region selected at workspace creation. We do not use customer uploads to train models. Deletion requests are processed within 30 days to allow backup cycles to complete.',
  },
  {
    id: 'chunk-3312',
    doc: 'runbook-data-deletion.md#manual-purge',
    collection: 'Engineering · Runbooks',
    score: 0.81,
    passage:
      'For a manual purge request (legal hold lifted, GDPR Article 17), run `purge_uploads --workspace <id> --confirm`. This bypasses the normal 30-day grace window and removes objects from primary storage immediately; backup purge still completes on its 7-day cycle.',
  },
  {
    id: 'chunk-1187',
    doc: 'changelog-2026-07.md#retention-window',
    collection: 'Changelog',
    score: 0.72,
    passage:
      'Shortened the default upload retention grace window from 60 to 30 days following the April data-handling review. Workspaces on a legacy contract keep the 60-day window until renewal.',
  },
];

const CHAIN: ChainRung[] = [
  { label: 'Retrieval', value: 'kb-pol-ret, kb-prod-data', meta: 'top_k = 12 · hybrid search · 230ms' },
  { label: 'Rerank', value: 'cross-encoder-v3', meta: '12 → 4 passages kept' },
  { label: 'Synthesis', value: 'atlas-rag-2', meta: 'grounded generation, citations required' },
  { label: 'Answer', value: 'confidence = high', meta: '4 of 4 claims traced to a cited passage' },
];

// ---------------------------------------------------------------------------
// Small local building blocks
// ---------------------------------------------------------------------------

function SourceCard({ chunk }: { chunk: SourceChunk }) {
  const tone = chunk.score >= 0.85 ? 'success' : chunk.score >= 0.75 ? 'accent' : 'neutral';
  return (
    <div
      className="rounded-lg"
      style={{ border: '1px solid var(--border, #e4e4e7)', backgroundColor: 'var(--surface, #ffffff)' }}
    >
      <Disclosure
        variant="row"
        title={
          <span className="flex min-w-0 items-center gap-2">
            <Badge tone={tone} size="sm">
              {chunk.score.toFixed(2)}
            </Badge>
            <span
              className="truncate"
              style={{
                fontFamily: 'var(--font-mono, ui-monospace, Menlo, monospace)',
                fontSize: 12,
                color: 'var(--fg1, #1c1917)',
              }}
              title={chunk.doc}
            >
              {chunk.doc}
            </span>
          </span>
        }
        meta={chunk.collection}
      >
        <p
          className="px-3 pb-3 text-[13px] leading-relaxed"
          style={{ color: 'var(--fg2, #44403c)' }}
        >
          {chunk.passage}
        </p>
        <p
          className="px-3 pb-3 text-[11px]"
          style={{ color: 'var(--fg3, #78716c)', fontFamily: 'var(--font-mono, ui-monospace, Menlo, monospace)' }}
        >
          {chunk.id}
        </p>
      </Disclosure>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function AtlasPageInner() {
  return (
    <div
      className="flex w-full flex-col"
      style={{
        height: 'calc(100dvh - 3.5rem)',
        minHeight: '560px',
        backgroundColor: 'var(--bg, #ffffff)',
        color: 'var(--fg1, #1c1917)',
      }}
    >
      {/* Top bar */}
      <header
        className="flex shrink-0 items-center justify-between gap-3 px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--border, #e7e5e4)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold" style={{ color: 'var(--fg1, #1c1917)' }}>
            Atlas
          </span>
          <Badge tone="outline" size="md">
            Knowledge assistant
          </Badge>
        </div>
        <div className="min-w-0 flex-1 px-4">
          <SearchField
            placeholder="Ask the knowledge base…"
            defaultValue="What's our data retention window for customer uploads?"
            shortcut="⌘K"
            width="100%"
            savedSearches={['Retention window for uploads', 'SOC 2 renewal date', 'On-call escalation policy']}
          />
        </div>
        <div className="flex items-center gap-2.5">
          <Menu
            align="end"
            trigger={<Button variant="ghost" iconPath={ICON.dots} />}
            items={[
              { label: 'Export answer', iconPath: ICON.export, onSelect: () => {} },
              { label: 'Flag as inaccurate', iconPath: ICON.flag, tone: 'danger', onSelect: () => {} },
            ]}
          />
          <Avatar name="Priya Nair" size="sm" tone="accent" />
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex min-w-0 flex-1 overflow-hidden">
        {/* Left panel — collections, hidden below lg */}
        <aside
          className="hidden w-[248px] shrink-0 flex-col gap-3 overflow-y-auto p-3 lg:flex"
          style={{
            backgroundColor: 'var(--surface-alt, #fafaf9)',
            borderRight: '1px solid var(--border, #e7e5e4)',
          }}
        >
          <TaxonomyTree caption="Collections" hint="2,148 docs" nodes={COLLECTIONS} />
        </aside>

        {/* Center — answer column */}
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[640px] flex-col gap-4 px-4 py-6">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--fg1, #1c1917)' }}>
                What&apos;s our data retention window for customer uploads?
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--fg3, #78716c)' }}>
                Searched 2,148 documents across 4 collections · 230ms
              </p>
            </div>

            <Callout tone="truth" title="Answer is grounded in 4 sources">
              Every claim below maps to a retrieved passage. Expand a source on the right to read the
              exact text the answer draws from.
            </Callout>

            <AIResponse
              status="done"
              model="atlas-rag-2"
              duration="1.4s"
              tokens="212 tokens"
              text={
                "Customer uploads are retained for 30 days after the owning workspace is deleted, then purged from primary storage and backups within the following backup cycle [1]. While a workspace is active, its uploads are kept indefinitely unless the customer asks for deletion [1][2].\n\nThis window was shortened from 60 to 30 days in July following a data-handling review [4] — accounts still on a legacy contract keep the 60-day window until renewal [4]. A legal hold or GDPR Article 17 request can trigger an immediate manual purge instead of waiting out the grace window [3]."
              }
              citations={[
                { label: 'data-retention-policy.md', note: 'Customer uploads, 30-day grace window', href: '#' },
                { label: 'trust-center-faq.md', note: 'Storage region and deletion SLA', href: '#' },
                { label: 'runbook-data-deletion.md', note: 'Manual purge procedure', href: '#' },
                { label: 'changelog-2026-07.md', note: 'Retention window shortened from 60 to 30 days', href: '#' },
              ]}
              onCopy={() => {}}
              onFeedback={() => {}}
            />

            <InferenceChain
              title="Retrieval to answer"
              chain={CHAIN}
              findings={[
                'Top passage (data-retention-policy.md) and the changelog entry agree on the 30-day figure; the legacy-contract exception is only stated in the changelog.',
              ]}
              assertions={['grounded_in_sources', 'no_unsupported_claims']}
              deficiency="none"
              deficiencyNote="All four cited passages support the answer; no unsupported claims were produced."
            />
          </div>
        </div>

        {/* Right panel — retrieved sources, hidden below lg */}
        <aside
          className="hidden w-[320px] shrink-0 flex-col gap-2.5 overflow-y-auto p-3 lg:flex"
          style={{
            backgroundColor: 'var(--surface-alt, #fafaf9)',
            borderLeft: '1px solid var(--border, #e7e5e4)',
          }}
        >
          <div className="flex items-center justify-between px-0.5">
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ letterSpacing: '0.06em', color: 'var(--fg3, #78716c)' }}
            >
              Retrieved sources
            </span>
            <Button variant="ghost" size="sm" iconPath={ICON.refresh} />
          </div>
          {SOURCE_CHUNKS.map((chunk) => (
            <SourceCard key={chunk.id} chunk={chunk} />
          ))}
        </aside>
      </div>
    </div>
  );
}

export default function AtlasExample() {
  return (
    <ThemedShell>
      <AtlasPageInner />
    </ThemedShell>
  );
}
