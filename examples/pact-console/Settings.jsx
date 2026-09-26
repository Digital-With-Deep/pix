/* global React */
const { PageHead: StHead, Chip: StChip, Panel: StPanel, ScreenFoot: StFoot } = window;
const stDsc = window.dsc || (() => () => null);
const StDataTable = stDsc("DataTable");

const ENTITIES = [
  { entity: "US01", name: "Manufacturing", jurisdiction: "United States", currency: "USD", parent: "—", scope: "In scope" },
  { entity: "DE10", name: "Europe GmbH", jurisdiction: "Germany", currency: "EUR", parent: "US01", scope: "In scope" },
  { entity: "UK20", name: "Holdings", jurisdiction: "United Kingdom", currency: "GBP", parent: "US01", scope: "Out of scope" },
  { entity: "SG30", name: "Asia Pte", jurisdiction: "Singapore", currency: "SGD", parent: "US01", scope: "Out of scope" },
];

function SettingsEntities() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <StHead
        crumbs={["Settings", "Entities"]} title="Entities"
        lede="Legal entities in the consolidation, and whether each is in scope for internal control over financial reporting this period."
      />
      <div className="mt-5">
        <StDataTable
          caption="4 entities" searchable={false} rowCount={false}
          columns={[
            { key: "entity", label: "Entity", strong: true, render: r => <span className="font-mono">{r.entity}</span> },
            { key: "name", label: "Name" },
            { key: "jurisdiction", label: "Jurisdiction" },
            { key: "currency", label: "Currency", render: r => <span className="font-mono">{r.currency}</span> },
            { key: "parent", label: "Parent", render: r => <span className="font-mono">{r.parent}</span> },
            { key: "scope", label: "ICFR scope", render: r => <StChip tone={r.scope === "In scope" ? "inscope" : "outofscope"}>{r.scope}</StChip> },
          ]}
          rows={ENTITIES}
        />
      </div>
      <StFoot />
    </div>
  );
}

const PERIODS = [
  { period: "FY2027 Q1", start: "1 Jan 2027", end: "31 Mar 2027", close: "14 Apr 2027", cadence: "Quarterly", status: "Open", tone: "periodopen" },
  { period: "FY2027 Q2", start: "1 Apr 2027", end: "30 Jun 2027", close: "14 Jul 2027", cadence: "Quarterly", status: "Future", tone: "future" },
  { period: "FY2026 Q4", start: "1 Oct 2026", end: "31 Dec 2026", close: "14 Jan 2027", cadence: "Quarterly", status: "Closed", tone: "periodclosed" },
  { period: "FY2026 Q3", start: "1 Jul 2026", end: "30 Sep 2026", close: "14 Oct 2026", cadence: "Quarterly", status: "Closed", tone: "periodclosed" },
];

function SettingsPeriods() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <StHead
        crumbs={["Settings", "Periods"]} title="Periods"
        lede="Reporting periods, the testing cadence attached to each, and the close date every conclusion has to land before."
      />
      <div className="mt-5">
        <StDataTable
          caption="Fiscal 2027" searchable={false} rowCount={false}
          columns={[
            { key: "period", label: "Period", strong: true, render: r => <span className="font-mono">{r.period}</span> },
            { key: "start", label: "Start" },
            { key: "end", label: "End" },
            { key: "close", label: "Close" },
            { key: "cadence", label: "Cadence" },
            { key: "status", label: "Status", render: r => <StChip tone={r.tone}>{r.status}</StChip> },
          ]}
          rows={PERIODS}
        />
      </div>
      <StFoot />
    </div>
  );
}

const THRESHOLDS = [
  { name: "Overall materiality", note: "Basis: 5% of pre-tax income", value: "$8,400,000" },
  { name: "Performance materiality", note: "75% of overall", value: "$6,300,000" },
  { name: "Clearly trivial threshold", note: "5% of overall", value: "$420,000" },
  { name: "Human touch cost", note: "Used in cost per resolved exception. A published assumption, not a measured figure.", value: "$45.00" },
  { name: "Auto-grade deficiencies", note: "Propose a severity from the inference chain; a human always confirms" },
];

