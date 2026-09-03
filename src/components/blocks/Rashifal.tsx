import type { RashifalBlock } from "@/lib/types";
import { RASHIFAL_SIGNS } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";

function Render({ block, editing, onChange }: BlockRenderProps<RashifalBlock>) {
  const setText = (i: number, text: string) => {
    const signs = block.signs.map((s, idx) => (idx === i ? { ...s, text } : s));
    onChange({ ...block, signs });
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2mm",
          padding: "2mm",
        }}
      >
        {block.signs.map((sign, i) => (
          <div key={sign.name}>
            <div style={{ fontWeight: 700, fontSize: "0.9em" }}>{sign.name}</div>
            <div
              contentEditable={editing}
              suppressContentEditableWarning
              onBlur={(e) => editing && setText(i, e.currentTarget.innerText ?? "")}
              style={{ fontSize: "0.78em", lineHeight: 1.3, whiteSpace: "pre-wrap" }}
            >
              {sign.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const RashifalBlockDef: BlockDef<RashifalBlock> = {
  type: "rashifal",
  label: "राशिफल",
  create: () => ({
    id: newId(),
    type: "rashifal",
    title: "राशिफल",
    signs: RASHIFAL_SIGNS.map((name) => ({ name, text: "" })),
  }),
  Render,
};

export default RashifalBlockDef;
