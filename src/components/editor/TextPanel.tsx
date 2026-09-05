"use client";
import { useEffect, useState } from "react";

type Props = { disabled?: boolean };

type Cmd =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "justifyFull";

const STATE_CMDS: Cmd[] = [
  "bold", "italic", "underline",
  "insertUnorderedList", "insertOrderedList",
  "justifyLeft", "justifyCenter", "justifyRight", "justifyFull",
];

function queryState(cmd: string): boolean {
  try {
    return document.queryCommandState(cmd);
  } catch {
    return false;
  }
}

// Hoisted: declaring this inside TextPanel would give it a fresh identity on
// every selectionchange, remounting each button mid-selection.
function Btn({
  onRun,
  active,
  disabled,
  children,
}: {
  onRun: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      // Without this the mousedown collapses the selection and the command no-ops.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onRun}
      className={`rounded px-2 py-1 text-xs ${
        active ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-200"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

/** फॉर्मेटिंग टूलबार — चयनित कॉन्टेंटएडिटेबल क्षेत्र पर काम करता है। */
export default function TextPanel({ disabled }: Props) {
  const [active, setActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof document === "undefined") return;
    const refresh = () => {
      const next: Record<string, boolean> = {};
      for (const cmd of STATE_CMDS) next[cmd] = queryState(cmd);
      setActive(next);
    };
    refresh();
    document.addEventListener("selectionchange", refresh);
    return () => document.removeEventListener("selectionchange", refresh);
  }, []);

  // ponytail: execCommand is deprecated but universally supported and zero-dep; swap for a real editor only if this stops working.
  function run(cmd: string, value?: string) {
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(cmd, false, value);
    const next: Record<string, boolean> = {};
    for (const c of STATE_CMDS) next[c] = queryState(c);
    setActive(next);
  }

  const btn = (cmd: Cmd, label: string) => (
    <Btn key={cmd} onRun={() => run(cmd)} active={active[cmd]} disabled={disabled}>
      {label}
    </Btn>
  );

  return (
    <div className="space-y-3 p-3">
      <div>
        <label className="text-sm font-semibold">फॉर्मेट</label>
        <div className="mt-1 flex flex-wrap gap-1">
          {btn("bold", "बोल्ड (B)")}
          {btn("italic", "इटैलिक (I)")}
          {btn("underline", "अंडरलाइन (U)")}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold">सूची</label>
        <div className="mt-1 flex flex-wrap gap-1">
          {btn("insertUnorderedList", "बुलेट सूची (•)")}
          {btn("insertOrderedList", "क्रमांकित सूची (1.)")}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold">संरेखण</label>
        <div className="mt-1 flex flex-wrap gap-1">
          {btn("justifyLeft", "बाएँ")}
          {btn("justifyCenter", "मध्य")}
          {btn("justifyRight", "दाएँ")}
          {btn("justifyFull", "जस्टिफ़ाई")}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-2">
        <button
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => run("removeFormat")}
          className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-40"
        >
          सादा करें
        </button>
      </div>
    </div>
  );
}
