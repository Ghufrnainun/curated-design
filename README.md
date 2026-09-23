# design.ghuf.app

Curated directory of design resources, all in one place: component libraries,
design systems, UI inspiration, developer tools, and AI design prompts.
Every card links straight to the source. No accounts, no tracking, no bloat.

**Live: https://design.ghuf.app**

<img alt="screenshot" src=".github/screenshot.png" width="720">

---

## What this is

An open, curated index of design software and references. Each entry points
directly at the resource itself, grouped by category:

| Category | Count |
|---|---|
| Component Libraries | 164 |
| Design Inspiration | 76 |
| Developer Tools | 41 |
| Design Systems | 20 |
| AI Design Prompts | 11 |

## For AI agents / LLMs

The full catalog is published as plain text for agents to fetch

```text
llms.txt         index of categories (standard llms.txt format)
llms-full.txt    every resource inline: [Name](url) — note
```

- `https://design.ghuf.app/llms.txt` — category index, points to the full list
- `https://design.ghuf.app/llms-full.txt` — all resources, grouped by category,
  one per line, links straight to each source

Both are regenerated on every build from `resources/*.md`, so they never go
stale. Example agent usage: "fetch https://design.ghuf.app/llms-full.txt and
find a React component library with shadcn-style blocks."

## Stack

Static site built with **React + Vite**, deployed to Cloudflare Pages. The
content source is plain Markdown, and a small Node script turns it into the
data module the app imports.

```text
resources/*.md            content source (edit these)
scripts/parse.mjs         markdown parser
scripts/build.mjs         build: resources/ -> src/data.js (ESM)
src/App.jsx               UI (React)
src/main.jsx              entry
src/styles.css            styling (dark/light, responsive)
src/data.js               generated data module
public/_headers           HTTP headers for Cloudflare Pages
test/parse.test.mjs       parser tests (node:test)
```

- **Stack:** React 18 + Vite 5, no UI framework, no animation library
- **Fonts:** Outfit (body) + DM Mono (labels)
- **Palette:** teal accent `#0F766E` (light) / `#2dd4bf` (dark) on warm neutrals
- **Search/filter/theme:** client-side in React, no backend
- **Accessible:** keyboard focus, reduced motion, WCAG AA contrast

## Development

```bash
git clone https://github.com/Ghufrnainun/curated-design.git
cd curated-design

npm test        # parser tests
npm run build   # regenerate src/data.js from resources/*.md
npm run preview # serve src/ at http://127.0.0.1:8137
```

## Add a resource

Open the matching file under `resources/` and add one line:

```md
- [Name](https://example.com)
```

Optional subcategory (creates a group):

```md
## Animated

- [Motion Primitives](https://motion-primitives.com/)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide and PR flow.

## Deploy

Push to `main` → GitHub Actions (test + build) → Cloudflare Pages →
https://design.ghuf.app. Non-main branches get preview deployments.

## License

MIT. See [LICENSE](LICENSE).