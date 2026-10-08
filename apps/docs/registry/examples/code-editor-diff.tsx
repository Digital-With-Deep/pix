import { CodeEditor } from "@pix-ui/react";

const code = `export function scoreRun(run) {
  const failed = run.cases.filter((c) => !c.passed);
  if (failed.length > 0) {
    return { status: "fail", count: failed.length };
  }
  return { status: "pass", count: 0 };
}`;

export default function Example() {
  return (
    <CodeEditor
      value={code}
      readOnly
      language="ts"
      title="score-run.ts"
      lineNumbers
      highlightLines={[3, 4, 5]}
      status="Reviewed 2 min ago"
    />
  );
}
