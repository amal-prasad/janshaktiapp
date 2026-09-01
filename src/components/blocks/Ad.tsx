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

  if (block.image) {
    // While editing, ImagePicker already shows this photo in its own
    // focal-point preview -- rendering it again here duplicated every
    // uploaded photo on the canvas.
    if (editing) {
      return <div style={{ width: "100%" }}>{picker}</div>;
    }
    return (
      <div style={{ width: "100%" }}>
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
      </div>
    );
  }

  return (
    <>
      {picker}
    <div
      style={{
        width: "100%",
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
