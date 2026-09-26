/* global React */
const { PageHead: AlHead, ScreenFoot: AlFoot } = window;
const alDsc = window.dsc || (() => () => null);
const AlAuditLog = alDsc("AuditLog"), AlButton = alDsc("Button");

// 6,000 deterministic synthetic events — illustrative data, no client systems connected.
function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
const R = rng(42), pick = a => a[Math.floor(R() * a.length)];
const NOW = Date.parse("2026-09-06T14:30:00Z");
const AGENTS = [["AP-Resolver 1.2", "SVC_APRES_US01", "US01", "C-P2P-014"], ["Journal Poster 0.9", "SVC_JRNL_US01", "US01", "C-R2R-002"], ["Duplicate Detector 3.0", "SVC_DUP_US01", "US01", "C-P2P-021"], ["GR/IR Clearer 1.4", "SVC_GRIR_US01", "US01", "C-P2P-017"], ["FX Revaluation 1.0", "SVC_FXREV_DE10", "DE10", "C-R2R-011"], ["WHT Assessor 1.1", "SVC_WHT_DE10", "DE10", "C-P2P-030"]];
const READS = [["SAP S/4HANA", "BSEG line items", "MIR4"], ["SAP S/4HANA", "vendor master LFA1", "XK03"], ["SAP S/4HANA", "tolerance key PRICE", "OMR6"], ["SharePoint", "treaty_certificates/", "GET"], ["Snowflake", "fx_rates_daily", "SELECT"], ["SAP ECC", "open items BSIK", "FBL1N"]];
const WRITES = [["SAP S/4HANA", "payment block removed", "MRBR"], ["SAP S/4HANA", "journal parked", "FBV0"], ["ServiceNow", "exception ticket", "POST"], ["S3 / evidence bucket", "findings.parquet", "PUT"], ["SAP ECC", "GR/IR clearing posted", "MR11"]];
const TOOLS = ["get_invoice", "lookup_vendor", "read_tolerance", "calculate", "get_treaty_certificate", "match_open_items"];
const DECISIONS = [["resolve · clear_for_payment", "Amount matches expected withholding to the cent; treaty rate taken from vendor master.", "flagged"], ["escalate · route_to_tax", "Certificate validity could not be established on the invoice date, so the precondition is unverified.", "ok"], ["resolve · post_journal", "Accrual is supported by a document reference and falls inside the period.", "ok"], ["hold · await_approval", "Value exceeds the authority grant limit of $50,000; human approval is required.", "ok"]];
const AUDIT_EVENTS = [];
for (let i = 0; i < 6000; i++) {
  const a = pick(AGENTS), r = R(), age = Math.pow(R(), 1.7) * 30 * 864e5, run = "run-" + String(42 - Math.floor(age / 864e5 * 1.3)).padStart(4, "0");
  const e = { id: "ev-" + String(100000 + i), ts: NOW - Math.floor(age), agent: a[0], identity: a[1], entity: a[2], control: a[3], run_id: run, trace_id: "tr-" + Math.floor(R() * 900 + 100).toString(16) + Math.floor(R() * 4096).toString(16), step: 1 + Math.floor(R() * 6) };
  if (r < 0.46) { const s = pick(READS); Object.assign(e, { kind: "read", system: s[0], resource: s[1], action: s[2], outcome: R() < 0.97 ? "ok" : "denied", latency_ms: 20 + Math.floor(R() * 260), bytes: 400 + Math.floor(R() * 90000), message: "Read " + s[1] + " via " + s[2] }); }
  else if (r < 0.62) { const s = pick(WRITES); const o = R() < 0.9 ? "ok" : (R() < 0.5 ? "denied" : "error"); Object.assign(e, { kind: "write", system: s[0], resource: s[1], action: s[2], outcome: o, latency_ms: 60 + Math.floor(R() * 900), message: (o === "denied" ? "Write refused by authority grant: " : "Wrote ") + s[1] + " via " + s[2] }); }
  else if (r < 0.84) { const t = pick(TOOLS); Object.assign(e, { kind: "tool_call", system: "Agent runtime", action: t, outcome: R() < 0.98 ? "ok" : "error", latency_ms: 5 + Math.floor(R() * 240), tokens: 80 + Math.floor(R() * 900), message: "Tool call " + t }); }
  else if (r < 0.94) { const d = pick(DECISIONS); Object.assign(e, { kind: "decision", system: "Agent runtime", action: d[0], outcome: d[2], rationale: d[1], model: "gpt-5.2", latency_ms: 300 + Math.floor(R() * 2400), message: "Decision: " + d[0] }); }
  else if (r < 0.98) Object.assign(e, { kind: "auth", system: pick(["SAP S/4HANA", "SAP ECC", "Snowflake"]), action: "token_issue", outcome: R() < 0.95 ? "ok" : "denied", latency_ms: 30 + Math.floor(R() * 120), message: "Service identity authenticated" });
  else Object.assign(e, { kind: "escalation", system: "ServiceNow", action: "route_to_human", outcome: "ok", latency_ms: 200 + Math.floor(R() * 600), message: "Escalated to tax-ops for review" });
  if (e.outcome === "denied" && e.kind !== "write") e.message = "Access denied: " + e.message;
  AUDIT_EVENTS.push(e);
}

function AuditLogScreen() {
  const [st, setSt] = React.useState({ params: "", hits: 0 });
  return (
    <div className="mx-auto max-w-[1400px]">
      <AlHead
        crumbs={["Evidence", "Audit log"]} title="Audit log"
        lede="Every system read and write, tool call, decision and escalation an agent made, under the identity it acted as. Append-only; a search is a view, never an edit."
        actions={<React.Fragment>
          <AlButton variant="primary" size="sm">Attach search to workpaper</AlButton>
          <AlButton variant="secondary" size="sm">Export hits</AlButton>
        </React.Fragment>}
      />
      <div className="mt-5">
        <AlAuditLog events={AUDIT_EVENTS} now={NOW} height={640} defaultRange="7d"
          defaultQuery="-outcome:ok" onStateChange={setSt} baseUrl="https://console.pact.example/evidence/audit-log" />
      </div>
      <p className="mt-3 break-all font-mono text-[11px] text-stone-400">
        https://console.pact.example/evidence/audit-log{st.params ? "?" + st.params : ""}
      </p>
      <AlFoot />
    </div>
  );
}

Object.assign(window, { AuditLogScreen });
