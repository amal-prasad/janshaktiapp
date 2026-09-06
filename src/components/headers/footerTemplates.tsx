// "footer" slot templates.
import type { SlotTemplate, SlotRenderProps } from "./registry";

const fields = [
  { key: "newspaperName", label: "समाचार पत्र का नाम", default: "जनशक्ति उजाला" },
  { key: "website", label: "वेबसाइट", default: "www.janshaktiujala.com" },
  { key: "edition", label: "संस्करण", default: "रायपुर संस्करण" },
  { key: "pages", label: "पृष्ठ संख्या", default: "Pages : 06" },
];

/** Simple thin top-rule footer, name left, website right. */
const Simple = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111", borderTop: `1pt solid ${color}`, padding: "0.8mm 1mm", display: "flex", justifyContent: "space-between", fontSize: "0.72em" }}>
    <span>{fields.newspaperName} · {fields.edition}</span>
    <span>{fields.website}</span>
  </div>
);

/** Solid colour band footer, reversed-out text, three-way split. */
const Band = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", background: color, color: "#fff", padding: "1mm 2mm", display: "flex", justifyContent: "space-between", fontSize: "0.72em" }}>
    <span>{fields.newspaperName}</span>
    <span>{fields.edition}</span>
    <span>{fields.website} · {fields.pages}</span>
  </div>
);

/** Heavy double-rule footer with centred page count. */
const DoubleRule = ({ fields, color }: SlotRenderProps) => (
  <div style={{ width: "100%", fontFamily: "serif", color: "#111" }}>
    <div style={{ borderTop: `2pt solid ${color}`, borderBottom: `0.4pt solid ${color}`, padding: "0.8mm 1mm", display: "flex", justifyContent: "space-between", fontSize: "0.72em" }}>
      <span>{fields.newspaperName} — {fields.edition}</span>
      <span style={{ fontWeight: 700, color }}>{fields.pages}</span>
      <span>{fields.website}</span>
    </div>
  </div>
);

const legalFields = [
  {
    key: "legalText",
    label: "कानूनी सूचना पाठ",
    default:
      "स्वामी, मुद्रक एवं प्रकाशक : नारायण माखीजा के लिए कलम बाइंडिंग एंड प्रिंटर्स, 27/01, जूनी कसेरा बाखल, चूड़ीवाला कॉम्प्लेक्स, खजुरी बाज़ार, इंदौर (म.प्र.) से मुद्रित एवं 104 रॉयल अपार्टमेंट ब्लॉक बी, 377, खातीवाला टैंक, इंदौर (म.प्र.) से प्रकाशित। RNI NO : MPHIN/26/A3434, संपादक : नारायण माखीजा, मोबाइल नं. 987254447, 9009699993 (सभी विवादों का न्याय क्षेत्र इंदौर होगा)",
  },
];

/** Statutory publisher/printer legal line, mandatory on the last page. */
const JanshaktiLegal = ({ fields }: SlotRenderProps) => {
  return (
    <div
      style={{
        width: "100%",
        fontFamily: "var(--font-hi)",
        color: "#111",
        textAlign: "center",
        fontSize: "0.82em",
        lineHeight: 1.35,
      }}
    >
      {fields.legalText}
    </div>
  );
};

export const footerTemplates: SlotTemplate[] = [
  { id: "janshakti-legal", slot: "footer", label: "जनशक्ति कानूनी फुटर", fields: legalFields, Render: JanshaktiLegal },
  { id: "simple", slot: "footer", label: "सरल रेखा", fields, Render: Simple },
  { id: "band", slot: "footer", label: "रंगीन पट्टी", fields, Render: Band },
  { id: "double-rule", slot: "footer", label: "दोहरी रेखा", fields, Render: DoubleRule },
];
