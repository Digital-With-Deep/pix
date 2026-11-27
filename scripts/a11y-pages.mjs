#!/usr/bin/env node
// Page-level accessibility check: opens every component page of the static docs export in
// Chromium and fails when a live example (each `[data-preview-pane]`) has
//   - a form control or button with no accessible name, or
//   - an <img> with no alt attribute (alt="" is fine for a decorative image), or an element with
//     role="img" and no name.
//
//   pnpm build && pnpm --filter docs build      # produces apps/docs/out
//   pnpm exec playwright install chromium       # once per machine
//   node scripts/a11y-pages.mjs [--site apps/docs/out] [--only text-field,checkbox]
//
// Names come from Playwright's ARIA (Accessible Rich Internet Applications) snapshot, which
// computes them the way assistive technology does: <label>, aria-label, aria-labelledby, title,
// alt and text content. Uses only the `playwright` devDependency the screenshot workflow
// already installs.
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { serveStatic } from "./screenshots.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Images are checked on the DOM instead: an inline <svg> icon reads as an unnamed img here even when it is decorative.
const NAMED_ROLES = new Set(["button", "checkbox", "combobox", "listbox", "radio", "searchbox", "slider", "spinbutton", "switch", "textbox"]);

/** Lines of an ARIA snapshot whose role needs a name and has none, e.g. `- textbox` or `- button:`. */
export function unnamed(snapshot) {
  const out = [];
  for (const line of snapshot.split("\n")) {
    const m = /^\s*- ['"]?([a-z]+)(?= |:|$|['"])( \\?"(.*?)\\?")?/.exec(line);
    if (m && NAMED_ROLES.has(m[1]) && !(m[3] && m[3].trim())) out.push(line.trim());
  }
  return out;
}

function parseArgs(argv) {
  const opts = { site: "apps/docs/out", only: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--site") opts.site = argv[++i];
    else if (argv[i] === "--only") opts.only = new Set(String(argv[++i] || "").split(",").map((s) => s.trim()).filter(Boolean));
    else throw new Error(`unknown option: ${argv[i]}`);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const site = resolve(root, opts.site);
  if (!existsSync(join(site, "index.html"))) throw new Error(`no static export at ${site}. Run \`pnpm build && pnpm --filter docs build\` first.`);
  const slugs = readdirSync(join(root, "apps/docs/content/docs/components"))
    .filter((f) => f.endsWith(".mdx")).map((f) => f.slice(0, -4))
    .filter((s) => !opts.only || opts.only.has(s)).sort();

  const { chromium } = await import("playwright");
  const { server, origin } = await serveStatic(site);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 }, reducedMotion: "reduce" });
  const problems = [];
  let panes = 0;
  try {
    for (const slug of slugs) {
      const page = await context.newPage();
      try {
        const res = await page.goto(`${origin}/docs/components/${slug}/`, { waitUntil: "networkidle", timeout: 60_000 });
        if (!res || !res.ok()) { problems.push(`${slug}: HTTP ${res ? res.status() : "no response"}`); continue; }
        await page.waitForTimeout(500); // hydration
        const wrappers = page.locator("[data-preview]");
        const count = await wrappers.count();
        for (let i = 0; i < count; i++) {
          const wrapper = wrappers.nth(i);
          const name = (await wrapper.getAttribute("data-preview")) || `${slug}-${i + 1}`;
          const pane = wrapper.locator("[data-preview-pane]").first();
          if (!(await pane.count())) continue;
          panes++;
          for (const line of unnamed(await pane.ariaSnapshot())) problems.push(`${slug} / ${name}: no accessible name: ${line}`);
          const noAlt = await pane.locator('img:not([alt]), [role="img"]').evaluateAll((els) => els.filter((e) => {
            if (e.tagName === "IMG") return true;
            const by = (e.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join("");
            const title = e.querySelector(":scope > title")?.textContent || e.getAttribute("title") || "";
            return !(e.getAttribute("aria-label") || by || title).trim();
          }).map((e) => (e.tagName === "IMG" ? `<img src="${e.getAttribute("src") || ""}"> without alt` : `<${e.tagName.toLowerCase()} role="img"> without a name`)));
          for (const what of noAlt) problems.push(`${slug} / ${name}: ${what}`);
        }
      } catch (err) {
        problems.push(`${slug}: ${err.message.split("\n")[0]}`);
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (problems.length) {
    console.error(`✗ a11y: ${problems.length} problem(s) in ${panes} examples on ${slugs.length} component pages:\n   - ${problems.join("\n   - ")}`);
    process.exit(1);
  }
  console.log(`✓ a11y: ${panes} examples on ${slugs.length} component pages: every control and image has an accessible name`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(`a11y: ${err.message}`); process.exit(1); });
}
