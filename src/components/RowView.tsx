"use client";
import ColumnCell from "@/components/editor/ColumnCell";
import type { Block, Row } from "@/lib/types";

export type RowOps = {
  onAddBlock: (colId: string, block: Block) => void;
  onUpdateBlock: (colId: string, blockId: string, next: Block) => void;
  onRemoveBlock: (colId: string, blockId: string) => void;
  onMoveBlock: (colId: string, blockId: string, dir: "up" | "down") => void;
};

type Props = {
  row: Row;
  editionId: string;
  pageWmm: number;
  ops?: RowOps;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
};

export default function RowView({ row, editionId, pageWmm, ops, selectedBlockId, onSelectBlock }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: row.cols.map((c) => `${c.span}fr`).join(" "),
        gap: "4mm",
        marginBottom: "4mm",
      }}
    >
      {row.cols.map((col) => (
        <ColumnCell
          key={col.id}
          col={col}
          editionId={editionId}
          pageWmm={pageWmm}
          ops={
            ops && {
              onAddBlock: (block) => ops.onAddBlock(col.id, block),
              onUpdateBlock: (blockId, next) => ops.onUpdateBlock(col.id, blockId, next),
              onRemoveBlock: (blockId) => ops.onRemoveBlock(col.id, blockId),
              onMoveBlock: (blockId, dir) => ops.onMoveBlock(col.id, blockId, dir),
            }
          }
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
        />
      ))}
    </div>
  );
}
