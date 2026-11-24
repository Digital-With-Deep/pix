'use client';
import { ThemedShell } from '@/components/ThemedShell';
import * as React from 'react';
import {
  AutonomySetting,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Popover,
  TextField,
  Textarea,
  ToastProvider,
  Tooltip,
  useToast,
  type AutonomyLevel,
  type BadgeProps,
} from '@pix-ui/react';

// Workspace dogfoods PIX: the settings page where a team sets up an agent —
// its profile and instructions, what it may touch, how much it may do on its
// own per task, who hears about it, and the tools it is connected to. Forms
// are real PIX fields with labels, hints, counts and errors; Save validates
// and confirms with a toast; risky changes go through a Dialog. Every surface
// is a real @pix-ui/react component styled only with PIX tokens, so it flips
// with the theme. Static data only — nothing reads the clock or a random
// source, so the static export renders identically.

const ink = 'var(--fg1, #1c1917)';
const muted = 'var(--fg2, #52525b)';
const faint = 'var(--fg3, #78716c)';
const line = 'var(--border, #e4e4e7)';
const surfaceAlt = 'var(--surface-alt, #fafaf9)';
const mono = 'var(--font-mono, ui-monospace, Menlo, monospace)';
const sans = 'var(--font-sans, ui-sans-serif, system-ui)';

const ICON = {
  plus: 'M12 4.5v15m7.5-7.5h-15',
  moon: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
  pause: 'M15.75 5.25v13.5m-7.5-13.5v13.5',
  check: 'M4.5 12.75l6 6 9-13.5',
};

const DEFAULT_INSTRUCTIONS =
  'Answer order and delivery questions for Quillfield Studio customers. Be brief and warm. Never promise a delivery date the order system does not show. Ask a person before any refund over the limit.';

interface Settings {
  name: string;
  replyTo: string;
  instructions: string;
  perms: Record<PermKey, boolean>;
  refundLimit: string;
  replies: AutonomyLevel;
  refunds: AutonomyLevel;
  notify: Record<NotifyKey, boolean>;
  quietFrom: string;
  quietTo: string;
}

type PermKey = 'read' | 'draft' | 'send' | 'refund';
type NotifyKey = 'approvals' | 'digest' | 'failures';

const PERMS: { key: PermKey; label: string; description: string }[] = [
  { key: 'read', label: 'Read tickets and order history', description: 'Needed for everything else.' },
  { key: 'draft', label: 'Draft replies', description: 'Drafts wait in the helpdesk for a person.' },
  { key: 'send', label: 'Send replies', description: 'Follows the autonomy level for replies.' },
  { key: 'refund', label: 'Issue refunds', description: 'Up to the refund limit, per order.' },
];

const NOTIFY: { key: NotifyKey; label: string; description: string }[] = [
  { key: 'approvals', label: 'An approval is waiting', description: 'Email the on-call lead within a minute.' },
  { key: 'digest', label: 'Daily summary', description: 'What the agent did, sent at 17:00.' },
  { key: 'failures', label: 'An action failed', description: 'Includes the error and a link to the run.' },
];

const INITIAL: Settings = {
  name: 'Operator',
  replyTo: 'support@quillfield.example',
  instructions: DEFAULT_INSTRUCTIONS,
  perms: { read: true, draft: true, send: true, refund: false },
  refundLimit: '50',
  replies: 'confirm',
  refunds: 'propose',
  notify: { approvals: true, digest: true, failures: true },
  quietFrom: '22:00',
  quietTo: '07:00',
};

interface Tool {
  id: string;
  name: string;
  scope: string;
  status: 'Connected' | 'Needs attention' | 'Pending';
}

const TOOL_TONE: Record<Tool['status'], BadgeProps['tone']> = { Connected: 'success', 'Needs attention': 'warning', Pending: 'neutral' };

const SEED_TOOLS: Tool[] = [
  { id: 't1', name: 'Helpdesk', scope: 'tickets:read tickets:write', status: 'Connected' },
  { id: 't2', name: 'Order system', scope: 'orders:read', status: 'Connected' },
  { id: 't3', name: 'Billing', scope: 'refunds:write', status: 'Needs attention' },
];

const LOCKED = 'Turn on Issue refunds in Permissions to change this.';

const same = (a: Settings, b: Settings) => JSON.stringify(a) === JSON.stringify(b);

