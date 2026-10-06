#!/usr/bin/env node
// NOTE: the app's "typescript" devDependency is pinned to the v7 native
// rewrite, whose package no longer exposes the classic compiler API
// (ts.createSourceFile, ts.isInterfaceDeclaration, etc.) from its main
// entry point. This parser needs that classic API, so it imports a
// second, aliased devDependency ("typescript-classic") pinned to a 5.x
// release instead of touching the app's primary "typescript" version.
import ts from "typescript-classic";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "..", "..", "packages", "react", "src", "components");
const outDir = join(here, "..", "registry", "__generated__");

// The curated 10 (Global Constraints); expand later.
const COMPONENTS = ["Button", "Badge", "Callout", "Alert", "Tabs", "Select", "DataTable", "MetricCard", "AIResponse", "PromptInput"];

export function parsePropsFromDts(file, interfaceName) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  let rows = null;
  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
      rows = node.members.filter(ts.isPropertySignature).map((m) => {
        const name = m.name.getText(source);
        const required = !m.questionToken;
        const type = m.type ? m.type.getText(source) : "unknown";
        const jsdoc = ts.getJSDocCommentsAndTags(m)[0];
        const description = jsdoc && typeof jsdoc.comment === "string" ? jsdoc.comment.trim() : null;
        const defTag = ts.getAllJSDocTags(m, (t) => t.tagName?.getText(source) === "default")[0];
        const def = defTag && typeof defTag.comment === "string" ? defTag.comment.trim() : null;
        return { name, type, required, default: def, description };
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!rows) throw new Error(`interface ${interfaceName} not found in ${file}`);
  return rows;
}

function propsInterfaceFor(name) {
  return `${name}Props`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = {};
  for (const name of COMPONENTS) {
    const dts = join(componentsDir, name, `${name}.d.ts`);
    if (!existsSync(dts)) throw new Error(`missing .d.ts for ${name}: ${dts}`);
    out[name] = parsePropsFromDts(dts, propsInterfaceFor(name));
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "props.json"), JSON.stringify(out, null, 2));
  console.log(`@pix-ui/docs: props → ${COMPONENTS.length} components`);
}
