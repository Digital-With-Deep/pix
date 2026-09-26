/* global React */
const { PageHead: EvHead, Chip: EvChip, ScreenFoot: EvFoot } = window;
const evDsc = window.dsc || (() => () => null);
const EvDataTable = evDsc("DataTable"), EvButton = evDsc("Button"), EvAlert = evDsc("Alert"), EvMetricCard = evDsc("MetricCard");

const EV_CARD = { borderRadius: 4, padding: "14px 16px" };
const tone = s => s.toLowerCase().replace(/[^a-z]/g, "");

const WORKPAPERS = [
  { wp: "WP-P2P-2027-Q1", scope: "US01 · P2P · FY27 Q1", conclusion: "Design not effective", prepared: "D. Sidhu", reviewed: "—", status: "Draft" },
  { wp: "WP-R2R-2027-Q1", scope: "US01 · R2R · FY27 Q1", conclusion: "Effective", prepared: "D. Sidhu", reviewed: "T. Beckett", status: "In review" },
  { wp: "WP-P2P-2026-Q4", scope: "US01 · P2P · FY26 Q4", conclusion: "Effective", prepared: "D. Sidhu", reviewed: "T. Beckett", status: "Attested" },
  { wp: "WP-O2C-2026-Q4", scope: "DE10 · O2C · FY26 Q4", conclusion: "Effective", prepared: "D. Sidhu", reviewed: "T. Beckett", status: "Attested" },
  { wp: "WP-R2R-2026-Q4", scope: "US01 · R2R · FY26 Q4", conclusion: "Effective", prepared: "D. Sidhu", reviewed: "T. Beckett", status: "Attested" },
  { wp: "WP-P2P-2026-Q3", scope: "US01 · P2P · FY26 Q3", conclusion: "Effective", prepared: "D. Sidhu", reviewed: "T. Beckett", status: "Attested" },
];

function Workpapers() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <EvHead
        crumbs={["Evidence", "Workpapers"]} title="Workpapers"
        lede="The deliverable. One per scope and period, assembled from immutable evidence items and carrying the command that regenerates it."
        actions={<React.Fragment>
          <EvButton variant="primary" size="sm">Generate workpaper</EvButton>
          <EvButton variant="secondary" size="sm">Export all</EvButton>
        </React.Fragment>}
      />
      <div className="mt-5">
        <EvDataTable
          caption="6 workpapers" searchable={false} rowCount={false}
          filters={[{ key: "status", options: ["Draft", "In review", "Attested"] }]}
          columns={[
            { key: "wp", label: "Workpaper", strong: true, sortable: true, render: r => <span className="font-mono">{r.wp}</span> },
            { key: "scope", label: "Scope" },
            { key: "conclusion", label: "Conclusion", render: r => <EvChip tone={r.conclusion === "Effective" ? "effective" : "ineffective"}>{r.conclusion}</EvChip> },
            { key: "prepared", label: "Prepared by" },
            { key: "reviewed", label: "Reviewed by" },
            { key: "status", label: "Status", render: r => <EvChip tone={tone(r.status)}>{r.status}</EvChip> },
          ]}
          rows={WORKPAPERS}
        />
      </div>
      <EvFoot />
    </div>
  );
}

const ATTESTATIONS = [
  { wp: "WP-P2P-2026-Q4", version: "v3", by: "A. Ruiz", role: "Corporate Controller", statement: "Controls operated effectively", signed: "14 Jan 2026" },
  { wp: "WP-R2R-2026-Q4", version: "v2", by: "A. Ruiz", role: "Corporate Controller", statement: "Controls operated effectively", signed: "14 Jan 2026" },
  { wp: "WP-O2C-2026-Q4", version: "v1", by: "A. Ruiz", role: "Corporate Controller", statement: "Controls operated effectively", signed: "14 Jan 2026" },
  { wp: "WP-P2P-2026-Q3", version: "v4", by: "A. Ruiz", role: "Corporate Controller", statement: "Controls operated effectively", signed: "12 Oct 2025" },
  { wp: "WP-R2R-2026-Q3", version: "v2", by: "A. Ruiz", role: "Corporate Controller", statement: "Controls operated effectively", signed: "12 Oct 2025" },
  { wp: "WP-P2P-2026-Q2", version: "v2", by: "A. Ruiz", role: "Corporate Controller", statement: "Effective with one deficiency", signed: "13 Jul 2025" },
  { wp: "WP-R2R-2026-Q2", version: "v1", by: "A. Ruiz", role: "Corporate Controller", statement: "Controls operated effectively", signed: "13 Jul 2025" },
];

