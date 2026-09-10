import { useMemo, useState } from "react";
import DESIGN_DATA from "./data.js";

const ORDER = [
  "Component Libraries",
  "Design Systems",
  "Design Inspiration",
  "Developer Tools",
  "Prompts",
];

const ALL = "All";

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
  const [cat, setCat] = useState(ALL);
  const [dark, toggleTheme] = useTheme();
  const q = query.trim().toLowerCase();

  const totals = useMemo(
    () => Object.fromEntries(ORDER.map((c) => [c, (DESIGN_DATA[c] || []).length])),
    [],
  );
  const total = useMemo(
    () => Object.values(totals).reduce((s, n) => s + n, 0),
    [totals],
  );

  const matches = useMemo(() => {
    const out = {};
    for (const c of ORDER) {
      const items = DESIGN_DATA[c] || [];
      const keep =
        (cat === ALL || c === cat) &&
        (q
          ? items.filter(
              (it) =>
                it.name.toLowerCase().includes(q) ||
                it.url.toLowerCase().includes(q),
            )
          : items);
      if (Array.isArray(keep)) out[c] = keep;
      else out[c] = items;
    }
    return out;
  }, [q, cat]);

  const shownCount = Object.values(matches).reduce((s, a) => s + a.length, 0);
  const activeCats = ORDER.filter((c) => (matches[c] || []).length);

  return (
    <div className="app">
      <header className="head">
        <div className="wrap head-top">
          <a className="logo" href="/">
            design<span className="logo-accent">.ghuf.app</span>
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
          <span className="label">Curated directory</span>
          <h1>Design tools, curated.</h1>
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
              className={`chip ${cat === ALL ? "chip-active" : ""}`}
              onClick={() => setCat(ALL)}
              aria-pressed={cat === ALL}
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
          {(q || cat !== ALL) && (
            <button
              type="button"
              className="reset"
              onClick={() => {
                setQuery("");
                setCat(ALL);
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
            href="https://github.com/Ghufrnainun/design-ghuf-app"
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
  return (
    <section className="sec" id={cat.toLowerCase().replace(/[^a-z]+/g, "-")}>
      <div className="sec-head">
        <h2 className="sec-title">{cat}</h2>
        <span className="sec-count">/ {count}</span>
      </div>
      <div className="grid">
        {items.map((it) => (
          <Card key={it.url} item={it} />
        ))}
      </div>
    </section>
  );
}
