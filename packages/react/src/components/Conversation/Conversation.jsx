import * as React from "react";
import { Skeleton } from "../Skeleton/Skeleton.jsx";
import { Markdown } from "../Markdown/Markdown.jsx";
const { useRef, useState, useEffect, useLayoutEffect } = React;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const cSans = "var(--font-sans, ui-sans-serif, system-ui, sans-serif)";
const cMono = "var(--font-mono, ui-monospace, Menlo, monospace)";
const NEAR = 48;

function Mark({ role, avatar, author }) {
  if (avatar) return typeof avatar === "string"
    ? <img src={avatar} alt="" width={24} height={24} style={{ borderRadius: 999, flexShrink: 0, objectFit: "cover" }} />
    : <span style={{ flexShrink: 0 }}>{avatar}</span>;
  const assistant = role !== "user";
  const initials = (author || (assistant ? "AI" : "You")).split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: assistant ? 3 : 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: assistant ? "var(--zinc-900, #18181b)" : "var(--zinc-200, #e4e4e7)", color: assistant ? "var(--fg-inverse, #fff)" : "var(--fg1, #18181b)", font: `600 10px ${cSans}` }}>{initials}</span>
  );
}

function Message({ m, showAvatars }) {
  const user = m.role === "user";
  if (m.role === "system") {
    return <div role="note" style={{ alignSelf: "center", padding: "3px 10px", borderRadius: 999, background: "var(--zinc-100, #f4f4f5)", font: `400 11px ${cSans}`, color: "var(--fg3, #71717a)" }}>{m.content}</div>;
  }
  const body = typeof m.content === "string"
    ? (user
      ? <div style={{ padding: "8px 12px", borderRadius: 8, borderTopRightRadius: 2, background: "var(--zinc-100, #f4f4f5)", font: `400 13px/1.6 ${cSans}`, color: "var(--fg1, #18181b)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.content}</div>
      : <Markdown text={m.content} streaming={!!m.streaming} />)
    : m.content;
  return (
    <article aria-label={`${m.author || (user ? "You" : "Assistant")}${m.time ? `, ${m.time}` : ""}`}
      style={{ display: "flex", flexDirection: user ? "row-reverse" : "row", alignItems: "flex-start", gap: 10, maxWidth: "100%" }}>
      {showAvatars && <Mark role={m.role} avatar={m.avatar} author={m.author} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: user ? "flex-end" : "stretch", minWidth: 0, maxWidth: user ? "80%" : "100%", flex: user ? "0 1 auto" : 1 }}>
        {(m.author || m.time) && (
          <div style={{ display: "flex", gap: 6, font: `400 11px ${cSans}`, color: "var(--fg3, #71717a)" }}>
            {m.author && <span style={{ fontWeight: 600, color: "var(--fg2, #52525b)" }}>{m.author}</span>}
            {m.time && <span style={{ fontFamily: cMono }}>{m.time}</span>}
          </div>
        )}
        {body}
        {m.actions && !m.streaming && <div style={{ display: "flex", justifyContent: user ? "flex-end" : "flex-start" }}>{m.actions}</div>}
      </div>
    </article>
  );
}

function ConversationBase({ messages = [], children, empty, height, maxHeight, showAvatars = true, follow = true, label = "Conversation", footer, style }) {
  const scroller = useRef(null);
  const content = useRef(null);
  const pinned = useRef(true);
  const [away, setAway] = useState(false);
  const [unseen, setUnseen] = useState(false);

  const toBottom = (smooth) => {
    const el = scroller.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduce ? "smooth" : "auto" });
  };
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR;
    pinned.current = near;
    setAway(!near);
    if (near) setUnseen(false);
  };
  useIsoLayoutEffect(() => {
    if (!follow) return undefined;
    if (pinned.current) toBottom(false);
    else setUnseen(true);
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => { if (pinned.current) toBottom(false); else setUnseen(true); });
    ro.observe(node);
    return () => ro.disconnect();
  }, [messages.length, follow]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEmpty = messages.length === 0 && !children;
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 0, height, maxHeight, fontFamily: cSans, ...style }}>
      <div ref={scroller} onScroll={onScroll} role="log" aria-label={label} aria-live="polite" tabIndex={0}
        style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 14px", outline: "none" }}>
        <div ref={content} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {isEmpty && (empty || <div style={{ padding: "32px 0", textAlign: "center", font: `400 13px ${cSans}`, color: "var(--fg3, #71717a)" }}>No messages yet.</div>)}
          {messages.map((m, i) => <Message key={m.id || i} m={m} showAvatars={showAvatars} />)}
          {children}
        </div>
      </div>
      {away && (
        <button type="button" onClick={() => { pinned.current = true; setAway(false); setUnseen(false); toBottom(true); }}
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: footer ? 72 : 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px",
            borderRadius: 999, border: "1px solid var(--border, #e4e4e7)", background: "var(--surface, #fff)", boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,.08))",
            font: `500 12px ${cSans}`, color: "var(--fg1, #18181b)", cursor: "pointer" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
          {unseen ? "New messages" : "Jump to latest"}
        </button>
      )}
      {footer && <div style={{ padding: "10px 14px", borderTop: "1px solid var(--divider, #f4f4f5)" }}>{footer}</div>}
    </div>
  );
}

/**
 * A chat thread: user and assistant turns in a scrolling log that keeps the latest message in view while text streams,
 * stops following when the reader scrolls up, and offers a jump back. Turns can hold any PIX component (AIResponse,
 * ToolCall, ApprovalCard). With `loading`, renders a skeleton in its own footprint.
 */
export function Conversation(props) {
  if (props.loading) return <Skeleton.List rows={4} glyph twoLine style={props.style} />;
  return <ConversationBase {...props} />;
}
