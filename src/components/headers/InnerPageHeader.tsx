import { Diya } from "./DiwaliBanner";

export default function InnerPageHeader({
  pageIndex,
  datePlace,
}: {
  pageIndex: number;
  datePlace?: string;
}) {
  const pageNum = pageIndex + 1;
  // ponytail: Diwali edition — diyas + greeting inside yellow strip on pages 2–7 (page 8 gets full banner).
  const festive = pageNum >= 2 && pageNum <= 7;
  const pill = {
    display: "flex", alignItems: "center", gap: "1.5mm", whiteSpace: "nowrap",
    background: "linear-gradient(180deg, #9a1b0b, #6b0a02)",
    color: "#ffe9a8", fontWeight: 800, fontFamily: "serif", fontSize: "1.25em", lineHeight: 1,
    padding: "0.6mm 3.5mm", borderRadius: "999px", border: "0.8pt solid #f5b301",
    boxShadow: "0 0 1.5mm rgba(245,158,11,0.7)", textShadow: "0 0 1mm rgba(251,191,36,0.6)",
  } as const;

  let headline = "";
  if (pageNum === 2 || pageNum === 7) headline = "विज्ञापन";
  else if (pageNum === 3) headline = "इंदौर सिटी";
  else if (pageNum === 4) headline = "संपादकीय";
  else if (pageNum === 5) headline = "प्रदेश";
  else if (pageNum === 6) headline = "सप्तरंग";
  else if (pageNum === 8) headline = "देश विदेश";

  // Use the datePlace or default
  const finalDatePlace = datePlace || "इंदौर - सोमवार, 24 अगस्त 2026";

  return (
    <div style={{ width: "100%", fontFamily: "sans-serif", color: "#111", marginBottom: "2mm" }}>
      <div style={{ 
        backgroundColor: "#fff000", 
        borderTop: "0.8pt solid #000",
        borderBottom: "0.8pt solid #000",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: festive ? "1mm 3mm" : "1.5mm 3mm"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4mm", flex: 1 }}>
          <div style={{ 
            backgroundColor: "#222", 
            color: "#fff", 
            width: "15mm", 
            height: "7.5mm", 
            borderRadius: "50%",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "1.3em",
            fontWeight: "bold"
          }}>
            {pageNum}
          </div>
          {headline && (
            <div style={{ 
              fontSize: "1.9em", 
              fontWeight: 900, 
              fontFamily: '"Arial Black", Impact, sans-serif',
              lineHeight: 1.1,
              paddingBottom: "1px",
              letterSpacing: "-0.02em"
            }}>
              {headline}
            </div>
          )}
        </div>
        
        <div style={{ flex: festive ? "0 0 auto" : 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "3mm" }}>
          {festive && <span style={pill}><Diya size={7.5} />शुभ दीपावली</span>}
          <img src="/logo.png?v=3" alt="जनशक्ति उजाला" style={{ height: "9mm", objectFit: "contain", display: "block" }} />
          {festive && <span style={pill}>शुभ दीपावली<Diya size={7.5} /></span>}
        </div>

        <div style={{ flex: 1, textAlign: "right", fontSize: "1em", fontWeight: 700 }}>
          {finalDatePlace}
        </div>
      </div>
      {festive ? (
        // marigold toran: alternating orange/yellow flowers hanging under the strip
        <div style={{
          height: "2mm",
          background:
            "radial-gradient(circle at 50% 35%, #ea580c 0 0.7mm, transparent 0.75mm) 0 0 / 4mm 2mm repeat-x," +
            "radial-gradient(circle at 50% 35%, #facc15 0 0.7mm, transparent 0.75mm) 2mm 0 / 4mm 2mm repeat-x",
          borderBottom: "0.8pt solid #000",
        }} />
      ) : (
        <div style={{ borderBottom: "0.8pt solid #000", marginTop: "1mm" }} />
      )}
    </div>
  );
}
