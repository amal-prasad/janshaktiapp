"use client";
import { useMemo, useState, type ComponentType } from "react";
import { BLOCKS } from "@/components/blocks";
import type { BlockRenderProps } from "@/components/blocks/registry";
import type { Block, BlockType, Column } from "@/lib/types";
import { columnWidthMm } from "@/lib/dpi";
import { PrintContext } from "./printContext";
import ElementsPanel from "./ElementsPanel";

type Props = {
  col: Column;
  editionId: string;
  pageWmm: number;
  readOnly?: boolean;
  onAddBlock: (block: Block) => void;
  onUpdateBlock: (blockId: string, next: Block) => void;
  onRemoveBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, dir: "up" | "down") => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
};

export default function ColumnCell({
  col,
  editionId,
  pageWmm,
  readOnly,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
  selectedBlockId,
  onSelectBlock,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hideAdd, setHideAdd] = useState(false);

  // Printed width of this column, so image blocks can judge their own dpi.
  const print = useMemo(
    () => ({ editionId, placedMm: columnWidthMm(col.span, pageWmm) }),
    [editionId, col.span, pageWmm]
  );

  const pick = (type: BlockType) => {
    onAddBlock(BLOCKS[type].create());
    setPickerOpen(false);
  };

  return (
    <PrintContext.Provider value={print}>
    <div
      className={`group/col min-h-[40px] ${
        !readOnly && col.blocks.length === 0 ? "border border-dashed border-gray-300" : ""
      }`}
      style={{ display: "flex", flexDirection: "column", gap: "3mm" }}
    >
      {col.blocks.map((b, i) => {
        const def = BLOCKS[b.type];
        const Render = def.Render as ComponentType<BlockRenderProps<Block>>;
        return (
          <div
            key={b.id}
            className={`group relative ${
              !readOnly && b.id === selectedBlockId ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => !readOnly && onSelectBlock?.(b.id)}
          >
            {!readOnly && (
              <div className="absolute right-0 top-0 z-10 hidden gap-1 bg-white/90 p-0.5 text-xs group-hover:flex">
                <button
                  disabled={i === 0}
                  onClick={() => onMoveBlock(b.id, "up")}
                  className="px-1 disabled:opacity-30"
                  title="ऊपर ले जाएँ"
                >
                  ↑
                </button>
                <button
                  disabled={i === col.blocks.length - 1}
                  onClick={() => onMoveBlock(b.id, "down")}
                  className="px-1 disabled:opacity-30"
                  title="नीचे ले जाएँ"
                >
                  ↓
                </button>
                <button
                  onClick={() => onRemoveBlock(b.id)}
                  className="px-1 text-red-600"
                  title="हटाएँ"
                >
                  ✕
                </button>
              </div>
            )}
            <Render
              block={b}
              editing={!readOnly}
              onChange={(next: Block) => onUpdateBlock(b.id, next)}
            />
          </div>
        );
      })}

      {!readOnly && !hideAdd && (
        <div
          className={`flex w-full items-center transition-opacity ${
            col.blocks.length > 0 ? "opacity-0 group-hover/col:opacity-100" : ""
          }`}
        >
          <button
            onClick={() => setPickerOpen(true)}
            className="flex flex-1 items-center justify-center py-2 text-lg text-gray-400 hover:bg-gray-50"
            title="एलिमेंट जोड़ें"
          >
            +
          </button>
          {col.blocks.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHideAdd(true);
              }}
              className="flex items-center justify-center px-4 py-2 text-lg text-red-500 hover:bg-red-50"
              title="यह जोड़ें बटन छिपाएँ"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {pickerOpen && <ElementsPanel onPick={pick} onClose={() => setPickerOpen(false)} />}
    </div>
    </PrintContext.Provider>
  );
}
