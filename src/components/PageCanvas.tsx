"use client";
import { useEffect, useRef, useState } from "react";
import RowView, { type RowOps } from "@/components/RowView";
import SlotRender from "@/components/headers/SlotRender";
import InnerPageHeader from "@/components/headers/InnerPageHeader";
import { addBlock, moveBlock, removeBlock, updateBlock } from "@/components/editor/rowOps";
import { setSlot } from "@/lib/edition";
import type { HeaderSlot, PageSizeMm, Row, SlotConfig } from "@/lib/types";

const MM_TO_PX = 96 / 25.4;

type Props = {
  rows: Row[];
  editionId: string;
  onRowsChange: (rows: Row[]) => void;
  pageSizeMm: PageSizeMm;
  /** Same slots the print route renders, so the canvas is a true preview. */
  slots: Record<HeaderSlot, SlotConfig>;
  /** Headers only exist on the first page, matching print/[id]/page.tsx. */
  pageIndex: number;
  readOnly?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
};

/** Renders one page as a true-size sheet (mm), scaled with a transform to fit the viewport. */
export default function PageCanvas({
  rows,
  editionId,
  onRowsChange,
  pageSizeMm,
  slots,
  pageIndex,
  readOnly,
  selectedBlockId,
  onSelectBlock,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  const pageWpx = pageSizeMm.w * MM_TO_PX;
  const pageHpx = pageSizeMm.h * MM_TO_PX;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setFitScale(Math.min(width / pageWpx, height / pageHpx, 1) || 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageWpx, pageHpx]);

  const touchDist = (t: React.TouchList) => {
    const a = t[0];
    const b = t[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStart.current = { dist: touchDist(e.touches), zoom };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      e.preventDefault();
      const ratio = touchDist(e.touches) / pinchStart.current.dist;
      setZoom(Math.min(3, Math.max(0.5, pinchStart.current.zoom * ratio)));
    }
  };
  const onTouchEnd = () => {
    pinchStart.current = null;
  };

  const scale = fitScale * zoom;

  const rowOps = (rowId: string): RowOps => ({
    onAddBlock: (colId, block) => onRowsChange(addBlock(rows, rowId, colId, block)),
    onUpdateBlock: (colId, blockId, next) => onRowsChange(updateBlock(rows, rowId, colId, blockId, next)),
    onRemoveBlock: (colId, blockId) => onRowsChange(removeBlock(rows, rowId, colId, blockId)),
    onMoveBlock: (colId, blockId, dir) => onRowsChange(moveBlock(rows, rowId, colId, blockId, dir)),
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-end gap-2 p-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          −
        </button>
        <span className="self-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          +
        </button>
      </div>

      <div
        ref={wrapRef}
        className="relative flex-1 overflow-auto bg-gray-200"
        style={{ touchAction: "none" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/*
          A transform does not shrink the layout box, so the sheet must sit inside a
          spacer sized to the *scaled* dimensions. Centre with margin on that spacer,
          never with justify-center on the scroll container -- an overflowing centred
          flex item puts its left edge at unreachable negative x, and any click that
          focuses a descendant then snaps scrollLeft and slides the page sideways.
        */}
        <div style={{ width: pageWpx * scale, height: pageHpx * scale, margin: "auto" }}>
          <div
            className="page-sheet shadow-lg"
            style={
              {
                "--page-w": `${pageSizeMm.w}mm`,
                "--page-h": `${pageSizeMm.h}mm`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              } as React.CSSProperties
            }
          >
            {pageIndex === 0 && <SlotRender slot="header" config={slots.header} editing={!readOnly} onChange={(config) => setSlot(editionId, "header", config)} />}
            {pageIndex === 0 && <SlotRender slot="header2" config={slots.header2} editing={!readOnly} onChange={(config) => setSlot(editionId, "header2", config)} />}
            {pageIndex > 0 && <InnerPageHeader pageIndex={pageIndex} datePlace={slots.header?.fields?.datePlace} />}

            {rows.map((row) => (
              <RowView
                key={row.id}
                row={row}
                editionId={editionId}
                pageWmm={pageSizeMm.w}
                ops={readOnly ? undefined : rowOps(row.id)}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
