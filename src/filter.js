// filter.js — pure filtering logic (no React), unit-tested.

export const ALL_LABEL = "All";

/** Lowercased search terms; every term must match (AND). */
export function terms(query) {
  return (query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Filter categories by active category, optional group, and search query.
 * The query matches name, url, note, group, and category name.
 * Returns a map category -> items (empty arrays for hidden categories).
 */
export function filterData(data, order, cat, query, group = null) {
  const ts = terms(query);
  const out = {};
  for (const c of order) {
    let items = data[c] || [];
    if (cat !== ALL_LABEL && c !== cat) {
      out[c] = [];
      continue;
    }
    if (group && cat !== ALL_LABEL) {
      items = items.filter((it) => (it.group || "General") === group);
    }
    if (ts.length) {
      items = items.filter((it) => {
        const hay = `${it.name} ${it.url} ${it.note || ""} ${it.group || ""} ${c}`.toLowerCase();
        return ts.every((t) => hay.includes(t));
      });
    }
    out[c] = items;
  }
  return out;
}
