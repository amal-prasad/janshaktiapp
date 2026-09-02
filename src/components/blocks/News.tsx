"use client";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type { NewsBlock } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";
import { usePrintContext } from "@/components/editor/printContext";
import dynamic from "next/dynamic";
// Loaded only in the browser, only while editing: ImagePicker pulls in the
// Firebase client SDK, and this component is server-rendered by /print.
const ImagePicker = dynamic(() => import("@/components/editor/ImagePicker"), { ssr: false });

const MM_TO_PX = 96 / 25.4; // ponytail: same conversion as PageCanvas.tsx, not exported there

function Render({ block, editing, onChange }: BlockRenderProps<NewsBlock>) {
  const { editionId, placedMm } = usePrintContext();
  const figureRef = useRef<HTMLDivElement>(null);
  const draggingFocalRef = useRef(false);
  const resizeRef = useRef<{ x: number; y: number; widthPct: number; heightMm: number } | null>(
    null
  );

  const headlineStyle: CSSProperties = {
    fontWeight: 700,
    fontSize: `${1.6 * (block.headlineScale ?? 1)}em`,
    lineHeight: 1.15,
    marginBottom: "1mm",
  };

  const image = block.image;
  const wrapping = image?.float === "left" || image?.float === "right";
  const blockHeightMm = block.heightMm ?? 90;
  // image.heightMm can outlive a block resize (dragged before heightMm shrank the
  // box) -- clamp so `cover` never zooms into a crop taller than what's shown.
  const imgHeightMm = image?.heightMm ? Math.min(image.heightMm, blockHeightMm) : undefined;

  const setFocalFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    const el = figureRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    onChange({ ...block, image: { ...image, focalX: x, focalY: y } });
  };

  return (
    <div style={{ width: "100%" }}>
      {editing && (
        <label className="mb-1 block text-xs text-gray-600">
          ऊँचाई (मिमी){" "}
          <input
            type="number"
            className="w-20 rounded border border-gray-300 px-1 text-xs"
            value={block.heightMm ?? 90}
            onChange={(e) => onChange({ ...block, heightMm: Number(e.target.value) || 90 })}
          />
        </label>
      )}
      <div style={{ height: `${block.heightMm ?? 90}mm`, overflow: "hidden" }}>
      <div
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={(e) =>
          editing && onChange({ ...block, headline: e.currentTarget.textContent ?? "" })
        }
        style={headlineStyle}
      >
        {block.headline}
      </div>

      {(editing || block.byline) && (
        <div
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={(e) =>
            editing && onChange({ ...block, byline: e.currentTarget.textContent ?? "" })
          }
          style={{ fontStyle: "italic", fontSize: "0.8em", marginBottom: "1mm" }}
        >
          {block.byline}
        </div>
      )}

      {editing && (
        <ImagePicker
          editionId={editionId}
          image={block.image}
          placedMm={placedMm}
          onChange={(next) => onChange({ ...block, image: next })}
        />
      )}

      {image && (
        <div
          ref={figureRef}
          style={{
            position: "relative",
            width: `${image.widthPct ?? 100}%`,
            float:
              image.float === "left" ? "left" : image.float === "right" ? "right" : "none",
            marginRight: image.float === "left" ? "3mm" : undefined,
            marginLeft: image.float === "right" ? "3mm" : undefined,
            marginBottom: image.float === "left" || image.float === "right" ? "1mm" : "2mm",
            touchAction: editing ? "none" : undefined,
            cursor: editing ? "crosshair" : undefined,
            userSelect: editing ? "none" : undefined,
          }}
          onPointerDown={editing ? (e) => {
            draggingFocalRef.current = true;
            setFocalFromEvent(e);
          } : undefined}
          onPointerMove={editing ? (e) => {
            if (draggingFocalRef.current) setFocalFromEvent(e);
          } : undefined}
          onPointerUp={editing ? () => {
            draggingFocalRef.current = false;
          } : undefined}
          onPointerLeave={editing ? () => {
            draggingFocalRef.current = false;
          } : undefined}
        >
          <img
            src={image.url}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              display: "block",
              objectFit: imgHeightMm ? "cover" : undefined,
              height: imgHeightMm ? `${imgHeightMm}mm` : "auto",
              objectPosition: `${image.focalX * 100}% ${image.focalY * 100}%`,
            }}
          />
          {editing ? (
            <input
              type="text"
              value={image.caption ?? ""}
              onChange={(e) => onChange({ ...block, image: { ...image, caption: e.target.value } })}
              placeholder="कैप्शन"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
            />
          ) : (
            image.caption && (
              <div style={{ fontStyle: "italic", fontSize: "0.7em", marginTop: "0.5mm" }}>
                {image.caption}
              </div>
            )
          )}

          {editing && (
            <>
              <div
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{
                  left: `${image.focalX * 100}%`,
                  top: `${image.focalY * 100}%`,
                  background: "rgba(37,99,235,0.8)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "-1.5em",
                  left: 0,
                  display: "flex",
                  gap: "2px",
                }}
              >
                <button
                  type="button"
                  className="rounded bg-white px-1 text-xs shadow"
                  onClick={() => onChange({ ...block, image: { ...image, float: "left" } })}
                >
                  बाएँ
                </button>
                <button
                  type="button"
                  className="rounded bg-white px-1 text-xs shadow"
                  onClick={() => onChange({ ...block, image: { ...image, float: "right" } })}
                >
                  दाएँ
                </button>
                <button
                  type="button"
                  className="rounded bg-white px-1 text-xs shadow"
                  onClick={() => onChange({ ...block, image: { ...image, float: "full" } })}
                >
                  पूरा
                </button>
                <button
                  type="button"
                  className="rounded bg-white px-1 text-xs shadow"
                  onClick={() => {
                    const next = { ...image };
                    delete next.heightMm;
                    onChange({ ...block, image: next });
                  }}
                >
                  स्वतः ऊँचाई
                </button>
              </div>

              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const el = figureRef.current;
                  const parentWidthPx = el?.parentElement?.getBoundingClientRect().width ?? 1;
                  // PageCanvas draws the sheet under a CSS `transform: scale()`, so client
                  // pixels are zoomed. offsetWidth is the unscaled layout width, so their
                  // ratio recovers the live zoom without threading it down as a prop.
                  // Width is a ratio of two client rects, so zoom cancels there -- only the
                  // mm height conversion needs it.
                  const zoom = el && el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
                  resizeRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    widthPct: image.widthPct ?? 100,
                    heightMm: image.heightMm ?? (el?.getBoundingClientRect().height ?? 0) / (MM_TO_PX * zoom),
                  };
                  const parentWidth = parentWidthPx;
                  const onMove = (ev: PointerEvent) => {
                    const start = resizeRef.current;
                    if (!start) return;
                    const dx = ev.clientX - start.x;
                    const dy = ev.clientY - start.y;
                    const newWidthPct = Math.min(
                      100,
                      Math.max(20, start.widthPct + (dx / parentWidth) * 100)
                    );
                    const newHeightMm = Math.min(
                      blockHeightMm,
                      Math.max(10, start.heightMm + dy / (MM_TO_PX * zoom))
                    );
                    onChange({
                      ...block,
                      image: { ...image, widthPct: newWidthPct, heightMm: newHeightMm },
                    });
                  };
                  const onUp = () => {
                    resizeRef.current = null;
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                }}
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: "10px",
                  height: "10px",
                  background: "rgba(37,99,235,0.9)",
                  cursor: "nwse-resize",
                  touchAction: "none",
                }}
              />
            </>
          )}
        </div>
      )}

      <div
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={(e) =>
          editing && onChange({ ...block, body: e.currentTarget.textContent ?? "" })
        }
        style={{
          columnCount: wrapping ? 1 : 2,
          columnGap: "4mm",
          hyphens: "none",
          fontSize: "0.95em",
          lineHeight: 1.4,
          textAlign: "justify",
        }}
      >
        {block.body}
      </div>
      </div>
    </div>
  );
}

const NewsBlockDef: BlockDef<NewsBlock> = {
  type: "news",
  label: "समाचार",
  create: () => ({ id: newId(), type: "news", headline: "", body: "" }),
  Render,
};

export default NewsBlockDef;
