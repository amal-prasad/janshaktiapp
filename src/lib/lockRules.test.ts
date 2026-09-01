import { test } from "node:test";
import assert from "node:assert/strict";
import { isHeldByOther, LOCK_STALE_MS } from "./lockRules";
import type { PageDoc } from "./types";

const page = (lockedBy: string | null, lockedAt: number | null): PageDoc => ({
  id: "p", index: 0, rows: [], lockedBy, lockedAt,
});
const NOW = 1_700_000_000_000;

test("free page is editable by anyone", () => {
  assert.equal(isHeldByOther(page(null, null), "raju", NOW), false);
});

test("our own lock does not lock us out", () => {
  assert.equal(isHeldByOther(page("raju", NOW - 1000), "raju", NOW), false);
});

test("someone else's fresh lock blocks us", () => {
  assert.equal(isHeldByOther(page("sunita", NOW - 1000), "raju", NOW), true);
});

test("a stale lock is reclaimable -- a closed browser must not block the paper", () => {
  assert.equal(isHeldByOther(page("sunita", NOW - LOCK_STALE_MS - 1), "raju", NOW), false);
});
