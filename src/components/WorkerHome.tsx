"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, Keyboard, ClipboardList, LogOut, ExternalLink, ChevronDown } from "lucide-react";
import { WorkerVoicePanel } from "@/components/WorkerVoicePanel";
import { WorkerTypePanel } from "@/components/WorkerTypePanel";
import { ExtractedLogPanel } from "@/components/ExtractedLogPanel";
import { LanguageToggle } from "@/components/LanguageToggle";
import { logout } from "@/lib/auth-actions";
import { useI18n } from "@/i18n/I18nProvider";
import { format, tr } from "@/i18n";
import { localeFor } from "@/i18n/config";
import type { LogWithRelations } from "@/lib/types";
import { FARM_TIME_ZONE, farmDayKey } from "@/lib/date-utils";

const TABS = [
  { id: "voice", icon: Mic },
  { id: "type", icon: Keyboard },
  { id: "logs", icon: ClipboardList },
] as const;

type TabId = (typeof TABS)[number]["id"];

// The farm's day, not the device's: a worker whose phone is on the wrong
// timezone should still see today's work under Today.
function isToday(date: Date) {
  return farmDayKey(date) === farmDayKey(new Date());
}

function LogsTimeline({ logs }: { logs: LogWithRelations[] }) {
  const { lang, t } = useI18n();
  const w = t.worker;
  const [scope, setScope] = useState<"today" | "all">("today");
  const [openId, setOpenId] = useState<number | null>(null);
  const dateFormatter = new Intl.DateTimeFormat(localeFor(lang), {
    timeZone: FARM_TIME_ZONE, month: "short", day: "numeric" });

  const todayLogs = logs.filter((l) => isToday(new Date(l.date)));
  const shown = scope === "today" ? todayLogs : logs;

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-accent-200 pb-2">
        {(
          [
            ["today", format(w.today, { count: todayLogs.length })],
            ["all", format(w.allHistory, { count: logs.length })],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setScope(id)}
            className={`pb-1 text-sm font-medium transition-colors ${
              scope === id
                ? "border-b-2 border-accent text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          {scope === "today" ? w.emptyToday : w.emptyAll}
        </p>
      ) : (
        // Timeline rather than a stack of cards: a worker's day reads as a
        // sequence, and the rule makes the order explicit at a glance.
        <ol className="relative mt-4 space-y-4 border-l border-accent-200 pl-5">
          {shown.map((log) => (
            <li key={log.id} className="relative">
              <span className="absolute top-2 -left-[25px] h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-white" />
              <div className="rounded-2xl border border-accent-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-neutral-900">
                      {tr(t.vocab.activities, log.activity)}
                    </div>
                    <div className="mt-0.5 text-sm text-neutral-500">
                      {tr(t.vocab.fields, log.field)} · {log.startTime} ·{" "}
                      {dateFormatter.format(new Date(log.date))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === log.id ? null : log.id)}
                    className="flex items-center gap-1 rounded-full border border-accent-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25"
                  >
                    {openId === log.id ? w.hide : w.whatWasRecorded}
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${openId === log.id ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {openId === log.id && (
                  <div className="mt-3">
                    <ExtractedLogPanel log={log} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function WorkerHome({
  userName,
  farmName,
  logs,
}: {
  userName: string;
  farmName: string | null;
  logs: LogWithRelations[];
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("voice");
  const router = useRouter();

  // A submitted log should be visible immediately, so jump to Logs and
  // re-fetch — the page's data was loaded before the log existed.
  function handleSaved() {
    router.refresh();
    setTab("logs");
  }

  return (
    <div className="min-h-screen bg-accent-25">
      <header className="border-b border-accent-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900">Toph</div>
            <div className="truncate text-xs text-neutral-500">
              {userName}
              {farmName && ` · ${farmName}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href="/"
              aria-label={t.worker.productSite}
              className="flex items-center gap-1.5 rounded-full border border-accent-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">{t.worker.productSite}</span>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                aria-label={t.worker.logOut}
                className="flex items-center gap-1.5 rounded-full border border-accent-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">{t.worker.logOut}</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        {/* Tabs sit at the top, not in a bottom bar — this is one screen
            with three ways in, and keeping them here leaves the thumb
            zone free for the big record button. */}
        <div className="flex gap-1 rounded-full border border-accent-200 bg-white p-1">
          {TABS.map((tabDef) => {
            const Icon = tabDef.icon;
            const active = tab === tabDef.id;
            return (
              <button
                key={tabDef.id}
                type="button"
                onClick={() => setTab(tabDef.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent text-white" : "text-neutral-600 hover:bg-accent-25"
                }`}
              >
                <Icon size={15} />
                {t.worker[tabDef.id]}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-3xl border border-accent-200 bg-white p-5">
          {tab === "voice" && <WorkerVoicePanel userName={userName} onSaved={handleSaved} />}
          {tab === "type" && <WorkerTypePanel userName={userName} onSaved={handleSaved} />}
          {tab === "logs" && <LogsTimeline logs={logs} />}
        </div>
      </main>
    </div>
  );
}
