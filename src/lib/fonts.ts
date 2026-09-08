/** Font choices offered per news block. Keys are persisted in NewsBlock.fontFamily. */
export const FONT_OPTIONS = [
  { key: "noto", label: "नोटो सैंस (डिफ़ॉल्ट)", css: "var(--font-hi)" },
  // Literal stack, not a var() -- a single undefined CSS custom property
  // anywhere in the chain invalidates the whole font-family declaration at
  // computed-value time, which is exactly what silently broke Halant before.
  { key: "halant", label: "हलंत", css: "'Halant', 'Noto Sans Devanagari', serif" },
  // ponytail: Shree Lipi is a proprietary legacy Devanagari font with no Unicode
  // webfont available (old glyph-remapped encoding) -- can't bundle it via
  // next/font. Rely on the system-installed font if present, else fall back to
  // Noto (Unicode-correct) instead of rendering mojibake.
  { key: "shreelipi", label: "श्री लिपि", css: '"Shree Lipi", var(--font-hi)' },
] as const;

export type FontKey = (typeof FONT_OPTIONS)[number]["key"];

export const DEFAULT_FONT_KEY: FontKey = "noto";

/** CSS font-family stack for a persisted key. Unknown/undefined -> default. */
export function fontStack(key: string | undefined): string {
  return FONT_OPTIONS.find((f) => f.key === key)?.css ?? FONT_OPTIONS[0].css;
}
