/* global React */
const { PageHead: FdHead, Chip: FdChip, ScreenFoot: FdFoot } = window;
const fdDsc = window.dsc || (() => () => null);
const FdDataTable = fdDsc("DataTable"), FdButton = fdDsc("Button");

const fdTone = s => s.toLowerCase().replace(/[^a-z]/g, "");

const OPEN_FINDINGS = [
  { finding: "F-0007", severity: "Significant", control: "C-P2P-014", objective: "O-WHT-01", run: "#0042", owner: "A. Ruiz", due: "28 Feb 2027", status: "Open" },
  { finding: "F-0006", severity: "Deficiency", control: "C-R2R-011", objective: "O-FX-01", run: "#0039", owner: "T. Beckett", due: "15 Feb 2027", status: "Open" },
  { finding: "F-0005", severity: "Deficiency", control: "C-R2R-002", objective: "O-ACC-01", run: "#0037", owner: "A. Ruiz", due: "31 Jan 2027", status: "In remediation" },
];

const CLOSED_FINDINGS = [
  { finding: "F-0004", severity: "Deficiency", control: "C-P2P-021", objective: "O-DUP-01", run: "#0030", owner: "A. Ruiz", due: "—", status: "Closed" },
  { finding: "F-0003", severity: "Deficiency", control: "C-P2P-017", objective: "O-GRIR-01", run: "#0028", owner: "A. Ruiz", due: "—", status: "Closed" },
  { finding: "F-0002", severity: "Significant", control: "C-P2P-003", objective: "O-WHT-01", run: "#0021", owner: "T. Beckett", due: "—", status: "Closed" },
];

const FINDING_COLUMNS = [
  { key: "finding", label: "Finding", strong: true, sortable: true, render: r => <span className="font-mono">{r.finding}</span> },
  { key: "severity", label: "Severity", render: r => <FdChip tone={fdTone(r.severity)}>{r.severity}</FdChip> },
  { key: "control", label: "Control", render: r => <span className="font-mono">{r.control}</span> },
  { key: "objective", label: "Objective", render: r => <span className="font-mono">{r.objective}</span> },
  { key: "run", label: "Identified in", render: r => <span className="font-mono">{r.run}</span> },
  { key: "owner", label: "Owner" },
  { key: "due", label: "Due" },
  { key: "status", label: "Status", render: r => <FdChip tone={fdTone(r.status)}>{r.status}</FdChip> },
];

function FindingsRegister({ view = "Open findings" }) {
  const closed = view === "Closed";
  return (
    <div className="mx-auto max-w-[1400px]">
      <FdHead
        crumbs={["Findings", closed ? "Closed" : "Open findings"]}
        title={closed ? "Closed findings" : "Open findings"}
        lede={closed
          ? "Findings remediated and retested in prior periods."
          : "Control gaps identified by testing, graded by severity and mapped to the assertions they affect."}
        actions={<React.Fragment>
          <FdButton variant="primary" size="sm">Raise finding</FdButton>
          <FdButton variant="secondary" size="sm">Export register</FdButton>
        </React.Fragment>}
      />
      <div className="mt-5">
        <FdDataTable
          caption={closed ? "11 closed findings" : "3 open findings"} searchable={false} rowCount={false}
          filters={[{ key: "severity", options: ["Significant", "Deficiency"] }]}
          columns={FINDING_COLUMNS} rows={closed ? CLOSED_FINDINGS : OPEN_FINDINGS}
        />
      </div>
      <FdFoot />
    </div>
  );
}

const PLANS = [
  { finding: "F-0007", action: "Add certificate-validity retrieval; escalate by default", owner: "A. Ruiz", target: "28 Feb 2027", retest: "Full re-certification", status: "Not started" },
  { finding: "F-0006", action: "Pin FX rate date basis to goods-receipt date", owner: "T. Beckett", target: "15 Feb 2027", retest: "Objective run", status: "In progress" },
  { finding: "F-0005", action: "Require supporting document reference on every accrual", owner: "A. Ruiz", target: "31 Jan 2027", retest: "Objective run", status: "In progress" },
];

function RemediationPlans() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <FdHead
        crumbs={["Findings", "Remediation plans"]} title="Remediation plans"
        lede="What is being changed, by whom, and when the retest is scheduled."
      />
      <div className="mt-5">
        <FdDataTable
          caption="3 active plans" searchable={false} rowCount={false}
          columns={[
            { key: "finding", label: "Finding", strong: true, render: r => <span className="font-mono">{r.finding}</span> },
            { key: "action", label: "Action" },
            { key: "owner", label: "Owner" },
            { key: "target", label: "Target" },
            { key: "retest", label: "Retest" },
            { key: "status", label: "Status", render: r => <FdChip tone={fdTone(r.status)}>{r.status}</FdChip> },
          ]}
          rows={PLANS}
        />
      </div>
      <FdFoot />
    </div>
  );
}

Object.assign(window, { FindingsRegister, RemediationPlans });
