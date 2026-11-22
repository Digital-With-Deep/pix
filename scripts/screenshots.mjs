#!/usr/bin/env node
// Renders PNG screenshots of PIX component previews and block layouts from the
// static docs export, in light and dark, so they can be reviewed without
// running a browser locally.
//
//   pnpm build && pnpm --filter docs build      # produces apps/docs/out
//   pnpm exec playwright install chromium       # once per machine
//   node scripts/screenshots.mjs                # writes ./screenshots/*.png
//
// Options:
//   --out <dir>       output folder (default: screenshots)
//   --site <dir>      static export to serve (default: apps/docs/out)
//   --only <a,b>      only these component slugs or block slugs
//   --list            print the expected file names and exit (no browser)
//   --strict          exit 1 if any single capture fails
//
// Component pages: each <Preview> on a docs page renders a wrapper with
// `data-preview="<example name>"` and an inner `data-preview-pane` (the live
// example without the tab bar). The script screenshots each pane, named
//   <component>--<variant>--<theme>.png   e.g. approval-card--pending--light.png
// where <variant> is the example name without the component prefix.
// Dialog, Popover and Tooltip also get an `--open` shot with the overlay shown.
// Blocks: a full-page screenshot of /blocks/<slug>/, named
//   block--<slug>--<theme>.png
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// [docs page slug, optional list of example names to keep]
export const COMPONENTS = [
  ["approval-card"],
  ["tool-call"],
  ["conversation"],
  ["markdown"],
  ["ai-response", ["ai-response-streaming"]],
  ["plan-view"],
  ["inline-citation"],
  ["source-panel"],
  ["confidence-badge"],
  ["action-history"],
  ["autonomy-setting"],
  ["dialog"],
  ["popover"],
  ["tooltip"],
  ["toast"],
  ["text-field"],
  ["textarea"],
  ["checkbox"],
  ["card"],
];

// Overlay components: also capture the first preview with its overlay open.
const OPEN_SHOTS = { dialog: "click", popover: "click", tooltip: "focus" };

export const BLOCKS = ["copilot", "approvals", "research", "workspace", "relay", "lumen"];
export const THEMES = ["light", "dark"];
const WIDTH = 1600;
const HEIGHT = 1000;

function parseArgs(argv) {
  const opts = { out: "screenshots", site: "apps/docs/out", only: null, list: false, strict: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") opts.out = argv[++i];
    else if (a === "--site") opts.site = argv[++i];
    else if (a === "--only") opts.only = new Set(String(argv[++i] || "").split(",").map((s) => s.trim()).filter(Boolean));
    else if (a === "--list") opts.list = true;
    else if (a === "--strict") opts.strict = true;
    else if (a === "--help" || a === "-h") {
      console.log("usage: node scripts/screenshots.mjs [--out dir] [--site dir] [--only a,b] [--list] [--strict]");
      process.exit(0);
    } else throw new Error(`unknown option: ${a}`);
  }
  return opts;
}

export const variantOf = (slug, exampleName) =>
  exampleName.startsWith(`${slug}-`) ? exampleName.slice(slug.length + 1) : exampleName;
export const componentFile = (slug, variant, theme) => `${slug}--${variant}--${theme}.png`;
export const blockFile = (slug, theme) => `block--${slug}--${theme}.png`;

/** Example names previewed on a component's docs page, read from its MDX source. */
export function previewsInSource(slug) {
  const file = join(root, "apps", "docs", "content", "docs", "components", `${slug}.mdx`);
  if (!existsSync(file)) return [];
  const text = readFileSync(file, "utf8");
  return [...text.matchAll(/<Preview\b[^>]*?\bname=["']([^"']+)["']/g)].map((m) => m[1]);
}

/** Every file name a full run is expected to write, derived from the docs sources. */
export function expectedFiles(only = null) {
  const files = [];
  for (const [slug, keep] of COMPONENTS) {
    if (only && !only.has(slug)) continue;
    const names = previewsInSource(slug).filter((n) => !keep || keep.includes(n));
    for (const theme of THEMES) {
      for (const n of names) files.push(componentFile(slug, variantOf(slug, n), theme));
      if (OPEN_SHOTS[slug] && names.length) files.push(componentFile(slug, `${variantOf(slug, names[0])}--open`, theme));
    }
  }
  for (const slug of BLOCKS) {
    if (only && !only.has(slug)) continue;
    for (const theme of THEMES) files.push(blockFile(slug, theme));
  }
  return files;
}

