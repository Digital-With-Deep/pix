/* global React */
const { PageHead: TsHead, Chip: TsChip, ScreenFoot: TsFoot } = window;
const tsDsc = window.dsc || (() => () => null);
const TsDataTable = tsDsc("DataTable"), TsButton = tsDsc("Button"), TsMetricCard = tsDsc("MetricCard");

const TS_CARD = { borderRadius: 4, padding: "14px 16px" };

const SCHEDULE_CARDS = [
  { label: "Scheduled this quarter", value: "12", delta: "across 8 objectives" },
  { label: "Triggered by drift", value: "3", valueTone: "warning", delta: "unplanned re-tests" },
  { label: "Completed", value: "6", delta: "of 15 total" },
  { label: "At risk", value: "2", valueTone: "danger", delta: "will miss Q1 close" },
];

const SCHEDULE_ROWS = [
  { control: "C-P2P-014", agent: "AP-Resolver 1.2", cadence: "Quarterly", trigger: "Drift · 2 Sep", triggerTone: "stale", due: "12 Sep 2026", status: "At risk" },
  { control: "C-R2R-002", agent: "Journal Poster 0.9", cadence: "Quarterly", trigger: "Drift · 28 Aug", triggerTone: "stale", due: "14 Sep 2026", status: "At risk" },
  { control: "C-R2R-011", agent: "FX Revaluation 1.0", cadence: "Quarterly", trigger: "Drift · 19 Aug", triggerTone: "stale", due: "20 Sep 2026", status: "Scheduled" },
  { control: "C-P2P-021", agent: "Duplicate Detector 3.0", cadence: "Quarterly", trigger: "Calendar", triggerTone: "no", due: "30 Sep 2026", status: "Completed" },
  { control: "C-P2P-017", agent: "GR/IR Clearer 1.4", cadence: "Quarterly", trigger: "Calendar", triggerTone: "no", due: "30 Sep 2026", status: "Completed" },
  { control: "C-P2P-003", agent: "Vendor Onboarder 2.2", cadence: "Quarterly", trigger: "Calendar", triggerTone: "no", due: "15 Oct 2026", status: "Scheduled" },
  { control: "C-O2C-006", agent: "Credit Memo Router 1.3", cadence: "Quarterly", trigger: "Calendar", triggerTone: "no", due: "15 Oct 2026", status: "Scheduled" },
  { control: "C-R2R-004", agent: "Bank Rec Agent 1.6", cadence: "Quarterly", trigger: "Calendar", triggerTone: "no", due: "31 Oct 2026", status: "Scheduled" },
];

const SCHEDULE_STATUS_TONE = { "At risk": "atrisk", Scheduled: "scheduled", Completed: "covered" };

function TestingSchedule() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <TsHead
        crumbs={["Testing", "Schedule"]} title="Testing schedule"
        lede="Quarterly cadence per control, plus every re-test triggered by a fingerprint change. The regulation supplies the cadence; PACT supplies the artifact."
        actions={<React.Fragment>
          <TsButton variant="primary" size="sm">Schedule run</TsButton>
          <TsButton variant="secondary" size="sm">Edit cadence</TsButton>
        </React.Fragment>}
      />

      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {SCHEDULE_CARDS.map(c => <TsMetricCard key={c.label} {...c} style={TS_CARD} />)}
      </div>

      <div className="mt-4">
        <TsDataTable
          caption="FY2027 Q1" searchable={false} rowCount={false}
          filters={[{ key: "status", options: ["Scheduled", "At risk", "Completed"] }, { key: "trigger", options: ["Calendar"], allLabel: "Any trigger" }]}
          columns={[
            { key: "control", label: "Control", strong: true, sortable: true, render: r => <span className="font-mono">{r.control}</span> },
            { key: "agent", label: "Agent" },
            { key: "cadence", label: "Cadence" },
            { key: "trigger", label: "Trigger", render: r => <TsChip tone={r.triggerTone}>{r.trigger}</TsChip> },
            { key: "due", label: "Due", sortable: true },
            { key: "status", label: "Status", render: r => <TsChip tone={SCHEDULE_STATUS_TONE[r.status]}>{r.status}</TsChip> },
          ]}
          rows={SCHEDULE_ROWS}
        />
      </div>

      <TsFoot />
    </div>
  );
}

Object.assign(window, { TestingSchedule });
