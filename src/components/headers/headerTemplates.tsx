import type { SlotTemplate, SlotRenderProps } from "./registry";

const MM_TO_PX = 96 / 25.4;

function ResizableImage({
  src,
  widthMm,
  heightMm,
  editing,
  onChange,
}: {
  src: string;
  widthMm?: string;
  heightMm?: string;
  editing?: boolean;
  onChange?: (w: string, h: string) => void;
}) {
  const startResize = (e: React.PointerEvent, type: "e" | "w" | "s" | "n" | "se" | "sw" | "ne" | "nw") => {
    if (!editing || !onChange) return;
    e.stopPropagation();
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).parentElement;
    if (!el) return;
    const zoom = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    
    const initialW = widthMm ? parseFloat(widthMm) : el.getBoundingClientRect().width / (MM_TO_PX * zoom);
    const initialH = heightMm ? parseFloat(heightMm) : el.getBoundingClientRect().height / (MM_TO_PX * zoom);

    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      
      let newW = initialW;
      if (type.includes("e")) newW = Math.max(10, initialW + dx / (MM_TO_PX * zoom));
      else if (type.includes("w")) newW = Math.max(10, initialW - dx / (MM_TO_PX * zoom));
        
      let newH = initialH;
      if (type.includes("s")) newH = Math.max(10, initialH + dy / (MM_TO_PX * zoom));
      else if (type.includes("n")) newH = Math.max(10, initialH - dy / (MM_TO_PX * zoom));
        
      // Ensure it doesn't blow out of reasonable max dimensions for a header (e.g. 200mm)
      newW = Math.min(newW, 200);
      newH = Math.min(newH, 150);
        
      onChange(newW.toFixed(1), newH.toFixed(1));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div style={{ position: "relative", margin: "0 auto 1mm auto", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "100%" }}>
      <img
        src={src}
        style={{
          width: widthMm ? `${widthMm}mm` : "100%",
          height: heightMm ? `${heightMm}mm` : "auto",
          maxWidth: "100%",
          objectFit: "contain",
          display: "block",
        }}
        alt=""
        draggable={false}
      />
      {editing && (
        <>
          {/* Edges */}
          <div onPointerDown={(e) => startResize(e, "e")} style={{ position: "absolute", right: -5, top: 0, bottom: 0, width: "10px", cursor: "ew-resize", zIndex: 10, touchAction: "none" }} />
          <div onPointerDown={(e) => startResize(e, "w")} style={{ position: "absolute", left: -5, top: 0, bottom: 0, width: "10px", cursor: "ew-resize", zIndex: 10, touchAction: "none" }} />
          <div onPointerDown={(e) => startResize(e, "s")} style={{ position: "absolute", bottom: -5, left: 0, right: 0, height: "10px", cursor: "ns-resize", zIndex: 10, touchAction: "none" }} />
          <div onPointerDown={(e) => startResize(e, "n")} style={{ position: "absolute", top: -5, left: 0, right: 0, height: "10px", cursor: "ns-resize", zIndex: 10, touchAction: "none" }} />
          
          {/* Corners */}
          <div onPointerDown={(e) => startResize(e, "se")} style={{ position: "absolute", right: -4, bottom: -4, width: "12px", height: "12px", background: "rgba(37,99,235,0.9)", cursor: "nwse-resize", zIndex: 20, borderRadius: "2px", touchAction: "none" }} />
          <div onPointerDown={(e) => startResize(e, "sw")} style={{ position: "absolute", left: -4, bottom: -4, width: "12px", height: "12px", background: "rgba(37,99,235,0.9)", cursor: "nesw-resize", zIndex: 20, borderRadius: "2px", touchAction: "none" }} />
          <div onPointerDown={(e) => startResize(e, "ne")} style={{ position: "absolute", right: -4, top: -4, width: "12px", height: "12px", background: "rgba(37,99,235,0.9)", cursor: "nesw-resize", zIndex: 20, borderRadius: "2px", touchAction: "none" }} />
          <div onPointerDown={(e) => startResize(e, "nw")} style={{ position: "absolute", left: -4, top: -4, width: "12px", height: "12px", background: "rgba(37,99,235,0.9)", cursor: "nwse-resize", zIndex: 20, borderRadius: "2px", touchAction: "none" }} />
        </>
      )}
    </div>
  );
}

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
  { key: "leftBoxImageWidth", label: "बायाँ चित्र चौड़ाई (mm)", default: "45" },
  { key: "leftBoxImageHeight", label: "बायाँ चित्र ऊंचाई (mm)", default: "" },
  { key: "leftBoxText", label: "बायाँ बॉक्स - टेक्स्ट", default: "" },
  { key: "rightBoxImage", label: "दायाँ बॉक्स - चित्र", default: "" },
  { key: "rightBoxImageWidth", label: "दायाँ चित्र चौड़ाई (mm)", default: "45" },
  { key: "rightBoxImageHeight", label: "दायाँ चित्र ऊंचाई (mm)", default: "" },
  { key: "year", label: "वर्ष", default: "1" },
  { key: "issue", label: "अंक", default: "1" },
  { key: "frequency", label: "आवृत्ति", default: "(प्रति सोमवार)" },
  { key: "datePlace", label: "स्थान और दिनांक", default: "इंदौर, 24 अगस्त से 30 अगस्त 2026" },
  { key: "pages", label: "पेज", default: "8" },
  { key: "price", label: "मूल्य", default: "2 रुपये" },
];

