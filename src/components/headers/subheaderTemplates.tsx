// "subheader" slot templates — tagline/date strip usually sitting right under header2.
import type { SlotTemplate, SlotRenderProps } from "./registry";

const fields = [
  { key: "tagline", label: "टैगलाइन", default: "सत्य की आवाज़, जनता के साथ" },
  { key: "date", label: "दिनांक (DD/MM/YYYY/दिन)", default: "30/08/2026/रविवार" },
  { key: "pages", label: "पृष्ठ संख्या", default: "Pages : 06" },
];

/** Tagline centred, date+pages on the sides, single hairline underneath. */
const Tagline = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111", padding: "0.6mm 1mm", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75em", borderBottom: `0.5pt solid ${color}` }}>
    <span>{fields.date}</span>
    <span style={{ fontStyle: "italic", fontWeight: 600 }}>{fields.tagline}</span>
    <span>{fields.pages}</span>
  </div>
);

/** Date/pages boxed in colour-outlined tabs either side of the tagline. */
const TabbedDate = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72em", padding: "0.4mm 0" }}>
    <span style={{ border: `1pt solid ${color}`, padding: "0.3mm 2mm", color }}>{fields.date}</span>
    <span style={{ fontStyle: "italic" }}>{fields.tagline}</span>
    <span style={{ border: `1pt solid ${color}`, padding: "0.3mm 2mm", color }}>{fields.pages}</span>
  </div>
);

export const subheaderTemplates: SlotTemplate[] = [
  { id: "tagline", slot: "subheader", label: "केंद्रित टैगलाइन", fields, Render: Tagline },
  { id: "tabbed-date", slot: "subheader", label: "टैब दिनांक", fields, Render: TabbedDate },
];
