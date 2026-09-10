# Domain docs

Single-context layout. Repository is a small, single-product static site, so
there is one shared context at the root.

- `CONTEXT.md` — project vocabulary and domain language (root). Create it when
  there is domain vocabulary worth recording.
- `docs/adr/` — Architecture Decision Records. One markdown file per decision,
  named `NNNN-title.md`. Consume with `docs/adr/0000-index.md` (if present).

To read: start at `CONTEXT.md` for domain terms, then any relevant ADR under
`docs/adr/` before changing architecture. No ADRs exist yet; create one only
for a decision the project wants to record.
