"use client";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type { ImageRef, NewsBlock } from "@/lib/types";
import { newsImages, withNewsImages } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";
import { usePrintContext } from "@/components/editor/printContext";
import { fontStack } from "@/lib/fonts";
import { bodyToHtml, htmlToText, sanitizeHtml } from "@/lib/richText";

const MM_TO_PX = 96 / 25.4; // ponytail: same conversion as PageCanvas.tsx, not exported there

type FigureProps = {
  image: ImageRef;
  editing: boolean;
  /** true when the photo lives in the shared full-width strip above the text */
  inStrip: boolean;
  blockHeightMm: number;
  placedMm: number;
  onChange: (next: ImageRef) => void;
  onRemove: () => void;
};

function ImageFigure({
  image,
  editing,
  inStrip,
  blockHeightMm,
  placedMm,
  onChange,
  onRemove,
}: FigureProps) {
  const figureRef = useRef<HTMLDivElement>(null);
  const draggingFocalRef = useRef(false);
  const resizeRef = useRef<{ x: number; y: number; widthPct: number; heightMm: number } | null>(
    null
  );

  const imgFloat = image.float ?? "left";
  const wrapping = imgFloat === "left" || imgFloat === "right";
  // Non-wrapping photos span every text column, so they can sit anywhere across
  // the article box. Legacy blocks stored that as float:"center" with no align.
  const imgAlign = image.align ?? (imgFloat === "center" ? "center" : "left");
  // image.heightMm can outlive a block resize (dragged before heightMm shrank the
  // box) -- clamp so `cover` never zooms into a crop taller than what's shown.
  const imgHeightMm = image.heightMm ? Math.min(image.heightMm, blockHeightMm) : undefined;

  const defaultWidthPct = (25.4 / Math.max(placedMm, 1)) * 100;
  const initialWidthPct = image.widthPct ?? Math.min(100, defaultWidthPct);

  const setFocalFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = figureRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    onChange({ ...image, focalX: x, focalY: y });
  };

  const startImageResize = (e: React.PointerEvent, type: "w" | "h" | "both") => {
    e.stopPropagation();
    const el = figureRef.current;
    if (!el) return;
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

      const newWidthPct =
        type === "w" || type === "both"
          ? Math.min(100, Math.max(20, start.widthPct + (dx / parentWidthPx) * 100))
          : start.widthPct;

      const newHeightMm =
        type === "h" || type === "both"
          ? Math.min(blockHeightMm, Math.max(10, start.heightMm + dy / (MM_TO_PX * zoom)))
          : start.heightMm;

      onChange({ ...image, widthPct: newWidthPct, heightMm: newHeightMm });
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // In the strip the photos divide the full width between them (widthPct is a
  // share, not an absolute), so the row never leaves a hole for the text to
  // fall short of. Outside it, widthPct is the column width as before.
  const placement: CSSProperties = inStrip
    ? { flex: `${initialWidthPct} 1 0`, minWidth: 0 }
    : {
        width: `${initialWidthPct}%`,
        float: wrapping ? imgFloat : "none",
        columnSpan: wrapping ? "none" : "all",
        // Wrapping photos only need a gutter on the text side. Spanning ones
        // are positioned by auto margins: left = 0/auto, centre = auto/auto,
        // right = auto/0.
        marginLeft: wrapping
          ? imgFloat === "right"
            ? "3mm"
            : undefined
          : imgAlign === "left"
            ? 0
            : "auto",
        marginRight: wrapping
          ? imgFloat === "left"
            ? "3mm"
            : undefined
          : imgAlign === "right"
            ? 0
            : "auto",
        marginBottom: 0,
      };

  return (
    <div
      ref={figureRef}
      style={{
        position: "relative",
        ...placement,
        breakInside: "avoid",
        pageBreakInside: "avoid",
        touchAction: editing ? "none" : undefined,
        cursor: editing ? "crosshair" : undefined,
        userSelect: editing ? "none" : undefined,
        display: "flex",
        flexDirection: "column",
      }}
      onPointerDown={
        editing
          ? (e) => {
              draggingFocalRef.current = true;
              setFocalFromEvent(e);
            }
          : undefined
      }
      onPointerMove={
        editing
          ? (e) => {
              if (draggingFocalRef.current) setFocalFromEvent(e);
            }
          : undefined
      }
      onPointerUp={editing ? () => { draggingFocalRef.current = false; } : undefined}
      onPointerLeave={editing ? () => { draggingFocalRef.current = false; } : undefined}
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
      {image.caption && (
        <div style={{ fontStyle: "italic", fontSize: "0.7em", marginTop: "0.5mm" }}>
          {image.caption}
        </div>
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
              title="ऊपर की पंक्ति में (बाएँ से दाएँ)"
              className={`rounded px-1 text-xs shadow ${imgFloat === "top" ? "bg-blue-200" : "bg-white"}`}
              onClick={() => onChange({ ...image, float: "top" })}
            >
              ऊपर
            </button>
            <button
              type="button"
              className={`rounded px-1 text-xs shadow ${imgFloat === "left" ? "bg-blue-200" : "bg-white"}`}
              onClick={() => onChange({ ...image, float: "left" })}
            >
              बाएँ
            </button>
            <button
              type="button"
              className={`rounded px-1 text-xs shadow ${imgFloat === "right" ? "bg-blue-200" : "bg-white"}`}
              onClick={() => onChange({ ...image, float: "right" })}
            >
              दाएँ
            </button>
            <button
              type="button"
              className={`rounded px-1 text-xs shadow ${!wrapping && imgFloat !== "top" ? "bg-blue-200" : "bg-white"}`}
              onClick={() => onChange({ ...image, float: "full" })}
            >
              पूरा
            </button>
            {!wrapping && imgFloat !== "top" && (
              <>
                <span className="px-1 text-xs text-gray-500">◦</span>
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    title={a === "left" ? "बाएँ किनारे" : a === "center" ? "बीच में" : "दाएँ किनारे"}
                    className={`rounded px-1 text-xs shadow ${imgAlign === a ? "bg-blue-200" : "bg-white"}`}
                    onClick={() => onChange({ ...image, float: "full", align: a })}
                  >
                    {a === "left" ? "◧" : a === "center" ? "▣" : "◨"}
                  </button>
                ))}
              </>
            )}
            <button
              type="button"
              className="rounded bg-white px-1 text-xs shadow"
              onClick={() => {
                const next = { ...image };
                delete next.heightMm;
                onChange(next);
              }}
            >
              स्वतः ऊँचाई
            </button>
            <button
              type="button"
              title="यह फ़ोटो हटाएँ"
              className="rounded bg-white px-1 text-xs text-red-600 shadow"
              onClick={onRemove}
            >
              ✕
            </button>
          </div>

          {/* E resize handle (width only) */}
          <div
            onPointerDown={(e) => startImageResize(e, "w")}
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
            onPointerDown={(e) => startImageResize(e, "h")}
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
            onPointerDown={(e) => startImageResize(e, "both")}
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
  );
}

