"use client";

/** Without this, any throw in a client component renders a blank white page. */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-xl font-semibold">कुछ गड़बड़ हो गई</h1>
      <pre className="mb-4 overflow-auto rounded bg-neutral-200 p-3 text-xs text-neutral-800">
        {error.message}
      </pre>
      <button onClick={reset} className="rounded bg-neutral-900 px-4 py-2 text-sm text-white">
        दोबारा प्रयास करें
      </button>
    </div>
  );
}
