// filter.js — pure filtering logic (no React), unit-tested.

export const ALL_LABEL = "All";

/**
 * Filter categories by active category + search query.
 * Returns a map category -> items (empty arrays for hidden categories).
 */
export function filterData(data, order, cat, query) {
  const q = (query || "").trim().toLowerCase();
  const out = {};
  for (const c of order) {
    const items = data[c] || [];
    if (cat !== ALL_LABEL && c !== cat) {
      out[c] = [];
      continue;
    }
    if (!q) {
      out[c] = items;
      continue;
    }
    out[c] = items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.url.toLowerCase().includes(q),
    );
  }
  return out;
}