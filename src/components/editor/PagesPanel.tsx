"use client";
import type { PageDoc } from "@/lib/types";

type Props = {
  pages: PageDoc[];
  activePageId: string;
  onSelect: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
};

export default function PagesPanel({ pages, activePageId, onSelect, onAddPage, onDeletePage }: Props) {
  return (
    <div className="space-y-3 p-3">
      <div className="grid grid-cols-3 gap-2">
        {pages.map((p) => (
          <div key={p.id} className="relative">
            <button
              onClick={() => onSelect(p.id)}
              className={`flex aspect-[3/4] w-full items-center justify-center rounded border text-xs ${
                p.id === activePageId ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
            >
              पेज {p.index + 1}
            </button>
            {pages.length > 1 && (
              <button
                onClick={() => onDeletePage(p.id)}
                className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white"
                title="पेज हटाएँ"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={onAddPage} className="w-full rounded border border-gray-300 py-2 text-sm">
        + नया पेज जोड़ें
      </button>
    </div>
  );
}
