"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import EditionCard from "@/components/EditionCard";
import { useUser, signOutNow } from "@/lib/auth";
import { subscribeEditions, createEdition } from "@/lib/edition";
import type { EditionDoc } from "@/lib/types";

function EditionsList() {
  const { user } = useUser();
  const router = useRouter();
  const [editions, setEditions] = useState<EditionDoc[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = subscribeEditions(setEditions);
    return unsub;
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setCreating(true);
    try {
      const id = await createEdition(user.uid, title.trim(), date);
      router.push(`/editions/${id}/edit`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
        <h1 className="text-lg font-bold text-neutral-900">जनशक्ति उजाला</h1>
        <button
          onClick={() => signOutNow()}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700"
        >
          लॉगआउट
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-600">
            कुल {editions.length}
          </p>
          <button
            onClick={() => setShowNew((s) => !s)}
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            + नया ई-पेपर बनाएँ
          </button>
        </div>

        {showNew && (
          <form
            onSubmit={onCreate}
            className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                शीर्षक
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                तारीख
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {creating ? "बन रहा है…" : "बनाएँ"}
            </button>
          </form>
        )}

        {editions.length === 0 ? (
          <p className="text-center text-neutral-500">कोई ई-पेपर नहीं मिला</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {editions.map((ed) =>
              user ? <EditionCard key={ed.id} edition={ed} user={user} /> : null,
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function EditionsPage() {
  return (
    <AuthGate>
      <EditionsList />
    </AuthGate>
  );
}
