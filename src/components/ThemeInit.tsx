"use client";

import { useLayoutEffect } from "react";

// Applies a returning visitor's saved theme before the browser paints.
// `useLayoutEffect` runs synchronously after DOM mutations but before paint,
// which is the standard React-safe alternative to an injected <script> tag
// (Next 16's `next/script` with `beforeInteractive` + dangerouslySetInnerHTML
// triggers a "script tag in a React tree" dev warning and doesn't reliably
// run, so this avoids that entirely rather than fighting it).
export function ThemeInit() {
  useLayoutEffect(() => {
    try {
      const theme = localStorage.getItem("toph-theme");
      if (theme && theme !== "default") {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch {
      /* private browsing / storage disabled — just keep the default theme */
    }
  }, []);

  return null;
}