function SettingsMateriality() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <StHead
        crumbs={["Settings", "Materiality"]} title="Materiality"
        lede="The thresholds that grade every deficiency. Severity is a function of the assertions affected, the exception population, and these numbers."
      />
      <div className="mt-5">
        <StPanel caption="FY2027 · US01">
          <dl className="flex flex-col">
            {THRESHOLDS.map(t => (
              <div key={t.name} className="flex flex-wrap gap-x-8 gap-y-2 border-b border-stone-100 px-4 py-4 last:border-b-0">
                <dt className="min-w-0 flex-[0_1_260px]">
                  <span className="block text-[13px] font-medium text-stone-900">{t.name}</span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-stone-500">{t.note}</span>
                </dt>
                <dd className="min-w-0 flex-[1_1_320px]">
                  {t.value && (
                    <input readOnly value={t.value} aria-label={t.name}
                      className="w-full max-w-[360px] rounded-sm border border-stone-200 bg-white px-3 py-2 font-mono text-[13px] text-stone-900" />
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </StPanel>
      </div>
      <StFoot />
    </div>
  );
}

const INTEGRATIONS = [
  { system: "SAP S/4HANA · US01", type: "ERP", direction: "Read only", tone: "readonly", scope: "MIRO, MIR4, FB03, XK03", status: "Connected" },
  { system: "SAP ECC · DE10", type: "ERP", direction: "Read only", tone: "readonly", scope: "MIRO, MIR4, FB03", status: "Connected" },
  { system: "Workiva", type: "GRC", direction: "Evidence export", tone: "evidenceexport", scope: "Workpapers, findings", status: "Connected" },
  { system: "Okta", type: "Identity", direction: "Read only", tone: "readonly", scope: "Service account entitlements", status: "Connected" },
  { system: "OpenAI", type: "Model provider", direction: "Test execution", tone: "testexecution", scope: "gpt-5.x", status: "Connected" },
  { system: "Anthropic", type: "Model provider", direction: "Test execution", tone: "testexecution", scope: "claude-4.x", status: "Connected" },
  { system: "AuditBoard", type: "GRC", direction: "Evidence export", tone: "evidenceexport", scope: "—", status: "Not connected" },
];

function SettingsIntegrations() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <StHead
        crumbs={["Settings", "Integrations"]} title="Integrations"
        lede="What PACT reads, and what it deliberately does not write. The read-only ERP posture is both a security argument and an independence argument."
      />
      <div className="mt-5 overflow-hidden rounded-sm border border-stone-200 bg-white">
        <StDataTable
          caption="Connected" searchable={false} rowCount={false} style={{ border: "none", borderRadius: 0 }}
          columns={[
            { key: "system", label: "System", strong: true, render: r => <span className="font-mono">{r.system}</span> },
            { key: "type", label: "Type" },
            { key: "direction", label: "Direction", render: r => <StChip tone={r.tone}>{r.direction}</StChip> },
            { key: "scope", label: "Scope", render: r => <span className="font-mono text-stone-400">{r.scope}</span> },
            { key: "status", label: "Status", render: r => <StChip tone={r.status === "Connected" ? "connected" : "notconnected"}>{r.status}</StChip> },
          ]}
          rows={INTEGRATIONS}
        />
        <p className="border-t border-stone-200 px-4 py-3.5 text-[13px] leading-relaxed text-stone-600">
          <span className="font-semibold text-stone-900">PACT never writes to an ERP.</span> There is no write path in any connector, in any tier. Agents under test run against synthetic substrate, not production data.
        </p>
      </div>
      <StFoot />
    </div>
  );
}

const USERS = [
  { user: "D. Sidhu", role: "SOX Program Lead", entities: "All", run: "Yes", attest: "No", access: "Today 09:14" },
  { user: "A. Ruiz", role: "Corporate Controller", entities: "All", run: "No", attest: "Yes", access: "Today 08:02" },
  { user: "T. Beckett", role: "Chief Audit Executive", entities: "All", run: "Yes", attest: "No", access: "Yesterday" },
  { user: "J. Whitfield", role: "External Auditor", entities: "US01, DE10", run: "No", attest: "No", access: "3 Sep 2026" },
  { user: "P. Okafor", role: "Process Owner · P2P", entities: "US01", run: "No", attest: "No", access: "5 Sep 2026" },
  { user: "SVC_PACT_SCHED", role: "Service account", entities: "All", run: "Yes", attest: "No", access: "Today 02:00" },
];

function SettingsUsers() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <StHead
        crumbs={["Settings", "Users & roles"]} title="Users & roles"
        lede="Who can see and do what. External auditor access is read-only by construction, not by configuration."
      />
      <div className="mt-5">
        <StDataTable
          caption="6 users · 4 roles" searchable={false} rowCount={false}
          columns={[
            { key: "user", label: "User", strong: true, render: r => <span className="font-mono">{r.user}</span> },
            { key: "role", label: "Role" },
            { key: "entities", label: "Entities", render: r => <span className="font-mono text-stone-400">{r.entities}</span> },
            { key: "run", label: "Can run tests", render: r => <StChip tone={r.run === "Yes" ? "yes" : "no"}>{r.run}</StChip> },
            { key: "attest", label: "Can attest", render: r => <StChip tone={r.attest === "Yes" ? "yes" : "no"}>{r.attest}</StChip> },
            { key: "access", label: "Last access" },
          ]}
          rows={USERS}
        />
      </div>
      <StFoot />
    </div>
  );
}