function WorkspaceInner() {
  const { toast } = useToast();
  const [saved, setSaved] = React.useState<Settings>(INITIAL);
  const [s, setS] = React.useState<Settings>(INITIAL);
  const [submitted, setSubmitted] = React.useState(false);
  const [tools, setTools] = React.useState<Tool[]>(SEED_TOOLS);
  const [toolOpen, setToolOpen] = React.useState(false);
  const [toolName, setToolName] = React.useState('');
  const [toolScope, setToolScope] = React.useState('');
  const [pauseOpen, setPauseOpen] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setS((prev) => ({ ...prev, [key]: value }));
  const dirty = !same(s, saved);

  const errors = {
    name: !s.name.trim() ? 'Give the agent a name people will recognise.' : undefined,
    replyTo: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.replyTo) ? 'Enter an email address, such as support@yourco.example.' : undefined,
    refundLimit: s.perms.refund && !(Number(s.refundLimit) > 0) ? 'Set a limit above zero, or turn refunds off.' : undefined,
  };
  const errorCount = Object.values(errors).filter(Boolean).length;

  const permsOn = PERMS.filter((p) => s.perms[p.key]).length;
  const allPerms = permsOn === PERMS.length;
  const somePerms = permsOn > 0 && !allPerms;

  const save = () => {
    setSubmitted(true);
    if (errorCount) {
      toast({ tone: 'warn', title: `Fix ${errorCount} ${errorCount === 1 ? 'field' : 'fields'} to save`, description: 'The fields with a problem are marked in red.' });
      return;
    }
    setSaved(s);
    setSubmitted(false);
    toast({ tone: 'truth', title: 'Settings saved', description: `${s.name.trim()} uses the new settings from its next task.` });
  };

  const discard = () => {
    setS(saved);
    setSubmitted(false);
    toast({ tone: 'info', title: 'Changes discarded' });
  };

  const addTool = () => {
    if (!toolName.trim()) return;
    setTools((t) => [...t, { id: `t${t.length + 1}`, name: toolName.trim(), scope: toolScope.trim() || 'read', status: 'Pending' }]);
    toast({ tone: 'info', title: `${toolName.trim()} added`, description: 'An admin must approve the connection before the agent can use it.' });
    setToolName('');
    setToolScope('');
    setToolOpen(false);
  };

  const showError = (msg?: string) => (submitted ? msg : undefined);

  return (
    <div style={{ background: 'var(--bg, #ffffff)', color: ink, minHeight: 'calc(100dvh - 3.5rem)', font: `14px ${sans}`, paddingBottom: 88 }}>
      {/* Page header */}
      <header style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${line}` }}>
        <div style={{ font: `12px ${mono}`, color: faint }}>Quillfield Studio / Agents / {saved.name || 'Untitled'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, font: `650 22px/1.25 ${sans}`, letterSpacing: '-0.01em' }}>Agent settings</h1>
          <Badge tone={paused ? 'warning' : 'success'} dot>{paused ? 'Paused' : 'Live'}</Badge>
          {dirty ? <Badge tone="info">Unsaved changes</Badge> : null}
        </div>
        <p style={{ margin: '6px 0 0', maxWidth: 720, color: muted, lineHeight: 1.55 }}>
          Set up what this agent knows, what it may touch and how much it may do without asking. Changes apply from its next task.
        </p>
      </header>

      <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, padding: '20px 28px' }}>
        {/* Profile */}
        <Card title="Profile" description="How the agent introduces itself and what it is for.">
          <div style={{ display: 'grid', gap: 14 }}>
            <TextField label="Agent name" required value={s.name} onChange={(v) => set('name', v)} error={showError(errors.name)} maxLength={40} />
            <TextField
              label="Reply-to address"
              type="email"
              value={s.replyTo}
              onChange={(v) => set('replyTo', v)}
              hint="Customer replies to the agent land here."
              error={showError(errors.replyTo)}
            />
            <Textarea
              label="Instructions"
              value={s.instructions}
              onChange={(v) => set('instructions', v)}
              maxLength={600}
              rows={5}
              hint="Plain language. The agent reads this before every task."
            />
          </div>
        </Card>

        {/* Permissions */}
        <Card title="Permissions" description="What the agent may read and change in your tools.">
          <div style={{ display: 'grid', gap: 12 }}>
            <Checkbox
              label="Support desk"
              description={`${permsOn} of ${PERMS.length} allowed`}
              checked={allPerms}
              indeterminate={somePerms}
              onChange={(on) => set('perms', { read: on, draft: on, send: on, refund: on })}
            />
            <div style={{ display: 'grid', gap: 10, paddingLeft: 26 }}>
              {PERMS.map((p) => (
                <Checkbox
                  key={p.key}
                  label={p.label}
                  description={p.description}
                  checked={s.perms[p.key]}
                  onChange={(on) => set('perms', { ...s.perms, [p.key]: on })}
                />
              ))}
              <Checkbox label="Delete customer data" description="Only workspace owners can grant this." disabled />
            </div>
            {s.perms.refund ? (
              <TextField
                label="Refund limit per order (USD)"
                type="number"
                inputMode="decimal"
                value={s.refundLimit}
                onChange={(v) => set('refundLimit', v)}
                hint="Refunds above this always wait for a person."
                error={showError(errors.refundLimit)}
              />
            ) : null}
          </div>
        </Card>

        {/* Autonomy */}
        <Card title="Autonomy" description="Set per task. Start low and raise it as the agent earns trust.">
          <div style={{ display: 'grid', gap: 18 }}>
            <AutonomySetting label="Replies" task="customer replies" value={s.replies} onChange={(v) => set('replies', v)} />
            <AutonomySetting
              label="Refunds"
              task="refunds under the limit"
              value={s.refunds}
              onChange={(v) => set('refunds', v)}
              disabled={!s.perms.refund}
              descriptions={!s.perms.refund ? { suggest: LOCKED, propose: LOCKED, confirm: LOCKED, autonomous: LOCKED } : undefined}
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card
          title="Notifications"
          description="Who hears about the agent, and when."
          action={
            <Popover
              title="Quiet hours"
              align="end"
              width={280}
              content={
                <div style={{ display: 'grid', gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: muted, lineHeight: 1.5 }}>Approvals still queue, but nobody is emailed between these times.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <TextField label="From" value={s.quietFrom} onChange={(v) => set('quietFrom', v)} />
                    <TextField label="To" value={s.quietTo} onChange={(v) => set('quietTo', v)} />
                  </div>
                </div>
              }
            >
              <Button variant="outline" size="sm" iconPath={ICON.moon}>Quiet {s.quietFrom} to {s.quietTo}</Button>
            </Popover>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            {NOTIFY.map((n) => (
              <Checkbox
                key={n.key}
                label={n.label}
                description={n.description}
                checked={s.notify[n.key]}
                onChange={(on) => set('notify', { ...s.notify, [n.key]: on })}
              />
            ))}
          </div>
        </Card>

        {/* Tools */}
        <Card
          title="Connected tools"
          description="The systems the agent can call. Scopes limit what each call may do."
          padding="none"
          action={
            <Popover
              open={toolOpen}
              onOpenChange={setToolOpen}
              title="Connect a tool"
              align="end"
              width={300}
              content={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addTool();
                  }}
                  style={{ display: 'grid', gap: 10 }}
                >
                  <TextField label="Tool name" placeholder="Shipping tracker" value={toolName} onChange={setToolName} required />
                  <TextField label="Scopes" placeholder="shipments:read" value={toolScope} onChange={setToolScope} hint="Space separated. Read-only is safest." />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="filled" size="sm" disabled={!toolName.trim()} onClick={addTool}>Request connection</Button>
                  </div>
                </form>
              }
            >
              <Button variant="outline" size="sm" iconPath={ICON.plus}>Add tool</Button>
            </Popover>
          }
        >
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {tools.map((t, i) => (
              <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i ? `1px solid ${line}` : 0 }}>
                <span style={{ fontWeight: 600, minWidth: 110 }}>{t.name}</span>
                <Tooltip content="Scopes the agent was granted for this tool">
                  <span tabIndex={0} style={{ font: `12px ${mono}`, color: muted, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.scope}</span>
                </Tooltip>
                <Badge tone={TOOL_TONE[t.status]} dot>{t.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        {/* Danger zone */}
        <Card
          title="Pause or reset"
          description="Pausing stops new tasks right away. Tasks already running finish first."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => { setS(INITIAL); toast({ tone: 'info', title: 'Defaults restored', description: 'Review them, then save to apply.' }); }}>
                Restore defaults
              </Button>
              {paused ? (
                <Button variant="filled" size="sm" onClick={() => { setPaused(false); toast({ tone: 'truth', title: `${saved.name} resumed`, description: 'It picks up new tasks again.' }); }}>
                  Resume agent
                </Button>
              ) : (
                <Button variant="destructive" size="sm" iconPath={ICON.pause} onClick={() => setPauseOpen(true)}>Pause agent</Button>
              )}
            </>
          }
        >
          <p style={{ margin: 0, color: muted, lineHeight: 1.55, fontSize: 13.5 }}>
            While paused, tickets route to the human queue and nothing waits on the agent. Approvals already granted stay valid for 24 hours.
          </p>
        </Card>
      </div>

      <Dialog
        open={pauseOpen}
        onOpenChange={setPauseOpen}
        role="alertdialog"
        size="sm"
        title={`Pause ${saved.name}?`}
        description="New tickets go to the human queue until you resume it. Customers waiting on a reply from the agent get one from a person instead."
        closeOnOverlayClick={false}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPauseOpen(false)}>Keep running</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setPaused(true);
                setPauseOpen(false);
                toast({ tone: 'warn', title: `${saved.name} paused`, description: '14 open tickets moved to the human queue.' });
              }}
            >
              Pause agent
            </Button>
          </>
        }
      />

      {/* Save bar */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, borderTop: `1px solid ${line}`, background: surfaceAlt, padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: dirty ? ink : faint }}>
          {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button variant="outline" disabled={!dirty} onClick={discard}>Discard</Button>
          <Button variant="filled" iconPath={ICON.check} disabled={!dirty} onClick={save}>Save changes</Button>
        </div>
      </div>

      <style>{`
        @media (min-width: 1000px){ .workspace-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
      `}</style>
    </div>
  );
}

export default function WorkspaceExample() {
  return (
    <ThemedShell>
      <ToastProvider placement="bottom-right" style={{ bottom: 72 }}>
        <WorkspaceInner />
      </ToastProvider>
    </ThemedShell>
  );
}
