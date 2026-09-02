import { notFound } from "next/navigation";
import SlotRender from "@/components/headers/SlotRender";
import { loadForPrint, verifyToken } from "@/lib/admin";
import type { PageDoc } from "@/lib/types";
import RowView from "@/components/RowView";
import AutoPrint from "@/components/AutoPrint";

// Fully server-rendered: no hydration race for headless Chromium to lose.
export const dynamic = "force-dynamic";

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!(await verifyToken(token))) {
    // Do not reveal whether the edition exists to an unauthenticated caller.
    notFound();
  }

  const data = await loadForPrint(id);
  if (!data) notFound();
  const { edition, pages } = data;
  const { w, h } = edition.pageSizeMm;

  return (
    <>
      {/* preferCSSPageSize in the render service reads this. */}
      <style>{`
        @page { size: ${w}mm ${h}mm; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff; }
        .print-sheet { break-after: page; page-break-after: always; }
        .print-sheet:last-child { break-after: auto; page-break-after: auto; }
      `}</style>
      <div data-page-w={w} data-page-h={h} id="print-root">
        {pages.map((page: PageDoc) => (
          <div
            key={page.id}
            className="page-sheet print-sheet"
            style={{ "--page-w": `${w}mm`, "--page-h": `${h}mm` } as React.CSSProperties}
          >
            {page.index === 0 && <SlotRender slot="header" config={edition.slots.header} />}
            {page.index === 0 && <SlotRender slot="header2" config={edition.slots.header2} />}
            {page.rows.map((row) => (
              <RowView key={row.id} row={row} editionId={edition.id} pageWmm={w} />
            ))}
          </div>
        ))}
      </div>
      <AutoPrint />
    </>
  );
}
