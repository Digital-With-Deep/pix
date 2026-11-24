import * as React from "react";
import { safeHref } from "./safeHref.js";

const mSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const mMono = "var(--font-mono, ui-monospace, Menlo, monospace)";

// A small, dependency-free Markdown renderer for model output. It builds React
// elements directly (no innerHTML), so model text can never inject markup.
// Supported: headings, paragraphs, emphasis, strong, strikethrough, inline and
// fenced code, links, ordered and unordered lists (one level of nesting),
// blockquotes, tables and horizontal rules. With `streaming`, an unfinished
// trailing marker (`**`, a lone backtick, an open link) is held back so partial
// text never flashes raw syntax, and an unclosed code fence renders as code.


const INLINE = /(`+)([^`]*?)\1|\*\*([^*]+?)\*\*|__([^_]+?)__|~~([^~]+?)~~|\*([^*\s][^*]*?)\*|_([^_\s][^_]*?)_|\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

function inline(text, keyBase) {
  const out = [];
  let last = 0, m, i = 0;
  // A fresh regex per call: the nested calls below would otherwise reset a shared lastIndex and loop forever.
  const re = new RegExp(INLINE.source, "g");
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[1]) out.push(<code key={k} style={{ font: `400 0.92em ${mMono}`, padding: "1px 4px", borderRadius: 3, background: "var(--zinc-100, #f4f4f5)", color: "var(--fg1, #18181b)" }}>{m[2]}</code>);
    else if (m[3] || m[4]) out.push(<strong key={k} style={{ fontWeight: 600, color: "var(--fg1, #18181b)" }}>{inline(m[3] || m[4], k)}</strong>);
    else if (m[5]) out.push(<del key={k}>{inline(m[5], k)}</del>);
    else if (m[6] || m[7]) out.push(<em key={k}>{inline(m[6] || m[7], k)}</em>);
    else if (m[8]) {
      const href = safeHref(m[9]);
      out.push(href
        ? <a key={k} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ color: "var(--accent-ink, var(--emerald-700, #047857))", textDecoration: "underline", textUnderlineOffset: 2 }}>{inline(m[8], k)}</a>
        : <span key={k}>{m[8]}</span>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function trimPartial(src) {
  // Hold back an unfinished inline marker at the very end of a streaming chunk.
  let s = src;
  const tail = s.slice(-200);
  const lastLine = tail.slice(tail.lastIndexOf("\n") + 1);
  const count = (str, re) => (str.match(re) || []).length;
  if (count(lastLine, /\*\*/g) % 2 === 1) s = s.slice(0, s.lastIndexOf("**"));
  else if (!/^\s*```/.test(lastLine) && count(lastLine, /`/g) % 2 === 1) s = s.slice(0, s.lastIndexOf("`"));
  const open = s.lastIndexOf("[");
  if (open > s.lastIndexOf("\n") && !/\]\([^)]*\)/.test(s.slice(open))) s = s.slice(0, open);
  return s;
}

const ROW = /^\s*\|?(.+?)\|?\s*$/;
const splitRow = (l) => (l.match(ROW)?.[1] || "").split("|").map(c => c.trim());

function parse(src) {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^\s*(```|~~~)\s*([\w+-]*)/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      blocks.push({ t: "code", lang: fence[2], text: body.join("\n") });
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { blocks.push({ t: "h", level: h[1].length, text: h[2] }); i++; continue; }
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) { blocks.push({ t: "hr" }); i++; continue; }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map(c => c.endsWith(":") ? (c.startsWith(":") ? "center" : "right") : "left");
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(splitRow(lines[i++]));
      blocks.push({ t: "table", head, align, rows });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ t: "quote", children: parse(body.join("\n")) });
      continue;
    }
    const li = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (li && li[1].length < 2) {
      const ordered = /\d/.test(li[2]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (m && m[1].length < 2) { items.push({ text: m[3], sub: [] }); i++; continue; }
        if (m && items.length) { items[items.length - 1].sub.push(m[3]); i++; continue; }
        if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) { items[items.length - 1].text += " " + lines[i].trim(); i++; continue; }
        break;
      }
      blocks.push({ t: "list", ordered, start: ordered ? parseInt(li[2], 10) : 1, items });
      continue;
    }
    // Always take the current line, so a stray "|" or an indented list item can't stall the loop mid-stream.
    const para = [lines[i++].trim()];
    while (i < lines.length && lines[i].trim() && !/^\s*(```|~~~|#{1,4}\s|>|\|)/.test(lines[i]) && !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i])) para.push(lines[i++].trim());
    blocks.push({ t: "p", text: para.join("\n") });
  }
  return blocks;
}

