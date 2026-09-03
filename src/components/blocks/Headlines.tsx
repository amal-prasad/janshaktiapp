import type { KeyboardEvent, FocusEvent } from "react";
import type { HeadlinesBlock } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";

function Render({ block, editing, onChange }: BlockRenderProps<HeadlinesBlock>) {
  const setItem = (i: number, text: string) => {
    const items = [...block.items];
    items[i] = text;
    onChange({ ...block, items });
  };

  const handleBlur = (i: number) => (e: FocusEvent<HTMLLIElement>) => {
    const text = e.currentTarget.innerText ?? "";
    if (text.trim() === "" && block.items.length > 1) {
      const items = block.items.filter((_, idx) => idx !== i);
      onChange({ ...block, items });
      return;
    }
    setItem(i, text);
  };

  const handleKeyDown = (i: number) => (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === "Enter" && i === block.items.length - 1) {
      e.preventDefault();
      onChange({ ...block, items: [...block.items, ""] });
    }
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
          whiteSpace: "pre-wrap",
        }}
      >
        {block.title}
      </div>
      <ol style={{ margin: 0, padding: "2mm 5mm", fontSize: "0.9em", lineHeight: 1.4 }}>
        {block.items.map((item, i) => (
          <li
            key={i}
            contentEditable={editing}
            suppressContentEditableWarning
            onBlur={handleBlur(i)}
            onKeyDown={handleKeyDown(i)}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

const HeadlinesBlockDef: BlockDef<HeadlinesBlock> = {
  type: "headlines",
  label: "मुख्य समाचार",
  create: () => ({ id: newId(), type: "headlines", title: "मुख्य समाचार", items: [""] }),
  Render,
};

export default HeadlinesBlockDef;
