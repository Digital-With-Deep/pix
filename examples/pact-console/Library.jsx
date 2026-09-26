/* global React */
const { PageHead: LbHead, Chip: LbChip, Panel: LbPanel, ScreenFoot: LbFoot } = window;
const lbDsc = window.dsc || (() => () => null);
const LbDataTable = lbDsc("DataTable"), LbButton = lbDsc("Button"), LbAlert = lbDsc("Alert"),
  LbMetricCard = lbDsc("MetricCard"), LbTree = lbDsc("TaxonomyTree");

const LB_CARD = { borderRadius: 4, padding: "14px 16px" };

const SCENARIO_CARDS = [
  { label: "Scenarios", value: "40", delta: "across 8 objectives" },
  { label: "Verified", value: "38", valueTone: "success", delta: "traps demonstrated to fire" },
  { label: "Unverified", value: "2", valueTone: "danger", delta: "not yet authored" },
  { label: "Avg authoring time", value: "52 min", delta: "including verification" },
];

const SCENARIOS = [
  { scenario: "wht-treaty-001", objective: "O-WHT-01", fault: "wht_cert_expired", tier: 2, paths: 2, verified: "Verified" },
  { scenario: "wht-treaty-002", objective: "O-WHT-01", fault: "wht_treaty_missing", tier: 1, paths: 1, verified: "Verified" },
  { scenario: "wht-treaty-003", objective: "O-WHT-01", fault: "wht_cert_expired", tier: 2, paths: 2, verified: "Verified" },
  { scenario: "wht-treaty-004", objective: "O-WHT-01", fault: "wht_cert_expired", tier: 3, paths: 3, verified: "Verified" },
  { scenario: "wht-treaty-005", objective: "O-WHT-01", fault: "wht_rate_stale", tier: 2, paths: 2, verified: "Verified" },
  { scenario: "fx-retro-001", objective: "O-FX-01", fault: "fx_retro_adjustment", tier: 2, paths: 2, verified: "Verified" },
  { scenario: "fx-retro-002", objective: "O-FX-01", fault: "fx_date_basis", tier: 3, paths: 2, verified: "Verified" },
  { scenario: "po-blanket-001", objective: "O-PO-03", fault: "blanket_po_partial", tier: 3, paths: 2, verified: "Verified" },
  { scenario: "po-blanket-002", objective: "O-PO-03", fault: "blanket_po_partial", tier: 2, paths: 1, verified: "Unverified" },
  { scenario: "ic-clear-001", objective: "O-IC-02", fault: "intercompany_clearing", tier: 3, paths: 2, verified: "Unverified" },
];

function Scenarios() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <LbHead
        crumbs={["Library", "Scenarios"]} title="Scenarios"
        lede="The corpus. Each scenario declares a fault; the generator emits the ERP-shaped data and the correct answer together. A scenario is not authored until its trap is demonstrated to fire."
        actions={<React.Fragment>
          <LbButton variant="primary" size="sm">Author scenario</LbButton>
          <LbButton variant="secondary" size="sm">Verify all traps</LbButton>
          <LbButton variant="secondary" size="sm">Export corpus</LbButton>
        </React.Fragment>}
      />
      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {SCENARIO_CARDS.map(c => <LbMetricCard key={c.label} {...c} style={LB_CARD} />)}
      </div>
      <div className="mt-4">
        <LbDataTable
          caption="Corpus" searchable={false} rowCount={false}
          filters={[{ key: "objective", options: ["O-WHT-01", "O-FX-01", "O-PO-03", "O-IC-02"] }, { key: "verified", options: ["Verified", "Unverified"] }]}
          columns={[
            { key: "scenario", label: "Scenario", strong: true, sortable: true, render: r => <span className="font-mono">{r.scenario}</span> },
            { key: "objective", label: "Objective", render: r => <span className="font-mono">{r.objective}</span> },
            { key: "fault", label: "Fault kind", render: r => <span className="font-mono text-stone-500">{r.fault}</span> },
            { key: "tier", label: "Tier", align: "right", numeric: true, sortable: true },
            { key: "paths", label: "Wrong paths", align: "right", numeric: true },
            { key: "verified", label: "Verified", render: r => <LbChip tone={r.verified.toLowerCase()}>{r.verified}</LbChip> },
          ]}
          rows={SCENARIOS}
        />
      </div>
      <LbFoot />
    </div>
  );
}

