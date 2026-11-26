import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { Tooltip } from "../Tooltip/Tooltip.jsx";
import { ensureBasicsStyle, srOnly, usePixId, useControllable } from "../../internal/basics.jsx";
const { useState: usePromptState, useRef: usePromptRef } = React;

const pFont = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const P_PLUS = "M12 4v16m8-8H4";
const P_SEND = "M5 12h14M13 6l6 6-6 6";
const P_CHEVRON = "M19 9l-7 7-7-7";
const P_CLOSE = "M6 18L18 6M6 6l12 12";
const P_CHECK = "M5 13l4 4L19 7";
const P_DOC = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
const P_UPLOAD = "M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4";
const P_DRIVE = "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z";
const P_DB = "M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7";
const P_SPARK = "M13 3l2.3 6.9L21 12l-5.7 2.1L13 21l-2.3-6.9L5 12l5.7-2.1L13 3z";
const P_CLIP = "M21.4 11.1l-9.2 9.2a6 6 0 01-8.5-8.5l9.2-9.2a4 4 0 015.7 5.7l-9.2 9.2a2 2 0 01-2.8-2.8l8.5-8.5";
const P_CAMERA = "M3 9a2 2 0 012-2h.9a2 2 0 001.7-.9l.8-1.2A2 2 0 0110.1 4h3.8a2 2 0 011.7.9l.8 1.2a2 2 0 001.7.9H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm12 4a3 3 0 11-6 0 3 3 0 016 0z";
const P_ALERT = "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z";

const PLUS_ICONS = { upload: P_UPLOAD, drive: P_DRIVE, data: P_DB, doc: P_DOC, spark: P_SPARK };

function PIcon({ path, size = 15 }) {
  return React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 } },
    React.createElement("path", { d: path }));
}

const DEFAULT_PLUS_ITEMS = [
  { label: "Upload files", icon: "upload", meta: "JSON, CSV, PDF · 25 MB", action: "attach" },
  { label: "Attach a run trace", icon: "data", meta: "42 runs this quarter" },
  { label: "Attach evidence", icon: "drive", meta: "Change reports, attestations" },
  { label: "Use a saved prompt", icon: "doc", meta: "12 saved" },
];

const DEFAULT_MODELS = [
  { id: "flash", name: "Gemini 2.5 Flash", meta: "Fast · default", badge: "Default" },
  { id: "pro", name: "Gemini 2.5 Pro", meta: "Deep reasoning · slower" },
  { id: "sonnet", name: "Claude Sonnet", meta: "Long documents" },
  { id: "local", name: "Recon local", meta: "Never leaves your tenant", badge: "Private" },
];

const EXT_TINT = {
  pdf: { bg: "var(--red-50, #fef2f2)", fg: "var(--red-700, #b91c1c)" }, csv: { bg: "var(--emerald-50, #ecfdf5)", fg: "var(--emerald-700, #047857)" },
  xlsx: { bg: "var(--emerald-50, #ecfdf5)", fg: "var(--emerald-700, #047857)" }, doc: { bg: "var(--blue-50, #eff6ff)", fg: "var(--blue-700, #1d4ed8)" },
  docx: { bg: "var(--blue-50, #eff6ff)", fg: "var(--blue-700, #1d4ed8)" }, txt: { bg: "var(--zinc-100, #f4f4f5)", fg: "var(--zinc-600, #52525b)" },
};

