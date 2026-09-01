/** Pure lock policy. No Firestore import, so it is testable and server-safe. */
import type { PageDoc } from "./types";

/** A lock older than this is treated as abandoned (browser closed, laptop slept). */
export const LOCK_STALE_MS = 2 * 60 * 1000;
export const HEARTBEAT_MS = 30 * 1000;

export const isHeldByOther = (page: PageDoc, uid: string, now = Date.now()): boolean =>
  page.lockedBy !== null &&
  page.lockedBy !== uid &&
  page.lockedAt !== null &&
  now - page.lockedAt < LOCK_STALE_MS;
