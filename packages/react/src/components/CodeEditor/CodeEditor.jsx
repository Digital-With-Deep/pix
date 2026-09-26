import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
const ceSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const ceMono = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
let ceSeq = 0;

const KW = {
  ts: "import export from as default const let var function return if else for while do switch case break continue new class extends implements interface type enum async await try catch finally throw typeof instanceof in of void delete yield this super null undefined true false static readonly public private protected declare namespace keyof",
  python: "import from as def return if elif else for while in not and or is None True False class try except finally raise with lambda yield pass break continue global nonlocal assert del async await print",
  json: "true false null",
  yaml: "true false null yes no on off",
  bash: "if then else fi for in do done while case esac function export return local echo cd ls npx npm pip python node export set",
  go: "package import func return if else for range var const type struct interface map chan go defer select switch case break continue default nil true false",
  sql: "select from where insert into values update set delete create table index join left right inner on group by order limit as and or not null primary key",
};
const ALIAS = { js: "ts", jsx: "ts", tsx: "ts", javascript: "ts", typescript: "ts", py: "python", sh: "bash", shell: "bash", zsh: "bash", yml: "yaml", golang: "go" };

function tokenize(src, lang) {
  const l = ALIAS[lang] || lang; const kws = new Set((KW[l] || "").split(" "));
  const out = []; let i = 0; const n = src.length;
  const push = (t, s) => { if (s) out.push([t, s]); };
  const lineComment = l === "python" || l === "bash" || l === "yaml" ? "#" : l === "sql" ? "--" : l === "json" ? null : "//";
  while (i < n) {
    const c = src[i];
    if (lineComment && src.startsWith(lineComment, i)) { let j = src.indexOf("\n", i); if (j < 0) j = n; push("c", src.slice(i, j)); i = j; continue; }
    if ((l === "ts" || l === "go" || l === "sql") && src.startsWith("/*", i)) { let j = src.indexOf("*/", i + 2); j = j < 0 ? n : j + 2; push("c", src.slice(i, j)); i = j; continue; }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1; while (j < n && src[j] !== c) { if (src[j] === "\\") j++; if (src[j] === "\n" && c !== "`") break; j++; }
      push("s", src.slice(i, Math.min(n, j + 1))); i = j + 1; continue;
    }
    if (/[0-9]/.test(c) && (i === 0 || !/[A-Za-z_$]/.test(src[i - 1]))) { let j = i; while (j < n && /[0-9a-fA-Fx._]/.test(src[j])) j++; push("n", src.slice(i, j)); i = j; continue; }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i; while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++; const w = src.slice(i, j);
      let k = j; while (k < n && src[k] === " ") k++;
      const t = kws.has(w) ? "k" : (l === "ts" || l === "python" || l === "go") && src[k] === "(" ? "f" : (l === "ts" || l === "json" || l === "yaml" || l === "go") && src[k] === ":" ? "p" : /^[A-Z]/.test(w) && l !== "sql" ? "t" : "";
      push(t, w); i = j; continue;
    }
    if (c === "@" && l === "python") { let j = src.indexOf("\n", i); if (j < 0) j = n; push("k", src.slice(i, j)); i = j; continue; }
    if (/[{}()[\]<>=+\-*/%!&|^~?:;,.]/.test(c)) { push("o", c); i++; continue; }
    let j = i + 1; while (j < n && !/[\w"'`{}()[\]<>=+\-*/%!&|^~?:;,.#@]/.test(src[j])) j++; push("", src.slice(i, j)); i = j;
  }
  return out;
}

