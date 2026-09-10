# design.ghuf.app

Curated directory of design resources, all in one place: component libraries,
design systems, UI inspiration, developer tools, and AI design prompts.
Every card links straight to the source. No accounts, no tracking, no bloat.

**Live: https://design.ghuf.app**

<a href="https://design.ghuf.app"><img alt="screenshot" src="https://raw.githubusercontent.com/Ghufrnainun/design-ghuf-app/main/.github/screenshot.png" width="720"></a>

---

## What this is

A personal, curated index born from the Obsidian vault. Instead of a private
list of bookmarks, each entry points directly at the resource itself, grouped
by category:

| Category | Count |
|---|---|
| Component Libraries | 112 |
| Design Inspiration | 90 |
| Design Systems | 21 |
| Developer Tools | 5 |
| AI Design Prompts | 4 |

## Stack

Static site, no framework, no build step for the browser. Three source files
plus a generator:

```
src/
├── index.html    page markup
├── app.js        render, search, theme (vanilla JS)
├── styles.css    styling (antislop, dark/light, responsive)
├── data.js       generated data (window.DESIGN_DATA)
└── _headers      Cloudflare security headers
build.py          regenerates src/data.js from the Obsidian vault
```

- **Fonts:** Outfit (body) + DM Mono (labels)
- **Palette:** teal accent `#0F766E` (light) / `#2dd4bf` (dark) on warm neutrals
- **No framework:** search/filter is client-side over a small JSON blob
- **Accessible:** keyboard focus, reduced motion, WCAG AA contrast
- **Anti-slop:** copy and layout held to the antislop bar (no em dash, no
  generic AI patterns)

## Development

```bash
git clone https://github.com/Ghufrnainun/design-ghuf-app.git
cd design-ghuf-app

python3 build.py      # regenerate data from the vault (works where vault lives)
npm run preview       # or: python3 -m http.server 8137 -d src
```

Open http://127.0.0.1:8137.

## Deploy

Push to `main` → GitHub Actions → `cloudflare/wrangler-action` → Cloudflare
Pages → https://design.ghuf.app. Non-main branches get preview deployments.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issue or PR welcome, keep changes
small, verify locally before submitting.

## License

MIT. See [LICENSE](LICENSE).