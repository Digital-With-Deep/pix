import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.js" },
  format: ["esm"],
  target: "es2019",
  external: ["react", "@pix-ui/react"],
  banner: { js: '"use client";' },
  sourcemap: true,
  clean: true,
});
