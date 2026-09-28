import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePropsFromDts } from "./build-props.mjs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const rows = parsePropsFromDts(join(here, "__fixtures__", "Sample.d.ts"), "SampleProps");

test("optional prop is not required and captures union type", () => {
  const variant = rows.find((r) => r.name === "variant");
  assert.equal(variant.required, false);
  assert.equal(variant.type, `"filled" | "outline" | "ghost"`);
  assert.equal(variant.description, "Visual variant.");
});

test("required prop is marked required", () => {
  const label = rows.find((r) => r.name === "label");
  assert.equal(label.required, true);
  assert.equal(label.type, "string");
});

test("@default JSDoc tag is captured on an optional union prop", () => {
  const size = rows.find((r) => r.name === "size");
  assert.equal(size.required, false);
  assert.equal(size.type, `"sm" | "md" | "lg"`);
  assert.equal(size.default, `"md"`);
});
