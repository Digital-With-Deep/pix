/* global React */
const { PageHead: OvHead, Chip: OvChip, Panel: OvPanel, ScreenFoot: OvFoot, PACT_STAGES: OvStages } = window;
const ovDsc = window.dsc || (() => () => null);
const OvMetricCard = ovDsc("MetricCard"), OvStageFlow = ovDsc("StageFlow"), OvBarChart = ovDsc("BarChart"),
  OvNextSteps = ovDsc("NextSteps"), OvAlert = ovDsc("Alert"), OvAlertAction = ovDsc("AlertAction"), OvDataTable = ovDsc("DataTable");

const CARD = { borderRadius: 4, padding: "14px 16px" };

const READINESS_CARDS = [
  { label: "Agents in scope", value: "14", delta: "across 3 entities · 3 processes" },
  { label: "Certified", value: "9 of 14", progress: 0.64, delta: "64% of the estate" },
  { label: "Open findings", value: "3", valueTone: "danger", footerKind: "significant" },
  { label: "Days to Q1 close", value: "47", delta: "FY2027 Q1 · 31 Mar" },
  { label: "Fingerprint drift", value: "3", valueTone: "warning", delta: "since last certification" },
  { label: "Objective coverage", value: "6 of 8", delta: "2 objectives uncovered" },
  { label: "Evidence items", value: "1,840", delta: "immutable · hash-chained" },
  { label: "Last run", value: "2d ago", delta: "#0042 · 6 of 10 passed" },
];

const MONTHS = [["Oct", 88, 74], ["Nov", 96, 80], ["Dec", 118, 102], ["Jan", 72, 60], ["Feb", 92, 78], ["Mar", 106, 82], ["Apr", 110, 84], ["May", 116, 86], ["Jun", 112, 80], ["Jul", 120, 84], ["Aug", 126, 90], ["Sep", 134, 94]];

const AUDITOR_QS = [
  { q: "How was design effectiveness validated for AP-Resolver?", a: "Answered", ref: "run #0042", ok: true },
  { q: "What changed when gpt-5.2 shipped?", a: "Answered", ref: "change report", ok: true },
  { q: "Where is the evidence for intercompany clearing?", a: "No answer — objective uncovered", ok: false },
];

function Readiness({ onOpenChangeReport, onOpenLifecycle }) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <OvHead crumbs={["Overview"]} title="Readiness" lede="Where the agent estate stands for FY2027 Q1, and what is about to go wrong." />

      <div className="mt-6">
        <OvNextSteps
          subtitle="3 actions from this week's sync · reviewed by the control agent"
          onDismiss={() => {}}
          items={[
            { kind: "Drift", kindTone: "warning", title: "3 agents changed since last certification", body: "AP-Resolver moved from gpt-5.1 to gpt-5.2 on 2 Sep. Benchmarking is no longer available for these controls — they need a full test before Q1 close.", action: "Open change report", onAction: onOpenChangeReport },
            { kind: "Gap", kindTone: "info", title: "2 control objectives have no coverage", body: "Intercompany clearing and accrual cutoff have agents assigned but no scenarios authored against them.", action: "View coverage" },
            { kind: "Attest", kindTone: "success", title: "2 workpapers awaiting attestation", body: "WP-R2R-2027-Q1 is complete and unsigned. Due in 11 days.", action: "Open workpapers" },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {READINESS_CARDS.map(({ footerKind, ...c }) => (
          <OvMetricCard key={c.label} {...c} footer={footerKind ? <OvChip tone={footerKind}>1 significant</OvChip> : null} style={CARD} />
        ))}
      </div>

      <div className="mt-4">
        <OvStageFlow caption="Control lifecycle" hint="14 agents · FY2027 Q1" stages={OvStages} compact />
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-[2_1_520px]">
          <OvBarChart
            caption="Testing activity" hint="executed vs passed · trailing 12 months"
            summary="1,240 executed · 908 passed · 73%"
            series={[{ label: "Executed", color: "#10b981" }, { label: "Passed", color: "#e4e4e7" }]}
            data={MONTHS.map(m => ({ label: m[0], values: [m[1], m[2]] }))}
          />
        </div>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
          <OvAlert
            tone="inverse" icon="info" title="Drift monitor active"
            body="Last check 2h ago. Watching 14 agents across 6 model versions. Three fingerprints have moved this period."
            actions={<OvAlertAction tone="inverse" onClick={onOpenLifecycle}>See where they stall</OvAlertAction>}
          />
          <OvPanel caption="Auditor view" hint="View all">
            <ul className="flex flex-col">
              {AUDITOR_QS.map(item => (
                <li key={item.q} className="border-b border-stone-100 px-4 py-3 last:border-b-0">
                  <div className="text-[13px] font-medium text-stone-900">{item.q}</div>
                  <div className={`mt-1 font-mono text-[11px] ${item.ok ? "text-stone-500" : "text-red-600"}`}>
                    {item.a}{item.ref ? ` · ${item.ref}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </OvPanel>
        </div>
      </div>

      <OvFoot />
    </div>
  );
}

const STAGE_ROWS = [
  { stage: "1. Registered", agents: 14, criterion: "Authority grant recorded and identity mapped", owner: "Finance Systems" },
  { stage: "2. Scoped", agents: 14, criterion: "Control objective assigned and ICFR scope confirmed", owner: "SOX Program" },
  { stage: "3. Certified", agents: 9, criterion: "Certification run passed and workpaper generated", owner: "SOX Program" },
  { stage: "4. In production", agents: 9, criterion: "Agent released to the live queue", owner: "Process Owner" },
  { stage: "5. Drift detected", agents: 3, criterion: "Fingerprint compared against the certification baseline", owner: "PACT · automatic" },
  { stage: "6. Re-tested", agents: 1, criterion: "Full operating-effectiveness test completed", owner: "SOX Program" },
  { stage: "7. Evidenced", agents: 1, criterion: "Evidence assembled into a period workpaper", owner: "SOX Program" },
  { stage: "8. Attested", agents: 0, criterion: "Named signer has attested the conclusion", owner: "Controller" },
];

function ControlLifecycle() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <OvHead
        crumbs={["Overview", "Lifecycle"]} title="Control lifecycle"
        lede="Every agent in ICFR scope moves through eight stages. Where the estate sits today, and where it stalls."
        meta={[["Entities", "3"], ["Agents", "14"], ["Period", "FY2027 Q1"], ["Stalled at", "Drift detected"]]}
      />

      <div className="mt-5">
        <OvStageFlow stages={OvStages} compact />
      </div>

      <div className="mt-4">
        <OvAlert
          tone="fault" icon
          title="The estate stalls at drift detection."
          body="Nine agents were certified and went to production. Three have since drifted, and only one has been re-tested. Nothing has reached attestation for FY2027 Q1, and close is 47 days away."
        />
      </div>

      <div className="mt-4">
        <OvDataTable
          caption="Stage detail" searchable={false} rowCount={false}
          columns={[
            { key: "stage", label: "Stage", strong: true, render: r => <span className="font-mono">{r.stage}</span> },
            { key: "agents", label: "Agents", align: "right", numeric: true },
            { key: "criterion", label: "What has to be true to leave this stage" },
            { key: "owner", label: "Owner" },
          ]}
          rows={STAGE_ROWS}
        />
      </div>

      <OvFoot />
    </div>
  );
}

Object.assign(window, { Readiness, ControlLifecycle });
