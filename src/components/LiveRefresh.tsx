"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";

// Polls the server for fresh data on an interval by re-running this route's
// server component, so a log a worker records elsewhere shows up here
// without anyone touching refresh. A few seconds of lag is invisible to a
// human watching a live demo, and polling is far less to get wrong under a
// deadline than standing up a websocket/SSE channel for one dashboard.
export function LiveRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      {t.dashboard.live}
    </span>
  );
}
