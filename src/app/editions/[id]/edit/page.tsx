"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthGate from "@/components/AuthGate";
import PageCanvas from "@/components/PageCanvas";
import RowGrid from "@/components/RowGrid";
import ArticlePanel from "@/components/editor/ArticlePanel";
import FontPanel from "@/components/editor/FontPanel";
import LockBanner from "@/components/editor/LockBanner";
import PagesPanel from "@/components/editor/PagesPanel";
import SlotPicker from "@/components/headers/SlotPicker";
import { addPage, deletePage, saveRows, subscribeEdition, subscribePages } from "@/lib/edition";
import { acquire, release, HEARTBEAT_MS } from "@/lib/lock";
import { useUser } from "@/lib/auth";
import type { EditionDoc, PageDoc, Row } from "@/lib/types";

const RETRY_MS = 15 * 1000;

type Tab = "article" | "header" | "layout" | "font" | "pages";
const TABS: { id: Tab; label: string }[] = [
  { id: "article", label: "आर्टिकल" },
  { id: "header", label: "हेडर/फुटर" },
  { id: "layout", label: "लेआउट" },
  { id: "font", label: "फ़ॉन्ट" },
  { id: "pages", label: "पेज" },
];

export default function EditPage() {
  const params = useParams<{ id: string }>();
  const editionId = params.id;
  const { user } = useUser();

  const [edition, setEdition] = useState<EditionDoc | null>(null);
  const [pages, setPages] = useState<PageDoc[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [exporting, setExporting] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const initializedPageId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ pageId: string; rows: Row[] } | null>(null);
  const lockTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Live, not one-shot: SlotPicker writes slots straight to Firestore, so the
    // local copy has to follow or selections never appear to take.
    return subscribeEdition(editionId, setEdition);
  }, [editionId]);

  useEffect(() => {
    return subscribePages(editionId, (list) => {
      setPages(list);
      setActivePageId((cur) => cur ?? list[0]?.id ?? null);
    });
  }, [editionId]);

  // Load the active page's rows into local editing state once, on switch.
  useEffect(() => {
    if (!activePageId || initializedPageId.current === activePageId) return;
    // A debounced save for the page being left behind must land before we
    // overwrite local state with the new page's (possibly stale) snapshot —
    // otherwise the next edit on the new page re-saves over the old page's
    // still-pending edit forever.
    const pending = pendingRef.current;
    if (pending && pending.pageId !== activePageId) {
      void flushSave();
    }
    const p = pages.find((pg) => pg.id === activePageId);
    if (p) {
      setRows(p.rows);
      initializedPageId.current = activePageId;
      setSelectedBlockId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId, pages]);

  // Acquire the lock on entry/page switch, heartbeat while held & visible, retry while blocked.
  // ponytail: one interval covers both heartbeat and retry (15s tick, well under the 30s/2min
  // staleness thresholds) instead of two separate timers.
  const readOnlyRef = useRef(false);
  useEffect(() => {
    if (!activePageId || !user) return;
    let cancelled = false;
    const uid = user.uid;
    const pageId = activePageId;
    readOnlyRef.current = false;

    const tick = async () => {
      if (cancelled) return;
      if (readOnlyRef.current === false && document.visibilityState !== "visible") return;
      const ok = await acquire(editionId, pageId, uid);
      if (cancelled) return;
      readOnlyRef.current = !ok;
      setReadOnly(!ok);
    };
    tick();
    lockTimer.current = setInterval(tick, RETRY_MS);

    const releaseNow = () => {
      void release(editionId, pageId, uid);
    };
    window.addEventListener("beforeunload", releaseNow);
    window.addEventListener("pagehide", releaseNow);

    return () => {
      cancelled = true;
      if (lockTimer.current) clearInterval(lockTimer.current);
      window.removeEventListener("beforeunload", releaseNow);
      window.removeEventListener("pagehide", releaseNow);
      releaseNow();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId, user, editionId]);

  // Writes any debounced edit right now. The print route reads Firestore
  // server-side, so anything still sitting in the 800ms window would export stale.
  // Returns whether the save (or no-op) succeeded, so callers that need to know
  // (Save button, PDF export) can react instead of it vanishing silently.
  const flushSave = async (): Promise<boolean> => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const p = pendingRef.current;
    if (!p) return true;
    setSaveState("saving");
    try {
      await saveRows(editionId, p.pageId, p.rows);
      pendingRef.current = null;
      setSaveState("saved");
      return true;
    } catch (err) {
      // Keep pendingRef populated (do NOT null it here) so the next edit or a
      // Save-button press retries this payload instead of dropping it.
      console.error("Save failed:", err);
      setSaveState("error");
      return false;
    }
  };

  // Best-effort: an async write in beforeunload/pagehide isn't guaranteed to
  // finish before the tab closes, but it beats discarding the edit outright.
  useEffect(() => {
    const flushNow = () => {
      if (pendingRef.current) void flushSave();
    };
    window.addEventListener("beforeunload", flushNow);
    window.addEventListener("pagehide", flushNow);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      window.removeEventListener("beforeunload", flushNow);
      window.removeEventListener("pagehide", flushNow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRowsChange = (next: Row[]) => {
    if (readOnly) {
      console.warn("onRowsChange ignored: page is locked read-only");
      return;
    }
    setRows(next);
    const pageId = activePageId;
    if (!pageId) return;
    setSaveState("saving");
    pendingRef.current = { pageId, rows: next };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void flushSave();
    }, 800);
  };

  const exportPdf = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [token, saved] = await Promise.all([user.getIdToken(), flushSave()]);
      if (!saved) throw new Error("pending save failed before PDF export");
      window.open(`/print/${editionId}?token=${token}`, "_blank");
    } catch (err) {
      console.error("PDF preview error:", err);
      alert("PDF पूर्वावलोकन खोलने में विफल।");
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async () => {
    if (readOnly || !activePageId) return;
    // Nothing debounced (e.g. no edits since the last autosave)? Force-write
    // the current rows anyway so the button always does a real save on demand.
    if (!pendingRef.current) {
      pendingRef.current = { pageId: activePageId, rows };
    }
    await flushSave();
  };

  const lockHolder = readOnly
    ? (pages.find((p) => p.id === activePageId)?.lockedBy ?? null)
    : null;

  const handleAddPage = () => addPage(editionId, pages.length);
  const handleDeletePage = async (pageId: string) => {
    await deletePage(editionId, pageId);
    if (activePageId === pageId) {
      initializedPageId.current = null;
      setActivePageId(null);
    }
  };

  const renderTabContent = (tab: Tab) => {
    if (!edition) return null;
    switch (tab) {
      case "article":
        return edition ? (
          <ArticlePanel
            rows={rows}
            onRowsChange={onRowsChange}
            selectedBlockId={selectedBlockId}
            editionId={editionId}
            pageWmm={edition.pageSizeMm.w}
          />
        ) : null;
      case "header":
        return <SlotPicker editionId={editionId} edition={edition} />;
      case "layout":
        return <RowGrid rows={rows} onRowsChange={onRowsChange} readOnly={readOnly} />;
      case "font":
        return <FontPanel rows={rows} onRowsChange={onRowsChange} selectedBlockId={selectedBlockId} />;
      case "pages":
        return activePageId ? (
          <PagesPanel
            pages={pages}
            activePageId={activePageId}
            onSelect={setActivePageId}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
          />
        ) : null;
    }
  };

  return (
    <AuthGate>
      <div className="flex h-dvh flex-col">
        <header className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-3">
            <Link href="/editions" className="text-sm text-gray-500">
              ← वापस
            </Link>
            <h1 className="text-sm font-semibold">{edition?.title ?? "..."}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${saveState === "error" ? "text-red-600" : "text-gray-400"}`}>
              {saveState === "saving"
                ? "सहेज रहे हैं…"
                : saveState === "saved"
                  ? "सहेजा गया"
                  : saveState === "error"
                    ? "सहेजने में विफल"
                    : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={readOnly || !activePageId || saveState === "saving"}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 disabled:opacity-50"
            >
              {saveState === "saving" ? "..." : "सहेजें"}
            </button>
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              {exporting ? "..." : "PDF"}
            </button>
          </div>
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          {/* Desktop left rail: persistent Article panel */}
          <div className="hidden md:absolute md:left-0 md:top-0 md:flex md:h-full md:w-72 md:flex-col md:overflow-y-auto md:border-r md:bg-white">
            {edition && (
              <ArticlePanel
                rows={rows}
                onRowsChange={onRowsChange}
                selectedBlockId={selectedBlockId}
                editionId={editionId}
                pageWmm={edition.pageSizeMm.w}
              />
            )}
          </div>

          <div className="flex flex-1 flex-col md:ml-72 md:mr-80">
            {/* Never gate on lockHolder: a not-yet-refreshed pages list would hide the
                banner and leave the editor silently read-only. */}
            {readOnly && <LockBanner holderUid={lockHolder} />}
            {edition && (
              <PageCanvas
                rows={rows}
                editionId={editionId}
                onRowsChange={onRowsChange}
                pageSizeMm={edition.pageSizeMm}
                slots={edition.slots}
                pageIndex={pages.find((p) => p.id === activePageId)?.index ?? 0}
                pageCount={pages.length}
                readOnly={readOnly}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
              />
            )}
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:absolute md:right-0 md:top-0 md:flex md:h-full md:w-80 md:flex-col md:border-l md:bg-white">
            <div className="flex border-b">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-2 text-xs ${
                    (activeTab ?? "layout") === t.id ? "border-b-2 border-black font-semibold" : "text-gray-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">{renderTabContent(activeTab ?? "layout")}</div>
          </div>
        </div>

        {/* Mobile bottom sheet + tab bar */}
        <div className="md:hidden">
          {activeTab && (
            <div className="max-h-[60vh] overflow-y-auto border-t bg-white">{renderTabContent(activeTab)}</div>
          )}
          <div className="flex border-t bg-white">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab((cur) => (cur === t.id ? null : t.id))}
                className={`flex-1 py-2 text-xs ${activeTab === t.id ? "font-semibold text-black" : "text-gray-500"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
