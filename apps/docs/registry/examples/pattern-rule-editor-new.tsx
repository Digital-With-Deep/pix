import { PatternRuleEditor } from "@pix-ui/react";

export default function Example() {
  return (
    <PatternRuleEditor
      onSave={() => {}}
      watchSuggestions={["Tool failures", "User complaints", "Unusually high cost"]}
      alerts=""
      onConfigureAlerts={() => {}}
      style={{ width: "100%", maxWidth: 720 }}
    />
  );
}
