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
): { rowId: string; colId: string; span: number; block: Block } | null {
  for (const r of rows) {
    for (const c of r.cols) {
      const b = c.blocks.find((x) => x.id === blockId);
      if (b) return { rowId: r.id, colId: c.id, span: c.span, block: b };
    }
  }
  return null;
}

// Effective mm height news/ad blocks render at; null for auto-height (heightMm
// undefined on an ad) or block types with no heightMm field at all.
function effectiveHeightMm(block: Block): number | null {
  if (block.type === "news") return block.heightMm ?? 90;
  if (block.type === "ad") return block.heightMm ?? null;
  return null;
}

function minHeightMm(block: Block): number {
  return block.type === "ad" ? 10 : 20;
}

function withHeight(block: Block, heightMm: number): Block {
  if (block.type !== "news" && block.type !== "ad") return block;
  return { ...block, heightMm: Math.max(minHeightMm(block), heightMm) };
}

/**
 * Resizing one block's bottom edge should keep the row level: every other
 * column's block at the same index shifts by the same delta, so the whole
 * horizontal band moves together instead of only the dragged column.
 */
export function setBlockHeight(
  rows: Row[],
  rowId: string,
  colId: string,
  blockId: string,
  heightMm: number,
): Row[] {
  const row = rows.find((r) => r.id === rowId);
  const col = row?.cols.find((c) => c.id === colId);
  const idx = col ? col.blocks.findIndex((b) => b.id === blockId) : -1;
  if (!row || !col || idx < 0) return rows;

  const currentEffective = effectiveHeightMm(col.blocks[idx]);
  // ponytail: target has no known baseline (auto-height ad, or a type with no
  // heightMm) -- resize the target only, siblings can't be shifted by an
  // unknown delta.
  const delta = currentEffective === null ? null : heightMm - currentEffective;

  return rows.map((r) =>
    r.id !== rowId
      ? r
      : {
          ...r,
          cols: r.cols.map((c) => ({
            ...c,
            blocks: c.blocks.map((b, i) => {
              if (i !== idx) return b;
              if (c.id === colId) return withHeight(b, heightMm);
              if (delta === null) return b;
              const eff = effectiveHeightMm(b);
              // ponytail: sibling is auto-height (ad with heightMm undefined)
              // or a type with no heightMm field -- skip it, no mm value to
              // shift; would need measurement to support.
              if (eff === null) return b;
              return withHeight(b, eff + delta);
            }),
          })),
        },
  );
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
