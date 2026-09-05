/** Font choices offered per news block. Keys are persisted in NewsBlock.fontFamily. */
export const FONT_OPTIONS = [
  { key: "noto", label: "नोटो सैंस (डिफ़ॉल्ट)", css: "var(--font-hi)" },
  { key: "halant", label: "हलंत", css: "var(--font-halant-hi)" },
] as const;

export type FontKey = (typeof FONT_OPTIONS)[number]["key"];

export const DEFAULT_FONT_KEY: FontKey = "noto";

/** CSS font-family stack for a persisted key. Unknown/undefined -> default. */
export function fontStack(key: string | undefined): string {
  return FONT_OPTIONS.find((f) => f.key === key)?.css ?? FONT_OPTIONS[0].css;
}
