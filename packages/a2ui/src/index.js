// @pix-ui/a2ui: render A2UI (Agent-to-User Interface) v1.0 surfaces with PIX components.
export { A2UI_VERSION, PIX_CATALOG_ID, pixCatalog } from "./catalog.js";
export { createA2UIProcessor, getAtPointer, setAtPointer, parsePointer } from "./processor.js";
export { resolveValue, formatString, toBool, toText, pixFunctions } from "./expressions.js";
export { pixComponents, pixCatalogImplementation, defineCatalog, safeHref, safeImageSrc } from "./components.js";
export { A2UISurface, renderA2UISurface } from "./surface.js";
export { rendererCapabilities } from "./capabilities.js";
