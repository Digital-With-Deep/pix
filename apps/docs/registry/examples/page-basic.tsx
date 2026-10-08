import { Page, Button, Badge } from "@pix-ui/react";

export default function Example() {
  return (
    <div style={{ border: "1px solid var(--border, #e4e4e7)", borderRadius: 8, overflow: "hidden" }}>
      <Page
        avatar="Eval pipeline"
        title="Nightly regression suite"
        secondary="Owned by Eval pipeline · last run 12 min ago"
        meta={<Badge tone="success">Passing</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm">
              View history
            </Button>
            <Button variant="filled" size="sm">
              Run now
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, color: "var(--fg2, #3f3f46)", fontSize: 14 }}>
          312 cases across 4 suites. Next scheduled run at 02:00 UTC.
        </p>
      </Page>
    </div>
  );
}
