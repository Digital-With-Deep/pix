/* global React */
const { useState } = React;

function Icon({ path, className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  overview: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  agents: "M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M3 12h2m14 0h2M5.6 18.4l1.4-1.4m10-10l1.4-1.4M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  controls: "M12 12a3 3 0 100-6 3 3 0 000 6zm0 0a9 9 0 100 12 9 9 0 000-12z",
  testing: "M6 4l14 8-14 8V4z",
  evidence: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  findings: "M4 21V5a2 2 0 012-2h9l-1.5 4H20l-2 5h-8",
  library: "M4 6h16M4 12h16M4 18h16M8 6v12m8-12v12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  chevron: "M9 5l7 7-7 7",
  chevronDown: "M19 9l-7 7-7-7",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  updown: "M8 9l4-4 4 4M8 15l4 4 4-4",
  check: "M5 13l4 4L19 7",
  plus: "M12 4v16m8-8H4",
};

const SCOPES = [
  { code: "US", name: "US01 Manufacturing", meta: "In scope · FY2027" },
  { code: "DE", name: "DE10 Distribution", meta: "In scope · FY2027" },
  { code: "SG", name: "SG20 Shared Services", meta: "Onboarding" },
  { code: "GL", name: "All entities", meta: "Portfolio roll-up" },
];

const NAV = [
  { label: "Overview", icon: "overview" },
  { label: "Agents", icon: "agents", count: 3 },
  { label: "Controls", icon: "controls" },
  { label: "Testing", icon: "testing", count: 1 },
  { label: "Evidence", icon: "evidence" },
  { label: "Findings", icon: "findings", count: 3 },
  { label: "Library", icon: "library" },
];

const SUBNAV = {
  Overview: [{ items: ["Readiness", "Lifecycle"] }],
  Agents: [
    { title: "Inventory", items: ["All agents", "Awaiting certification", "Drifted"], counts: { "All agents": 14, "Awaiting certification": 5, Drifted: 3 } },
    { title: "Governance", items: ["Authority grants", "Agent identities"] },
  ],
  Controls: [
    { title: "Scope", items: ["Control objectives", "Assertion coverage", "Risk map"], counts: { "Control objectives": 8 } },
  ],
  Testing: [
    { title: "Execution", items: ["Runs", "Schedule", "Compare runs"], counts: { Runs: 42 } },
    { title: "Analysis", items: ["Invariant breakdown", "Cost per exception"] },
  ],
  Evidence: [
    { title: "File", items: ["Workpapers", "Attestations", "Evidence explorer", "Audit log"], counts: { Workpapers: 6 } },
  ],
  Findings: [
    { title: "Remediation", items: ["Open findings", "Remediation plans", "Closed"], counts: { "Open findings": 3, Closed: 11 } },
  ],
  Library: [
    { title: "Test material", items: ["Scenarios", "Exception taxonomy"], counts: { Scenarios: 40 } },
    { title: "Configuration", items: ["Harness versions", "Ontology reference"] },
  ],
  Settings: [
    { title: "Organisation", items: ["Organization", "Entities", "Periods", "Materiality"] },
    { title: "Platform", items: ["Integrations", "Users & roles"] },
    { title: "Account", items: ["License & usage", "Billing"] },
  ],
};

function ScopeSwitcher({ scope, setScope, collapsed }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex w-full items-center gap-2.5 rounded-sm hover:bg-stone-100 ${collapsed ? "justify-center p-2" : "px-2 py-2"}`}>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm bg-stone-800 font-mono text-[10px] font-bold text-white">{scope.code}</span>
        {!collapsed && (
          <React.Fragment>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[13px] font-semibold text-stone-900">{scope.name}</span>
              <span className="block truncate text-[10px] text-stone-500">{scope.meta}</span>
            </span>
            <Icon path={ICONS.updown} className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
          </React.Fragment>
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-sm border border-stone-200 bg-white py-1 shadow-lg">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">Switch scope</div>
          {SCOPES.map(s => (
            <button key={s.name} onClick={() => { setScope(s); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-stone-50">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm bg-stone-800 font-mono text-[9px] font-bold text-white">{s.code}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-stone-900">{s.name}</span>
                <span className="block truncate text-[10px] text-stone-500">{s.meta}</span>
              </span>
              {s.name === scope.name && <Icon path={ICONS.check} className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ active, setActive, scope, setScope, collapsed, setCollapsed }) {
  return (
    <aside className={`${collapsed ? "w-14" : "w-[252px]"} flex flex-shrink-0 flex-col border-r border-stone-200 bg-white transition-all duration-200`}>
      <div className={`flex items-center gap-2.5 border-b border-stone-200 ${collapsed ? "justify-center px-1.5 py-3" : "px-3 py-3"}`}>
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm bg-stone-900 text-white">
          <Icon path={ICONS.check} className="h-4 w-4" />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block text-[15px] font-bold leading-tight tracking-tight text-stone-900">PACT</span>
            <span className="block truncate text-[10px] text-stone-500">Provable Agent Control Testing</span>
          </span>
        )}
      </div>
      <div className={`border-b border-stone-200 ${collapsed ? "px-1.5" : "px-2"} py-2.5`}>
        <ScopeSwitcher scope={scope} setScope={setScope} collapsed={collapsed} />
      </div>
      <nav className={`flex flex-1 flex-col gap-0.5 ${collapsed ? "px-1.5" : "px-2"} py-3`}>
        {NAV.map(n => (
          <button key={n.label} onClick={() => setActive(n.label)} title={n.label}
            className={`flex items-center gap-2.5 rounded-sm text-[13px] font-medium transition-colors ${collapsed ? "justify-center p-2.5" : "px-2.5 py-2"} ${
              active === n.label ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}>
            <Icon path={ICONS[n.icon]} className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="flex-1 text-left">{n.label}</span>}
            {!collapsed && n.count && (
              <span className="rounded-sm bg-amber-100 px-1.5 font-mono text-[10px] font-semibold text-amber-800">{n.count}</span>
            )}
          </button>
        ))}
      </nav>
      <div className={`flex flex-col gap-0.5 border-t border-stone-200 ${collapsed ? "px-1.5" : "px-2"} py-2`}>
        <button title="Settings" onClick={() => setActive("Settings")}
          className={`flex items-center gap-2.5 rounded-sm text-[13px] font-medium ${collapsed ? "justify-center p-2.5" : "px-2.5 py-2"} ${active === "Settings" ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}>
          <Icon path={ICONS.settings} className="h-4 w-4 flex-shrink-0" />
          {!collapsed && "Settings"}
        </button>
        <button onClick={() => setCollapsed(c => !c)}
          className={`flex items-center gap-2.5 rounded-sm text-[13px] font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-900 ${collapsed ? "justify-center p-2.5" : "px-2.5 py-2"}`}>
          <Icon path={ICONS.chevron} className={`h-4 w-4 flex-shrink-0 ${collapsed ? "" : "rotate-180"}`} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}

function SubSidebar({ active, sub, setSub, open, setOpen }) {
  const groups = SUBNAV[active] || [];
  if (!open) {
    return (
      <div className="flex w-8 flex-shrink-0 items-start justify-center border-r border-stone-200 bg-white pt-3">
        <button onClick={() => setOpen(true)} title={`Show ${active} menu`} className="rounded-sm p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
          <Icon path={ICONS.chevron} className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <aside className="flex w-[212px] flex-shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">{active}</span>
        <button onClick={() => setOpen(false)} title="Hide menu" className="-mr-1 rounded-sm p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
          <Icon path={ICONS.chevron} className="h-3.5 w-3.5 rotate-180" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
        {groups.map(g => (
          <div key={g.title || g.items[0]} className="flex flex-col gap-0.5">
            {g.title && <span className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">{g.title}</span>}
            {g.items.map(it => (
              <button key={it} onClick={() => setSub(it)}
                className={`flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                  sub === it ? "bg-stone-100 font-semibold text-stone-900" : "font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"}`}>
                <span className="flex-1">{it}</span>
                {g.counts && g.counts[it] && <span className="font-mono text-[10px] text-stone-400">{g.counts[it]}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex min-h-14 flex-shrink-0 flex-wrap items-center gap-2 border-b border-stone-200 bg-white px-5 py-2">
      <div className="hidden flex-1 sm:block" />
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
        <div className="flex min-w-[184px] max-w-[360px] flex-1 cursor-pointer items-center gap-2 rounded-sm border border-stone-200 bg-white px-3 py-1.5 hover:bg-stone-50">
          <Icon path={ICONS.search} className="h-4 w-4 flex-shrink-0 text-stone-400" />
          <span className="min-w-0 flex-1 truncate text-[13px] text-stone-500">Search agents, runs, findings…</span>
          <kbd className="flex-shrink-0 rounded-sm border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-stone-500">⌘K</kbd>
        </div>
        <button className="flex flex-shrink-0 items-center gap-2 rounded-sm border border-stone-200 bg-white px-3 py-1.5 text-[13px] font-medium text-stone-700 hover:bg-stone-50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="font-mono">FY2027 · Q1</span>
          <Icon path={ICONS.chevronDown} className="h-3.5 w-3.5 text-stone-400" />
        </button>
      </div>
      <div className="flex flex-1 flex-shrink-0 items-center justify-end gap-1">
        <button className="rounded-sm p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600"><Icon path={ICONS.history} /></button>
        <button className="rounded-sm p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600"><Icon path={ICONS.calendar} /></button>
        <button className="relative rounded-sm p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
          <Icon path={ICONS.bell} />
          <span className="absolute right-1 top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[9px] font-bold text-white">3</span>
        </button>
        <div className="ml-1 flex flex-shrink-0 items-center gap-2 rounded-sm px-1.5 py-1 hover:bg-stone-50">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-stone-200 bg-emerald-700 text-xs font-semibold text-white">MS</span>
          <span className="hidden min-w-0 md:block">
            <span className="block truncate text-[12px] font-semibold text-stone-900">Deep Sidhu</span>
            <span className="block truncate text-[10px] text-stone-500">SOX Program Lead</span>
          </span>
          <Icon path={ICONS.chevronDown} className="h-3.5 w-3.5 text-stone-400" />
        </div>
      </div>
    </header>
  );
}

function Placeholder({ title, sub }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white p-12 text-center">
      <div className="text-[14px] font-semibold text-stone-900">{title}</div>
      <div className="mt-1 text-[13px] text-stone-500">{sub}</div>
    </div>
  );
}

const { RunDetail, ChangeReport, Readiness, ControlLifecycle, AgentInventory, AuthorityGrants, AgentIdentities, ControlObjectives, AssertionCoverage, RiskMap, TestingSchedule, InvariantBreakdown, CostPerException, Workpapers, Attestations, EvidenceExplorer, AuditLogScreen, FindingsRegister, RemediationPlans, Scenarios, ExceptionTaxonomy, HarnessVersions, OntologyReference, SettingsEntities, SettingsPeriods, SettingsMateriality, SettingsIntegrations, SettingsUsers, SettingsOrganization, SettingsLicense, SettingsBilling } = window;

function App() {
  const [active, setActive] = useState("Overview");
  const [sub, setSub] = useState("Readiness");
  const [scope, setScope] = useState(SCOPES[0]);
  const [collapsed, setCollapsed] = useState(false);
  const [subOpen, setSubOpen] = useState(true);

  const go = label => { setActive(label); setSub((SUBNAV[label] || [{ items: [] }])[0].items[0]); };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50" data-screen-label="PACT Console">
      <Sidebar active={active} setActive={go} scope={scope} setScope={setScope} collapsed={collapsed} setCollapsed={setCollapsed} />
      <SubSidebar active={active} sub={sub} setSub={setSub} open={subOpen} setOpen={setSubOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {active === "Overview" && sub === "Readiness" && <Readiness onOpenChangeReport={() => { setActive("Testing"); setSub("Compare runs"); }} onOpenLifecycle={() => setSub("Lifecycle")} />}
          {active === "Overview" && sub === "Lifecycle" && <ControlLifecycle />}
          {active === "Agents" && ["All agents", "Awaiting certification", "Drifted"].includes(sub) && <AgentInventory view={sub} />}
          {active === "Agents" && sub === "Authority grants" && <AuthorityGrants />}
          {active === "Agents" && sub === "Agent identities" && <AgentIdentities />}
          {active === "Controls" && sub === "Control objectives" && <ControlObjectives />}
          {active === "Controls" && sub === "Assertion coverage" && <AssertionCoverage />}
          {active === "Controls" && sub === "Risk map" && <RiskMap />}
          {active === "Testing" && sub === "Runs" && <RunDetail onOpenChangeReport={() => setSub("Compare runs")} />}
          {active === "Testing" && sub === "Compare runs" && <ChangeReport onOpenRun={() => setSub("Runs")} />}
          {active === "Testing" && sub === "Schedule" && <TestingSchedule />}
          {active === "Testing" && sub === "Invariant breakdown" && <InvariantBreakdown />}
          {active === "Testing" && sub === "Cost per exception" && <CostPerException />}
          {active === "Testing" && !["Runs", "Compare runs", "Schedule", "Invariant breakdown", "Cost per exception"].includes(sub) && <Placeholder title={sub} sub="Not built in this kit — Runs and Compare runs carry the reference layouts." />}
          {active === "Evidence" && sub === "Workpapers" && <Workpapers />}
          {active === "Evidence" && sub === "Attestations" && <Attestations />}
          {active === "Evidence" && sub === "Evidence explorer" && <EvidenceExplorer />}
          {active === "Evidence" && sub === "Audit log" && <AuditLogScreen />}
          {active === "Findings" && (sub === "Open findings" || sub === "Closed") && <FindingsRegister view={sub} />}
          {active === "Findings" && sub === "Remediation plans" && <RemediationPlans />}
          {active === "Library" && sub === "Scenarios" && <Scenarios />}
          {active === "Library" && sub === "Exception taxonomy" && <ExceptionTaxonomy />}
          {active === "Library" && sub === "Harness versions" && <HarnessVersions />}
          {active === "Library" && sub === "Ontology reference" && <OntologyReference />}
          {active === "Settings" && sub === "Organization" && <SettingsOrganization />}
          {active === "Settings" && sub === "License & usage" && <SettingsLicense />}
          {active === "Settings" && sub === "Billing" && <SettingsBilling />}
          {active === "Settings" && sub === "Entities" && <SettingsEntities />}
          {active === "Settings" && sub === "Periods" && <SettingsPeriods />}
          {active === "Settings" && sub === "Materiality" && <SettingsMateriality />}
          {active === "Settings" && sub === "Integrations" && <SettingsIntegrations />}
          {active === "Settings" && sub === "Users & roles" && <SettingsUsers />}
          {!["Testing", "Overview", "Agents", "Controls", "Evidence", "Findings", "Library", "Settings"].includes(active) && <Placeholder title={`${active} · ${sub}`} sub="Not built in this kit — see Overview › Readiness for the reference layout." />}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { App });
