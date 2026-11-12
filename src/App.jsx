import { useMemo, useState, useRef, useEffect } from "react";
import DESIGN_DATA from "./data.js";
import { filterData, terms, ALL_LABEL } from "./filter.js";

const CATS = [
  { key: "Component Libraries", slug: "components", label: "Component libraries", short: "Components", file: "component-libraries.md" },
  { key: "Design Systems", slug: "systems", label: "Design systems", short: "Systems", file: "design-systems.md" },
  { key: "Design Inspiration", slug: "inspiration", label: "Design inspiration", short: "Inspiration", file: "design-inspiration.md" },
  { key: "Developer Tools", slug: "tools", label: "Developer tools", short: "Tools", file: "developer-tools.md" },
  { key: "Prompts", slug: "prompts", label: "Prompts", short: "Prompts", file: "prompts.md" },
];
const ORDER = CATS.map((c) => c.key);
const BY_KEY = Object.fromEntries(CATS.map((c) => [c.key, c]));
const BY_SLUG = Object.fromEntries(CATS.map((c) => [c.slug, c]));
const GITHUB = "https://github.com/Ghufrnainun/curated-design";

/** Link to the GitHub issue form, prefilled where we know the answer. */
function suggestUrl({ cat, name } = {}) {
  const p = new URLSearchParams({ template: "add-resource.yml" });
  if (name) {
    p.set("title", `Add: ${name}`);
    p.set("name", name);
  }
  if (cat && cat !== ALL_LABEL) p.set("category", cat);
  return `${GITHUB}/issues/new?${p}`;
}

