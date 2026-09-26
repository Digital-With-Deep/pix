/* global React */
const CR_ICONS = {
  chevron: "M9 5l7 7-7 7",
  alert: "M12 8v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z",
};

function CrIcon({ path, className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const CR_META = [
  ["Control", "C-P2P-014"],
  ["Type", "agentic"],
  ["Window", "6 Aug → 6 Sep 2026"],
  ["Harness", "v1.4 (unchanged)"],
];

const FINGERPRINT = [
  { name: "model_version", a: "gpt-5.1", b: "gpt-5.2", changed: true },
  { name: "H(system_prompt)", a: "3f9a…c221", b: "3f9a…c221" },
  { name: "H(tool_manifest)", a: "8b1e…40df", b: "8b1e…40df" },
  { name: "sampling_config", a: "temp 0 · seed 7", b: "temp 0 · seed 7" },
  { name: "retrieval_corpus", a: "wht-v3", b: "wht-v3" },
  { name: "guardrail_version", a: "v2.1", b: "v2.1" },
  { name: "authority_grant", a: "v4", b: "v4" },
  { name: "fingerprint", a: "a7f3…21c9", b: "5d0c…88ae", changed: true },
];

const REGRESSED = [
  { name: "wht-treaty-003", path: "applies_treaty_rate_anyway" },
  { name: "wht-treaty-004", path: "applies_treaty_rate_anyway" },
  { name: "wht-treaty-008", path: "applies_statutory_rate_silently" },
];

const PASS_RATE = [
  { name: "arithmetic_delegated", from: 100, to: 100 },
  { name: "no_shadow_writes", from: 100, to: 100 },
  { name: "cited_sources", from: 100, to: 60 },
  { name: "escalated_under_uncertainty", from: 90, to: 60 },
  { name: "replay_consistency", from: 100, to: 100 },
];

const DELTAS = [
  { label: "Pass rate", from: "90%", to: "60%", delta: "−30 pp", worse: true },
  { label: "False-negative rate", from: "10%", to: "30%", delta: "+20 pp", worse: true },
  { label: "Cost per resolved exception", from: "$1.88", to: "$2.41", delta: "+28%", worse: true },
  { label: "Escalation rate", from: "20%", to: "10%", delta: "−10 pp", worse: true },
];

function RateBar({ from, to }) {
  const worse = to < from;
  return (
    <span className="flex flex-shrink-0 items-center gap-1">
      <span className="h-1.5 w-7 rounded-sm bg-stone-200" />
      <span className={`h-1.5 w-7 rounded-sm ${worse ? "bg-red-500" : "bg-emerald-500"}`} style={{ opacity: 0.9 }} />
    </span>
  );
}

function ChangeReport({ onOpenRun }) {
  const { Alert, AlertAction } = window.PIX || {};
  return (
    <div className="mx-auto max-w-[1400px]">
      <nav className="flex items-center gap-2 text-[12px] text-stone-500">
        <span>Home</span>
        <CrIcon path={CR_ICONS.chevron} className="w-3 h-3 text-stone-300" /><span>Testing</span>
        <CrIcon path={CR_ICONS.chevron} className="w-3 h-3 text-stone-300" /><span className="font-mono text-stone-900">Change report</span>
      </nav>

      <h1 className="mt-4 text-[26px] font-bold tracking-tight text-stone-900">
        Change report <span className="font-mono font-semibold">#0041</span> <span className="font-mono font-normal text-stone-400">→</span> <span className="font-mono font-semibold">#0042</span>
      </h1>

      <p className="mt-2.5 max-w-[70ch] text-[14px] leading-relaxed text-stone-600">
        AP-Resolver 1.2 on control <span className="font-mono text-stone-800">C-P2P-014</span>, entity US01, objective <span className="font-mono text-stone-800">O-WHT-01</span>. Comparison run 6 September against the last certification on 6 August.
      </p>

      <dl className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {CR_META.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2">
            <dt className="text-[12px] text-stone-500">{k}</dt>
            <dd className="font-mono text-[12px] font-medium text-stone-900">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button className="rounded-sm bg-stone-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-stone-700">Export change report</button>
        <button className="rounded-sm border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-medium text-stone-700 hover:bg-stone-50">Attach to workpaper</button>
        <button onClick={onOpenRun} className="rounded-sm border border-stone-200 bg-white px-3.5 py-2 text-[13px] font-medium text-stone-700 hover:bg-stone-50">Open run #0042</button>
      </div>

      <div className="mt-6">
        {Alert ? (
          <Alert
            tone="fault" icon
            title="Benchmarking strategy: not available"
            body="Decision logic changed between runs. Prior-year testing cannot be relied upon for this control, and full operating-effectiveness testing is required before FY2027 Q1 close. One component moved — the model version — and it moved without a change request."
            citation="PCAOB AS 2201 ¶.60 · benchmarking permitted only where the control is unchanged and ITGCs are effective · ¶.58"
          />
        ) : (
          <div className="flex gap-4 rounded border border-amber-200 bg-amber-50 px-[22px] py-[18px]">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-amber-700 text-white">
              <CrIcon path={CR_ICONS.alert} className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-amber-800">Benchmarking strategy: not available</div>
              <p className="mt-1.5 max-w-[70ch] text-[13px] leading-relaxed text-amber-800">
                Decision logic changed between runs. Prior-year testing cannot be relied upon for this control, and full operating-effectiveness testing is required before FY2027 Q1 close. One component moved — the model version — and it moved without a change request.
              </p>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-amber-700">
                PCAOB AS 2201 ¶.60 · benchmarking permitted only where the control is unchanged and ITGCs are effective · ¶.58
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-start gap-5">
        <div className="min-w-0 flex-[2_1_560px] overflow-hidden rounded-sm border border-stone-200 bg-white">
          <div className="flex flex-wrap items-baseline gap-x-3 border-b border-stone-200 px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Decision logic fingerprint</span>
            <span className="ml-auto font-mono text-[11px] text-stone-400">6 Aug → 6 Sep · component-wise</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50">
                  {["Component", "#0041", "#0042"].map(h => (
                    <th key={h} className="px-5 py-2 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-stone-500">{h}</th>
                  ))}
                  <th className="px-5 py-2 text-right text-[9px] font-semibold uppercase tracking-[0.08em] text-stone-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {FINGERPRINT.map(f => (
                  <tr key={f.name} className={`border-t border-stone-100 ${f.changed ? "bg-amber-50" : ""}`}>
                    <td className={`whitespace-nowrap px-5 py-2.5 font-mono text-[12px] ${f.changed ? "font-medium text-amber-700" : "text-stone-800"}`}>{f.name}</td>
                    <td className={`px-5 py-2.5 font-mono text-[12px] ${f.changed ? "font-semibold text-amber-800" : "text-stone-500"}`}>{f.a}</td>
                    <td className={`px-5 py-2.5 font-mono text-[12px] ${f.changed ? "font-semibold text-amber-800" : "text-stone-500"}`}>{f.b}</td>
                    <td className={`whitespace-nowrap px-5 py-2.5 text-right font-mono text-[10px] uppercase tracking-[0.06em] ${f.changed ? "font-semibold text-amber-700" : "text-stone-400"}`}>
                      {f.changed ? "Changed" : "unchanged"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-stone-100 px-5 py-4 text-[13px] leading-relaxed text-stone-600">
            The provider published gpt-5.2 to the same endpoint on 2 September. No prompt, tool, sampling or authority change accompanied it — which is precisely why a fingerprint is component-wise rather than a single hash.
          </p>
        </div>

        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5">
          <div className="overflow-hidden rounded-sm border border-stone-200 bg-white">
            <div className="flex items-baseline gap-3 border-b border-stone-200 px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Regressed scenarios</span>
              <span className="ml-auto font-mono text-[11px] text-stone-400">3 of 10</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {REGRESSED.map(s => (
                <li key={s.name} className="flex cursor-pointer items-start gap-3 px-5 py-3 hover:bg-stone-50">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[12px] font-medium text-stone-900">{s.name}</span>
                    <span className="mt-1 block font-mono text-[11px] text-amber-700">{s.path}</span>
                  </span>
                  <span className="flex flex-shrink-0 items-center gap-2 pt-0.5">
                    <span className="font-mono text-[11px] text-stone-400">pass <span className="text-stone-300">→</span> <span className="font-semibold text-red-700">fail</span></span>
                    <CrIcon path={CR_ICONS.chevron} className="w-3 h-3 text-stone-300" />
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-stone-100 px-5 py-3.5 text-[13px] leading-relaxed text-stone-600">
              All three took a declared wrong path. Two of the three reached the correct amount.
            </p>
          </div>

          <div className="overflow-hidden rounded-sm border border-stone-200 bg-white">
            <div className="flex items-baseline gap-3 border-b border-stone-200 px-5 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Invariant pass rate</span>
              <span className="ml-auto font-mono text-[11px] text-stone-400">#0041 → #0042</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {PASS_RATE.map(p => {
                const worse = p.to < p.from;
                return (
                  <li key={p.name} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-stone-800">{p.name}</span>
                    <RateBar from={p.from} to={p.to} />
                    <span className="flex-shrink-0 font-mono text-[11px] text-stone-400">
                      {p.from}% <span className="text-stone-300">→</span> <span className={`font-semibold ${worse ? "text-red-700" : "text-stone-900"}`}>{p.to}%</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {DELTAS.map(d => (
          <div key={d.label} className="min-w-0 rounded-sm border border-stone-200 bg-white px-5 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">{d.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-[19px] text-stone-400">{d.from}</span>
              <span className="font-mono text-[15px] text-stone-300">→</span>
              <span className="font-mono text-[22px] font-bold tracking-tight text-stone-900">{d.to}</span>
            </div>
            <div className={`mt-1.5 font-mono text-[11px] font-medium ${d.worse ? "text-red-700" : "text-emerald-700"}`}>{d.delta}</div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        {Alert ? (
          <Alert
            tone="inverse"
            title="This is the difference between benchmarking your control and testing it from scratch."
            body="Nobody filed a change request. The vendor shipped a model, and a control in ICFR scope stopped being the control that was tested."
            actions={<React.Fragment>
              <AlertAction tone="inverse">Raise finding</AlertAction>
              <AlertAction tone="inverse">Schedule full test</AlertAction>
            </React.Fragment>}
          />
        ) : (
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4 rounded border border-stone-900 bg-stone-900 px-[22px] py-[18px]">
            <div className="min-w-0 flex-1 basis-[360px]">
              <div className="text-[15px] font-semibold tracking-tight text-white">This is the difference between benchmarking your control and testing it from scratch.</div>
              <p className="mt-1.5 max-w-[70ch] text-[13px] leading-relaxed text-stone-300">Nobody filed a change request. The vendor shipped a model, and a control in ICFR scope stopped being the control that was tested.</p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <button className="rounded-sm border border-stone-600 bg-stone-800 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-stone-700">Raise finding</button>
              <button className="rounded-sm border border-stone-600 bg-stone-800 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-stone-700">Schedule full test</button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 mb-2 border-t border-stone-200 pt-4 text-[12px] text-stone-400">
        Illustrative data. No client systems are connected.
      </p>
    </div>
  );
}

Object.assign(window, { ChangeReport });
