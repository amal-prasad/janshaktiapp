"use client";
import { createContext, useContext } from "react";

/**
 * Supplies editionId + the block's printed column width to blocks, without
 * widening the fixed BlockRenderProps contract. Deliberately free of any
 * Firebase import: the print route server-renders blocks, and the block unit
 * tests import them under plain Node.
 */
export const PrintContext = createContext<{ editionId: string; placedMm: number }>({
  editionId: "",
  placedMm: 0,
});

export const usePrintContext = () => useContext(PrintContext);
