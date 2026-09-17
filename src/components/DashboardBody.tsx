import { StatCards } from "@/components/StatCards";
import { LogsTable } from "@/components/LogsTable";
import { LiveRefresh } from "@/components/LiveRefresh";
import { getI18n } from "@/i18n/server";
import type { LogWithRelations, TagOption } from "@/lib/types";

export async function DashboardBody({
  logs,
  allTags,
  stats,
}: {
  logs: LogWithRelations[];
  allTags: TagOption[];
  stats: {
    todaysRecordings: number;
    newToday: number;
    activeWorkers: number;
    responseAccuracy: number;
  };
}) {
  const { t } = await getI18n();

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface">{t.dashboard.title}</h1>
          <p className="text-sm text-surface/60">{t.dashboard.subtitle}</p>
        </div>
        <LiveRefresh />
      </div>

      <div className="mt-6">
        <StatCards {...stats} />
      </div>

      <div className="mt-6">
        <LogsTable
          logs={logs}
          allTags={allTags}
          defaultDateRange="month"
          title={t.logs.defaultTitle}
        />
      </div>
    </div>
  );
}
