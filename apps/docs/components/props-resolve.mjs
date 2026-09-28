export function resolveProps(data, component) {
  const rows = data[component];
  if (!rows) throw new Error(`unknown component: ${component}`);
  return rows;
}