function Attestations() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <EvHead
        crumbs={["Evidence", "Attestations"]} title="Attestations"
        lede="A signed statement by a named person against a specific workpaper version. Re-issuing the workpaper invalidates the attestation."
      />
      <div className="mt-5">
        <EvDataTable
          caption="7 attestations" searchable={false} rowCount={false}
          columns={[
            { key: "wp", label: "Workpaper", strong: true, sortable: true, render: r => <span className="font-mono">{r.wp}</span> },
            { key: "version", label: "Version", render: r => <span className="font-mono text-stone-400">{r.version}</span> },
            { key: "by", label: "Attested by" },
            { key: "role", label: "Role" },
            { key: "statement", label: "Statement" },
            { key: "signed", label: "Signed", sortable: true },
          ]}
          rows={ATTESTATIONS}
        />
      </div>
      <div className="mt-4">
        <EvAlert
          tone="neutral" icon="info"
          body="Nothing has been attested for FY2027 Q1. Three controls are still awaiting a full test after drift, and close is 47 days away."
        />
      </div>
      <EvFoot />
    </div>
  );
}

const EXPLORER_CARDS = [
  { label: "Evidence items", value: "1,840", delta: "across 42 runs" },
  { label: "Chain integrity", value: "Verified", valueTone: "success", delta: "last check 2h ago" },
  { label: "Oldest item", value: "14 Jun 2026", delta: "retained to Jun 2033" },
  { label: "Storage", value: "4.2 GB", delta: "traces and substrate" },
];

const EVIDENCE_ITEMS = [
  { item: "EI-018402", kind: "scenario_result", run: "#0042", hash: "sha256:9c4a71e0…", created: "6 Sep 2026 14:22" },
  { item: "EI-018401", kind: "trace", run: "#0042", hash: "sha256:2e88ff31…", created: "6 Sep 2026 14:22" },
  { item: "EI-018400", kind: "invariant_result", run: "#0042", hash: "sha256:71b0c94d…", created: "6 Sep 2026 14:22" },
  { item: "EI-018399", kind: "scenario_result", run: "#0042", hash: "sha256:44de10a8…", created: "6 Sep 2026 14:21" },
  { item: "EI-018398", kind: "trace", run: "#0042", hash: "sha256:0af7b3c2…", created: "6 Sep 2026 14:21" },
  { item: "EI-018397", kind: "run_manifest", run: "#0042", hash: "sha256:4c1f8b02…", created: "6 Sep 2026 14:19" },
  { item: "EI-018396", kind: "substrate", run: "#0042", hash: "sha256:d21e7745…", created: "6 Sep 2026 14:19" },
];

function EvidenceExplorer() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <EvHead
        crumbs={["Evidence", "Evidence explorer"]} title="Evidence explorer"
        lede="Every evidence item is append-only, content-hashed and retained for seven years. A run is never edited; a correction is a new run pointing at the old one."
      />
      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {EXPLORER_CARDS.map(c => <EvMetricCard key={c.label} {...c} style={EV_CARD} />)}
      </div>
      <div className="mt-4">
        <EvDataTable
          caption="Recent items" searchable={false} rowCount={false}
          filters={[{ key: "kind", options: ["scenario_result", "trace", "invariant_result", "run_manifest", "substrate"] }]}
          columns={[
            { key: "item", label: "Item", strong: true, render: r => <span className="font-mono">{r.item}</span> },
            { key: "kind", label: "Kind", render: r => <span className="font-mono text-stone-500">{r.kind}</span> },
            { key: "run", label: "Run", render: r => <span className="font-mono">{r.run}</span> },
            { key: "hash", label: "Content hash", render: r => <span className="font-mono text-stone-400">{r.hash}</span> },
            { key: "created", label: "Created" },
          ]}
          rows={EVIDENCE_ITEMS}
        />
      </div>
      <EvFoot />
    </div>
  );
}

Object.assign(window, { Workpapers, Attestations, EvidenceExplorer });
