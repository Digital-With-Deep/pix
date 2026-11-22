import { A2UI_VERSION, PIX_CATALOG_ID, pixCatalog } from "./catalog.js";

/**
 * The a2uiRendererCapabilities object to send to the agent in transport metadata. Add `inline: true` to include the
 * PIX catalog definition itself, for agents that declare acceptsInlineCatalogs.
 */
export function rendererCapabilities({ catalogIds = [PIX_CATALOG_ID], inline = false } = {}) {
  const caps = { supportedCatalogIds: [...catalogIds] };
  if (inline) caps.inlineCatalogs = [pixCatalog];
  return { [A2UI_VERSION]: caps };
}
