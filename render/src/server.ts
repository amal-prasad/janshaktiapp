import express from "express";
import { chromium, type Browser } from "playwright";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { toCmyk } from "./cmyk.js";

const PORT = process.env.PORT ?? 8080;
const APP_URL = process.env.APP_URL;
if (!APP_URL) throw new Error("APP_URL env var is required");

const RENDER_TIMEOUT_MS = 90_000;
const EDITION_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// Against the emulators the admin SDK needs no real key, and asking for one
// via applicationDefault() throws with no ADC configured (see src/lib/admin.ts).
const emulated = !!process.env.FIRESTORE_EMULATOR_HOST;
initializeApp({
  ...(emulated ? {} : { credential: applicationDefault() }),
  storageBucket: process.env.STORAGE_BUCKET,
  serviceAccountId: process.env.SERVICE_ACCOUNT_EMAIL || "814470482288-compute@developer.gserviceaccount.com",
});

let browser: Browser | undefined;
async function getBrowser(): Promise<Browser> {
  if (!browser) browser = await chromium.launch();
  return browser;
}

const app = express();
app.use(express.json());
// ponytail: single trusted origin, no cors package needed for one allowed origin.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.APP_URL ?? "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

app.post("/render", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
      res.status(401).json({ error: "missing bearer token" });
      return;
    }
    let decoded;
    try {
      decoded = await getAuth().verifyIdToken(token);
    } catch {
      res.status(401).json({ error: "invalid token" });
      return;
    }
    void decoded; // token identity not otherwise needed here

    const { editionId, cmyk } = req.body ?? {};
    if (typeof editionId !== "string" || !EDITION_ID_RE.test(editionId)) {
      res.status(400).json({ error: "invalid editionId" });
      return;
    }

    const result = await Promise.race([
      renderEdition(editionId, token, cmyk === true),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("render timed out")), RENDER_TIMEOUT_MS)
      ),
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error("[render] failed:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

async function renderEdition(editionId: string, idToken: string, wantCmyk: boolean) {
  const b = await getBrowser();
  const context = await b.newContext();
  const page = await context.newPage();
  const tmpDir = await mkdtemp(path.join(tmpdir(), "epaper-"));
  const rgbPdf = path.join(tmpDir, "rgb.pdf");
  const finalPdf = path.join(tmpDir, "final.pdf");

  try {
    await page.goto(`${APP_URL}/print/${editionId}?token=${idToken}`, {
      waitUntil: "networkidle",
    });

    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() =>
      Promise.all(
        [...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null)))
      )
    );

    // App Router owns <body>, so the page marks any element it controls instead.
    const { w, h } = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("[data-page-w][data-page-h]");
      return { w: el?.dataset.pageW, h: el?.dataset.pageH };
    });
    if (!w || !h) throw new Error("print route did not set data-page-w/data-page-h");

    await page.pdf({
      path: rgbPdf,
      width: `${w}mm`,
      height: `${h}mm`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    const cmykRequested = process.env.CMYK_ENABLED === "true" && wantCmyk;
    let outputPath = rgbPdf;
    let cmykApplied = false;
    if (cmykRequested) {
      await toCmyk(rgbPdf, finalPdf);
      outputPath = finalPdf;
      cmykApplied = true; // toCmyk itself falls back to a copy when gs/profile is unavailable
    }

    const bucket = getStorage().bucket();
    const destination = `editions/${editionId}/export-${Date.now()}.pdf`;
    const downloadToken = randomUUID();
    await bucket.upload(outputPath, {
      destination,
      contentType: "application/pdf",
      metadata: emulated ? { metadata: { firebaseStorageDownloadTokens: downloadToken } } : undefined,
    });
    const file = bucket.file(destination);
    // getSignedUrl() needs a real private key to sign with -- the Storage
    // emulator has none. Its download-token URL is what getDownloadURL() uses
    // in production too, and it bypasses storage.rules the same way there.
    const url = emulated
      ? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`
      : (
          await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          })
        )[0];

    return { url, cmyk: cmykApplied };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

app.listen(PORT, () => {
  console.log(`epaper-render listening on ${PORT}`);
});
