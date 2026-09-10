# design.ghuf.app

Curated directory of design resources: component libraries, design systems, UI
inspiration, developer tools, and AI design prompts. Every card links straight to
the source.

## Stack

Static site, no framework. Vanilla HTML/CSS/JS + a small build script.

- `src/index.html` — page markup
- `src/app.js` — render/search/theme (vanilla)
- `src/styles.css` — styling (antislop, dark/light, responsive)
- `src/data.js` — generated data (`window.DESIGN_DATA`)
- `build.py` — regenerates `src/data.js` from the Obsidian vault

## Regenerate data

Data is curated live from `/home/ubuntu/obsidian-vault`:

```bash
python3 build.py   # writes src/data.js
```

Commit the regenerated `src/data.js`, push, and GitHub Actions deploys to
Cloudflare Pages automatically.

## Deploy

GitHub Actions on push to `main` → `wrangler pages deploy` → Cloudflare Pages →
`design.ghuf.app`.

Live: https://design.ghuf.app
