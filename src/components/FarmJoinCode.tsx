"use client";

import { useState } from "react";
import { Check, Copy, Users } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { format } from "@/i18n";

export function FarmJoinCode({ farmName, joinCode }: { farmName: string; joinCode: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard permission denied — the code is still visible to read aloud */
    }
  }

  return (
    <div className="h-fit max-w-sm flex-1 rounded-2xl border border-accent-200 bg-white p-6">
      <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        <Users size={15} /> {format(t.settings.joinCodeTitle, { farm: farmName })}
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        {t.settings.joinCodeDescription}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-accent-200 bg-accent-25 px-3 py-2 text-center font-mono text-lg font-semibold tracking-widest text-neutral-900">
          {joinCode}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          title={t.settings.copyJoinCode}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-200 text-neutral-500 hover:bg-accent-25"
        >
          {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
