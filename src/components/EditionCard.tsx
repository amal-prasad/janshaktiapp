"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EditionDoc } from "@/lib/types";
import { deleteEdition, duplicateEdition } from "@/lib/edition";
import type { User } from "firebase/auth";

export default function EditionCard({
  edition,
  user,
}: {
  edition: EditionDoc;
  user: User;
}) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onCopy() {
    setBusy(true);
    try {
      await duplicateEdition(user.uid, edition);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setBusy(true);
    try {
      await deleteEdition(edition.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="truncate text-lg font-semibold text-neutral-900">
        {edition.title}
      </h3>
      <p className="mt-1 text-sm text-neutral-500">
        बनाया गया: {edition.date}
      </p>
      <p className="text-sm text-neutral-500">पृष्ठ: {edition.pageCount}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => router.push(`/editions/${edition.id}/edit`)}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          खोलें
        </button>
        <button
          onClick={onCopy}
          disabled={busy}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-50"
        >
          कॉपी
        </button>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            disabled={busy}
            className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 disabled:opacity-50"
          >
            हटाएँ
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <span className="text-sm text-red-600">पक्का हटाएँ?</span>
            <button
              onClick={onDelete}
              disabled={busy}
              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              हाँ, हटाएँ
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={busy}
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700"
            >
              रद्द करें
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
