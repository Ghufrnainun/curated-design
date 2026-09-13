import { useMemo, useState } from "react";
import DESIGN_DATA from "./data.js";
import { filterData, ALL_LABEL } from "./filter.js";

const ORDER = [
  "Component Libraries",
  "Design Systems",
  "Design Inspiration",
  "Developer Tools",
  "Prompts",
];

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function useTheme() {
  const [dark, setDark] = useState(
    () =>
      localStorage.getItem("design-theme") === "dark" ||
      (localStorage.getItem("design-theme") == null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("design-theme", next ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      return next;
    });
  };
  return [dark, toggle];
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function Card({ item }) {
  return (
    <a className="card" href={item.url} target="_blank" rel="noopener noreferrer">
      <span className="card-icon">
        <img
          src={`https://www.google.com/s2/favicons?domain=${host(item.url)}&sz=64`}
          alt=""
          width="32"
          height="32"
          loading="lazy"
        />
      </span>
      <span className="card-body">
        <span className="card-name">{item.name}</span>
        <span className="card-domain">{host(item.url)}</span>
      </span>
    </a>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL_LABEL);
  const [dark, toggleTheme] = useTheme();

  const totals = useMemo(
    () => Object.fromEntries(ORDER.map((c) => [c, (DESIGN_DATA[c] || []).length])),
    [],
  );
  const total = useMemo(
    () => Object.values(totals).reduce((s, n) => s + n, 0),
    [totals],
  );

  const matches = useMemo(
    () => filterData(DESIGN_DATA, ORDER, cat, query),
    [cat, query],
  );

  const shownCount = Object.values(matches).reduce((s, a) => s + a.length, 0);
  const activeCats = ORDER.filter((c) => (matches[c] || []).length);

  return (
    <div className="app">
      <header className="head">
        <div className="wrap head-top">
          <a className="logo" href="/" aria-label="Curated design home">
            curated<span className="logo-accent">.design</span>
          </a>
          <div className="head-controls">
            <div className="search-wrap">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="q"
                className="search"
                type="search"
                placeholder="Search resources…"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search resources"
              />
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title="Toggle theme"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        <div className="wrap hero">
          <span className="label">Curated design</span>
          <h1>Curated design tools.</h1>
          <p className="sub">
            Component libraries, design systems, UI inspiration, dev tools and AI
            design prompts, all in one place. Every card links straight to the
            source.
          </p>
        </div>

        <div className="wrap filters" role="group" aria-label="Filter by category">
          <div className="chips">
            <button
              type="button"
              className={`chip ${cat === ALL_LABEL ? "chip-active" : ""}`}
              onClick={() => setCat(ALL_LABEL)}
              aria-pressed={cat === ALL_LABEL}
            >
              All <span className="chip-count">{total}</span>
            </button>
            {ORDER.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${cat === c ? "chip-active" : ""}`}
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
              >
                {c} <span className="chip-count">{totals[c]}</span>
              </button>
            ))}
          </div>
          {(query || cat !== ALL_LABEL) && (
            <button
              type="button"
              className="reset"
              onClick={() => {
                setQuery("");
                setCat(ALL_LABEL);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </header>

      <main className="wrap">
        {shownCount === 0 && (
          <p className="empty">
            No resources match &ldquo;{query}&rdquo;.
          </p>
        )}
        {activeCats.map((c) => (
          <Section key={c} cat={c} items={matches[c]} count={totals[c]} />
        ))}
      </main>

      <footer className="wrap foot">
        <p>
          <a
            href="https://github.com/Ghufrnainun/curated-design"
            target="_blank"
            rel="noopener noreferrer"
          >
            design.ghuf.app
          </a>
          {" · open source, curated from the community · "}
          <span className="foot-count">{shownCount} resources</span>
        </p>
      </footer>
    </div>
  );
}

function Section({ cat, items, count }) {
  // group items by optional `group` field, preserve order; items without group go to "General"
  const groups = [];
  const order = [];
  for (const it of items) {
    const g = it.group || "General";
    if (!order.includes(g)) {
      order.push(g);
      groups.push({ name: g, items: [] });
    }
    groups[order.indexOf(g)].items.push(it);
  }
  return (
    <section className="sec" id={cat.toLowerCase().replace(/[^a-z]+/g, "-")}>
      <div className="sec-head">
        <h2 className="sec-title">{cat}</h2>
        <span className="sec-count">/ {count}</span>
      </div>
      {order.length === 1 && order[0] === "General" ? (
        <div className="grid">
          {items.map((it) => (
            <Card key={it.url} item={it} />
          ))}
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.name} className="sec-group">
            <h3 className="group-title">{g.name}</h3>
            <div className="grid">
              {g.items.map((it) => (
                <Card key={it.url} item={it} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
