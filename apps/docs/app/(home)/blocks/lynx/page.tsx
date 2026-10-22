'use client';
import { ThemedShell } from '@/components/ThemedShell';
import * as React from 'react';
import {
  Avatar,
  Badge,
  BarChart,
  Button,
  SearchField,
  Sidebar,
  type SidebarItem,
} from '@pix-ui/react';

// Lynx dogfoods PIX: a supply-chain command center built around the Sidebar
// primitive — icon rows, an active section, and Supply/Sales expanding into
// smoothly animated submenus. Every surface is a real @pix-ui/react component
// styled only with PIX tokens, so it flips with the theme.

const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surface = 'var(--surface, #ffffff)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';

const ICON = {
  dashboard: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  products: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z',
  supply: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5',
  inventory: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  sales: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
  analytics: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  automation: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  simulations: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  refresh: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
  sparkle: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
  chevronDown: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
  warn: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  clock: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  send: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
  at: 'M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25',
};

function Glyph({ d, size = 16, stroke = 'currentColor', width = 1.8 }: { d: string; size?: number; stroke?: string; width?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}

// --- demo data -------------------------------------------------------------
const NAV: SidebarItem[] = [
  {
    key: 'dashboard', label: 'Dashboard', iconPath: ICON.dashboard, defaultOpen: true,
    items: [{ key: 'today', label: 'Today' }, { key: 'metrics', label: 'Metrics' }],
  },
  { key: 'products', label: 'Products', iconPath: ICON.products },
  {
    key: 'supply', label: 'Supply', iconPath: ICON.supply,
    items: [
      { key: 'orders', label: 'Orders', badge: 149 },
      { key: 'suppliers', label: 'Suppliers' },
      { key: 'shipments', label: 'Shipments' },
      { key: 'pos', label: 'Purchase orders' },
    ],
  },
  { key: 'inventory', label: 'Inventory', iconPath: ICON.inventory },
  {
    key: 'sales', label: 'Sales', iconPath: ICON.sales,
    items: [
      { key: 'channels', label: 'Channels' },
      { key: 'customers', label: 'Customers' },
      { key: 'returns', label: 'Returns', badge: 12 },
    ],
  },
  { key: 'analytics', label: 'Analytics', iconPath: ICON.analytics },
  { key: 'automation', label: 'Automation', iconPath: ICON.automation },
  { key: 'simulations', label: 'Simulations', iconPath: ICON.simulations },
];

const REVENUE = [
  { label: '06-15', values: [8, 1.1] }, { label: '06-16', values: [11, 1.6] }, { label: '06-17', values: [9, 1.3] },
  { label: '06-18', values: [14, 2.0] }, { label: '06-19', values: [12, 1.7] }, { label: '06-20', values: [17, 2.4] },
  { label: '06-21', values: [15, 2.1] }, { label: '06-22', values: [19, 2.8] }, { label: '06-23', values: [16, 2.3] },
  { label: '06-24', values: [21, 3.1] }, { label: '06-25', values: [18, 2.6] }, { label: '06-26', values: [23, 3.4] },
];

const FULFILLMENT = [
  { label: 'Pre-flight', value: 11, color: 'var(--amber-500, #f59e0b)' },
  { label: 'Routed', value: 22, color: 'var(--sky-500, #0ea5e9)' },
  { label: 'Fulfillment', value: 29, color: 'var(--blue-600, #2563eb)' },
  { label: 'Delivery', value: 87, color: 'var(--emerald-500, #10b981)' },
];

const ALERTS = [
  { icon: ICON.warn, tone: 'amber', title: 'Inventory imbalance — SKU #HM-4402', code: 'HM-4402', body: 'AU warehouse: 3,400 units. US demand unfulfilled. Consider cross-dock transfer.', when: '2m ago' },
  { icon: ICON.clock, tone: 'zinc', title: '18 orders stalled in pre-flight', body: 'Held pending manual review — oldest stalled 4.2h. Automation hold active.', when: '14m ago' },
  { icon: ICON.supply, tone: 'amber', title: 'Carrier SLA dipping below threshold', body: 'DHL Express at 91.2% — 2 shipments delayed in transit. Monitoring.', when: '2m ago' },
];

const STATS = [
  { value: '149', label: 'Orders' },
  { value: '$30,006', label: 'Revenue' },
  { value: '39.4%', label: 'Fulfillment rate' },
  { value: '45', label: 'Orders holds' },
  { value: '17', label: 'Unmapped SKUs' },
];

function FulfillmentDonut() {
  const total = FULFILLMENT.reduce((s, f) => s + f.value, 0);
  const R = 54, C = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
      <svg width={148} height={148} viewBox="0 0 148 148" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={74} cy={74} r={R} fill="none" stroke="var(--bg-muted, #f4f4f5)" strokeWidth={14} />
        {FULFILLMENT.map((f, i) => {
          const prevFrac = FULFILLMENT.slice(0, i).reduce((s, x) => s + x.value, 0) / total;
          const seg = Math.max(0, (f.value / total) * C - 3);
          return <circle key={f.label} cx={74} cy={74} r={R} fill="none" stroke={f.color} strokeWidth={14} strokeDasharray={`${seg} ${C - seg}`} strokeDashoffset={-prevFrac * C} strokeLinecap="round" />;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ font: `700 24px ${mono}`, color: ink, letterSpacing: '-0.02em' }}>149</div>
        <div style={{ fontSize: 11, color: faint }}>Orders</div>
      </div>
    </div>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${line}`, borderRadius: 12, background: surface, padding: 16, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontWeight: 650, fontSize: 14 }}>{title}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 12 }}>{right}</span>
      </div>
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: muted }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />{label}
    </span>
  );
}

function LynxInner() {
  const [active, setActive] = React.useState('today');
  const [ask, setAsk] = React.useState('');

  const header = (
    <div style={{ padding: '12px 10px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 7, background: ink, color: 'var(--bg, #fff)' }}>
          <Glyph d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" size={14} />
        </span>
        <span style={{ fontWeight: 700, letterSpacing: '0.06em', fontSize: 14 }}>LYNX</span>
        <button type="button" aria-label="Collapse sidebar" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, border: 0, background: 'transparent', color: faint, cursor: 'pointer' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>
        </button>
      </div>
      <SearchField placeholder="Search" shortcut="⌘K" width="100%" />
      <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', boxSizing: 'border-box', padding: '7px 8px', borderRadius: 8, border: `1px solid ${line}`, background: surface, cursor: 'pointer', color: ink }}>
        <Avatar name="Happy Mammoth" square size="xs" tone="accent" />
        <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Happy Mammoth…</span>
        <span style={{ color: faint, display: 'inline-flex' }}><Glyph d={ICON.chevronDown} size={14} /></span>
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100%', background: 'var(--bg, #ffffff)', color: ink, font: '14px var(--font-sans, ui-sans-serif, system-ui)' }}>
      {/* Sidebar — the showcased primitive */}
      <div style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh', flexShrink: 0 }} className="lynx-rail">
        <Sidebar width={244} header={header} items={NAV} activeKey={active} onNavigate={(key) => setActive(key)} />
      </div>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: `1px solid ${line}` }}>
          <span style={{ color: faint, display: 'inline-flex' }}><Glyph d={ICON.calendar} size={16} /></span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Today, Jun 19, 2026</span>
          <button type="button" aria-label="Refresh" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: `1px solid ${line}`, background: surface, color: muted, cursor: 'pointer' }}>
            <Glyph d={ICON.refresh} size={15} />
          </button>
        </div>

        <div style={{ padding: '0 22px 32px', maxWidth: 980, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {/* Hero + ask */}
          <section style={{ position: 'relative', padding: '52px 0 28px', textAlign: 'center' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--zinc-200, #e4e4e7) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.4, WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at center, #000, transparent 70%)', maskImage: 'radial-gradient(ellipse 60% 70% at center, #000, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h1 style={{ font: '700 24px var(--font-sans, ui-sans-serif, system-ui)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Good morning, Jeremy</h1>
              <p style={{ margin: '0 0 22px', color: muted, fontSize: 14.5 }}>Your supply chain, summarized and ready to explore.</p>
              <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 8px 16px', borderRadius: 999, border: `1px solid ${line}`, background: surface, boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)' }}>
                <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Ask anything to AI…" aria-label="Ask AI" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: ink, font: '14px var(--font-sans, ui-sans-serif, system-ui)' }} />
                <span style={{ color: faint, display: 'inline-flex' }}><Glyph d={ICON.at} size={16} /></span>
                <button type="button" aria-label="Send" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 999, border: 0, background: 'var(--accent, #18181b)', color: 'var(--accent-fg-on, #fff)', cursor: 'pointer' }}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--bg, #fff)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={ICON.send} /></svg>
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 14 }}>
                <Button variant="outline" size="sm" iconPath={ICON.supply}>Supply chain 360° analysis</Button>
                <Button variant="outline" size="sm" iconPath={ICON.warn}>Investigate the 45 order holds</Button>
                <Button variant="outline" size="sm">More</Button>
              </div>
            </div>
          </section>

          {/* Quick summary */}
          <section style={{ marginTop: 8 }}>
            <h2 style={{ font: '650 15px var(--font-sans, ui-sans-serif, system-ui)', margin: '0 0 10px' }}>Quick summary</h2>
            <p style={{ margin: '0 0 8px', fontSize: 13.5, lineHeight: 1.65, color: muted }}>
              Your supply chain is managing <b style={{ color: ink }}>149 orders</b> worth <b style={{ color: ink }}>$30,006</b> across <b style={{ color: ink }}>8 global locations</b> with <b style={{ color: ink }}>301 SKUs</b> in inventory. The overall fulfillment rate sits at <b style={{ color: ink }}>39.4%</b>, signaling a significant backlog. <b style={{ color: ink }}>45 active order holds</b> and <b style={{ color: ink }}>20 open inbound ASNs</b> (33,318 units awaiting receipt) are key areas requiring attention.
            </p>
            <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.65, color: muted }}>Recommend reviewing inbound supply for the <b style={{ color: ink }}>next 5 days.</b></p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 40px' }}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <div style={{ font: `650 20px var(--font-sans, ui-sans-serif, system-ui)`, color: ink, letterSpacing: '-0.01em' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: faint, marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, font: `11px ${mono}`, color: faint }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Glyph d={ICON.sparkle} size={12} /> AI-generated insights</span>
              <span>· Updated 8:30 AM</span>
            </div>
          </section>

          {/* Critical alerts */}
          <section style={{ marginTop: 22, border: `1px solid ${line}`, borderRadius: 12, background: surface }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${line}` }}>
              <span style={{ color: 'var(--claim, #dc2626)', display: 'inline-flex' }}><Glyph d={ICON.warn} size={15} /></span>
              <span style={{ fontWeight: 650, fontSize: 14 }}>Critical alerts</span>
              <Badge tone="danger" size="sm">3</Badge>
            </div>
            {ALERTS.map((a, i) => (
              <div key={a.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderTop: i === 0 ? 'none' : `1px solid var(--divider, #f4f4f5)` }}>
                <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: a.tone === 'amber' ? 'var(--amber-50, #fffbeb)' : 'var(--bg-muted, #f4f4f5)', color: a.tone === 'amber' ? 'var(--fault, #d97706)' : muted }}>
                  <Glyph d={a.icon} size={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: ink }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: muted, marginTop: 2, lineHeight: 1.5 }}>{a.body}</div>
                </div>
                <span style={{ flexShrink: 0, font: `11px ${mono}`, color: faint }}>{a.when}</span>
              </div>
            ))}
          </section>

          {/* Charts */}
          <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginTop: 16 }} className="lynx-charts">
            <Card title="Orders & revenue" right={<><LegendDot color="var(--zinc-400, #a1a1aa)" label="Orders" /><LegendDot color="var(--emerald-500, #10b981)" label="Revenue" /></>}>
              <BarChart
                series={[{ label: 'Orders', color: 'var(--zinc-300, #d4d4d8)' }, { label: 'Revenue', color: 'var(--emerald-500, #10b981)' }]}
                data={REVENUE}
                height={150}
              />
            </Card>
            <Card title="Fulfillment" right={<span style={{ font: `11px ${mono}`, color: faint }}>149 orders</span>}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <FulfillmentDonut />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 140 }}>
                  {FULFILLMENT.map((f) => (
                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: f.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: muted }}>{f.label}</span>
                      <span style={{ font: `600 12px ${mono}`, color: ink }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <style>{`
        @media (max-width: 920px){ .lynx-charts{ grid-template-columns: 1fr !important; } }
        @media (max-width: 700px){ .lynx-rail{ display: none !important; } }
      `}</style>
    </div>
  );
}

export default function LynxExample() {
  return (
    <ThemedShell>
      <LynxInner />
    </ThemedShell>
  );
}
