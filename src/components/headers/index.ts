import type { SlotTemplate } from "./registry";
import type { HeaderSlot } from "@/lib/types";
import { headerTemplates } from "./headerTemplates";
import { header2Templates } from "./header2Templates";
import { subheaderTemplates } from "./subheaderTemplates";
import { footerTemplates } from "./footerTemplates";

export const TEMPLATES: SlotTemplate[] = [
  ...headerTemplates,
  ...header2Templates,
  ...subheaderTemplates,
  ...footerTemplates,
];

export const templatesFor = (slot: HeaderSlot) => TEMPLATES.filter((t) => t.slot === slot);

export const findTemplate = (id: string) => TEMPLATES.find((t) => t.id === id);
