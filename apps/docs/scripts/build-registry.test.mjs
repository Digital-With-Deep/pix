import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRegistrySource, collectExamples } from "./build-registry.mjs";

test("collects tsx and css examples with unique keys", () => {
  const entries = collectExamples();
  const byName = new Map(entries.map((e) => [e.name, e]));
  assert.ok(byName.has("button-variants"), "tsx example present");
  assert.ok(byName.has("callout-truth"), "css example present");
  assert.equal(byName.get("button-variants").lang, "tsx");
  assert.equal(byName.get("callout-truth").lang, "html");
});

test("tsx source is the raw file text", () => {
  const entries = collectExamples();
  const btn = entries.find((e) => e.name === "button-variants");
  assert.match(btn.source, /import \{ Button \} from "@pix-ui\/react"/);
});

test("duplicate names fail loudly", () => {
  assert.throws(
    () => buildRegistrySource([
      { name: "dup", lang: "tsx", importPath: "a", source: "x" },
      { name: "dup", lang: "tsx", importPath: "b", source: "y" },
    ]),
    /duplicate registry name: dup/,
  );
});
