import { test } from "node:test";
import assert from "node:assert/strict";
import { findDanglingRefs } from "./check-refs.mjs";

test("flags a Preview name absent from the registry", () => {
  const bad = findDanglingRefs(
    [{ file: "a.mdx", text: '<Preview name="ghost-demo" />' }],
    new Set(["button-variants"]),
    new Set(["Button"]),
  );
  assert.deepEqual(bad, ["a.mdx: unknown preview \"ghost-demo\""]);
});

test("flags a PropsTable component absent from props.json", () => {
  const bad = findDanglingRefs(
    [{ file: "b.mdx", text: '<PropsTable component="Nope" />' }],
    new Set(),
    new Set(["Button"]),
  );
  assert.deepEqual(bad, ['b.mdx: unknown component "Nope"']);
});

test("passes when every reference resolves", () => {
  const ok = findDanglingRefs(
    [{ file: "c.mdx", text: '<Preview name="button-variants" /><PropsTable component="Button" />' }],
    new Set(["button-variants"]),
    new Set(["Button"]),
  );
  assert.deepEqual(ok, []);
});
