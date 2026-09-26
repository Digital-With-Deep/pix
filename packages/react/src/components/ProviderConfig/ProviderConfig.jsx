import * as React from "react";
import { Button } from "../Button/Button.jsx";
import { Select } from "../Select/Select.jsx";
import { RadioGroup } from "../RadioGroup/RadioGroup.jsx";
import { Switch } from "../Switch/Switch.jsx";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { EmptyState } from "../EmptyState/EmptyState.jsx";

const pcfSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const pcfMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const pcfLabel = { display: "block", marginBottom: 6, font: `600 11px ${pcfSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" };
const pcfInput = (err, mono) => ({ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 3, outline: "none", background: "var(--surface, #fff)", color: "var(--fg1, #18181b)",
  border: `1px solid ${err ? "var(--red-500, #ef4444)" : "var(--border, #e4e4e7)"}`, font: mono ? `400 13px ${pcfMono}` : `400 14px ${pcfSans}` });
const pcfWell = { background: "var(--bg-subtle, #fafafa)", border: "1px solid var(--border, #e4e4e7)", borderRadius: 4 };
const pcfErr = { marginTop: 5, font: `400 11px/1.4 ${pcfSans}`, color: "var(--claim, #b91c1c)" };
const pcfIcon = (d) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const PCF_X = "M6 6l12 12M18 6L6 18", PCF_BACK = "M15 19l-7-7 7-7", PCF_PLUS = "M12 5v14M5 12h14", PCF_TRASH = "M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3";

function PcfInput({ mono, error, onFocusRing = true, style, ...rest }) {
  const [f, setF] = React.useState(false);
  return <input {...rest} onFocus={() => setF(true)} onBlur={(e) => { setF(false); if (rest.onBlur) rest.onBlur(e); }}
    style={{ ...pcfInput(error, mono), ...(f && !error ? { borderColor: "var(--emerald-500, #10b981)", boxShadow: "0 0 0 3px rgba(16,185,129,.15)" } : null), ...style }} />;
}
function PcfIconBtn({ label, d, onClick }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, flexShrink: 0, borderRadius: 3,
    border: "1px solid var(--border, #e4e4e7)", background: "var(--surface, #fff)", color: "var(--fg2, #52525b)", cursor: "pointer" }}>{pcfIcon(d)}</button>;
}
function PcfAdd({ children, onClick }) {
  return <button type="button" onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "8px 12px", borderRadius: 3, cursor: "pointer",
    border: "1px dashed var(--border-strong, #d4d4d8)", background: "var(--surface, #fff)", font: `500 13px ${pcfSans}`, color: "var(--fg2, #52525b)" }}>{pcfIcon(PCF_PLUS)}{children}</button>;
}
const pcfIsUrl = (v) => { try { const u = new URL(v); return u.protocol === "https:" || u.protocol === "http:"; } catch (e) { return false; } };

function pcfInitial(def, v) {
  v = v || {};
  return {
    provider: def.value, name: v.name || "", auth: v.auth || (def.auth && def.auth[0] ? def.auth[0].value : null), secret: "",
    fields: Object.fromEntries((def.fields || []).map((f) => [f.key, (v.fields && v.fields[f.key]) != null ? v.fields[f.key] : f.default || ""])),
    headers: v.headers || [], modelScope: v.modelScope || "all", models: v.models || [], customModels: v.customModels || [],
    behavior: Object.fromEntries((def.behaviors || []).map((b) => [b.key, (v.behavior && v.behavior[b.key]) != null ? v.behavior[b.key] : !!b.default])),
  };
}

export function ProviderConfig({ providers = [], value, mode = "create", title, secretNote, existingNames = [], onSubmit, onCancel, onBack, onTest, loading = false, emptyAction, style }) {
  const defOf = (k) => providers.find((p) => p.value === k) || providers[0] || { value: "", auth: [], fields: [], behaviors: [], models: [] };
  const [cfg, setCfg] = React.useState(() => pcfInitial(defOf(value && value.provider), value));
  const [tab, setTab] = React.useState("form");
  const [raw, setRaw] = React.useState(""), [rawErr, setRawErr] = React.useState("");
  const [touched, setTouched] = React.useState({}), [submitted, setSubmitted] = React.useState(false);
  const [mq, setMq] = React.useState("");
  const [test, setTest] = React.useState(null);
  const def = defOf(cfg.provider);
  const auth = (def.auth || []).find((a) => a.value === cfg.auth);
  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));
  const setField = (k, v) => setCfg((c) => ({ ...c, fields: { ...c.fields, [k]: v } }));

  const errors = {};
  if (!cfg.name.trim()) errors.name = "Give this provider a name."; else if (existingNames.some((n) => n.toLowerCase() === cfg.name.trim().toLowerCase())) errors.name = "Another provider already uses this name.";
  if (auth && auth.secret !== false && mode === "create" && !cfg.secret.trim()) errors.secret = `${auth.secretLabel || "Secret"} is required.`;
  (def.fields || []).forEach((f) => { const v = (cfg.fields[f.key] || "").trim();
    if (f.required && !v) errors["f:" + f.key] = `${f.label} is required.`; else if (v && f.type === "url" && !pcfIsUrl(v)) errors["f:" + f.key] = "Enter a full URL, starting with https://"; });
  if (cfg.modelScope === "selected" && cfg.models.length === 0) errors.models = "Select at least one model, or choose All models.";
  if (cfg.modelScope === "none" && cfg.customModels.filter((m) => m.trim()).length === 0) errors.models = "Add at least one custom model.";
  const show = (k) => (submitted || touched[k]) && errors[k];
  const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));

  const requestJson = () => JSON.stringify({ ...cfg.fields, headers: Object.fromEntries(cfg.headers.filter((h) => h.key).map((h) => [h.key, h.value])), behavior: cfg.behavior }, null, 2);
  const openTab = (t) => { if (t === "raw") { setRaw(requestJson()); setRawErr(""); } setTab(t); };
  const editRaw = (text) => { setRaw(text);
    try { const o = JSON.parse(text); if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error("Expected a JSON object.");
      const { headers = {}, behavior = {}, ...fields } = o;
      setCfg((c) => ({ ...c, fields: { ...c.fields, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])) }, headers: Object.entries(headers).map(([key, v]) => ({ key, value: String(v) })), behavior: { ...c.behavior, ...behavior } }));
      setRawErr(""); } catch (e) { setRawErr("Not valid JSON yet — the form keeps the last valid version. " + e.message); } };

  const changeProvider = (k) => { const d = defOf(k); setCfg((c) => ({ ...pcfInitial(d, null), name: c.name })); setTouched({}); setTest(null); setMq(""); };
  const submit = () => { setSubmitted(true); if (Object.keys(errors).length || rawErr) return;
    const { secret, ...rest } = cfg; if (onSubmit) onSubmit({ ...rest, customModels: cfg.customModels.filter((m) => m.trim()), ...(secret ? { secret } : null) }); };
  const runTest = async () => { if (!onTest) return; setTest({ state: "busy" }); try { const r = await onTest(cfg); setTest({ state: r && r.ok === false ? "fail" : "ok", text: (r && r.message) || "Connection succeeded." }); } catch (e) { setTest({ state: "fail", text: String((e && e.message) || e) }); } };

  const models = def.models || [], needle = mq.trim().toLowerCase();
  const shownModels = needle ? models.filter((m) => (m.name + " " + m.id).toLowerCase().includes(needle)) : models;
  const allOn = shownModels.length > 0 && shownModels.every((m) => cfg.models.includes(m.id));
  const toggleModel = (id) => set({ models: cfg.models.includes(id) ? cfg.models.filter((x) => x !== id) : [...cfg.models, id] });
  const toggleAll = () => set({ models: allOn ? cfg.models.filter((id) => !shownModels.some((m) => m.id === id)) : Array.from(new Set([...cfg.models, ...shownModels.map((m) => m.id)])) });
  const h2 = { margin: "24px 0 10px", font: `600 13px ${pcfSans}`, color: "var(--fg1, #18181b)" };
  const errCount = Object.keys(errors).length;
  const bodyStyle = { flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px 28px" };
  const frame = (children, foot) => (
    <section aria-label={title || "Configure model provider"} aria-busy={loading || undefined} style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: "var(--surface, #fff)", fontFamily: pcfSans, color: "var(--fg1, #18181b)", ...style }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid var(--border, #e4e4e7)", flexShrink: 0 }}>
        {onBack && <button type="button" aria-label="Back" onClick={onBack} style={{ display: "flex", border: 0, background: "transparent", padding: 4, cursor: "pointer", color: "var(--fg3, #71717a)" }}>{pcfIcon(PCF_BACK)}</button>}
        <h2 style={{ flex: 1, margin: 0, font: `700 17px/1.3 ${pcfSans}`, letterSpacing: "-0.01em" }}>{title || (mode === "edit" ? "Edit model provider" : "Configure model provider")}</h2>
        {onCancel && <button type="button" aria-label="Close" onClick={onCancel} style={{ display: "flex", border: 0, background: "transparent", padding: 4, cursor: "pointer", color: "var(--fg3, #71717a)" }}>{pcfIcon(PCF_X)}</button>}
      </header>
      {children}
      {foot}
    </section>
  );

  // Loading: the catalog, or the configuration being edited, has not arrived. Header and footer stay put; the body is form-shaped.
  if (loading) return frame(
    <div style={bodyStyle}>
      <Skeleton.Field /><Skeleton.Field style={{ marginTop: 16 }} />
      <div style={{ marginTop: 24 }}><Skeleton.List rows={3} glyph twoLine /></div>
      <div style={{ marginTop: 24 }}><Skeleton.Form fields={3} footer={false} /></div>
      <div style={{ marginTop: 24 }}><Skeleton.List rows={3} glyph={false} /></div>
    </div>,
    <footer style={{ display: "flex", gap: 10, padding: "12px 20px", borderTop: "1px solid var(--border, #e4e4e7)", flexShrink: 0, justifyContent: "flex-end" }}><Skeleton width={72} height={32} /><Skeleton width={130} height={32} /></footer>);

  // Empty: the catalog resolved with no provider types. Nothing can be configured, so say why and offer the way out.
  if (providers.length === 0) return frame(
    <div style={bodyStyle}>
      <EmptyState icon="plug" tone="fault" title="No provider types are available" meta="providers: []" actions={emptyAction}
        body="This deployment has no model provider types enabled, so there is nothing to configure. The scripted demo agents run without one." />
    </div>,
    onCancel && <footer style={{ display: "flex", padding: "12px 20px", borderTop: "1px solid var(--border, #e4e4e7)", flexShrink: 0, justifyContent: "flex-end" }}><Button variant="ghost" onClick={onCancel}>Close</Button></footer>);

  return frame(

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 20px 28px" }}>
        <Select label="Provider" options={providers} value={cfg.provider} onChange={changeProvider} searchPlaceholder="Search providers" disabled={mode === "edit"}
          hint={mode === "edit" ? "The provider type cannot change after creation. Create a new provider instead." : def.description} />

        <div style={{ marginTop: 16 }}>
          <label style={pcfLabel} htmlFor="pcf-name">Name</label>
          <PcfInput id="pcf-name" value={cfg.name} placeholder="A unique name, e.g. azure-eastus-prod" error={show("name")} aria-invalid={!!show("name")} onChange={(e) => set({ name: e.target.value })} onBlur={() => touch("name")} />
          {show("name") && <div style={pcfErr} role="alert">{errors.name}</div>}
        </div>

        {(def.auth || []).length > 0 && <>
          <RadioGroup label="Authentication" style={{ marginTop: 20 }} options={def.auth} value={cfg.auth} onChange={(v) => { set({ auth: v, secret: "" }); setTest(null); }} />
          {auth && auth.secret !== false && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <PcfInput mono type="password" autoComplete="off" aria-label={auth.secretLabel || "Secret"} value={cfg.secret} error={show("secret")}
                  placeholder={mode === "edit" ? "Leave blank to keep the stored secret" : (auth.secretLabel || "Secret")} onChange={(e) => { set({ secret: e.target.value }); setTest(null); }} onBlur={() => touch("secret")} />
                {onTest && <Button variant="secondary" size="md" loading={test && test.state === "busy"} disabled={!cfg.secret.trim() && mode === "create"} onClick={runTest}>Test</Button>}
              </div>
              {show("secret") && <div style={pcfErr} role="alert">{errors.secret}</div>}
              {test && test.state !== "busy" && <div role="status" style={{ ...pcfErr, color: test.state === "ok" ? "var(--truth, #047857)" : "var(--claim, #b91c1c)" }}>{test.text}</div>}
              <div style={{ marginTop: 6, font: `400 12px/1.5 ${pcfSans}`, color: "var(--fg3, #71717a)" }}>{secretNote || "Stored encrypted and never shown again. It is used only to run agents under test."}</div>
            </div>
          )}
          {auth && auth.note && <div style={{ marginTop: 10, font: `400 12px/1.5 ${pcfSans}`, color: "var(--fg3, #71717a)" }}>{auth.note}</div>}
        </>}

        <div style={{ display: "flex", alignItems: "center", gap: 12, ...h2 }}>
          <span style={{ flex: 1 }}>Request configuration</span>
          <span role="tablist" aria-label="Edit as" style={{ display: "inline-flex", padding: 2, borderRadius: 4, background: "var(--zinc-100, #f4f4f5)" }}>
            {[["form", "Form"], ["raw", "Raw"]].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => openTab(k)}
              style={{ border: 0, borderRadius: 3, padding: "4px 12px", cursor: "pointer", font: `${tab === k ? 600 : 500} 12px ${pcfSans}`, background: tab === k ? "var(--surface, #fff)" : "transparent",
                color: tab === k ? "var(--fg1, #18181b)" : "var(--fg3, #71717a)", boxShadow: tab === k ? "0 1px 2px rgba(0,0,0,.08)" : "none" }}>{l}</button>)}
          </span>
        </div>
        {tab === "raw" ? (
          <div>
            <textarea value={raw} spellCheck={false} aria-label="Request configuration as JSON" aria-invalid={!!rawErr} onChange={(e) => editRaw(e.target.value)}
              style={{ ...pcfInput(rawErr, true), minHeight: 220, lineHeight: 1.6, resize: "vertical", fontSize: 12 }} />
            {rawErr ? <div style={pcfErr} role="alert">{rawErr}</div> : <div style={{ ...pcfErr, color: "var(--fg3, #71717a)" }}>The same settings as the form. Secrets are never included here.</div>}
          </div>
        ) : (
          <div style={pcfWell}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
              {(def.fields || []).map((f) => (
                <div key={f.key} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "6px 16px" }}>
                  <label htmlFor={"pcf-" + f.key} style={{ flex: "1 1 180px", paddingTop: 8, font: `500 13px ${pcfSans}` }}>{f.label}{f.required && <span aria-hidden="true" style={{ color: "var(--claim, #b91c1c)" }}> *</span>}</label>
                  <div style={{ flex: "1.2 1 240px", minWidth: 0 }}>
                    <PcfInput id={"pcf-" + f.key} mono value={cfg.fields[f.key] || ""} placeholder={f.placeholder} required={f.required} error={show("f:" + f.key)} aria-invalid={!!show("f:" + f.key)}
                      onChange={(e) => setField(f.key, e.target.value)} onBlur={() => touch("f:" + f.key)} />
                    {show("f:" + f.key) && <div style={pcfErr} role="alert">{errors["f:" + f.key]}</div>}
                  </div>
                </div>
              ))}
              {cfg.headers.map((hd, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <PcfInput mono aria-label={`Header ${i + 1} name`} placeholder="Header name" value={hd.key} onChange={(e) => set({ headers: cfg.headers.map((x, j) => j === i ? { ...x, key: e.target.value } : x) })} />
                  <PcfInput mono aria-label={`Header ${i + 1} value`} placeholder="Value" value={hd.value} onChange={(e) => set({ headers: cfg.headers.map((x, j) => j === i ? { ...x, value: e.target.value } : x) })} />
                  <PcfIconBtn label={`Remove header ${i + 1}`} d={PCF_TRASH} onClick={() => set({ headers: cfg.headers.filter((_, j) => j !== i) })} />
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border, #e4e4e7)" }}><PcfAdd onClick={() => set({ headers: [...cfg.headers, { key: "", value: "" }] })}>Additional header</PcfAdd></div>
          </div>
        )}

        <div style={h2}>Models</div>
        <div style={{ ...pcfWell, padding: 16 }}>
          <RadioGroup value={cfg.modelScope} onChange={(v) => set({ modelScope: v })} options={[
            { value: "all", label: "All models", description: `Every ${def.label || "registry"} model this workspace knows about can be pinned in an agent fingerprint.` },
            // With no registry models in the definition there is nothing to tick, so the choice is All or custom only.
            ...(models.length ? [{ value: "selected", label: "Selected models", description: "Only the models ticked below can be used for test runs." }] : []),
            { value: "none", label: "None", description: "Only the custom models you define below." }]} />
          {cfg.modelScope === "selected" && (
            <div style={{ marginTop: 14, border: "1px solid var(--border, #e4e4e7)", borderRadius: 4, background: "var(--surface, #fff)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid var(--border, #e4e4e7)", font: `600 11px ${pcfSans}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>
                <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label={allOn ? "Clear all shown models" : "Select all shown models"} style={{ accentColor: "var(--emerald-600, #059669)" }} />
                <span style={{ flex: 1 }}>Model</span><span style={{ flex: 1 }}>Model ID</span>
                <input value={mq} onChange={(e) => setMq(e.target.value)} placeholder="Search models" aria-label="Search models" style={{ ...pcfInput(false, false), width: 160, padding: "5px 9px", fontSize: 12, textTransform: "none", letterSpacing: 0 }} />
              </div>
              <div style={{ maxHeight: 232, overflowY: "auto" }}>
                {shownModels.map((m) => (
                  <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: "1px solid var(--divider, #f4f4f5)", cursor: "pointer" }}>
                    <input type="checkbox" checked={cfg.models.includes(m.id)} onChange={() => toggleModel(m.id)} style={{ accentColor: "var(--emerald-600, #059669)" }} />
                    <span style={{ flex: 1, minWidth: 0, font: `500 13px ${pcfSans}` }}>{m.name}</span>
                    <span style={{ flex: 1, minWidth: 0, font: `400 12px ${pcfMono}`, color: "var(--fg3, #71717a)", overflow: "hidden", textOverflow: "ellipsis" }}>{m.id}</span>
                    <span style={{ width: 160 }} />
                  </label>
                ))}
                {shownModels.length === 0 && <div style={{ padding: 14, font: `400 12px ${pcfSans}`, color: "var(--fg3, #71717a)" }}>No models match “{mq}”.</div>}
              </div>
              <div style={{ padding: "7px 12px", borderTop: "1px solid var(--border, #e4e4e7)", font: `400 11px ${pcfMono}`, color: "var(--fg3, #71717a)" }}>{cfg.models.length} of {models.length} selected</div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            {cfg.customModels.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <PcfInput mono aria-label={`Custom model ${i + 1}`} placeholder="Custom model ID, e.g. ft:wht-resolver-2026-09" value={m} onChange={(e) => set({ customModels: cfg.customModels.map((x, j) => j === i ? e.target.value : x) })} />
                <PcfIconBtn label={`Remove custom model ${i + 1}`} d={PCF_TRASH} onClick={() => set({ customModels: cfg.customModels.filter((_, j) => j !== i) })} />
              </div>
            ))}
            <PcfAdd onClick={() => set({ customModels: [...cfg.customModels, ""] })}>Custom model</PcfAdd>
          </div>
          {show("models") && <div style={pcfErr} role="alert">{errors.models}</div>}
        </div>

        {(def.behaviors || []).length > 0 && <>
          <div style={h2}>Request behavior</div>
          <div style={pcfWell}>{def.behaviors.map((b, i) => <Switch key={b.key} divider={i > 0} label={b.label} description={b.description} checked={!!cfg.behavior[b.key]} onChange={(v) => set({ behavior: { ...cfg.behavior, [b.key]: v } })} />)}</div>
        </>}
      </div>,
      <footer style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderTop: "1px solid var(--border, #e4e4e7)", flexShrink: 0 }}>
        {submitted && errCount > 0 && <span role="alert" style={{ font: `400 12px ${pcfSans}`, color: "var(--claim, #b91c1c)" }}>{errCount} {errCount === 1 ? "field needs" : "fields need"} attention.</span>}
        <span style={{ flex: 1 }} />
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button variant="primary" onClick={submit}>{mode === "edit" ? "Save changes" : "Create provider"}</Button>
      </footer>
  );
}
