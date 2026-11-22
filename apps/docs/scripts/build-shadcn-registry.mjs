#!/usr/bin/env node
// Builds a shadcn-compatible registry into public/r so that
//   npx shadcn add https://pixui.digitalwithdeep.com/r/<example>.json
// installs @pix-ui/react and drops a working example into the project.
//
// PIX ships as a package whose components import each other, so the registry
// never copies component source: each item is one example file plus a
// dependency on @pix-ui/react. The output is generated (gitignored) and served
// as static files by the docs export.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { docsRoot, readComponentPages, readTsxExamples, sentenceCase, siteUrl } from "./docs-content.mjs";

export const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
export const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

const INSTALL_NOTE =
  'Import the PIX stylesheet once at your app root: `import "@pix-ui/react/styles.css";`. ' +
  "Set `data-theme=\"dark\"` on `<html>` for dark mode.";

// Examples that call React hooks need the client directive under the Next.js
// App Router; it is ignored by other bundlers.
const usesHooks = (src) => /\bReact\.use[A-Z]\w*\(|\buse(State|Effect|Ref|Memo|Callback|Reducer|Id)\(/.test(src);

export function withClientDirective(src) {
  if (!usesHooks(src) || /^\s*["']use client["']/.test(src)) return src;
  return `"use client";\n\n${src}`;
}

/** Maps each example name to the component page that previews it. */
export function indexPagesByExample(pages) {
  const byExample = new Map();
  for (const page of pages) {
    for (const p of page.previews) if (!byExample.has(p.name)) byExample.set(p.name, { page, preview: p });
  }
  return byExample;
}

export function buildRegistryItem(example, ref) {
  const { page, preview } = ref ?? {};
  const variant = preview?.title ? sentenceCase(preview.title) : example.name.replace(page ? `${page.slug}-` : "", "").replace(/-/g, " ");
  const title = page ? `${page.title}: ${variant}` : example.name.replace(/-/g, " ");
  const description = page?.description || `PIX example ${example.name}.`;
  return {
    $schema: ITEM_SCHEMA,
    name: example.name,
    type: "registry:block",
    title,
    description,
    dependencies: ["@pix-ui/react"],
    ...(page ? { categories: [page.slug] } : {}),
    docs: INSTALL_NOTE,
    files: [
      {
        path: `registry/examples/${example.file}`,
        type: "registry:component",
        content: withClientDirective(example.source),
        target: `components/pix/${example.name}.tsx`,
      },
    ],
  };
}

export function buildRegistry(examples, pages) {
  const byExample = indexPagesByExample(pages);
  const seen = new Set();
  const items = examples.map((e) => {
    if (seen.has(e.name)) throw new Error(`duplicate registry item: ${e.name}`);
    if (e.name === "registry") throw new Error("an example named \"registry\" would overwrite registry.json");
    seen.add(e.name);
    return buildRegistryItem(e, byExample.get(e.name));
  });
  const index = {
    $schema: REGISTRY_SCHEMA,
    name: "pix",
    homepage: siteUrl,
    items: items.map(({ $schema, files, ...rest }) => ({
      ...rest,
      files: files.map(({ content, ...f }) => f),
    })),
  };
  return { items, index };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = join(docsRoot, "public", "r");
  const { items, index } = buildRegistry(readTsxExamples(), readComponentPages());
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  for (const item of items) writeFileSync(join(outDir, `${item.name}.json`), JSON.stringify(item, null, 2) + "\n");
  writeFileSync(join(outDir, "registry.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`@pix-ui/docs: shadcn registry → ${items.length} items in public/r`);
}
