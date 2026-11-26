// Token contrast test: computes WCAG (Web Content Accessibility Guidelines) 2.1 contrast ratios
// from the built token output (packages/tokens/dist/json/tokens.json) and fails when any pair
// falls below its threshold, in the light or the dark theme.
//
//   - text (success criterion 1.4.3, 4.5:1): body text (fg1) and secondary text (fg2) on every surface
//   - non-text (success criterion 1.4.11, 3:1): the field border at rest and on hover, the invalid
//     field border and the focus ring on every surface
//
// Pure JavaScript, no dependencies. Run `pnpm build` first; `pnpm test` runs this script.
import { readFileSync } from "node:fs";

const SURFACES = ["bg", "bg-subtle", "bg-muted", "surface", "surface-alt"];
const CHECKS = [
  { token: "fg1", role: "body text", min: 4.5 },
  { token: "fg2", role: "secondary text", min: 4.5 },
  { token: "border-field", role: "field border", min: 3 },
  { token: "border-field-hover", role: "field border on hover", min: 3 },
  { token: "danger", role: "invalid field border", min: 3 },
  { token: "focus-ring", role: "focus ring", min: 3 },
];
// States that must stay visibly different from the resting field border.
const DISTINCT = [["border-field", "border-field-hover"], ["border-field", "focus-ring"], ["border-field", "danger"], ["border-field", "border-strong"]];

/** Parses #rgb, #rrggbb, #rrggbbaa and rgb()/rgba() into 0-255 channels plus alpha. */
export function parseColor(v) {
  let m = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  throw new Error(`unsupported colour ${v}`);
}

/** Relative luminance, as defined by WCAG 2.1. */
export function luminance({ r, g, b }) {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Contrast ratio between two opaque colours, 1 to 21. A translucent foreground is composited over the background first. */
export function contrast(fg, bg) {
  const b = parseColor(bg), f = parseColor(fg);
  if (b.a < 1) throw new Error(`surface ${bg} is translucent; contrast needs an opaque background`);
  const mix = (x, y) => x * f.a + y * (1 - f.a);
  const top = { r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b) };
  const [hi, lo] = [luminance(top), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/** Every pair below its threshold, plus states that collapse into the resting border. */
export function auditTokens(color) {
  const failures = [], rows = [];
  for (const theme of Object.keys(color)) {
    const c = color[theme];
    const missing = [...new Set([...CHECKS.map((k) => k.token), ...SURFACES])].filter((t) => !c[t]);
    for (const t of missing) failures.push(`${theme}: token ${t} is missing from the build`);
    for (const { token, role, min } of CHECKS) {
      for (const surface of SURFACES) {
        if (!c[token] || !c[surface]) continue;
        const ratio = contrast(c[token], c[surface]);
        rows.push({ theme, token, surface, ratio, min });
        // Compare at two decimals, the precision WCAG tools report.
        if (Math.floor(ratio * 100) / 100 < min) {
          failures.push(`${theme}: ${role} ${token} (${c[token]}) on ${surface} (${c[surface]}) is ${ratio.toFixed(2)}:1, needs ${min}:1`);
        }
      }
    }
    for (const [a, b] of DISTINCT) {
      if (c[a] && c[b] && c[a].toLowerCase() === c[b].toLowerCase()) failures.push(`${theme}: ${b} is the same colour as ${a} (${c[a]}), so the state is not visible`);
    }
  }
  return { failures, rows };
}

const isMain = import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const file = new URL("../packages/tokens/dist/json/tokens.json", import.meta.url);
  let built;
  try { built = JSON.parse(readFileSync(file, "utf8")); }
  catch (e) { console.error(`✗ contrast: cannot read ${file.pathname} (${e.message}); run pnpm build first`); process.exit(1); }
  // Guard the arithmetic with the reference values: black on white is 21:1, #777 on white is 4.48:1.
  if (contrast("#000", "#fff") !== 21 || contrast("#777777", "#ffffff").toFixed(2) !== "4.48") {
    console.error("✗ contrast: the ratio formula disagrees with WCAG reference values"); process.exit(1);
  }
  const { failures, rows } = auditTokens(built.color);
  const lowest = (pred) => rows.filter(pred).reduce((m, r) => (r.ratio < m.ratio ? r : m), { ratio: Infinity });
  for (const theme of Object.keys(built.color)) {
    for (const { token, role, min } of CHECKS) {
      const lo = lowest((r) => r.theme === theme && r.token === token);
      if (lo.ratio !== Infinity) console.log(`  ${theme.padEnd(5)} ${role.padEnd(22)} lowest ${lo.ratio.toFixed(2)}:1 on ${lo.surface} (needs ${min}:1)`);
    }
  }
  if (failures.length) {
    console.error(`✗ contrast: ${failures.length} pair(s) below the WCAG 2.1 threshold:\n   - ${failures.join("\n   - ")}`);
    process.exit(1);
  }
  console.log(`✓ contrast: ${rows.length} token pairs meet WCAG 2.1 (text 4.5:1, field borders and focus ring 3:1) in ${Object.keys(built.color).join(" and ")}`);
}
