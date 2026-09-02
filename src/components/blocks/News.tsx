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
  const bodyRef = useRef<HTMLDivElement>(null);
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
  const imgFloat = image?.float ?? "left";
  const wrapping = imgFloat === "left" || imgFloat === "right";
  const blockHeightMm = block.heightMm ?? 90;
  // image.heightMm can outlive a block resize (dragged before heightMm shrank the
  // box) -- clamp so `cover` never zooms into a crop taller than what's shown.
  const imgHeightMm = image?.heightMm ? Math.min(image.heightMm, blockHeightMm) : undefined;
  
  const defaultWidthPct = (25.4 / Math.max(placedMm, 1)) * 100;
  const initialWidthPct = image?.widthPct ?? Math.min(100, defaultWidthPct);

  const setFocalFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    const el = figureRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    onChange({ ...block, image: { ...image, focalX: x, focalY: y } });
  };

  const startImageResize = (e: React.PointerEvent, type: 'w' | 'h' | 'both') => {
    e.stopPropagation();
    const el = figureRef.current;
    if (!el || !image) return;
    const parentWidthPx = el.parentElement?.getBoundingClientRect().width ?? 1;
    const zoom = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    resizeRef.current = {
      x: e.clientX,
      y: e.clientY,
      widthPct: initialWidthPct,
      heightMm: image.heightMm ?? el.getBoundingClientRect().height / (MM_TO_PX * zoom),
    };
    const onMove = (ev: PointerEvent) => {
      const start = resizeRef.current;
      if (!start) return;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      
      const newWidthPct = type === 'w' || type === 'both' 
        ? Math.min(100, Math.max(20, start.widthPct + (dx / parentWidthPx) * 100))
        : start.widthPct;
        
      const newHeightMm = type === 'h' || type === 'both'
        ? Math.min(blockHeightMm, Math.max(10, start.heightMm + dy / (MM_TO_PX * zoom)))
        : start.heightMm;
        
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
  };

  return (
    <div style={{ width: "100%" }}>
      {editing && (
        <div className="flex gap-4 mb-1">
          <label className="block text-xs text-gray-600">
            ऊँचाई (मिमी){" "}
            <input
              type="number"
              className="w-16 rounded border border-gray-300 px-1 text-xs"
              value={block.heightMm ?? 90}
              onChange={(e) => onChange({ ...block, heightMm: Number(e.target.value) || 90 })}
            />
          </label>
          <label className="block text-xs text-gray-600">
            कॉलम{" "}
            <select
              className="rounded border border-gray-300 px-1 text-xs"
              value={block.columns ?? (wrapping ? 1 : 2)}
              onChange={(e) => onChange({ ...block, columns: Number(e.target.value) })}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>
        </div>
      )}
      <div 
        style={{ position: "relative", height: `${block.heightMm ?? 90}mm`, overflow: "hidden" }}
        onClick={(e) => {
          if (editing && e.target === e.currentTarget && bodyRef.current) {
            bodyRef.current.focus();
          }
        }}
      >
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

      <div
        style={{
          columnCount: block.columns ?? (wrapping ? 1 : 2),
          columnGap: "4mm",
          height: "100%", // Ensures the column wrapper spans available height to make it clickable
        }}
        onClick={(e) => {
          if (editing && e.target === e.currentTarget && bodyRef.current) {
            bodyRef.current.focus();
          }
        }}
      >
      {image && (
        <div
          ref={figureRef}
          style={{
            position: "relative",
            width: `${initialWidthPct}%`,
            float:
              imgFloat === "left" ? "left" : imgFloat === "right" ? "right" : "none",
            columnSpan: imgFloat === "full" ? "all" : "none",
            marginRight: imgFloat === "left" ? "3mm" : undefined,
            marginLeft: imgFloat === "right" ? "3mm" : undefined,
            marginBottom: wrapping ? "1mm" : "2mm",
            breakInside: "avoid",
            pageBreakInside: "avoid",
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
              maxHeight: imgHeightMm ? undefined : `${blockHeightMm}mm`,
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

              {/* E resize handle (width only) */}
              <div
                onPointerDown={(e) => startImageResize(e, 'w')}
                style={{
                  position: "absolute",
                  right: -5,
                  top: 0,
                  bottom: 0,
                  width: "10px",
                  cursor: "ew-resize",
                  touchAction: "none",
                  zIndex: 10,
                }}
              />
              {/* S resize handle (height only) */}
              <div
                onPointerDown={(e) => startImageResize(e, 'h')}
                style={{
                  position: "absolute",
                  bottom: -5,
                  left: 0,
                  right: 0,
                  height: "10px",
                  cursor: "ns-resize",
                  touchAction: "none",
                  zIndex: 10,
                }}
              />
              {/* SE resize handle (both) */}
              <div
                onPointerDown={(e) => startImageResize(e, 'both')}
                style={{
                  position: "absolute",
                  right: -4,
                  bottom: -4,
                  width: "12px",
                  height: "12px",
                  background: "rgba(37,99,235,0.9)",
                  cursor: "nwse-resize",
                  touchAction: "none",
                  zIndex: 20,
                  borderRadius: "2px",
                }}
              />
            </>
          )}
        </div>
      )}

      <div
        ref={bodyRef}
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={(e) =>
          editing && onChange({ ...block, body: e.currentTarget.textContent ?? "" })
        }
        className="empty:before:content-['यहाँ_टेक्स्ट_लिखें...'] empty:before:text-gray-400 focus:outline-none"
        style={{
          minHeight: "2em",
          hyphens: "none",
          fontSize: "0.95em",
          lineHeight: 1.4,
          textAlign: "left",
        }}
      >
        {block.body}
      </div>
      </div>

      {editing && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            const el = e.currentTarget.parentElement;
            const zoom = el && el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1;
            const startHeightMm = block.heightMm ?? 90;
            const startY = e.clientY;
            const onMove = (ev: PointerEvent) => {
              const dy = ev.clientY - startY;
              const newHeightMm = Math.max(20, startHeightMm + dy / (MM_TO_PX * zoom));
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
