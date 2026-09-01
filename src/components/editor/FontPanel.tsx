"use client";
import { findBlockLocation, updateBlock } from "@/components/editor/rowOps";
import type { NewsBlock, Row } from "@/lib/types";

type Props = {
  rows: Row[];
  onRowsChange: (rows: Row[]) => void;
  selectedBlockId: string | null;
};

/** हेडलाइन स्केल स्लाइडर — केवल चुने गए न्यूज़ ब्लॉक पर लागू होता है। */
export default function FontPanel({ rows, onRowsChange, selectedBlockId }: Props) {
  const loc = selectedBlockId ? findBlockLocation(rows, selectedBlockId) : null;

  if (!loc || loc.block.type !== "news") {
    return <p className="p-3 text-sm text-gray-500">फ़ॉन्ट बदलने के लिए एक न्यूज़ ब्लॉक चुनें</p>;
  }

  const block = loc.block as NewsBlock;
  const scale = block.headlineScale ?? 1;

  return (
    <div className="space-y-2 p-3">
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
  );
}
