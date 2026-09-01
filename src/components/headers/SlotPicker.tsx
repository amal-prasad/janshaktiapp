"use client";
import { useState } from "react";
import type { EditionDoc, HeaderSlot, SlotConfig } from "@/lib/types";
import { setSlot } from "@/lib/edition";
import { SLOT_COLORS } from "./registry";
import { templatesFor, findTemplate } from "./index";

const SLOT_TABS: { slot: HeaderSlot; label: string }[] = [
  { slot: "header", label: "हेडर" },
  { slot: "header2", label: "2nd हेडर" },
  { slot: "subheader", label: "सबहेडर" },
  { slot: "footer", label: "फुटर" },
];

export default function SlotPicker({ editionId, edition }: { editionId: string; edition: EditionDoc }) {
  const [activeSlot, setActiveSlot] = useState<HeaderSlot>("header");
  const config = edition.slots[activeSlot];
  const template = findTemplate(config.templateId);

  const patch = (next: Partial<SlotConfig>) => {
    const merged: SlotConfig = { ...config, ...next };
    setSlot(editionId, activeSlot, merged);
  };

  return (
    <div style={{ fontFamily: "sans-serif", fontSize: "13px" }}>
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid #ddd", marginBottom: "8px" }}>
        {SLOT_TABS.map((t) => (
          <button
            key={t.slot}
            onClick={() => setActiveSlot(t.slot)}
            style={{
              padding: "6px 12px",
              border: "none",
              borderBottom: activeSlot === t.slot ? "2px solid #b3151b" : "2px solid transparent",
              background: "none",
              fontWeight: activeSlot === t.slot ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <input type="checkbox" checked={config.enabled} onChange={(e) => patch({ enabled: e.target.checked })} />
        सक्रिय करें
      </label>

      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        {SLOT_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => patch({ color: c })}
            title={c}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: c,
              border: config.color === c ? "2px solid #000" : "1px solid #ccc",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto", marginBottom: "10px" }}>
        {templatesFor(activeSlot).map((t) => {
          const previewFields: Record<string, string> = {};
          for (const f of t.fields) previewFields[f.key] = config.templateId === t.id ? (config.fields[f.key] ?? f.default) : f.default;
          return (
            <div
              key={t.id}
              onClick={() => patch({ templateId: t.id })}
              style={{
                border: config.templateId === t.id ? "2px solid #b3151b" : "1px solid #ddd",
                borderRadius: "4px",
                padding: "4px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: "11px", color: "#666", marginBottom: "2px" }}>{t.label}</div>
              <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%" }}>
                <t.Render fields={previewFields} color={config.color} logoUrl={config.logoUrl} />
              </div>
            </div>
          );
        })}
      </div>

      {template && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {template.fields.map((f) => (
            <label key={f.key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "11px", color: "#555" }}>{f.label}</span>
              <input
                type="text"
                value={config.fields[f.key] ?? f.default}
                onChange={(e) => patch({ fields: { ...config.fields, [f.key]: e.target.value } })}
                style={{ padding: "4px 6px", border: "1px solid #ccc", borderRadius: "3px" }}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
