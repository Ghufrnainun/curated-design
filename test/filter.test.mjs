// test/filter.test.mjs — tests for src/filter.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { filterData, ALL_LABEL } from "../src/filter.js";

const DATA = {
  A: [
    { name: "Radix UI", url: "https://radix-ui.com/" },
    { name: "Mantine", url: "https://mantine.dev/" },
  ],
  B: [
    { name: "Linear", url: "https://linear.app" },
  ],
};
const ORDER = ["A", "B"];

test("no filters: everything visible", () => {
  const r = filterData(DATA, ORDER, ALL_LABEL, "");
  assert.equal(r.A.length, 2);
  assert.equal(r.B.length, 1);
});

test("category filter hides other categories entirely", () => {
  const r = filterData(DATA, ORDER, "B", "");
  assert.equal(r.A.length, 0, "A must be empty");
  assert.equal(r.B.length, 1, "B keeps its items");
});

test("search filters by name", () => {
  const r = filterData(DATA, ORDER, ALL_LABEL, "radix");
  assert.equal(r.A.length, 1);
  assert.equal(r.A[0].name, "Radix UI");
  assert.equal(r.B.length, 0);
});

test("search + category combine", () => {
  const r = filterData(DATA, ORDER, "A", "radix");
  assert.equal(r.A.length, 1);
  assert.equal(r.B.length, 0);
});

test("search with no match returns empty arrays, not undefined", () => {
  const r = filterData(DATA, ORDER, ALL_LABEL, "zzz");
  assert.equal(r.A.length, 0);
  assert.equal(r.B.length, 0);
  assert.ok(Array.isArray(r.A));
});