// --- static server ----------------------------------------------------------

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
};

/** Serves a Next.js static export (trailingSlash: true) from `dir` on 127.0.0.1. */
export function serveStatic(dir) {
  const base = resolve(dir);
  const isFile = (p) => {
    try {
      return statSync(p).isFile();
    } catch {
      return false;
    }
  };
  const server = createServer((req, res) => {
    let path;
    try {
      path = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    const target = normalize(join(base, path));
    if (target !== base && !target.startsWith(base + sep)) {
      res.writeHead(403).end();
      return;
    }
    const candidates = path.endsWith("/")
      ? [join(target, "index.html")]
      : [target, `${target}.html`, join(target, "index.html")];
    const file = candidates.find(isFile);
    if (!file) {
      const notFound = join(base, "404.html");
      res.writeHead(404, { "content-type": TYPES[".html"] });
      if (isFile(notFound)) createReadStream(notFound).pipe(res);
      else res.end("not found");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[extname(file).toLowerCase()] || "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolveServer({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}

// --- capture ----------------------------------------------------------------

const settle = (page, ms) => page.waitForTimeout(ms);

/** Puts the docs into light or dark mode the way its theme switcher does. */
async function applyTheme(page, theme) {
  await page.evaluate((t) => {
    try {
      localStorage.setItem("theme", t);
    } catch {
      /* storage unavailable */
    }
    const el = document.documentElement;
    el.classList.toggle("dark", t === "dark");
    el.classList.toggle("light", t === "light");
    el.style.colorScheme = t;
  }, theme);
}

async function openPage(page, url, theme) {
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  if (!res || !res.ok()) throw new Error(`HTTP ${res ? res.status() : "no response"} for ${url}`);
  await applyTheme(page, theme);
  // Fonts, hydration and short demo animations (streaming text, countdowns).
  await page.evaluate(() => (document.fonts ? document.fonts.ready : null)).catch(() => {});
  await settle(page, 1500);
}

async function previewHandles(page) {
  let wrappers = await page.$$("[data-preview]");
  if (wrappers.length) return wrappers;
  // Fallback for docs built before Preview carried data-preview: the tab bar's parent.
  wrappers = await page.$$("xpath=//*[@role='tablist' and @aria-label='Preview and code']/..");
  return wrappers;
}

async function captureComponent(page, origin, slug, keep, theme, outDir, log) {
  const written = [];
  await openPage(page, `${origin}/docs/components/${slug}/`, theme);
  const wrappers = await previewHandles(page);
  if (!wrappers.length) throw new Error(`no previews found on /docs/components/${slug}/`);
  const shots = [];
  for (let i = 0; i < wrappers.length; i++) {
    const w = wrappers[i];
    const name = (await w.getAttribute("data-preview")) || `${slug}-${i + 1}`;
    if (keep && !keep.includes(name)) continue;
    const pane = (await w.$("[data-preview-pane]")) || w;
    shots.push({ name, pane });
  }
  for (const { name, pane } of shots) {
    const file = componentFile(slug, variantOf(slug, name), theme);
    try {
      await pane.scrollIntoViewIfNeeded();
      await settle(page, 150);
      await pane.screenshot({ path: join(outDir, file), animations: "disabled" });
      written.push(file);
    } catch (err) {
      log.push(`${file}: ${err.message.split("\n")[0]}`);
    }
  }
  const mode = OPEN_SHOTS[slug];
  if (mode && shots.length) {
    const { name, pane } = shots[0];
    const file = componentFile(slug, `${variantOf(slug, name)}--open`, theme);
    try {
      const trigger = await pane.$("button, [role='button'], a[href]");
      if (!trigger) throw new Error("no trigger in preview");
      await pane.scrollIntoViewIfNeeded();
      if (mode === "focus") {
        await trigger.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab"); // keyboard focus opens a Tooltip at once
      } else {
        await trigger.click();
      }
      await settle(page, 500);
      if (slug === "dialog") {
        await page.screenshot({ path: join(outDir, file), animations: "disabled" });
      } else {
        const box = await pane.boundingBox();
        const vp = page.viewportSize() || { width: WIDTH, height: HEIGHT };
        if (!box) throw new Error("preview has no box");
        const x = Math.max(0, box.x - 24);
        const y = Math.max(0, box.y - 24);
        const clip = { x, y, width: Math.min(vp.width - x, box.width + 48), height: Math.min(vp.height - y, box.height + 340) };
        await page.screenshot({ path: join(outDir, file), clip, animations: "disabled" });
      }
      written.push(file);
      await page.keyboard.press("Escape").catch(() => {});
    } catch (err) {
      log.push(`${file}: ${err.message.split("\n")[0]}`);
    }
  }
  return written;
}

async function captureBlock(page, origin, slug, theme, outDir) {
  const file = blockFile(slug, theme);
  await openPage(page, `${origin}/blocks/${slug}/`, theme);
  await settle(page, 1500); // let streamed demo text finish
  await page.screenshot({ path: join(outDir, file), fullPage: true, animations: "disabled" });
  return file;
}

function writeIndex(outDir, files, failures) {
  const lines = ["# PIX screenshots", "", "Generated by `scripts/screenshots.mjs` from the static docs build.", ""];
  const groups = new Map();
  for (const f of files) {
    const key = f.startsWith("block--") ? `Block: ${f.split("--")[1]}` : f.split("--")[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  }
  for (const [key, list] of groups) {
    lines.push(`## ${key}`, "");
    for (const f of list) lines.push(`**${f}**`, "", `![${f}](./${f})`, "");
  }
  if (failures.length) {
    lines.push("## Failed captures", "");
    for (const f of failures) lines.push(`- ${f}`);
    lines.push("");
  }
  writeFileSync(join(outDir, "README.md"), lines.join("\n"));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.list) {
    for (const f of expectedFiles(opts.only)) console.log(f);
    return;
  }

  const site = resolve(root, opts.site);
  if (!existsSync(join(site, "index.html"))) {
    throw new Error(`no static export at ${site}. Run \`pnpm build && pnpm --filter docs build\` first.`);
  }
  const outDir = resolve(root, opts.out);
  mkdirSync(outDir, { recursive: true });

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error("playwright is not installed. Run `pnpm install`, then `pnpm exec playwright install chromium`.");
  }

  const { server, origin } = await serveStatic(site);
  const browser = await chromium.launch();
  const written = [];
  const failures = [];
  try {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        deviceScaleFactor: 1,
        colorScheme: theme,
        reducedMotion: "reduce",
      });
      await context.addInitScript((t) => {
        try {
          localStorage.setItem("theme", t);
        } catch {
          /* storage unavailable */
        }
      }, theme);
      const page = await context.newPage();
      page.on("pageerror", (err) => console.warn(`[${theme}] page error: ${err.message.split("\n")[0]}`));

      for (const [slug, keep] of COMPONENTS) {
        if (opts.only && !opts.only.has(slug)) continue;
        try {
          const files = await captureComponent(page, origin, slug, keep, theme, outDir, failures);
          written.push(...files);
          console.log(`✓ ${slug} (${theme}): ${files.length} shots`);
        } catch (err) {
          failures.push(`${slug} (${theme}): ${err.message.split("\n")[0]}`);
          console.error(`✗ ${slug} (${theme}): ${err.message.split("\n")[0]}`);
        }
      }
      for (const slug of BLOCKS) {
        if (opts.only && !opts.only.has(slug)) continue;
        try {
          written.push(await captureBlock(page, origin, slug, theme, outDir));
          console.log(`✓ block ${slug} (${theme})`);
        } catch (err) {
          failures.push(`block ${slug} (${theme}): ${err.message.split("\n")[0]}`);
          console.error(`✗ block ${slug} (${theme}): ${err.message.split("\n")[0]}`);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  writeIndex(outDir, written, failures);
  console.log(`\n${written.length} screenshots in ${outDir}`);
  if (failures.length) {
    console.warn(`${failures.length} captures failed:\n  ${failures.join("\n  ")}`);
  }
  if (!written.length || (opts.strict && failures.length)) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`screenshots: ${err.message}`);
    process.exit(1);
  });
}
