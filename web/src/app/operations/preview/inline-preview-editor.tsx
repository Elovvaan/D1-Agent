"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { savePreviewPageProfile } from "./actions";

type Props = {
  pageKey: string;
  safePath: string;
  back: string;
  status?: string;
};

const editableSelector = [
  "[data-myd1-edit-key]",
  "h1",
  "h2",
  "h3",
  "p",
  "a",
  "button",
  "span",
  "div"
].join(",");

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function keyFromElement(element: Element, index: number) {
  const directKey = element.getAttribute("data-myd1-edit-key");
  if (directKey) return directKey;
  const text = cleanText(element.textContent || "").slice(0, 64).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `inline-${index}-${text || element.tagName.toLowerCase()}`;
}

export function InlinePreviewEditor({ pageKey, safePath, back, status }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editsJson, setEditsJson] = useState("{}");
  const [message, setMessage] = useState("Hover text in the preview. Click to edit it directly.");

  function wireFrame() {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;
    const style = doc.createElement("style");
    style.textContent = `
      [data-myd1-preview-editable="true"] { cursor: text !important; transition: outline .12s ease, box-shadow .12s ease; }
      [data-myd1-preview-editable="true"]:hover { outline: 2px solid #F2C200 !important; outline-offset: 4px !important; box-shadow: 0 0 0 9999px rgba(242,194,0,.035) !important; }
      [data-myd1-preview-editable="true"][contenteditable="true"] { outline: 3px solid #8CFF00 !important; outline-offset: 4px !important; background: rgba(0,0,0,.18) !important; }
    `;
    doc.head.appendChild(style);

    const candidates = Array.from(doc.querySelectorAll(editableSelector))
      .filter((element) => {
        const text = cleanText(element.textContent || "");
        const children = Array.from(element.children).filter((child) => cleanText(child.textContent || ""));
        if (!text || text.length < 2 || text.length > 120) return false;
        if (children.length > 2 && !element.hasAttribute("data-myd1-edit-key")) return false;
        return true;
      });

    candidates.forEach((element, index) => {
      const key = keyFromElement(element, index);
      element.setAttribute("data-myd1-preview-editable", "true");
      element.setAttribute("data-myd1-preview-key", key);
      element.setAttribute("data-myd1-preview-original", cleanText(element.textContent || ""));
      element.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement;
        target.setAttribute("contenteditable", "true");
        target.focus();
        setMessage(`Editing: ${target.getAttribute("data-myd1-preview-original") || target.tagName}`);
      });
      element.addEventListener("blur", () => collectEdits(), true);
      element.addEventListener("input", () => collectEdits());
    });
    collectEdits();
  }

  function collectEdits() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const edits: Record<string, { original: string; value: string }> = {};
    Array.from(doc.querySelectorAll("[data-myd1-preview-key]")).forEach((element) => {
      const key = element.getAttribute("data-myd1-preview-key") || "";
      const original = element.getAttribute("data-myd1-preview-original") || "";
      const value = cleanText(element.textContent || "");
      if (key && value && value !== original) edits[key] = { original, value };
    });
    setEditsJson(JSON.stringify(edits));
  }

  return (
    <main className="min-h-screen bg-[#061331] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071634] px-4 py-3">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Backend preview</p>
            <h1 className="text-xl font-black">Public view inside Operations</h1>
            <p className="mt-1 text-xs font-semibold text-[#CAD7FF]">{status ? "Preview edits saved." : message}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={savePreviewPageProfile} onSubmit={collectEdits}>
              <input type="hidden" name="pageKey" value={pageKey} />
              <input type="hidden" name="previewPath" value={safePath} />
              <input type="hidden" name="back" value={back} />
              <input type="hidden" name="inlineEdits" value={editsJson} />
              <button className="inline-flex items-center gap-2 rounded-2xl bg-[#8CFF00] px-4 py-2 text-sm font-black text-[#061331]" type="submit"><Save size={16} /> Save inline edits</button>
            </form>
            <Link href={back} className="rounded-2xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#061331]">Back to editor</Link>
            <Link href={safePath} target="_blank" className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-black text-white">Open new tab</Link>
          </div>
        </div>
      </header>
      <iframe ref={iframeRef} title="Public page preview" src={safePath} onLoad={wireFrame} className="h-[calc(100vh-73px)] w-full border-0 bg-white" />
    </main>
  );
}
