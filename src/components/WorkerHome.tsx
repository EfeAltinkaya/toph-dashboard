"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, Keyboard, ClipboardList, LogOut, ExternalLink, ChevronDown } from "lucide-react";
import { WorkerVoicePanel } from "@/components/WorkerVoicePanel";
import { WorkerTypePanel } from "@/components/WorkerTypePanel";
import { ExtractedLogPanel } from "@/components/ExtractedLogPanel";
import { logout } from "@/lib/auth-actions";
import type { LogWithRelations } from "@/lib/types";

const TABS = [
  { id: "voice", label: "Voice", icon: Mic },
  { id: "type", label: "Type", icon: Keyboard },
  { id: "logs", label: "Logs", icon: ClipboardList },
] as const;

type TabId = (typeof TABS)[number]["id"];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function LogsTimeline({ logs }: { logs: LogWithRelations[] }) {
  const [scope, setScope] = useState<"today" | "all">("today");
  const [openId, setOpenId] = useState<number | null>(null);

  const todayLogs = logs.filter((l) => isToday(new Date(l.date)));
  const shown = scope === "today" ? todayLogs : logs;

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-accent-200 pb-2">
        {(
          [
            ["today", `Today (${todayLogs.length})`],
            ["all", `All history (${logs.length})`],
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
          {scope === "today"
            ? "Nothing logged today yet. Switch to Voice and say what you're working on."
            : "No logs yet."}
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
                    <div className="font-semibold text-neutral-900">{log.activity}</div>
                    <div className="mt-0.5 text-sm text-neutral-500">
                      {log.field} · {log.startTime} · {dateFormatter.format(new Date(log.date))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === log.id ? null : log.id)}
                    className="flex items-center gap-1 rounded-full border border-accent-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25"
                  >
                    {openId === log.id ? "Hide" : "What was recorded"}
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
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <div>
            <div className="font-semibold text-neutral-900">Toph</div>
            <div className="text-xs text-neutral-500">
              {userName}
              {farmName && ` · ${farmName}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-accent-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25"
            >
              <ExternalLink size={13} /> Product site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-accent-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-accent-25"
              >
                <LogOut size={13} /> Log out
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
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-white"
                    : "text-neutral-600 hover:bg-accent-25"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-3xl border border-accent-200 bg-white p-5">
          {tab === "voice" && (
            <WorkerVoicePanel userName={userName} onSaved={handleSaved} />
          )}
          {tab === "type" && (
            <WorkerTypePanel userName={userName} onSaved={handleSaved} />
          )}
          {tab === "logs" && <LogsTimeline logs={logs} />}
        </div>
      </main>
    </div>
  );
}
