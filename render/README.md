# epaper-render

PDF export service. Headless Chromium prints the app's `/print/{editionId}`
route (real page, real HarfBuzz Devanagari shaping) to a press-ready PDF,
optionally converts it to CMYK via Ghostscript, and uploads it to Firebase
Storage.

## Run locally

```bash
cd render
npm install
cp ../.env.local.example .env   # or set vars below directly
npm run dev
```

`POST /render` with `{ "editionId": "abc123" }` and header
`Authorization: Bearer <firebase id token>`.

## Env vars

| Var | Required | Notes |
|---|---|---|
| `APP_URL` | yes | Base URL of the Next.js app, e.g. `https://epaper.example.com` |
| `PORT` | no | Default `8080` |
| `CMYK_ENABLED` | no | `"true"` to enable Ghostscript conversion; default off (RGB PDF returned) |
| `ICC_PROFILE` | no | Path to newsprint ICC profile; defaults to `render/icc/ISOnewspaper26v4.icc` |
| `GOOGLE_APPLICATION_CREDENTIALS` | yes (or ADC) | Path to a service account JSON for firebase-admin |
| `STORAGE_BUCKET` | yes | Firebase Storage bucket name |

## Deploy

```bash
gcloud run deploy epaper-render \
  --source render \
  --region asia-south1 \
  --set-env-vars APP_URL=https://epaper.example.com,CMYK_ENABLED=true \
  --memory 2Gi \
  --timeout 120
```

## CMYK black — verify on a physical proof before trusting it

A naive RGB→CMYK conversion turns black text into "rich black" (4-colour
C+M+Y+K instead of K-only). On an offset press this mis-registers by a
fraction of a millimetre between plates, which makes body text look fuzzy or
haloed on newsprint — a defect invisible on any screen, because your monitor
composites the four channels perfectly. `PDFSETTINGS=/prepress` with the
newsprint ICC profile is a reasonable default, not a guarantee. Before trusting
CMYK output for a print run, pull a physical proof on the actual press (or at
least the actual paper stock) and check black text under a loupe.