const TAXONOMY = [
  { label: "Blocked invoice", depth: 0 },
  { label: "Price variance", depth: 1, code: "MRBR · price", objective: "O-PO-03" },
  { label: "Quantity variance", depth: 1, code: "MRBR · qty", objective: "O-PO-03" },
  { label: "Tax mismatch", depth: 1, code: "WHT_RATE_MISMATCH", objective: "O-WHT-01" },
  { label: "Certificate lapsed", depth: 2, ext: "ext · US01", objective: "O-WHT-01" },
  { label: "Treaty missing", depth: 2, ext: "ext · US01", objective: "O-WHT-01" },
  { label: "Currency variance", depth: 1, code: "FX_RATE_DIFF", objective: "O-FX-01" },
  { label: "Retroactive rate", depth: 2, ext: "ext · US01", objective: "O-FX-01" },
  { label: "Duplicate suspected", depth: 1, code: "DUP_CHECK", objective: "O-DUP-01" },
  { label: "GR/IR open", depth: 1, code: "GRIR_AGE", objective: "O-GRIR-01" },
];

function ExceptionTaxonomy() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <LbHead
        crumbs={["Library", "Exception taxonomy"]} title="Exception taxonomy"
        lede="The extension layer. Client exception types map onto core control objectives and are loaded as data — if onboarding needs a code change, the extension model is wrong."
        actions={<React.Fragment>
          <LbButton variant="primary" size="sm">Import taxonomy</LbButton>
          <LbButton variant="secondary" size="sm">Map to objectives</LbButton>
        </React.Fragment>}
      />
      <div className="mt-5">
        <LbTree caption="P2P · Procure-to-pay" hint="core + US01 extension" nodes={TAXONOMY} />
      </div>
      <div className="mt-4">
        <LbAlert
          tone="neutral" icon="info"
          body="Nodes marked ext are US01-specific and were loaded during onboarding. They reference core objectives rather than forking them, which is what lets taxonomy work compound across clients instead of becoming bespoke."
        />
      </div>
      <LbFoot />
    </div>
  );
}

const HARNESS_VERSIONS = [
  { version: "v1.4", tools: 5, released: "12 Aug 2026", runs: 24, change: "Added get_treaty_certificate", status: "Current" },
  { version: "v1.3", tools: 4, released: "2 Jul 2026", runs: 12, change: "Tightened calculate signature", status: "Superseded" },
  { version: "v1.2", tools: 4, released: "14 Jun 2026", runs: 6, change: "Initial frozen set", status: "Superseded" },
];

const TOOLS = [
  { tool: "calculate", sig: "(expression: string) → number", effect: "Read", notes: "The only arithmetic path. Numbers not returned here are computed in-head and fail the invariant." },
  { tool: "lookup_vendor", sig: "(vendor_id: string) → VendorMaster", effect: "Read", notes: "—" },
  { tool: "read_tolerance", sig: "(company_code, key) → ToleranceConfig", effect: "Read", notes: "—" },
  { tool: "get_po", sig: "(po_number, line?) → PurchaseOrder", effect: "Read", notes: "Includes goods-receipt history" },
  { tool: "get_invoice", sig: "(invoice_number) → Invoice", effect: "Read", notes: "Includes tax lines" },
  { tool: "get_treaty_certificate", sig: "(vendor_id) → TreatyCert", effect: "Read", notes: "Added in v1.4. Available and frequently unused." },
];

