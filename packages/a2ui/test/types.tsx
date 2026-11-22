// Type-level checks for the hand-written contract in src/index.d.ts (run by `pnpm typecheck`).
import * as React from "react";
import { A2UISurface, PIX_CATALOG_ID, createA2UIProcessor, defineCatalog, pixCatalogImplementation, rendererCapabilities, type A2UIAgentMessage, type A2UIActionMessage } from "../src/index";

const messages: A2UIAgentMessage[] = [
  { version: "1.0", createSurface: { surfaceId: "main", catalogId: PIX_CATALOG_ID, components: [{ id: "root", component: "Text", text: { "@path": "/title" } }], dataModel: { title: "Weekly summary" } } },
  { version: "1.0", updateDataModel: { surfaceId: "main", path: "/title", value: "Weekly summary, updated" } },
];
const send = (m: A2UIActionMessage) => void m.action.context;
export const Demo = () => <A2UISurface messages={messages} onAction={(m, meta) => { send(m); void meta?.a2uiRendererDataModel.surfaces; }} onError={(e) => void e.error.code} />;

const extra = defineCatalog("https://example.com/catalogs/notes/v1/catalog.json", { Note: (ctx) => <p>{String(ctx.get("text"))}</p> });
export const Mixed = () => <A2UISurface messages={messages} catalogs={[pixCatalogImplementation, extra]} surfaceId="main" />;

const processor = createA2UIProcessor({ catalogIds: [PIX_CATALOG_ID] });
processor.process(messages);
export const Live = () => <A2UISurface processor={processor} />;
const caps: string[] = rendererCapabilities()["1.0"].supportedCatalogIds;
void caps;
