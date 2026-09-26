/* global React */
const { PageHead: AgHead, Chip: AgChip, ScreenFoot: AgFoot } = window;
const agDsc = window.dsc || (() => () => null);
const AgDataTable = agDsc("DataTable"), AgButton = agDsc("Button"), AgAlert = agDsc("Alert");

const MORE_AGENTS = [
  { agent: "FX Revaluation 1.0", vendor: "Internal", entity: "DE10", process: "R2R", control: "C-R2R-011", status: "Certified", certified: "18 Aug 2026", fp: "a920…4c71" },
  { agent: "WHT Assessor 1.1", vendor: "Kagent", entity: "DE10", process: "P2P", control: "C-P2P-030", status: "Drifted", certified: "11 Aug 2026", fp: "3f8b…d204" },
  { agent: "Credit Memo Router 1.3", vendor: "Internal", entity: "DE10", process: "O2C", control: "C-O2C-006", status: "Uncertified", certified: "—", fp: "–" },
  { agent: "Accrual Estimator 0.8", vendor: "SAP", entity: "SG20", process: "R2R", control: "C-R2R-015", status: "Uncertified", certified: "—", fp: "–" },
  { agent: "Dunning Agent 2.0", vendor: "Kagent", entity: "SG20", process: "O2C", control: "C-O2C-012", status: "Certified", certified: "24 Aug 2026", fp: "b115…9e30" },
];

const ALL_AGENTS = [...(window.PACT_AGENTS || []), ...MORE_AGENTS];

const AGENT_COLUMNS = [
  { key: "agent", label: "Agent", strong: true, sortable: true, render: r => <span className="font-mono">{r.agent}</span> },
  { key: "vendor", label: "Vendor", sortable: true },
  { key: "entity", label: "Entity", render: r => <span className="font-mono">{r.entity}</span> },
  { key: "process", label: "Process", render: r => <span className="font-mono">{r.process}</span> },
  { key: "control", label: "Control", render: r => <span className="font-mono">{r.control}</span> },
  { key: "status", label: "Status", render: r => <AgChip tone={r.status.toLowerCase()}>{r.status}</AgChip> },
  { key: "certified", label: "Last certified", sortable: true },
  { key: "fp", label: "Fingerprint", render: r => <span className="font-mono text-stone-400">{r.fp}</span> },
];

const AGENT_VIEWS = {
  "All agents": {
    title: "All agents",
    lede: "Every agent operating inside a process in ICFR scope, and the control each one implements.",
    rows: ALL_AGENTS,
  },
  "Awaiting certification": {
    title: "Awaiting certification",
    lede: "Agents in ICFR scope that have never passed a certification run. None of these can be relied upon as controls.",
    rows: ALL_AGENTS.filter(r => r.status === "Uncertified"),
  },
  Drifted: {
    title: "Drifted",
    lede: "Certified agents whose fingerprint has changed since certification. Prior testing no longer supports reliance.",
    rows: ALL_AGENTS.filter(r => r.status === "Drifted"),
    alert: "Benchmarking is unavailable for a drifted agent. Each of these needs a full operating-effectiveness test before Q1 close.",
  },
};

function AgentInventory({ view = "All agents" }) {
  const v = AGENT_VIEWS[view] || AGENT_VIEWS["All agents"];
  return (
    <div className="mx-auto max-w-[1400px]">
      <AgHead
        crumbs={view === "All agents" ? ["Agents"] : ["Agents", view]}
        title={v.title} lede={v.lede}
        actions={<React.Fragment>
          <AgButton variant="primary" size="sm">Certify agent</AgButton>
          <AgButton variant="secondary" size="sm">Import inventory</AgButton>
          <AgButton variant="secondary" size="sm">Export CSV</AgButton>
        </React.Fragment>}
      />
      {v.alert && (
        <div className="mt-5">
          <AgAlert tone="fault" icon title="Three agents are running on an uncertified configuration." body={v.alert} />
        </div>
      )}
      <div className="mt-5">
        <AgDataTable
          caption={`${v.rows.length} agents`} searchable={false} rowCount={false}
          filters={[{ key: "entity", options: ["US01", "DE10", "SG20"] }, { key: "status", options: ["Certified", "Drifted", "Uncertified"] }]}
          columns={AGENT_COLUMNS} rows={v.rows}
        />
      </div>
      <AgFoot />
    </div>
  );
}

const GRANTS = [
  { agent: "AP-Resolver 1.2", action: "clear_for_payment", scope: "US01 · P2P", limit: "$50,000", approval: "Auto", version: "v4", valid: "31 Mar 2027" },
  { agent: "AP-Resolver 1.2", action: "propose_resolution", scope: "US01 · P2P", limit: "—", approval: "No", version: "v4", valid: "31 Mar 2027" },
  { agent: "Journal Poster 0.9", action: "post_journal", scope: "US01 · R2R", limit: "$25,000", approval: "Required", version: "v2", valid: "31 Mar 2027" },
  { agent: "Duplicate Detector 3.0", action: "block_payment", scope: "US01 · P2P", limit: "—", approval: "No", version: "v3", valid: "31 Mar 2027" },
  { agent: "GR/IR Clearer 1.4", action: "post_journal", scope: "US01 · P2P", limit: "$10,000", approval: "Required", version: "v1", valid: "31 Mar 2027" },
  { agent: "Vendor Onboarder 2.2", action: "create_vendor", scope: "US01", limit: "—", approval: "Required", version: "v5", valid: "31 Mar 2027" },
  { agent: "FX Revaluation 1.0", action: "post_journal", scope: "DE10 · R2R", limit: "$100,000", approval: "Required", version: "v2", valid: "31 Mar 2027" },
  { agent: "WHT Assessor 1.1", action: "propose_resolution", scope: "DE10 · P2P", limit: "—", approval: "No", version: "v1", valid: "31 Mar 2027" },
  { agent: "Credit Memo Router 1.3", action: "route_document", scope: "DE10 · O2C", limit: "—", approval: "No", version: "v2", valid: "31 Mar 2027" },
  { agent: "Bank Rec Agent 1.6", action: "match_item", scope: "US01 · R2R", limit: "—", approval: "No", version: "v3", valid: "31 Mar 2027" },
];