/* ---- Organization, license and billing (onboarding set) ---- */
const StUsageMeter = stDsc("UsageMeter"), StPlanCard = stDsc("PlanCard"), StMetricCard = stDsc("MetricCard"), StButton = stDsc("Button"), StGettingStarted = stDsc("GettingStarted");
const stInput = "w-full rounded-sm border border-stone-200 bg-white px-3 py-2 text-[14px] text-stone-900 outline-none focus:border-emerald-500";
function StField({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500">{label}</span>
      {children}
      {hint && <small className="mt-1 block text-[11px] leading-snug text-stone-500">{hint}</small>}
    </label>
  );
}
function StSaveBar({ label }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 px-4 py-3">
      <StButton variant="primary" size="sm" onClick={() => setSaved(true)}>{label}</StButton>
      {saved && <span role="status" className="text-[12px] text-emerald-700">Saved. The change is in the audit log.</span>}
    </div>
  );
}

function SettingsOrganization() {
  const [done, setDone] = React.useState(4);
  const labels = ["Confirm your organization and fiscal calendar", "Add the legal entities in scope", "Invite a reviewer or controller", "Register your first agent", "Run a scenario against it", "Add billing details before the evaluation ends"];
  return (
    <div className="mx-auto max-w-[1100px]">
      <StHead crumbs={["Settings", "Organization"]} title="Organization"
        lede="Who you are and how your fiscal calendar runs. The testing period is stamped on every run and every piece of evidence." />
      <div className="mt-5">
        <StPanel>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <StField label="Organization name" className="sm:col-span-2"><input className={stInput} defaultValue="Northwind Industrial" /></StField>
            <StField label="Industry"><select className={stInput} defaultValue="Manufacturing"><option>Manufacturing</option><option>Financial services</option><option>Technology</option><option>Other</option></select></StField>
            <StField label="Fiscal year end" hint="Month and day, MM-DD. A calendar year ends 12-31."><input className={`${stInput} font-mono text-[13px]`} defaultValue="12-31" /></StField>
            <StField label="Current testing period" hint="Shown in the top bar and stamped on every run." className="sm:col-span-2"><input className={`${stInput} font-mono text-[13px]`} defaultValue="FY2027 · Q1" /></StField>
          </div>
          <StSaveBar label="Save changes" />
        </StPanel>
      </div>
      <div className="mt-5">
        <StGettingStarted title="Finish setting up PACT" steps={labels.map((label, i) => ({ key: label, label, done: i < done }))}
          onOpen={() => setDone(d => Math.min(d + 1, labels.length))} onDismiss={() => setDone(4)} />
        <p className="mt-2 text-[12px] text-stone-400">The getting-started card as it appears on Overview for a new organization. Every tick is derived from real state; here, opening a step marks it done.</p>
      </div>
      <StFoot />
    </div>
  );
}

