import { test } from "node:test";
import assert from "node:assert/strict";
import { addRow, addBlock, moveRow, moveBlock, removeBlock, setBlockHeight, updateBlock } from "./rowOps";
import { ROW_PRESETS, type AdBlock, type Block, type NewsBlock, type Row } from "../../lib/types";

const news = (id: string): NewsBlock => ({ id, type: "news", headline: "शीर्षक", body: "मूल" });
const ad = (id: string): AdBlock => ({ id, type: "ad" });

test("every row preset lays out a full 12 columns", () => {
  for (const p of ROW_PRESETS) {
    assert.equal(p.reduce((a, b) => a + b, 0), 12, `preset ${p} does not sum to 12`);
  }
});

test("addRow builds a row whose spans match the preset", () => {
  for (const p of ROW_PRESETS) {
    const [row] = addRow([], p);
    assert.deepEqual(row.cols.map((c) => c.span), p);
    assert.equal(new Set(row.cols.map((c) => c.id)).size, p.length, "column ids must be unique");
  }
});

test("row ops never mutate the input array", () => {
  const rows = addRow([], [6, 6]);
  const snapshot = JSON.stringify(rows);
  addRow(rows, [12]);
  moveRow(rows, rows[0].id, "down");
  addBlock(rows, rows[0].id, rows[0].cols[0].id, news("b1"));
  assert.equal(JSON.stringify(rows), snapshot, "rowOps must be pure");
});

test("moveRow is a no-op at the ends rather than dropping a row", () => {
  const rows = addRow(addRow([], [12]), [6, 6]);
  assert.equal(moveRow(rows, rows[0].id, "up").length, 2);
  assert.equal(moveRow(rows, rows[1].id, "down").length, 2);
  assert.deepEqual(moveRow(rows, rows[0].id, "up").map((r) => r.id), rows.map((r) => r.id));
});

test("moveRow down then up returns the original order", () => {
  const rows = addRow(addRow([], [12]), [6, 6]);
  const there = moveRow(rows, rows[0].id, "down");
  const back = moveRow(there, rows[0].id, "up");
  assert.deepEqual(back.map((r) => r.id), rows.map((r) => r.id));
});

test("a block survives add -> update -> JSON round-trip unchanged", () => {
  let rows: Row[] = addRow([], [6, 6]);
  const [rowId, colId] = [rows[0].id, rows[0].cols[0].id];
  rows = addBlock(rows, rowId, colId, news("b1"));
  rows = updateBlock(rows, rowId, colId, "b1", { ...news("b1"), headline: "क्षत्रिय ज्ञान त्रिशूल" });

  const revived = JSON.parse(JSON.stringify(rows)) as Row[];
  assert.deepEqual(revived, rows, "page JSON must survive a Firestore round-trip intact");
  const block = revived[0].cols[0].blocks[0];
  assert.equal(block.type === "news" && block.headline, "क्षत्रिय ज्ञान त्रिशूल");
});

test("removeBlock takes out only its target", () => {
  let rows = addRow([], [12]);
  const [rowId, colId] = [rows[0].id, rows[0].cols[0].id];
  rows = addBlock(rows, rowId, colId, news("b1"));
  rows = addBlock(rows, rowId, colId, news("b2"));
  rows = removeBlock(rows, rowId, colId, "b1");
  assert.deepEqual(rows[0].cols[0].blocks.map((b) => b.id), ["b2"]);
});

test("moveBlock reorders within a column without losing blocks", () => {
  let rows = addRow([], [12]);
  const [rowId, colId] = [rows[0].id, rows[0].cols[0].id];
  rows = addBlock(rows, rowId, colId, news("b1"));
  rows = addBlock(rows, rowId, colId, news("b2"));
  const moved = moveBlock(rows, rowId, colId, "b2", "up");
  assert.deepEqual(moved[0].cols[0].blocks.map((b) => b.id), ["b2", "b1"]);
});

test("setBlockHeight slides the whole row level, clamps minimums, leaves other indexes and unmeasurable siblings alone", () => {
  const row: Row = {
    id: "r1",
    cols: [
      { id: "c1", span: 4, blocks: [
        { ...news("a1"), heightMm: 50 },
        { ...news("a2"), heightMm: 15 },
      ] },
      { id: "c2", span: 4, blocks: [
        { ...news("b1"), heightMm: 80 },
        { ...news("b2"), heightMm: 25 },
      ] },
      { id: "c3", span: 4, blocks: [
        ad("c1"), // auto-height (heightMm undefined) -- no known mm height to shift
      ] },
    ],
  };

  // Drag a1 from 50mm to 70mm: delta +20. b1 (same index, other column) must
  // move by the same delta; c1's auto-height ad has nothing to shift so it's
  // skipped; a2/b2 (a different index) must be untouched.
  const grown = setBlockHeight([row], "r1", "c1", "a1", 70);
  assert.equal((grown[0].cols[0].blocks[0] as NewsBlock).heightMm, 70);
  assert.equal((grown[0].cols[1].blocks[0] as NewsBlock).heightMm, 100, "sibling must shift by the same delta");
  assert.equal((grown[0].cols[2].blocks[0] as AdBlock).heightMm, undefined, "auto-height sibling is skipped");
  assert.equal((grown[0].cols[0].blocks[1] as NewsBlock).heightMm, 15, "other index untouched");
  assert.equal((grown[0].cols[1].blocks[1] as NewsBlock).heightMm, 25, "other index untouched");

  // Drag a1 down to 10mm: delta -40. a1 clamps at its 20mm minimum; b1 shifts
  // by the same -40 delta to 40mm (above its floor, no clamp needed there).
  const shrunk = setBlockHeight([row], "r1", "c1", "a1", 10);
  assert.equal((shrunk[0].cols[0].blocks[0] as NewsBlock).heightMm, 20, "target clamps at its own minimum");
  assert.equal((shrunk[0].cols[1].blocks[0] as NewsBlock).heightMm, 40, "sibling shifts by the same delta (-40)");

  const row2: Row = {
    id: "r2",
    cols: [
      { id: "d1", span: 6, blocks: [{ ...ad("x1"), heightMm: 15 }] },
      { id: "d2", span: 6, blocks: [{ id: "h1", type: "headlines", title: "t", items: [] }] },
    ],
  };
  // Ad minimum is 10mm; the headlines sibling has no heightMm field at all.
  const adShrunk = setBlockHeight([row2], "r2", "d1", "x1", -100);
  assert.equal((adShrunk[0].cols[0].blocks[0] as AdBlock).heightMm, 10, "ad clamps at its 10mm minimum");
  assert.deepEqual(
    adShrunk[0].cols[1].blocks[0],
    { id: "h1", type: "headlines", title: "t", items: [] },
    "non-heightMm block types are left untouched"
  );
});
