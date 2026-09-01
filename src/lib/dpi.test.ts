import { test } from "node:test";
import assert from "node:assert/strict";
import { checkImage, columnWidthMm, effectiveDpi, pixelsNeeded } from "./dpi";

test("300dpi across 25.4mm is exactly 300 pixels", () => {
  assert.equal(effectiveDpi(300, 25.4), 300);
  assert.equal(pixelsNeeded(25.4), 300);
});

test("a small photo in a wide hole fails, a big one passes", () => {
  assert.equal(checkImage(400, 120).ok, false);
  assert.equal(checkImage(2000, 120).ok, true);
});

test("zero width never divides by zero", () => {
  assert.equal(effectiveDpi(500, 0), 0);
});

test("column widths across a row always sum to the full usable width", () => {
  const page = 375;
  const full = columnWidthMm(12, page);
  for (const preset of [[6, 6], [3, 9], [4, 4, 4], [3, 3, 3, 3], [5, 7]]) {
    const sum =
      preset.reduce((a, s) => a + columnWidthMm(s, page), 0) + 4 * (preset.length - 1);
    assert.ok(Math.abs(sum - full) < 0.001, `preset ${preset} summed to ${sum}, expected ${full}`);
  }
});
