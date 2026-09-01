// Pure, immutable helpers for editing a PageDoc's rows tree. Unit-tested elsewhere.
import { newId } from "../../lib/ids";
import type { Block, Column, Row } from "../../lib/types";

export function addRow(rows: Row[], spans: number[]): Row[] {
  const row: Row = {
    id: newId(),
    cols: spans.map((span): Column => ({ id: newId(), span, blocks: [] })),
  };
  return [...rows, row];
}

export function removeRow(rows: Row[], rowId: string): Row[] {
  return rows.filter((r) => r.id !== rowId);
}

export function moveRow(rows: Row[], rowId: string, dir: "up" | "down"): Row[] {
  const i = rows.findIndex((r) => r.id === rowId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return rows;
  const next = [...rows];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function mapCol(rows: Row[], rowId: string, colId: string, fn: (col: Column) => Column): Row[] {
  return rows.map((r) =>
    r.id !== rowId
      ? r
      : { ...r, cols: r.cols.map((c) => (c.id === colId ? fn(c) : c)) },
  );
}

export function addBlock(rows: Row[], rowId: string, colId: string, block: Block): Row[] {
  return mapCol(rows, rowId, colId, (c) => ({ ...c, blocks: [...c.blocks, block] }));
}

export function updateBlock(
  rows: Row[],
  rowId: string,
  colId: string,
  blockId: string,
  next: Block,
): Row[] {
  return mapCol(rows, rowId, colId, (c) => ({
    ...c,
    blocks: c.blocks.map((b) => (b.id === blockId ? next : b)),
  }));
}

export function removeBlock(rows: Row[], rowId: string, colId: string, blockId: string): Row[] {
  return mapCol(rows, rowId, colId, (c) => ({
    ...c,
    blocks: c.blocks.filter((b) => b.id !== blockId),
  }));
}

export function findBlock(rows: Row[], blockId: string): Block | null {
  return findBlockLocation(rows, blockId)?.block ?? null;
}

export function findBlockLocation(
  rows: Row[],
  blockId: string,
): { rowId: string; colId: string; block: Block } | null {
  for (const r of rows) {
    for (const c of r.cols) {
      const b = c.blocks.find((x) => x.id === blockId);
      if (b) return { rowId: r.id, colId: c.id, block: b };
    }
  }
  return null;
}

export function moveBlock(
  rows: Row[],
  rowId: string,
  colId: string,
  blockId: string,
  dir: "up" | "down",
): Row[] {
  return mapCol(rows, rowId, colId, (c) => {
    const i = c.blocks.findIndex((b) => b.id === blockId);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= c.blocks.length) return c;
    const blocks = [...c.blocks];
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    return { ...c, blocks };
  });
}
