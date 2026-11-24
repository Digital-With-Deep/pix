// Shared readers for the docs content, used by build-shadcn-registry.mjs and by
// the @pix-ui/mcp data build. Zero dependencies beyond Node, so other packages
// can import it without pulling in the docs app's toolchain.
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const docsRoot = join(here, "..");
export const examplesDir = join(docsRoot, "registry", "examples");
export const componentPagesDir = join(docsRoot, "content", "docs", "components");
export const siteUrl = "https://pixui.digitalwithdeep.com";

/** Splits `---\nkey: value\n---` frontmatter from an mdx body. Values are single-line strings. */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    data[kv[1]] = v;
  }
  return { data, body: text.slice(m[0].length) };
}

const attr = (tag, name) => new RegExp(`\\b${name}=["']([^"']*)["']`).exec(tag)?.[1] ?? null;

/** `<Preview title="…" name="…" />` references in document order. */
export function findPreviews(body) {
  return [...body.matchAll(/<Preview\b[^>]*\/?>/g)].map((m) => ({ name: attr(m[0], "name"), title: attr(m[0], "title") })).filter((p) => p.name);
}

/** `<PropsTable component="…" />` references in document order. */
export function findPropsTables(body) {
  return [...body.matchAll(/<PropsTable\b[^>]*\/?>/g)].map((m) => attr(m[0], "component")).filter(Boolean);
}

/**
 * Turns an mdx body into plain markdown: drops import/export lines and
 * replaces each Preview and PropsTable tag with a one-line pointer to the
 * example or props table it stood for. Fenced code blocks are left untouched.
 */
export function mdxToText(body) {
  const out = [];
  let fence = null;
  for (const line of body.split(/\r?\n/)) {
    const f = /^\s*(```+|~~~+)/.exec(line);
    if (fence) {
      out.push(line);
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length) fence = null;
      continue;
    }
    if (f) { fence = f[1]; out.push(line); continue; }
    if (/^\s*(import|export)\s/.test(line)) continue;
    if (/^\s*<PropsTable\b[^>]*\/>\s*$/.test(line)) {
      const component = attr(line, "component");
      if (component) out.push(`Props for \`${component}\` are listed in its props table.`);
      continue;
    }
    const preview = /^\s*<Preview\b[^>]*\/>\s*$/.exec(line);
    if (preview) {
      const name = attr(line, "name");
      const title = attr(line, "title");
      out.push(`Example \`${name}\`${title ? ` (${sentenceCase(title)})` : ""}.`);
      continue;
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** "WITH ICON" → "with icon"; leaves mixed-case text alone. */
export function sentenceCase(s) {
  return s === s.toUpperCase() ? s.toLowerCase() : s;
}

/** Every component page: slug, frontmatter, previews and prop tables. */
export function readComponentPages(dir = componentPagesDir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .sort()
    .map((f) => {
      const { data, body } = parseFrontmatter(readFileSync(join(dir, f), "utf8"));
      return {
        slug: basename(f, ".mdx"),
        title: data.title ?? basename(f, ".mdx"),
        description: data.description ?? "",
        body,
        previews: findPreviews(body),
        components: findPropsTables(body),
      };
    });
}

/** React examples (`*.tsx`) only; the html/Angular `*.css.ts` examples are skipped. */
export function readTsxExamples(dir = examplesDir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .sort()
    .map((f) => ({ name: basename(f, ".tsx"), file: f, source: readFileSync(join(dir, f), "utf8") }));
}

export const docsUrl = (slug) => `${siteUrl}/docs/components/${slug}/`;
export const registryItemUrl = (name) => `${siteUrl}/r/${name}.json`;
