// Masthead ("header") slot templates.
import type { SlotTemplate, SlotRenderProps } from "./registry";

const commonFields = [
  { key: "newspaperName", label: "समाचार पत्र का नाम", default: "जनशक्ति उजाला" },
  { key: "tagline", label: "टैगलाइन", default: "सत्य की आवाज़, जनता के साथ" },
  { key: "date", label: "दिनांक (DD/MM/YYYY/दिन)", default: "30/08/2026/रविवार" },
  { key: "website", label: "वेबसाइट", default: "www.janshaktiujala.com" },
  { key: "pages", label: "पृष्ठ संख्या", default: "Pages : 06" },
  { key: "edition", label: "संस्करण", default: "रायपुर संस्करण" },
];

function Logo({ logoUrl, name, janshakti }: { logoUrl?: string; name: string; janshakti?: boolean }) {
  const finalLogoUrl = janshakti ? "/logo.png?v=2" : logoUrl;
  if (finalLogoUrl) {
    return <img src={finalLogoUrl} alt={name} style={{ height: janshakti ? "48mm" : "14mm", maxWidth: "100%", objectFit: "contain" }} />;
  }
  return null;
}

/** Centred classic masthead: name big and centred, tagline under it, date/site/pages rule below. */
const Classic = ({ fields, color, logoUrl }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111" }}>
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "3mm", padding: "2mm 0 0" }}>
      <Logo logoUrl={logoUrl} name={fields.newspaperName} />
      <h1 style={{ fontSize: "3.4em", fontWeight: 900, letterSpacing: "0.02em", margin: 0, textAlign: "center", color }}>
        {fields.newspaperName}
      </h1>
    </div>
    <div style={{ textAlign: "center", fontSize: "0.85em", fontStyle: "italic", margin: "0.5mm 0" }}>
      {fields.tagline}
    </div>
    <div style={{ borderTop: `1pt solid ${color}`, borderBottom: `0.3pt solid ${color}`, margin: "1mm 0 0" }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72em", padding: "0.8mm 1mm", borderBottom: `2pt solid ${color}` }}>
      <span>{fields.edition}</span>
      <span>{fields.date}</span>
      <span>{fields.website}</span>
      <span>{fields.pages}</span>
    </div>
  </div>
);

/** Split masthead: date/edition left, name centred, website/pages right, heavy top+bottom rule. */
const SplitBand = ({ fields, color, logoUrl }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111" }}>
    <div style={{ borderTop: `2.2pt solid ${color}`, padding: "1.5mm 1mm 0.5mm", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontSize: "0.68em", lineHeight: 1.2 }}>
        <div>{fields.date}</div>
        <div>{fields.edition}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "2mm" }}>
        <Logo logoUrl={logoUrl} name={fields.newspaperName} />
        <h1 style={{ fontSize: "3.1em", fontWeight: 900, margin: 0, color, textAlign: "center" }}>{fields.newspaperName}</h1>
      </div>
      <div style={{ fontSize: "0.68em", lineHeight: 1.2, textAlign: "right" }}>
        <div>{fields.website}</div>
        <div>{fields.pages}</div>
      </div>
    </div>
    <div style={{ textAlign: "center", fontSize: "0.8em", fontStyle: "italic", padding: "0.3mm 0" }}>{fields.tagline}</div>
    <div style={{ borderBottom: `2.2pt solid ${color}` }} />
  </div>
);

/** Coloured band masthead: name reversed out of a solid colour band, meta strip below. */
const ColorBand = ({ fields, color, logoUrl }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif" }}>
    <div style={{ background: color, color: "#fff", padding: "2mm 3mm", display: "flex", alignItems: "center", gap: "3mm", justifyContent: "center" }}>
      <Logo logoUrl={logoUrl} name={fields.newspaperName} />
      <h1 style={{ fontSize: "3.2em", fontWeight: 900, margin: 0, letterSpacing: "0.02em" }}>{fields.newspaperName}</h1>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72em", padding: "0.8mm 1mm", color: "#111", borderBottom: `1.5pt solid ${color}` }}>
      <span>{fields.edition} · {fields.tagline}</span>
      <span>{fields.date}</span>
      <span>{fields.website} · {fields.pages}</span>
    </div>
  </div>
);

