"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const THEMES = [
  { id: "default", swatch: "#ffffff", dark: false },
  { id: "dark", swatch: "#171717", dark: true },
  { id: "slate", swatch: "#4c6b8a", dark: true },
  { id: "sage", swatch: "#6b8f71", dark: true },
  { id: "terracotta", swatch: "#b0654a", dark: true },
  { id: "plum", swatch: "#7d6088", dark: true },
  { id: "ochre", swatch: "#b8935a", dark: true },
] as const;

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
  const { t } = useI18n();
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
          title={t.themes[theme.id]}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300"
          style={{ backgroundColor: theme.swatch }}
        >
          {active === theme.id && (
            <Check size={14} className={theme.dark ? "text-white" : "text-neutral-900"} />
          )}
        </button>
      ))}
    </div>
  );
}
