import { StatCards } from "@/components/StatCards";
import { LogsTable } from "@/components/LogsTable";
import type { LogWithRelations, TagOption } from "@/lib/types";

export function DashboardBody({
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
  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          An overview of your farm and employee activity
        </p>
      </div>

      <div className="mt-6">
        <StatCards {...stats} />
      </div>

      <div className="mt-6">
        <LogsTable logs={logs} allTags={allTags} defaultDateRange="month" />
      </div>
    </div>
  );
}