/** Minimal boxed masthead: name in a bordered box, thin rules, no colour fill (accent only via border). */
const BoxedMinimal = ({ fields, color, logoUrl }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111" }}>
    <div style={{ border: `1.5pt solid ${color}`, padding: "2mm 3mm", display: "flex", alignItems: "center", justifyContent: "center", gap: "3mm" }}>
      <Logo logoUrl={logoUrl} name={fields.newspaperName} />
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "3em", fontWeight: 900, margin: 0, color }}>{fields.newspaperName}</h1>
        <div style={{ fontSize: "0.78em", fontStyle: "italic" }}>{fields.tagline}</div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7em", padding: "0.7mm 1mm" }}>
      <span>{fields.edition}</span>
      <span>{fields.date}</span>
      <span>{fields.website}</span>
      <span>{fields.pages}</span>
    </div>
  </div>
);

const janshaktiFields = [
  { key: "newspaperName", label: "समाचार पत्र का नाम (alt टेक्स्ट)", default: "जनशक्ति उजाला" },
  { key: "weeklyLabel", label: "ऊपर लेबल", default: "साप्ताहिक" },
  { key: "tagline", label: "टैगलाइन", default: "जनता की आवाज, सत्य का उजाला..." },
  { key: "leftBoxImage", label: "बायाँ बॉक्स - चित्र", default: "" },
  { key: "leftBoxText", label: "बायाँ बॉक्स - टेक्स्ट", default: "" },
  { key: "rightBoxImage", label: "दायाँ बॉक्स - चित्र", default: "" },
  { key: "rightBoxText", label: "दायाँ बॉक्स - टेक्स्ट", default: "" },
];

/** Exact Janshakti masthead: bordered image box left, logo+tagline centred, mirrored box right. */
const Janshakti = ({ fields }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "sans-serif", color: "#111" }}>
    <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-between", gap: "3mm", padding: "1.5mm 2mm" }}>
      <div style={{ flex: "0 0 45mm", border: "0.8pt solid #333", padding: "1mm 2mm", fontSize: "0.75em", lineHeight: 1.4, textAlign: "center", display: "flex", flexDirection: "column" }}>
        {fields.leftBoxImage && <img src={fields.leftBoxImage} style={{ maxWidth: "100%", maxHeight: "25mm", objectFit: "contain", margin: "0 auto 1mm auto" }} alt="" />}
        {fields.leftBoxText && <div style={{ whiteSpace: "pre-wrap" }}>{fields.leftBoxText}</div>}
      </div>
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        {fields.weeklyLabel && (
          <div style={{ alignSelf: "flex-start", marginLeft: "10%", fontSize: "1.1em", fontWeight: 700 }}>{fields.weeklyLabel}</div>
        )}
        <img src="/logo.png" alt={fields.newspaperName} style={{ height: "42mm", maxWidth: "100%", objectFit: "contain" }} />
        <div style={{ fontSize: "1.05em", fontWeight: 700, margin: "1mm 0 0" }}>{fields.tagline}</div>
      </div>
      <div style={{ flex: "0 0 45mm", border: "0.8pt solid #333", padding: "1mm 2mm", fontSize: "0.75em", lineHeight: 1.4, textAlign: "center", display: "flex", flexDirection: "column" }}>
        {fields.rightBoxImage && <img src={fields.rightBoxImage} style={{ maxWidth: "100%", maxHeight: "25mm", objectFit: "contain", margin: "0 auto 1mm auto" }} alt="" />}
        {fields.rightBoxText && <div style={{ whiteSpace: "pre-wrap" }}>{fields.rightBoxText}</div>}
      </div>
    </div>
  </div>
);

export const headerTemplates: SlotTemplate[] = [
  { id: "classic", slot: "header", label: "क्लासिक केंद्रित", fields: commonFields, Render: Classic },
  { id: "split-band", slot: "header", label: "विभाजित पट्टी", fields: commonFields, Render: SplitBand },
  { id: "color-band", slot: "header", label: "रंगीन पट्टी", fields: commonFields, Render: ColorBand },
  { id: "boxed-minimal", slot: "header", label: "बॉक्स न्यूनतम", fields: commonFields, Render: BoxedMinimal },
  { id: "janshakti", slot: "header", label: "जनशक्ति (लोगो + बॉक्स)", fields: janshaktiFields, Render: Janshakti },
];
