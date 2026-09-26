/* global React */
const { PageHead: CtHead, Chip: CtChip, ScreenFoot: CtFoot } = window;
const ctDsc = window.dsc || (() => () => null);
const CtDataTable = ctDsc("DataTable"), CtButton = ctDsc("Button"), CtAlert = ctDsc("Alert"), CtMatrix = ctDsc("CoverageMatrix");

const OBJECTIVES = [
  { code: "O-WHT-01", desc: "Withholding is calculated at the correct rate and supported by valid documentation", process: "P2P", assertions: "ACC · COM", scenarios: 10, coverage: "Stale" },
  { code: "O-FX-01", desc: "Foreign-currency invoices are valued at the correct rate for the correct date basis", process: "P2P", assertions: "ACC · CUT", scenarios: 9, coverage: "Covered" },
  { code: "O-PO-03", desc: "Quantities and tolerances are evaluated at the correct level and period", process: "P2P", assertions: "COM · CUT", scenarios: 8, coverage: "Covered" },
  { code: "O-IC-02", desc: "Intercompany balances are matched and eliminated correctly", process: "R2R", assertions: "EXI · CLS", scenarios: 0, coverage: "None" },
  { code: "O-DUP-01", desc: "Duplicate invoices are detected before payment is released", process: "P2P", assertions: "EXI", scenarios: 6, coverage: "Covered" },
  { code: "O-GRIR-01", desc: "Goods-receipt / invoice-receipt differences are cleared to the correct period", process: "P2P", assertions: "CUT · COM", scenarios: 7, coverage: "Covered" },
  { code: "O-ACC-01", desc: "Accruals are supported and reversed in the correct period", process: "R2R", assertions: "COM · CUT", scenarios: 0, coverage: "None" },
  { code: "O-BNK-01", desc: "Bank reconciling items are identified and aged correctly", process: "R2R", assertions: "EXI · ACC", scenarios: 5, coverage: "Covered" },
];

function ControlObjectives() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <CtHead
        crumbs={["Controls", "Control objectives"]} title="Control objectives"
        lede="What each control must achieve to mitigate a risk of material misstatement, and how much test material stands behind it."
        actions={<React.Fragment>
          <CtButton variant="primary" size="sm">Author scenario</CtButton>
          <CtButton variant="secondary" size="sm">Import from GRC</CtButton>
        </React.Fragment>}
      />
      <div className="mt-5">
        <CtDataTable
          caption="8 objectives in scope" searchable={false} rowCount={false}
          filters={[{ key: "process", options: ["P2P", "R2R", "O2C"] }, { key: "coverage", options: ["Covered", "Stale", "None"] }]}
          columns={[
            { key: "code", label: "Objective", strong: true, sortable: true, render: r => <span className="font-mono">{r.code}</span> },
            { key: "desc", label: "Description" },
            { key: "process", label: "Process", render: r => <span className="font-mono">{r.process}</span> },
            { key: "assertions", label: "Assertions", render: r => <span className="font-mono text-stone-400">{r.assertions}</span> },
            { key: "scenarios", label: "Scenarios", align: "right", numeric: true, sortable: true },
            { key: "coverage", label: "Coverage", render: r => <CtChip tone={r.coverage.toLowerCase()}>{r.coverage}</CtChip> },
          ]}
          rows={OBJECTIVES}
        />
      </div>
      <CtFoot />
    </div>
  );
}

const ASSERTIONS = ["EXI", "COM", "ACC", "CUT", "CLS", "R&O", "P&D"];
const MATRIX_ROWS = [
  { label: "O-WHT-01", description: "Withholding is calculated at the correct rate", cells: ["na", "stale", "stale", "na", "na", "na", "na"] },
  { label: "O-FX-01", description: "Foreign-currency invoices are valued at the correct rate", cells: ["na", "na", "tested", "tested", "na", "na", "na"] },
  { label: "O-PO-03", description: "Quantities and tolerances are evaluated at the correct level", cells: ["na", "tested", "na", "tested", "na", "na", "na"] },
  { label: "O-IC-02", description: "Intercompany balances are matched and eliminated", cells: ["none", "na", "na", "na", "none", "na", "na"] },
  { label: "O-DUP-01", description: "Duplicate invoices are detected before payment", cells: ["tested", "na", "na", "na", "na", "na", "na"] },
  { label: "O-GRIR-01", description: "Goods-receipt / invoice-receipt differences are cleared", cells: ["na", "tested", "na", "tested", "na", "na", "na"] },
  { label: "O-ACC-01", description: "Accruals are supported and reversed in the correct period", cells: ["na", "none", "na", "none", "na", "na", "na"] },
  { label: "O-BNK-01", description: "Bank reconciling items are identified and aged", cells: ["tested", "na", "tested", "na", "na", "na", "na"] },
];