function Render({ block, editing, onChange, onResizeHeight }: BlockRenderProps<NewsBlock>) {
  const { placedMm } = usePrintContext();
  const bodyRef = useRef<HTMLDivElement>(null);
  const columnWrapRef = useRef<HTMLDivElement>(null);

  const headlineStyle: CSSProperties = {
    fontWeight: 700,
    fontSize: `${1.6 * (block.headlineScale ?? 1)}em`,
    lineHeight: 1.15,
    marginBottom: "1mm",
  };

  const images = newsImages(block);
  const stripImages = images.filter((i) => i.float === "top");
  const flowImages = images.filter((i) => i.float !== "top");
  // Text only needs to collapse to one column while it wraps a floated photo.
  const wrapping = flowImages.some((i) => (i.float ?? "left") === "left" || i.float === "right");
  const blockHeightMm = block.heightMm ?? 90;

  const replaceImage = (target: ImageRef, next: ImageRef | null) => {
    const idx = images.indexOf(target);
    if (idx < 0) return;
    const nextImages = [...images];
    if (next) nextImages[idx] = next;
    else nextImages.splice(idx, 1);
    onChange(withNewsImages(block, nextImages));
  };

  const figureProps = (image: ImageRef, inStrip: boolean) => ({
    image,
    editing,
    inStrip,
    blockHeightMm,
    placedMm,
    onChange: (next: ImageRef) => replaceImage(image, next),
    onRemove: () => replaceImage(image, null),
  });

  return (
    <div style={{ width: "100%", fontFamily: fontStack(block.fontFamily) }}>
      <div
        style={{ position: "relative", display: "flex", flexDirection: "column", height: `${blockHeightMm}mm`, overflow: "hidden", contain: "paint" }}
        onClick={(e) => {
          if (editing && e.target === e.currentTarget && bodyRef.current) {
            bodyRef.current.focus();
          }
        }}
      >
        {(editing || block.subhead) && (
          <div
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={(e) =>
              editing && onChange({ ...block, subhead: (e.currentTarget.textContent ?? "").normalize("NFC") })
            }
            className="empty:before:content-['सबहेडर'] empty:before:text-gray-400 focus:outline-none"
            style={{
              color: "#dc2626", // Red text to match the example kicker
              fontWeight: 700,
              fontSize: `${1.1 * (block.headlineScale ?? 1)}em`,
              marginBottom: "0.5mm",
            }}
          >
            {block.subhead?.normalize("NFC")}
          </div>
        )}

        <div
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={(e) =>
            editing && onChange({ ...block, headline: (e.currentTarget.textContent ?? "").normalize("NFC") })
          }
          style={headlineStyle}
        >
          {block.headline?.normalize("NFC")}
        </div>

        {(editing || block.byline) && (
          <div
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={(e) =>
              editing && onChange({ ...block, byline: (e.currentTarget.textContent ?? "").normalize("NFC") })
            }
            style={{ fontStyle: "italic", fontSize: "0.8em", marginBottom: "1mm" }}
          >
            {block.byline?.normalize("NFC")}
          </div>
        )}

        <div
          ref={columnWrapRef}
          style={{
            columnCount: block.columns ?? (wrapping ? 1 : 2),
            columnGap: "4mm",
            columnFill: "auto",
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "hidden",
          }}
          onClick={(e) => {
            if (editing && e.target === e.currentTarget && bodyRef.current) {
              bodyRef.current.focus();
            }
          }}
        >
          {/* Photo strip: spans every text column so the body picks up at full
              width underneath -- no dead gutter beside a part-width photo. */}
          {stripImages.length > 0 && (
            <div
              style={{
                columnSpan: "all",
                display: "flex",
                alignItems: "flex-start",
                gap: "3mm",
                marginBottom: "2mm",
              }}
            >
              {stripImages.map((img, i) => (
                <ImageFigure key={img.storagePath || i} {...figureProps(img, true)} />
              ))}
            </div>
          )}

          {flowImages.map((img, i) => (
            <ImageFigure key={img.storagePath || i} {...figureProps(img, false)} />
          ))}

          {/* Rich text: the caret lives in the DOM, so we hand React a static
              __html and only read it back on blur -- re-rendering mid-keystroke
              would collapse the selection. TextPanel drives the formatting. */}
          <div
            ref={bodyRef}
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={(e) => {
              if (!editing) return;
              const html = sanitizeHtml(e.currentTarget.innerHTML);
              onChange({ ...block, bodyHtml: html, body: htmlToText(html) });
            }}
            className="news-body empty:before:content-['यहाँ_टेक्स्ट_लिखें...'] empty:before:text-gray-400 focus:outline-none"
            style={{
              minHeight: "2em",
              hyphens: "none",
              fontSize: "0.95em",
              lineHeight: 1.4,
              textAlign: "left",
            }}
            dangerouslySetInnerHTML={{ __html: bodyToHtml(block) }}
          />
        </div>

        {/* ponytail: bar renders always (article-underline design element, wanted
            in print too) but the drag-to-resize behavior stays editing-only. */}
        <div
          onPointerDown={
            editing
              ? (e) => {
                  e.stopPropagation();
                  const el = e.currentTarget.parentElement;
                  const zoom = el && el.offsetHeight ? el.getBoundingClientRect().height / el.offsetHeight : 1;
                  const startHeightMm = block.heightMm ?? 90;
                  const startY = e.clientY;
                  const onMove = (ev: PointerEvent) => {
                    const dy = ev.clientY - startY;
                    const newHeightMm = Math.max(20, startHeightMm + dy / (MM_TO_PX * zoom));
                    if (onResizeHeight) onResizeHeight(newHeightMm);
                    else onChange({ ...block, heightMm: newHeightMm });
                  };
                  const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                }
              : undefined
          }
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "rgba(37,99,235,0.1)",
            cursor: editing ? "ns-resize" : undefined,
            touchAction: "none",
          }}
        />
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
