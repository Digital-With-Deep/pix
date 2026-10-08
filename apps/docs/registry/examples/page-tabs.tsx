import { Page, Button, Badge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ border: "1px solid var(--border, #e4e4e7)", borderRadius: 8, overflow: "hidden" }}>
      <Page
        avatar="Support agent"
        title="Support agent"
        secondary="Deployed to production · v2.4.1"
        meta={
          <>
            <Badge tone="success">Healthy</Badge>
            <Badge tone="neutral">124 tools</Badge>
          </>
        }
        actions={
          <Button variant="outline" size="sm">
            Edit config
          </Button>
        }
        below={
          <div style={{ display: "flex", gap: 20, borderTop: "1px solid var(--border, #e4e4e7)", paddingTop: 12 }}>
            {["Overview", "Runs", "Tools", "Settings"].map((tab, i) => (
              <span
                key={tab}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: i === 0 ? "var(--accent, #6d28d9)" : "var(--fg3, #71717a)",
                  paddingBottom: 10,
                  borderBottom: i === 0 ? "2px solid var(--accent, #6d28d9)" : "2px solid transparent",
                }}
              >
                {tab}
              </span>
            ))}
          </div>
        }
      />
    </div>
  );
}
