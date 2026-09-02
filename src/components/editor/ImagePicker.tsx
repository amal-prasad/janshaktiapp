"use client";
import { useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import { checkImage } from "@/lib/dpi";
import { uploadImage } from "@/lib/upload";

export { PrintContext, usePrintContext } from "./printContext";

type Props = {
  editionId: string;
  image: ImageRef | undefined;
  onChange: (next: ImageRef | undefined) => void;
  placedMm: number;
};

export default function ImagePicker({ editionId, image, onChange, placedMm }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const next = await uploadImage(editionId, file);
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "अपलोड विफल हुआ।");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const verdict = image ? checkImage(image.naturalW, placedMm) : null;

  return (
    <div className="my-1 rounded border border-gray-200 bg-gray-50 p-2 text-sm">
      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
          {image ? "बदलें" : "फ़ोटो चुनें"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
        {busy && <span className="text-xs text-gray-500">अपलोड हो रहा है…</span>}
        {image && !busy && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
          >
            हटाएँ
          </button>
        )}
      </div>

      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}

      {image && (
        <>
          <input
            type="text"
            value={image.caption ?? ""}
            onChange={(e) => onChange({ ...image, caption: e.target.value })}
            placeholder="कैप्शन"
            className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-xs"
          />

          {verdict && !verdict.ok && (
            <div className="mt-2 rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
              चेतावनी: यह फ़ोटो केवल {verdict.dpi} dpi पर छपेगी। कम से कम {verdict.needed} पिक्सेल
              चौड़ी फ़ोटो चाहिए।
            </div>
          )}
        </>
      )}
    </div>
  );
}
