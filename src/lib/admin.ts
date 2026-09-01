import "server-only";
import { cert, getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { EditionDoc, PageDoc } from "@/lib/types";

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  // Against the emulators the admin SDK talks to localhost and needs no key;
  // asking for one would just fail. FIRESTORE_EMULATOR_HOST and
  // FIREBASE_AUTH_EMULATOR_HOST are picked up by the SDK itself.
  const emulated = !!process.env.FIRESTORE_EMULATOR_HOST;
  return initializeApp({
    ...(emulated ? {} : { credential: raw ? cert(JSON.parse(raw)) : applicationDefault() }),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

/** Returns the uid, or null. The print route is reachable by URL, so this gates it. */
export async function verifyToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    return (await getAuth(adminApp()).verifyIdToken(token)).uid;
  } catch {
    return null;
  }
}

export async function loadForPrint(
  editionId: string,
): Promise<{ edition: EditionDoc; pages: PageDoc[] } | null> {
  const db = getFirestore(adminApp());
  const snap = await db.collection("editions").doc(editionId).get();
  if (!snap.exists) return null;
  const pages = await db
    .collection("editions").doc(editionId).collection("pages")
    .orderBy("index").get();
  return {
    edition: { id: snap.id, ...snap.data() } as EditionDoc,
    pages: pages.docs.map((d) => ({ id: d.id, ...d.data() }) as PageDoc),
  };
}
