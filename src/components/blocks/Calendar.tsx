import type { CalendarBlock } from "@/lib/types";
import type { BlockDef, BlockRenderProps } from "@/components/blocks/registry";
import { newId } from "@/lib/ids";

const WEEKDAYS = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];
const MONTH_NAMES = [
  "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर",
];

function buildWeeks(month: number, year: number): (number | null)[][] {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function Render({ block, editing, onChange }: BlockRenderProps<CalendarBlock>) {
  const weeks = buildWeeks(block.month, block.year);

  return (
    <div style={{ width: "100%", border: "0.4pt solid #000" }}>
      <div
        style={{
          background: "#c0392b",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.05em",
          padding: "1mm 2mm",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={(e) =>
            editing && onChange({ ...block, title: e.currentTarget.textContent ?? "" })
          }
        >
          {block.title ?? "पंचांग"}
        </span>
        {editing ? (
          <span>
            <select
              value={block.month}
              onChange={(e) => onChange({ ...block, month: Number(e.target.value) })}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={block.year}
              onChange={(e) => onChange({ ...block, year: Number(e.target.value) })}
            >
              {Array.from({ length: 11 }, (_, i) => block.year - 5 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </span>
        ) : (
          <span>
            {MONTH_NAMES[block.month - 1]} {block.year}
          </span>
        )}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8em" }}>
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} style={{ padding: "0.5mm", fontWeight: 700 }}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => (
                <td key={di} style={{ textAlign: "center", padding: "0.8mm" }}>
                  {day ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CalendarBlockDef: BlockDef<CalendarBlock> = {
  type: "calendar",
  label: "पंचांग",
  create: () => {
    const now = new Date();
    return {
      id: newId(),
      type: "calendar",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  },
  Render,
};

export default CalendarBlockDef;
