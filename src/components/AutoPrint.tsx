"use client";
import { useEffect } from "react";

export default function AutoPrint() {
  useEffect(() => {
    // Wait for fonts to be loaded and a small delay for images
    document.fonts.ready.then(() => {
      const timer = setTimeout(() => {
        if (!navigator.webdriver) {
          window.print();
        }
      }, 1000);
      // Cannot easily clear this timeout on unmount since it's inside the promise, 
      // but AutoPrint is only used on a dedicated print page.
    });
  }, []);

  return null;
}
