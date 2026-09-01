# जनशक्ति उजाला — ePaper Designer

In-house newspaper layout tool. Lay out pages from 12-column rows and blocks,
type Hindi copy, export a press-ready PDF.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill from Firebase console
npm run dev
```

Accounts are created by an admin, not by signup:

```bash
# scripts/users.json  ->  [{ "email": "...", "password": "...", "name": "...", "role": "editor" }]
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npm run seed
```

## PDF export

`render/` is a separate Cloud Run service: headless Chromium prints
`/print/{editionId}`, then Ghostscript converts RGB to CMYK for the press.
See `render/README.md`.

## Page size

Defaults to Indian broadsheet 375 x 578 mm (`DEFAULT_PAGE_SIZE` in
`src/lib/types.ts`), stored per edition. Confirm the real size with the press
before the first print run.
