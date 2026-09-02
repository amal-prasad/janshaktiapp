"use client";
import {
  collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, orderBy, query, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { newId } from "@/lib/ids";
import { DEFAULT_PAGE_SIZE, type EditionDoc, type HeaderSlot, type PageDoc, type Row, type SlotConfig } from "@/lib/types";

const editionsCol = () => collection(db, "editions");
const pagesCol = (editionId: string) => collection(db, "editions", editionId, "pages");

const emptySlot = (templateId: string, enabled = true): SlotConfig => ({
  templateId, color: "#111111", fields: {}, enabled,
});

export const blankPage = (index: number): Omit<PageDoc, "id"> => ({
  index, rows: [], lockedBy: null, lockedAt: null,
});

export async function createEdition(uid: string, title: string, date: string): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(editionsCol(), {
    title, date, pageCount: 8, createdBy: uid, createdAt: now, updatedAt: now,
    pageSizeMm: DEFAULT_PAGE_SIZE,
    slots: {
      header: emptySlot("janshakti"),
      header2: emptySlot("strip", false),
      subheader: { ...emptySlot("date-strip", true), color: "#0b4a8f" },
      footer: emptySlot("simple"),
    },
  } satisfies Omit<EditionDoc, "id">);
  const batch = writeBatch(db);
  for (let i = 0; i < 8; i++) {
    const page = i === 1 || i === 6
      ? {
          ...blankPage(i),
          rows: [{ id: newId(), cols: [{ id: newId(), span: 12, blocks: [{ id: newId(), type: "ad" as const, heightMm: 430 }] }] }],
        }
      : blankPage(i);
    batch.set(doc(pagesCol(ref.id), newId()), page);
  }
  await batch.commit();
  return ref.id;
}

export async function getEdition(id: string): Promise<EditionDoc | null> {
  const snap = await getDoc(doc(editionsCol(), id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as EditionDoc) : null;
}

/** Live list for the Saved Epapers screen. Returns an unsubscribe. */
export function subscribeEditions(cb: (list: EditionDoc[]) => void) {
  return onSnapshot(query(editionsCol(), orderBy("updatedAt", "desc")), (s) =>
    cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as EditionDoc)),
  );
}

/** Live single edition doc, so slot edits reflect back into the picker. */
export function subscribeEdition(id: string, cb: (e: EditionDoc | null) => void) {
  return onSnapshot(doc(editionsCol(), id), (s) =>
    cb(s.exists() ? ({ id: s.id, ...s.data() }) as EditionDoc : null),
  );
}

export function subscribePages(editionId: string, cb: (pages: PageDoc[]) => void) {
  return onSnapshot(query(pagesCol(editionId), orderBy("index")), (s) =>
    cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as PageDoc)),
  );
}

export async function listPages(editionId: string): Promise<PageDoc[]> {
  const s = await getDocs(query(pagesCol(editionId), orderBy("index")));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }) as PageDoc);
}

export const touchEdition = (id: string) =>
  updateDoc(doc(editionsCol(), id), { updatedAt: Date.now() });

export async function updateEdition(id: string, patch: Partial<EditionDoc>) {
  await updateDoc(doc(editionsCol(), id), { ...patch, updatedAt: Date.now() });
}

export async function setSlot(id: string, slot: HeaderSlot, config: SlotConfig) {
  await updateDoc(doc(editionsCol(), id), { [`slots.${slot}`]: config, updatedAt: Date.now() });
}

export async function saveRows(editionId: string, pageId: string, rows: Row[]) {
  await updateDoc(doc(pagesCol(editionId), pageId), { rows });
  await touchEdition(editionId);
}

export async function addPage(editionId: string, index: number) {
  await setDoc(doc(pagesCol(editionId), newId()), blankPage(index));
  await updateDoc(doc(editionsCol(), editionId), { pageCount: index + 1, updatedAt: Date.now() });
}

/** Deletes the page and renumbers the rest so `index` stays a dense 0..n-1. */
export async function deletePage(editionId: string, pageId: string) {
  const pages = (await listPages(editionId)).filter((p) => p.id !== pageId);
  const batch = writeBatch(db);
  batch.delete(doc(pagesCol(editionId), pageId));
  pages.forEach((p, i) => batch.update(doc(pagesCol(editionId), p.id), { index: i }));
  batch.update(doc(editionsCol(), editionId), { pageCount: pages.length, updatedAt: Date.now() });
  await batch.commit();
}

export async function deleteEdition(id: string) {
  const pages = await listPages(id);
  const batch = writeBatch(db);
  pages.forEach((p) => batch.delete(doc(pagesCol(id), p.id)));
  batch.delete(doc(editionsCol(), id));
  await batch.commit();
}

export async function duplicateEdition(uid: string, src: EditionDoc): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(editionsCol(), {
    ...src, id: undefined, title: `${src.title} (कॉपी)`,
    createdBy: uid, createdAt: now, updatedAt: now,
  } as unknown as Omit<EditionDoc, "id">);
  const pages = await listPages(src.id);
  const batch = writeBatch(db);
  pages.forEach((p) =>
    batch.set(doc(pagesCol(ref.id), newId()), { ...blankPage(p.index), rows: p.rows }),
  );
  await batch.commit();
  return ref.id;
}
