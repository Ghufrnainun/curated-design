# Contributing to design.ghuf.app

Thank you for helping improve this curated directory of design tools.

## How the site works

This is a static site, no framework. Three source files in `src/`:

- `src/index.html` — page markup
- `src/app.js` — render, search, theme (vanilla JS)
- `src/styles.css` — styling (dark/light, responsive)

Data lives in `src/data.js` as `window.DESIGN_DATA`, a flat JSON object keyed
by category. `build.py` regenerates it from the Obsidian vault:

```bash
pip install -r requirements.txt 2>/dev/null || true
python3 build.py      # writes src/data.js
```

## Getting started

```bash
git clone https://github.com/Ghufrnainun/design-ghuf-app.git
cd design-ghuf-app

# regenerate data from the vault (only works on the VPS where the vault lives)
python3 build.py

# preview locally (serves src/ on port 8137)
npm run preview
# or:
python3 -m http.server 8137 --bind 127.0.0.1 --directory src
```

Then open http://127.0.0.1:8137 in a browser.

## Editing the UI

- All text on the page should follow the antislop rules: no em dash `—`, use
  commas/colons instead; no generic AI copy; sentence case.
- Every interactive element must work. No dead links or buttons (R-26).
- Both light and dark themes must feel like the same page; only colors change.
- Respect `prefers-reduced-motion`. Responsive down to mobile.
- Fonts: Outfit (body) + DM Mono (labels). Palettes:
  - light `--bg:#fafaf7 --text:#1a1a18 --accent:#0f766e`
  - dark `--bg:#0a0a09 --text:#ededeb --accent:#2dd4bf`
- No emoji icons; the favicon is the only image asset.

## Editing data

`src/data.js` is generated. Do not hand-edit it; it gets overwritten on the
next `python3 build.py`. Edit the curated content in the vault (or the source
notes) and regenerate.

If you do not have the vault, you can add an entry by editing `build.py`
directly to include the resource, then regenerate.

## Deploy

Pushing to `main` triggers GitHub Actions which deploys to Cloudflare Pages
(`design-ghuf-app`) at https://design.ghuf.app. Preview environment: any
branch other than `main` creates a preview deployment on `.pages.dev`.

## Issues & PRs

- File an issue for bugs or missing resources.
- PRs welcome. Keep changes small and focused.
- Before submitting, verify locally with `python3 build.py` and open the
  preview. Ensure the rendered page has no console errors.

## License

MIT. See [LICENSE](LICENSE).