function Contribute({ cat }) {
  const c = BY_KEY[cat];
  const editUrl = c ? `${GITHUB}/edit/main/resources/${c.file}` : `${GITHUB}/tree/main/resources`;
  return (
    <section className="contribute wrap" id="contribute" aria-labelledby="contribute-title">
      <div className="contribute-head">
        <h2 id="contribute-title">Add a resource</h2>
        <p>
          Know something that belongs here? There are two ways to send it. Both need a free GitHub account, and every
          entry is reviewed before it goes live.
        </p>
      </div>
      <ol className="ways">
        <li className="way">
          <span className="way-n">01</span>
          <h3>Suggest it</h3>
          <p>Fill in a short form with the name, link, category, and a one-line description. No code needed.</p>
          <a className="btn" href={suggestUrl({ cat })} target="_blank" rel="noopener noreferrer">
            Open the form<span className="sr-only"> on GitHub (opens in a new tab)</span>
          </a>
        </li>
        <li className="way">
          <span className="way-n">02</span>
          <h3>Add it yourself</h3>
          <p>
            Edit the Markdown file in your browser and open a pull request. One line per resource:
          </p>
          <code className="snippet">- [Name](https://url) — short description</code>
          <div className="way-actions">
            <a className="btn btn-ghost" href={editUrl} target="_blank" rel="noopener noreferrer">
              {c ? `Edit ${c.file}` : "Browse the files"}
              <span className="sr-only"> on GitHub (opens in a new tab)</span>
            </a>
            <a className="text-link" href={`${GITHUB}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer">
              Contributing guide<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </li>
      </ol>
    </section>
  );
}

// Skip the hover-preview delay on subsequent hovers.
let isWarm = false;
let warmTimer = null;

const pad = (n, w = 2) => String(n).padStart(w, "0");

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function groupsOf(cat) {
  const m = new Map();
  for (const it of DESIGN_DATA[cat] || []) {
    const g = it.group || "General";
    m.set(g, (m.get(g) || 0) + 1);
  }
  return [...m];
}

function readUrl() {
  const p = new URLSearchParams(window.location.search);
  const cat = BY_SLUG[p.get("cat")]?.key ?? ALL_LABEL;
  const g = p.get("group");
  const group = cat !== ALL_LABEL && groupsOf(cat).some(([n]) => n === g) ? g : null;
  return { q: p.get("q") ?? "", cat, group };
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("design-theme");
      if (saved) return saved === "dark";
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);
  const toggle = () =>
    setDark((d) => {
      try {
        localStorage.setItem("design-theme", d ? "light" : "dark");
      } catch {}
      return !d;
    });
  return [dark, toggle];
}

/** Wrap search-term matches in <mark>. */
function Highlight({ text, ts }) {
  if (!ts.length || !text) return text;
  const re = new RegExp(`(${ts.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return text.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

function Favicon({ item }) {
  const [err, setErr] = useState(false);
  if (item.fav && !err) {
    return <img src={item.fav} alt="" width="20" height="20" loading="lazy" onError={() => setErr(true)} />;
  }
  return <span className="fav-fallback">{(item.name || "?").trim().charAt(0).toUpperCase()}</span>;
}

// og:image is collected at build time (scripts/fetch-og.mjs). No image, or a broken one,
// falls back to a typographic card so the popover never shows an empty box.
function Preview({ item, placement }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const hasImage = item.og && !error;
  return (
    <div className={`preview is-${placement}`} aria-hidden="true">
      <div className={`preview-media ${hasImage ? "" : "is-fallback"}`}>
        {hasImage ? (
          <>
            {!loaded && <div className="preview-skeleton" />}
            <img
              src={item.og}
              alt=""
              referrerPolicy="no-referrer"
              className={loaded ? "loaded" : ""}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        ) : (
          <div className="preview-fallback">
            <span className="fav fav-lg">
              <Favicon item={item} />
            </span>
            <span className="preview-fallback-name">{item.name}</span>
          </div>
        )}
      </div>
      <div className="preview-foot">
        <span className="preview-title">
          <span>{item.name}</span>
          <span className="mono">{host(item.url)}</span>
        </span>
        {item.note && <span className="preview-note">{item.note}</span>}
      </div>
    </div>
  );
}

function Row({ item, n, ts }) {
  const [show, setShow] = useState(false);
  const [placement, setPlacement] = useState("above");
  const ref = useRef(null);
  const timer = useRef(null);

  const enter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setPlacement(ref.current && ref.current.getBoundingClientRect().top < 340 ? "below" : "above");
    if (isWarm) setShow(true);
    else
      timer.current = setTimeout(() => {
        setShow(true);
        isWarm = true;
      }, 250);
  };
  const leave = () => {
    clearTimeout(timer.current);
    setShow(false);
    clearTimeout(warmTimer);
    warmTimer = setTimeout(() => (isWarm = false), 350);
  };

  return (
    <li ref={ref} className="row-wrap" onMouseEnter={enter} onMouseLeave={leave}>
      <a className="row" href={item.url} target="_blank" rel="noopener noreferrer">
        <span className="row-n" aria-hidden="true">
          {pad(n, 3)}
        </span>
        <span className="row-name">
          <span className="fav">
            <Favicon item={item} />
          </span>
          <span className="row-title">
            <span className="row-label">
              <Highlight text={item.name} ts={ts} />
            </span>
            <span className="row-domain">{host(item.url)}</span>
          </span>
        </span>
        <span className="row-note">{item.note && <Highlight text={item.note} ts={ts} />}</span>
        <span className="row-arrow" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      {show && <Preview item={item} placement={placement} />}
    </li>
  );
}

function Section({ cat, index, items, total, ts, showGroups }) {
  const c = BY_KEY[cat];
  const groups = [];
  for (const it of items) {
    const g = it.group || "General";
    let last = groups[groups.length - 1];
    if (!last || last.name !== g) groups.push((last = { name: g, items: [] }));
    last.items.push(it);
  }
  const titled = showGroups && !(groups.length === 1 && groups[0].name === "General");
  let n = 0;
  return (
    <section className="sec" data-cat={c.slug} aria-labelledby={`h-${c.slug}`}>
      <header className="sec-head">
        <span className="sec-index">{pad(index + 1)}</span>
        <h2 id={`h-${c.slug}`}>{c.label}</h2>
        <span className="sec-count">{items.length === total ? total : `${items.length} of ${total}`}</span>
      </header>
      <div className="cols" aria-hidden="true">
        <span>No.</span>
        <span>Name</span>
        <span>Description</span>
      </div>
      {groups.map((g) => (
        <div className="grp" key={g.name}>
          {titled && (
            <h3 className="grp-title">
              {g.name} <span>{g.items.length}</span>
            </h3>
          )}
          <ul className="rows">
            {g.items.map((it) => (
              <Row key={it.url} item={it} n={++n} ts={ts} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function ThemeIcon({ dark }) {
  return dark ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export default function App() {
  const initial = useMemo(readUrl, []);
  const [query, setQuery] = useState(initial.q);
  const [cat, setCat] = useState(initial.cat);
  const [group, setGroup] = useState(initial.group);
  const [dark, toggleTheme] = useTheme();
  const searchRef = useRef(null);

  const selectCat = (c) => {
    setCat(c);
    setGroup(null);
  };
  const clearAll = () => {
    setQuery("");
    selectCat(ALL_LABEL);
  };

  useEffect(() => {
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    if (cat !== ALL_LABEL) p.set("cat", BY_KEY[cat].slug);
    if (group) p.set("group", group);
    const s = p.toString();
    history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  }, [query, cat, group]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchRef.current) {
        if (searchRef.current.value) setQuery("");
        else searchRef.current.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const totals = useMemo(() => Object.fromEntries(ORDER.map((c) => [c, (DESIGN_DATA[c] || []).length])), []);
  const total = Object.values(totals).reduce((s, n) => s + n, 0);
  const matches = useMemo(() => filterData(DESIGN_DATA, ORDER, cat, query, group), [cat, query, group]);
  const shown = Object.values(matches).reduce((s, a) => s + a.length, 0);
  const ts = useMemo(() => terms(query), [query]);
  const groups = cat !== ALL_LABEL ? groupsOf(cat) : [];
  const filtered = query.trim() || cat !== ALL_LABEL;

  const browse = (c) => {
    selectCat(cat === c ? ALL_LABEL : c);
    // Scroll a static anchor: scrollIntoView on the sticky bar itself is a no-op.
    requestAnimationFrame(() => document.getElementById("browse")?.scrollIntoView());
  };

  return (
    <div className="app">
      <a className="skip" href="#results">
        Skip to resources
      </a>

      <header className="top wrap">
        <a className="logo" href="/" aria-label="curated.design home">
          curated<span>.</span>design
        </a>
        <nav className="top-links" aria-label="Project">
          <a href="/llms.txt" className="hide-sm">
            llms.txt
          </a>
          <a href="#contribute">
            Add<span className="hide-xs"> a resource</span>
          </a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hide-sm">
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            <ThemeIcon dark={dark} />
          </button>
        </nav>
      </header>

      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            {total} design resources<span className="dot">.</span>
          </h1>
          <p className="sub">
            Component libraries, design systems, references and tools, sorted and searchable. Every entry links straight
            to its source.
          </p>
        </div>
        <div className="tiles" role="group" aria-label="Browse by category">
          <button type="button" className="tile tile-all" aria-pressed={cat === ALL_LABEL} onClick={() => browse(ALL_LABEL)}>
            <span className="tile-index">00</span>
            <span className="tile-count">{total}</span>
            <span className="tile-name">Everything</span>
          </button>
          {CATS.map((c, i) => (
            <button
              key={c.key}
              type="button"
              className="tile"
              data-cat={c.slug}
              aria-pressed={cat === c.key}
              onClick={() => browse(c.key)}
            >
              <span className="tile-index">{pad(i + 1)}</span>
              <span className="tile-count">{totals[c.key]}</span>
              <span className="tile-name">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      <span id="browse" className="anchor" aria-hidden="true" />
      <div className="bar">
        <div className="wrap bar-inner">
          <div className="search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={searchRef}
              id="q"
              type="search"
              placeholder="Search names, descriptions, groups"
              autoComplete="off"
              spellCheck="false"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search resources"
            />
            {!query && (
              <kbd aria-hidden="true">/</kbd>
            )}
          </div>
          <nav className="tabs" aria-label="Categories">
            <button type="button" className="tab" aria-pressed={cat === ALL_LABEL} onClick={() => selectCat(ALL_LABEL)}>
              All <span className="mono">{total}</span>
            </button>
            {CATS.map((c) => (
              <button
                key={c.key}
                type="button"
                className="tab"
                data-cat={c.slug}
                aria-pressed={cat === c.key}
                onClick={() => selectCat(c.key)}
              >
                <span className="swatch" aria-hidden="true" />
                {c.short} <span className="mono">{totals[c.key]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main id="results" className="wrap" tabIndex={-1}>
        <div className="status">
          <p aria-live="polite">
            Showing <strong>{shown}</strong> of {total}
            {cat !== ALL_LABEL && <> in {BY_KEY[cat].label.toLowerCase()}</>}
            {group && <>, {group.toLowerCase()}</>}
            {query.trim() && <> for &ldquo;{query.trim()}&rdquo;</>}
          </p>
          {filtered && (
            <button type="button" className="text-btn" onClick={clearAll}>
              Clear filters
            </button>
          )}
        </div>

        {groups.length > 1 && (
          <div className="chips" role="group" aria-label={`Filter ${BY_KEY[cat].label.toLowerCase()} by group`} data-cat={BY_KEY[cat].slug}>
            <button type="button" className="chip" aria-pressed={!group} onClick={() => setGroup(null)}>
              All groups
            </button>
            {groups.map(([g, count]) => (
              <button key={g} type="button" className="chip" aria-pressed={group === g} onClick={() => setGroup(group === g ? null : g)}>
                {g} <span className="mono">{count}</span>
              </button>
            ))}
          </div>
        )}

        {shown === 0 ? (
          <div className="empty">
            <p className="empty-title">Nothing matches &ldquo;{query.trim()}&rdquo;.</p>
            <p>Try a broader word, or search everything. If it should be here, suggest it.</p>
            <div className="way-actions">
              <button type="button" className="btn" onClick={clearAll}>
                Clear filters
              </button>
              {query.trim() && (
                <a
                  className="btn btn-ghost"
                  href={suggestUrl({ cat, name: query.trim() })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Suggest &ldquo;{query.trim()}&rdquo;<span className="sr-only"> on GitHub (opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          CATS.map((c, i) =>
            matches[c.key].length ? (
              <Section
                key={c.key}
                cat={c.key}
                index={i}
                items={matches[c.key]}
                total={totals[c.key]}
                ts={ts}
                showGroups={!group}
              />
            ) : null,
          )
        )}
      </main>

      <Contribute cat={cat} />

      <footer className="foot">
        <div className="wrap foot-inner">
          <p className="foot-mark">
            curated<span>.</span>design
          </p>
          <ul className="foot-links">
            <li>
              <a href={suggestUrl()} target="_blank" rel="noopener noreferrer">
                Suggest a resource
              </a>
            </li>
            <li>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">
                Source on GitHub
              </a>
            </li>
            <li>
              <a href="/llms-full.txt">llms-full.txt for agents</a>
            </li>
          </ul>
          <p className="foot-note">
            {total} resources across {CATS.length} categories. Open source under MIT.
          </p>
        </div>
      </footer>
    </div>
  );
}
