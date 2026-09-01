// "2nd header" strip slot templates — a thinner secondary strip below the masthead.
import type { SlotTemplate, SlotRenderProps } from "./registry";

const fields = [
  { key: "newspaperName", label: "समाचार पत्र का नाम", default: "जनशक्ति उजाला" },
  { key: "tagline", label: "टैगलाइन", default: "सत्य की आवाज़, जनता के साथ" },
  { key: "website", label: "वेबसाइट", default: "www.janshaktiujala.com" },
  { key: "edition", label: "संस्करण", default: "रायपुर संस्करण" },
];

/** Plain thin rule strip: tagline centred between two hairlines. */
const Strip = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111" }}>
    <div style={{ borderTop: `0.5pt solid ${color}`, borderBottom: `0.5pt solid ${color}`, padding: "0.6mm 1mm", display: "flex", justifyContent: "space-between", fontSize: "0.75em" }}>
      <span>{fields.edition}</span>
      <span style={{ fontStyle: "italic" }}>{fields.tagline}</span>
      <span>{fields.website}</span>
    </div>
  </div>
);

/** Coloured mini-band strip with the paper name repeated small, for section separation. */
const MiniBand = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", background: color, color: "#fff", padding: "0.8mm 2mm", display: "flex", justifyContent: "space-between", fontSize: "0.78em", fontWeight: 700 }}>
    <span>{fields.newspaperName}</span>
    <span>{fields.edition}</span>
  </div>
);

export const header2Templates: SlotTemplate[] = [
  { id: "strip", slot: "header2", label: "पतली पट्टी", fields, Render: Strip },
  { id: "mini-band", slot: "header2", label: "रंगीन मिनी बैंड", fields, Render: MiniBand },
];