const ST_PLANS = {
  evaluation: { label: "Evaluation", term: "21 Oct 2026", days: 29, limits: [1, 3, 5, 200] },
  standard: { label: "Standard", term: "30 Sep 2027", days: 373, limits: [5, 25, 25, 5000] },
  enterprise: { label: "Enterprise", term: "31 Dec 2027", days: 465, limits: [null, null, null, null] },
};
const ST_UNITS = [["entity in scope", "entities in scope"], ["agent", "agents"], ["seat", "seats"], ["run a month", "runs a month"]];
const stFeatures = l => l.map((v, i) => `${v === null ? "Unlimited" : v.toLocaleString()} ${ST_UNITS[i][v === 1 ? 0 : 1]}`);

function SettingsLicense() {
  const [plan, setPlan] = React.useState("standard");
  const [key, setKey] = React.useState("");
  const [msg, setMsg] = React.useState(null);
  const p = ST_PLANS[plan], used = [2, 8, 6, 412];
  const activate = () => {
    const m = key.match(/^PACT-(evaluation|standard|enterprise)/i);
    if (!m) return setMsg({ ok: false, text: "This license key is not valid. Check that the whole key was pasted, including the part after the dot." });
    const k = m[1].toLowerCase(); setPlan(k); setKey(""); setMsg({ ok: true, text: `Activated: ${ST_PLANS[k].label}, to ${ST_PLANS[k].term}.` });
  };
  return (
    <div className="mx-auto max-w-[1100px]">
      <StHead crumbs={["Settings", "License & usage"]} title="License and usage"
        lede="What this organization is licensed for and how much of it is in use. When a limit is reached, adding more is blocked; nothing already recorded is ever locked away, so evidence stays readable after a license ends." />
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StMetricCard label="Plan" value={p.label} delta="Self-hosted deployment" />
        <StMetricCard label="Term ends" value={p.term} valueTone={p.days <= 30 ? "warning" : "default"} delta={`${p.days} days left`} />
        <StMetricCard label="License key" value={plan === "evaluation" ? "None" : "Active"} delta={plan === "evaluation" ? "evaluation started at sign-up" : "lk_e86dfe39c753"} />
      </div>
      <div className="mt-5">
        <StPanel caption="Usage" hint="counted live · runs reset monthly">
          {["Entities in scope", "Agents", "Seats", "Runs this month"].map((l, i) => <StUsageMeter key={l} divider={i > 0} label={l} used={used[i]} limit={p.limits[i]} />)}
        </StPanel>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {Object.entries(ST_PLANS).map(([k, v]) => <StPlanCard key={k} name={v.label} current={k === plan} features={stFeatures(v.limits)} />)}
      </div>
      <p className="mt-3 text-[12px] text-stone-400">Plans are agreed on an order form and delivered as a signed license key. There is no in-app checkout.</p>
      <div className="mt-5">
        <StPanel caption="Activate a license key" hint="verified offline by signature">
          <div className="p-4">
            <StField label="License key" hint="Starts with PACT-. Only the key’s ID is stored. In this mockup, try PACT-evaluation or PACT-enterprise.">
              <textarea className={`${stInput} min-h-[70px] font-mono text-[13px]`} spellCheck={false} placeholder="PACT-…" value={key} onChange={e => { setKey(e.target.value); setMsg(null); }} />
            </StField>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 px-4 py-3">
            <StButton variant="primary" size="sm" disabled={!key.trim()} onClick={activate}>Activate</StButton>
            {msg && <span role="status" className={`text-[12px] ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</span>}
          </div>
        </StPanel>
      </div>
      <StFoot />
    </div>
  );
}

function SettingsBilling() {
  const [method, setMethod] = React.useState("invoice");
  return (
    <div className="mx-auto max-w-[1100px]">
      <StHead crumbs={["Settings", "Billing"]} title="Billing"
        lede="PACT is billed by invoice against an order form, the way finance teams usually buy software. No card is stored. These details appear on each invoice, so they should match what your accounts-payable team expects." />
      <div className="mt-5">
        <StPanel caption="Bill-to details">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <StField label="Legal entity name"><input className={stInput} defaultValue="Northwind Industrial, Inc." /></StField>
            <StField label="Billing email" hint="Invoices and reminders go here — usually an accounts-payable mailbox."><input className={stInput} type="email" defaultValue="ap@northwind.example" /></StField>
            <StField label="Billing address" className="sm:col-span-2"><textarea className={`${stInput} min-h-[64px]`} defaultValue={"1200 Harbor Way\nPortland, OR 97201"} /></StField>
            <StField label="Country"><select className={stInput}><option>United States</option><option>Germany</option><option>United Kingdom</option><option>Singapore</option></select></StField>
            <StField label="Tax ID" hint="VAT (value-added tax) number, GST (goods and services tax) number, or US EIN (employer identification number)."><input className={`${stInput} font-mono text-[13px]`} /></StField>
          </div>
        </StPanel>
      </div>
      <div className="mt-5">
        <StPanel caption="Payment">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <StField label="Payment method"><select className={stInput} value={method} onChange={e => setMethod(e.target.value)}><option value="invoice">Invoice — pay by bank or wire transfer</option><option value="ach">ACH (Automated Clearing House) — US bank debit</option></select></StField>
            <StField label="Payment terms"><select className={stInput} defaultValue="Net 30 — due in 30 days"><option>Net 15 — due 15 days after the invoice date</option><option>Net 30 — due in 30 days</option><option>Net 45 — due in 45 days</option><option>Net 60 — due in 60 days</option></select></StField>
            <StField label="Billing cycle"><select className={stInput}><option>Annual, in advance</option><option>Quarterly, in advance</option></select></StField>
            <StField label="Currency"><select className={stInput}><option>USD</option><option>EUR</option><option>GBP</option><option>SGD</option></select></StField>
            <StField label="Purchase order (PO) number" hint="Optional. If your company requires a PO, it is printed on every invoice." className="sm:col-span-2"><input className={`${stInput} font-mono text-[13px]`} defaultValue="PO-48213" /></StField>
            {method === "ach" && <p className="text-[12px] text-stone-500 sm:col-span-2">Bank details for ACH are collected on the signed order form, not in this console.</p>}
          </div>
          <StSaveBar label="Save billing details" />
        </StPanel>
      </div>
      <div className="mt-5">
        <StDataTable caption="Invoices" searchable={false} rowCount={false} rows={[]}
          emptyMessage="No invoices yet. The first invoice is issued when a paid license term starts."
          columns={[{ key: "n", label: "Invoice" }, { key: "f", label: "For" }, { key: "i", label: "Issued" }, { key: "d", label: "Due" }, { key: "a", label: "Amount", align: "right" }, { key: "s", label: "Status" }]} />
      </div>
      <StFoot />
    </div>
  );
}

Object.assign(window, { SettingsEntities, SettingsPeriods, SettingsMateriality, SettingsIntegrations, SettingsUsers, SettingsOrganization, SettingsLicense, SettingsBilling });
