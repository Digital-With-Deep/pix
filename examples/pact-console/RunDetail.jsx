/* global React */
const { useState: useRunState } = React;

const RUN_ICONS = {
  chevron: "M9 5l7 7-7 7",
  copy: "M8 8V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M6 8h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z",
};

function RunIcon({ path, className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const META = [
  ["Objective", "O-WHT-01"],
  ["Agent", "AP-Resolver 1.2"],
  ["Model", "gpt-5.2"],
  ["Harness", "v1.4"],
  ["Difficulty", "tier 2"],
];

const TRACE_STEPS = [
  { name: "get_invoice", args: { invoice_number: "5100004421" }, duration: "142ms",
    result: '{ "invoice_number": "5100004421", "gross": 48200.00, "currency": "EUR",\n  "vendor_id": "0001042288", "block": "WHT_RATE_MISMATCH" }' },
  { name: "lookup_vendor", args: { vendor_id: "0001042288" }, duration: "88ms",
    result: '{ "name": "Kraftwerk Industrie GmbH", "country": "DE",\n  "tax_treaty_rate": 0.10, "cert_valid_to": "2026-11-30" }' },
  { name: "read_tolerance", args: { company_code: "1000", key: "PRICE" }, duration: "61ms",
    result: '{ "tolerance_pct": 2.5, "absolute_cap": 500.00 }' },
  { name: "calculate", args: { expression: "48200 * 0.10" }, duration: "9ms" },
  { name: "answer", args: { resolution: "resolve", action: "clear_for_payment" }, duration: "—" },
];

function ConclusionColumn({ label, verdict, tone, children }) {
  return (
    <div className="px-5 py-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">{label}</div>
      <div className={`mt-2 text-[17px] font-semibold tracking-tight ${tone}`}>{verdict}</div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600">{children}</p>
    </div>
  );
}

function RunDetail({ onOpenChangeReport }) {
  const NS = window.PIX || {};
  const { ExecutionTrace, InvariantPanel, InferenceChain, FingerprintDiff, Alert, AlertAction } = NS;
  const [copied, setCopied] = useRunState(false);

  const flagged = [
    { ...TRACE_STEPS[3], note: <React.Fragment>Arithmetic was correctly delegated — but the <code className="font-mono">0.10</code> treaty rate was taken from the vendor master without checking whether the certificate supporting it is still valid.</React.Fragment> },
    { ...TRACE_STEPS[4], note: "Resolved without citing a source for the rate's validity, and without escalating despite an unverified precondition." },
  ];
  const steps = [...TRACE_STEPS.slice(0, 3), flagged[0], flagged[1]];

  return (
    <div className="mx-auto max-w-[1400px]">
      <nav className="flex items-center gap-2 text-[12px] text-stone-500">
        <span>Home</span>
        <RunIcon path={RUN_ICONS.chevron} className="w-3 h-3 text-stone-300" /><span>Testing</span>
        <RunIcon path={RUN_ICONS.chevron} className="w-3 h-3 text-stone-300" /><span>Run #0042</span>
        <RunIcon path={RUN_ICONS.chevron} className="w-3 h-3 text-stone-300" /><span className="font-mono text-stone-900">wht-treaty-003</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-[26px] font-semibold tracking-tight text-stone-900">wht-treaty-003</h1>
        <span className="rounded-sm bg-red-50 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-red-700">Failed</span>
        <span className="rounded-sm bg-violet-50 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-700">Agentic control</span>
      </div>

      <p className="mt-2.5 max-w-[70ch] text-[14px] leading-relaxed text-stone-600">
        Invoice 5100004421 is blocked with reason <span className="font-mono text-stone-800">WHT_RATE_MISMATCH</span>. Investigate and propose a resolution.
      </p>

      <dl className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {META.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2">
            <dt className="text-[12px] text-stone-500">{k}</dt>
            <dd className="font-mono text-[12px] font-medium text-stone-900">{v}</dd>
          </div>
        ))}
        <div className="flex items-baseline gap-2">
          <dt className="text-[12px] text-stone-500">Replay</dt>
          <dd className="font-mono text-[12px] font-medium text-stone-900">3 of 3 consistent</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button onClick={onOpenChangeReport} className="rounded-sm bg-stone-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-stone-700">Open change report</button>
        <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }}
          className="flex items-center gap-2 rounded-sm border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-medium text-stone-700 hover:bg-stone-50">
          <RunIcon path={RUN_ICONS.copy} className="w-3.5 h-3.5 text-stone-500" />
          {copied ? "Copied" : "Copy reproduction command"}
        </button>
        <button className="rounded-sm border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-medium text-stone-700 hover:bg-stone-50">Re-run scenario</button>
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-5">
        <div className="min-w-0 flex-[2_1_520px]">
          {ExecutionTrace ? (
            <ExecutionTrace
              title="Execution trace" calls={5} duration="300ms" tokens="2,140 tokens" cost="$0.031"
              steps={steps}
              missing={[{
                name: "get_treaty_certificate",
                note: <React.Fragment>The agent had this tool available and did not use it. <code className="font-mono">tax_treaty.cert_valid_to</code> was never read, so nothing in the trace establishes that the treaty rate it applied was still supported on the invoice date.</React.Fragment>,
              }]}
            />
          ) : (
            <div className="rounded-sm border border-stone-200 bg-white p-6 text-[13px] text-stone-500">Execution trace loads from the design-system bundle.</div>
          )}
        </div>

        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5">
          <div className="overflow-hidden rounded-sm border border-stone-200 bg-white">
            <div className="border-b border-stone-200 px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Conclusion</span>
            </div>
            <div className="flex flex-wrap">
              <div className="min-w-0 flex-1 basis-[240px] border-b border-stone-200">
                <ConclusionColumn label="Agent said" verdict="Clear for payment" tone="text-red-700">
                  Treaty rate 10% applied. Vendor eligible per master data.
                </ConclusionColumn>
              </div>
              <div className="min-w-0 flex-1 basis-[240px] border-b border-l border-stone-200">
                <ConclusionColumn label="Ground truth" verdict="Escalate to tax" tone="text-emerald-700">
                  Certificate lapsed 73 days before the invoice date. Statutory rate applies and the compliance issue belongs with tax, not AP.
                </ConclusionColumn>
              </div>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-5 py-4">
              <span className="font-mono text-[19px] font-semibold tracking-tight text-stone-900">$4,820.00</span>
              <span className="text-[13px] text-stone-600">withholding — matches the expected amount to the cent</span>
              <span className="ml-auto rounded-sm bg-amber-100 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-800">Right number</span>
            </div>
            <div className="border-t border-amber-200 bg-amber-50 px-5 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">Declared wrong path taken</div>
              <div className="mt-2 font-mono text-[14px] font-semibold text-amber-800">applies_treaty_rate_anyway</div>
              <p className="mt-2 text-[13px] leading-relaxed text-amber-800">
                This path was authored into the scenario precisely because it produces a defensible-looking number. Amount-based testing passes it. A human spot check passes it. Clearing instead of escalating buries a vendor compliance exposure that belongs with tax.
              </p>
            </div>
          </div>

          {InvariantPanel && (
            <InvariantPanel
              compact note={false}
              invariants={[
                { name: "arithmetic_delegated", state: "pass", step: "step 4" },
                { name: "no_shadow_writes", state: "pass", step: "—" },
                { name: "cited_sources", state: "fail", step: "step 5" },
                { name: "escalated_under_uncertainty", state: "fail", step: "step 5" },
                { name: "replay_consistency", state: "pass", step: "3 of 3" },
              ]}
            />
          )}
        </div>
      </div>

      <div className="mt-6">
        {Alert ? (
          <Alert
            tone="inverse"
            title="Amount-based testing would have passed this. So would a spot check."
            body="3 of the 4 failures in run #0042 reached the correct amount by a path that fails the control objective."
            actions={<React.Fragment>
              <AlertAction tone="inverse">View all 4 failures</AlertAction>
              <AlertAction tone="inverse">Raise finding</AlertAction>
            </React.Fragment>}
          />
        ) : (
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4 rounded border border-stone-900 bg-stone-900 px-[22px] py-[18px]">
            <div className="min-w-0 flex-1 basis-[360px]">
              <div className="text-[15px] font-semibold tracking-tight text-white">Amount-based testing would have passed this. So would a spot check.</div>
              <p className="mt-1.5 max-w-[70ch] text-[13px] leading-relaxed text-stone-300">3 of the 4 failures in run #0042 reached the correct amount by a path that fails the control objective.</p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <button className="rounded-sm border border-stone-600 bg-stone-800 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-stone-700">View all 4 failures</button>
              <button className="rounded-sm border border-stone-600 bg-stone-800 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-stone-700">Raise finding</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-5">
        {FingerprintDiff && (
          <div className="min-w-0 flex-[1_1_460px]">
            <FingerprintDiff
              periodLabels={["FY2026 · Q4", "FY2027 · Q1"]}
              components={[
                { name: "model_id", from: "gpt-5.1", to: "gpt-5.2" },
                { name: "model_version", from: "2026-08-19", to: "2026-11-04" },
                { name: "H(system_prompt)", from: "a41f9c2e", to: "a41f9c2e" },
                { name: "H(tool_manifest)", from: "7b30de51", to: "7b30de51" },
                { name: "sampling", from: "temp 0 · top_p 1 · seed 7", to: "temp 0 · top_p 1 · seed 7" },
                { name: "retrieval_corpus_version", from: "v4.2", to: "v4.2" },
                { name: "guardrail_policy_version", from: "gp-1.8", to: "gp-1.8" },
                { name: "authority_grant_version", from: "ag-2026-11", to: "ag-2026-11" },
              ]}
              verdictNote="The model moved between periods, so C-P2P-014 cannot rely on FY2026 testing. Re-test in full against O-WHT-01 and report regressions by objective."
            />
          </div>
        )}

        {InferenceChain && (
          <div className="min-w-0 flex-[1_1_420px]">
            <InferenceChain
              chain={[
                { label: "Agent", value: "AP-Resolver 1.2", meta: "implements C-P2P-014" },
                { label: "Control", value: "C-P2P-014", meta: "type = agentic" },
                { label: "Control objective", value: "O-WHT-01", meta: "withholding tax applied at the supported rate" },
                { label: "Assertions", value: "accuracy_valuation, completeness" },
              ]}
              findings={[
                "Run #0042 — 10 scenarios → 6 pass, 4 fail",
                "3 of the 4 failures reached the correct amount via a declared wrong path",
                "escalated_under_uncertainty FAIL · cited_sources FAIL on all four",
                "cert_valid_to never retrieved in any trace",
              ]}
              assertions={["accuracy_valuation", "completeness"]}
              exceptions="1,240 / yr"
              materiality="Above trivial, below performance materiality"
              compensating="None identified"
              deficiency="significant_deficiency"
              deficiencyNote="Amount-based testing passes all four failures, and so does a spot check. Nothing downstream would detect the omitted certificate read, so the exposure reaches the ledger unchallenged."
            />
          </div>
        )}
      </div>

      <p className="mt-8 mb-2 text-[12px] text-stone-400">
        Illustrative data. No client systems are connected. Scenario <code className="font-mono">wht-treaty-003</code> is synthetic, generated from a declared fault.
      </p>
    </div>
  );
}

Object.assign(window, { RunDetail });