const CE_CSS = `
.ds-ce{position:relative;min-width:0;border:1px solid var(--border,#e4e4e7);border-radius:6px;background:var(--surface,#fff);font-family:${ceSans};color:var(--fg1,#18181b);overflow:hidden}
.ds-ce[data-focus="1"]{border-color:var(--emerald-500,#10b981);box-shadow:0 0 0 3px rgba(16,185,129,.15)}
.ds-ce-h{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;border-bottom:1px solid var(--divider,#f4f4f5);background:var(--zinc-50,#fafafa);font:500 12px ${ceSans};color:var(--fg2,#52525b)}
.ds-ce-h .ttl{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.ds-ce-h .lang{margin-left:auto;white-space:nowrap;font:400 10px ${ceMono};text-transform:uppercase;letter-spacing:.06em;color:var(--fg-muted,#a1a1aa)}
.ds-ce-btn{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--border,#e4e4e7);background:var(--surface,#fff);border-radius:3px;padding:3px 7px;cursor:pointer;font:500 11px ${ceSans};color:var(--fg1,#18181b);white-space:nowrap}
.ds-ce-btn:hover{background:var(--zinc-100,#f4f4f5)}
.ds-ce-stack{position:relative;min-width:100%;width:max-content}
.ds-ce[data-wrap="1"] .ds-ce-stack{width:auto}
.ds-ce-body{position:relative;overflow:auto;max-height:var(--ce-max,none);font:400 12.5px/1.65 ${ceMono};tab-size:2}
.ds-ce pre,.ds-ce textarea{margin:0;padding:12px 14px 12px 0;font:inherit;line-height:inherit;tab-size:inherit;white-space:pre;word-wrap:normal;min-width:100%;box-sizing:border-box}
.ds-ce[data-wrap="1"] pre,.ds-ce[data-wrap="1"] textarea{white-space:pre-wrap;word-break:break-word}
.ds-ce pre{color:var(--fg1,#18181b);display:block;position:relative;z-index:0}
.ds-ce .ln{display:inline-block;width:var(--ce-gut,44px);padding-right:14px;box-sizing:border-box;text-align:right;color:var(--fg-muted,#a1a1aa);user-select:none;position:sticky;left:0;background:var(--surface,#fff)}
.ds-ce[data-gutter="0"] .ln{display:none}
.ds-ce[data-gutter="0"] pre,.ds-ce[data-gutter="0"] textarea{padding-left:14px}
.ds-ce .row{display:block}.ds-ce .row.hl{background:var(--amber-50,#fffbeb)}.ds-ce .row.hl .ln{background:var(--amber-50,#fffbeb);color:var(--amber-700,#b45309)}
.ds-ce .ce-k{color:var(--violet-700,#6d28d9);font-weight:500}.ds-ce .ce-s{color:var(--emerald-700,#047857)}.ds-ce .ce-n{color:var(--blue-700,#1d4ed8)}.ds-ce .ce-c{color:var(--fg-muted,#a1a1aa);font-style:italic}
.ds-ce .ce-f{color:var(--amber-700,#b45309)}.ds-ce .ce-p{color:var(--fg2,#52525b)}.ds-ce .ce-t{color:var(--fg1,#18181b);font-weight:500}.ds-ce .ce-o{color:var(--fg3,#71717a)}
.ds-ce textarea{position:absolute;inset:0;width:100%;height:100%;padding-left:var(--ce-gut,44px);border:0;outline:none;resize:none;background:transparent;color:transparent;caret-color:var(--fg1,#18181b);overflow:hidden;z-index:1}
.ds-ce textarea::selection{background:rgba(16,185,129,.25)}
.ds-ce textarea::placeholder{color:var(--fg-muted,#a1a1aa)}
.ds-ce-f{display:flex;align-items:center;gap:10px;padding:5px 12px;border-top:1px solid var(--divider,#f4f4f5);font:400 11px ${ceMono};color:var(--fg-muted,#a1a1aa)}
.ds-ce-inline{font:400 .92em ${ceMono};padding:1px 6px;border-radius:3px;background:var(--violet-50,#f5f3ff);color:var(--violet-700,#6d28d9);border:1px solid var(--violet-100,#ede9fe);white-space:nowrap}
.ds-ce-inline[data-tone="neutral"]{background:var(--zinc-100,#f4f4f5);color:var(--fg1,#18181b);border-color:var(--divider,#f4f4f5)}
`;
function ceEnsureCss() { if (typeof document === "undefined" || document.getElementById("ds-code-css")) return; const el = document.createElement("style"); el.id = "ds-code-css"; el.textContent = CE_CSS; document.head.appendChild(el); }

function Highlighted({ code, language, lineNumbers, highlightLines }) {
  const lines = React.useMemo(() => { const toks = tokenize(code, language); const rows = [[]]; for (const [t, s] of toks) { const parts = s.split("\n"); parts.forEach((p, i) => { if (i) rows.push([]); if (p) rows[rows.length - 1].push([t, p]); }); } return rows; }, [code, language]);
  const hl = new Set(highlightLines || []);
  return (
    <pre aria-hidden={undefined}>
      {lines.map((row, i) => (
        <span key={i} className={"row" + (hl.has(i + 1) ? " hl" : "")}>
          {lineNumbers && <span className="ln">{i + 1}</span>}
          {row.map(([t, s], j) => (t ? <span key={j} className={"ce-" + t}>{s}</span> : s))}
          {"\n"}
        </span>))}
    </pre>
  );
}