/** Exact Janshakti masthead: bordered image box left, logo+tagline centred, mirrored box right. */
const Janshakti = ({ fields, color, editing, onChange }: SlotRenderProps) => {
  const onBoxClick = (e: React.MouseEvent) => {
    if (!editing && (e.target as HTMLElement).tagName !== 'IMG') {
      alert("कृपया हेडर को दाईं ओर 'हेडर' टैब से संपादित करें।");
    }
  };

  return (
    <div style={{ width: "100%", fontFamily: "sans-serif", color: "#111" }}>
      <div style={{ display: "flex", alignItems: "stretch", justifyContent: "space-between", gap: "3mm", padding: "1mm 2mm" }}>
        <div onClick={onBoxClick} style={{ flex: `0 0 ${fields.leftBoxImageWidth ?? "45"}mm`, border: "0.8pt solid #333", padding: "1mm 2mm", fontSize: "0.75em", lineHeight: 1.4, textAlign: "center", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {fields.leftBoxImage ? (
            <ResizableImage 
              src={fields.leftBoxImage} 
              widthMm={fields.leftBoxImageWidth} 
              heightMm={fields.leftBoxImageHeight} 
              editing={editing} 
              onChange={(w, h) => onChange?.({ ...fields, leftBoxImageWidth: w, leftBoxImageHeight: h })} 
            />
          ) : !fields.leftBoxText ? (
            <div style={{ margin: "auto", color: "#aaa", cursor: "pointer" }}>चित्र या टेक्स्ट जोड़ें</div>
          ) : null}
          {(fields.leftBoxText || editing) && (
            <div 
              contentEditable={editing} 
              suppressContentEditableWarning 
              onBlur={(e) => editing && onChange?.({ ...fields, leftBoxText: e.currentTarget.innerText ?? "" })}
              style={{ whiteSpace: "pre-wrap", backgroundColor: "#b3151b", color: "#fff", fontWeight: "bold", padding: "3px", width: "100%", marginTop: "auto", outline: "none", minHeight: "1.5em" }}
            >
              {fields.leftBoxText}
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          {(fields.weeklyLabel || editing) && (
            <div 
              contentEditable={editing} 
              suppressContentEditableWarning 
              onBlur={(e) => editing && onChange?.({ ...fields, weeklyLabel: e.currentTarget.innerText ?? "" })}
              style={{ alignSelf: "flex-start", marginLeft: "10%", fontSize: "1.1em", fontWeight: 700, outline: "none", minWidth: "50px", minHeight: "1.2em" }}
            >
              {fields.weeklyLabel}
            </div>
          )}
          <img src="/logo.png?v=3" alt={fields.newspaperName} style={{ width: "100%", height: "auto", maxHeight: "45mm", objectFit: "contain" }} />
          <div 
            contentEditable={editing} 
            suppressContentEditableWarning 
            onBlur={(e) => editing && onChange?.({ ...fields, tagline: e.currentTarget.innerText ?? "" })}
            style={{ fontSize: "1.05em", fontWeight: 700, margin: "1mm 0 0", outline: "none", minWidth: "100px" }}
          >
            {fields.tagline}
          </div>
        </div>
        <div onClick={onBoxClick} style={{ flex: `0 0 ${fields.rightBoxImageWidth ?? "45"}mm`, border: "0.8pt solid #333", padding: "1mm 2mm", fontSize: "0.75em", lineHeight: 1.4, textAlign: "center", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {fields.rightBoxImage ? (
            <ResizableImage 
              src={fields.rightBoxImage} 
              widthMm={fields.rightBoxImageWidth} 
              heightMm={fields.rightBoxImageHeight} 
              editing={editing} 
              onChange={(w, h) => onChange?.({ ...fields, rightBoxImageWidth: w, rightBoxImageHeight: h })} 
            />
          ) : !fields.rightBoxText ? (
            <div style={{ margin: "auto", color: "#aaa", cursor: "pointer" }}>चित्र या टेक्स्ट जोड़ें</div>
          ) : null}
          {(fields.rightBoxText || editing) && (
            <div 
              contentEditable={editing} 
              suppressContentEditableWarning 
              onBlur={(e) => editing && onChange?.({ ...fields, rightBoxText: e.currentTarget.innerText ?? "" })}
              style={{ whiteSpace: "pre-wrap", backgroundColor: "#b3151b", color: "#fff", fontWeight: "bold", padding: "3px", width: "100%", marginTop: "auto", outline: "none", minHeight: "1.5em" }}
            >
              {fields.rightBoxText}
            </div>
          )}
        </div>
      </div>
      <div style={{ background: "#0b4a8f", color: "#fff", padding: "1.2mm 3mm", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78em", fontWeight: 700 }}>
        <div style={{ display: "flex", gap: "8mm" }}>
          <span>वर्ष : <span contentEditable={editing} suppressContentEditableWarning onBlur={(e) => editing && onChange?.({ ...fields, year: e.currentTarget.innerText ?? "" })} style={{outline: "none"}}>{fields.year}</span></span>
          <span>अंक : <span contentEditable={editing} suppressContentEditableWarning onBlur={(e) => editing && onChange?.({ ...fields, issue: e.currentTarget.innerText ?? "" })} style={{outline: "none"}}>{fields.issue}</span></span>
          <span contentEditable={editing} suppressContentEditableWarning onBlur={(e) => editing && onChange?.({ ...fields, frequency: e.currentTarget.innerText ?? "" })} style={{outline: "none"}}>{fields.frequency}</span>
        </div>
        <div contentEditable={editing} suppressContentEditableWarning onBlur={(e) => editing && onChange?.({ ...fields, datePlace: e.currentTarget.innerText ?? "" })} style={{ letterSpacing: "0.02em", outline: "none" }}>
          {fields.datePlace}
        </div>
        <div style={{ display: "flex", gap: "8mm" }}>
          <span>पेज : <span contentEditable={editing} suppressContentEditableWarning onBlur={(e) => editing && onChange?.({ ...fields, pages: e.currentTarget.innerText ?? "" })} style={{outline: "none"}}>{fields.pages}</span></span>
          <span>मूल्य : <span contentEditable={editing} suppressContentEditableWarning onBlur={(e) => editing && onChange?.({ ...fields, price: e.currentTarget.innerText ?? "" })} style={{outline: "none"}}>{fields.price}</span></span>
        </div>
      </div>
    </div>
  );
};

export const headerTemplates: SlotTemplate[] = [
  { id: "classic", slot: "header", label: "क्लासिक केंद्रित", fields: commonFields, Render: Classic },
  { id: "split-band", slot: "header", label: "विभाजित पट्टी", fields: commonFields, Render: SplitBand },
  { id: "color-band", slot: "header", label: "रंगीन पट्टी", fields: commonFields, Render: ColorBand },
  { id: "boxed-minimal", slot: "header", label: "बॉक्स न्यूनतम", fields: commonFields, Render: BoxedMinimal },
  { id: "janshakti", slot: "header", label: "जनशक्ति (लोगो + बॉक्स)", fields: janshaktiFields, Render: Janshakti },
];
