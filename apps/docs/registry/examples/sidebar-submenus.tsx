import { Sidebar, type SidebarItem } from "@pix-ui/react";

const ICON = {
  home: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  bots: "M8.25 7.5l.415-1.245a3.75 3.75 0 00-7.18-2.04m6.765 3.285a3.75 3.75 0 010 7.5m0-7.5l1.5 4.5m-1.5 3l1.5-4.5m3.75 4.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z",
  data: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
  settings: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
};

// Items with `items` expand into a smoothly animated submenu; `defaultOpen`
// starts a group expanded. A leaf's `key` is reported to `onNavigate` and
// matched against the active row.
const NAV: SidebarItem[] = [
  { key: "home", label: "Home", iconPath: ICON.home },
  {
    key: "agents", label: "Agents", iconPath: ICON.bots, defaultOpen: true,
    items: [
      { key: "agents.live", label: "Live", badge: 4 },
      { key: "agents.drafts", label: "Drafts" },
      {
        key: "agents.templates", label: "Templates",
        items: [
          { key: "agents.templates.support", label: "Support triage" },
          { key: "agents.templates.research", label: "Research" },
        ],
      },
    ],
  },
  {
    key: "data", label: "Data sources", iconPath: ICON.data,
    items: [
      { key: "data.connected", label: "Connected", badge: 7 },
      { key: "data.sync", label: "Sync history" },
    ],
  },
  { key: "settings", label: "Settings", iconPath: ICON.settings },
];

export default function Example() {
  return (
    <div style={{ height: 420, display: "flex", border: "1px solid var(--border, #e4e4e7)", borderRadius: 10, overflow: "hidden", background: "var(--surface, #fff)" }}>
      <Sidebar items={NAV} defaultActiveKey="agents.live" style={{ borderRight: "none" }} />
    </div>
  );
}
