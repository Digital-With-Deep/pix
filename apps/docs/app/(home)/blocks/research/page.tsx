'use client';
import { ThemedShell } from '@/components/ThemedShell';
import * as React from 'react';
import {
  Badge,
  Button,
  Checkbox,
  ConfidenceBadge,
  InlineCitation,
  Markdown,
  PromptInput,
  SourcePanel,
  Tooltip,
  type ConfidenceState,
  type Source,
} from '@pix-ui/react';

// Research dogfoods PIX: a cited research assistant. Every claim in the
// answer carries numbered InlineCitation markers and its own ConfidenceBadge,
// and the SourcePanel beside it states whether each source backs the answer.
// Selecting a marker highlights its source and the claims that rest on it.
// Every surface is a real @pix-ui/react component styled only with PIX
// tokens, so it flips with the theme. Static data only: nothing here reads
// the clock or a random source, so the static export renders identically.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surface = 'var(--surface, #ffffff)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';
const accent = 'var(--accent, #059669)';
const accentBg = 'var(--accent-bg, #ecfdf5)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui)';

const ICON = {
  copy: 'M8 8V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M6 8h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z',
  export: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
  refresh: 'M4.5 12a7.5 7.5 0 0113.06-5.06M19.5 4.5v3.75h-3.75M19.5 12a7.5 7.5 0 01-13.06 5.06M4.5 19.5v-3.75h3.75',
  plus: 'M12 4.5v15m7.5-7.5h-15',
};

const SOURCES: Source[] = [
  {
    id: 'board',
    title: 'Q3 board pack, page 12',
    type: 'PDF',
    state: 'verified',
    snippet: 'Gross margin fell from 31.8% to 29.9%, driven mainly by inbound freight and produce shrink (+0.6 pts).',
  },
  {
    id: 'contract',
    title: 'Freight contract FC-114, Tallgrass Haulage',
    type: 'Contract',
    state: 'verified',
    snippet: 'A fuel surcharge of 9% applies to all inbound lanes from July 1, 2026.',
  },
  {
    id: 'invoices',
    title: 'Freight invoices, July to September',
    type: 'CSV',
    state: 'verified',
    snippet: 'Inbound freight: $4.62M in Q3 against $3.71M in Q2.',
  },
  {
    id: 'storeops',
    title: 'Store operations weekly notes',
    type: 'Notes',
    state: 'unverified',
    snippet: 'Produce shrink looked higher in August, mostly in the two heat wave weeks.',
    note: 'Written by store managers; not reconciled to inventory counts.',
  },
  {
    id: 'pricing',
    title: 'Pricing change log',
    type: 'Log',
    state: 'verified',
    snippet: 'Aug 4: shelf prices on 140 produce items cut by 3% to match a competitor.',
  },
  {
    id: 'email',
    title: 'Category manager email, Oct 3',
    type: 'Email',
    state: 'contradicted',
    snippet: 'Freight is the whole story. Shrink was flat this quarter.',
    note: 'The board pack shows produce shrink up 0.6 points, so the email is wrong on shrink.',
  },
];

const NUM: Record<string, number> = Object.fromEntries(SOURCES.map((s, i) => [s.id, i + 1]));
const byId = (id: string) => SOURCES.find((s) => s.id === id) as Source;

interface Claim {
  id: string;
  text: string;
  cites: string[];
  state: ConfidenceState;
  score: number;
  scope: string;
  reason: string;
}

