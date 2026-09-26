// Ship the hand-written component contracts (.d.ts) next to the bundle.
import { cpSync, readdirSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
const src = "src/components", out = "dist/components";
for (const dir of readdirSync(src)) {
  const d = join(src, dir);
  if (!statSync(d).isDirectory()) continue;
  for (const f of readdirSync(d)) if (f.endsWith(".d.ts")) { mkdirSync(join(out, dir), { recursive: true }); copyFileSync(join(d, f), join(out, dir, f)); }
}
cpSync("src/index.d.ts", "dist/index.d.ts");
console.log("@pix-ui/react: types copied");
