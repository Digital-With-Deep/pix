/* global React */
const { PageHead: TaHead, Panel: TaPanel, ScreenFoot: TaFoot } = window;
const taDsc = window.dsc || (() => () => null);
const TaRateBars = taDsc("RateBars"), TaAlert = taDsc("Alert"), TaMetricCard = taDsc("MetricCard");

const TA_CARD = { borderRadius: 4, padding: "14px 16px" };

const INVARIANTS = [
  { name: "arithmetic_delegated", value: 98, note: "Numbers in the answer that never came from the calculator or a retrieved document" },
  { name: "no_shadow_writes", value: 100, note: "Reaching for a write tool in a read-only context" },
  { name: "cited_sources", value: 71, note: "Missing citations, or citing a document never retrieved" },
  { name: "escalated_under_uncertainty", value: 64, note: "Failing to escalate — and escalating something determinable" },
  { name: "replay_consistency", value: 96, note: "Same input, same resolution, across three runs" },
];

function InvariantBreakdown() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <TaHead
        crumbs={["Testing", "Invariant breakdown"]} title="Invariant breakdown"
        lede="Five process properties that must hold regardless of whether the answer was right. Reported individually — never averaged into a score, because the components are what an auditor tests."
      />
      <div className="mt-6">
        <TaRateBars caption="Pass rate across 42 runs" hint="FY2027 Q1 to date" rows={INVARIANTS} />
      </div>
      <div className="mt-4">
        <TaAlert
          tone="fault" icon title="Escalation is the weakest invariant across the estate, at 64%."
          body="Agents are far more willing to resolve than to hand back. That is the single most consistent finding in the corpus and it holds across vendors and model families."
        />
      </div>
      <TaFoot />
    </div>
  );
}

const COST_CARDS = [
  { label: "AP-Resolver 1.2", value: "$2.41", valueTone: "danger", delta: "was $1.88 before drift" },
  { label: "Duplicate Detector 3.0", value: "$0.94", delta: "stable" },
  { label: "GR/IR Clearer 1.4", value: "$1.12", delta: "stable" },
  { label: "FX Revaluation 1.0", value: "$3.80", valueTone: "danger", delta: "highest in estate" },
];

const FORMULA = `cost_per_resolved_exception =
    (inference_cost + escalation_rate × human_touch_cost)
    ÷ correct_resolution_rate`;

const ASSUMPTIONS = [
  { name: "Human touch cost", note: "Fully loaded cost of one analyst investigating one escalated exception", value: "$45.00", boxed: true, caveat: "Published assumption, not a measured figure. Report with a sensitivity range of $30–$60." },
  { name: "Inference cost basis", note: "Captured per run from provider billing", value: "Actual · tokens × list price" },
  { name: "Correct resolution rate", note: "Excludes right-number-wrong-reason outcomes", value: "From scenario results" },
];

function CostPerException() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <TaHead
        crumbs={["Testing", "Cost per exception"]} title="Cost per resolved exception"
        lede="The headline metric. An agent that is 95% accurate but escalates 40% of the time costs more than one at 88% and 5%, because every escalation buys a human touch."
      />

      <div className="mt-6 overflow-hidden rounded-sm border border-stone-200 bg-white p-5">
        <pre className="overflow-x-auto whitespace-pre rounded-sm bg-stone-50 px-4 py-3 font-mono text-[13px] leading-relaxed text-stone-800">{FORMULA}</pre>
      </div>

      <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {COST_CARDS.map(c => <TaMetricCard key={c.label} {...c} style={TA_CARD} />)}
      </div>

      <div className="mt-4">
        <TaPanel caption="Inputs and assumptions">
          <dl className="flex flex-col">
            {ASSUMPTIONS.map(a => (
              <div key={a.name} className="flex flex-wrap gap-x-8 gap-y-2 border-b border-stone-100 px-4 py-4 last:border-b-0">
                <dt className="min-w-0 flex-[0_1_260px]">
                  <span className="block text-[13px] font-medium text-stone-900">{a.name}</span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-stone-500">{a.note}</span>
                </dt>
                <dd className="min-w-0 flex-[1_1_320px]">
                  {a.boxed ? (
                    <input readOnly value={a.value} aria-label={a.name}
                      className="w-full max-w-[360px] rounded-sm border border-stone-200 bg-white px-3 py-2 font-mono text-[13px] text-stone-900" />
                  ) : (
                    <span className="text-[13px] text-stone-700">{a.value}</span>
                  )}
                  {a.caveat && <p className="mt-2 max-w-[70ch] text-[12px] leading-relaxed text-amber-700">{a.caveat}</p>}
                </dd>
              </div>
            ))}
          </dl>
        </TaPanel>
      </div>

      <div className="mt-4">
        <TaAlert
          tone="neutral" icon="info"
          body="No competing benchmark reports a cost-weighted metric — the public finance leaderboards report accuracy and win rate. This is the number a controller acts on."
        />
      </div>

      <TaFoot />
    </div>
  );
}

Object.assign(window, { InvariantBreakdown, CostPerException });
