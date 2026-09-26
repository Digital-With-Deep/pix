import { defineConfig } from "tsup";

const jsx = (o) => { o.jsx = "transform"; o.jsxFactory = "React.createElement"; o.jsxFragment = "React.Fragment"; };
const common = { loader: { ".jsx": "jsx", ".js": "jsx" }, target: "es2019" };

// Map `import * as React from "react"` to the page's global React for the <script> build.
const reactGlobal = {
  name: "react-global",
  setup(b) {
    b.onResolve({ filter: /^react(-dom)?$/ }, (a) => ({ path: a.path, namespace: "react-global" }));
    b.onLoad({ filter: /.*/, namespace: "react-global" }, (a) => ({ contents: `module.exports = window.${a.path === "react" ? "React" : "ReactDOM"};`, loader: "js" }));
  },
};

export default defineConfig([
  {
    ...common,
    entry: { index: "src/index.js" },
    format: ["esm", "cjs"],
    outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
    esbuildOptions: jsx,
    external: ["react", "react-dom"],
    banner: { js: '"use client";' },
    sourcemap: true,
    clean: true,
  },
  {
    ...common,
    entry: { "pix.global": "src/index.js" },
    format: ["iife"],
    globalName: "PIX",
    minify: true,
    outExtension: () => ({ js: ".js" }),
    esbuildOptions: jsx,
    esbuildPlugins: [reactGlobal],
    noExternal: [/.*/],
  },
]);
