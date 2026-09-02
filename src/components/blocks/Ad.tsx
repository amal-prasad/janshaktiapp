"use client";
import type { AdBlock } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";
import { usePrintContext } from "@/components/editor/printContext";
import dynamic from "next/dynamic";
// Loaded only in the browser, only while editing: ImagePicker pulls in the
// Firebase client SDK, and this component is server-rendered by /print.
const ImagePicker = dynamic(() => import("@/components/editor/ImagePicker"), { ssr: false });


function Render({ block, editing, onChange }: BlockRenderProps<AdBlock>) {
  const { editionId, placedMm } = usePrintContext();
  const picker = editing ? (
    <ImagePicker
      editionId={editionId}
      image={block.image}
      placedMm={placedMm}
      onChange={(next) => onChange({ ...block, image: next })}
    />
  ) : null;

  // The ad itself renders identically while editing and while printing, so the
  // canvas is WYSIWYG. ImagePicker is controls-only (upload / caption / dpi) and
  // no longer previews the photo, so there is exactly one copy on screen.
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

  if (!editing) return body;

  return (
    <>
      {picker}
      {body}
      <div style={{ marginTop: 4 }}>
        <label className="text-xs text-gray-600">
          ऊँचाई (मिमी){" "}
          <input
            type="number"
            className="w-20 rounded border border-gray-300 px-1 text-xs"
            value={block.heightMm ?? ""}
            onChange={(e) =>
              onChange({ ...block, heightMm: e.target.value === "" ? undefined : Number(e.target.value) })
            }
          />
        </label>
      </div>
    </>
  );
}

const AdBlockDef: BlockDef<AdBlock> = {
  type: "ad",
  label: "विज्ञापन",
  create: () => ({ id: newId(), type: "ad" }),
  Render,
};

export default AdBlockDef;
