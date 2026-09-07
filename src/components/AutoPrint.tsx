"use client";
import { useEffect } from "react";

export default function AutoPrint() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Wait for the faces actually in use to finish loading (not just
      // whatever document.fonts.ready already had pending on a cold load).
      await Promise.all([...document.fonts].map((f) => f.load().catch(() => null)));
      await document.fonts.ready;
      if (!cancelled && !navigator.webdriver) {
        window.print();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
