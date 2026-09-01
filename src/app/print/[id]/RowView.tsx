"use client";
import { BLOCKS } from "@/components/blocks";
import type { Block, Row } from "@/lib/types";

// Server Components cannot pass function props to Client Components, so this
// print-only, always-non-interactive RowView must own its no-op onChange.
export default function RowView({ row }: { row: Row }) {
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
        <div key={col.id} style={{ display: "flex", flexDirection: "column", gap: "3mm" }}>
          {col.blocks.map((block: Block) => {
            const { Render } = BLOCKS[block.type];
            return <Render key={block.id} block={block} editing={false} onChange={() => {}} />;
          })}
        </div>
      ))}
    </div>
  );
}
