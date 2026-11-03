// ponytail: temporary festive strip for Diwali edition; delete this file + its 2 usages to roll back.

export function Diya({ size = 9 }: { size?: number }) {
  return (
    <svg width={`${size}mm`} height={`${size}mm`} viewBox="0 4 64 54" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      {/* flame */}
      <path d="M32 6 C38 16 40 22 32 30 C24 22 26 16 32 6 Z" fill="#ffb300" />
      <path d="M32 13 C35 19 35 23 32 27 C29 23 29 19 32 13 Z" fill="#fff3b0" />
      {/* bowl */}
      <path d="M6 34 Q32 30 58 34 Q54 54 32 56 Q10 54 6 34 Z" fill="#c2410c" />
      <path d="M6 34 Q32 30 58 34 Q32 40 6 34 Z" fill="#7c2d12" />
      <circle cx="20" cy="45" r="2" fill="#fde68a" />
      <circle cx="32" cy="48" r="2" fill="#fde68a" />
      <circle cx="44" cy="45" r="2" fill="#fde68a" />
    </svg>
  );
}

export default function DiwaliBanner() {
  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(90deg, #7c0a02, #c2410c 30%, #f59e0b 50%, #c2410c 70%, #7c0a02)",
        borderTop: "1.2pt solid #fbbf24",
        borderBottom: "1.2pt solid #fbbf24",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.8mm 4mm",
        marginBottom: "1.5mm",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", gap: "2mm" }}>
        <Diya /><Diya size={7} /><Diya />
      </div>
      <div
        style={{
          color: "#fff8dc",
          fontSize: "1.9em",
          fontWeight: 900,
          fontFamily: "serif",
          letterSpacing: "0.04em",
          textShadow: "0 0 3px #7c0a02, 0 0 6px #fbbf24",
        }}
      >
        ✨ शुभ दीपावली ✨
      </div>
      <div style={{ display: "flex", gap: "2mm" }}>
        <Diya /><Diya size={7} /><Diya />
      </div>
    </div>
  );
}
