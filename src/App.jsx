import { useMemo, useState } from "react";
import DESIGN_DATA from "./data.js";

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

function Card({ item }) {
  return (
    <a className="card" href={item.url} target="_blank" rel="noopener noreferrer">
      <img
        className="card-favicon"
        src={`https://www.google.com/s2/favicons?domain=${host(item.url)}&sz=64`}
        alt=""
        width="32"
        height="32"
        loading="lazy"
      />
      <span className="card-body">
        <span className="card-name">{item.name}</span>
        <span className="card-domain">{host(item.url)}</span>
      </span>
    </a>
  );
}

function Section({ cat, items, counts }) {
  return (
    <section className="sec" id={cat.toLowerCase().replace(/[^a-z]+/g, "-")}>
      <div className="sec-head">
        <h2 className="sec-title">{cat}</h2>
        <span className="sec-count">{items.length}</span>
      </div>
      <div className="grid">
        {items.map((it) => (
          <Card key={it.url} item={it} />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [dark, toggleTheme] = useTheme();
  const q = query.trim().toLowerCase();

  const totals = useMemo(
    () =>
      Object.fromEntries(ORDER.map((c) => [c, (DESIGN_DATA[c] || []).length])),
    [],
  );
  const total = useMemo(
    () => Object.values(totals).reduce((s, n) => s + n, 0),
    [totals],
  );

  const visible = useMemo(() => {
    if (!q) return null;
    const out = {};
    for (const c of ORDER) {
      out[c] = (DESIGN_DATA[c] || []).filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.url.toLowerCase().includes(q),
      );
    }
    return out;
  }, [q]);

  const shownCount = visible
    ? Object.values(visible).reduce((s, a) => s + a.length, 0)
    : total;

  return (
    <div className="app">
      <header className="head">
        <div className="wrap head-top">
          <a className="logo" href="/">
            design<span className="logo-accent">.ghuf.app</span>
          </a>
          <div className="head-controls">
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
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title="Toggle theme"
            >
              {dark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="wrap hero">
          <h1>Design tools, curated.</h1>
          <p className="sub">
            Component libraries, design systems, UI inspiration, dev tools and AI
            design prompts, all in one place. Every card links straight to the
            source.
          </p>
        </div>
      </header>

      <main className="wrap" id="cats">
        {shownCount === 0 && (
          <p className="empty">
            No resources match &ldquo;{query}&rdquo;.
          </p>
        )}
        {(visible
          ? ORDER.filter((c) => (visible[c] || []).length)
          : ORDER
        ).map((c) => (
          <Section key={c} cat={c} items={visible ? visible[c] : DESIGN_DATA[c]} counts={totals} />
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