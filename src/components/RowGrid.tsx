"use client";
import { addRow, moveRow, removeRow } from "@/components/editor/rowOps";
import { ROW_PRESETS, type Row } from "@/lib/types";

type Props = {
  rows: Row[];
  onRowsChange: (rows: Row[]) => void;
  readOnly?: boolean;
};

function PresetBar({ spans }: { spans: number[] }) {
  return (
    <div className="flex h-8 w-full gap-0.5">
      {spans.map((s, i) => (
        <div key={i} className="rounded-sm bg-gray-300" style={{ flex: s }} />
      ))}
    </div>
  );
}

/** "ADD NEW ROW" preset picker + row list with move/delete controls. */
export default function RowGrid({ rows, onRowsChange, readOnly }: Props) {
  if (readOnly) return null;

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="mb-2 text-sm font-semibold">नई पंक्ति जोड़ें</h3>
        <div className="grid grid-cols-2 gap-2">
          {ROW_PRESETS.map((spans, i) => (
            <button
              key={i}
              onClick={() => onRowsChange(addRow(rows, spans))}
              className="rounded border border-gray-300 p-2 hover:bg-gray-50"
              title={spans.join(" + ")}
            >
              <PresetBar spans={spans} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">पंक्तियाँ</h3>
        <ul className="space-y-1">
          {rows.map((row, i) => (
            <li key={row.id} className="flex items-center gap-2 rounded border border-gray-200 p-2">
              <div className="flex-1">
                <PresetBar spans={row.cols.map((c) => c.span)} />
              </div>
              <button
                disabled={i === 0}
                onClick={() => onRowsChange(moveRow(rows, row.id, "up"))}
                className="px-1 text-sm disabled:opacity-30"
                title="ऊपर ले जाएँ"
              >
                ↑
              </button>
              <button
                disabled={i === rows.length - 1}
                onClick={() => onRowsChange(moveRow(rows, row.id, "down"))}
                className="px-1 text-sm disabled:opacity-30"
                title="नीचे ले जाएँ"
              >
                ↓
              </button>
              <button
                onClick={() => onRowsChange(removeRow(rows, row.id))}
                className="px-1 text-sm text-red-600"
                title="हटाएँ"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