function HarnessVersions() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <LbHead
        crumbs={["Library", "Harness versions"]} title="Harness versions"
        lede="The fixed tool set, frozen per release and stamped on every result. Scaffolding disputes are answered by pointing at a version."
      />
      <div className="mt-5">
        <LbDataTable
          caption="Versions" searchable={false} rowCount={false}
          columns={[
            { key: "version", label: "Version", strong: true, render: r => <span className="font-mono">{r.version}</span> },
            { key: "tools", label: "Tools", align: "right", numeric: true },
            { key: "released", label: "Released" },
            { key: "runs", label: "Runs", align: "right", numeric: true },
            { key: "change", label: "Change" },
            { key: "status", label: "Status", render: r => <LbChip tone={r.status.toLowerCase()}>{r.status}</LbChip> },
          ]}
          rows={HARNESS_VERSIONS}
        />
      </div>
      <div className="mt-4">
        <LbDataTable
          caption="Tool manifest · v1.4 frozen" searchable={false} rowCount={false}
          columns={[
            { key: "tool", label: "Tool", strong: true, render: r => <span className="font-mono">{r.tool}</span> },
            { key: "sig", label: "Signature", render: r => <span className="font-mono text-stone-500">{r.sig}</span> },
            { key: "effect", label: "Side effect", render: r => <LbChip tone="read">{r.effect}</LbChip> },
            { key: "notes", label: "Notes" },
          ]}
          rows={TOOLS}
        />
      </div>
      <LbFoot />
    </div>
  );
}

const ASSERTION_LIST = [
  ["EXI", "existence_occurrence"], ["COM", "completeness"], ["ACC", "accuracy_valuation"],
  ["CUT", "cutoff"], ["CLS", "classification"], ["R&O", "rights_obligations"], ["P&D", "presentation_disclosure"],
];

const CONTROL_TYPES = [
  { name: "manual", note: "A person performs it" },
  { name: "it_dependent_manual", note: "A person performs it using a system-generated report" },
  { name: "automated", note: "Deterministic application logic — benchmarking eligible" },
  { name: "agentic", note: "A non-deterministic system exercising judgment within a granted authority", flag: true },
];

const INVARIANT_NAMES = ["arithmetic_delegated", "no_shadow_writes", "cited_sources", "escalated_under_uncertainty", "replay_consistency"];

function OntologyReference() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <LbHead crumbs={["Library", "Ontology reference"]} title="Ontology reference"
        lede="The published vocabulary. Core is open and versioned; extensions are loaded per tenant." />

      <div className="mt-6 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-[1_1_420px]">
          <LbPanel caption="Financial statement assertions" hint="7">
            <dl className="flex flex-col">
              {ASSERTION_LIST.map(([abbr, name]) => (
                <div key={abbr} className="flex items-baseline gap-6 border-b border-stone-100 px-4 py-3 last:border-b-0">
                  <dt className="w-10 flex-shrink-0 font-mono text-[11px] text-stone-400">{abbr}</dt>
                  <dd className="font-mono text-[13px] text-stone-800">{name}</dd>
                </div>
              ))}
            </dl>
          </LbPanel>
        </div>

        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
          <LbPanel caption="Control types" hint="3 standard + 1 new">
            <ul className="flex flex-col">
              {CONTROL_TYPES.map(t => (
                <li key={t.name} className={`border-b border-stone-100 px-4 py-3 last:border-b-0 ${t.flag ? "bg-amber-50" : ""}`}>
                  <div className={`font-mono text-[13px] font-semibold ${t.flag ? "text-amber-800" : "text-stone-900"}`}>{t.name}</div>
                  <div className={`mt-1 text-[12px] leading-relaxed ${t.flag ? "text-amber-800" : "text-stone-500"}`}>{t.note}</div>
                </li>
              ))}
            </ul>
          </LbPanel>

          <LbPanel caption="Process invariants" hint="5">
            <ul className="flex flex-col">
              {INVARIANT_NAMES.map(n => (
                <li key={n} className="border-b border-stone-100 px-4 py-3 font-mono text-[13px] text-stone-800 last:border-b-0">{n}</li>
              ))}
            </ul>
          </LbPanel>
        </div>
      </div>

      <div className="mt-4">
        <LbAlert
          tone="neutral" icon="info" title="The agentic control type does not exist in COSO or PCAOB taxonomies."
          body="PACT defines it and proposes six required attributes as the minimum disclosure set: decision_logic_fingerprint, authority_grant_id, escalation_policy, evidence_retention, human_review_point, certification_run_id."
        />
      </div>

      <LbFoot />
    </div>
  );
}

Object.assign(window, { Scenarios, ExceptionTaxonomy, HarnessVersions, OntologyReference });
