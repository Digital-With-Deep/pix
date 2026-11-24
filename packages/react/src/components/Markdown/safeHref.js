// Allow only link schemes that cannot run script: http, https, mailto, and same-site paths or anchors.
// Anything else (javascript:, data:, vbscript:, ...) returns null so the caller renders plain text.
export function safeHref(href) {
  const h = String(href || "").trim();
  if (/^(https?:|mailto:)/i.test(h) || (h.startsWith("/") && !h.startsWith("//")) || h.startsWith("#")) return h;
  return null;
}
