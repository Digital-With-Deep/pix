import { Sidebar, Avatar, SearchField, type SidebarItem } from "@pix-ui/react";

const ICON = {
  home: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  inbox: "M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z",
  team: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
};

const NAV: SidebarItem[] = [
  { key: "home", label: "Home", iconPath: ICON.home },
  { key: "review", label: "Review queue", iconPath: ICON.inbox, badge: 9 },
  { key: "team", label: "Team", iconPath: ICON.team },
];

export default function Example() {
  return (
    <div style={{ height: 420, display: "flex", border: "1px solid var(--border, #e4e4e7)", borderRadius: 10, overflow: "hidden", background: "var(--surface, #fff)" }}>
      <Sidebar
        items={NAV}
        defaultActiveKey="review"
        style={{ borderRight: "none" }}
        header={
          <div style={{ padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: "var(--fg1, #18181b)", color: "var(--bg, #fff)", display: "inline-flex", alignItems: "center", justifyContent: "center", font: "700 13px var(--font-sans, ui-sans-serif, system-ui)" }}>H</span>
              <span style={{ font: "600 14px var(--font-sans, ui-sans-serif, system-ui)", color: "var(--fg1, #18181b)" }}>Helm</span>
            </div>
            <SearchField placeholder="Search" />
          </div>
        }
        footer={
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 2px" }}>
            <Avatar name="Priya Nair" size="sm" />
            <div style={{ minWidth: 0 }}>
              <div style={{ font: "600 13px var(--font-sans, ui-sans-serif, system-ui)", color: "var(--fg1, #18181b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Priya Nair</div>
              <div style={{ font: "400 11px var(--font-sans, ui-sans-serif, system-ui)", color: "var(--fg3, #71717a)" }}>Admin</div>
            </div>
          </div>
        }
      />
    </div>
  );
}
