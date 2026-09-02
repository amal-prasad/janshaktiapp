// Contract for masthead/footer templates. W3 fills TEMPLATES.
import type { ComponentType } from "react";
import type { HeaderSlot } from "@/lib/types";

export type SlotRenderProps = {
  fields: Record<string, string>;
  color: string;
  logoUrl?: string;
  editing?: boolean;
  onChange?: (fields: Record<string, string>) => void;
};

export type SlotField = { key: string; label: string; default: string };

export type SlotTemplate = {
  id: string;
  slot: HeaderSlot;
  label: string;
  fields: SlotField[];
  Render: ComponentType<SlotRenderProps>;
};

/** Swatches offered in the colour row of the template picker. */
export const SLOT_COLORS = [
  "#111111", "#b3151b", "#0b4a8f", "#0d6b3f", "#7a1f6a", "#c25e00",
];