function CopyButton({ text, label = "Copy" }) {
  const [done, setDone] = React.useState(false);
  const copy = () => { try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) { /* ignore */ } setDone(true); setTimeout(() => setDone(false), 1600); };
  return <button type="button" className="ds-ce-btn" onClick={copy} aria-live="polite">
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{done ? <path d="M5 13l4 4L19 7" /> : <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></>}</svg>
    {done ? "Copied" : label}</button>;
}

/** Code, shown or edited. Read-only by default (a snippet to copy, a stored policy); pass `onChange` to edit in place. Highlighting is a light tokenizer — enough to read by, not a language server. */
export function CodeEditor({ value, defaultValue = "", onChange, language = "text", title, icon, lineNumbers = true, copy = true, wrap = false, maxHeight, highlightLines, placeholder, tabSize = 2, onSave, actions, status, ariaLabel, readOnly, loading = false, style }) {
  ceEnsureCss();
  const [own, setOwn] = React.useState(defaultValue);
  const code = value != null ? value : own;
  const editable = !!onChange && !readOnly;
  const [focus, setFocus] = React.useState(false);
  const pre = React.useRef(null), ta = React.useRef(null), caret = React.useRef(null);
  (typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect)(() => { if (caret.current != null && ta.current) { ta.current.selectionStart = ta.current.selectionEnd = caret.current; caret.current = null; } });
  const id = React.useMemo(() => "ce" + ++ceSeq, []);
  const set = (v) => { if (value == null) setOwn(v); if (onChange) onChange(v); };
  const lineCount = code.split("\n").length; const gutter = lineNumbers ? Math.max(44, 22 + String(lineCount).length * 8) : 0;
  const onKey = (e) => {
    if (e.key === "Tab") { e.preventDefault(); const el = e.target, s = el.selectionStart, t = el.selectionEnd, ind = " ".repeat(tabSize); caret.current = s + ind.length; set(code.slice(0, s) + ind + code.slice(t)); }
    else if ((e.metaKey || e.ctrlKey) && e.key === "s" && onSave) { e.preventDefault(); onSave(code); }
  };
  if (loading) return <div style={{ ...style }}><Skeleton height={Math.min(220, 40 + lineCount * 20)} label="Loading code" /></div>;
  const head = title != null || copy || actions || language !== "text";
  return (
    <div className="ds-ce" data-focus={focus ? 1 : 0} data-wrap={wrap ? 1 : 0} data-gutter={lineNumbers ? 1 : 0} style={{ "--ce-gut": gutter + "px", "--ce-max": maxHeight ? (typeof maxHeight === "number" ? maxHeight + "px" : maxHeight) : "none", ...style }}>
      {head && <div className="ds-ce-h">
        {icon && <span aria-hidden="true" style={{ display: "inline-flex", color: "var(--fg3, #71717a)" }}>{icon}</span>}
        {title != null && <span className="ttl" style={{ fontFamily: typeof title === "string" && /\.[a-z]+$/i.test(title) ? ceMono : undefined }}>{title}</span>}
        <span className="lang">{language !== "text" ? language : ""}{editable ? " · editing" : ""}</span>
        {actions}
        {copy && <CopyButton text={code} />}
      </div>}
      <div className="ds-ce-body">
        <div ref={pre} className="ds-ce-stack"><Highlighted code={code} language={language} lineNumbers={lineNumbers} highlightLines={highlightLines} />
        {editable && <textarea ref={ta} id={id} value={code} onChange={(e) => set(e.target.value)} onKeyDown={onKey} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap={wrap ? "soft" : "off"} placeholder={placeholder} aria-label={ariaLabel || title || "Code"} />}</div>
        {!editable && code.length === 0 && placeholder && <div style={{ position: "absolute", inset: 0, padding: "12px 14px", paddingLeft: gutter || 14, font: `400 12.5px ${ceMono}`, color: "var(--fg-muted, #a1a1aa)", pointerEvents: "none" }}>{placeholder}</div>}
      </div>
      {(status || onSave) && <div className="ds-ce-f"><span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>{status && <span style={{ color: "var(--fg3, #71717a)", fontFamily: ceSans }}>{status}</span>}{onSave && editable && <span style={{ marginLeft: "auto" }}>⌘S / Ctrl+S saves</span>}</div>}
    </div>
  );
}

/** A command or identifier inside running text: `npx pix-tokens build`. */
export function InlineCode({ children, tone = "accent", copy = false, style }) {
  ceEnsureCss();
  const text = typeof children === "string" ? children : "";
  return <code className="ds-ce-inline" data-tone={tone} style={style} title={copy ? "Click to copy" : undefined} onClick={copy && text ? () => { try { navigator.clipboard.writeText(text); } catch (e) { /* ignore */ } } : undefined}>{children}</code>;
}
