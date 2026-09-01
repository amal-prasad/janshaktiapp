"use client";
import { BLOCKS } from "@/components/blocks";
import type { BlockType } from "@/lib/types";

type Props = {
  onPick: (type: BlockType) => void;
  onClose: () => void;
};

/** Element picker: bottom sheet on phone, right sidebar on desktop. */
export default function ElementsPanel({ onPick, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="बंद करें"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-4
          md:bottom-0 md:right-0 md:left-auto md:top-0 md:h-full md:w-80 md:max-h-none md:rounded-none md:rounded-l-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">एलिमेंट जोड़ें</h3>
          <button className="text-sm text-gray-500" onClick={onClose}>
            बंद करें
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {Object.values(BLOCKS).map((def) => (
            <button
              key={def.type}
              onClick={() => onPick(def.type)}
              className="rounded-lg border border-gray-300 px-3 py-3 text-sm hover:bg-gray-50"
            >
              {def.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
