// Contract for block types. W2 fills BLOCKS with one entry per BlockType.
import type { ComponentType } from "react";
import type { Block, BlockType } from "@/lib/types";

export type BlockRenderProps<T extends Block> = {
  block: T;
  /** false in the print route and in read-only (locked) pages */
  editing: boolean;
  onChange: (next: T) => void;
};

export type BlockDef<T extends Block = Block> = {
  type: T["type"];
  /** Hindi label shown in the Elements panel */
  label: string;
  create: () => T;
  Render: ComponentType<BlockRenderProps<T>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockRegistry = Record<BlockType, BlockDef<any>>;
