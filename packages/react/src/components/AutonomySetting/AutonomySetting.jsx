import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";

const asSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const AS_LEVELS = [
  { value: "suggest", label: "Suggest only", summary: "The agent suggests what to do. You take every action yourself." },
  { value: "propose", label: "Plan and propose", summary: "The agent drafts a plan and waits. Nothing runs until you approve it." },
  { value: "confirm", label: "Act with confirmation", summary: "The agent carries out the plan and asks you before each step that changes anything." },
  { value: "autonomous", label: "Act on its own", summary: "The agent acts without asking. You review what it did afterwards in the action history." },
];
const asHidden = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0, opacity: 0 };

function AutonomySettingBase({ value, defaultValue = "propose", onChange, label = "Autonomy", task, descriptions, disabled = false, name, style }) {
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const current = controlled ? value : inner;
  const [focus, setFocus] = React.useState(null);
  const uid = React.useId().replace(/[^\w-]/g, "");
  const group = name || "pix-as-" + uid;
  const levels = AS_LEVELS.map((l) => (descriptions && descriptions[l.value] ? Object.assign({}, l, { summary: descriptions[l.value] }) : l));
  const chosen = levels.find((l) => l.value === current);
  const pick = (v) => { if (disabled) return; if (!controlled) setInner(v); if (onChange) onChange(v); };

  return (
    <div style={{ fontFamily: asSans, color: "var(--fg1, #18181b)", opacity: disabled ? 0.55 : 1, ...style }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span id={group + "-l"} style={{ font: `600 11px ${asSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg2, #52525b)" }}>{label}</span>
        {task && <span style={{ font: `400 12px ${asSans}`, color: "var(--fg2, #52525b)" }}>for {task}</span>}
      </div>
      <div role="radiogroup" aria-labelledby={group + "-l"} aria-describedby={group + "-s"} aria-disabled={disabled || undefined}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: 6 }}>
        {levels.map((l, i) => {
          const on = l.value === current;
          return (
            <label key={l.value} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8, padding: "10px 11px", borderRadius: 4, cursor: disabled ? "default" : "pointer",
              background: on ? "var(--surface, #fff)" : "var(--surface-alt, #fafafa)", border: `1px solid ${on ? "var(--fg1, #18181b)" : "var(--border, #e4e4e7)"}`,
              boxShadow: on ? "inset 0 0 0 1px var(--fg1, #18181b)" : "none", outline: focus === l.value ? "2px solid var(--accent, #10b981)" : "none", outlineOffset: 2, transition: "background 120ms, border-color 120ms" }}>
              <input type="radio" name={group} value={l.value} checked={on} disabled={disabled} onChange={() => pick(l.value)}
                onFocus={() => setFocus(l.value)} onBlur={() => setFocus(null)} style={asHidden} />
              <span aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
                {AS_LEVELS.map((_, k) => (
                  <span key={k} style={{ width: 5, height: 5 + k * 3, borderRadius: 1, background: k <= i ? (on ? "var(--fg1, #18181b)" : "var(--fg2, #52525b)") : "var(--border-strong, #d4d4d8)" }} />
                ))}
              </span>
              <span style={{ font: `${on ? 600 : 500} 12.5px/1.35 ${asSans}`, color: on ? "var(--fg1, #18181b)" : "var(--fg2, #52525b)" }}>{l.label}</span>
            </label>
          );
        })}
      </div>
      <p id={group + "-s"} aria-live="polite" style={{ margin: "10px 0 0", font: `400 12.5px/1.5 ${asSans}`, color: "var(--fg1, #18181b)" }}>
        {chosen ? chosen.summary : "Choose how much the agent may do on its own."}
      </p>
    </div>
  );
}

/** How much an agent may do on its own for one task, from suggesting to acting alone. With `loading`, renders a skeleton in its own footprint. */
export function AutonomySetting(props) {
  if (props.loading) {
    return (
      <Skeleton label="Loading autonomy setting" style={props.style}>
        <Skeleton width={90} height={9} style={{ marginBottom: 10 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: 6 }}>
          {[0, 1, 2, 3].map((k) => <Skeleton key={k} height={64} />)}
        </div>
        <Skeleton width="70%" height={12} style={{ marginTop: 12 }} />
      </Skeleton>
    );
  }
  return <AutonomySettingBase {...props} />;
}
