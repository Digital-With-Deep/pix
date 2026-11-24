import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRegistry, withClientDirective, ITEM_SCHEMA, REGISTRY_SCHEMA } from "./build-shadcn-registry.mjs";
import { mdxToText, parseFrontmatter, findPreviews, readComponentPages, readTsxExamples } from "./docs-content.mjs";

const page = {
  slug: "button",
  title: "Button",
  description: "Trigger an action.",
  previews: [{ name: "button-variants", title: "WITH ICON" }],
  components: ["Button"],
};
const example = { name: "button-variants", file: "button-variants.tsx", source: 'import { Button } from "@pix-ui/react";\n' };

test("a registry item is one example file plus a dependency on @pix-ui/react", () => {
  const { items } = buildRegistry([example], [page]);
  const [item] = items;
  assert.equal(item.$schema, ITEM_SCHEMA);
  assert.equal(item.type, "registry:block");
  assert.equal(item.title, "Button: with icon");
  assert.equal(item.description, "Trigger an action.");
  assert.deepEqual(item.dependencies, ["@pix-ui/react"]);
  assert.deepEqual(item.files, [
    { path: "registry/examples/button-variants.tsx", type: "registry:component", content: example.source, target: "components/pix/button-variants.tsx" },
  ]);
});

test("the registry index lists items without file content", () => {
  const { index } = buildRegistry([example], [page]);
  assert.equal(index.$schema, REGISTRY_SCHEMA);
  assert.equal(index.name, "pix");
  assert.equal(index.homepage, "https://pixui.digitalwithdeep.com");
  assert.equal(index.items[0].$schema, undefined);
  assert.equal(index.items[0].files[0].content, undefined);
  assert.equal(index.items[0].files[0].target, "components/pix/button-variants.tsx");
});

test("duplicate names and a name that would overwrite registry.json are rejected", () => {
  assert.throws(() => buildRegistry([example, example], [page]), /duplicate/);
  assert.throws(() => buildRegistry([{ ...example, name: "registry" }], []), /registry\.json/);
});

test("examples that use hooks get the client directive once", () => {
  const src = 'import * as React from "react";\nconst [v] = React.useState(1);\n';
  assert.match(withClientDirective(src), /^"use client";\n\n/);
  assert.equal(withClientDirective(withClientDirective(src)), withClientDirective(src));
  assert.equal(withClientDirective(example.source), example.source);
});

test("every tsx example in the repo maps to a component page", () => {
  const { items } = buildRegistry(readTsxExamples(), readComponentPages());
  assert.ok(items.length > 100);
  for (const item of items) assert.ok(item.categories?.length, `${item.name} has no docs page`);
});

test("mdx frontmatter and tags are parsed and stripped", () => {
  const { data, body } = parseFrontmatter("---\ntitle: Button\ndescription: Trigger an action.\n---\n\nText.\n");
  assert.deepEqual(data, { title: "Button", description: "Trigger an action." });
  const mdx = 'import X from "y";\n\nIntro.\n\n<Preview title="SIZES" name="button-sizes" />\n\n```tsx\n<Preview name="kept-in-code" />\n```\n\n<PropsTable component="Button" />\n';
  assert.deepEqual(findPreviews(mdx).map((p) => p.name), ["button-sizes", "kept-in-code"]);
  const text = mdxToText(mdx);
  assert.doesNotMatch(text, /^import/m);
  assert.match(text, /Example `button-sizes` \(sizes\)\./);
  assert.match(text, /<Preview name="kept-in-code" \/>/);
  assert.match(text, /Props for `Button` are listed in its props table\./);
  assert.equal(body.trim(), "Text.");
});
