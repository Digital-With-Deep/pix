import { readFileSync } from "node:fs";
export const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"));
export const summary = (state) => state.messages.map((m) => m.kind === "text" ? `${m.kind}:${m.role}:${m.streaming ? "streaming" : "done"}` : `${m.kind}:${m.props.status}`);
