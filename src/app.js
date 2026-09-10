// design.ghuf.app — vanilla render + search + theme. data lives in data.json.
(() => {
  const DATA = window.DESIGN_DATA;

  // ---- theme ----
  const root = document.documentElement;
  const stored = localStorage.getItem("design-theme");
  const themeInput = document.getElementById("theme");
  const applyTheme = (dark) => {
    root.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("design-theme", dark ? "dark" : "light");
    themeInput.checked = dark;
  };
  const initialDark =
    stored === "dark" ||
    (stored == null && window.matchMedia("(prefers-color-scheme: dark)").matches);
  applyTheme(initialDark);
  themeInput.addEventListener("change", () => applyTheme(themeInput.checked));

  // ---- category order + labels ----
  const ORDER = [
    "Component Libraries",
    "Design Systems",
    "Design Inspiration",
    "Developer Tools",
    "Prompts",
  ];

  // ---- helpers ----
  const host = (u) => {
    try {
      return new URL(u).hostname.replace(/^www\./, "");
    } catch {
      return u;
    }
  };
  const favicon = (u) =>
    `https://www.google.com/s2/favicons?domain=${host(u)}&sz=64`;

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  const catsWrap = document.getElementById("cats");
  const countEl = document.getElementById("count");
  const searchInput = document.getElementById("q");

  let query = "";

  // ---- render ----
  const card = (item) => {
    const a = el("a", "card");
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener";
    const img = el("img");
    img.src = favicon(item.url);
    img.alt = "";
    img.loading = "lazy";
    img.width = 32;
    img.height = 32;
    const body = el("div", "card-body");
    const name = el("span", "card-name", escapeHtml(item.name));
    const dom = el("span", "card-domain", host(item.url));
    body.append(name, dom);
    a.append(img, body);
    return a;
  };

  const section = (cat, items) => {
    const sec = el("section", "sec");
    sec.id = cat.toLowerCase().replace(/[^a-z]+/g, "-");
    const head = el("div", "sec-head");
    const h = el("h2", "sec-title", escapeHtml(cat));
    const span = el("span", "sec-count", `${items.length}`);
    head.append(h, span);
    sec.append(head);
    const grid = el("div", "grid");
    items.forEach((it) => grid.append(card(it)));
    sec.append(grid);
    return sec;
  };

  const render = () => {
    let shown = 0;
    catsWrap.innerHTML = "";
    const q = query.trim().toLowerCase();
    ORDER.forEach((cat) => {
      const items = (DATA[cat] || []).filter((it) => {
        if (!q) return true;
        return (
          (it.name || "").toLowerCase().includes(q) ||
          (it.url || "").toLowerCase().includes(q)
        );
      });
      if (!items.length) return;
      shown += items.length;
      catsWrap.append(section(cat, items));
    });
    countEl.textContent = `${shown} resources`;
    // no-result state
    if (!shown) {
      const empty = el("p", "empty", `No resources match "${query}".`);
      catsWrap.append(empty);
    }
  };

  // ---- search ----
  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });

  render();

  // ---- utility: minimal escape to avoid HTML injection from note-derived names ----
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
