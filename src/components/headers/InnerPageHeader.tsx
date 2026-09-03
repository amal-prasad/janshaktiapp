
export default function InnerPageHeader({
  pageIndex,
  datePlace,
}: {
  pageIndex: number;
  datePlace?: string;
}) {
  const pageNum = pageIndex + 1;

  let headline = "";
  if (pageNum === 3) headline = "इंदौर सिटी";
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
        padding: "1.5mm 3mm"
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
              fontSize: "1.8em", 
              fontWeight: 900, 
              borderBottom: "2px solid #000",
              lineHeight: 1.1,
              paddingBottom: "1px"
            }}>
              {headline}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <img src="/logo.png?v=3" alt="जनशक्ति उजाला" style={{ height: "9mm", objectFit: "contain" }} />
        </div>

        <div style={{ flex: 1, textAlign: "right", fontSize: "1em", fontWeight: 700 }}>
          {finalDatePlace}
        </div>
      </div>
      <div style={{ borderBottom: "0.8pt solid #000", marginTop: "1mm" }} />
    </div>
  );
}
