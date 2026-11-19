import assert from "node:assert/strict";
import { test } from "node:test";
import { CHAIRS } from "../src/data/chairs.ts";

test("the catalog has three distinct model IDs", () => {
  assert.equal(CHAIRS.length, 3);
  assert.equal(new Set(CHAIRS.map((chair) => chair.slug)).size, CHAIRS.length);
});

test("each model has a valid unit price and distinct color IDs", () => {
  for (const chair of CHAIRS) {
    assert.ok(Number.isSafeInteger(chair.price) && chair.price > 0, chair.slug);
    assert.ok(chair.colors.length > 0, chair.slug);
    assert.equal(new Set(chair.colors.map((color) => color.slug)).size, chair.colors.length, chair.slug);
  }
});
