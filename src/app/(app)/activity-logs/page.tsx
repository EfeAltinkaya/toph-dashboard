import { prisma } from "@/lib/prisma";
import { getI18n } from "@/i18n/server";
import { LogsTable } from "@/components/LogsTable";

export const dynamic = "force-dynamic";

export default async function ActivityLogsPage() {
  const { t } = await getI18n();
  const [logs, tags] = await Promise.all([
    prisma.employeeLog.findMany({
      include: { employee: true, tags: true },
      orderBy: { date: "desc" },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.pages.activityLogs.title}</h1>
        <p className="text-sm text-surface/60">{t.pages.activityLogs.subtitle}</p>
      </div>

      <div className="mt-6">
        <LogsTable
          logs={logs}
          allTags={tags}
          defaultDateRange="all"
          title={t.pages.activityLogs.tableTitle}
        />
      </div>
    </div>
  );
}
