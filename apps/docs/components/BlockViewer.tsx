'use client';
import * as React from 'react';
import blocks from '../registry/__generated__/blocks.json';
import { CodeBlock } from './CodeBlock';

type Block = { slug: string; title: string; kind: string; blurb: string; parts: string[]; source: string; highlighted: string };
const BLOCKS = blocks as Block[];

const faint = 'var(--fg3, #78716c)';
const muted = 'var(--fg2, #52525b)';
const ink = 'var(--fg1, #1c1917)';
const line = 'var(--border, #e4e4e7)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';

const NAV_CROP = 56; // hide the site nav inside the preview iframe
const PREVIEW_H = 680;

const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', width: '100%' },
  { id: 'tablet', label: 'Tablet', width: 834 },
  { id: 'mobile', label: 'Mobile', width: 390 },
] as const;

function Icon({ d, size = 15 }: { d: React.ReactNode; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
const ICONS = {
  desktop: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  tablet: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M12 18h.01" /></>,
  mobile: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M12 18h.01" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
  external: <><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
  github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
};

function ToolbarBtn({ title, active, onClick, children, href }: { title: string; active?: boolean; onClick?: () => void; children: React.ReactNode; href?: string }) {
  const style: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6,
    border: '1px solid transparent', background: active ? 'var(--surface-alt, #fafaf9)' : 'transparent',
    color: active ? ink : muted, cursor: 'pointer', textDecoration: 'none',
  };
  if (href) return <a title={title} aria-label={title} href={href} target="_blank" rel="noreferrer" style={style}>{children}</a>;
  return <button type="button" title={title} aria-label={title} aria-pressed={active} onClick={onClick} style={style}>{children}</button>;
}

export function BlockViewer() {
  const [slug, setSlug] = React.useState(BLOCKS[0].slug);
  const [tab, setTab] = React.useState<'preview' | 'code'>('preview');
  const [viewport, setViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [nonce, setNonce] = React.useState(0);
  const block = BLOCKS.find((b) => b.slug === slug) ?? BLOCKS[0];
  const vp = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0];
  const src = `/blocks/${block.slug}`;

  const tabBtn = (id: 'preview' | 'code', label: string) => (
    <button type="button" onClick={() => setTab(id)} aria-pressed={tab === id}
      style={{ font: '500 13px var(--font-sans, ui-sans-serif, system-ui)', padding: '5px 12px', borderRadius: 6, border: 0, cursor: 'pointer', background: tab === id ? 'var(--surface, #fff)' : 'transparent', color: tab === id ? ink : muted, boxShadow: tab === id ? '0 1px 2px rgb(0 0 0 / 0.06)' : 'none' }}>
      {label}
    </button>
  );

  return (
    <div>
      {/* Block selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20, borderBottom: `1px solid ${line}` }}>
        {BLOCKS.map((b) => (
          <button key={b.slug} type="button" onClick={() => { setSlug(b.slug); setTab('preview'); }}
            style={{ font: `500 14px var(--font-sans, ui-sans-serif, system-ui)`, padding: '8px 4px', marginBottom: -1, border: 0, borderBottom: `2px solid ${slug === b.slug ? ink : 'transparent'}`, background: 'transparent', color: slug === b.slug ? ink : faint, cursor: 'pointer', marginRight: 16 }}>
            {b.title}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', gap: 2, padding: 3, borderRadius: 8, background: 'var(--surface-alt, #fafaf9)', border: `1px solid ${line}` }}>
            {tabBtn('preview', 'Preview')}{tabBtn('code', 'Code')}
          </div>
          <span style={{ fontSize: 14, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: ink, fontWeight: 500 }}>{block.title}</span> — {block.kind}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {VIEWPORTS.map((v) => (
            <ToolbarBtn key={v.id} title={v.label} active={viewport === v.id} onClick={() => setViewport(v.id)}>
              <Icon d={ICONS[v.id]} />
            </ToolbarBtn>
          ))}
          <span style={{ width: 1, height: 18, background: line, margin: '0 4px' }} />
          <ToolbarBtn title="Refresh" onClick={() => setNonce((n) => n + 1)}><Icon d={ICONS.refresh} /></ToolbarBtn>
          <ToolbarBtn title="Open in new tab" href={src}><Icon d={ICONS.external} /></ToolbarBtn>
          <ToolbarBtn title="View source" href={`https://github.com/Digital-With-Deep/pix/blob/main/apps/docs/app/(home)/blocks/${block.slug}/page.tsx`}><Icon d={ICONS.github} /></ToolbarBtn>
        </div>
      </div>

      {/* Body */}
      {tab === 'preview' ? (
        <div style={{ border: `1px solid ${line}`, borderRadius: 12, overflow: 'hidden', background: 'var(--surface-alt, #fafaf9)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: vp.width, maxWidth: '100%', height: PREVIEW_H, overflow: 'hidden', background: 'var(--bg, #fff)', transition: 'width 0.2s ease', borderLeft: vp.width === '100%' ? 'none' : `1px solid ${line}`, borderRight: vp.width === '100%' ? 'none' : `1px solid ${line}` }}>
            <iframe
              key={`${block.slug}-${viewport}-${nonce}`}
              src={src}
              title={`${block.title} preview`}
              style={{ width: '100%', height: PREVIEW_H + NAV_CROP, marginTop: -NAV_CROP, border: 0, display: 'block' }}
            />
          </div>
        </div>
      ) : (
        <div style={{ maxHeight: PREVIEW_H, overflow: 'auto', borderRadius: 12, border: `1px solid ${line}` }}>
          <CodeBlock code={block.source} highlighted={block.highlighted} filename={`blocks/${block.slug}/page.tsx`} embedded />
        </div>
      )}

      {/* Parts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
        <span style={{ font: `11px ${mono}`, color: faint, alignSelf: 'center', marginRight: 2 }}>Built from</span>
        {block.parts.map((p) => (
          <span key={p} style={{ font: `11px ${mono}`, color: muted, padding: '2px 7px', borderRadius: 4, border: `1px solid ${line}`, background: 'var(--surface, #fff)' }}>{p}</span>
        ))}
      </div>
    </div>
  );
}