const CLAIMS: Claim[] = [
  {
    id: 'c1',
    text: 'Gross margin fell 1.9 points in Q3, from 31.8% to 29.9%.',
    cites: ['board'],
    state: 'confident',
    score: 0.96,
    scope: 'matches the board pack',
    reason: 'Both figures appear verbatim in the board pack.',
  },
  {
    id: 'c2',
    text: 'About half of the drop came from inbound freight: costs rose $910K after a 9% fuel surcharge took effect on July 1.',
    cites: ['contract', 'invoices'],
    state: 'confident',
    score: 0.88,
    scope: 'checked against 2 sources',
    reason: 'The surcharge date is in the contract and the cost increase reconciles to the invoices.',
  },
  {
    id: 'c3',
    text: 'Produce shrink added roughly 0.6 points, concentrated in the August heat wave weeks.',
    cites: ['board', 'storeops'],
    state: 'low',
    score: 0.58,
    scope: 'one source unverified',
    reason: 'The board pack gives the 0.6 points, but only the unverified store notes place it in August.',
  },
  {
    id: 'c4',
    text: 'A 3% price cut on 140 produce items in August explains most of the remaining gap.',
    cites: ['pricing'],
    state: 'review',
    score: 0.66,
    scope: 'inferred, not measured',
    reason: 'The log confirms the cut, but no source measures its effect on margin.',
  },
  {
    id: 'c5',
    text: 'One email says shrink was flat. The board pack contradicts it, so this answer does not rely on it.',
    cites: ['email', 'board'],
    state: 'failed',
    score: 0.12,
    scope: 'contradicted by the board pack',
    reason: 'The email states shrink was flat; the board pack reports a 0.6 point rise.',
  },
];

const SUMMARY =
  '**Short answer:** freight is the biggest driver, but not the only one. The fuel surcharge in contract `FC-114` explains about half of the 1.9 point drop. Produce shrink and an August price cut explain most of the rest, with less certainty.';

const HISTORY = [
  { id: 'h1', title: 'Q3 gross margin drop', meta: '6 sources · now', active: true },
  { id: 'h2', title: 'Tallgrass Haulage renewal terms', meta: '4 sources · 2d' },
  { id: 'h3', title: 'Shrink by store, summer', meta: '9 sources · 5d' },
  { id: 'h4', title: 'Competitor price moves, August', meta: '3 sources · 1w' },
];

function IconButton({ label, d, onClick }: { label: string; d: string; onClick?: () => void }) {
  return (
    <Tooltip content={label}>
      <Button variant="ghost" size="sm" iconPath={d} aria-label={label} onClick={onClick} />
    </Tooltip>
  );
}

