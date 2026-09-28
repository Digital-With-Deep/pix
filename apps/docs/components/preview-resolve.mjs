export function resolveEntry(registry, name) {
  const entry = registry[name];
  if (!entry) throw new Error(`unknown preview: ${name}`);
  return entry;
}
