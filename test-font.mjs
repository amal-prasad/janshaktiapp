import { chromium } from "playwright";

async function run() {
  const b = await chromium.launch();
  const context = await b.newContext();
  const page = await context.newPage();
  
  const html = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Halant:wght@400;700&display=swap');
        :root { --font-halant: 'Halant'; }
        body { font-family: var(--font-halant), serif; font-size: 24px; }
      </style>
    </head>
    <body>
      <div id="test">राष्ट्रीय स्वच्छ वायु सर्वेक्षण</div>
    </body>
    </html>
  `;
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  
  const fonts = await page.evaluate(() => {
    return Array.from(document.fonts).map(f => ({ family: f.family, status: f.status }));
  });
  console.log("Fonts loaded:", fonts);
  
  await b.close();
}
run().catch(console.error);
