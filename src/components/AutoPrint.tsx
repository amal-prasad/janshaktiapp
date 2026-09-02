"use client";
import { useEffect } from "react";

export default function AutoPrint() {
  useEffect(() => {
    // Small delay to ensure images/fonts are fully loaded
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