function ResearchInner() {
  const [active, setActive] = React.useState<string | null>('contract');
  const [needsReview, setNeedsReview] = React.useState(false);
  const [followUps, setFollowUps] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState('');
  const [note, setNote] = React.useState('');

  const claims = needsReview ? CLAIMS.filter((c) => c.state !== 'confident') : CLAIMS;
  const verified = SOURCES.filter((s) => s.state === 'verified').length;

  return (
    <div className="research-root" style={{ display: 'flex', minHeight: 'calc(100dvh - 3.5rem)', background: 'var(--bg, #ffffff)', color: ink, font: `14px ${sans}` }}>
      {/* History rail */}
      <nav className="research-rail" aria-label="Research history" style={{ width: 248, flex: '0 0 auto', borderRight: `1px solid ${line}`, background: surfaceAlt, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="filled" iconPath={ICON.plus} style={{ width: '100%' }}>New question</Button>
        <div style={{ font: `600 11px ${sans}`, letterSpacing: '0.08em', textTransform: 'uppercase', color: faint, padding: '6px 6px 0' }}>Recent</div>
        {HISTORY.map((h) => (
          <button
            key={h.id}
            type="button"
            aria-current={h.active ? 'page' : undefined}
            style={{ textAlign: 'left', border: 0, borderRadius: 7, padding: '8px 10px', cursor: 'pointer', background: h.active ? surface : 'transparent', boxShadow: h.active ? `inset 0 0 0 1px ${line}` : 'none', color: ink, font: `13px ${sans}` }}
          >
            <span style={{ display: 'block', fontWeight: h.active ? 600 : 500 }}>{h.title}</span>
            <span style={{ display: 'block', fontSize: 11.5, color: faint, marginTop: 2 }}>{h.meta}</span>
          </button>
        ))}
      </nav>

      {/* Answer */}
      <main style={{ flex: 1, minWidth: 0, padding: '24px 28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ font: `600 11px ${mono}`, letterSpacing: '0.06em', textTransform: 'uppercase', color: faint }}>Research · Meridian Grocers</div>
            <h1 style={{ margin: '6px 0 0', font: `650 22px/1.3 ${sans}`, letterSpacing: '-0.01em' }}>
              Why did gross margin drop in Q3, and is the new freight contract to blame?
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <IconButton label="Copy answer with citations" d={ICON.copy} onClick={() => setNote('Answer copied with its citations.')} />
            <IconButton label="Export as a report" d={ICON.export} onClick={() => setNote('Report export started.')} />
            <IconButton label="Run the research again" d={ICON.refresh} onClick={() => setNote('Queued a fresh run against the same sources.')} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <ConfidenceBadge
            size="standalone"
            state="review"
            score={0.74}
            scope={`5 claims · ${verified} of ${SOURCES.length} sources verified`}
            reason="Two claims rest on an unverified or inferred source, and one source contradicts the answer."
          />
          <Tooltip content="Sources are checked against the documents they cite, not against the answer text.">
            <span tabIndex={0} style={{ font: `12px ${mono}`, color: muted, borderBottom: `1px dotted ${faint}`, cursor: 'help' }}>
              How sources are checked
            </span>
          </Tooltip>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${line}`, background: surface }}>
          <Markdown text={SUMMARY} />
        </div>

        <section aria-labelledby="claims-heading" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h2 id="claims-heading" style={{ margin: 0, font: `650 15px ${sans}` }}>Claims</h2>
            <Checkbox label="Only claims that need review" checked={needsReview} onChange={setNeedsReview} />
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {claims.map((c) => {
              const lit = active !== null && c.cites.includes(active);
              return (
                <li
                  key={c.id}
                  style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${line}`, borderLeft: `3px solid ${lit ? accent : line}`, background: lit ? accentBg : surface, transition: 'background 0.15s ease' }}
                >
                  <p style={{ margin: 0, font: `400 14px/1.7 ${sans}`, color: ink }}>
                    {c.text}
                    {c.cites.map((id) => (
                      <InlineCitation key={id} index={NUM[id]} source={byId(id)} active={active === id} onSelect={setActive} />
                    ))}
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <ConfidenceBadge state={c.state} score={c.score} scope={c.scope} reason={c.reason} />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {followUps.length ? (
          <section aria-label="Follow-up questions" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {followUps.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px dashed ${line}`, color: muted }}>
                <Badge tone="info" dot>Queued</Badge>
                <span style={{ fontSize: 13.5 }}>{q}</span>
              </div>
            ))}
          </section>
        ) : null}

        <div role="status" aria-live="polite" style={{ minHeight: 18, font: `12.5px ${sans}`, color: muted }}>{note}</div>

        <PromptInput
          value={draft}
          onChange={setDraft}
          onSubmit={(s) => {
            if (!s.text.trim()) return;
            setFollowUps((f) => [...f, s.text.trim()]);
            setDraft('');
          }}
          placeholder="Ask a follow-up, such as: how much of the freight increase is fuel?"
          showModelSelector={false}
          showPlusMenu={false}
          allowFiles={false}
          tools={['Include email', 'Only verified sources']}
          rows={2}
        />
      </main>

      {/* Sources */}
      <aside className="research-sources" aria-label="Sources" style={{ width: 380, flex: '0 0 auto', borderLeft: `1px solid ${line}`, background: surfaceAlt, padding: 16, overflowY: 'auto' }}>
        <SourcePanel sources={SOURCES} activeId={active} onSelect={(id) => setActive(id)} />
      </aside>

      <style>{`
        @media (max-width: 1180px){ .research-rail{ display: none !important; } }
        @media (max-width: 900px){
          .research-root{ flex-direction: column; }
          .research-sources{ width: auto !important; border-left: 0 !important; border-top: 1px solid var(--border, #e4e4e7); }
        }
      `}</style>
    </div>
  );
}

export default function ResearchExample() {
  return (
    <ThemedShell>
      <ResearchInner />
    </ThemedShell>
  );
}
