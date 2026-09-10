// test/parse.test.mjs — tests for scripts/parse.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMarkdown } from "../scripts/parse.mjs";

test("parses title, groups and bullets", () => {
  const md = `# Component Libraries

## Headless

- [Radix UI](https://radix-ui.com/)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)

## Animated

- [Motion Primitives](https://motion-primitives.com/)
`;
  const r = parseMarkdown(md);
  assert.equal(r.title, "Component Libraries");
  assert.equal(r.groups.length, 2);
  assert.equal(r.groups[0].name, "Headless");
  assert.equal(r.groups[0].items.length, 2);
  assert.deepEqual(r.groups[0].items[0], {
    name: "Radix UI",
    url: "https://radix-ui.com/",
  });
  assert.equal(r.groups[1].items[0].name, "Motion Primitives");
});

test("bullets before any ## go into General group", () => {
  const md = `# Design Systems

- [Linear](https://linear.app)
- [Notion](https://notion.so)
`;
  const r = parseMarkdown(md);
  assert.equal(r.groups.length, 1);
  assert.equal(r.groups[0].name, "General");
  assert.equal(r.groups[0].items.length, 2);
});

test("optional note after url is captured", () => {
  const md = `# Prompts

- [MotionSites AI](https://motionsites.ai/) (145 prompts)
`;
  const r = parseMarkdown(md);
  assert.equal(r.groups[0].items[0].note, "(145 prompts)");
});

test("non-bullet lines are ignored", () => {
  const md = `# Category

Some prose here.

## Group

- [A](https://a.com)

> blockquote

| table | x |
|---|---|
| 1 | 2 |
`;
  const r = parseMarkdown(md);
  assert.equal(r.groups.length, 1);
  assert.equal(r.groups[0].items.length, 1);
  assert.equal(r.title, "Category");
});

test("descriptions with brackets or parens in name still parse", () => {
  const md = `# Category

- [Apple (España)](https://www.apple.com/macbook-neo)
`;
  const r = parseMarkdown(md);
  assert.equal(r.groups[0].items[0].name, "Apple (España)");
  assert.equal(r.groups[0].items[0].url, "https://www.apple.com/macbook-neo");
});