function AttachThumb({ file }) {
  const box = { width: 28, height: 28, borderRadius: 2, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" };
  if (file.preview) {
    return React.createElement("span", { style: { ...box, border: "1px solid var(--border, #e4e4e7)", background: "var(--zinc-100, #f4f4f5)" } },
      React.createElement("img", { src: file.preview, alt: "", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } }));
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const tint = EXT_TINT[ext] || { bg: "var(--zinc-100, #f4f4f5)", fg: "var(--fg3, #71717a)" };
  return React.createElement("span", { style: { ...box, background: file.error ? "var(--red-100, #fee2e2)" : tint.bg, border: `1px solid ${file.error ? "var(--red-200, #fecaca)" : "var(--border, #e4e4e7)"}`,
      font: `700 8px ${pFont}`, letterSpacing: "0.04em", color: file.error ? "var(--red-700, #b91c1c)" : tint.fg, textTransform: "uppercase" } },
    ext.slice(0, 4) || React.createElement(PIcon, { path: P_DOC, size: 13 }));
}

function fmtSize(n) {
  if (n === undefined || n === null) return null;
  return n >= 1048576 ? `${(n / 1048576).toFixed(1).replace(/\.0$/, "")} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

let attSeq = 0;
const nextAttId = () => `pix-att-${++attSeq}-${Math.random().toString(36).slice(2, 7)}`;
const sameAtt = (a, b) => a === b || (a && b && a.id !== undefined && a.id === b.id);
const isBlob = v => typeof Blob !== "undefined" && v instanceof Blob;

/** Does `file` match an `accept` string such as "image/*,.pdf,text/csv"? */
function acceptsFile(file, accept) {
  if (!accept) return true;
  const name = String(file.name || "").toLowerCase();
  const type = String(file.type || "").toLowerCase();
  return accept.split(",").map(r => r.trim().toLowerCase()).filter(Boolean).some(rule => {
    if (rule.charAt(0) === ".") return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.indexOf(rule.slice(0, -1)) === 0;
    return type === rule;
  });
}

function PromptInputBase({
  value, defaultValue = "", onChange, onSubmit, placeholder = "Ask about a run, an agent, or a finding…", label = "Message",
  showPlusMenu = true, plusItems = DEFAULT_PLUS_ITEMS, onPlusAction,
  showModelSelector = true, models = DEFAULT_MODELS, model, defaultModel, onModelChange,
  allowFiles = true, attachments, defaultAttachments, onAttachmentsChange, onAttach, onRemoveAttachment,
  accept, multiple = true, maxFileSize, maxFileSizeError, unsupportedFileError = "File type not supported",
  showAttachButton = false, attachLabel = "Attach files", dropLabel = "Drop files to attach",
  onAddScreenshot, screenshotLabel = "Add screenshot", screenshotError = "Couldn't add the screenshot",
  tools = [], activeTools = [], onToggleTool,
  sendLabel = "Send", hint = "Enter to send · Shift+Enter for a new line", showHint = true,
  error, disabled = false, rows = 3, width = "100%", style,
}) {
  React.useEffect(ensureBasicsStyle, []);
  const [text, setText] = usePromptState(defaultValue);
  const q = value !== undefined ? value : text;
  const setQ = v => { if (value === undefined) setText(v); if (onChange) onChange(v); };

  // Attachments: controlled with `attachments` + `onAttachmentsChange`, or self-managed from `defaultAttachments`.
  const [files, setFiles] = useControllable(attachments, defaultAttachments || [], onAttachmentsChange);
  const filesRef = usePromptRef(files);
  filesRef.current = files;
  const commitFiles = next => { filesRef.current = next; setFiles(next); };

  const [internalModel, setModel] = usePromptState(defaultModel || (models[0] && models[0].id));
  const activeModelId = model !== undefined ? model : internalModel;
  const activeModel = models.find(m => m.id === activeModelId) || models[0];

  const [plusOpen, setPlusOpen] = usePromptState(false);
  const [modelOpen, setModelOpen] = usePromptState(false);
  const [dragging, setDragging] = usePromptState(false);
  const [shotBusy, setShotBusy] = usePromptState(false);
  const [notice, setNotice] = usePromptState(null);
  const [announcement, setAnnouncement] = usePromptState("");
  const inputRef = usePromptRef(null);
  const fieldRef = usePromptRef(null);
  const chipsRef = usePromptRef(null);
  const dragDepth = usePromptRef(0);
  const ownUrls = usePromptRef(new Set());
  const refocusChip = usePromptRef(null);
  const mounted = usePromptRef(true);
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const hintId = usePixId("pix-prompt-hint-");

  const canAttach = allowFiles && !disabled;
  const limitError = maxFileSizeError || (maxFileSize ? `Over the ${fmtSize(maxFileSize)} limit` : "");

  const toAttachment = file => {
    const err = !acceptsFile(file, accept) ? unsupportedFileError : maxFileSize && file.size > maxFileSize ? limitError : undefined;
    let preview;
    if (!err && file.type && file.type.indexOf("image/") === 0 && typeof URL !== "undefined" && URL.createObjectURL) {
      preview = URL.createObjectURL(file);
      ownUrls.current.add(preview);
    }
    return { id: nextAttId(), name: file.name || "Untitled", size: file.size, type: file.type, file, preview,
      status: err ? "error" : undefined, error: err };
  };
  const forget = att => {
    if (att && att.preview && ownUrls.current.has(att.preview)) {
      ownUrls.current.delete(att.preview);
      try { URL.revokeObjectURL(att.preview); } catch (e) { /* already revoked */ }
    }
  };
  const addAttachments = added => {
    if (!added.length) return;
    let current = filesRef.current;
    if (!multiple) {
      added = added.slice(0, 1);
      current.forEach(f => { forget(f); if (onRemoveAttachment) onRemoveAttachment(f); });
      current = [];
    }
    commitFiles([...current, ...added]);
    if (onAttach) onAttach(added);
    setNotice(null);
    const bad = added.filter(a => a.error);
    const good = added.filter(a => !a.error);
    setAnnouncement([good.length ? `Attached ${good.map(a => a.name).join(", ")}` : "", ...bad.map(a => `${a.name}: ${a.error}`)].filter(Boolean).join(". "));
  };
  const addFiles = list => {
    if (!canAttach || !list) return;
    addAttachments(Array.from(list).map(toAttachment));
  };
  const removeAttachment = (att, index) => {
    forget(att);
    commitFiles(filesRef.current.filter(f => !sameAtt(f, att)));
    if (onRemoveAttachment) onRemoveAttachment(att);
    setAnnouncement(`Removed ${att.name}`);
    refocusChip.current = index;
  };
  // After a chip is removed, keep keyboard focus nearby: the next chip's remove button, or the text field.
  React.useEffect(() => {
    const i = refocusChip.current;
    if (i === null) return;
    refocusChip.current = null;
    const buttons = chipsRef.current ? chipsRef.current.querySelectorAll("[data-pix-remove]") : [];
    const target = buttons.length ? buttons[Math.min(i, buttons.length - 1)] : fieldRef.current;
    if (target && typeof target.focus === "function") target.focus();
  }, [files]);

  const pickFiles = () => { if (canAttach && inputRef.current) inputRef.current.click(); };
  const addScreenshot = async () => {
    if (!onAddScreenshot || shotBusy || disabled) return;
    setShotBusy(true);
    setNotice(null);
    try {
      const shot = await onAddScreenshot();
      if (!mounted.current || !shot) return;
      if (isBlob(shot)) {
        const file = typeof File !== "undefined" && !(shot instanceof File)
          ? new File([shot], "Screenshot.png", { type: shot.type || "image/png" }) : shot;
        addAttachments([toAttachment(file)]);
      } else {
        addAttachments([{ ...shot, id: shot.id !== undefined ? shot.id : nextAttId() }]);
      }
    } catch (e) {
      if (mounted.current) { setNotice(screenshotError); setAnnouncement(screenshotError); }
    } finally {
      if (mounted.current) setShotBusy(false);
    }
  };
  const runPlus = item => {
    setPlusOpen(false);
    if (item.action === "attach" && allowFiles) return pickFiles();
    if (item.action === "screenshot" && onAddScreenshot) return addScreenshot();
    if (onPlusAction) onPlusAction(item);
  };

  const hasFiles = e => !!(e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") !== -1);
  const dropHandlers = !allowFiles ? {} : {
    onDragEnter: e => { if (!canAttach || !hasFiles(e)) return; e.preventDefault(); dragDepth.current += 1; setDragging(true); },
    onDragOver: e => { if (!canAttach || !hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; },
    onDragLeave: e => { if (!canAttach || !hasFiles(e)) return; dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false); },
    onDrop: e => { if (!canAttach || !hasFiles(e)) return; e.preventDefault(); dragDepth.current = 0; setDragging(false); addFiles(e.dataTransfer.files); },
  };
  // Pasted files and images attach; when the clipboard also holds text, the text is pasted instead.
  const onPaste = e => {
    const cd = e.clipboardData;
    if (!canAttach || !cd || !cd.files || !cd.files.length) return;
    if (cd.getData && cd.getData("text/plain")) return;
    e.preventDefault();
    addFiles(cd.files);
  };

  const uploading = files.some(f => f.status === "uploading");
  const canSend = !disabled && !!q.trim() && !uploading;
  const send = () => { if (canSend && onSubmit) onSubmit({ text: q, model: activeModelId, attachments: files }); };

  const iconBtn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, flexShrink: 0,
    border: "1px solid var(--border, #e4e4e7)", borderRadius: 3, background: "var(--surface, #fff)", color: "var(--fg2, #52525b)", cursor: "pointer", padding: 0,
  };
  const footerMessage = error || notice;

  return (
    <div style={{ width, font: `400 13px ${pFont}`, ...style }}>
      <div {...dropHandlers} style={{ position: "relative", background: "var(--surface, #fff)", border: `1px solid ${footerMessage ? "var(--danger, #ef4444)" : "var(--border, #e4e4e7)"}`, borderRadius: 4,
        boxShadow: footerMessage ? "0 0 0 3px rgba(239,68,68,0.12)" : "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))", opacity: disabled ? 0.6 : 1 }}>
        {allowFiles && files.length > 0 && (
          <div ref={chipsRef} role="list" aria-label="Attachments" style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px 0" }}>
            {files.map((f, i) => {
              const failed = f.status === "error" || !!f.error;
              const busy = f.status === "uploading";
              const pct = typeof f.progress === "number" ? Math.max(0, Math.min(100, Math.round(f.progress))) : null;
              const meta = failed ? (f.error || "Upload failed") : busy ? (pct !== null ? `Uploading ${pct}%` : "Uploading…") : fmtSize(f.size);
              return (
                <span key={f.id !== undefined ? f.id : `${f.name}-${i}`} role="listitem" title={failed ? meta : undefined} data-pix-attachment={failed ? "error" : busy ? "uploading" : "ready"}
                  style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 7, maxWidth: 260, padding: "4px 7px 4px 4px", overflow: "hidden",
                    background: failed ? "var(--red-50, #fef2f2)" : "var(--zinc-50, #fafafa)", border: `1px solid ${failed ? "var(--red-200, #fecaca)" : "var(--border, #e4e4e7)"}`, borderRadius: 3 }}>
                  <AttachThumb file={failed && !f.error ? { ...f, error: meta } : f} />
                  <span style={{ minWidth: 0 }}>
                    <span title={f.name} style={{ display: "block", font: `500 11px ${pFont}`, color: failed ? "var(--red-700, #b91c1c)" : "var(--fg1, #18181b)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                    {meta && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, font: `400 10px ${pFont}`, color: failed ? "var(--red-700, #b91c1c)" : "var(--fg3, #71717a)" }}>
                        {failed && <PIcon path={P_ALERT} size={10} />}{meta}
                      </span>
                    )}
                  </span>
                  <button type="button" data-pix-remove="" className="pix-o-focus" onClick={() => removeAttachment(f, i)} disabled={disabled}
                    aria-label={`Remove ${f.name}`} title="Remove"
                    style={{ border: 0, background: "transparent", padding: 2, margin: -2, borderRadius: 2, cursor: disabled ? "not-allowed" : "pointer", color: "var(--fg3, #71717a)", display: "flex", flexShrink: 0 }}>
                    <PIcon path={P_CLOSE} size={12} />
                  </button>
                  {busy && (
                    <span role="progressbar" aria-label={`Uploading ${f.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct !== null ? pct : undefined}
                      style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "var(--zinc-200, #e4e4e7)" }}>
                      <span style={{ display: "block", height: "100%", width: pct !== null ? `${pct}%` : "35%", background: "var(--accent, #10b981)", transition: "width 160ms linear" }} />
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}

        <textarea ref={fieldRef} value={q} rows={rows} placeholder={placeholder} disabled={disabled} aria-label={label}
          aria-describedby={footerMessage || (showHint && hint) ? hintId : undefined} aria-invalid={error ? true : undefined}
          onChange={e => setQ(e.target.value)} onPaste={onPaste}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !(e.nativeEvent && e.nativeEvent.isComposing)) { e.preventDefault(); send(); } }}
          style={{ display: "block", width: "100%", boxSizing: "border-box", border: 0, outline: "none", resize: "none",
            padding: "12px 12px 6px", font: `400 13px ${pFont}`, lineHeight: 1.55, color: "var(--fg1, #18181b)", background: "transparent" }} />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "6px 10px 10px" }}>
          {showPlusMenu && (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button type="button" onClick={() => { setPlusOpen(o => !o); setModelOpen(false); }} title="Add context" aria-label="Add context" aria-expanded={plusOpen} disabled={disabled} style={iconBtn}>
                <PIcon path={P_PLUS} size={16} />
              </button>
              {plusOpen && (
                <div style={{ position: "absolute", left: 0, bottom: "calc(100% + 6px)", width: 258, background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)",
                  borderRadius: 3, boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.08))", zIndex: 50, padding: "4px 0" }}>
                  <div style={{ padding: "6px 12px 4px", font: `600 10px ${pFont}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>Add context</div>
                  {plusItems.map(it => (
                    <button type="button" key={it.label} onClick={() => runPlus(it)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "7px 12px", border: 0, background: "transparent", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex" }}><PIcon path={PLUS_ICONS[it.icon] || P_DOC} size={14} /></span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", font: `500 12px ${pFont}`, color: "var(--fg1, #18181b)" }}>{it.label}</span>
                        {it.meta && <span style={{ display: "block", font: `400 10px ${pFont}`, color: "var(--fg3, #71717a)" }}>{it.meta}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {allowFiles && showAttachButton && (
            <Tooltip content={attachLabel}>
              <button type="button" className="pix-o-focus" onClick={pickFiles} aria-label={attachLabel} disabled={disabled} style={iconBtn}>
                <PIcon path={P_CLIP} size={15} />
              </button>
            </Tooltip>
          )}

          {onAddScreenshot && (
            <Tooltip content={shotBusy ? "Adding screenshot…" : screenshotLabel}>
              <button type="button" className="pix-o-focus" onClick={addScreenshot} aria-label={screenshotLabel} aria-busy={shotBusy || undefined}
                disabled={disabled} style={{ ...iconBtn, cursor: shotBusy ? "progress" : iconBtn.cursor, opacity: shotBusy ? 0.6 : 1 }}>
                <PIcon path={P_CAMERA} size={15} />
              </button>
            </Tooltip>
          )}

          {tools.map(t => {
            const on = activeTools.indexOf(t) !== -1;
            return (
              <button type="button" key={t} onClick={() => onToggleTool && onToggleTool(t)} disabled={disabled}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 9px", borderRadius: 3, cursor: "pointer", flexShrink: 0,
                  border: `1px solid ${on ? "var(--emerald-500, #10b981)" : "var(--border, #e4e4e7)"}`,
                  background: on ? "var(--emerald-50, #ecfdf5)" : "var(--surface, #fff)",
                  color: on ? "var(--emerald-700, #047857)" : "var(--fg2, #52525b)", font: `500 11px ${pFont}` }}>
                <PIcon path={P_SPARK} size={12} />{t}
              </button>
            );
          })}

          <div style={{ flex: 1, minWidth: 0 }} />

          {showModelSelector && activeModel && (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button type="button" onClick={() => { setModelOpen(o => !o); setPlusOpen(false); }} disabled={disabled} aria-expanded={modelOpen}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 8px", border: "1px solid var(--border, #e4e4e7)", borderRadius: 3,
                  background: "var(--surface, #fff)", cursor: "pointer", font: `500 11px ${pFont}`, color: "var(--fg2, #52525b)", maxWidth: 200 }}>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{activeModel.name}</span>
                <span style={{ color: "var(--fg-muted, #a1a1aa)", display: "flex" }}><PIcon path={P_CHEVRON} size={12} /></span>
              </button>
              {modelOpen && (
                <div style={{ position: "absolute", right: 0, bottom: "calc(100% + 6px)", width: 248, background: "var(--surface, #fff)", border: "1px solid var(--border, #e4e4e7)",
                  borderRadius: 3, boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.08))", zIndex: 50, padding: "4px 0" }}>
                  <div style={{ padding: "6px 12px 4px", font: `600 10px ${pFont}`, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg3, #71717a)" }}>Model</div>
                  {models.map(m => {
                    const on = m.id === activeModelId;
                    return (
                      <button type="button" key={m.id} onClick={() => { if (model === undefined) setModel(m.id); if (onModelChange) onModelChange(m.id); setModelOpen(false); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", border: 0, cursor: "pointer", textAlign: "left",
                          background: on ? "var(--zinc-50, #fafafa)" : "transparent" }}>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", font: `${on ? 600 : 500} 12px ${pFont}`, color: "var(--fg1, #18181b)" }}>{m.name}</span>
                          {m.meta && <span style={{ display: "block", font: `400 10px ${pFont}`, color: "var(--fg3, #71717a)" }}>{m.meta}</span>}
                        </span>
                        {m.badge && <span style={{ font: `600 9px ${pFont}`, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 5px", borderRadius: 2,
                          background: "var(--zinc-100, #f4f4f5)", color: "var(--fg3, #71717a)", flexShrink: 0 }}>{m.badge}</span>}
                        {on && <span style={{ color: "var(--emerald-600, #059669)", display: "flex", flexShrink: 0 }}><PIcon path={P_CHECK} size={13} /></span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button type="button" onClick={send} disabled={!canSend} title={uploading ? "Waiting for uploads to finish" : undefined}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", border: 0, borderRadius: 3, flexShrink: 0,
              background: canSend ? "var(--zinc-900, #18181b)" : "var(--zinc-200, #e4e4e7)",
              color: canSend ? "var(--fg-inverse, #fff)" : "var(--fg-muted, #a1a1aa)",
              font: `600 12px ${pFont}`, cursor: canSend ? "pointer" : "not-allowed" }}>
            {sendLabel}<PIcon path={P_SEND} size={13} />
          </button>
        </div>

        {dragging && (
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 4, zIndex: 40,
            border: "2px dashed var(--accent, #10b981)", background: "var(--accent-bg, rgba(236,253,245,0.94))", color: "var(--accent-fg, #047857)", font: `600 12px ${pFont}`, pointerEvents: "none" }}>
            <PIcon path={P_UPLOAD} size={16} />{dropLabel}
          </div>
        )}
      </div>

      {allowFiles && (
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} tabIndex={-1} aria-hidden="true"
          onChange={e => { addFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
      )}
      <span aria-live="polite" style={srOnly}>{announcement}</span>
      {footerMessage ? (
        <div id={hintId} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginTop: 6, paddingLeft: 2, font: `500 11px ${pFont}`, color: "var(--red-700, #b91c1c)" }}>
          <span style={{ display: "flex", marginTop: 1 }}><PIcon path={P_ALERT} size={12} /></span>{footerMessage}
        </div>
      ) : showHint && hint ? (
        <div id={hintId} style={{ font: `400 10px ${pFont}`, color: "var(--fg3, #71717a)", marginTop: 6, paddingLeft: 2 }}>{hint}</div>
      ) : null}
    </div>
  );
}

/** With `loading`, renders a skeleton in this component's own footprint instead of its content. */
export function PromptInput(props) {
  if (props.loading) return <Skeleton label="Loading composer" style={{ width: props.width || "100%", ...props.style }}><Skeleton height={(props.rows || 3) * 22 + 60} /></Skeleton>;
  return <PromptInputBase {...props} />;
}
