import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveProps } from "./props-resolve.mjs";

test("resolveProps returns rows for a known component", () => {
  const data = { Button: [{ name: "variant", type: "string", required: false, default: null, description: null }] };
  assert.equal(resolveProps(data, "Button").length, 1);
});

test("resolveProps throws on unknown component", () => {
  assert.throws(() => resolveProps({}, "Nope"), /unknown component: Nope/);
});
