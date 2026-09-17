"use client";

import { useTransition } from "react";
import { LANGS } from "@/i18n/config";
import { setLanguage } from "@/i18n/actions";
import { useI18n } from "@/i18n/I18nProvider";

// "marketing" sits on the dark soil nav, "app" follows the dashboard's
// theme tokens (so it inverts correctly in dark mode), "plain" is for
// white screens like login and the worker app.
const TONES = {
  marketing: {
    group: "border-wheat/20",
    active: "bg-wheat text-soil",
    idle: "text-wheat/60 hover:text-wheat",
  },
  app: {
    group: "border-accent-200",
    active: "bg-surface text-accent-50",
    idle: "text-surface/60 hover:text-surface",
  },
  plain: {
    group: "border-neutral-300",
    active: "bg-neutral-900 text-white",
    idle: "text-neutral-500 hover:text-neutral-900",
  },
} as const;

export function LanguageToggle({ tone = "plain" }: { tone?: keyof typeof TONES }) {
  const { lang, t } = useI18n();
  const [pending, startTransition] = useTransition();
  const styles = TONES[tone];

  return (
    <div
      role="group"
      aria-label={t.langToggle.label}
      className={`flex shrink-0 rounded-full border p-0.5 ${styles.group} ${pending ? "opacity-60" : ""}`}
    >
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          disabled={pending || lang === code}
          onClick={() => startTransition(() => setLanguage(code))}
          className={`rounded-full px-2 py-0.5 font-eyebrow text-[10px] tracking-widest uppercase transition-colors ${
            lang === code ? styles.active : styles.idle
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
