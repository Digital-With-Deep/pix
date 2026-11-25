import { defineConfig } from "tsup";

// Plain ESM, no dependencies to bundle. Types are hand-written in src/index.d.ts and copied by the build script.
export default defineConfig({
  entry: { index: "src/index.js" },
  format: ["esm"],
  target: "es2019",
  sourcemap: true,
  clean: true,
});
