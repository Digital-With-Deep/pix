#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function findDanglingRefs(files, previewNames, componentNames) {
  const errors = [];
  for (const { file, text } of files) {
    for (const m of text.matchAll(/<Preview\s+name=["']([^"']+)["']/g)) {
      if (!previewNames.has(m[1])) errors.push(`${file}: unknown preview "${m[1]}"`);
    }
    for (const m of text.matchAll(/<PropsTable\s+component=["']([^"']+)["']/g)) {
      if (!componentNames.has(m[1])) errors.push(`${file}: unknown component "${m[1]}"`);
    }
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "..");
  const previewNames = new Set(JSON.parse(readFileSync(join(root, "registry", "__generated__", "names.json"), "utf8")));
  const props = JSON.parse(readFileSync(join(root, "registry", "__generated__", "props.json"), "utf8"));
  const componentNames = new Set(Object.keys(props));
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".mdx") ? [p] : []; });
  const files = walk(join(root, "content", "docs")).map((f) => ({ file: f, text: readFileSync(f, "utf8") }));
  const errors = findDanglingRefs(files, previewNames, componentNames);
  if (errors.length) { console.error("Dangling references:\n" + errors.join("\n")); process.exit(1); }
  console.log(`@pix-ui/docs: refs OK (${files.length} mdx files)`);
}
