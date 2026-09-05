// Shared contract. Wave-1 workers implement against these and must NOT edit this file.

export type PageSizeMm = { w: number; h: number };

/** Indian broadsheet. Confirm with press before first print run. */
export const DEFAULT_PAGE_SIZE: PageSizeMm = { w: 292.1, h: 457.2 };

/** Column layouts offered by the "Add New Row" picker. Every preset sums to 12. */
export const ROW_PRESETS: number[][] = [
  [12],
  [6, 6],
  [3, 9],
  [9, 3],
  [4, 8],
  [8, 4],
  [5, 7],
  [7, 5],
  [4, 4, 4],
  [3, 3, 3, 3],
];

export type ImageRef = {
  url: string;
  storagePath: string;
  /** natural pixel size, used for the 300dpi check */
  naturalW: number;
  naturalH: number;
  /** focal point 0..1, drives object-position so any crop keeps the subject */
  focalX: number;
  focalY: number;
  caption?: string;
  /** placed width as % of the column, 20..100. undefined = 100 */
  widthPct?: number;
  /** fixed placed height in mm. undefined = auto from the source aspect ratio */
  heightMm?: number;
  /** how body text sits against the photo. undefined = "full" (photo above, no wrap) */
  float?: "left" | "right" | "full" | "center";
  /** horizontal placement inside the article box when the photo does not wrap
   *  (float "full"). undefined = "center" */
  align?: "left" | "center" | "right";
};

type Base = { id: string };

export type NewsBlock = Base & {
  type: "news";
  subhead?: string;
  headline: string;
  byline?: string;
  /** plain-text body. Legacy + fallback; `bodyHtml` wins when present. */
  body: string;
  /** rich-text body (sanitised HTML: b/i/u/ul/ol/li/br/p/span-align). */
  bodyHtml?: string;
  image?: ImageRef;
  /** font key from FONT_OPTIONS in src/lib/fonts.ts. undefined = "noto" */
  fontFamily?: string;
  /** headline scale multiplier, 1 = default */
  headlineScale?: number;
  /** fixed block height in mm; body text clips at this, doesn't push page. undefined = 90mm */
  heightMm?: number;
  /** number of text columns. undefined defaults to 1 or 2 based on wrapping */
  columns?: number;
};

export type AdBlock = Base & {
  type: "ad";
  image?: ImageRef;
  placeholderText?: string;
  /** fixed placed height in mm, used for full-page ads. undefined = auto */
  heightMm?: number;
};

export type HeadlinesBlock = Base & {
  type: "headlines";
  title: string;
  items: string[];
};

export type ShortNewsBlock = Base & {
  type: "shortnews";
  title: string;
  items: { title: string; body: string }[];
};

export type RashifalSign = { name: string; text: string };

export type RashifalBlock = Base & {
  type: "rashifal";
  title: string;
  /** exactly 12, in RASHIFAL_SIGNS order */
  signs: RashifalSign[];
};

export type CalendarBlock = Base & {
  type: "calendar";
  title?: string;
  month: number; // 1-12
  year: number;
};

export type Block =
  | NewsBlock
  | AdBlock
  | HeadlinesBlock
  | ShortNewsBlock
  | RashifalBlock
  | CalendarBlock;

export type BlockType = Block["type"];

export const RASHIFAL_SIGNS = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन",
] as const;

export type Column = { id: string; span: number; blocks: Block[] };
export type Row = { id: string; cols: Column[] };

export type PageDoc = {
  id: string;
  index: number;
  rows: Row[];
  lockedBy: string | null;
  lockedAt: number | null;
};

export type HeaderSlot = "header" | "header2" | "subheader" | "footer";

export type SlotConfig = {
  templateId: string;
  color: string;
  fields: Record<string, string>;
  logoUrl?: string;
  enabled: boolean;
};

export type EditionDoc = {
  id: string;
  title: string;
  /** ISO yyyy-mm-dd */
  date: string;
  pageCount: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  pageSizeMm: PageSizeMm;
  slots: Record<HeaderSlot, SlotConfig>;
};

export type UserDoc = {
  uid: string;
  name: string;
  role: "admin" | "editor";
};
