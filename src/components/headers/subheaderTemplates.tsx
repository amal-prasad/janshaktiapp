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

const dateStripFields = [
  { key: "dateLeft", label: "बायाँ दिनांक (हिंदी)", default: "सोमवार, 2 सितम्बर 2026" },
  { key: "place", label: "स्थान", default: "रायपुर, छत्तीसगढ़" },
  { key: "dateRight", label: "दायाँ दिनांक (अंग्रेज़ी)", default: "Monday, 02 September 2026" },
];

/** Full-width coloured band: left date, centred place, right date, white text. */
const DateStrip = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", background: color, color: "#fff", padding: "1mm 3mm", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72em" }}>
    <span>{fields.dateLeft}</span>
    <span style={{ fontWeight: 600 }}>{fields.place}</span>
    <span>{fields.dateRight}</span>
  </div>
);

const janshaktiSubheaderFields = [
  { key: "year", label: "वर्ष", default: "" },
  { key: "issue", label: "अंक", default: "" },
  { key: "frequency", label: "आवृत्ति", default: "(प्रति सोमवार)" },
  { key: "datePlace", label: "स्थान और दिनांक", default: "इंदौर, 24 अगस्त से 30 अगस्त 2026" },
  { key: "pages", label: "पेज", default: "8" },
  { key: "price", label: "मूल्य", default: "2 रुपये" },
];

/** Full-width coloured band matching Janshakti layout: year/issue left, place/date centered, pages/price right */
const JanshaktiStrip = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "sans-serif" }}>
    <div style={{ background: color, color: "#fff", padding: "1.2mm 3mm", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78em", fontWeight: 700 }}>
      <div style={{ display: "flex", gap: "8mm" }}>
        <span>वर्ष : {fields.year}</span>
        <span>अंक : {fields.issue}</span>
        <span>{fields.frequency}</span>
      </div>
      <div style={{ letterSpacing: "0.02em" }}>
        {fields.datePlace}
      </div>
      <div style={{ display: "flex", gap: "8mm" }}>
        <span>पेज : {fields.pages}</span>
        <span>मूल्य : {fields.price}</span>
      </div>
    </div>
  </div>
);

export const subheaderTemplates: SlotTemplate[] = [
  { id: "tagline", slot: "subheader", label: "केंद्रित टैगलाइन", fields, Render: Tagline },
  { id: "tabbed-date", slot: "subheader", label: "टैब दिनांक", fields, Render: TabbedDate },
  { id: "date-strip", slot: "subheader", label: "नीली तिथि पट्टी", fields: dateStripFields, Render: DateStrip },
  { id: "janshakti-strip", slot: "subheader", label: "जनशक्ति पट्टी", fields: janshaktiSubheaderFields, Render: JanshaktiStrip },
];
