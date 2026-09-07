import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

// One family for the whole product, per requirement. Swap to Noto_Serif_Devanagari
// here if the printed body copy reads too light -- nothing else changes.
const noto = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-dev",
  display: "swap",
});

// Halant is loaded via standard Google Fonts <link> tag in the layout
// to ensure headless Chromium reliably fetches and embeds it for PDF export.

export const metadata: Metadata = {
  title: "जनशक्ति उजाला — ePaper Designer",
  description: "In-house newspaper layout and PDF export",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${noto.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Halant:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        {/*
          An earlier build of this app left a service worker registered on this origin.
          It kept replaying its cached (Next 14-era) chunks, which surfaced as four
          "Cannot read properties of undefined (reading 'call')" runtime errors that no
          amount of server-side cache clearing could fix. This kills any stale worker on
          first load, then reloads once so the page runs on freshly served assets.
          ponytail: unconditional -- delete this block if we ever ship a real PWA worker.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `navigator.serviceWorker&&navigator.serviceWorker.getRegistrations().then(async function(rs){if(!rs.length)return;await Promise.all(rs.map(function(r){return r.unregister()}));if(window.caches){var k=await caches.keys();await Promise.all(k.map(function(n){return caches.delete(n)}))}location.reload()}).catch(function(){});`,
          }}
        />
      </head>
      <body className="bg-neutral-100 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
