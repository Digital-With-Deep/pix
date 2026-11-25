// Write the PIX catalog as a standalone catalog.json (for agents and validators) and ship the hand-written types.
import { writeFileSync, copyFileSync } from "node:fs";
import { pixCatalog } from "../src/catalog.js";
writeFileSync("dist/catalog.json", JSON.stringify(pixCatalog, null, 2) + "\n");
copyFileSync("src/index.d.ts", "dist/index.d.ts");
console.log("@pix-ui/a2ui: catalog.json and types written");
