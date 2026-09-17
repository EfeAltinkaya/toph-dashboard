"use client";

import { useState } from "react";
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
  // Lazy init reads the already-applied attribute (set by the no-flash
  // script in the root layout) rather than defaulting to "default" and
  // flickering once useEffect catches up.
  const [active, setActive] = useState(
    () =>
      (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme")) ||
      "default"
  );

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
