import type { KeyboardEvent, FocusEvent } from "react";
import type { ShortNewsBlock } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";

function Render({ block, editing, onChange }: BlockRenderProps<ShortNewsBlock>) {
  const setItem = (i: number, patch: Partial<{ title: string; body: string }>) => {
    const items = block.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange({ ...block, items });
  };

  const removeIfEmpty = (i: number) => {
    const it = block.items[i];
    if (it.title.trim() === "" && it.body.trim() === "" && block.items.length > 1) {
      onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) });
      return true;
    }
    return false;
  };

  const handleBodyKeyDown = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && i === block.items.length - 1) {
      e.preventDefault();
      onChange({ ...block, items: [...block.items, { title: "", body: "" }] });
    }
  };

  const handleTitleBlur = (i: number) => (e: FocusEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText ?? "";
    if (!removeIfEmpty(i)) setItem(i, { title: text });
  };

  const handleBodyBlur = (i: number) => (e: FocusEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText ?? "";
    if (!removeIfEmpty(i)) setItem(i, { body: text });
  };

  return (
    <div style={{ width: "100%", border: "0.4pt solid #000" }}>
      <div
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={(e) =>
          editing && onChange({ ...block, title: e.currentTarget.innerText ?? "" })
        }
        style={{
          background: "#c0392b",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.05em",
          padding: "1mm 2mm",
        }}
      >
        {block.title}
      </div>
      <div style={{ padding: "1mm 2mm" }}>
        {block.items.map((item, i) => (
          <div
            key={i}
            style={{
              borderBottom: i < block.items.length - 1 ? "0.3pt solid #ccc" : "none",
              padding: "1mm 0",
            }}
          >
            <div
              contentEditable={editing}
              suppressContentEditableWarning
              onBlur={handleTitleBlur(i)}
              style={{ fontWeight: 700, fontSize: "0.92em", whiteSpace: "pre-wrap" }}
            >
              {item.title}
            </div>
            <div
              contentEditable={editing}
              suppressContentEditableWarning
              onBlur={handleBodyBlur(i)}
              onKeyDown={handleBodyKeyDown(i)}
              style={{ fontSize: "0.85em", lineHeight: 1.3, whiteSpace: "pre-wrap" }}
            >
              {item.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ShortNewsBlockDef: BlockDef<ShortNewsBlock> = {
  type: "shortnews",
  label: "संक्षिप्त समाचार",
  create: () => ({
    id: newId(),
    type: "shortnews",
    title: "संक्षिप्त समाचार",
    items: [{ title: "", body: "" }],
  }),
  Render,
};

export default ShortNewsBlockDef;
