// Concatenate tokens + base + components into dist/pix.css, and ship the parts.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const tokens = readFileSync(require.resolve("@pix-ui/tokens/css"), "utf8");
const base = readFileSync("src/base.css", "utf8");
const comps = readFileSync("src/components.css", "utf8");
mkdirSync("dist", { recursive: true });
const head = "/*! PIX — Primitives for Intelligent eXperiences · @pix-ui/css · MIT */\n";
writeFileSync("dist/pix.css", head + tokens + "\n" + base + "\n" + comps);
copyFileSync("src/base.css", "dist/base.css");
copyFileSync("src/components.css", "dist/components.css");
console.log("@pix-ui/css: dist/pix.css (tokens + base + components)");
