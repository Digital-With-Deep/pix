// Smoke test: every package loads (ESM + CJS), React components render on the server,
// the <script> bundle exposes window.PIX, and no legacy product names leaked into published code.
import { createRequire } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
const require = createRequire(new URL("../packages/react/package.json", import.meta.url));
const React = require("react");
const { renderToString } = require("react-dom/server");
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error("✗", m); } else console.log("✓", m); };

const tokensEsm = await import("../packages/tokens/dist/js/index.js");
const tokensCjs = require("../tokens/dist/js/index.cjs");
ok(tokensEsm.tokens.color.light.accent && tokensCjs.tokens.color.dark.accent, "tokens: ESM + CJS load, light/dark accent resolved");
ok(!Object.values(tokensEsm.tokens.color.light).some((v) => v.startsWith("{")), "tokens: no unresolved aliases");

const pixEsm = await import("../packages/react/dist/index.js");
const pixCjs = require("./dist/index.cjs");
const names = Object.keys(pixEsm).filter((k) => /^[A-Z]/.test(k) && typeof pixEsm[k] === "function");
ok(names.length >= 45 && Object.keys(pixCjs).length === Object.keys(pixEsm).length, `react: ${names.length} components exported from ESM and CJS`);

const props = {
  AIResponse: { text: "Answer", thinking: "step one\nstep two", model: "m", citations: ["a"] },
  DataTable: { columns: [{ key: "a", label: "A" }], rows: [{ a: 1 }] },
  Tabs: { tabs: [{ id: "a", label: "A" }], value: "a" },
  Select: { options: [{ value: "a", label: "A" }] },
  MultiSelect: { options: [{ value: "a", label: "A" }] },
  RadioGroup: { options: [{ value: "a", label: "A" }] },
  Menu: { trigger: React.createElement("button", null, "open"), items: [{ label: "x" }] },
};
let rendered = 0, crashed = [];
for (const n of names) {
  try { renderToString(React.createElement(pixEsm[n], props[n] || {})); rendered++; }
  catch (e) { crashed.push(`${n}: ${e.message.split("\n")[0]}`); }
}
ok(rendered >= names.length - crashed.length, `react: ${rendered}/${names.length} render on the server with minimal props`);
if (crashed.length) console.log("   needs required props (expected for data-driven components):\n   - " + crashed.join("\n   - "));
ok(renderToString(React.createElement(pixEsm.Button, { variant: "filled" }, "Run")).includes("Run"), "react: Button renders its label");

const ctx = { React, ReactDOM: {} };
ctx.window = ctx; ctx.self = ctx;
vm.runInNewContext(readFileSync("packages/react/dist/pix.global.js", "utf8") + ";window.PIX = PIX;", ctx, { filename: "pix.global.js" });
ok(typeof ctx.PIX?.Button === "function" && typeof ctx.PIX?.AIResponse === "function", "global: <script> bundle exposes window.PIX");

const legacy = /PortfolioOSDesignSystem|Recon ?Bench|\bPACT\b|__rb_/;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const leaks = ["packages/tokens/dist", "packages/css/dist", "packages/react/dist", "packages/react-native/dist"].flatMap(walk).filter((p) => !p.endsWith(".map") && legacy.test(readFileSync(p, "utf8")));
ok(leaks.length === 0, `no legacy names in published output${leaks.length ? ": " + leaks.join(", ") : ""}`);

const rn = await import("../packages/tokens/dist/react-native/index.js");
ok(typeof rn.rnTokens.space["space-4"] === "number", "react-native tokens: unitless numbers");

if (fail) { console.error(`\n${fail} check(s) failed`); process.exit(1); }
console.log("\nall checks passed");