function AssertionCoverage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <CtHead
        crumbs={["Controls", "Assertion coverage"]} title="Assertion coverage"
        lede="Objectives down, financial statement assertions across. This is the grid an audit partner will stare at, and the one that makes gaps undeniable."
      />
      <div className="mt-5">
        <CtMatrix assertions={ASSERTIONS} rows={MATRIX_ROWS} />
      </div>
      <div className="mt-4">
        <CtAlert
          tone="fault" icon title="Four cells have no evidence."
          body="Existence and classification for intercompany clearing, and completeness and cutoff for accruals. Both objectives have agents assigned and running in production — they are operating without any test material behind them."
        />
      </div>
      <CtFoot />
    </div>
  );
}

const RISKS = [
  { risk: "RMM-01", desc: "Withholding under-assessed on treaty-eligible foreign vendors", likelihood: "Moderate", magnitude: "$1.2M", objective: "O-WHT-01", agent: "AP-Resolver" },
  { risk: "RMM-02", desc: "Foreign-currency invoices valued at the wrong rate date", likelihood: "Moderate", magnitude: "$800K", objective: "O-FX-01", agent: "FX Revaluation" },
  { risk: "RMM-03", desc: "Blanket PO call-offs exceed tolerance across periods", likelihood: "Low", magnitude: "$400K", objective: "O-PO-03", agent: "PO Amender" },
  { risk: "RMM-04", desc: "Intercompany balances fail to eliminate on consolidation", likelihood: "High", magnitude: "$3.1M", objective: "O-IC-02", agent: "Intercompany Matcher" },
  { risk: "RMM-05", desc: "Duplicate invoices released for payment", likelihood: "Moderate", magnitude: "$650K", objective: "O-DUP-01", agent: "Duplicate Detector" },
  { risk: "RMM-06", desc: "Accruals not reversed in the following period", likelihood: "Moderate", magnitude: "$900K", objective: "O-ACC-01", agent: "Accrual Proposer" },
];

function RiskMap() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <CtHead
        crumbs={["Controls", "Risk map"]} title="Risk map"
        lede="Risks of material misstatement, the objectives that mitigate them, and where an agent now sits in the path."
      />
      <div className="mt-5">
        <CtDataTable
          caption="Risks of material misstatement" searchable={false} rowCount={false}
          filters={[{ key: "likelihood", options: ["High", "Moderate", "Low"] }]}
          columns={[
            { key: "risk", label: "Risk", strong: true, render: r => <span className="font-mono">{r.risk}</span> },
            { key: "desc", label: "Description" },
            { key: "likelihood", label: "Likelihood", render: r => <CtChip tone={r.likelihood.toLowerCase()}>{r.likelihood}</CtChip> },
            { key: "magnitude", label: "Magnitude", align: "right", render: r => <span className="font-mono">{r.magnitude}</span> },
            { key: "objective", label: "Mitigated by", render: r => <span className="font-mono">{r.objective}</span> },
            { key: "agent", label: "Agent in path" },
          ]}
          rows={RISKS}
        />
      </div>
      <div className="mt-4">
        <CtAlert
          tone="fault" icon title="RMM-04 carries the largest magnitude and has no test material."
          body="Intercompany Matcher is uncertified and running against a $3.1M exposure."
        />
      </div>
      <CtFoot />
    </div>
  );
}

Object.assign(window, { ControlObjectives, AssertionCoverage, RiskMap });
