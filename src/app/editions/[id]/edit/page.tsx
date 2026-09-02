"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthGate from "@/components/AuthGate";
import PageCanvas from "@/components/PageCanvas";
import RowGrid from "@/components/RowGrid";
import FontPanel from "@/components/editor/FontPanel";
import LockBanner from "@/components/editor/LockBanner";
import PagesPanel from "@/components/editor/PagesPanel";
import SlotPicker from "@/components/headers/SlotPicker";
import { addPage, deletePage, saveRows, subscribeEdition, subscribePages } from "@/lib/edition";
import { acquire, release, HEARTBEAT_MS } from "@/lib/lock";
import { useUser } from "@/lib/auth";
import type { EditionDoc, PageDoc, Row } from "@/lib/types";

const RETRY_MS = 15 * 1000;

type Tab = "header" | "layout" | "font" | "pages";
const TABS: { id: Tab; label: string }[] = [
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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [exporting, setExporting] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const initializedPageId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const p = pages.find((pg) => pg.id === activePageId);
    if (p) {
      setRows(p.rows);
      initializedPageId.current = activePageId;
      setSelectedBlockId(null);
    }
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

  // A pending autosave must not fire into an unmounted editor.
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    []
  );

  const onRowsChange = (next: Row[]) => {
    if (readOnly) return;
    setRows(next);
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const pageId = activePageId;
    saveTimer.current = setTimeout(async () => {
      if (!pageId) return;
      await saveRows(editionId, pageId, next);
      setSaveState("saved");
    }, 800);
  };

  const exportPdf = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const token = await user.getIdToken();
      window.open(`/print/${editionId}?token=${token}`, "_blank");
    } catch (err) {
      console.error("PDF preview error:", err);
      alert("PDF पूर्वावलोकन खोलने में विफल।");
    } finally {
      setExporting(false);
    }
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
            <span className="text-xs text-gray-400">
              {saveState === "saving" ? "सहेज रहे हैं…" : saveState === "saved" ? "सहेजा गया" : ""}
            </span>
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
          <div className="flex flex-1 flex-col md:mr-80">
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
