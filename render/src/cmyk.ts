import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { access, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ICC = path.join(__dirname, "..", "icc", "ISOnewspaper26v4.icc");

/**
 * Converts an RGB PDF to CMYK (newsprint ICC profile) via Ghostscript.
 * Gated behind env.CMYK_ENABLED — if disabled, or Ghostscript/profile is
 * missing, falls back to copying the RGB PDF through unchanged and logs why.
 */
export async function toCmyk(inputPdf: string, outputPdf: string): Promise<void> {
  if (process.env.CMYK_ENABLED !== "true") {
    console.warn("[cmyk] CMYK_ENABLED not set to true, skipping conversion");
    await copyFile(inputPdf, outputPdf);
    return;
  }

  const iccProfile = process.env.ICC_PROFILE ?? DEFAULT_ICC;
  try {
    await access(iccProfile);
  } catch {
    console.warn(`[cmyk] ICC profile not found at ${iccProfile}, skipping conversion (see render/icc/README.md)`);
    await copyFile(inputPdf, outputPdf);
    return;
  }

  try {
    await execFileAsync("gs", [
      "-dNOPAUSE",
      "-dBATCH",
      "-dSAFER",
      "-sDEVICE=pdfwrite",
      "-dPDFSETTINGS=/prepress",
      "-dEmbedAllFonts=true",
      "-dSubsetFonts=true",
      "-dAutoRotatePages=/None",
      "-sColorConversionStrategy=CMYK",
      "-dOverrideICC=true",
      `-sOutputICCProfile=${iccProfile}`,
      `-sOutputFile=${outputPdf}`,
      inputPdf,
    ]);
  } catch (err) {
    console.warn("[cmyk] Ghostscript unavailable or failed, falling back to RGB PDF:", (err as Error).message);
    await copyFile(inputPdf, outputPdf);
  }
}