function withBreaks(text, k) {
  const parts = text.split("\n");
  return parts.flatMap((p, j) => (j < parts.length - 1 ? [...inline(p, `${k}-${j}`), <br key={`${k}-br${j}`} />] : inline(p, `${k}-${j}`)));
}

function render(blocks, keyBase = "md") {
  return blocks.map((b, n) => {
    const k = `${keyBase}-${n}`;
    const gap = { margin: n === 0 ? "0" : "10px 0 0" };
    switch (b.t) {
      case "h": {
        const size = [0, 16, 14, 13, 13][b.level];
        const Tag = `h${Math.min(b.level + 2, 6)}`;
        return <Tag key={k} style={{ ...gap, marginTop: n === 0 ? 0 : 14, font: `600 ${size}px/1.4 ${mSans}`, color: "var(--fg1, #18181b)" }}>{inline(b.text, k)}</Tag>;
      }
      case "hr": return <hr key={k} style={{ ...gap, border: 0, borderTop: "1px solid var(--divider, #f4f4f5)" }} />;
      case "code": return (
        <pre key={k} data-lang={b.lang || undefined} style={{ ...gap, padding: "10px 12px", borderRadius: 4, overflowX: "auto", background: "var(--zinc-50, #fafafa)", border: "1px solid var(--divider, #f4f4f5)", font: `400 12px/1.6 ${mMono}`, color: "var(--fg1, #18181b)" }}><code>{b.text}</code></pre>
      );
      case "quote": return <blockquote key={k} style={{ ...gap, padding: "2px 0 2px 12px", borderLeft: "3px solid var(--border, #e4e4e7)", color: "var(--fg2, #52525b)" }}>{render(b.children, k)}</blockquote>;
      case "list": {
        const Tag = b.ordered ? "ol" : "ul";
        return (
          <Tag key={k} start={b.ordered && b.start !== 1 ? b.start : undefined} style={{ ...gap, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 3 }}>
            {b.items.map((it, j) => (
              <li key={`${k}-${j}`}>
                {inline(it.text, `${k}-${j}`)}
                {it.sub.length > 0 && <ul style={{ margin: "3px 0 0", paddingLeft: 18 }}>{it.sub.map((s, q) => <li key={q}>{inline(s, `${k}-${j}-${q}`)}</li>)}</ul>}
              </li>
            ))}
          </Tag>
        );
      }
      case "table": return (
        <div key={k} style={{ ...gap, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", font: `400 12px ${mSans}`, minWidth: "60%" }}>
            <thead><tr>{b.head.map((c, j) => <th key={j} scope="col" style={{ textAlign: b.align[j] || "left", padding: "6px 10px", borderBottom: "1px solid var(--border, #e4e4e7)", fontWeight: 600, color: "var(--fg1, #18181b)" }}>{inline(c, `${k}-h${j}`)}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, q) => <tr key={q}>{b.head.map((_, j) => <td key={j} style={{ textAlign: b.align[j] || "left", padding: "6px 10px", borderBottom: "1px solid var(--divider, #f4f4f5)" }}>{inline(r[j] || "", `${k}-${q}-${j}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      default: return <p key={k} style={{ ...gap }}>{withBreaks(b.text, k)}</p>;
    }
  });
}

/** Renders model output written in Markdown as PIX-styled React elements, safely (no raw HTML) and without flashing half-written syntax while `streaming`. */
export function Markdown({ children, text, streaming = false, style }) {
  const src = String(text !== undefined ? text : (typeof children === "string" ? children : "") || "");
  const blocks = React.useMemo(() => parse(streaming ? trimPartial(src) : src), [src, streaming]);
  return <div style={{ font: `400 13px/1.65 ${mSans}`, color: "var(--fg2, #52525b)", overflowWrap: "anywhere", ...style }}>{render(blocks)}</div>;
}
