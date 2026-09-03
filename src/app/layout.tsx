import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Hind } from "next/font/google";
import "./globals.css";

// One family for the whole product, per requirement. Swap to Noto_Serif_Devanagari
// here if the printed body copy reads too light -- nothing else changes.
const noto = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-dev",
  display: "swap",
});

const hind = Hind({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  title: "जनशक्ति उजाला — ePaper Designer",
  description: "In-house newspaper layout and PDF export",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${noto.variable} ${hind.variable}`}>
      <head>
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
      <body className="bg-neutral-100 text-neutral-900">{children}</body>
    </html>
  );
}
