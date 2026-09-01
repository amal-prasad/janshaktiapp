"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Props = { holderUid?: string | null };

/** Sticky amber banner shown when the current page is locked by someone else. */
export default function LockBanner({ holderUid }: Props) {
  const [name, setName] = useState("कोई अन्य सदस्य");

  useEffect(() => {
    if (!holderUid) return;
    let cancelled = false;
    getDoc(doc(db, "users", holderUid))
      .then((snap) => {
        if (!cancelled && snap.exists()) {
          const n = (snap.data() as { name?: string }).name;
          if (n) setName(n);
        }
      })
      .catch(() => {
        // ponytail: rules only allow reading our own user doc; fall back to generic name.
      });
    return () => {
      cancelled = true;
    };
  }, [holderUid]);

  return (
    <div className="sticky top-0 z-10 border-b border-amber-300 bg-amber-100 px-3 py-2 text-sm text-amber-900">
      यह पृष्ठ अभी {name} द्वारा संपादित किया जा रहा है — आप केवल देख सकते हैं।
    </div>
  );
}
