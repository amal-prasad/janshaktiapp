"use client";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PageDoc } from "@/lib/types";
import { isHeldByOther } from "@/lib/lockRules";

export { LOCK_STALE_MS, HEARTBEAT_MS, isHeldByOther } from "@/lib/lockRules";

const pageRef = (editionId: string, pageId: string) =>
  doc(db, "editions", editionId, "pages", pageId);

/**
 * Take the lock, or refresh it if already ours. Returns false when someone else
 * holds it. Transactional, because two editors opening the same page at the same
 * moment is exactly the case this exists for.
 */
export async function acquire(editionId: string, pageId: string, uid: string): Promise<boolean> {
  const ref = pageRef(editionId, pageId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return false;
    const page = { id: snap.id, ...snap.data() } as PageDoc;
    if (isHeldByOther(page, uid)) return false;
    tx.update(ref, { lockedBy: uid, lockedAt: Date.now() });
    return true;
  });
}

export async function release(editionId: string, pageId: string, uid: string): Promise<void> {
  const ref = pageRef(editionId, pageId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    // Only release our own lock -- never stomp a lock someone else has since taken.
    if (snap.exists() && snap.data().lockedBy === uid) {
      tx.update(ref, { lockedBy: null, lockedAt: null });
    }
  });
}
