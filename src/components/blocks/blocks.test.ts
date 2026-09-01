import { test } from "node:test";
import assert from "node:assert/strict";
import { BLOCKS } from "./index";
import { RASHIFAL_SIGNS } from "../../lib/types";

test("every BlockType has a registry entry whose type matches its key", () => {
  for (const [key, def] of Object.entries(BLOCKS)) {
    assert.equal(def.type, key);
  }
});

test("create() returns a distinct id on each call", () => {
  for (const def of Object.values(BLOCKS)) {
    const a = def.create();
    const b = def.create();
    assert.notEqual(a.id, b.id);
  }
});

test("rashifal create() returns exactly 12 signs matching RASHIFAL_SIGNS", () => {
  const block = BLOCKS.rashifal.create();
  assert.equal(block.signs.length, 12);
  assert.deepEqual(
    block.signs.map((s: { name: string }) => s.name),
    [...RASHIFAL_SIGNS]
  );
});
