import { test } from "node:test";
import assert from "node:assert/strict";
import { addRow, addBlock, moveRow, moveBlock, removeBlock, updateBlock } from "./rowOps";
import { ROW_PRESETS, type Block, type NewsBlock, type Row } from "../../lib/types";

const news = (id: string): NewsBlock => ({ id, type: "news", headline: "शीर्षक", body: "मूल" });

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
