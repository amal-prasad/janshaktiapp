"use client";
import { findBlockLocation, updateBlock } from "@/components/editor/rowOps";
import { FONT_OPTIONS, DEFAULT_FONT_KEY } from "@/lib/fonts";
import type { NewsBlock, Row } from "@/lib/types";

type Props = {
  rows: Row[];
  onRowsChange: (rows: Row[]) => void;
  selectedBlockId: string | null;
};

/** फ़ॉन्ट चयन व हेडलाइन स्केल स्लाइडर — केवल चुने गए न्यूज़ ब्लॉक पर लागू होता है। */
export default function FontPanel({ rows, onRowsChange, selectedBlockId }: Props) {
  const loc = selectedBlockId ? findBlockLocation(rows, selectedBlockId) : null;

  if (!loc || loc.block.type !== "news") {
    return <p className="p-3 text-sm text-gray-500">फ़ॉन्ट बदलने के लिए एक न्यूज़ ब्लॉक चुनें</p>;
  }

  const block = loc.block as NewsBlock;
  const scale = block.headlineScale ?? 1;
  const activeFont = block.fontFamily ?? DEFAULT_FONT_KEY;

  return (
    <div className="space-y-2 p-3">
      <label className="text-sm font-semibold">फ़ॉन्ट परिवार</label>
      <div className="flex flex-wrap gap-1">
        {FONT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            style={{ fontFamily: opt.css }}
            className={`rounded px-2 py-1 text-xs ${
              activeFont === opt.key ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() =>
              onRowsChange(
                updateBlock(rows, loc.rowId, loc.colId, block.id, {
                  ...block,
                  fontFamily: opt.key,
                }),
              )
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-2">
        <label className="text-sm font-semibold">हेडलाइन आकार ({scale.toFixed(1)}x)</label>
        <input
          type="range"
          min={0.5}
          max={2.5}
          step={0.1}
          value={scale}
          onChange={(e) =>
            onRowsChange(
              updateBlock(rows, loc.rowId, loc.colId, block.id, {
                ...block,
                headlineScale: Number(e.target.value),
              }),
            )
          }
          className="w-full"
        />
      </div>
    </div>
  );
}
