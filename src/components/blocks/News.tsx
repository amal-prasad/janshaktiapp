"use client";
import type { CSSProperties } from "react";
import type { NewsBlock } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";
import { usePrintContext } from "@/components/editor/printContext";
import dynamic from "next/dynamic";
// Loaded only in the browser, only while editing: ImagePicker pulls in the
// Firebase client SDK, and this component is server-rendered by /print.
const ImagePicker = dynamic(() => import("@/components/editor/ImagePicker"), { ssr: false });


function Render({ block, editing, onChange }: BlockRenderProps<NewsBlock>) {
  const { editionId, placedMm } = usePrintContext();
  const headlineStyle: CSSProperties = {
    fontWeight: 700,
    fontSize: `${1.6 * (block.headlineScale ?? 1)}em`,
    lineHeight: 1.15,
    marginBottom: "1mm",
  };

  return (
    <div style={{ width: "100%" }}>
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

      {/* While editing, ImagePicker already shows this photo in its own
          focal-point preview above -- rendering it again here duplicated
          every uploaded photo on the canvas. */}
      {block.image && !editing && (
        <div style={{ marginBottom: "1mm" }}>
          <img
            src={block.image.url}
            alt=""
            style={{
              width: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition: `${block.image.focalX * 100}% ${block.image.focalY * 100}%`,
            }}
          />
          {block.image.caption && (
            <div style={{ fontStyle: "italic", fontSize: "0.7em", marginTop: "0.5mm" }}>
              {block.image.caption}
            </div>
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
          columnCount: 2,
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
  );
}

const NewsBlockDef: BlockDef<NewsBlock> = {
  type: "news",
  label: "समाचार",
  create: () => ({ id: newId(), type: "news", headline: "", body: "" }),
  Render,
};

export default NewsBlockDef;
