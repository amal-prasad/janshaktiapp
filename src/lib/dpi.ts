/** Print resolution checks. Pure — unit tested in dpi.test.ts. */

export const MM_PER_INCH = 25.4;
/** Below this, newsprint shows visible softness. */
export const MIN_DPI = 300;

/** Effective resolution of an image with `px` pixels placed across `mm` millimetres. */
export function effectiveDpi(px: number, mm: number): number {
  if (mm <= 0) return 0;
  return px / (mm / MM_PER_INCH);
}

/** Pixels needed to hit MIN_DPI across a given printed width. */
export function pixelsNeeded(mm: number, dpi: number = MIN_DPI): number {
  return Math.ceil((mm / MM_PER_INCH) * dpi);
}

export type DpiVerdict = { ok: boolean; dpi: number; needed: number };

export function checkImage(naturalW: number, placedMm: number): DpiVerdict {
  const dpi = Math.round(effectiveDpi(naturalW, placedMm));
  return { ok: dpi >= MIN_DPI, dpi, needed: pixelsNeeded(placedMm) };
}

/** Printed width in mm of a column of `span` out of 12 on a page `pageWmm` wide. */
export function columnWidthMm(span: number, pageWmm: number, marginMm = 12.7, gutterMm = 4): number {
  const usable = pageWmm - marginMm * 2 - gutterMm * 11;
  return (usable / 12) * span + gutterMm * (span - 1);
}
