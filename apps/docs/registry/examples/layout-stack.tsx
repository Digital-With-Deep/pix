import { Stack, Button } from "@pix-ui/react";

export default function Example() {
  return (
    <Stack direction="row" gap={8} wrap align="center" justify="between">
      <Stack direction="col" gap={2}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg1, #18181b)" }}>
          Nightly regression suite
        </span>
        <span style={{ fontSize: 12, color: "var(--fg3, #71717a)" }}>Last run 12 min ago</span>
      </Stack>
      <Stack direction="row" gap={8}>
        <Button variant="outline" size="sm">
          View history
        </Button>
        <Button variant="filled" size="sm">
          Run now
        </Button>
      </Stack>
    </Stack>
  );
}
