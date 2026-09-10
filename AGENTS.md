# AGENTS.md — design.ghuf.app

Guides AI coding agents and contributors on this repository. Read this first.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for this repository. Skills that read or write
issues (`to-tickets`, `triage`, `to-spec`, `qa`) use the `gh` CLI. See
`docs/agents/issue-tracker.md`.

### Triage labels

The default five labels are used: `needs-triage`, `needs-info`,
`ready-for-agent`, `ready-for-human`, `wontfix`. See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See
`docs/agents/domain.md`.

## Project overview

Static curated directory of design resources. Content is plain Markdown under
`resources/` (one file per category). `scripts/build.mjs` parses it into
`src/data.js`, imported by a React + Vite app. `vite build` outputs `dist/`.

## Commands

```bash
npm test        # parser tests (node:test)
npm run build   # resources/*.md -> src/data.js
npm run preview # serve src/ at http://127.0.0.1:8137
```

## Conventions

- Data source of truth = `resources/*.md`. Never hand-edit `src/data.js`; it is
  generated and gitignored.
- One resource = one line: `- [Name](https://url)`.
- UI text follows antislop rules: no em dash, sentence case, no generic AI copy.
- Accessibility required: keyboard focus, reduced motion, WCAG AA, both themes.
- Do not commit credentials or internal infrastructure details.
- Deploy = push to `main` → GitHub Actions → Cloudflare Pages.
