#!/usr/bin/env node
// Bundles everything the MCP server serves into dist/data.json, so the
// published package needs no network access and no runtime dependencies:
//   - prop tables, parsed from each component's hand-written .d.ts
//   - the docs page text, with MDX tags removed
//   - the example source shown on the docs page
//
// The component list, the .d.ts parser and the docs readers are imported from
// the docs app's build scripts so there is one source for each.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPONENTS, componentEntry, componentsDir, parsePropsFromDts } from "../../../apps/docs/scripts/build-props.mjs";
import {
  docsUrl, mdxToText, readComponentPages, readTsxExamples, registryItemUrl, sentenceCase, siteUrl,
} from "../../../apps/docs/scripts/docs-content.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, "..", "dist", "data.json");

export function buildData() {
  const pages = readComponentPages();
  const examples = new Map(readTsxExamples().map((e) => [e.name, e]));
  const pageByComponent = new Map();
  for (const page of pages) for (const c of page.components) pageByComponent.set(c, page);

  const components = COMPONENTS.map((raw) => {
    const { name, file, iface } = componentEntry(raw);
    const dts = join(componentsDir, file);
    if (!existsSync(dts)) throw new Error(`missing .d.ts for ${name}: ${dts}`);
    const page = pageByComponent.get(name);
    if (!page) throw new Error(`no docs page has <PropsTable component="${name}" />`);

    // A page that documents several components (Layout, Avatar, CodeEditor)
    // keeps the examples that render this one; fall back to all of them.
    const pageExamples = page.previews
      .map((p) => ({ ...p, example: examples.get(p.name) }))
      .filter((p) => p.example);
    const own = pageExamples.filter((p) => new RegExp(`<${name}\\b`).test(p.example.source));
    const chosen = own.length ? own : pageExamples;

    return {
      name,
      page: page.slug,
      pageTitle: page.title,
      description: page.description,
      docsUrl: docsUrl(page.slug),
      import: `import { ${name} } from "@pix-ui/react";`,
      props: parsePropsFromDts(dts, iface),
      docs: mdxToText(page.body),
      examples: chosen.map((p) => ({
        name: p.name,
        title: p.title ? sentenceCase(p.title) : null,
        registryUrl: registryItemUrl(p.name),
        source: p.example.source,
      })),
    };
  });

  return { site: siteUrl, package: "@pix-ui/react", stylesheet: "@pix-ui/react/styles.css", components };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const data = buildData();
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(data));
  const examples = data.components.reduce((n, c) => n + c.examples.length, 0);
  console.log(`@pix-ui/mcp: data → ${data.components.length} components, ${examples} examples`);
}
