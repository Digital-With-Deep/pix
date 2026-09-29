import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveEntry } from "./preview-resolve.mjs";

test("resolveEntry returns the entry for a known name", () => {
  const reg = { "button-variants": { name: "button-variants", lang: "tsx", source: "x" } };
  assert.equal(resolveEntry(reg, "button-variants").lang, "tsx");
});

test("resolveEntry throws on an unknown name (no silent empty render)", () => {
  assert.throws(() => resolveEntry({}, "nope"), /unknown preview: nope/);
});
