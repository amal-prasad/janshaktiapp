"use client";
import type { HeaderSlot, SlotConfig } from "@/lib/types";
import { findTemplate } from "./index";

export default function SlotRender({ config, editing, onChange }: { slot: HeaderSlot; config: SlotConfig; editing?: boolean; onChange?: (next: SlotConfig) => void }) {
  if (!config.enabled) return null;
  const template = findTemplate(config.templateId);
  if (!template) return null;

  const fields: Record<string, string> = {};
  for (const f of template.fields) fields[f.key] = config.fields[f.key] ?? f.default;

  const { Render } = template;
  return <Render fields={fields} color={config.color} logoUrl={config.logoUrl} editing={editing} onChange={(newFields) => onChange?.({ ...config, fields: newFields })} />;
}
