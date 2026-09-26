/* global React */
const PACT_NS = () => window.PIX || {};

function Crumb({ path }) {
  return (
    <svg className="h-3 w-3 flex-shrink-0 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path || "M9 5l7 7-7 7"} /></svg>
  );
}

function PageHead({ crumbs = [], title, lede, meta, actions }) {
  return (
    <React.Fragment>
      <nav className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-stone-500">
        {crumbs.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <Crumb />}
            <span className={i === crumbs.length - 1 ? "text-stone-900" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </nav>
      <h1 className="mt-3 text-[30px] font-bold tracking-tight text-stone-900">{title}</h1>
      {lede && <p className="mt-2 max-w-[78ch] text-[14px] leading-relaxed text-stone-600">{lede}</p>}
      {meta && (
        <dl className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {meta.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-2">
              <dt className="text-[12px] text-stone-500">{k}</dt>
              <dd className="font-mono text-[12px] font-medium text-stone-900">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>}
    </React.Fragment>
  );
}

const PACT_CHIP = {
  certified: "bg-emerald-100 text-emerald-800",
  drifted: "bg-amber-100 text-amber-800",
  uncertified: "bg-stone-100 text-stone-600",
  required: "bg-blue-100 text-blue-800",
  auto: "bg-amber-100 text-amber-800",
  no: "bg-stone-100 text-stone-600",
  active: "bg-emerald-100 text-emerald-800",
  significant: "bg-red-100 text-red-700",
  covered: "bg-emerald-100 text-emerald-800",
  stale: "bg-amber-100 text-amber-800",
  none: "bg-red-100 text-red-700",
  high: "bg-red-100 text-red-700",
  moderate: "bg-amber-100 text-amber-800",
  low: "bg-stone-100 text-stone-600",
  atrisk: "bg-red-100 text-red-700",
  scheduled: "bg-blue-100 text-blue-800",
  draft: "bg-stone-100 text-stone-600",
  inreview: "bg-blue-100 text-blue-800",
  attested: "bg-emerald-100 text-emerald-800",
  effective: "bg-emerald-100 text-emerald-800",
  ineffective: "bg-red-100 text-red-700",
  open: "bg-red-100 text-red-700",
  inremediation: "bg-amber-100 text-amber-800",
  closed: "bg-stone-100 text-stone-600",
  deficiency: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
  unverified: "bg-red-100 text-red-700",
  current: "bg-emerald-100 text-emerald-800",
  superseded: "bg-stone-100 text-stone-600",
  read: "bg-stone-100 text-stone-600",
  notstarted: "bg-stone-100 text-stone-600",
  inprogress: "bg-blue-100 text-blue-800",
  inscope: "bg-emerald-100 text-emerald-800",
  outofscope: "bg-stone-100 text-stone-600",
  periodopen: "bg-blue-100 text-blue-800",
  future: "bg-stone-100 text-stone-600",
  periodclosed: "bg-emerald-100 text-emerald-800",
  readonly: "bg-emerald-100 text-emerald-800",
  evidenceexport: "bg-blue-100 text-blue-800",
  testexecution: "bg-blue-100 text-blue-800",
  connected: "bg-emerald-100 text-emerald-800",
  notconnected: "bg-stone-100 text-stone-600",
  yes: "bg-emerald-100 text-emerald-800",
  no: "bg-stone-100 text-stone-600",
};

function Chip({ tone = "uncertified", children }) {
  return <span className={`inline-block rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${PACT_CHIP[tone] || PACT_CHIP.uncertified}`}>{children}</span>;
}

function ScreenFoot({ children }) {
  return (
    <p className="mt-8 mb-2 border-t border-stone-200 pt-4 text-[12px] text-stone-400">
      {children || "Illustrative data. No client systems are connected. PACT is a prototype — screens are static and nothing here reads a production system."}
    </p>
  );
}

function Panel({ caption, hint, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-sm border border-stone-200 bg-white ${className}`}>
      {(caption || hint) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 px-4 py-2.5">
          {caption && <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">{caption}</span>}
          {hint && <span className="ml-auto font-mono text-[11px] text-stone-400">{hint}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

const PACT_STAGES = [
  { label: "Registered", value: 14, note: "inventoried with authority granted", progress: 1 },
  { label: "Scoped", value: 14, note: "mapped to a control objective", progress: 1 },
  { label: "Certified", value: 9, note: "design effectiveness established", progress: 0.64 },
  { label: "In production", value: 9, note: "operating and monitored", progress: 0.64 },
  { label: "Drift detected", value: 3, note: "fingerprint changed since certification", progress: 0.21, tone: "alert" },
  { label: "Re-tested", value: 1, note: "operating effectiveness re-established", progress: 0.07 },
  { label: "Evidenced", value: 1, note: "workpaper prepared", progress: 0.07 },
  { label: "Attested", value: 0, note: "signed for the period", progress: 0 },
];

const PACT_AGENTS = [
  { agent: "AP-Resolver 1.2", vendor: "Kagent", entity: "US01", process: "P2P", control: "C-P2P-014", status: "Drifted", certified: "6 Aug 2026", fp: "5d0c…88ae" },
  { agent: "Journal Poster 0.9", vendor: "Internal", entity: "US01", process: "R2R", control: "C-R2R-002", status: "Drifted", certified: "9 Aug 2026", fp: "11b7…3e02" },
  { agent: "Intercompany Matcher 2.1", vendor: "SAP", entity: "US01", process: "R2R", control: "C-R2R-008", status: "Uncertified", certified: "—", fp: "–" },
  { agent: "Duplicate Detector 3.0", vendor: "Kagent", entity: "US01", process: "P2P", control: "C-P2P-021", status: "Certified", certified: "28 Aug 2026", fp: "9ac1…7f44" },
  { agent: "GR/IR Clearer 1.4", vendor: "Internal", entity: "US01", process: "P2P", control: "C-P2P-017", status: "Certified", certified: "21 Aug 2026", fp: "c33d…0a19" },
  { agent: "Vendor Onboarder 2.2", vendor: "Kagent", entity: "US01", process: "P2P", control: "C-P2P-003", status: "Certified", certified: "14 Aug 2026", fp: "7e50…b6c8" },
  { agent: "Bank Rec Agent 1.6", vendor: "Internal", entity: "US01", process: "R2R", control: "C-R2R-004", status: "Certified", certified: "30 Aug 2026", fp: "d7c4…51ab" },
  { agent: "PO Amender 1.1", vendor: "Kagent", entity: "US01", process: "P2P", control: "C-P2P-009", status: "Uncertified", certified: "—", fp: "–" },
  { agent: "Close Checklist 0.5", vendor: "Internal", entity: "US01", process: "R2R", control: "C-R2R-020", status: "Uncertified", certified: "—", fp: "–" },
];

/* Resolves a design-system export at render time. A missing or renamed export
   degrades to one labelled panel instead of white-screening the kit. */
function dsc(name) {
  return function DSComponent(props) {
    const C = (window.PIX || {})[name];
    if (C) return React.createElement(C, props);
    return (
      <div className="rounded-sm border border-dashed border-stone-300 bg-white px-4 py-6 text-[13px] text-stone-500">
        <span className="font-mono text-stone-700">{name}</span> is not in the compiled design-system bundle yet.
      </div>
    );
  };
}

Object.assign(window, { PageHead, Chip, Panel, ScreenFoot, PACT_NS, PACT_STAGES, PACT_AGENTS, dsc });
