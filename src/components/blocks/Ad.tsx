"use client";
import type { AdBlock } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";
function Render({ block, editing, onChange }: BlockRenderProps<AdBlock>) {
  // The ad renders identically while editing and while printing (no in-flow
  // controls), so the canvas is WYSIWYG. Editing-only controls live in the
  // separate Article Panel now.
  const MM_TO_PX = 96 / 25.4;

  const body = block.image ? (
    <div style={{ position: "relative", width: "100%", height: block.heightMm ? `${block.heightMm}mm` : undefined, overflow: "hidden" }}>
      <img
        src={block.image.url}
        alt=""
        style={{
          width: "100%",
          height: block.heightMm ? "100%" : undefined,
          display: "block",
          objectFit: "cover",
          objectPosition: `${block.image.focalX * 100}% ${block.image.focalY * 100}%`,
        }}
      />
      {editing && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            const el = e.currentTarget.parentElement;
            const zoom = el && el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1;
            const startHeightMm = block.heightMm ?? (el ? el.getBoundingClientRect().height / (MM_TO_PX * zoom) : 50);
            const startY = e.clientY;
            const onMove = (ev: PointerEvent) => {
              const dy = ev.clientY - startY;
              const newHeightMm = Math.max(10, startHeightMm + dy / (MM_TO_PX * zoom));
              onChange({ ...block, heightMm: newHeightMm });
            };
            const onUp = () => {
              window.removeEventListener("pointermove", onMove);
              window.removeEventListener("pointerup", onUp);
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "rgba(37,99,235,0.1)",
            cursor: "ns-resize",
            touchAction: "none",
          }}
        />
      )}
    </div>
  ) : (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: block.heightMm ? `${block.heightMm}mm` : undefined,
        minHeight: "30mm",
        border: "0.4pt dashed #999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#999",
        fontSize: "0.9em",
      }}
    >
      {block.placeholderText ?? "आपका विज्ञापन यहाँ"}
      {editing && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            const el = e.currentTarget.parentElement;
            const zoom = el && el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1;
            const startHeightMm = block.heightMm ?? (el ? el.getBoundingClientRect().height / (MM_TO_PX * zoom) : 30);
            const startY = e.clientY;
            const onMove = (ev: PointerEvent) => {
              const dy = ev.clientY - startY;
              const newHeightMm = Math.max(10, startHeightMm + dy / (MM_TO_PX * zoom));
              onChange({ ...block, heightMm: newHeightMm });
            };
            const onUp = () => {
              window.removeEventListener("pointermove", onMove);
              window.removeEventListener("pointerup", onUp);
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "rgba(37,99,235,0.1)",
            cursor: "ns-resize",
            touchAction: "none",
          }}
        />
      )}
    </div>
  );

  return body;
}

const AdBlockDef: BlockDef<AdBlock> = {
  type: "ad",
  label: "विज्ञापन",
  create: () => ({ id: newId(), type: "ad" }),
  Render,
};

export default AdBlockDef;
