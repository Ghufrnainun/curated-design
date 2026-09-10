# Contributing to design.ghuf.app

Thank you for helping improve this curated directory of design tools.

## How the site works

Content lives in plain Markdown under `resources/`, one file per category:

```text
resources/
├── component-libraries.md
├── design-systems.md
├── design-inspiration.md
├── developer-tools.md
└── prompts.md
```

`npm run build` parses those files into `src/data.js`, which the React app
imports. `npm test` validates the parser. No database, no CMS, no backend.

## Adding or editing a resource

1. Open the matching file under `resources/`.
2. Add one line for the resource:

   ```md
   - [Name](https://example.com)
   ```

3. Optional: create a subcategory by adding a `##` heading above a group of
   links:

   ```md
   ## Animated

   - [Motion Primitives](https://motion-primitives.com/)
   - [Hover.dev](https://www.hover.dev/)
   ```

4. Check that the URL is the real resource, not a link to a post about it.
5. Run the checks locally:

   ```bash
   npm test        # parser tests
   npm run build   # regenerates src/data.js
   ```

6. Open a pull request. The title should summarize the change (for example,
   `Add XYZ to Component Libraries`).

Guidelines:

- Keep entries as one line: name + URL. Optionally add a short note in
  parentheses after the URL.
- Do not add resources that are paywalled, invitation-only, or broken.
- Prefer the canonical homepage URL over a deep link.
- Check the list for existing entries before adding, to avoid duplicates.

## Running locally

```bash
git clone https://github.com/Ghufrnainun/curated-design.git
cd curated-design

npm test
npm run build
npm run preview   # serves src/ at http://127.0.0.1:8137
```

## Policy and scope

- The directory tracks libraries, design systems, inspiration sites,
  developer tools, and AI design prompts. Anything off-scope is rejected.
- Content is reviewed before merge. Small, focused PRs get merged fastest.
- By contributing you agree your contribution is licensed under the same
  MIT license as the repository.

## Need help?

Open an issue with the `question` label, or ask in the PR itself.