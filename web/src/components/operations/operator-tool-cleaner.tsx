"use client";

import { useEffect } from "react";

export function OperatorToolCleaner() {
  useEffect(() => {
    const keep = new Set(["/operations/games"]);
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("aside a"));
    for (const link of links) {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("/operations") && !keep.has(href)) {
        link.remove();
      }
    }
  }, []);

  return null;
}
