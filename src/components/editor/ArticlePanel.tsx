"use client";
import { findBlockLocation, updateBlock } from "@/components/editor/rowOps";
import ImagePicker from "@/components/editor/ImagePicker";
import TextPanel from "@/components/editor/TextPanel";
import { columnWidthMm } from "@/lib/dpi";
import type { AdBlock, Block, NewsBlock, Row } from "@/lib/types";

type Props = {
  rows: Row[];
  onRowsChange: (rows: Row[]) => void;
  selectedBlockId: string | null;
  editionId: string;
  pageWmm: number;
};

/** आर्टिकल सेटिंग्स पैनल — चुने गए ब्लॉक की ऊँचाई, कॉलम, फ़ोटो व अन्य गुण संपादित करता है। */
export default function ArticlePanel({
  rows,
  onRowsChange,
  selectedBlockId,
  editionId,
  pageWmm,
}: Props) {
  const loc = selectedBlockId ? findBlockLocation(rows, selectedBlockId) : null;

  if (!loc) {
    return <p className="p-3 text-sm text-gray-500">संपादित करने के लिए एक आर्टिकल चुनें</p>;
  }

  const placedMm = columnWidthMm(loc.span, pageWmm);
  const set = (next: Block) =>
    onRowsChange(updateBlock(rows, loc.rowId, loc.colId, loc.block.id, next));

  if (loc.block.type === "news") {
    return (
      <NewsControls block={loc.block as NewsBlock} set={set} editionId={editionId} placedMm={placedMm} />
    );
  }

  if (loc.block.type === "ad") {
    return (
      <AdControls block={loc.block as AdBlock} set={set} editionId={editionId} placedMm={placedMm} />
    );
  }

  return <p className="p-3 text-sm text-gray-500">इस ब्लॉक के लिए कोई सेटिंग उपलब्ध नहीं</p>;
}

function NewsControls({
  block,
  set,
  editionId,
  placedMm,
}: {
  block: NewsBlock;
  set: (next: Block) => void;
  editionId: string;
  placedMm: number;
}) {
  const imgFloat = block.image?.float ?? "left";
  const wrapping = imgFloat === "left" || imgFloat === "right";
  const imgAlign = block.image?.align ?? (imgFloat === "center" ? "center" : "left");
  const columns = block.columns ?? (wrapping ? 1 : 2);
  const scale = block.headlineScale ?? 1;

  return (
    <div className="space-y-3 p-3">
      <TextPanel />

      <div className="space-y-1 border-t border-gray-200 pt-2">
        <label className="text-sm font-semibold">कॉलम</label>
        <select
          className="w-full rounded border border-gray-300 p-1 text-sm"
          value={columns}
          onChange={(e) => set({ ...block, columns: Number(e.target.value) })}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">ऊँचाई (मिमी)</label>
        <input
          type="number"
          className="w-full rounded border border-gray-300 p-1 text-sm"
          value={block.heightMm ?? 90}
          onChange={(e) => set({ ...block, heightMm: Number(e.target.value) || 90 })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">हेडलाइन आकार ({scale.toFixed(1)}x)</label>
        <input
          type="range"
          min={0.5}
          max={2.5}
          step={0.1}
          value={scale}
          onChange={(e) => set({ ...block, headlineScale: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <ImagePicker
        editionId={editionId}
        image={block.image}
        placedMm={placedMm}
        onChange={(next) => set({ ...block, image: next })}
      />

      {block.image && (
        <div className="space-y-3 border-t border-gray-200 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold">टेक्स्ट लपेट</label>
            <div className="flex flex-wrap gap-1">
              {([
                { v: "left", label: "बाएँ लपेटें" },
                { v: "right", label: "दाएँ लपेटें" },
                { v: "full", label: "बिना लपेटे" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${
                    (o.v === "full" ? !wrapping : imgFloat === o.v)
                      ? "bg-blue-200"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => set({ ...block, image: { ...block.image!, float: o.v } })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alignment only means anything once the photo spans the columns --
              a floated photo is already pinned to the edge it wraps against. */}
          {!wrapping && (
            <div className="space-y-1">
              <label className="text-sm font-semibold">आर्टिकल बॉक्स में स्थान</label>
              <div className="flex flex-wrap gap-1">
                {([
                  { v: "left", label: "◧ बाएँ किनारे" },
                  { v: "center", label: "▣ बीच में" },
                  { v: "right", label: "◨ दाएँ किनारे" },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    className={`rounded px-2 py-1 text-xs ${
                      imgAlign === o.v ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      set({ ...block, image: { ...block.image!, float: "full", align: o.v } })
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-500">
                चौड़ाई 100% से कम करने पर स्थान दिखाई देगा
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold">
              चौड़ाई % ({block.image.widthPct ?? 100})
            </label>
            <input
              type="range"
              min={20}
              max={100}
              value={block.image.widthPct ?? 100}
              onChange={(e) =>
                set({ ...block, image: { ...block.image!, widthPct: Number(e.target.value) } })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">फ़ोटो ऊँचाई (मिमी)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full rounded border border-gray-300 p-1 text-sm"
                value={block.image.heightMm ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  set({
                    ...block,
                    image: { ...block.image!, heightMm: v === "" ? undefined : Number(v) },
                  });
                }}
              />
              <button
                type="button"
                className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                onClick={() => {
                  const nextImage = { ...block.image! };
                  delete nextImage.heightMm;
                  set({ ...block, image: nextImage });
                }}
              >
                स्वतः
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">कैप्शन</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 p-1 text-sm"
              value={block.image.caption ?? ""}
              onChange={(e) =>
                set({ ...block, image: { ...block.image!, caption: e.target.value } })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AdControls({
  block,
  set,
  editionId,
  placedMm,
}: {
  block: AdBlock;
  set: (next: Block) => void;
  editionId: string;
  placedMm: number;
}) {
  return (
    <div className="space-y-3 p-3">
      <ImagePicker
        editionId={editionId}
        image={block.image}
        placedMm={placedMm}
        onChange={(next) => set({ ...block, image: next })}
      />

      <div className="space-y-1">
        <label className="text-sm font-semibold">ऊँचाई (मिमी)</label>
        <input
          type="number"
          className="w-full rounded border border-gray-300 p-1 text-sm"
          value={block.heightMm ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            set({ ...block, heightMm: v === "" ? undefined : Number(v) });
          }}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">प्लेसहोल्डर टेक्स्ट</label>
        <input
          type="text"
          className="w-full rounded border border-gray-300 p-1 text-sm"
          value={block.placeholderText ?? ""}
          onChange={(e) => set({ ...block, placeholderText: e.target.value })}
        />
      </div>
    </div>
  );
}
