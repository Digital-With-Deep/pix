import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const { useState: useTabState } = React;

const tabsFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";

function TabsBase({ tabs = [], value, defaultValue, onChange, variant = "underline", size = "md", style }) {
  const first = tabs.length ? (typeof tabs[0] === "string" ? tabs[0] : tabs[0].value ?? tabs[0].label) : null;
  const [internal, setInternal] = useTabState(defaultValue ?? first);
  const active = value !== undefined ? value : internal;
  const pick = v => { if (value === undefined) setInternal(v); if (onChange) onChange(v); };
  const pad = size === "sm" ? "5px 9px" : "7px 12px";
  const fs = size === "sm" ? 12 : 13;

  const items = tabs.map(t => (typeof t === "string" ? { value: t, label: t } : { ...t, value: t.value ?? t.label }));

  if (variant === "segmented") {
    return (
      <div style={{ display: "inline-flex", gap: 2, padding: 2, background: "var(--zinc-100, #f4f4f5)", borderRadius: 4, ...style }}>
        {items.map(t => {
          const on = t.value === active;
          return (
            <button key={t.value} onClick={() => !t.disabled && pick(t.value)} disabled={t.disabled}
              style={{ font: `${on ? 600 : 500} ${fs}px ${tabsFont}`, padding: pad, border: 0, borderRadius: 3, cursor: t.disabled ? "not-allowed" : "pointer",
                background: on ? "var(--surface, #fff)" : "transparent", color: on ? "var(--zinc-900, #18181b)" : "var(--zinc-500, #71717a)",
                boxShadow: on ? "var(--shadow-xs, 0 1px 2px 0 rgb(0 0 0 / 0.04))" : "none", opacity: t.disabled ? 0.5 : 1,
                display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "color 200ms, background 200ms" }}>
              {t.label}
              {t.count !== undefined && <TabCount value={t.count} on={on} />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 2, borderBottom: "1px solid var(--border, #e4e4e7)", overflowX: "auto", overflowY: "hidden", ...style }}>
      {items.map(t => {
        const on = t.value === active;
        return (
          <button key={t.value} onClick={() => !t.disabled && pick(t.value)} disabled={t.disabled}
            style={{ font: `${on ? 600 : 500} ${fs}px ${tabsFont}`, padding: pad, paddingBottom: size === "sm" ? 7 : 9, border: 0, background: "transparent",
              borderBottom: `2px solid ${on ? "var(--zinc-900, #18181b)" : "transparent"}`, marginBottom: -1,
              color: on ? "var(--zinc-900, #18181b)" : "var(--zinc-500, #71717a)", cursor: t.disabled ? "not-allowed" : "pointer", opacity: t.disabled ? 0.5 : 1,
              display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "color 200ms, border-color 200ms" }}>
            {t.label}
            {t.count !== undefined && <TabCount value={t.count} on={on} />}
            {t.dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--emerald-500, #10b981)" }} />}
          </button>
        );
      })}
    </div>
  );
}

function TabCount({ value, on }) {
  return (
    <span style={{ font: `600 10px ${tabsFont}`, padding: "1px 5px", borderRadius: 3, minWidth: 16, textAlign: "center",
      background: on ? "var(--zinc-900, #18181b)" : "var(--zinc-100, #f4f4f5)", color: on ? "var(--fg-inverse, #fff)" : "var(--zinc-500, #71717a)" }}>
      {value}
    </span>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function Tabs(props) {
  if (props.loading) return <Skeleton label="Loading tabs" style={{ display: "flex", gap: 18, padding: "10px 0", borderBottom: "1px solid var(--border, #e4e4e7)", ...props.style }}>{(props.tabs || [1, 2, 3]).map((_, i) => <Skeleton key={i} width={64 + (i * 23) % 40} height={12} />)}</Skeleton>;
  return <TabsBase {...props} />;
}