function AuthorityGrants() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <AgHead
        crumbs={["Agents", "Authority grants"]} title="Authority grants"
        lede="What each agent is permitted to do, in which entity, up to what value, and whether a human has to approve it. This is the decision-authority matrix, made machine-readable."
        actions={<React.Fragment>
          <AgButton variant="primary" size="sm">New grant</AgButton>
          <AgButton variant="secondary" size="sm">Export matrix</AgButton>
        </React.Fragment>}
      />
      <div className="mt-5">
        <AgDataTable
          caption="18 grants across 14 agents" searchable={false} rowCount={false}
          columns={[
            { key: "agent", label: "Agent", strong: true, sortable: true, render: r => <span className="font-mono">{r.agent}</span> },
            { key: "action", label: "Action", render: r => <span className="font-mono">{r.action}</span> },
            { key: "scope", label: "Scope", render: r => <span className="font-mono">{r.scope}</span> },
            { key: "limit", label: "Monetary limit", align: "right", render: r => <span className="font-mono">{r.limit}</span> },
            { key: "approval", label: "Human approval", render: r => <AgChip tone={r.approval.toLowerCase()}>{r.approval}</AgChip> },
            { key: "version", label: "Version", render: r => <span className="font-mono text-stone-400">{r.version}</span> },
            { key: "valid", label: "Valid to" },
          ]}
          rows={GRANTS}
        />
      </div>
      <AgFoot />
    </div>
  );
}

const IDENTITIES = [
  { svc: "SVC_APRES_US01", agent: "AP-Resolver 1.2", entity: "US01", ent: "MIRO, MIR4, FB03", state: "Active", owner: "A. Ruiz", reviewed: "1 Aug 2026" },
  { svc: "SVC_JRNL_US01", agent: "Journal Poster 0.9", entity: "US01", ent: "FB50, FBV0", state: "Active", owner: "A. Ruiz", reviewed: "1 Aug 2026" },
  { svc: "SVC_ICMATCH_US01", agent: "Intercompany Matcher 2.1", entity: "US01", ent: "FBRA, F-03", state: "Active", owner: null, reviewed: "—" },
  { svc: "SVC_DUP_US01", agent: "Duplicate Detector 3.0", entity: "US01", ent: "MIR4 display", state: "Active", owner: "A. Ruiz", reviewed: "1 Aug 2026" },
  { svc: "SVC_GRIR_US01", agent: "GR/IR Clearer 1.4", entity: "US01", ent: "MR11, FB03", state: "Active", owner: "A. Ruiz", reviewed: "1 Aug 2026" },
  { svc: "SVC_VEND_US01", agent: "Vendor Onboarder 2.2", entity: "US01", ent: "XK01, XK02", state: "Active", owner: "T. Beckett", reviewed: "1 Aug 2026" },
  { svc: "SVC_FXREV_DE10", agent: "FX Revaluation 1.0", entity: "DE10", ent: "FAGL_FCV", state: "Active", owner: null, reviewed: "—" },
  { svc: "SVC_WHT_DE10", agent: "WHT Assessor 1.1", entity: "DE10", ent: "MIRO display", state: "Active", owner: "A. Ruiz", reviewed: "1 Aug 2026" },
];

function AgentIdentities() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <AgHead
        crumbs={["Agents", "Agent identities"]} title="Agent identities"
        lede="Every agent acts in the ERP under a non-human identity. Machine identities now outnumber human users, and they rarely have a joiner-mover-leaver process behind them."
      />
      <div className="mt-5">
        <AgAlert
          tone="fault" icon title="2 identities have no named owner."
          body="An identity without an owner cannot be reviewed at period end, and an auditor will treat that as an access control gap rather than an AI issue."
        />
      </div>
      <div className="mt-4">
        <AgDataTable
          caption="14 non-human identities" searchable={false} rowCount={false}
          columns={[
            { key: "svc", label: "Service account", strong: true, sortable: true, render: r => <span className="font-mono">{r.svc}</span> },
            { key: "agent", label: "Agent" },
            { key: "entity", label: "Entity", render: r => <span className="font-mono">{r.entity}</span> },
            { key: "ent", label: "Entitlements", render: r => <span className="font-mono text-stone-400">{r.ent}</span> },
            { key: "state", label: "State", render: r => <AgChip tone="active">{r.state}</AgChip> },
            { key: "owner", label: "Owner", render: r => r.owner ? r.owner : <span className="text-red-600">Unassigned</span> },
            { key: "reviewed", label: "Last reviewed" },
          ]}
          rows={IDENTITIES}
        />
      </div>
      <AgFoot />
    </div>
  );
}

Object.assign(window, { AgentInventory, AuthorityGrants, AgentIdentities });
