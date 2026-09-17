"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const THEMES = [
  { id: "default", label: "Default", swatch: "#171717" },
  { id: "blue", label: "Blue", swatch: "#2563eb" },
  { id: "red", label: "Red", swatch: "#dc2626" },
  { id: "green", label: "Green", swatch: "#16a34a" },
];

function applyTheme(id: string) {
  if (id === "default") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", id);
  }
  try {
    localStorage.setItem("toph-theme", id);
  } catch {
    /* private browsing etc. — theme just won't persist, not fatal */
  }
}

export function ThemeSwitcher() {
  // Always starts at "default" so the server-rendered HTML and the client's
  // first render match exactly (the server has no access to localStorage
  // and would otherwise have to guess). The real saved value is applied
  // right after mount instead, which avoids a hydration mismatch at the
  // cost of a single, effectively invisible frame.
  const [active, setActive] = useState("default");

  useEffect(() => {
    // Deliberate: this is the standard, React-docs-endorsed pattern for
    // syncing state from a browser-only API (localStorage) after mount,
    // to avoid a server/client hydration mismatch. There's no external
    // subscription to attach here — reading storage is a one-shot sync.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(localStorage.getItem("toph-theme") || "default");
    } catch {
      /* private browsing / storage disabled — stay on "default" */
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => {
            applyTheme(theme.id);
            setActive(theme.id);
          }}
          title={theme.label}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300"
          style={{ backgroundColor: theme.swatch }}
        >
          {active === theme.id && <Check size={14} className="text-white" />}
        </button>
      ))}
    </div>
  );
}
